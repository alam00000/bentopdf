// Logic for PDF Editor Page
import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { formatBytes, downloadFile } from '../utils/helpers.js';
import { makeUniqueFileKey } from '../utils/deduplicate-filename.js';
import { batchDecryptIfNeeded } from '../utils/password-prompt.js';
import { getEditorDisabledCategories } from '../utils/disabled-tools.js';
import { editorFontFallback } from '../config/editor-fonts.js';
import { needsFontEmbedding } from '../utils/freetext-script.js';

const embedPdfWasmUrl = new URL(
  'bentopdf-pdfium/editcore.wasm',
  import.meta.url
).href;

import type { EmbedPdfContainer } from 'bentopdf-viewer';
import type {
  ActiveDocumentSource,
  AnnotationPluginLite,
  AppliedRedactionTracker,
  DocManagerPlugin,
  FreeTextSystemFontAnnotation,
  ViewerCommandsPlugin,
  RedactionPluginLite,
} from '@/types';

import { trText, onPageReady } from '../i18n/i18n.js';

const FREETEXT_SUBTYPE = 3;

export function trackAppliedRedactions(
  redaction: RedactionPluginLite
): AppliedRedactionTracker {
  const pendingByDoc = new Map<string, Map<string, string | undefined>>();
  const appliedByDoc = new Map<string, Map<string, string | undefined>>();
  const lastLeftPendingByDoc = new Map<string, string[]>();
  const getAppliedRedactions = (documentId: string) => {
    let applied = appliedByDoc.get(documentId);
    if (!applied) {
      applied = new Map();
      appliedByDoc.set(documentId, applied);
    }
    return applied;
  };

  redaction.onPendingChange(({ documentId, pending }) => {
    const previous = pendingByDoc.get(documentId) ?? new Map();
    const next = new Map<string, string | undefined>();
    for (const items of Object.values(pending)) {
      for (const item of items) {
        next.set(item.id, item.text ?? previous.get(item.id));
      }
    }
    const applied = getAppliedRedactions(documentId);
    const leftPending: string[] = [];
    for (const [id, text] of previous) {
      if (!next.has(id)) {
        applied.set(id, text);
        leftPending.push(id);
      }
    }
    for (const id of next.keys()) applied.delete(id);
    pendingByDoc.set(documentId, next);
    lastLeftPendingByDoc.set(documentId, leftPending);
  });

  redaction.onRedactionEvent((event) => {
    const applied = appliedByDoc.get(event.documentId);
    if (event.type === 'remove' && event.id) {
      applied?.delete(event.id);
    } else if (event.type === 'clear') {
      for (const id of lastLeftPendingByDoc.get(event.documentId) ?? []) {
        applied?.delete(id);
      }
    }
  });

  return {
    appliedTexts: (documentId) => [
      ...(appliedByDoc.get(documentId)?.values() ?? []),
    ],
    forget: (documentId) => {
      pendingByDoc.delete(documentId);
      appliedByDoc.delete(documentId);
      lastLeftPendingByDoc.delete(documentId);
    },
  };
}

export function redactionScrubTerms(
  texts: Iterable<string | undefined>
): string[] {
  const terms = new Map<string, string>();
  for (const text of texts) {
    for (const line of text?.split(/[\r\n]+/) ?? []) {
      const term = line.trim();
      const key = term.toLowerCase();
      if (term && !terms.has(key)) terms.set(key, term);
    }
  }
  return [...terms.values()].sort((a, b) => b.length - a.length);
}

export async function scrubRedactedText(
  bytes: Uint8Array,
  terms: string[]
): Promise<Uint8Array> {
  const { redactDocumentData } =
    await import('../utils/redact-document-data.js');
  return redactDocumentData(bytes, terms);
}

function confirmChoice(
  title: string,
  message: string,
  confirmLabel: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const previousActive = document.activeElement as HTMLElement | null;
    const overlay = document.createElement('div');
    overlay.className =
      'fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'edit-pdf-confirm-title');

    const panel = document.createElement('div');
    panel.className =
      'bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full border border-gray-700';

    const heading = document.createElement('h3');
    heading.id = 'edit-pdf-confirm-title';
    heading.className = 'text-xl font-bold text-white mb-2';
    heading.textContent = title;

    const body = document.createElement('p');
    body.className = 'text-gray-300 mb-6';
    body.textContent = message;

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className =
      'flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200';
    cancelBtn.textContent = trText('Cancel');

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className =
      'flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200';
    confirmBtn.textContent = confirmLabel;

    const actions = document.createElement('div');
    actions.className = 'flex gap-3';
    actions.append(cancelBtn, confirmBtn);
    panel.append(heading, body, actions);
    overlay.append(panel);

    const close = (result: boolean) => {
      overlay.remove();
      document.removeEventListener('keydown', onKeydown);
      previousActive?.focus();
      resolve(result);
    };
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };

    cancelBtn.addEventListener('click', () => close(false));
    confirmBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
    document.addEventListener('keydown', onKeydown);
    document.body.append(overlay);
    cancelBtn.focus();
  });
}

function collectAllFreeTexts(
  annotationPlugin: AnnotationPluginLite | null
): FreeTextSystemFontAnnotation[] {
  if (!annotationPlugin) return [];
  try {
    const state = annotationPlugin.getState();
    const out: FreeTextSystemFontAnnotation[] = [];
    for (const tracked of Object.values(state.byUid)) {
      const obj = tracked.object;
      if (obj.type !== FREETEXT_SUBTYPE) continue;
      if (obj.intent === 'FreeTextCallout') continue;
      if (!obj.id || obj.pageIndex == null || !obj.rect) continue;
      out.push({
        id: obj.id,
        pageIndex: obj.pageIndex,
        contents: obj.contents ?? '',
        fontSize: obj.fontSize ?? 12,
        fontColor: obj.fontColor ?? '#000000',
        textAlign: obj.textAlign ?? 0,
        verticalAlign: obj.verticalAlign ?? 0,
        opacity: obj.opacity ?? 1,
        backgroundColor: obj.color ?? obj.backgroundColor,
        rect: obj.rect,
        fontPostScriptName: obj.fontPostScriptName ?? '',
        rotation: obj.rotation ?? 0,
      });
    }
    return out;
  } catch {
    return [];
  }
}

let viewerInstance: EmbedPdfContainer | null = null;
let docManagerPlugin: DocManagerPlugin | null = null;
let isViewerInitialized = false;
let currentFileName = 'document.pdf';
const fileEntryMap = new Map<string, HTMLElement>();

function resetViewer() {
  const pdfWrapper = document.getElementById('embed-pdf-wrapper');
  const pdfContainer = document.getElementById('embed-pdf-container');
  const downloadBtn = document.getElementById('download-edited-pdf');
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (pdfContainer) pdfContainer.textContent = '';
  if (pdfWrapper) pdfWrapper.classList.add('hidden');
  if (downloadBtn) downloadBtn.classList.add('hidden');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';
  if (fileInput) fileInput.value = '';
  viewerInstance = null;
  docManagerPlugin = null;
  isViewerInitialized = false;
  fileEntryMap.clear();
}

function removeFileEntry(documentId: string) {
  const entry = fileEntryMap.get(documentId);
  if (entry) {
    entry.remove();
    fileEntryMap.delete(documentId);
  }
  if (fileEntryMap.size === 0) {
    resetViewer();
  }
}

onPageReady(initializePage);

function initializePage() {
  createIcons({ icons });

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-indigo-500');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-indigo-500');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-500');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    });

    fileInput?.addEventListener('click', () => {
      if (fileInput) fileInput.value = '';
    });
  }

  document.getElementById('back-to-tools')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

async function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    await handleFiles(input.files);
  }
}

async function handleFiles(files: FileList) {
  const pdfFiles = Array.from(files).filter(
    (f) => f.type === 'application/pdf'
  );
  if (pdfFiles.length === 0) {
    showAlert('Invalid File', 'Please upload a valid PDF file.');
    return;
  }

  showLoader('Loading PDF Editor...');

  try {
    const pdfWrapper = document.getElementById('embed-pdf-wrapper');
    const pdfContainer = document.getElementById('embed-pdf-container');
    const fileDisplayArea = document.getElementById('file-display-area');

    if (!pdfWrapper || !pdfContainer || !fileDisplayArea) return;

    hideLoader();
    const decryptedFiles = await batchDecryptIfNeeded(pdfFiles);
    showLoader('Loading PDF Editor...');

    if (decryptedFiles.length === 0) {
      hideLoader();
      return;
    }

    if (!isViewerInitialized) {
      const firstFile = decryptedFiles[0];
      currentFileName = firstFile.name;
      const firstBuffer = await firstFile.arrayBuffer();

      pdfContainer.textContent = '';
      pdfWrapper.classList.remove('hidden');

      const { default: EmbedPDF } = await import('bentopdf-viewer');
      viewerInstance = EmbedPDF.init({
        disabledCategories: getEditorDisabledCategories(),
        type: 'container',
        target: pdfContainer,
        worker: true,
        wasmUrl: embedPdfWasmUrl,
        fontFallback: editorFontFallback,
        export: {
          defaultFileName: firstFile.name,
        },
        documentManager: {
          maxDocuments: 10,
        },
        tabBar: 'always',
      });

      const registry = await viewerInstance.registry;
      docManagerPlugin = registry
        .getPlugin('document-manager')
        .provides() as unknown as DocManagerPlugin;
      const activeDocuments =
        docManagerPlugin as unknown as ActiveDocumentSource;

      let redactionPlugin: RedactionPluginLite | null = null;
      try {
        redactionPlugin = registry
          .getPlugin('redaction')
          .provides() as unknown as RedactionPluginLite;
      } catch {
        redactionPlugin = null;
      }
      const redactionTracker = redactionPlugin
        ? trackAppliedRedactions(redactionPlugin)
        : null;

      docManagerPlugin.onDocumentClosed((data: { id?: string }) => {
        const docId = data?.id || '';
        redactionTracker?.forget(docId);
        removeFileEntry(docId);
      });

      docManagerPlugin.onDocumentOpened(
        (data: { id?: string; name?: string }) => {
          const docId = data?.id;
          const docKey = data?.name;
          if (!docId) return;
          const pendingEntry = fileDisplayArea.querySelector(
            `[data-pending-name="${CSS.escape(docKey)}"]`
          ) as HTMLElement;
          if (pendingEntry) {
            pendingEntry.removeAttribute('data-pending-name');
            fileEntryMap.set(docId, pendingEntry);
            const removeBtn = pendingEntry.querySelector(
              '[data-remove-btn]'
            ) as HTMLElement;
            if (removeBtn) {
              removeBtn.onclick = () => {
                docManagerPlugin.closeDocument(docId);
              };
            }
          }
        }
      );

      addFileEntries(fileDisplayArea, decryptedFiles);

      docManagerPlugin.openDocumentBuffer({
        buffer: firstBuffer,
        name: makeUniqueFileKey(0, firstFile.name),
        autoActivate: true,
      });

      for (let i = 1; i < decryptedFiles.length; i++) {
        const buffer = await decryptedFiles[i].arrayBuffer();
        docManagerPlugin.openDocumentBuffer({
          buffer,
          name: makeUniqueFileKey(i, decryptedFiles[i].name),
          autoActivate: false,
        });
      }

      isViewerInitialized = true;

      let downloadBtn = document.getElementById('download-edited-pdf');
      if (!downloadBtn) {
        downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-edited-pdf';
        downloadBtn.className = 'btn-gradient w-full mt-6';
        downloadBtn.textContent = trText('Download Edited PDF');
        pdfWrapper.appendChild(downloadBtn);
      }
      downloadBtn.classList.remove('hidden');

      const downloadEditedPdf = async () => {
        try {
          const documentId = activeDocuments.getActiveDocumentId();
          const pendingCount = redactionPlugin?.getState().pendingCount ?? 0;
          if (redactionPlugin && pendingCount > 0) {
            const shouldApply = await confirmChoice(
              trText('Apply redactions?'),
              pendingCount === 1
                ? trText(
                    "This document has 1 redaction mark that hasn't been applied. Until a mark is applied, the content under it is still in the file. Apply all marks and download?"
                  )
                : trText(
                    "This document has {{count}} redaction marks that haven't been applied. Until a mark is applied, the content under it is still in the file. Apply all marks and download?",
                    { count: pendingCount }
                  ),
              trText('Apply and download')
            );
            if (!shouldApply) return;
            try {
              await redactionPlugin.commitAllPending().toPromise();
            } catch (err) {
              console.error('Applying redactions failed:', err);
            }
            if (redactionPlugin.getState().pendingCount > 0) {
              showAlert(
                'Redaction Failed',
                'Some redaction marks could not be applied, so the file was not downloaded. Apply or remove them in the editor and try again.'
              );
              return;
            }
          }
          const exportPlugin = registry.getPlugin('export').provides();
          const arrayBuffer = await exportPlugin.saveAsCopy().toPromise();
          let outBytes = new Uint8Array(arrayBuffer);
          let annotationPlugin: AnnotationPluginLite | null = null;
          try {
            annotationPlugin = registry
              .getPlugin('annotation')
              .provides() as unknown as AnnotationPluginLite;
          } catch {
            annotationPlugin = null;
          }
          const allFreeTexts = collectAllFreeTexts(annotationPlugin);
          let pending = allFreeTexts;
          if (pending.length > 0) {
            try {
              const { flattenFreeTextToPageText } =
                await import('../utils/freetext-flatten.js');
              const res = await flattenFreeTextToPageText(outBytes, pending);
              if (res.flattened > 0) {
                outBytes = res.bytes;
                pending = [];
              }
            } catch (err) {
              console.error('Flatten pass failed:', err);
            }
          }
          const customFontAnnots = pending.filter(
            (a) =>
              a.fontPostScriptName.trim() !== '' ||
              needsFontEmbedding(a.contents)
          );
          if (customFontAnnots.length > 0) {
            try {
              const { embedFreeTextSystemFonts } =
                await import('../utils/freetext-font-embed.js');
              outBytes = await embedFreeTextSystemFonts(
                outBytes,
                customFontAnnots
              );
            } catch (err) {
              console.error('Font embed pass failed:', err);
            }
          }
          const appliedTexts =
            documentId && redactionTracker
              ? redactionTracker.appliedTexts(documentId)
              : [];
          if (appliedTexts.length > 0) {
            const { PDFDocument } = await import('pdf-lib');
            const exported = await PDFDocument.load(outBytes, {
              ignoreEncryption: true,
              updateMetadata: false,
            });
            if (exported.isEncrypted) {
              const shouldDownload = await confirmChoice(
                trText('Encrypted file'),
                trText(
                  "Your redactions are applied to the pages, but this file is encrypted, so BentoPDF can't also remove copies of the redacted text from its properties, bookmarks, and attachments. For a full cleanup, redact an unencrypted copy and add a password afterwards with Protect PDF. Download anyway?"
                ),
                trText('Download anyway')
              );
              if (!shouldDownload) return;
            } else {
              showLoader('Removing redacted text from document data...');
              try {
                outBytes = await scrubRedactedText(
                  outBytes,
                  redactionScrubTerms(appliedTexts)
                );
              } catch (err) {
                console.error('Redaction cleanup failed:', err);
                showAlert(
                  'Error',
                  'Could not remove the redacted text from the document data, so the file was not downloaded.'
                );
                return;
              } finally {
                hideLoader();
              }
            }
          }
          const blob = new Blob([new Uint8Array(outBytes)], {
            type: 'application/pdf',
          });
          downloadFile(blob, currentFileName);
        } catch (err) {
          console.error('Error downloading PDF:', err);
          showAlert('Error', 'Failed to download the edited PDF.');
        }
      };
      downloadBtn.onclick = downloadEditedPdf;

      const commands = registry.getPlugin('commands')?.provides() as unknown as
        | ViewerCommandsPlugin
        | undefined;
      commands?.unregisterCommand('document:export');
      commands?.registerCommand({
        id: 'document:export',
        labelKey: 'document.export',
        icon: 'download',
        categories: ['document', 'document-export'],
        action: () => void downloadEditedPdf(),
      });

      const backBtn = document.getElementById('back-to-tools');
      if (backBtn) {
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode?.replaceChild(newBackBtn, backBtn);

        newBackBtn.addEventListener('click', () => {
          window.location.href = import.meta.env.BASE_URL;
        });
      }
    } else {
      addFileEntries(fileDisplayArea, decryptedFiles);

      for (let i = 0; i < decryptedFiles.length; i++) {
        const buffer = await decryptedFiles[i].arrayBuffer();
        docManagerPlugin.openDocumentBuffer({
          buffer,
          name: makeUniqueFileKey(i, decryptedFiles[i].name),
          autoActivate: true,
        });
      }
    }
  } catch (error) {
    console.error('Error loading PDF Editor:', error);
    showAlert('Error', 'Failed to load the PDF Editor.');
  } finally {
    hideLoader();
  }
}

function addFileEntries(fileDisplayArea: HTMLElement, files: File[]) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg';
    fileDiv.setAttribute('data-pending-name', makeUniqueFileKey(i, file.name));

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = formatBytes(file.size);

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.setAttribute('data-remove-btn', 'true');
    removeBtn.onclick = () => {
      fileDiv.remove();
      if (fileDisplayArea.children.length === 0) {
        resetViewer();
      }
    };

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
  }

  createIcons({ icons });
}
