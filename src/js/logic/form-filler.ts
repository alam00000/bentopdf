import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { 
    PDFDocument as PDFLibDocument, 
    PDFTextField, 
    PDFCheckBox, 
    PDFRadioGroup, 
    PDFDropdown, 
    PDFButton, 
    PDFSignature, 
    PDFOptionList 
} from 'pdf-lib';

import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

let pdfJsDoc: any = null;
let currentPageNum = 1;
let pdfRendering = false;
let renderTimeout: any = null; 
const formState = {
    scale: 2,
    fields: [],
};

let fieldValues: Record<string, any> = {};

async function renderPage() {
    if (pdfRendering || !pdfJsDoc) return;

    pdfRendering = true;
    showLoader(`Rendering page ${currentPageNum}...`);

    const page = await pdfJsDoc.getPage(currentPageNum);
    const viewport = page.getViewport({ scale: 1.0 });

    const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    
    if (!context) {
        console.error('Could not get canvas context');
        pdfRendering = false;
        hideLoader();
        return;
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    canvas.style.transformOrigin = 'top left';
    canvas.style.transform = `scale(${formState.scale})`;

    const tempPdfDoc = await PDFLibDocument.load(await state.pdfDoc.save(), { ignoreEncryption: true });
    const form = tempPdfDoc.getForm();
    Object.keys(fieldValues).forEach(fieldName => {
        try {
            const field = form.getField(fieldName);
            if (!field) return;

            if (field instanceof PDFTextField) {
                field.setText(fieldValues[fieldName]);
            } else if (field instanceof PDFCheckBox) {
                if (fieldValues[fieldName] === 'on') {
                    field.check();
                } else {
                    field.uncheck();
                }
            } else if (field instanceof PDFRadioGroup) {
                field.select(fieldValues[fieldName]);
            } else if (field instanceof PDFDropdown) {
                field.select(fieldValues[fieldName]);
            } else if (field instanceof PDFOptionList) {
                // Handle multi-select list box
                if (Array.isArray(fieldValues[fieldName])) {
                    fieldValues[fieldName].forEach((option: any) => field.select(option));
                }
            }
        } catch (e) {
            console.error(`Error applying value to field "${fieldName}":`, e);
        }
    });

    const tempPdfBytes = await tempPdfDoc.save();
    const tempPdfJsDoc = await pdfjsLib.getDocument({ data: tempPdfBytes }).promise;
    const tempPage = await tempPdfJsDoc.getPage(currentPageNum);

    // Use the newer PDF.js render API
    await tempPage.render({
        canvasContext: context,
        viewport: viewport
    } as any).promise;

    const currentPageDisplay = document.getElementById('current-page-display');
    const totalPagesDisplay = document.getElementById('total-pages-display');
    const prevPageBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextPageBtn = document.getElementById('next-page') as HTMLButtonElement;

    if (currentPageDisplay) currentPageDisplay.textContent = String(currentPageNum);
    if (totalPagesDisplay) totalPagesDisplay.textContent = String(pdfJsDoc.numPages);
    if (prevPageBtn) prevPageBtn.disabled = currentPageNum <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPageNum >= pdfJsDoc.numPages;
    
    pdfRendering = false;
    hideLoader();
}

/**
 * Navigates to the next or previous page.
 * @param {number} offset 1 for next, -1 for previous.
 */
async function changePage(offset: number) {
    const newPageNum = currentPageNum + offset;
    if (newPageNum > 0 && newPageNum <= pdfJsDoc.numPages) {
        currentPageNum = newPageNum;
        await renderPage();
    }
}

/**
 * Sets the zoom level of the PDF viewer.
 * @param {number} factor The zoom factor.
 */
async function setZoom(factor: number) {
    formState.scale = factor;
    await renderPage();
}

function handleFormChange(event: Event) {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    const name = input.name;
    let value: any;
    
    if (input instanceof HTMLInputElement && input.type === 'checkbox') {
        value = input.checked ? 'on' : 'off';
    } else if (input instanceof HTMLSelectElement && input.multiple) {
        // Handle multi-select list box
        value = Array.from(input.options)
                     .filter(option => option.selected)
                     .map(option => option.value);
    } else {
        value = input.value;
    }
    
    fieldValues[name] = value;
    
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        renderPage();
    }, 350);
}

function createFormFieldHtml(field: any) {
    const name = field.getName();
    const isRequired = field.isRequired();
    
    const labelText = name.replace(/[_-]/g, ' '); 
    const labelHtml = `<label for="field-${name}" class="block text-sm font-medium text-gray-300 capitalize mb-1">${labelText} ${isRequired ? '<span class="text-red-500">*</span>' : ''}</label>`;

    let inputHtml = '';
    
    if (field instanceof PDFTextField) {
        fieldValues[name] = field.getText() || '';
        inputHtml = `<input type="text" id="field-${name}" name="${name}" value="${fieldValues[name]}" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">`;
    } else if (field instanceof PDFCheckBox) {
        fieldValues[name] = field.isChecked() ? 'on' : 'off';
        inputHtml = `<input type="checkbox" id="field-${name}" name="${name}" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" ${field.isChecked() ? 'checked' : ''}>`;
    } else if (field instanceof PDFRadioGroup) {
        fieldValues[name] = field.getSelected();
        const options = field.getOptions();
        inputHtml = options.map((opt: any) => `
            <label class="flex items-center gap-2">
                <input type="radio" name="${name}" value="${opt}" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500" ${opt === field.getSelected() ? 'checked' : ''}>
                <span class="text-gray-300 text-sm">${opt}</span>
            </label>
        `).join('');
    } else if (field instanceof PDFDropdown) {
        fieldValues[name] = field.getSelected();
        const dropdownOptions = field.getOptions();
        inputHtml = `<select id="field-${name}" name="${name}" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            ${dropdownOptions.map((opt: any) => `<option value="${opt}" ${opt === field.getSelected() ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>`;
    } else if (field instanceof PDFOptionList) {
        const selectedValues = field.getSelected();
        fieldValues[name] = selectedValues;
        const listOptions = field.getOptions();
        inputHtml = `<select id="field-${name}" name="${name}" multiple size="${Math.min(10, listOptions.length)}" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 h-auto">
            ${listOptions.map((opt: any) => `<option value="${opt}" ${selectedValues.includes(opt) ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>`;
    } else if (field instanceof PDFSignature) {
        inputHtml = `<div class="p-4 bg-gray-800 rounded-lg border border-gray-700"><p class="text-sm text-gray-400">Signature field: Not supported for direct editing.</p></div>`;
    } else if (field instanceof PDFButton) {
        inputHtml = `<button type="button" id="field-${name}" class="btn bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg">Button: ${labelText}</button>`;
    } else {
        return `<div class="p-4 bg-gray-800 rounded-lg border border-gray-700"><p class="text-sm text-gray-500">Unsupported field type: ${field.constructor.name}</p></div>`;
    }

    return `
        <div class="form-field-group p-4 bg-gray-800 rounded-lg border border-gray-700">
            ${labelHtml}
            ${inputHtml}
        </div>
    `;
}

export async function setupFormFiller() {
    if (!state.pdfDoc) return;
    
    showLoader('Analyzing form fields...');
    const formContainer = document.getElementById('form-fields-container');
    const processBtn = document.getElementById('process-btn');

    if (!formContainer || !processBtn) {
        console.error('Required DOM elements not found');
        hideLoader();
        return;
    }

    try {
        const form = state.pdfDoc.getForm();
        const fields = form.getFields();
        formState.fields = fields;

        if (fields.length === 0) {
            formContainer.innerHTML = '<p class="text-center text-gray-400">This PDF contains no form fields.</p>';
            processBtn.classList.add('hidden');
        } else {
            let formHtml = '';
            
            fields.forEach((field: any) => {
                try {
                    formHtml += createFormFieldHtml(field);
                } catch (e: any) {
                    console.error(`Error processing field "${field.getName()}":`, e);
                    formHtml += `<div class="p-4 bg-gray-800 rounded-lg border border-gray-700"><p class="text-sm text-gray-500">Unsupported field: ${field.getName()}</p><p class="text-xs text-gray-500">${e.message}</p></div>`;
                }
            });

            formContainer.innerHTML = formHtml;
            processBtn.classList.remove('hidden');

            formContainer.addEventListener('change', handleFormChange);
            formContainer.addEventListener('input', handleFormChange);
        }
        
        const pdfBytes = await state.pdfDoc.save();
        pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        currentPageNum = 1;
        await renderPage();

        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');

        if (zoomInBtn) zoomInBtn.onclick = () => setZoom(formState.scale + 0.25);
        if (zoomOutBtn) zoomOutBtn.onclick = () => setZoom(Math.max(0.25, formState.scale - 0.25));
        if (prevPageBtn) prevPageBtn.onclick = () => changePage(-1);
        if (nextPageBtn) nextPageBtn.onclick = () => changePage(1);
        
        hideLoader();
        
        const formFillerOptions = document.getElementById('form-filler-options');
        if (formFillerOptions) formFillerOptions.classList.remove('hidden');

    } catch (e) {
        console.error("Critical error setting up form filler:", e);
        showAlert('Error', 'Failed to read PDF form data. The file may be corrupt or not a valid form.');
        hideLoader();
    }
}

export async function processAndDownloadForm() {
    showLoader('Applying form data...');
    try {
        const form = state.pdfDoc.getForm();
        
        Object.keys(fieldValues).forEach(fieldName => {
            try {
                const field = form.getField(fieldName);
                const value = fieldValues[fieldName];

                if (field instanceof PDFTextField) {
                    field.setText(value);
                } else if (field instanceof PDFCheckBox) {
                    if (value === 'on') {
                        field.check();
                    } else {
                        field.uncheck();
                    }
                } else if (field instanceof PDFRadioGroup) {
                    field.select(value);
                } else if (field instanceof PDFDropdown) {
                    field.select(value);
                } else if (field instanceof PDFOptionList) {
                    // Handle multi-select list box
                    if (Array.isArray(value)) {
                        value.forEach(option => field.select(option));
                    }
                }
            } catch (e) {
                console.error(`Error processing field "${fieldName}" during download:`, e);
            }
        });
        
        const newPdfBytes = await state.pdfDoc.save();
        downloadFile(new Blob([newPdfBytes], { type: 'application/pdf' }), 'filled-form.pdf');
        
        showAlert('Success', 'Form has been filled and downloaded.');

    } catch (e) {
        console.error(e);
        showAlert('Error', 'Failed to save the filled form.');
    } finally {
        hideLoader();
    }
}