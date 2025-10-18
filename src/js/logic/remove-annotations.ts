import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFName } from 'pdf-lib';

export function setupRemoveAnnotationsTool() {
  if (state.pdfDoc) {
    document.getElementById('total-pages').textContent =
      state.pdfDoc.getPageCount();
  }

  const pageScopeRadios = document.querySelectorAll('input[name="page-scope"]');
  const pageRangeWrapper = document.getElementById('page-range-wrapper');
  pageScopeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'Element'.
      pageRangeWrapper.classList.toggle('hidden', radio.value !== 'specific');
    });
  });

  const selectAllCheckbox = document.getElementById('select-all-annotations');
  const allAnnotCheckboxes = document.querySelectorAll('.annot-checkbox');
  selectAllCheckbox.addEventListener('change', () => {
    allAnnotCheckboxes.forEach((checkbox) => {
      // @ts-expect-error TS(2339) FIXME: Property 'checked' does not exist on type 'Element... Remove this comment to see the full error message
      checkbox.checked = selectAllCheckbox.checked;
    });
  });
}

export async function removeAnnotations() {
  showLoader('Removing annotations...');
  try {
    const totalPages = state.pdfDoc.getPageCount();
    let targetPageIndices = [];

    const pageScope = (
      document.querySelector(
        'input[name="page-scope"]:checked'
      ) as HTMLInputElement
    ).value;
    if (pageScope === 'all') {
      targetPageIndices = Array.from({ length: totalPages }, (_, i) => i);
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      const rangeInput = document.getElementById('page-range-input').value;
      if (!rangeInput.trim()) throw new Error('Please enter a page range.');
      const ranges = rangeInput.split(',');
      for (const range of ranges) {
        const trimmedRange = range.trim();
        if (trimmedRange.includes('-')) {
          const [start, end] = trimmedRange.split('-').map(Number);
          if (
            isNaN(start) ||
            isNaN(end) ||
            start < 1 ||
            end > totalPages ||
            start > end
          )
            continue;
          for (let i = start; i <= end; i++) targetPageIndices.push(i - 1);
        } else {
          const pageNum = Number(trimmedRange);
          if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) continue;
          targetPageIndices.push(pageNum - 1);
        }
      }
      targetPageIndices = [...new Set(targetPageIndices)];
    }

    if (targetPageIndices.length === 0)
      throw new Error('No valid pages were selected.');

    const typesToRemove = new Set(
      Array.from(document.querySelectorAll('.annot-checkbox:checked')).map(
        (cb) => (cb as HTMLInputElement).value
      )
    );

    if (typesToRemove.size === 0)
      throw new Error('Please select at least one annotation type to remove.');

    const pages = state.pdfDoc.getPages();

    for (const pageIndex of targetPageIndices) {
      const page = pages[pageIndex];
      const annotRefs = page.node.Annots()?.asArray() || [];

      const annotsToKeep = [];

      for (const ref of annotRefs) {
        const annot = state.pdfDoc.context.lookup(ref);
        const subtype = annot
          .get(PDFName.of('Subtype'))
          ?.toString()
          .substring(1);

        // If the subtype is NOT in the list to remove, add it to our new array
        if (!subtype || !typesToRemove.has(subtype)) {
          annotsToKeep.push(ref);
        }
      }

      if (annotsToKeep.length > 0) {
        const newAnnotsArray = state.pdfDoc.context.obj(annotsToKeep);
        page.node.set(PDFName.of('Annots'), newAnnotsArray);
      } else {
        page.node.delete(PDFName.of('Annots'));
      }
    }

    const newPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([newPdfBytes], { type: 'application/pdf' }),
      'annotations-removed.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      e.message || 'Could not remove annotations. Please check your page range.'
    );
  } finally {
    hideLoader();
  }
}
