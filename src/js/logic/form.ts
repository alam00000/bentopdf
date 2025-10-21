import { PDFDocument } from 'pdf-lib';
import { state } from '../state';
import * as pdfjsLib from 'pdfjs-dist';

let pdfDoc;
let pdfjsDoc;
let formFields = [];
let selectedField = null;
let offsetX, offsetY;
let currentPage = 1;

class FormField {
  constructor(type, page, x, y, width, height, options = {}) {
    this.type = type;
    this.page = page;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;
  }

  draw(ctx) {
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    if (this === selectedField) {
      ctx.fillStyle = 'blue';
      ctx.fillRect(this.x + this.width - 8, this.y + this.height - 8, 16, 16);
    }
  }

  handleResize(mouseX, mouseY) {
    if (
      mouseX >= this.x + this.width - 8 && mouseX <= this.x + this.width + 8 &&
      mouseY >= this.y + this.height - 8 && mouseY <= this.y + this.height + 8
    ) {
      return true;
    }
    return false;
  }
}

const setupFormInterface = async () => {
  pdfDoc = await PDFDocument.load(await state.pdfDoc.save());
  const pdfData = await state.pdfDoc.save();
  pdfjsDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

  const renderPage = async (pageNumber) => {
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    const page = await pdfjsDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    formFields.filter(field => field.page === pageNumber).forEach(field => field.draw(ctx));
  };

  const pageNumElement = document.getElementById('page-num');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');

  const updatePageNumber = () => {
    pageNumElement.textContent = `Page ${currentPage} of ${pdfjsDoc.numPages}`;
  };

  const goToPage = async (pageNumber) => {
    if (pageNumber < 1 || pageNumber > pdfjsDoc.numPages) {
      return;
    }
    currentPage = pageNumber;
    await renderPage(currentPage);
    updatePageNumber();
  };

  prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));

  await renderPage(currentPage);
  updatePageNumber();

  const canvas = document.getElementById('pdf-canvas');
  let isResizing = false;

  canvas.addEventListener('mousedown', e => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    if (selectedField && selectedField.handleResize(mouseX, mouseY)) {
      isResizing = true;
    } else {
      selectedField = formFields.find(field =>
        field.page === currentPage &&
        mouseX >= field.x && mouseX <= field.x + field.width &&
        mouseY >= field.y && mouseY <= field.y + field.height
      );
      if (selectedField) {
        offsetX = mouseX - selectedField.x;
        offsetY = mouseY - selectedField.y;
      }
    }
    renderPage(currentPage);
  });

  window.addEventListener('mousemove', e => {
    if (isResizing) {
      const canvasRect = canvas.getBoundingClientRect();
      selectedField.width = e.clientX - canvasRect.left - selectedField.x;
      selectedField.height = e.clientY - canvasRect.top - selectedField.y;
      renderPage(currentPage);
    } else if (selectedField) {
      const canvasRect = canvas.getBoundingClientRect();
      selectedField.x = e.clientX - canvasRect.left - offsetX;
      selectedField.y = e.clientY - canvasRect.top - offsetY;
      renderPage(currentPage);
    }
  });

  window.addEventListener('mouseup', () => {
    selectedField = null;
    isResizing = false;
  });

  document.getElementById('add-text-field').addEventListener('click', () => addTextField(() => renderPage(currentPage)));
  document.getElementById('add-checkbox').addEventListener('click', () => addCheckbox(() => renderPage(currentPage)));
  document.getElementById('add-radio-group').addEventListener('click', () => addRadioGroup(() => renderPage(currentPage)));
  document.getElementById('delete-field').addEventListener('click', () => {
    if (selectedField) {
      formFields = formFields.filter(field => field !== selectedField);
      selectedField = null;
      renderPage(currentPage);
    }
  });
  document.getElementById('download-pdf').addEventListener('click', async () => {
    const newPdfDoc = await PDFDocument.load(await state.pdfDoc.save());
    const form = newPdfDoc.getForm();

    formFields.forEach(field => {
      const page = newPdfDoc.getPage(field.page - 1);
      const { height } = page.getSize();
      const y = height - field.y - field.height;

      switch (field.type) {
        case 'text':
          const textField = form.createTextField(`text.${field.x}.${field.y}`);
          textField.setText('Enter text here');
          textField.addToPage(page, { x: field.x, y, width: field.width, height: field.height });
          break;
        case 'checkbox':
          const checkbox = form.createCheckBox(`checkbox.${field.x}.${field.y}`);
          checkbox.addToPage(page, { x: field.x, y, width: field.width, height: field.height });
          break;
        case 'radio':
          let radioGroup = form.getRadioGroup(field.options.groupName);
          if (!radioGroup) {
            radioGroup = form.createRadioGroup(field.options.groupName);
          }
          radioGroup.addOptionToPage(`option.${field.x}.${field.y}`, page, { x: field.x, y, width: field.width, height: field.height });
          break;
      }
    });

    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'form.pdf';
    link.click();
  });
};

const addTextField = (renderCallback) => {
  formFields.push(new FormField('text', currentPage, 50, 50, 200, 30));
  renderCallback();
};

const addCheckbox = (renderCallback) => {
  formFields.push(new FormField('checkbox', currentPage, 50, 100, 20, 20));
  renderCallback();
};

let radioGroupCounter = 1;
const addRadioGroup = (renderCallback) => {
  const modal = document.getElementById('radio-group-modal');
  const nameInput = document.getElementById('radio-group-name');
  const confirmBtn = document.getElementById('confirm-radio-group');
  const cancelBtn = document.getElementById('cancel-radio-group');

  nameInput.value = `radio-group-${radioGroupCounter}`;
  modal.classList.remove('hidden');

  const onConfirm = () => {
    const groupName = nameInput.value;
    if (groupName) {
      formFields.push(new FormField('radio', currentPage, 50, 150, 20, 20, { groupName }));
      formFields.push(new FormField('radio', currentPage, 50, 180, 20, 20, { groupName }));
      radioGroupCounter++;
      renderCallback();
    }
    modal.classList.add('hidden');
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
  };

  const onCancel = () => {
    modal.classList.add('hidden');
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
  };

  confirmBtn.addEventListener('click', onConfirm);
  cancelBtn.addEventListener('click', onCancel);
};

export const formLogic = {
    setup: setupFormInterface,
};
