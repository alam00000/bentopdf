// NOTE: This is a work in progress and does not work correctly as of yet
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';

export async function wordToPdf() {
  const file = state.files[0];
  if (!file) {
    showAlert('No File', 'Please upload a .docx file first.');
    return;
  }

  showLoader('Preparing preview...');

  try {
    const mammothOptions = {
      // @ts-expect-error TS(2304) FIXME: Cannot find name 'mammoth'.
      convertImage: mammoth.images.inline((element: any) => {
        return element.read('base64').then((imageBuffer: any) => {
          return {
            src: `data:${element.contentType};base64,${imageBuffer}`,
          };
        });
      }),
    };
    const arrayBuffer = await readFileAsArrayBuffer(file);
    // @ts-expect-error TS(2304) FIXME: Cannot find name 'mammoth'.
    const { value: html } = await mammoth.convertToHtml(
      { arrayBuffer },
      mammothOptions
    );

    // Get references to our modal elements from index.html
    const previewModal = document.getElementById('preview-modal');
    const previewContent = document.getElementById('preview-content');
    const downloadBtn = document.getElementById('preview-download-btn');
    const closeBtn = document.getElementById('preview-close-btn');

    const styledHtml = `
            <style>
                #preview-content { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: black; }
                #preview-content table { border-collapse: collapse; width: 100%; }
                #preview-content td, #preview-content th { border: 1px solid #dddddd; text-align: left; padding: 8px; }
                #preview-content img { max-width: 100%; height: auto; }
                #preview-content a { color: #0000ee; text-decoration: underline; }
            </style>
            ${html}
        `;
    previewContent.innerHTML = styledHtml;

    const marginDiv = document.createElement('div');
    marginDiv.style.height = '100px';
    previewContent.appendChild(marginDiv);

    const images = previewContent.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        // @ts-expect-error TS(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
        if (img.complete) resolve();
        else img.onload = resolve;
      });
    });
    await Promise.all(imagePromises);

    previewModal.classList.remove('hidden');
    hideLoader();

    const downloadHandler = async () => {
      showLoader('Generating High-Quality PDF...');

      // @ts-expect-error TS(2339) FIXME: Property 'jspdf' does not exist on type 'Window & ... Remove this comment to see the full error message
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'letter',
      });

      await doc.html(previewContent, {
        callback: function (doc: any) {
          const links = previewContent.querySelectorAll('a');
          const pageHeight = doc.internal.pageSize.getHeight();
          const containerRect = previewContent.getBoundingClientRect(); // Get container's position

          links.forEach((link) => {
            if (!link.href) return;

            const linkRect = link.getBoundingClientRect();

            // Calculate position relative to the preview container's top-left
            const relativeX = linkRect.left - containerRect.left;
            const relativeY = linkRect.top - containerRect.top;

            const pageNum = Math.floor(relativeY / pageHeight) + 1;
            const yOnPage = relativeY % pageHeight;

            doc.setPage(pageNum);
            try {
              doc.link(
                relativeX + 45,
                yOnPage + 45,
                linkRect.width,
                linkRect.height,
                { url: link.href }
              );
            } catch (e) {
              console.warn('Could not add link:', link.href, e);
            }
          });

          const outputFileName = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
          doc.save(outputFileName);
          hideLoader();
        },
        autoPaging: 'slice',
        x: 45,
        y: 45,
        width: 522,
        windowWidth: previewContent.scrollWidth,
      });
    };

    const closeHandler = () => {
      previewModal.classList.add('hidden');
      previewContent.innerHTML = '';
      downloadBtn.removeEventListener('click', downloadHandler);
      closeBtn.removeEventListener('click', closeHandler);
    };

    downloadBtn.addEventListener('click', downloadHandler);
    closeBtn.addEventListener('click', closeHandler);
  } catch (e) {
    console.error(e);
    hideLoader();
    showAlert(
      'Preview Error',
      `Could not generate a preview. The file may be corrupt or contain unsupported features. Error: ${e.message}`
    );
  }
}
