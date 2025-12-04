import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';
import { getFontForLanguage, getLanguageForChar } from '../utils/font-loader.js';
import { languageToFontFamily } from '../config/font-mappings.js';
import fontkit from '@pdf-lib/fontkit';

import {
  PDFDocument as PDFLibDocument,
  rgb,
  StandardFonts,
  PageSizes,
} from 'pdf-lib';

async function createPdfFromText(
  text: string,
  selectedLanguages: string[],
  fontSize: number,
  pageSizeKey: string,
  colorHex: string,
  orientation: string,
  customWidth?: number,
  customHeight?: number
): Promise<Uint8Array> {
  const pdfDoc = await PDFLibDocument.create();
  pdfDoc.registerFontkit(fontkit);

  console.log(`User selected languages: ${selectedLanguages.join(', ')}`);

  const fontMap = new Map<string, any>();
  const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  if (!selectedLanguages.includes('eng')) {
    selectedLanguages.push('eng');
  }

  for (const lang of selectedLanguages) {
    try {
      const fontBytes = await getFontForLanguage(lang);
      const font = await pdfDoc.embedFont(fontBytes, { subset: false });
      fontMap.set(lang, font);
    } catch (e) {
      console.warn(`Failed to load font for ${lang}, using fallback`, e);
      fontMap.set(lang, fallbackFont);
    }
  }

  let pageSize = pageSizeKey === 'Custom'
    ? [customWidth || 595, customHeight || 842] as [number, number]
    : PageSizes[pageSizeKey];

  if (orientation === 'landscape') {
    pageSize = [pageSize[1], pageSize[0]] as [number, number];
  }
  const margin = 72;
  const textColor = hexToRgb(colorHex);

  let page = pdfDoc.addPage(pageSize);
  let { width, height } = page.getSize();
  const textWidth = width - margin * 2;
  const lineHeight = fontSize * 1.3;
  let y = height - margin;

  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      y -= lineHeight;
      if (y < margin) {
        page = pdfDoc.addPage(pageSize);
        y = page.getHeight() - margin;
      }
      continue;
    }

    const words = paragraph.split(' ');
    let currentLineWords: { text: string; font: any }[] = [];
    let currentLineWidth = 0;

    for (const word of words) {
      let wordLang = 'eng';

      for (const char of word) {
        const charLang = getLanguageForChar(char);

        if (charLang === 'chi_sim') {
          if (selectedLanguages.includes('jpn')) wordLang = 'jpn';
          else if (selectedLanguages.includes('kor')) wordLang = 'kor';
          else if (selectedLanguages.includes('chi_tra')) wordLang = 'chi_tra';
          else if (selectedLanguages.includes('chi_sim')) wordLang = 'chi_sim';
        } else if (selectedLanguages.includes(charLang)) {
          wordLang = charLang;
        }

        if (wordLang !== 'eng') break;
      }

      const font = fontMap.get(wordLang) || fontMap.get('eng') || fallbackFont;

      let wordWidth = 0;
      try {
        wordWidth = font.widthOfTextAtSize(word, fontSize);
      } catch (e) {
        console.warn(`Width calculation failed for "${word}"`, e);
        wordWidth = word.length * fontSize * 0.5;
      }

      let spaceWidth = 0;
      if (currentLineWords.length > 0) {
        try {
          spaceWidth = font.widthOfTextAtSize(' ', fontSize);
        } catch {
          spaceWidth = fontSize * 0.25;
        }
      }

      if (currentLineWidth + spaceWidth + wordWidth <= textWidth) {
        currentLineWords.push({ text: word, font });
        currentLineWidth += spaceWidth + wordWidth;
      } else {
        // Draw current line
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage(pageSize);
          y = page.getHeight() - margin;
        }

        let currentX = margin;
        for (let i = 0; i < currentLineWords.length; i++) {
          const w = currentLineWords[i];
          try {
            page.drawText(w.text, {
              x: currentX,
              y,
              font: w.font,
              size: fontSize,
              color: rgb(textColor.r, textColor.g, textColor.b),
            });

            const wWidth = w.font.widthOfTextAtSize(w.text, fontSize);
            currentX += wWidth;

            if (i < currentLineWords.length - 1) {
              const sWidth = w.font.widthOfTextAtSize(' ', fontSize);
              currentX += sWidth;
            }
          } catch (e) {
            console.warn(`Failed to draw word: "${w.text}"`, e);
          }
        }

        y -= lineHeight;

        currentLineWords = [{ text: word, font }];
        currentLineWidth = wordWidth;
      }
    }

    if (currentLineWords.length > 0) {
      if (y < margin + lineHeight) {
        page = pdfDoc.addPage(pageSize);
        y = page.getHeight() - margin;
      }

      let currentX = margin;
      for (let i = 0; i < currentLineWords.length; i++) {
        const w = currentLineWords[i];
        try {
          page.drawText(w.text, {
            x: currentX,
            y,
            font: w.font,
            size: fontSize,
            color: rgb(textColor.r, textColor.g, textColor.b),
          });

          const wWidth = w.font.widthOfTextAtSize(w.text, fontSize);
          currentX += wWidth;

          if (i < currentLineWords.length - 1) {
            const sWidth = w.font.widthOfTextAtSize(' ', fontSize);
            currentX += sWidth;
          }
        } catch (e) {
          console.warn(`Failed to draw word: "${w.text}"`, e);
        }
      }

      y -= lineHeight;
    }
  }

  return await pdfDoc.save();
}

export async function setupTxtToPdfTool() {
  const uploadBtn = document.getElementById('txt-mode-upload-btn');
  const textBtn = document.getElementById('txt-mode-text-btn');
  const uploadPanel = document.getElementById('txt-upload-panel');
  const textPanel = document.getElementById('txt-text-panel');

  if (!uploadBtn || !textBtn || !uploadPanel || !textPanel) return;

  const langContainer = document.getElementById('language-list-container');
  const dropdownBtn = document.getElementById('lang-dropdown-btn');
  const dropdownContent = document.getElementById('lang-dropdown-content');
  const dropdownText = document.getElementById('lang-dropdown-text');
  const searchInput = document.getElementById('lang-search');

  if (langContainer && langContainer.children.length === 0) {
    const allLanguages = Object.keys(languageToFontFamily).sort().map(code => {
      let name = code;
      try {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
        name = displayNames.of(code) || code;
      } catch (e) {
        console.warn(`Failed to get language name for ${code}`, e);
      }
      return { code, name: `${name} (${code})` };
    });

    const renderLanguages = (filter = '') => {
      langContainer.innerHTML = '';
      const lowerFilter = filter.toLowerCase();

      allLanguages.forEach(lang => {
        if (lang.name.toLowerCase().includes(lowerFilter) || lang.code.toLowerCase().includes(lowerFilter)) {
          const wrapper = document.createElement('div');
          wrapper.className = 'flex items-center hover:bg-gray-700 p-1 rounded';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = lang.code;
          checkbox.id = `lang-${lang.code}`;
          checkbox.className = 'w-4 h-4 text-indigo-600 bg-gray-600 border-gray-500 rounded focus:ring-indigo-500 ring-offset-gray-800';
          if (lang.code === 'eng') checkbox.checked = true;

          const label = document.createElement('label');
          label.htmlFor = `lang-${lang.code}`;
          label.className = 'ml-2 text-sm font-medium text-gray-300 w-full cursor-pointer';
          label.textContent = lang.name;

          checkbox.addEventListener('change', updateButtonText);

          wrapper.appendChild(checkbox);
          wrapper.appendChild(label);
          langContainer.appendChild(wrapper);
        }
      });
    };

    renderLanguages();

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const filter = (e.target as HTMLInputElement).value.toLowerCase();
        const items = langContainer.children;
        for (let i = 0; i < items.length; i++) {
          const item = items[i] as HTMLElement;
          const text = item.textContent?.toLowerCase() || '';
          if (text.includes(filter)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        }
      });
    }

    if (dropdownBtn && dropdownContent) {
      dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target as Node) && !dropdownContent.contains(e.target as Node)) {
          dropdownContent.classList.add('hidden');
        }
      });
    }

    function updateButtonText() {
      const checkboxes = langContainer?.querySelectorAll('input[type="checkbox"]:checked');
      const count = checkboxes?.length || 0;
      if (count === 0) {
        if (dropdownText) dropdownText.textContent = 'Select Languages';
      } else if (count === 1) {
        const text = checkboxes[0].nextElementSibling.textContent;
        if (dropdownText) dropdownText.textContent = text || '1 Language Selected';
      } else {
        if (dropdownText) dropdownText.textContent = `${count} Languages Selected`;
      }
    }
  }

  const switchToUpload = () => {
    uploadPanel.classList.remove('hidden');
    textPanel.classList.add('hidden');
    uploadBtn.classList.add('bg-indigo-600', 'text-white');
    uploadBtn.classList.remove('bg-gray-700', 'text-gray-300');
    textBtn.classList.remove('bg-indigo-600', 'text-white');
    textBtn.classList.add('bg-gray-700', 'text-gray-300');
  };

  const switchToText = () => {
    uploadPanel.classList.add('hidden');
    textPanel.classList.remove('hidden');
    textBtn.classList.add('bg-indigo-600', 'text-white');
    textBtn.classList.remove('bg-gray-700', 'text-gray-300');
    uploadBtn.classList.remove('bg-indigo-600', 'text-white');
    uploadBtn.classList.add('bg-gray-700', 'text-gray-300');
  };

  uploadBtn.addEventListener('click', switchToUpload);
  textBtn.addEventListener('click', switchToText);

  const pageSizeSelect = document.getElementById('page-size') as HTMLSelectElement;
  const customSizeContainer = document.getElementById('custom-size-container');

  if (pageSizeSelect && customSizeContainer) {
    pageSizeSelect.addEventListener('change', () => {
      if (pageSizeSelect.value === 'Custom') {
        customSizeContainer.classList.remove('hidden');
      } else {
        customSizeContainer.classList.add('hidden');
      }
    });
  }

  const processBtn = document.getElementById('process-btn');
  if (processBtn) {
    processBtn.onclick = txtToPdf;
  }
}

export async function txtToPdf() {
  const uploadPanel = document.getElementById('txt-upload-panel');
  const isUploadMode = !uploadPanel?.classList.contains('hidden');

  showLoader('Creating PDF...');
  try {
    const selectedLanguages: string[] = [];
    const langContainer = document.getElementById('language-list-container');
    if (langContainer) {
      const checkboxes = langContainer.querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach((cb) => {
        selectedLanguages.push((cb as HTMLInputElement).value);
      });
    }
    if (selectedLanguages.length === 0) selectedLanguages.push('eng'); // Fallback

    const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement)?.value) || 12;
    const pageSizeKey = (document.getElementById('page-size') as HTMLSelectElement)?.value;
    const orientation = (document.getElementById('page-orientation') as HTMLSelectElement)?.value || 'portrait';
    const colorHex = (document.getElementById('text-color') as HTMLInputElement)?.value;

    let customWidth: number | undefined;
    let customHeight: number | undefined;
    if (pageSizeKey === 'Custom') {
      customWidth = parseInt((document.getElementById('custom-width') as HTMLInputElement)?.value) || 595;
      customHeight = parseInt((document.getElementById('custom-height') as HTMLInputElement)?.value) || 842;
    }

    if (isUploadMode && state.files.length > 0) {
      if (state.files.length === 1) {
        const file = state.files[0];
        const text = (await file.text()).normalize('NFC');
        const pdfBytes = await createPdfFromText(
          text,
          selectedLanguages,
          fontSize,
          pageSizeKey,
          colorHex,
          orientation,
          customWidth,
          customHeight
        );
        const baseName = file.name.replace(/\.txt$/i, '');
        downloadFile(
          new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
          `${baseName}.pdf`
        );
      } else {
        showLoader('Creating PDFs and ZIP archive...');
        const zip = new JSZip();

        for (const file of state.files) {
          const text = (await file.text()).normalize('NFC');
          const pdfBytes = await createPdfFromText(
            text,
            selectedLanguages,
            fontSize,
            pageSizeKey,
            colorHex,
            orientation,
            customWidth,
            customHeight
          );
          const baseName = file.name.replace(/\.txt$/i, '');
          zip.file(`${baseName}.pdf`, pdfBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, 'text-to-pdf.zip');
      }
    } else {
      const text = ((document.getElementById('text-input') as HTMLTextAreaElement)?.value || '').normalize('NFC');
      if (!text.trim()) {
        showAlert('Input Required', 'Please enter some text to convert.');
        hideLoader();
        return;
      }

      const pdfBytes = await createPdfFromText(
        text,
        selectedLanguages,
        fontSize,
        pageSizeKey,
        colorHex,
        orientation,
        customWidth,
        customHeight
      );
      downloadFile(
        new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
        'text-document.pdf'
      );
    }
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to create PDF from text.');
  } finally {
    hideLoader();
  }
}
