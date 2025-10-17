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
  PDFOptionList,
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

  const tempPdfDoc = await PDFLibDocument.load(await state.pdfDoc.save(), {
    ignoreEncryption: true,
  });
  const form = tempPdfDoc.getForm();
  Object.keys(fieldValues).forEach((fieldName) => {
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
        if (Array.isArray(fieldValues[fieldName])) {
          (fieldValues[fieldName] as any[]).forEach((option) =>
            field.select(option)
          );
        }
      }
    } catch (e) {
      console.error(`Error applying value to field "${fieldName}":`, e);
    }
  });

  const tempPdfBytes = await tempPdfDoc.save();
  const tempPdfJsDoc = await pdfjsLib.getDocument({ data: tempPdfBytes })
    .promise;
  const tempPage = await tempPdfJsDoc.getPage(currentPageNum);

  await tempPage.render({
    canvasContext: context,
    viewport: viewport,
  } as any).promise;

  const currentPageDisplay = document.getElementById('current-page-display');
  const totalPagesDisplay = document.getElementById('total-pages-display');
  const prevPageBtn = document.getElementById('prev-page') as HTMLButtonElement;
  const nextPageBtn = document.getElementById('next-page') as HTMLButtonElement;

  if (currentPageDisplay)
    currentPageDisplay.textContent = String(currentPageNum);
  if (totalPagesDisplay)
    totalPagesDisplay.textContent = String(pdfJsDoc.numPages);
  if (prevPageBtn) prevPageBtn.disabled = currentPageNum <= 1;
  if (nextPageBtn) nextPageBtn.disabled = currentPageNum >= pdfJsDoc.numPages;

  pdfRendering = false;
  hideLoader();
}

async function changePage(offset: number) {
  const newPageNum = currentPageNum + offset;
  if (newPageNum > 0 && newPageNum <= pdfJsDoc.numPages) {
    currentPageNum = newPageNum;
    await renderPage();
  }
}

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
    value = Array.from(input.options)
      .filter((option) => option.selected)
      .map((option) => option.value);
  } else {
    value = input.value;
  }

  fieldValues[name] = value;

  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    renderPage();
  }, 350);
}

function createFormFieldHtml(field: any): HTMLElement {
  const name = field.getName();
  const isRequired = field.isRequired();
  const labelText = name.replace(/[_-]/g, ' ');

  const wrapper = document.createElement('div');
  wrapper.className =
    'form-field-group p-4 bg-gray-800 rounded-lg border border-gray-700';

  const label = document.createElement('label');
  label.htmlFor = `field-${name}`;
  label.className = 'block text-sm font-medium text-gray-300 capitalize mb-1';
  label.textContent = labelText;

  if (isRequired) {
    const requiredSpan = document.createElement('span');
    requiredSpan.className = 'text-red-500';
    requiredSpan.textContent = ' *';
    label.appendChild(requiredSpan);
  }

  wrapper.appendChild(label);

  let inputElement: HTMLElement | DocumentFragment;

  if (field instanceof PDFTextField) {
    fieldValues[name] = field.getText() || '';
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `field-${name}`;
    input.name = name;
    input.value = fieldValues[name];
    input.className =
      'w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5';
    inputElement = input;
  } else if (field instanceof PDFCheckBox) {
    fieldValues[name] = field.isChecked() ? 'on' : 'off';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `field-${name}`;
    input.name = name;
    input.className =
      'w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500';
    input.checked = field.isChecked();
    inputElement = input;
  } else if (field instanceof PDFRadioGroup) {
    fieldValues[name] = field.getSelected();
    const options = field.getOptions();
    const fragment = document.createDocumentFragment();
    options.forEach((opt: string) => {
      const optionLabel = document.createElement('label');
      optionLabel.className = 'flex items-center gap-2';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = name;
      radio.value = opt;
      radio.className =
        'w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500';
      if (opt === field.getSelected()) radio.checked = true;

      const span = document.createElement('span');
      span.className = 'text-gray-300 text-sm';
      span.textContent = opt;

      optionLabel.append(radio, span);
      fragment.appendChild(optionLabel);
    });
    inputElement = fragment;
  } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
    const selectedValues = field.getSelected();
    fieldValues[name] = selectedValues;
    const options = field.getOptions();

    const select = document.createElement('select');
    select.id = `field-${name}`;
    select.name = name;
    select.className =
      'w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5';

    if (field instanceof PDFOptionList) {
      select.multiple = true;
      select.size = Math.min(10, options.length);
      select.classList.add('h-auto');
    }

    options.forEach((opt: string) => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      if (selectedValues.includes(opt)) option.selected = true;
      select.appendChild(option);
    });
    inputElement = select;
  } else {
    const unsupportedDiv = document.createElement('div');
    unsupportedDiv.className =
      'p-4 bg-gray-800 rounded-lg border border-gray-700';
    const p = document.createElement('p');
    p.className = 'text-sm text-gray-400';
    if (field instanceof PDFSignature) {
      p.textContent = 'Signature field: Not supported for direct editing.';
    } else if (field instanceof PDFButton) {
      p.textContent = `Button: ${labelText}`;
    } else {
      p.textContent = `Unsupported field type: ${field.constructor.name}`;
    }
    unsupportedDiv.appendChild(p);
    return unsupportedDiv;
  }

  wrapper.appendChild(inputElement);
  return wrapper;
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

    formContainer.textContent = '';

    if (fields.length === 0) {
      formContainer.innerHTML =
        '<p class="text-center text-gray-400">This PDF contains no form fields.</p>';
      processBtn.classList.add('hidden');
    } else {
      fields.forEach((field: any) => {
        try {
          const fieldElement = createFormFieldHtml(field);
          formContainer.appendChild(fieldElement);
        } catch (e: any) {
          console.error(`Error processing field "${field.getName()}":`, e);
          const errorDiv = document.createElement('div');
          errorDiv.className =
            'p-4 bg-gray-800 rounded-lg border border-gray-700';
          // Sanitize error message display
          const p1 = document.createElement('p');
          p1.className = 'text-sm text-gray-500';
          p1.textContent = `Unsupported field: ${field.getName()}`;
          const p2 = document.createElement('p');
          p2.className = 'text-xs text-gray-500';
          p2.textContent = e.message;
          errorDiv.append(p1, p2);
          formContainer.appendChild(errorDiv);
        }
      });

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

    if (zoomInBtn)
      zoomInBtn.addEventListener('click', () =>
        setZoom(formState.scale + 0.25)
      );
    if (zoomOutBtn)
      zoomOutBtn.addEventListener('click', () =>
        setZoom(Math.max(1, formState.scale - 0.25))
      );
    if (prevPageBtn)
      prevPageBtn.addEventListener('click', () => changePage(-1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => changePage(1));

    hideLoader();

    const formFillerOptions = document.getElementById('form-filler-options');
    if (formFillerOptions) formFillerOptions.classList.remove('hidden');
  } catch (e) {
    console.error('Critical error setting up form filler:', e);
    showAlert(
      'Error',
      'Failed to read PDF form data. The file may be corrupt or not a valid form.'
    );
    hideLoader();
  }
}

export async function processAndDownloadForm() {
  showLoader('Applying form data...');
  try {
    const form = state.pdfDoc.getForm();

    Object.keys(fieldValues).forEach((fieldName) => {
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
          if (Array.isArray(value)) {
            value.forEach((option) => field.select(option));
          }
        }
      } catch (e) {
        console.error(
          `Error processing field "${fieldName}" during download:`,
          e
        );
      }
    });

    const newPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([newPdfBytes], { type: 'application/pdf' }),
      'filled-form.pdf'
    );

    showAlert('Success', 'Form has been filled and downloaded.');
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to save the filled form.');
  } finally {
    hideLoader();
  }
}
