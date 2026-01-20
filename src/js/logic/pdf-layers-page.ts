import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer, formatBytes, getPDFDocument } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

const pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));

interface LayerData {
    number: number;
    xref: number;
    text: string;
    on: boolean;
    locked: boolean;
    depth: number;
    parentXref: number;
    displayOrder: number;
};

let currentFile: File | null = null;
let currentDoc: any = null;
const layersMap = new Map<number, LayerData>();
let nextDisplayOrder = 0;

document.addEventListener('DOMContentLoaded', () => {
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
            fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

            const infoContainer = document.createElement('div');
            infoContainer.className = 'flex flex-col overflow-hidden';

            const nameSpan = document.createElement('div');
            nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
            nameSpan.textContent = currentFile.name;

            const metaSpan = document.createElement('div');
            metaSpan.className = 'text-xs text-gray-400';
            metaSpan.textContent = `${formatBytes(currentFile.size)} • Loading pages...`;

            infoContainer.append(nameSpan, metaSpan);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
            removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
            removeBtn.onclick = () => {
                resetState();
            };

            fileDiv.append(infoContainer, removeBtn);
            fileDisplayArea.appendChild(fileDiv);

            try {
                const arrayBuffer = await readFileAsArrayBuffer(currentFile);
                const pdfDoc = await getPDFDocument({ data: arrayBuffer }).promise;
                metaSpan.textContent = `${formatBytes(currentFile.size)} • ${pdfDoc.numPages} pages`;
            } catch (error) {
                console.error('Error loading PDF:', error);
                metaSpan.textContent = `${formatBytes(currentFile.size)} • Could not load page count`;
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

    const promptForInput = (title: string, message: string, defaultValue: string = ''): Promise<string | null> => {
        return new Promise((resolve) => {
            const modal = document.getElementById('input-modal');
            const titleEl = document.getElementById('input-title');
            const messageEl = document.getElementById('input-message');
            const inputEl = document.getElementById('input-value') as HTMLInputElement;
            const confirmBtn = document.getElementById('input-confirm');
            const cancelBtn = document.getElementById('input-cancel');

            if (!modal || !titleEl || !messageEl || !inputEl || !confirmBtn || !cancelBtn) {
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
                    <p>This PDF has no layers (OCG).</p>
                    <p>Add a new layer to get started!</p>
                </div>
            `;
            return;
        }

        // Sort layers by displayOrder
        const sortedLayers = layersArray.sort((a, b) => a.displayOrder - b.displayOrder);

        layersList.innerHTML = sortedLayers.map((layer: LayerData) => `
            <div class="layer-item" data-number="${layer.number}" style="padding-left: ${layer.depth * 24 + 8}px;">
                <label class="layer-toggle">
                    <input type="checkbox" ${layer.on ? 'checked' : ''} ${layer.locked ? 'disabled' : ''} data-xref="${layer.xref}" />
                    <span class="layer-name">${layer.depth > 0 ? '└ ' : ''}${layer.text || `Layer ${layer.number}`}</span>
                    ${layer.locked ? '<span class="layer-locked">🔒</span>' : ''}
                </label>
                <div class="layer-actions">
                    ${!layer.locked ? `<button class="layer-add-child" data-xref="${layer.xref}" title="Add child layer">+</button>` : ''}
                    ${!layer.locked ? `<button class="layer-delete" data-xref="${layer.xref}" title="Delete layer">✕</button>` : ''}
                </div>
            </div>
        `).join('');

        // Attach toggle handlers
        layersList.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const xref = parseInt(target.dataset.xref || '0');
                const isOn = target.checked;

                try {
                    currentDoc.setLayerVisibility(xref, isOn);
                    const layer = Array.from(layersMap.values()).find(l => l.xref === xref);
                    if (layer) {
                        layer.on = isOn;
                    }
                } catch (err) {
                    console.error('Failed to set layer visibility:', err);
                    target.checked = !isOn;
                    showAlert('Error', 'Failed to toggle layer visibility');
                }
            });
        });

        // Attach delete handlers
        layersList.querySelectorAll('.layer-delete').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const xref = parseInt(target.dataset.xref || '0');
                const layer = Array.from(layersMap.values()).find(l => l.xref === xref);

                if (!layer) {
                    showAlert('Error', 'Layer not found');
                    return;
                }

                try {
                    currentDoc.deleteOCG(layer.number);
                    layersMap.delete(layer.number);
                    renderLayers();
                } catch (err) {
                    console.error('Failed to delete layer:', err);
                    showAlert('Error', 'Failed to delete layer');
                }
            });
        });

        layersList.querySelectorAll('.layer-add-child').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                const target = e.target as HTMLButtonElement;
                const parentXref = parseInt(target.dataset.xref || '0');
                const parentLayer = Array.from(layersMap.values()).find(l => l.xref === parentXref);

                const childName = await promptForInput('Add Child Layer', `Enter name for child layer under "${parentLayer?.text || 'Layer'}":`);

                if (!childName || !childName.trim()) return;

                try {
                    const childXref = currentDoc.addOCGWithParent(childName.trim(), parentXref);
                    const parentDisplayOrder = parentLayer?.displayOrder || 0;
                    layersMap.forEach((l) => {
                        if (l.displayOrder > parentDisplayOrder) {
                            l.displayOrder += 1;
                        }
                    });

                    layersMap.set(childXref, {
                        number: childXref,
                        xref: childXref,
                        text: childName.trim(),
                        on: true,
                        locked: false,
                        depth: (parentLayer?.depth || 0) + 1,
                        parentXref: parentXref,
                        displayOrder: parentDisplayOrder + 1
                    });

                    renderLayers();
                } catch (err) {
                    console.error('Failed to add child layer:', err);
                    showAlert('Error', 'Failed to add child layer');
                }
            });
        });
    };

    const loadLayers = async () => {
        if (!currentFile) {
            showAlert('No File', 'Please select a PDF file.');
            return;
        }

        try {
            showLoader('Loading engine...');
            await pymupdf.load();

            showLoader(`Loading layers from ${currentFile.name}...`);
            currentDoc = await pymupdf.open(currentFile);

            showLoader('Reading layer configuration...');
            const existingLayers = currentDoc.getLayerConfig();

            // Reset and populate layers map
            layersMap.clear();
            nextDisplayOrder = 0;

            existingLayers.forEach((layer: any) => {
                layersMap.set(layer.number, {
                    number: layer.number,
                    xref: layer.xref ?? layer.number,
                    text: layer.text,
                    on: layer.on,
                    locked: layer.locked,
                    depth: layer.depth ?? 0,
                    parentXref: layer.parentXref ?? 0,
                    displayOrder: layer.displayOrder ?? nextDisplayOrder++
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

        } catch (error: any) {
            hideLoader();
            showAlert('Error', error.message || 'Failed to load PDF layers');
            console.error('Layers error:', error);
        }
    };

    const setupLayerHandlers = () => {
        const addLayerBtn = document.getElementById('add-layer-btn');
        const newLayerInput = document.getElementById('new-layer-name') as HTMLInputElement;
        const saveLayersBtn = document.getElementById('save-layers-btn');

        if (addLayerBtn && newLayerInput) {
            addLayerBtn.onclick = () => {
                const name = newLayerInput.value.trim();
                if (!name) {
                    showAlert('Invalid Name', 'Please enter a layer name');
                    return;
                }

                try {
                    const xref = currentDoc.addOCG(name);
                    newLayerInput.value = '';

                    const newDisplayOrder = nextDisplayOrder++;
                    layersMap.set(xref, {
                        number: xref,
                        xref: xref,
                        text: name,
                        on: true,
                        locked: false,
                        depth: 0,
                        parentXref: 0,
                        displayOrder: newDisplayOrder
                    });

                    renderLayers();
                } catch (err: any) {
                    showAlert('Error', 'Failed to add layer: ' + err.message);
                }
            };
        }

        if (saveLayersBtn) {
            saveLayersBtn.onclick = () => {
                try {
                    showLoader('Saving PDF with layer changes...');
                    const pdfBytes = currentDoc.save();
                    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
                    const outName = currentFile!.name.replace(/\.pdf$/i, '') + '_layers.pdf';
                    downloadFile(blob, outName);
                    hideLoader();
                    resetState();
                    showAlert('Success', 'PDF with layer changes saved!', 'success');
                } catch (err: any) {
                    hideLoader();
                    showAlert('Error', 'Failed to save PDF: ' + err.message);
                }
            };
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                currentFile = file;
                updateUI();
            } else {
                showAlert('Invalid File', 'Please select a PDF file.');
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
