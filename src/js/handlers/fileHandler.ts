import { state } from '../state.js';
import {
  showLoader,
  hideLoader,
  showAlert,
  renderPageThumbnails,
  renderFileDisplay,
  switchView,
} from '../ui.js';
import { formatIsoDate, readFileAsArrayBuffer, getPDFDocument } from '../utils/helpers.js';
import { setupCanvasEditor } from '../canvasEditor.js';
import { toolLogic } from '../logic/index.js';
import { renderDuplicateOrganizeThumbnails } from '../logic/duplicate-organize.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { icons, createIcons } from 'lucide';
import Sortable from 'sortablejs';
import {
  multiFileTools,
  simpleTools,
  singlePdfLoadTools,
} from '../config/pdf-tools.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

// Re-export rotation state utilities
export { getRotationState, updateRotationState, resetRotationState, initializeRotationState } from '../utils/rotation-state.js';

const rotationState: number[] = [];
let imageSortableInstance: Sortable | null = null;
const activeImageUrls = new Map<File, string>();


async function handleSinglePdfUpload(toolId, file) {
  showLoader('Loading PDF...');
  try {
    // For form-filler, bypass pdf-lib (can't handle XFA) and use PDF.js
    if (toolId === 'form-filler') {
      hideLoader();

      const optionsDiv = document.getElementById('form-filler-options');
      if (optionsDiv) optionsDiv.classList.remove('hidden');

      const processBtn = document.getElementById('process-btn');
      if (processBtn) {
        const logic = toolLogic[toolId];
        if (logic && logic.process) {
          processBtn.onclick = logic.process;
        }
      }

      const logic = toolLogic[toolId];
      if (logic && logic.setup) {
        await logic.setup();
      }
      return;
    }

    const pdfBytes = await readFileAsArrayBuffer(file);
    state.pdfDoc = await PDFLibDocument.load(pdfBytes as ArrayBuffer, {
      ignoreEncryption: true,
    });
    hideLoader();

    if (
      state.pdfDoc.isEncrypted &&
      toolId !== 'decrypt' &&
      toolId !== 'change-permissions' &&
      toolId !== 'remove-restrictions'
    ) {
      showAlert(
        'Protected PDF',
        'This PDF is password-protected. Please use the Decrypt or Change Permissions tool first.'
      );
      switchView('grid');
      return;
    }

    const optionsDiv = document.querySelector(
      '[id$="-options"], [id$="-preview"], [id$="-organizer"], [id$="-rotator"], [id$="-editor"]'
    );
    if (optionsDiv) optionsDiv.classList.remove('hidden');

    const processBtn = document.getElementById('process-btn');
    if (processBtn) {
      (processBtn as HTMLButtonElement).disabled = false;
      processBtn.classList.remove('hidden');
      const logic = toolLogic[toolId];
      if (logic) {
        const func =
          typeof logic.process === 'function' ? logic.process : logic;
        processBtn.onclick = func;
      }
    }

    if (
      [
        'split',
        'delete-pages',
        'add-blank-page',
        'extract-pages',
        'add-header-footer',
      ].includes(toolId)
    ) {
      document.getElementById('total-pages').textContent = state.pdfDoc
        .getPageCount()
        .toString();
    }

    if (toolId === 'organize' || toolId === 'rotate' || toolId === 'delete-pages') {
      await renderPageThumbnails(toolId, state.pdfDoc);

      if (toolId === 'rotate') {
        // Initialize rotation state for all pages
        rotationState.length = 0;
        for (let i = 0; i < state.pdfDoc.getPageCount(); i++) {
          rotationState.push(0);
        }

        const rotateAllControls = document.getElementById(
          'rotate-all-controls'
        );
        const rotateAllLeftBtn = document.getElementById('rotate-all-left-btn');
        const rotateAllRightBtn = document.getElementById(
          'rotate-all-right-btn'
        );
        const rotateAllCustomBtn = document.getElementById('rotate-all-custom-btn');
        const rotateAllCustomInput = document.getElementById('custom-rotate-all-input') as HTMLInputElement;
        const rotateAllDecrementBtn = document.getElementById('rotate-all-decrement-btn');
        const rotateAllIncrementBtn = document.getElementById('rotate-all-increment-btn');


        rotateAllControls.classList.remove('hidden');
        createIcons({ icons });

        const rotateAll = (angle: number) => {
          // Update rotation state for ALL pages (including unrendered ones)
          for (let i = 0; i < rotationState.length; i++) {
            rotationState[i] = (rotationState[i] + angle);
          }

          // Update DOM for currently rendered pages
          document.querySelectorAll('.page-rotator-item').forEach((item) => {
            const pageIndex = parseInt((item as HTMLElement).dataset.pageIndex || '0');
            const newRotation = rotationState[pageIndex];
            (item as HTMLElement).dataset.rotation = newRotation.toString();

            const thumbnail = item.querySelector('canvas, img');
            if (thumbnail) {
              (thumbnail as HTMLElement).style.transform =
                `rotate(${newRotation}deg)`;
            }

            const input = item.querySelector('input');
            if (input) {
              input.value = newRotation.toString();
            }
          });
        };
        rotateAllLeftBtn.onclick = () => rotateAll(-90);
        rotateAllRightBtn.onclick = () => rotateAll(90);

        if (rotateAllCustomBtn && rotateAllCustomInput) {
          rotateAllCustomBtn.onclick = () => {
            const angle = parseInt(rotateAllCustomInput.value);
            if (!isNaN(angle) && angle !== 0) {
              rotateAll(angle);
            }
          };

          if (rotateAllDecrementBtn) {
            rotateAllDecrementBtn.onclick = () => {
              const current = parseInt(rotateAllCustomInput.value) || 0;
              rotateAllCustomInput.value = (current - 1).toString();
            };
          }

          if (rotateAllIncrementBtn) {
            rotateAllIncrementBtn.onclick = () => {
              const current = parseInt(rotateAllCustomInput.value) || 0;
              rotateAllCustomInput.value = (current + 1).toString();
            };
          }
        }
      }
    }

    if (toolId === 'duplicate-organize') {
      await renderDuplicateOrganizeThumbnails();
    }
    if (['crop', 'redact'].includes(toolId)) {
      await setupCanvasEditor(toolId);
    }

    if (toolId === 'view-metadata') {
      const resultsDiv = document.getElementById('metadata-results');
      showLoader('Analyzing full PDF metadata...');

      try {
        const pdfBytes = await readFileAsArrayBuffer(state.files[0]);
        const pdfjsDoc = await getPDFDocument({
          data: pdfBytes as ArrayBuffer,
        }).promise;
        const [metadataResult, fieldObjects] = await Promise.all([
          pdfjsDoc.getMetadata(),
          pdfjsDoc.getFieldObjects(),
        ]);

        const { info, metadata } = metadataResult;
        const rawXmpString = metadata ? metadata.getRaw() : null;

        resultsDiv.textContent = ''; // Clear safely

        const createSection = (title) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'mb-4';
          const h3 = document.createElement('h3');
          h3.className = 'text-lg font-semibold text-white mb-2';
          h3.textContent = title;
          const ul = document.createElement('ul');
          ul.className =
            'space-y-3 text-sm bg-gray-900 p-4 rounded-lg border border-gray-700';
          wrapper.append(h3, ul);
          return { wrapper, ul };
        };

        const createListItem = (key, value) => {
          const li = document.createElement('li');
          li.className = 'flex flex-col sm:flex-row';
          const strong = document.createElement('strong');
          strong.className = 'w-40 flex-shrink-0 text-gray-400';
          strong.textContent = key;
          const div = document.createElement('div');
          div.className = 'flex-grow text-white break-all';
          div.textContent = value;
          li.append(strong, div);
          return li;
        };

        const parsePdfDate = (pdfDate) => {
          if (
            !pdfDate ||
            typeof pdfDate !== 'string' ||
            !pdfDate.startsWith('D:')
          )
            return pdfDate;
          try {
            const year = pdfDate.substring(2, 6);
            const month = pdfDate.substring(6, 8);
            const day = pdfDate.substring(8, 10);
            const hour = pdfDate.substring(10, 12);
            const minute = pdfDate.substring(12, 14);
            const second = pdfDate.substring(14, 16);
            return new Date(
              `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
            ).toLocaleString();
          } catch {
            return pdfDate;
          }
        };

        const infoSection = createSection('Info Dictionary');
        if (info && Object.keys(info).length > 0) {
          for (const key in info) {
            const value = info[key];
            let displayValue;

            if (value === null || typeof value === 'undefined') {
              displayValue = '- Not Set -';
            } else if (typeof value === 'object' && value.name) {
              displayValue = value.name;
            } else if (typeof value === 'object') {
              try {
                displayValue = JSON.stringify(value);
              } catch {
                displayValue = '[object Object]';
              }
            } else if (
              (key === 'CreationDate' || key === 'ModDate') &&
              typeof value === 'string'
            ) {
              displayValue = parsePdfDate(value);
            } else {
              displayValue = String(value);
            }

            infoSection.ul.appendChild(createListItem(key, displayValue));
          }
        } else {
          infoSection.ul.innerHTML = `<li><span class="text-gray-500 italic">- No Info Dictionary data found -</span></li>`;
        }
        resultsDiv.appendChild(infoSection.wrapper);

        const fieldsSection = createSection('Interactive Form Fields');
        if (fieldObjects && Object.keys(fieldObjects).length > 0) {
          for (const fieldName in fieldObjects) {
            const field = fieldObjects[fieldName][0];
            const value = (field as any).fieldValue || '- Not Set -';
            fieldsSection.ul.appendChild(
              createListItem(fieldName, String(value))
            );
          }
        } else {
          fieldsSection.ul.innerHTML = `<li><span class="text-gray-500 italic">- No interactive form fields found -</span></li>`;
        }
        resultsDiv.appendChild(fieldsSection.wrapper);

        const createXmpListItem = (key, value, indent = 0) => {
          const li = document.createElement('li');
          li.className = 'flex flex-col sm:flex-row';

          const strong = document.createElement('strong');
          strong.className = 'w-56 flex-shrink-0 text-gray-400';
          strong.textContent = key;
          strong.style.paddingLeft = `${indent * 1.2}rem`;

          const div = document.createElement('div');
          div.className = 'flex-grow text-white break-all';
          div.textContent = value;

          li.append(strong, div);
          return li;
        };

        const createXmpHeaderItem = (key, indent = 0) => {
          const li = document.createElement('li');
          li.className = 'flex pt-2';
          const strong = document.createElement('strong');
          strong.className = 'w-full flex-shrink-0 text-gray-300 font-medium';
          strong.textContent = key;
          strong.style.paddingLeft = `${indent * 1.2}rem`;
          li.append(strong);
          return li;
        };

        const appendXmpNodes = (xmlNode, ulElement, indentLevel) => {
          const xmpDateKeys = [
            'xap:CreateDate',
            'xap:ModifyDate',
            'xap:MetadataDate',
          ];

          const childNodes = Array.from(xmlNode.children);

          for (const child of childNodes) {
            if ((child as Element).nodeType !== 1) continue;

            let key = (child as Element).tagName;
            const elementChildren = Array.from(
              (child as Element).children
            ).filter((c) => c.nodeType === 1);

            if (key === 'rdf:li') {
              appendXmpNodes(child, ulElement, indentLevel);
              continue;
            }
            if (key === 'rdf:Alt') {
              key = '(alt container)';
            }

            if (
              (child as Element).getAttribute('rdf:parseType') === 'Resource' &&
              elementChildren.length === 0
            ) {
              ulElement.appendChild(
                createXmpListItem(key, '(Empty Resource)', indentLevel)
              );
              continue;
            }

            if (elementChildren.length > 0) {
              ulElement.appendChild(createXmpHeaderItem(key, indentLevel));
              appendXmpNodes(child, ulElement, indentLevel + 1);
            } else {
              let value = (child as Element).textContent.trim();
              if (value) {
                if (xmpDateKeys.includes(key)) {
                  value = formatIsoDate(value);
                }
                ulElement.appendChild(
                  createXmpListItem(key, value, indentLevel)
                );
              }
            }
          }
        };

        const xmpSection = createSection('XMP Metadata');
        if (rawXmpString) {
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(
              rawXmpString,
              'application/xml'
            );

            const descriptions = xmlDoc.getElementsByTagName('rdf:Description');
            if (descriptions.length > 0) {
              for (const desc of descriptions) {
                appendXmpNodes(desc, xmpSection.ul, 0);
              }
            } else {
              appendXmpNodes(xmlDoc.documentElement, xmpSection.ul, 0);
            }

            if (xmpSection.ul.children.length === 0) {
              xmpSection.ul.innerHTML = `<li><span class="text-gray-500 italic">- No parseable XMP properties found -</span></li>`;
            }
          } catch (xmlError) {
            console.error('Failed to parse XMP XML:', xmlError);
            xmpSection.ul.innerHTML = `<li><span class="text-red-500 italic">- Error parsing XMP XML. Displaying raw. -</span></li>`;
            const pre = document.createElement('pre');
            pre.className =
              'text-xs text-gray-300 whitespace-pre-wrap break-all';
            pre.textContent = rawXmpString;
            xmpSection.ul.appendChild(pre);
          }
        } else {
          xmpSection.ul.innerHTML = `<li><span class="text-gray-500 italic">- No XMP metadata found -</span></li>`;
        }
        resultsDiv.appendChild(xmpSection.wrapper);

        resultsDiv.classList.remove('hidden');
      } catch (e) {
        console.error('Failed to view metadata or fields:', e);
        showAlert(
          'Error',
          'Could not fully analyze the PDF. It may be corrupted or have an unusual structure.'
        );
      } finally {
        hideLoader();
      }
    }

    if (toolId === 'edit-metadata') {
      const form = document.getElementById('metadata-form');
      const container = document.getElementById('custom-metadata-container');
      const addBtn = document.getElementById('add-custom-meta-btn');

      const formatDateForInput = (date) => {
        if (!date) return '';
        const pad = (num) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      };

      (document.getElementById('meta-title') as HTMLInputElement).value =
        state.pdfDoc.getTitle() || '';
      (document.getElementById('meta-author') as HTMLInputElement).value =
        state.pdfDoc.getAuthor() || '';
      (document.getElementById('meta-subject') as HTMLInputElement).value =
        state.pdfDoc.getSubject() || '';
      (document.getElementById('meta-keywords') as HTMLInputElement).value =
        state.pdfDoc.getKeywords() || '';
      (document.getElementById('meta-creator') as HTMLInputElement).value =
        state.pdfDoc.getCreator() || '';
      (document.getElementById('meta-producer') as HTMLInputElement).value =
        state.pdfDoc.getProducer() || '';
      (
        document.getElementById('meta-creation-date') as HTMLInputElement
      ).value = formatDateForInput(state.pdfDoc.getCreationDate());
      (document.getElementById('meta-mod-date') as HTMLInputElement).value =
        formatDateForInput(state.pdfDoc.getModificationDate());

      addBtn.onclick = () => {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'flex flex-col sm:flex-row items-stretch sm:items-center gap-2 custom-field-wrapper';

        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.placeholder = 'Key (e.g., Department)';
        keyInput.className =
          'custom-meta-key w-full sm:w-1/3 bg-gray-800 border border-gray-600 text-white rounded-lg p-2';

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.placeholder = 'Value (e.g., Marketing)';
        valueInput.className =
          'custom-meta-value w-full sm:flex-grow bg-gray-800 border border-gray-600 text-white rounded-lg p-2';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className =
          'btn p-2 text-red-500 hover:bg-gray-700 rounded-full self-center sm:self-auto';
        removeBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        removeBtn.addEventListener('click', () => fieldWrapper.remove());

        fieldWrapper.append(keyInput, valueInput, removeBtn);
        container.appendChild(fieldWrapper);
        createIcons({ icons });
      };

      form.classList.remove('hidden');
      createIcons({ icons });
    }

    if (toolId === 'cropper') {
      document
        .getElementById('cropper-ui-container')
        .classList.remove('hidden');
    }

    if (toolId === 'page-dimensions') {
      toolLogic['page-dimensions']();
    }

    // Setup quality sliders for image conversion tools
    if (toolId === 'pdf-to-jpg') {
      const qualitySlider = document.getElementById('jpg-quality') as HTMLInputElement;
      const qualityValue = document.getElementById('jpg-quality-value');
      if (qualitySlider && qualityValue) {
        const updateValue = () => {
          qualityValue.textContent = `${Math.round(parseFloat(qualitySlider.value) * 100)}%`;
        };
        qualitySlider.addEventListener('input', updateValue);
        updateValue();
      }
    }

    if (toolId === 'pdf-to-png') {
      const qualitySlider = document.getElementById('png-quality') as HTMLInputElement;
      const qualityValue = document.getElementById('png-quality-value');
      if (qualitySlider && qualityValue) {
        const updateValue = () => {
          qualityValue.textContent = `${qualitySlider.value}x`;
        };
        qualitySlider.addEventListener('input', updateValue);
        updateValue();
      }
    }

    if (toolId === 'pdf-to-webp') {
      const qualitySlider = document.getElementById('webp-quality') as HTMLInputElement;
      const qualityValue = document.getElementById('webp-quality-value');
      if (qualitySlider && qualityValue) {
        const updateValue = () => {
          qualityValue.textContent = `${Math.round(parseFloat(qualitySlider.value) * 100)}%`;
        };
        qualitySlider.addEventListener('input', updateValue);
        updateValue();
      }
    }

    if (toolLogic[toolId] && typeof toolLogic[toolId].setup === 'function') {
      toolLogic[toolId].setup();
    }
  } catch (e) {
    hideLoader();
    showAlert(
      'Error',
      'Could not load PDF. The file may be invalid, corrupted, or password-protected.'
    );
    console.error(e);
  }
}

async function handleMultiFileUpload(toolId) {
  if (
    toolId === 'merge' ||
    toolId === 'alternate-merge' ||
    toolId === 'reverse-pages'
  ) {
    showLoader('Loading PDF documents...');

    const pdfFilesUnloaded: File[] = [];

    state.files.forEach((file) => {
      if (file.type === 'application/pdf') {
        pdfFilesUnloaded.push(file);
      }
    });

    const pdfFilesLoaded = await Promise.all(
      pdfFilesUnloaded.map(async (file) => {
        const pdfBytes = await readFileAsArrayBuffer(file);
        const pdfDoc = await PDFLibDocument.load(pdfBytes as ArrayBuffer, {
          ignoreEncryption: true,
        });

        return {
          file,
          pdfDoc,
        };
      })
    );

    const foundEncryptedPDFs = pdfFilesLoaded.filter(
      (pdf) => pdf.pdfDoc.isEncrypted
    );

    if (foundEncryptedPDFs.length > 0) {
      const encryptedPDFFileNames = [];
      foundEncryptedPDFs.forEach((encryptedPDF) => {
        encryptedPDFFileNames.push(encryptedPDF.file.name);
      });

      const errorMessage = `PDFs found that are password-protected\n\nPlease use the Decrypt or Change Permissions tool on these files first:\n\n${encryptedPDFFileNames.join('\n')}`;

      hideLoader(); // Hide loader before showing alert
      showAlert('Protected PDFs', errorMessage);

      switchView('grid');

      return;
    }
  }

  const processBtn = document.getElementById('process-btn');
  if (processBtn) {
    (processBtn as HTMLButtonElement).disabled = false;
    const logic = toolLogic[toolId];
    if (logic) {
      const func = typeof logic.process === 'function' ? logic.process : logic;
      processBtn.onclick = func;
    }
  }

  // if (toolId === 'merge') {
  //   toolLogic.merge.setup();
  // }

  if (toolId === 'alternate-merge') {
    toolLogic['alternate-merge'].setup();
  } else if (toolId === 'image-to-pdf') {
    const imageList = document.getElementById('image-list');

    const renderedFiles = new Set(
      Array.from(imageList.querySelectorAll('li')).map(li => li.dataset.fileName)
    );

    state.files.forEach((file) => {
      if (!file) {
        console.error('Invalid file encountered in state.files');
        return;
      }

      if (renderedFiles.has(file.name)) {
        return;
      }

      let url = activeImageUrls.get(file);
      if (!url) {
        url = URL.createObjectURL(file);
        activeImageUrls.set(file, url);
      }

      const li = document.createElement('li');
      li.className = 'relative group cursor-move';
      li.dataset.fileName = file.name;

      const wrapper = document.createElement('div');
      wrapper.className = 'w-full h-36 sm:h-40 md:h-44 bg-gray-900 rounded-md border-2 border-gray-600 flex items-center justify-center overflow-hidden';

      const img = document.createElement('img');
      img.src = url;
      img.className = 'max-w-full max-h-full object-contain';

      const p = document.createElement('p');
      p.className =
        'absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center truncate p-1';
      p.textContent = file.name;

      wrapper.appendChild(img);
      li.append(wrapper, p);
      imageList.appendChild(li);
    });

    const syncStateWithDOM = () => {
      const domOrder = Array.from(imageList.querySelectorAll('li')).map(li => li.dataset.fileName);
      state.files.sort((a, b) => {
        const aIndex = domOrder.indexOf(a.name);
        const bIndex = domOrder.indexOf(b.name);
        return aIndex - bIndex;
      });
    };

    if (!imageSortableInstance) {
      imageSortableInstance = Sortable.create(imageList, {
        animation: 150,
        onEnd: () => {
          syncStateWithDOM();
        }
      });
    }

    syncStateWithDOM();

    const opts = document.getElementById('image-to-pdf-options');
    if (opts && opts.classList.contains('hidden')) {
      opts.classList.remove('hidden');
      const slider = document.getElementById('image-pdf-quality') as HTMLInputElement;
      const value = document.getElementById('image-pdf-quality-value');
      if (slider && value) {
        const update = () => (value.textContent = `${Math.round(parseFloat(slider.value) * 100)}%`);
        slider.addEventListener('input', update);
        update();
      }
    }
  }

  if (toolId === 'pdf-to-jpg') {
    const qualitySlider = document.getElementById('jpg-quality') as HTMLInputElement;
    const qualityValue = document.getElementById('jpg-quality-value');
    if (qualitySlider && qualityValue) {
      const updateValue = () => {
        qualityValue.textContent = `${Math.round(parseFloat(qualitySlider.value) * 100)}%`;
      };
      qualitySlider.addEventListener('input', updateValue);
      updateValue();
    }
  }

  if (toolId === 'pdf-to-png') {
    const qualitySlider = document.getElementById('png-quality') as HTMLInputElement;
    const qualityValue = document.getElementById('png-quality-value');
    if (qualitySlider && qualityValue) {
      const updateValue = () => {
        qualityValue.textContent = `${qualitySlider.value}x`;
      };
      qualitySlider.addEventListener('input', updateValue);
      updateValue();
    }
  }

  if (toolId === 'pdf-to-webp') {
    const qualitySlider = document.getElementById('webp-quality') as HTMLInputElement;
    const qualityValue = document.getElementById('webp-quality-value');
    if (qualitySlider && qualityValue) {
      const updateValue = () => {
        qualityValue.textContent = `${Math.round(parseFloat(qualitySlider.value) * 100)}%`;
      };
      qualitySlider.addEventListener('input', updateValue);
      updateValue();
    }
  }

  if (toolId === 'png-to-pdf') {
    const optionsDiv = document.getElementById(`${toolId}-options`);
    if (optionsDiv) {
      optionsDiv.classList.remove('hidden');
    }
  }
}

export function setupFileInputHandler(toolId) {
  const fileInput = document.getElementById('file-input');
  const isMultiFileTool = multiFileTools.includes(toolId);
  let isFirstUpload = true;

  const processFiles = async (newFiles) => {
    if (newFiles.length === 0) return;

    if (toolId === 'image-to-pdf') {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
      const validFiles = newFiles.filter(file => validTypes.includes(file.type));

      if (validFiles.length < newFiles.length) {
        showAlert('Invalid Files', 'Some files were skipped because they are not supported images.');
      }

      newFiles = validFiles;
      if (newFiles.length === 0) return;
    }

    if (!isMultiFileTool || isFirstUpload) {
      state.files = newFiles;
    } else {
      state.files = [...state.files, ...newFiles];
    }
    isFirstUpload = false;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) {
      renderFileDisplay(fileDisplayArea, state.files);
    }

    const fileControls = document.getElementById('file-controls');
    if (fileControls) {
      fileControls.classList.remove('hidden');
      createIcons({ icons });
    }

    if (isMultiFileTool) {
      if (toolId === 'txt-to-pdf' || toolId === 'compress' || toolId === 'extract-attachments' || toolId === 'flatten') {
        const processBtn = document.getElementById('process-btn');
        if (processBtn) {
          (processBtn as HTMLButtonElement).disabled = false;
          if (toolId === 'compress') {
            const optionsDiv = document.getElementById('compress-options');
            if (optionsDiv) optionsDiv.classList.remove('hidden');
          }
          processBtn.onclick = () => {
            const logic = toolLogic[toolId];
            if (logic) {
              const func =
                typeof logic.process === 'function' ? logic.process : logic;
              func();
            }
          };
        }
      } else {
        await handleMultiFileUpload(toolId);
      }
    } else if (singlePdfLoadTools.includes(toolId)) {
      await handleSinglePdfUpload(toolId, state.files[0]);
    } else if (simpleTools.includes(toolId)) {
      const optionsDivId =
        toolId === 'change-permissions'
          ? 'permissions-options'
          : `${toolId}-options`;
      const optionsDiv = document.getElementById(optionsDivId);
      if (optionsDiv) optionsDiv.classList.remove('hidden');
      const processBtn = document.getElementById('process-btn');
      if (processBtn) {
        (processBtn as HTMLButtonElement).disabled = false;
        processBtn.onclick = () => {
          const logic = toolLogic[toolId];
          if (logic) {
            const func =
              typeof logic.process === 'function' ? logic.process : logic;
            func();
          }
        };
      }
    }
  };

  fileInput.addEventListener('change', (e) =>
    processFiles(Array.from((e.target as HTMLInputElement).files || []))
  );

  const setupAddMoreButton = () => {
    const addMoreBtn = document.getElementById('add-more-btn');
    if (addMoreBtn) {
      addMoreBtn.addEventListener('click', () => fileInput.click());
    }
  };

  const setupClearButton = () => {
    const clearBtn = document.getElementById('clear-files-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        activeImageUrls.forEach(url => URL.revokeObjectURL(url));
        activeImageUrls.clear();

        state.files = [];
        isFirstUpload = true;
        (fileInput as HTMLInputElement).value = '';

        const fileDisplayArea = document.getElementById('file-display-area');
        if (fileDisplayArea) fileDisplayArea.textContent = '';

        const fileControls = document.getElementById('file-controls');
        if (fileControls) fileControls.classList.add('hidden');

        const toolSpecificUI = [
          'file-list',
          'page-merge-preview',
          'image-list',
          'alternate-file-list',
        ];
        toolSpecificUI.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.textContent = '';
        });

        const processBtn = document.getElementById('process-btn');
        if (processBtn) (processBtn as HTMLButtonElement).disabled = true;
      });
    }
  };

  setTimeout(() => {
    setupAddMoreButton();
    setupClearButton();
  }, 100);
}
