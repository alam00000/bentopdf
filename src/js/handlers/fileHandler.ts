// FILE: js/handlers/fileHandler.js

import { state } from '../state.js';
import { showLoader, hideLoader, showAlert, renderPageThumbnails, renderFileDisplay, switchView } from '../ui.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { setupCanvasEditor } from '../canvasEditor.js';
import { toolLogic } from '../logic/index.js';
import { renderDuplicateOrganizeThumbnails } from '../logic/duplicate-organize.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { icons, createIcons } from 'lucide';
import Sortable from 'sortablejs';

async function handleSinglePdfUpload(toolId: any, file: any) {
    showLoader('Loading PDF...');
    try {
        const pdfBytes = await readFileAsArrayBuffer(file);
            state.pdfDoc = await PDFLibDocument.load(pdfBytes as ArrayBuffer, {
            ignoreEncryption: true
        });
        hideLoader();

        if (state.pdfDoc.isEncrypted && toolId !== 'decrypt' && toolId !== 'change-permissions') {
            showAlert('Protected PDF', 'This PDF is password-protected. Please use the Decrypt or Change Permissions tool first.');
            switchView('grid');
            return;
        }

        const optionsDiv = document.querySelector('[id$="-options"], [id$="-preview"], [id$="-organizer"], [id$="-rotator"], [id$="-editor"]');
        if (optionsDiv) optionsDiv.classList.remove('hidden');

        const processBtn = document.getElementById('process-btn');
        if (processBtn) {
            // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
            processBtn.disabled = false;
            processBtn.classList.remove('hidden');
            const logic = toolLogic[toolId];
            if (logic) {
                const func = typeof logic.process === 'function' ? logic.process : logic;
                processBtn.onclick = func;
            }
        }

        if (['split', 'delete-pages', 'add-blank-page', 'extract-pages', 'add-header-footer'].includes(toolId)) {
            document.getElementById('total-pages').textContent = state.pdfDoc.getPageCount();
        }

        if (toolId === 'organize' || toolId === 'rotate') {
            await renderPageThumbnails(toolId, state.pdfDoc);

            if (toolId === 'rotate') {
                const rotateAllControls = document.getElementById('rotate-all-controls');
                const rotateAllLeftBtn = document.getElementById('rotate-all-left-btn');
                const rotateAllRightBtn = document.getElementById('rotate-all-right-btn');

                // Show the buttons
                rotateAllControls.classList.remove('hidden');
                createIcons({icons}); // Render the new icons

                const rotateAll = (direction: any) => {
                    document.querySelectorAll('.page-rotator-item').forEach(item => {
                        // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
                        const currentRotation = parseInt(item.dataset.rotation || '0');
                        // Calculate new rotation, ensuring it wraps around 0-270 degrees
                        const newRotation = (currentRotation + (direction * 90) + 360) % 360;

                        // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
                        item.dataset.rotation = newRotation;

                        const thumbnail = item.querySelector('canvas, img');
                        if (thumbnail) {
                            // @ts-expect-error TS(2339) FIXME: Property 'style' does not exist on type 'Element'.
                            thumbnail.style.transform = `rotate(${newRotation}deg)`;
                        }
                    });
                };

                rotateAllLeftBtn.onclick = () => rotateAll(-1); // -1 for counter-clockwise
                rotateAllRightBtn.onclick = () => rotateAll(1);  //  1 for clockwise
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
                // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
                const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

                const [metadata, fieldObjects] = await Promise.all([
                    pdfjsDoc.getMetadata(),
                    pdfjsDoc.getFieldObjects()
                ]);

                const { info, metadata: rawXmpString } = metadata;

                const parsePdfDate = (pdfDate: any) => {
                    if (!pdfDate || typeof pdfDate !== 'string' || !pdfDate.startsWith('D:')) return pdfDate;
                    try {
                        const year = pdfDate.substring(2, 6);
                        const month = pdfDate.substring(6, 8);
                        const day = pdfDate.substring(8, 10);
                        const hour = pdfDate.substring(10, 12);
                        const minute = pdfDate.substring(12, 14);
                        const second = pdfDate.substring(14, 16);
                        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toLocaleString();
                    } catch {
                        return pdfDate;
                    }
                };

                let htmlContent = '';

                htmlContent += `
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-white mb-2">Info Dictionary</h3>
                <ul class="space-y-3 text-sm bg-gray-900 p-4 rounded-lg border border-gray-700">`;

                if (info && Object.keys(info).length > 0) {
                    for (const key in info) {
                        let value = info[key];
                        let displayValue;

                        if (value === null || value === undefined || String(value).trim() === '') {
                            displayValue = `<span class="text-gray-500 italic">- Not Set -</span>`;
                        } else if ((key === 'CreationDate' || key === 'ModDate') && typeof value === 'string') {
                            displayValue = `<span class="text-white break-all">${parsePdfDate(value)}</span>`;
                        } else if (typeof value === 'object' && !Array.isArray(value)) {
                            try {
                                let nestedList = '<ul class="mt-2 space-y-1 pl-4 border-l border-gray-600">';
                                for (const [nestedKey, nestedValue] of Object.entries(value)) {
                                    nestedList += `<li class="flex"><strong class="w-32 flex-shrink-0 text-gray-500">${nestedKey}:</strong> <span class="text-white break-all">${nestedValue}</span></li>`;
                                }
                                nestedList += '</ul>';
                                displayValue = nestedList;
                            } catch (e) {
                                displayValue = `<span class="text-white break-all">[Unserializable Object]</span>`;
                            }
                        } else {
                            // Fallback for simple values (strings, numbers, arrays)
                            displayValue = `<span class="text-white break-all">${String(value)}</span>`;
                        }
                        htmlContent += `<li class="flex flex-col sm:flex-row"><strong class="w-40 flex-shrink-0 text-gray-400">${key}</strong><div class="flex-grow">${displayValue}</div></li>`;
                    }
                } else {
                    htmlContent += `<li><span class="text-gray-500 italic">- No Info Dictionary data found -</span></li>`;
                }
                htmlContent += `</ul></div>`;

                htmlContent += `
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-white mb-2">Interactive Form Fields</h3>
                <ul class="space-y-3 text-sm bg-gray-900 p-4 rounded-lg border border-gray-700">`;

                if (fieldObjects && Object.keys(fieldObjects).length > 0) {
                    const getFriendlyFieldType = (type: any) => {
                        switch (type) {
                            case 'Tx': return 'Text'; case 'Btn': return 'Button/Checkbox';
                            case 'Ch': return 'Choice/Dropdown'; case 'Sig': return 'Signature';
                            default: return type || 'Unknown';
                        }
                    };
                    for (const fieldName in fieldObjects) {
                        const field = fieldObjects[fieldName][0];
                        const fieldType = getFriendlyFieldType(field.fieldType);
                        const fieldValue = field.fieldValue ? `<span class="text-white break-all">${field.fieldValue}</span>` : `<span class="text-gray-500 italic">- Not Set -</span>`;
                        htmlContent += `
                    <li class="flex flex-col sm:flex-row">
                        <strong class="w-40 flex-shrink-0 text-gray-400 font-semibold">${fieldName}</strong>
                        <div><span class="text-gray-300 mr-2">[${fieldType}]</span>${fieldValue}</div>
                    </li>`;
                    }
                } else {
                    htmlContent += `<li><span class="text-gray-500 italic">- No interactive form fields found -</span></li>`;
                }
                htmlContent += `</ul></div>`;

                htmlContent += `
            <div>
                <h3 class="text-lg font-semibold text-white mb-2">XMP Metadata (Raw XML)</h3>
                <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">`;

                if (rawXmpString) {
                    const escapedXml = rawXmpString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    htmlContent += `<pre class="text-xs text-gray-300 whitespace-pre-wrap break-all">${escapedXml}</pre>`;
                } else {
                    htmlContent += `<p class="text-gray-500 italic">- No XMP metadata found -</p>`;
                }
                htmlContent += `</div></div>`;

                resultsDiv.innerHTML = htmlContent;
                resultsDiv.classList.remove('hidden');

            } catch (e) {
                console.error("Failed to view metadata or fields:", e);
                showAlert('Error', 'Could not fully analyze the PDF. It may be corrupted or have an unusual structure.');
            } finally {
                hideLoader();
            }
        }

        if (toolId === 'edit-metadata') {
            const form = document.getElementById('metadata-form');
            const formatDateForInput = (date: any) => {
                if (!date) return '';
                const pad = (num: any) => num.toString().padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
            };

            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-title').value = state.pdfDoc.getTitle() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-author').value = state.pdfDoc.getAuthor() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-subject').value = state.pdfDoc.getSubject() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-keywords').value = state.pdfDoc.getKeywords() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-creator').value = state.pdfDoc.getCreator() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-producer').value = state.pdfDoc.getProducer() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-creation-date').value = formatDateForInput(state.pdfDoc.getCreationDate());
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-mod-date').value = formatDateForInput(state.pdfDoc.getModificationDate());

            form.classList.remove('hidden');

            const addBtn = document.getElementById('add-custom-meta-btn');
            const container = document.getElementById('custom-metadata-container');

            addBtn.onclick = () => {
                const newFieldId = `custom-field-${Date.now()}`;
                const fieldWrapper = document.createElement('div');
                fieldWrapper.id = newFieldId;
                fieldWrapper.className = 'flex items-center gap-2';
                fieldWrapper.innerHTML = `
                    <input type="text" placeholder="Key (e.g., Department)" class="custom-meta-key w-1/3 bg-gray-800 border border-gray-600 text-white rounded-lg p-2">
                    <input type="text" placeholder="Value (e.g., Marketing)" class="custom-meta-value flex-grow bg-gray-800 border border-gray-600 text-white rounded-lg p-2">
                    <button type="button" class="btn p-2 text-red-500 hover:bg-gray-700 rounded-full" onclick="document.getElementById('${newFieldId}').remove()">
                        <i data-lucide="trash-2"></i>
                    </button>
                `;
                container.appendChild(fieldWrapper);

                createIcons({icons}); // Re-render icons
            };

            createIcons({icons});
        }
        if (toolId === 'edit-metadata') {
            const form = document.getElementById('metadata-form');
            const container = document.getElementById('custom-metadata-container');
            const addBtn = document.getElementById('add-custom-meta-btn');

            // Helper to format Date objects
            const formatDateForInput = (date: any) => {
                if (!date) return '';
                const pad = (num: any) => num.toString().padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
            };

            

            // Comprehensive decoder for PDF values
            const decodePDFValue = (valueNode: any) => {
                if (!valueNode) return '';

                // @ts-expect-error TS(2339) FIXME: Property 'PDFLib' does not exist on type 'Window &... Remove this comment to see the full error message
                const { PDFHexString, PDFString, PDFName, PDFNumber } = window.PDFLib;

                try {
                    // Handle PDFHexString
                    if (valueNode instanceof PDFHexString) {
                        // Try the built-in decoder first
                        try {
                            return valueNode.decodeText();
                        } catch (e) {
                            console.warn('Built-in decodeText failed for PDFHexString, trying manual decode');
                            // Manual hex decoding
                            const hexStr = valueNode.toString();
                            return decodeHexStringManual(hexStr);
                        }
                    }

                    // Handle PDFString
                    if (valueNode instanceof PDFString) {
                        try {
                            return valueNode.decodeText();
                        } catch (e) {
                            console.warn('Built-in decodeText failed for PDFString, using toString');
                            return valueNode.toString();
                        }
                    }

                    // Handle other types
                    if (valueNode instanceof PDFName) {
                        return valueNode.decodeText ? valueNode.decodeText() : valueNode.toString();
                    }

                    if (valueNode instanceof PDFNumber) {
                        return valueNode.toString();
                    }

                    // Fallback - check if the toString() result needs hex decoding
                    const strValue = valueNode.toString();

                    // Check for various hex encoding patterns
                    if (strValue.includes('#')) {
                        // Pattern like "helllo#20h"
                        return strValue.replace(/#([0-9A-Fa-f]{2})/g, (match: any, hex: any) => {
                            return String.fromCharCode(parseInt(hex, 16));
                        });
                    }

                    // Check if it's a hex string in angle brackets like <48656C6C6C6F20>
                    if (strValue.match(/^<[0-9A-Fa-f\s]+>$/)) {
                        return decodeHexStringManual(strValue);
                    }

                    // Check if it's a parentheses-wrapped string
                    if (strValue.match(/^\([^)]*\)$/)) {
                        return strValue.slice(1, -1); // Remove parentheses
                    }

                    return strValue;

                } catch (error) {
                    console.error('Error decoding PDF value:', error);
                    return valueNode.toString();
                }
            };

            // Manual hex string decoder
            const decodeHexStringManual = (hexStr: any) => {
                try {
                    // Remove angle brackets if present
                    let cleanHex = hexStr.replace(/^<|>$/g, '');
                    // Remove any whitespace
                    cleanHex = cleanHex.replace(/\s/g, '');

                    let result = '';
                    for (let i = 0; i < cleanHex.length; i += 2) {
                        const hexPair = cleanHex.substr(i, 2);
                        if (hexPair.length === 2 && /^[0-9A-Fa-f]{2}$/.test(hexPair)) {
                            const charCode = parseInt(hexPair, 16);
                            // Only add printable characters or common whitespace
                            if (charCode >= 32 && charCode <= 126) {
                                result += String.fromCharCode(charCode);
                            } else if (charCode === 10 || charCode === 13 || charCode === 9) {
                                result += String.fromCharCode(charCode);
                            } else {
                                // For non-printable characters, you might want to skip or use a placeholder
                                result += String.fromCharCode(charCode);
                            }
                        }
                    }
                    return result;
                } catch (error) {
                    console.error('Manual hex decode failed:', error);
                    return hexStr;
                }
            };

            // --- 1. Pre-fill Standard Fields ---
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-title').value = state.pdfDoc.getTitle() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-author').value = state.pdfDoc.getAuthor() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-subject').value = state.pdfDoc.getSubject() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-keywords').value = state.pdfDoc.getKeywords() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-creator').value = state.pdfDoc.getCreator() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-producer').value = state.pdfDoc.getProducer() || '';
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-creation-date').value = formatDateForInput(state.pdfDoc.getCreationDate());
            // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
            document.getElementById('meta-mod-date').value = formatDateForInput(state.pdfDoc.getModificationDate());

            container.querySelectorAll('.custom-field-wrapper').forEach(el => el.remove());

            addBtn.onclick = () => {
                const newFieldId = `custom-field-${Date.now()}`;
                const fieldWrapper = document.createElement('div');
                fieldWrapper.id = newFieldId;
                fieldWrapper.className = 'flex items-center gap-2 custom-field-wrapper';
                fieldWrapper.innerHTML = `
            <input type="text" placeholder="Key (e.g., Department)" class="custom-meta-key w-1/3 bg-gray-800 border border-gray-600 text-white rounded-lg p-2">
            <input type="text" placeholder="Value (e.g., Marketing)" class="custom-meta-value flex-grow bg-gray-800 border border-gray-600 text-white rounded-lg p-2">
            <button type="button" class="btn p-2 text-red-500 hover:bg-gray-700 rounded-full" onclick="document.getElementById('${newFieldId}').remove()">
                <i data-lucide="trash-2"></i>
            </button>
        `;
                container.appendChild(fieldWrapper);

                createIcons({icons});
            };

            form.classList.remove('hidden');

            createIcons({icons}); // Render all icons after dynamic changes
        }

        if (toolId === 'cropper') {
            document.getElementById('cropper-ui-container').classList.remove('hidden');
        }

        if (toolId === 'page-dimensions') {
            toolLogic['page-dimensions']();
        }

        if (toolLogic[toolId] && typeof toolLogic[toolId].setup === 'function') {
            toolLogic[toolId].setup();
        }
    } catch (e) {
        hideLoader();
        showAlert('Error', 'Could not load PDF. The file may be invalid, corrupted, or password-protected.');
        console.error(e);
    }
}

function handleMultiFileUpload(toolId: any) {
    const processBtn = document.getElementById('process-btn');
    if (processBtn) {
        // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
        processBtn.disabled = false;
        const logic = toolLogic[toolId];
        if (logic) {
            const func = typeof logic.process === 'function' ? logic.process : logic;
            processBtn.onclick = func;
        }
    }

    if (toolId === 'merge') {
        toolLogic.merge.setup();
    } else if (toolId === 'image-to-pdf') {
        const imageList = document.getElementById('image-list');

        imageList.innerHTML = '';

        state.files.forEach(file => {
            const url = URL.createObjectURL(file);
            const li = document.createElement('li');
            li.className = "relative group cursor-move";
            li.dataset.fileName = file.name;
            li.innerHTML = `<img src="${url}" class="w-full h-full object-cover rounded-md border-2 border-gray-600"><p class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center truncate p-1">${file.name}</p>`;
            imageList.appendChild(li);
        });

        Sortable.create(imageList);
    }
}


export function setupFileInputHandler(toolId: any) {
    const fileInput = document.getElementById('file-input');
    const multiFileTools = ['merge', 'pdf-to-zip', 'jpg-to-pdf', 'png-to-pdf', 'webp-to-pdf', 'image-to-pdf', 'svg-to-pdf', 'bmp-to-pdf', 'heic-to-pdf', 'tiff-to-pdf'];
    const isMultiFileTool = multiFileTools.includes(toolId);
    let isFirstUpload = true;

    const processFiles = async (newFiles: any) => {
        if (newFiles.length === 0) return;

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

            createIcons({icons});
        }

        const singlePdfLoadTools = ['split', 'organize', 'rotate', 'add-page-numbers',
            'pdf-to-jpg', 'pdf-to-png', 'pdf-to-webp', 'compress', 'pdf-to-greyscale',
            'edit-metadata', 'remove-metadata', 'flatten', 'delete-pages', 'add-blank-page',
            'extract-pages', 'add-watermark', 'add-header-footer', 'invert-colors', 'view-metadata',
            'reverse-pages', 'crop', 'redact', 'pdf-to-bmp', 'pdf-to-tiff', 'split-in-half',
            'page-dimensions', 'n-up', 'duplicate-organize', 'combine-single-page', 'fix-dimensions', 'change-background-color',
            'change-text-color', 'ocr-pdf', 'sign-pdf', 'remove-annotations', 'cropper', 'form-filler',
        ];
        const simpleTools = ['encrypt', 'decrypt', 'change-permissions', 'pdf-to-markdown', 'word-to-pdf'];

        if (isMultiFileTool) {
            handleMultiFileUpload(toolId);
        } else if (singlePdfLoadTools.includes(toolId)) {
            await handleSinglePdfUpload(toolId, state.files[0]);
        } else if (simpleTools.includes(toolId)) {
            const optionsDivId = toolId === 'change-permissions' ? 'permissions-options' : `${toolId}-options`;
            const optionsDiv = document.getElementById(optionsDivId);
            if (optionsDiv) optionsDiv.classList.remove('hidden');
            const processBtn = document.getElementById('process-btn');
            if (processBtn) {
                // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
                processBtn.disabled = false;
                processBtn.onclick = () => {
                    const logic = toolLogic[toolId];
                    if (logic) {
                        const func = typeof logic.process === 'function' ? logic.process : logic;
                        func();
                    }
                };
            }
        }
        else if (toolId === 'edit') {
            const file = state.files[0];
            if (!file) return;

            const pdfWrapper = document.getElementById('embed-pdf-wrapper');
            const pdfContainer = document.getElementById('embed-pdf-container');

            pdfContainer.innerHTML = '';

            if (state.currentPdfUrl) {
                URL.revokeObjectURL(state.currentPdfUrl);
            }

            pdfWrapper.classList.remove('hidden');

            const fileURL = URL.createObjectURL(file);

            state.currentPdfUrl = fileURL;

            const script = document.createElement('script');
            script.type = 'module';
            script.innerHTML = `
                import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js';
                EmbedPDF.init({
                    type: 'container',
                    target: document.getElementById('embed-pdf-container'),
                    src: '${fileURL}',
                    theme: 'dark',
                });
            `;
            document.head.appendChild(script);

            const backBtn = document.getElementById('back-to-grid');
            const urlRevoker = () => {
                URL.revokeObjectURL(fileURL);
                state.currentPdfUrl = null; // Clear from state as well
                backBtn.removeEventListener('click', urlRevoker);
            };
            backBtn.addEventListener('click', urlRevoker);
        }
    };

    // @ts-expect-error TS(2339) FIXME: Property 'files' does not exist on type 'EventTarg... Remove this comment to see the full error message
    fileInput.addEventListener('change', (e) => processFiles(Array.from(e.target.files)));

    const setupAddMoreButton = () => {
        const addMoreBtn = document.getElementById('add-more-btn');
        if (addMoreBtn) {
            addMoreBtn.addEventListener('click', () => {
                fileInput.click(); 
            });
        }
    };

    const setupClearButton = () => {
        const clearBtn = document.getElementById('clear-files-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                state.files = [];
                isFirstUpload = true;
                // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
                fileInput.value = '';
                
                const fileDisplayArea = document.getElementById('file-display-area');
                if (fileDisplayArea) fileDisplayArea.innerHTML = '';
                
                const fileControls = document.getElementById('file-controls');
                if (fileControls) fileControls.classList.add('hidden');
                
                // Clear tool-specific UI
                const toolSpecificUI = ['file-list', 'page-merge-preview', 'image-list'];
                toolSpecificUI.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerHTML = '';
                });
                
                const processBtn = document.getElementById('process-btn');
                // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
                if (processBtn) processBtn.disabled = true;
            });
        }
    };
    
    setTimeout(() => {
        setupAddMoreButton();
        setupClearButton();
    }, 100);
}