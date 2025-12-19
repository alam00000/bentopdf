import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes, hexToRgb } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import { getFontForLanguage, getLanguageForChar } from '../utils/font-loader.js';
import { languageToFontFamily } from '../config/font-mappings.js';
import fontkit from '@pdf-lib/fontkit';

let files: File[] = [];
let currentMode: 'upload' | 'text' = 'upload';
let selectedLanguages: string[] = ['eng'];

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

const updateUI = () => {
    const fileDisplayArea = document.getElementById('file-display-area');
    const fileControls = document.getElementById('file-controls');
    const dropZone = document.getElementById('drop-zone');

    if (!fileDisplayArea || !fileControls || !dropZone) return;

    fileDisplayArea.innerHTML = '';

    if (files.length > 0 && currentMode === 'upload') {
        dropZone.classList.add('hidden');
        fileControls.classList.remove('hidden');

        files.forEach((file, index) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

            const infoSpan = document.createElement('span');
            infoSpan.className = 'truncate font-medium text-gray-200';
            infoSpan.textContent = file.name;

            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'text-gray-400 text-xs ml-2';
            sizeSpan.textContent = `(${formatBytes(file.size)})`;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'ml-4 text-red-400 hover:text-red-300';
            removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
            removeBtn.onclick = () => {
                files = files.filter((_, i) => i !== index);
                updateUI();
            };

            fileDiv.append(infoSpan, sizeSpan, removeBtn);
            fileDisplayArea.appendChild(fileDiv);
        });
        createIcons({ icons });
    } else {
        dropZone.classList.remove('hidden');
        fileControls.classList.add('hidden');
    }
};

const resetState = () => {
    files = [];
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
    if (fileInput) fileInput.value = '';
    if (textInput) textInput.value = '';
    updateUI();
};

async function createPdfFromText(
    text: string,
    fontSize: number,
    pageSizeKey: string,
    colorHex: string,
    orientation: string,
    customWidth?: number,
    customHeight?: number
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

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
        : (PageSizes as any)[pageSizeKey];

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
                if (selectedLanguages.includes(charLang)) {
                    wordLang = charLang;
                    break;
                }
            }

            const font = fontMap.get(wordLang) || fontMap.get('eng') || fallbackFont;
            const wordWidth = font.widthOfTextAtSize(word + ' ', fontSize);

            if (currentLineWidth + wordWidth > textWidth && currentLineWords.length > 0) {
                currentLineWords.forEach((item, idx) => {
                    const x = margin + (currentLineWidth * idx / currentLineWords.length);
                    page.drawText(item.text, {
                        x: margin + (currentLineWidth - textWidth) / 2,
                        y: y,
                        size: fontSize,
                        font: item.font,
                        color: rgb(textColor.r / 255, textColor.g / 255, textColor.b / 255),
                    });
                });

                currentLineWords = [];
                currentLineWidth = 0;
                y -= lineHeight;

                if (y < margin) {
                    page = pdfDoc.addPage(pageSize);
                    y = page.getHeight() - margin;
                }
            }

            currentLineWords.push({ text: word + ' ', font });
            currentLineWidth += wordWidth;
        }

        if (currentLineWords.length > 0) {
            let x = margin;
            currentLineWords.forEach((item) => {
                page.drawText(item.text, {
                    x: x,
                    y: y,
                    size: fontSize,
                    font: item.font,
                    color: rgb(textColor.r / 255, textColor.g / 255, textColor.b / 255),
                });
                x += item.font.widthOfTextAtSize(item.text, fontSize);
            });

            y -= lineHeight;
            if (y < margin) {
                page = pdfDoc.addPage(pageSize);
                y = page.getHeight() - margin;
            }
        }
    }

    return await pdfDoc.save();
}

async function convert() {
    const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement).value) || 12;
    const pageSizeKey = (document.getElementById('page-size') as HTMLSelectElement).value;
    const colorHex = (document.getElementById('text-color') as HTMLInputElement).value;
    const orientation = (document.getElementById('page-orientation') as HTMLSelectElement).value;
    const customWidth = parseInt((document.getElementById('custom-width') as HTMLInputElement)?.value);
    const customHeight = parseInt((document.getElementById('custom-height') as HTMLInputElement)?.value);

    if (currentMode === 'upload' && files.length === 0) {
        showAlert('No Files', 'Please select at least one text file.');
        return;
    }

    if (currentMode === 'text') {
        const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
        if (!textInput.value.trim()) {
            showAlert('No Text', 'Please enter some text to convert.');
            return;
        }
    }

    showLoader('Creating PDF...');
    try {
        if (currentMode === 'upload') {
            let combinedText = '';
            for (const file of files) {
                const text = await file.text();
                combinedText += text + '\n\n';
            }

            const pdfBytes = await createPdfFromText(
                combinedText,
                fontSize,
                pageSizeKey,
                colorHex,
                orientation,
                customWidth,
                customHeight
            );

            downloadFile(
                new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
                'from_text.pdf'
            );
        } else {
            const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
            const pdfBytes = await createPdfFromText(
                textInput.value,
                fontSize,
                pageSizeKey,
                colorHex,
                orientation,
                customWidth,
                customHeight
            );

            downloadFile(
                new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
                'from_text.pdf'
            );
        }

        showAlert('Success', 'Text converted to PDF successfully!', 'success', () => {
            resetState();
        });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'Failed to convert text to PDF.');
    } finally {
        hideLoader();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');
    const uploadModeBtn = document.getElementById('txt-mode-upload-btn');
    const textModeBtn = document.getElementById('txt-mode-text-btn');
    const uploadPanel = document.getElementById('txt-upload-panel');
    const textPanel = document.getElementById('txt-text-panel');
    const pageSizeSelect = document.getElementById('page-size') as HTMLSelectElement;
    const customSizeContainer = document.getElementById('custom-size-container');
    const langDropdownBtn = document.getElementById('lang-dropdown-btn');
    const langDropdownContent = document.getElementById('lang-dropdown-content');
    const langSearch = document.getElementById('lang-search') as HTMLInputElement;
    const langContainer = document.getElementById('language-list-container');

    // Back to Tools
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    // Mode switching
    if (uploadModeBtn && textModeBtn && uploadPanel && textPanel) {
        uploadModeBtn.addEventListener('click', () => {
            currentMode = 'upload';
            uploadModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
            uploadModeBtn.classList.add('bg-indigo-600', 'text-white');
            textModeBtn.classList.remove('bg-indigo-600', 'text-white');
            textModeBtn.classList.add('bg-gray-700', 'text-gray-300');
            uploadPanel.classList.remove('hidden');
            textPanel.classList.add('hidden');
        });

        textModeBtn.addEventListener('click', () => {
            currentMode = 'text';
            textModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
            textModeBtn.classList.add('bg-indigo-600', 'text-white');
            uploadModeBtn.classList.remove('bg-indigo-600', 'text-white');
            uploadModeBtn.classList.add('bg-gray-700', 'text-gray-300');
            textPanel.classList.remove('hidden');
            uploadPanel.classList.add('hidden');
        });
    }

    // Custom page size toggle
    if (pageSizeSelect && customSizeContainer) {
        pageSizeSelect.addEventListener('change', () => {
            if (pageSizeSelect.value === 'Custom') {
                customSizeContainer.classList.remove('hidden');
            } else {
                customSizeContainer.classList.add('hidden');
            }
        });
    }

    // Language dropdown
    if (langDropdownBtn && langDropdownContent && langContainer) {
        // Populate language list
        allLanguages.forEach(lang => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = lang.code;
            checkbox.className = 'w-4 h-4';
            checkbox.checked = lang.code === 'eng';

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (!selectedLanguages.includes(lang.code)) {
                        selectedLanguages.push(lang.code);
                    }
                } else {
                    selectedLanguages = selectedLanguages.filter(l => l !== lang.code);
                }
                updateLanguageDisplay();
            });

            const span = document.createElement('span');
            span.textContent = lang.name;
            span.className = 'text-sm text-gray-300';

            label.append(checkbox, span);
            langContainer.appendChild(label);
        });

        langDropdownBtn.addEventListener('click', () => {
            langDropdownContent.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!langDropdownBtn.contains(e.target as Node) && !langDropdownContent.contains(e.target as Node)) {
                langDropdownContent.classList.add('hidden');
            }
        });

        if (langSearch) {
            langSearch.addEventListener('input', () => {
                const searchTerm = langSearch.value.toLowerCase();
                const labels = langContainer.querySelectorAll('label');
                labels.forEach(label => {
                    const text = label.textContent?.toLowerCase() || '';
                    if (text.includes(searchTerm)) {
                        (label as HTMLElement).style.display = 'flex';
                    } else {
                        (label as HTMLElement).style.display = 'none';
                    }
                });
            });
        }
    }

    function updateLanguageDisplay() {
        const langDropdownText = document.getElementById('lang-dropdown-text');
        if (langDropdownText) {
            const selectedNames = selectedLanguages.map(code => {
                const lang = allLanguages.find(l => l.code === code);
                return lang?.name || code;
            });
            langDropdownText.textContent = selectedNames.length > 0 ? selectedNames.join(', ') : 'Select Languages';
        }
    }

    // File handling
    const handleFileSelect = (newFiles: FileList | null) => {
        if (!newFiles || newFiles.length === 0) return;
        const validFiles = Array.from(newFiles).filter(
            (file) => file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain'
        );

        if (validFiles.length < newFiles.length) {
            showAlert('Invalid Files', 'Some files were skipped. Only text files are allowed.');
        }

        if (validFiles.length > 0) {
            files = [...files, ...validFiles];
            updateUI();
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

    if (addMoreBtn && fileInput) {
        addMoreBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', () => {
            files = [];
            updateUI();
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', convert);
    }

    createIcons({ icons });
});
