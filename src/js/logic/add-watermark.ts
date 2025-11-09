import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  readFileAsArrayBuffer,
  hexToRgb,
} from '../utils/helpers.js';
import { state, resetState } from '../state.js';

import {
  PDFDocument as PDFLibDocument,
  rgb,
  degrees,
  StandardFonts,
} from 'pdf-lib';

export function setupWatermarkUI() {
  const watermarkTypeRadios = document.querySelectorAll(
    'input[name="watermark-type"]'
  );
  const textOptions = document.getElementById('text-watermark-options');
  const imageOptions = document.getElementById('image-watermark-options');

  watermarkTypeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => { 
      if (e.target.value === 'text') {
        textOptions.classList.remove('hidden');
        imageOptions.classList.add('hidden');
      } else {
        textOptions.classList.add('hidden');
        imageOptions.classList.remove('hidden');
      }
    });
  });

  const opacitySliderText = document.getElementById('opacity-text');
  const opacityValueText = document.getElementById('opacity-value-text');
  const angleSliderText = document.getElementById('angle-text');
  const angleValueText = document.getElementById('angle-value-text');

  opacitySliderText.addEventListener(
    'input',
    () =>
      (opacityValueText.textContent = (
        opacitySliderText as HTMLInputElement
      ).value)
  );

  angleSliderText.addEventListener(
    'input',
    () =>
      (angleValueText.textContent = (angleSliderText as HTMLInputElement).value)
  );

  const opacitySliderImage = document.getElementById('opacity-image');
  const opacityValueImage = document.getElementById('opacity-value-image');
  const angleSliderImage = document.getElementById('angle-image');
  const angleValueImage = document.getElementById('angle-value-image');

  opacitySliderImage.addEventListener(
    'input',
    () =>
      (opacityValueImage.textContent = (
        opacitySliderImage as HTMLInputElement
      ).value)
  );

  angleSliderImage.addEventListener(
    'input',
    () =>
      (angleValueImage.textContent = (
        angleSliderImage as HTMLInputElement
      ).value)
  );
}

export async function addWatermark() {
  const watermarkType = (
    document.querySelector(
      'input[name="watermark-type"]:checked'
    ) as HTMLInputElement
  ).value;

  showLoader('Adding watermark...');

  try {
    const pages = state.pdfDoc.getPages();
    let watermarkAsset = null;

    if (watermarkType === 'text') {
      watermarkAsset = await state.pdfDoc.embedFont(StandardFonts.Helvetica);
    } else {
      // 'image'
      const imageFile = (
        document.getElementById('image-watermark-input') as HTMLInputElement
      ).files?.[0];
      if (!imageFile)
        throw new Error('Please select an image file for the watermark.');

      const imageBytes = await readFileAsArrayBuffer(imageFile);
      if (imageFile.type === 'image/png') {
        watermarkAsset = await state.pdfDoc.embedPng(imageBytes);
      } else if (imageFile.type === 'image/jpeg') {
        watermarkAsset = await state.pdfDoc.embedJpg(imageBytes);
      } else {
        throw new Error(
          'Unsupported Image. Please use a PNG or JPG for the watermark.'
        );
      }
    }

    for (const page of pages) {
      const { width, height } = page.getSize();

      if (watermarkType === 'text') {
        // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
        const text = document.getElementById('watermark-text').value;
        if (!text.trim())
          throw new Error('Please enter text for the watermark.');

        const fontSize =
          parseInt(
            (document.getElementById('font-size') as HTMLInputElement).value
          ) || 72;
        const angle =
          parseInt(
            (document.getElementById('angle-text') as HTMLInputElement).value
          ) || 0;
        const opacity =
          parseFloat(
            (document.getElementById('opacity-text') as HTMLInputElement).value
          ) || 0.3;
        const colorHex = (
          document.getElementById('text-color') as HTMLInputElement
        ).value;
        const textColor = hexToRgb(colorHex);
        const textWidth = watermarkAsset.widthOfTextAtSize(text, fontSize);

        page.drawText(text, {
          x: (width - textWidth) / 2,
          y: height / 2,
          font: watermarkAsset,
          size: fontSize,
          color: rgb(textColor.r, textColor.g, textColor.b),
          opacity: opacity,
          rotate: degrees(angle),
        });
      } else {
        const angle =
          parseInt(
            (document.getElementById('angle-image') as HTMLInputElement).value
          ) || 0;
        const opacity =
          parseFloat(
            (document.getElementById('opacity-image') as HTMLInputElement).value
          ) || 0.3;

        const scale = 0.5;
        const imgWidth = watermarkAsset.width * scale;
        const imgHeight = watermarkAsset.height * scale;

        page.drawImage(watermarkAsset, {
          x: (width - imgWidth) / 2,
          y: (height - imgHeight) / 2,
          width: imgWidth,
          height: imgHeight,
          opacity: opacity,
          rotate: degrees(angle),
        });
      }
    }

    const newPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([newPdfBytes], { type: 'application/pdf' }),
      'watermarked.pdf'
    );

    const toolid = state.activeTool;
    resetState();
    if (toolid) {
      const element = document.querySelector(
        `[data-tool-id="${toolid}"]`
      ) as HTMLElement;
      if (element) element.click();
    }
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      e.message || 'Could not add the watermark. Please check your inputs.'
    );
  } finally {
    hideLoader();
  }
}
