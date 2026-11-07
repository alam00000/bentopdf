import { showLoader, hideLoader, showAlert } from '../ui.js';
import { t, trText, trHtml, onPageReady } from '../i18n/i18n';
import {
  downloadFile,
  escapeHtml,
  readFileAsArrayBuffer,
  formatBytes,
  getPDFDocument,
} from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { loadPyMuPDF } from '../utils/pymupdf-loader.js';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';

interface LayerData {
  number: number;
  xref: number;
  text: string;
  on: boolean;
  locked: boolean;
  depth: number;
  parentXref: number;
  displayOrder: number;
}

let currentFile: File | null = null;
interface PyMuPDFDocument {
  getLayerConfig: () => LayerData[];
  addLayer: (name: string) => { number: number; xref: number };
  setLayerConfig: (layers: LayerData[]) => void;
  setLayerVisibility: (xref: number, visible: boolean) => void;
  deleteOCG: (xref: number) => void;
  addOCGWithParent: (
    name: string,
    parentXref: number
  ) => { number: number; xref: number };
  addOCG: (name: string) => { number: number; xref: number };
  save: () => Uint8Array;
}

let currentDoc: PyMuPDFDocument | null = null;
const layersMap = new Map<number, LayerData>();
let nextDisplayOrder = 0;

onPageReady(() => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const processBtnContainer = document.getElementById('process-btn-container');
  const fileDisplayArea = document.getElementById('file-display-area');
  const layersContainer = document.getElementById('layers-container');
  const layersList = document.getElementById('layers-list');
  const backBtn = document.getElementById('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  const updateUI = async () => {
    if (!fileDisplayArea || !processBtnContainer || !processBtn) return;

    if (currentFile) {
      fileDisplayArea.innerHTML = '';
      const fileDiv = document.createElement('div');
      fileDiv.className =
        'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

      const infoContainer = document.createElement('div');
      infoContainer.className = 'flex flex-col overflow-hidden';

      const nameSpan = document.createElement('div');
      nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
      nameSpan.textContent = currentFile.name;

      const metaSpan = document.createElement('div');
      metaSpan.className = 'text-xs text-gray-400';
      metaSpan.textContent = trText('{{size}} • {{loadingPageCount}}', {
        size: formatBytes(currentFile.size),
        loadingPageCount: t('common.loadingPageCount'),
      });

      infoContainer.append(nameSpan, metaSpan);

      const removeBtn = document.createElement('button');
      removeBtn.className =
        'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
      removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
      removeBtn.onclick = () => {
        resetState();
      };

      fileDiv.append(infoContainer, removeBtn);
      fileDisplayArea.appendChild(fileDiv);

      try {
        const arrayBuffer = await readFileAsArrayBuffer(currentFile);
        const pdfDoc = await getPDFDocument({ data: arrayBuffer }).promise;
        metaSpan.textContent = trText("{{size}} • {{numPages}} صفحة", {
          size: formatBytes(currentFile.size),
          numPages: pdfDoc.numPages,
        });
      } catch (error) {
        console.error('Error loading PDF:', error);
        metaSpan.textContent = trText("{{size}} • تعذر تحميل عدد الصفحات", {
          size: formatBytes(currentFile.size),
        });
      }

      createIcons({ icons });
      processBtnContainer.classList.remove('hidden');
      (processBtn as HTMLButtonElement).disabled = false;
    } else {
      fileDisplayArea.innerHTML = '';
      processBtnContainer.classList.add('hidden');
      (processBtn as HTMLButtonElement).disabled = true;
    }
  };

  const resetState = () => {
    currentFile = null;
    currentDoc = null;
    layersMap.clear();
    nextDisplayOrder = 0;

    if (dropZone) dropZone.style.display = 'flex';
    if (layersContainer) layersContainer.classList.add('hidden');
    updateUI();
  };

  const promptForInput = (
    title: string,
    message: string,
    defaultValue: string = ''
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      const modal = document.getElementById('input-modal');
      const titleEl = document.getElementById('input-title');
      const messageEl = document.getElementById('input-message');
      const inputEl = document.getElementById(
        'input-value'
      ) as HTMLInputElement;
      const confirmBtn = document.getElementById('input-confirm');
      const cancelBtn = document.getElementById('input-cancel');

      if (
        !modal ||
        !titleEl ||
        !messageEl ||
        !inputEl ||
        !confirmBtn ||
        !cancelBtn
      ) {
        console.error('Input modal elements not found');
        resolve(null);
        return;
      }

      titleEl.textContent = title;
      messageEl.textContent = message;
      inputEl.value = defaultValue;

      const closeModal = () => {
        modal.classList.add('hidden');
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        inputEl.onkeydown = null;
      };

      const confirm = () => {
        const val = inputEl.value.trim();
        closeModal();
        resolve(val);
      };

      const cancel = () => {
        closeModal();
        resolve(null);
      };

      confirmBtn.onclick = confirm;
      cancelBtn.onclick = cancel;

      inputEl.onkeydown = (e) => {
        if (e.key === 'Enter') confirm();
        if (e.key === 'Escape') cancel();
      };

      modal.classList.remove('hidden');
      inputEl.focus();
    });
  };

  const renderLayers = () => {
    if (!layersList) return;

    const layersArray = Array.from(layersMap.values());

    if (layersArray.length === 0) {
      layersList.innerHTML = `
                <div class="layers-empty">
                    <p>${trHtml("لا يحتوي ملف PDF هذا على طبقات (OCG).")}</p>
                    <p>${trHtml("أضف طبقة جديدة للبدء!")}</p>
                </div>
            `;
      return;
    }

    // Sort layers by displayOrder
    const sortedLayers = layersArray.sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    layersList.innerHTML = sortedLayers
      .map(
        (layer: LayerData) => `
            <div class="layer-item" data-number="${layer.number}" style="padding-left: ${layer.depth * 24 + 8}px;">
                <label class="layer-toggle">
                    <input type="checkbox" ${layer.on ? 'checked' : ''} ${layer.locked ? 'disabled' : ''} data-xref="${layer.xref}" />
                    <span class="layer-name">${layer.depth > 0 ? '└ ' : ''}${escapeHtml(layer.text || trText("الطبقة {{number}}", { number: layer.number }))}</span>
                    ${layer.locked ? '<span class="layer-locked">🔒</span>' : ''}
                </label>
                <div class="layer-actions">
                    ${!layer.locked ? `<button class="layer-add-child" data-xref="${layer.xref}" title="${trHtml("إضافة طبقة فرعية")}">+</button>` : ''}
                    ${!layer.locked ? `<button class="layer-delete" data-xref="${layer.xref}" title="${trHtml("حذف الطبقة")}">✕</button>` : ''}
                </div>
            </div>
        `
      )
      .join('');

    // Attach toggle handlers
    layersList
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          const xref = parseInt(target.dataset.xref || '0');
          const isOn = target.checked;

          try {
            currentDoc.setLayerVisibility(xref, isOn);
            const layer = Array.from(layersMap.values()).find(
              (l) => l.xref === xref
            );
            if (layer) {
              layer.on = isOn;
            }
          } catch (err) {
            console.error('Failed to set layer visibility:', err);
            target.checked = !isOn;
            showAlert("خطأ", "تعذر تبديل ظهور الطبقة");
          }
        });
      });

    // Attach delete handlers
    layersList.querySelectorAll('.layer-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const xref = parseInt(target.dataset.xref || '0');
        const layer = Array.from(layersMap.values()).find(
          (l) => l.xref === xref
        );

        if (!layer) {
          showAlert("خطأ", "الطبقة غير موجودة");
          return;
        }

        try {
          currentDoc.deleteOCG(layer.number);
          layersMap.delete(layer.number);
          renderLayers();
        } catch (err) {
          console.error('Failed to delete layer:', err);
          showAlert("خطأ", "تعذر حذف الطبقة");
        }
      });
    });

    layersList.querySelectorAll('.layer-add-child').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const target = e.target as HTMLButtonElement;
        const parentXref = parseInt(target.dataset.xref || '0');
        const parentLayer = Array.from(layersMap.values()).find(
          (l) => l.xref === parentXref
        );

        const childName = await promptForInput(
          trText("إضافة طبقة فرعية"),
          trText("أدخل اسم الطبقة الفرعية تحت \"{{Layer}}\":", {
            Layer: parentLayer?.text || 'Layer',
          })
        );

        if (!childName || !childName.trim()) return;

        try {
          const childResult = currentDoc.addOCGWithParent(
            childName.trim(),
            parentXref
          );
          const parentDisplayOrder = parentLayer?.displayOrder || 0;
          layersMap.forEach((l) => {
            if (l.displayOrder > parentDisplayOrder) {
              l.displayOrder += 1;
            }
          });

          layersMap.set(childResult.xref, {
            number: childResult.number,
            xref: childResult.xref,
            text: childName.trim(),
            on: true,
            locked: false,
            depth: (parentLayer?.depth || 0) + 1,
            parentXref: parentXref,
            displayOrder: parentDisplayOrder + 1,
          });

          renderLayers();
        } catch (err) {
          console.error('Failed to add child layer:', err);
          showAlert("خطأ", "تعذرت إضافة الطبقة الفرعية");
        }
      });
    });
  };

  const loadLayers = async () => {
    if (!currentFile) {
      showAlert("لا يوجد ملف", "يرجى اختيار ملف PDF.");
      return;
    }

    try {
      showLoader("جارٍ تحميل المحرك...");
      const pymupdf = await loadPyMuPDF();

      showLoader(
        trText("جارٍ تحميل الطبقات من {{name}}...", { name: currentFile.name })
      );
      currentDoc = await (
        pymupdf as { open: (file: File) => Promise<PyMuPDFDocument> }
      ).open(currentFile);

      showLoader("جارٍ قراءة إعدادات الطبقات...");
      const existingLayers = currentDoc.getLayerConfig();

      layersMap.clear();
      nextDisplayOrder = 0;

      existingLayers.forEach((layer: LayerData) => {
        layersMap.set(layer.number, {
          number: layer.number,
          xref: layer.xref ?? layer.number,
          text: layer.text,
          on: layer.on,
          locked: layer.locked,
          depth: layer.depth ?? 0,
          parentXref: layer.parentXref ?? 0,
          displayOrder: layer.displayOrder ?? nextDisplayOrder++,
        });
        if ((layer.displayOrder ?? -1) >= nextDisplayOrder) {
          nextDisplayOrder = layer.displayOrder + 1;
        }
      });

      hideLoader();

      // Hide upload zone, show layers container
      if (dropZone) dropZone.style.display = 'none';
      if (processBtnContainer) processBtnContainer.classList.add('hidden');
      if (layersContainer) layersContainer.classList.remove('hidden');

      renderLayers();
      setupLayerHandlers();
    } catch (error: unknown) {
      hideLoader();
      showAlert(
        "خطأ",
        error instanceof Error ? error.message : "تعذر تحميل طبقات PDF"
      );
      console.error('Layers error:', error);
    }
  };

  const setupLayerHandlers = () => {
    const addLayerBtn = document.getElementById('add-layer-btn');
    const newLayerInput = document.getElementById(
      'new-layer-name'
    ) as HTMLInputElement;
    const saveLayersBtn = document.getElementById('save-layers-btn');

    if (addLayerBtn && newLayerInput) {
      addLayerBtn.onclick = () => {
        const name = newLayerInput.value.trim();
        if (!name) {
          showAlert("اسم غير صالح", "يرجى إدخال اسم الطبقة");
          return;
        }

        try {
          const layerResult = currentDoc.addOCG(name);
          newLayerInput.value = '';

          const newDisplayOrder = nextDisplayOrder++;
          layersMap.set(layerResult.xref, {
            number: layerResult.number,
            xref: layerResult.xref,
            text: name,
            on: true,
            locked: false,
            depth: 0,
            parentXref: 0,
            displayOrder: newDisplayOrder,
          });

          renderLayers();
        } catch (err: unknown) {
          showAlert(
            "خطأ",
            'Failed to add layer: ' +
              (err instanceof Error ? err.message : String(err))
          );
        }
      };
    }

    if (saveLayersBtn) {
      saveLayersBtn.onclick = () => {
        try {
          showLoader("جارٍ حفظ PDF مع تغييرات الطبقات...");
          const pdfBytes = currentDoc.save();
          const blob = new Blob([new Uint8Array(pdfBytes)], {
            type: 'application/pdf',
          });
          downloadFile(blob, currentFile!.name);
          hideLoader();
          resetState();
          showAlert("تم بنجاح", "تم حفظ PDF مع تغييرات الطبقات!", 'success');
        } catch (err: unknown) {
          hideLoader();
          showAlert(
            "خطأ",
            'Failed to save PDF: ' +
              (err instanceof Error ? err.message : String(err))
          );
        }
      };
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
      ) {
        const result = await loadPdfWithPasswordPrompt(file);
        if (!result) return;
        result.pdf.destroy();
        currentFile = result.file;
        updateUI();
      } else {
        showAlert("ملف غير صالح", "يرجى اختيار ملف PDF.");
      }
    }
  };

  if (fileInput && dropZone) {
    fileInput.addEventListener('change', (e) => {
      handleFileSelect((e.target as HTMLInputElement).files);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      handleFileSelect(e.dataTransfer?.files ?? null);
    });

    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', loadLayers);
  }
});
