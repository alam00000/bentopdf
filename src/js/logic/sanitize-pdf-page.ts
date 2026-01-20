import { showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { PDFDocument, PDFName } from 'pdf-lib';
import { icons, createIcons } from 'lucide';
import { SanitizePdfState } from '@/types';

const pageState: SanitizePdfState = {
    file: null,
    pdfDoc: null,
};

function removeMetadataFromDoc(pdfDoc: PDFDocument) {
    const infoDict = (pdfDoc as any).getInfoDict();
    const allKeys = infoDict.keys();
    allKeys.forEach((key: any) => {
        infoDict.delete(key);
    });

    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');

    try {
        const catalogDict = (pdfDoc.catalog as any).dict;
        if (catalogDict.has(PDFName.of('Metadata'))) {
            catalogDict.delete(PDFName.of('Metadata'));
        }
    } catch (e: any) {
        console.warn('Could not remove XMP metadata:', e.message);
    }

    try {
        const context = pdfDoc.context;
        if ((context as any).trailerInfo) {
            delete (context as any).trailerInfo.ID;
        }
    } catch (e: any) {
        console.warn('Could not remove document IDs:', e.message);
    }

    try {
        const catalogDict = (pdfDoc.catalog as any).dict;
        if (catalogDict.has(PDFName.of('PieceInfo'))) {
            catalogDict.delete(PDFName.of('PieceInfo'));
        }
    } catch (e: any) {
        console.warn('Could not remove PieceInfo:', e.message);
    }
}

function removeAnnotationsFromDoc(pdfDoc: PDFDocument) {
    const pages = pdfDoc.getPages();
    for (const page of pages) {
        try {
            page.node.delete(PDFName.of('Annots'));
        } catch (e: any) {
            console.warn('Could not remove annotations from page:', e.message);
        }
    }
}

function flattenFormsInDoc(pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();
    form.flatten();
}

function resetState() {
    pageState.file = null;
    pageState.pdfDoc = null;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

async function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const toolOptions = document.getElementById('tool-options');

    if (!fileDisplayArea) return;

    fileDisplayArea.innerHTML = '';

    if (pageState.file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col overflow-hidden';

        const nameSpan = document.createElement('div');
        nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
        nameSpan.textContent = pageState.file.name;

        const metaSpan = document.createElement('div');
        metaSpan.className = 'text-xs text-gray-400';
        metaSpan.textContent = formatBytes(pageState.file.size);

        infoContainer.append(nameSpan, metaSpan);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
        removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        removeBtn.onclick = function () {
            resetState();
        };

        fileDiv.append(infoContainer, removeBtn);
        fileDisplayArea.appendChild(fileDiv);
        createIcons({ icons });

        if (toolOptions) toolOptions.classList.remove('hidden');
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

async function handleFileSelect(files: FileList | null) {
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            pageState.file = file;

            // Load PDF for sanitization
            try {
                const arrayBuffer = await file.arrayBuffer();
                pageState.pdfDoc = await PDFDocument.load(arrayBuffer);
                updateUI();
            } catch (e) {
                console.error('Error loading PDF:', e);
                showAlert('Error', 'Failed to load PDF file.');
            }
        }
    }
}

async function sanitizePdf() {
    if (!pageState.pdfDoc) {
        showAlert('Error', 'No PDF document loaded.');
        return;
    }

    const loaderModal = document.getElementById('loader-modal');
    const loaderText = document.getElementById('loader-text');
    if (loaderModal) loaderModal.classList.remove('hidden');
    if (loaderText) loaderText.textContent = 'Sanitizing PDF...';

    try {
        const pdfDoc = pageState.pdfDoc;

        const shouldFlattenForms = (document.getElementById('flatten-forms') as HTMLInputElement).checked;
        const shouldRemoveMetadata = (document.getElementById('remove-metadata') as HTMLInputElement).checked;
        const shouldRemoveAnnotations = (document.getElementById('remove-annotations') as HTMLInputElement).checked;
        const shouldRemoveJavascript = (document.getElementById('remove-javascript') as HTMLInputElement).checked;
        const shouldRemoveEmbeddedFiles = (document.getElementById('remove-embedded-files') as HTMLInputElement).checked;
        const shouldRemoveLayers = (document.getElementById('remove-layers') as HTMLInputElement).checked;
        const shouldRemoveLinks = (document.getElementById('remove-links') as HTMLInputElement).checked;
        const shouldRemoveStructureTree = (document.getElementById('remove-structure-tree') as HTMLInputElement).checked;
        const shouldRemoveMarkInfo = (document.getElementById('remove-markinfo') as HTMLInputElement).checked;
        const shouldRemoveFonts = (document.getElementById('remove-fonts') as HTMLInputElement).checked;

        let changesMade = false;

        if (shouldFlattenForms) {
            try {
                flattenFormsInDoc(pdfDoc);
                changesMade = true;
            } catch (e: any) {
                console.warn(`Could not flatten forms: ${e.message}`);
                try {
                    const catalogDict = (pdfDoc.catalog as any).dict;
                    if (catalogDict.has(PDFName.of('AcroForm'))) {
                        catalogDict.delete(PDFName.of('AcroForm'));
                        changesMade = true;
                    }
                } catch (removeError: any) {
                    console.warn('Could not remove AcroForm:', removeError.message);
                }
            }
        }

        if (shouldRemoveMetadata) {
            removeMetadataFromDoc(pdfDoc);
            changesMade = true;
        }

        if (shouldRemoveAnnotations) {
            removeAnnotationsFromDoc(pdfDoc);
            changesMade = true;
        }

        if (shouldRemoveJavascript) {
            try {
                if ((pdfDoc as any).javaScripts && (pdfDoc as any).javaScripts.length > 0) {
                    (pdfDoc as any).javaScripts = [];
                    changesMade = true;
                }

                const catalogDict = (pdfDoc.catalog as any).dict;

                const namesRef = catalogDict.get(PDFName.of('Names'));
                if (namesRef) {
                    try {
                        const namesDict = pdfDoc.context.lookup(namesRef) as any;
                        if (namesDict.has(PDFName.of('JavaScript'))) {
                            namesDict.delete(PDFName.of('JavaScript'));
                            changesMade = true;
                        }
                    } catch (e: any) {
                        console.warn('Could not access Names/JavaScript:', e.message);
                    }
                }

                if (catalogDict.has(PDFName.of('OpenAction'))) {
                    catalogDict.delete(PDFName.of('OpenAction'));
                    changesMade = true;
                }

                if (catalogDict.has(PDFName.of('AA'))) {
                    catalogDict.delete(PDFName.of('AA'));
                    changesMade = true;
                }

                const pages = pdfDoc.getPages();
                for (const page of pages) {
                    try {
                        const pageDict = page.node;

                        if (pageDict.has(PDFName.of('AA'))) {
                            pageDict.delete(PDFName.of('AA'));
                            changesMade = true;
                        }

                        const annotRefs = pageDict.Annots()?.asArray() || [];
                        for (const annotRef of annotRefs) {
                            try {
                                const annot = pdfDoc.context.lookup(annotRef) as any;

                                if (annot.has(PDFName.of('A'))) {
                                    const actionRef = annot.get(PDFName.of('A'));
                                    try {
                                        const actionDict = pdfDoc.context.lookup(actionRef) as any;
                                        const actionType = actionDict
                                            .get(PDFName.of('S'))
                                            ?.toString()
                                            .substring(1);

                                        if (actionType === 'JavaScript') {
                                            annot.delete(PDFName.of('A'));
                                            changesMade = true;
                                        }
                                    } catch (e: any) {
                                        console.warn('Could not read action:', e.message);
                                    }
                                }

                                if (annot.has(PDFName.of('AA'))) {
                                    annot.delete(PDFName.of('AA'));
                                    changesMade = true;
                                }
                            } catch (e: any) {
                                console.warn('Could not process annotation for JS:', e.message);
                            }
                        }
                    } catch (e: any) {
                        console.warn('Could not remove page actions:', e.message);
                    }
                }

                try {
                    const acroFormRef = catalogDict.get(PDFName.of('AcroForm'));
                    if (acroFormRef) {
                        const acroFormDict = pdfDoc.context.lookup(acroFormRef) as any;
                        const fieldsRef = acroFormDict.get(PDFName.of('Fields'));

                        if (fieldsRef) {
                            const fieldsArray = pdfDoc.context.lookup(fieldsRef) as any;
                            const fields = fieldsArray.asArray();

                            for (const fieldRef of fields) {
                                try {
                                    const field = pdfDoc.context.lookup(fieldRef) as any;

                                    if (field.has(PDFName.of('A'))) {
                                        field.delete(PDFName.of('A'));
                                        changesMade = true;
                                    }

                                    if (field.has(PDFName.of('AA'))) {
                                        field.delete(PDFName.of('AA'));
                                        changesMade = true;
                                    }
                                } catch (e: any) {
                                    console.warn('Could not process field for JS:', e.message);
                                }
                            }
                        }
                    }
                } catch (e: any) {
                    console.warn('Could not process form fields for JS:', e.message);
                }
            } catch (e: any) {
                console.warn(`Could not remove JavaScript: ${e.message}`);
            }
        }

        if (shouldRemoveEmbeddedFiles) {
            try {
                const catalogDict = (pdfDoc.catalog as any).dict;

                const namesRef = catalogDict.get(PDFName.of('Names'));
                if (namesRef) {
                    try {
                        const namesDict = pdfDoc.context.lookup(namesRef) as any;
                        if (namesDict.has(PDFName.of('EmbeddedFiles'))) {
                            namesDict.delete(PDFName.of('EmbeddedFiles'));
                            changesMade = true;
                        }
                    } catch (e: any) {
                        console.warn('Could not access Names/EmbeddedFiles:', e.message);
                    }
                }

                if (catalogDict.has(PDFName.of('EmbeddedFiles'))) {
                    catalogDict.delete(PDFName.of('EmbeddedFiles'));
                    changesMade = true;
                }

                const pages = pdfDoc.getPages();
                for (const page of pages) {
                    try {
                        const annotRefs = page.node.Annots()?.asArray() || [];
                        const annotsToKeep = [];

                        for (const ref of annotRefs) {
                            try {
                                const annot = pdfDoc.context.lookup(ref) as any;
                                const subtype = annot
                                    .get(PDFName.of('Subtype'))
                                    ?.toString()
                                    .substring(1);

                                if (subtype !== 'FileAttachment') {
                                    annotsToKeep.push(ref);
                                } else {
                                    changesMade = true;
                                }
                            } catch (e) {
                                annotsToKeep.push(ref);
                            }
                        }

                        if (annotsToKeep.length !== annotRefs.length) {
                            if (annotsToKeep.length > 0) {
                                const newAnnotsArray = pdfDoc.context.obj(annotsToKeep);
                                page.node.set(PDFName.of('Annots'), newAnnotsArray);
                            } else {
                                page.node.delete(PDFName.of('Annots'));
                            }
                        }
                    } catch (pageError: any) {
                        console.warn(
                            `Could not process page for attachments: ${pageError.message}`
                        );
                    }
                }

                if ((pdfDoc as any).embeddedFiles && (pdfDoc as any).embeddedFiles.length > 0) {
                    (pdfDoc as any).embeddedFiles = [];
                    changesMade = true;
                }

                if (catalogDict.has(PDFName.of('Collection'))) {
                    catalogDict.delete(PDFName.of('Collection'));
                    changesMade = true;
                }
            } catch (e: any) {
                console.warn(`Could not remove embedded files: ${e.message}`);
            }
        }

        if (shouldRemoveLayers) {
            try {
                const catalogDict = (pdfDoc.catalog as any).dict;

                if (catalogDict.has(PDFName.of('OCProperties'))) {
                    catalogDict.delete(PDFName.of('OCProperties'));
                    changesMade = true;
                }

                const pages = pdfDoc.getPages();
                for (const page of pages) {
                    try {
                        const pageDict = page.node;

                        if (pageDict.has(PDFName.of('OCProperties'))) {
                            pageDict.delete(PDFName.of('OCProperties'));
                            changesMade = true;
                        }

                        const resourcesRef = pageDict.get(PDFName.of('Resources'));
                        if (resourcesRef) {
                            try {
                                const resourcesDict = pdfDoc.context.lookup(resourcesRef) as any;
                                if (resourcesDict.has(PDFName.of('Properties'))) {
                                    resourcesDict.delete(PDFName.of('Properties'));
                                    changesMade = true;
                                }
                            } catch (e: any) {
                                console.warn('Could not access Resources:', e.message);
                            }
                        }
                    } catch (e: any) {
                        console.warn('Could not remove page layers:', e.message);
                    }
                }
            } catch (e: any) {
                console.warn(`Could not remove layers: ${e.message}`);
            }
        }

        if (shouldRemoveLinks) {
            try {
                const pages = pdfDoc.getPages();

                for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
                    try {
                        const page = pages[pageIndex];
                        const pageDict = page.node;

                        const annotsRef = pageDict.get(PDFName.of('Annots'));
                        if (!annotsRef) continue;

                        const annotsArray = pdfDoc.context.lookup(annotsRef) as any;
                        const annotRefs = annotsArray.asArray();

                        if (annotRefs.length === 0) continue;

                        const annotsToKeep = [];
                        let linksRemoved = 0;

                        for (const ref of annotRefs) {
                            try {
                                const annot = pdfDoc.context.lookup(ref) as any;
                                const subtype = annot
                                    .get(PDFName.of('Subtype'))
                                    ?.toString()
                                    .substring(1);

                                let isLink = false;

                                if (subtype === 'Link') {
                                    isLink = true;
                                    linksRemoved++;
                                } else {
                                    const actionRef = annot.get(PDFName.of('A'));
                                    if (actionRef) {
                                        try {
                                            const actionDict = pdfDoc.context.lookup(actionRef) as any;
                                            const actionType = actionDict
                                                .get(PDFName.of('S'))
                                                ?.toString()
                                                .substring(1);

                                            if (
                                                actionType === 'URI' ||
                                                actionType === 'Launch' ||
                                                actionType === 'GoTo' ||
                                                actionType === 'GoToR'
                                            ) {
                                                isLink = true;
                                                linksRemoved++;
                                            }
                                        } catch (e: any) {
                                            console.warn('Could not read action:', e.message);
                                        }
                                    }

                                    const dest = annot.get(PDFName.of('Dest'));
                                    if (dest && !isLink) {
                                        isLink = true;
                                        linksRemoved++;
                                    }
                                }

                                if (!isLink) {
                                    annotsToKeep.push(ref);
                                }
                            } catch (e: any) {
                                console.warn('Could not process annotation:', e.message);
                                annotsToKeep.push(ref);
                            }
                        }

                        if (linksRemoved > 0) {
                            if (annotsToKeep.length > 0) {
                                const newAnnotsArray = pdfDoc.context.obj(annotsToKeep);
                                pageDict.set(PDFName.of('Annots'), newAnnotsArray);
                            } else {
                                pageDict.delete(PDFName.of('Annots'));
                            }
                            changesMade = true;
                        }
                    } catch (pageError: any) {
                        console.warn(
                            `Could not process page ${pageIndex + 1} for links: ${pageError.message}`
                        );
                    }
                }

                try {
                    const catalogDict = (pdfDoc.catalog as any).dict;
                    const namesRef = catalogDict.get(PDFName.of('Names'));
                    if (namesRef) {
                        try {
                            const namesDict = pdfDoc.context.lookup(namesRef) as any;
                            if (namesDict.has(PDFName.of('Dests'))) {
                                namesDict.delete(PDFName.of('Dests'));
                                changesMade = true;
                            }
                        } catch (e: any) {
                            console.warn('Could not access Names/Dests:', e.message);
                        }
                    }

                    if (catalogDict.has(PDFName.of('Dests'))) {
                        catalogDict.delete(PDFName.of('Dests'));
                        changesMade = true;
                    }
                } catch (e: any) {
                    console.warn('Could not remove named destinations:', e.message);
                }
            } catch (e: any) {
                console.warn(`Could not remove links: ${e.message}`);
            }
        }

        if (shouldRemoveStructureTree) {
            try {
                const catalogDict = (pdfDoc.catalog as any).dict;

                if (catalogDict.has(PDFName.of('StructTreeRoot'))) {
                    catalogDict.delete(PDFName.of('StructTreeRoot'));
                    changesMade = true;
                }

                const pages = pdfDoc.getPages();
                for (const page of pages) {
                    try {
                        const pageDict = page.node;
                        if (pageDict.has(PDFName.of('StructParents'))) {
                            pageDict.delete(PDFName.of('StructParents'));
                            changesMade = true;
                        }
                    } catch (e: any) {
                        console.warn('Could not remove page StructParents:', e.message);
                    }
                }

                if (catalogDict.has(PDFName.of('ParentTree'))) {
                    catalogDict.delete(PDFName.of('ParentTree'));
                    changesMade = true;
                }
            } catch (e: any) {
                console.warn(`Could not remove structure tree: ${e.message}`);
            }
        }

        if (shouldRemoveMarkInfo) {
            try {
                const catalogDict = (pdfDoc.catalog as any).dict;

                if (catalogDict.has(PDFName.of('MarkInfo'))) {
                    catalogDict.delete(PDFName.of('MarkInfo'));
                    changesMade = true;
                }

                if (catalogDict.has(PDFName.of('Marked'))) {
                    catalogDict.delete(PDFName.of('Marked'));
                    changesMade = true;
                }
            } catch (e: any) {
                console.warn(`Could not remove MarkInfo: ${e.message}`);
            }
        }

        if (shouldRemoveFonts) {
            try {
                const pages = pdfDoc.getPages();

                for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
                    try {
                        const page = pages[pageIndex];
                        const pageDict = page.node;
                        const resourcesRef = pageDict.get(PDFName.of('Resources'));

                        if (resourcesRef) {
                            try {
                                const resourcesDict = pdfDoc.context.lookup(resourcesRef) as any;

                                if (resourcesDict.has(PDFName.of('Font'))) {
                                    const fontRef = resourcesDict.get(PDFName.of('Font'));

                                    try {
                                        const fontDict = pdfDoc.context.lookup(fontRef) as any;
                                        const fontKeys = fontDict.keys();

                                        for (const fontKey of fontKeys) {
                                            try {
                                                const specificFontRef = fontDict.get(fontKey);
                                                const specificFont =
                                                    pdfDoc.context.lookup(specificFontRef) as any;

                                                if (specificFont.has(PDFName.of('FontDescriptor'))) {
                                                    const descriptorRef = specificFont.get(
                                                        PDFName.of('FontDescriptor')
                                                    );
                                                    const descriptor =
                                                        pdfDoc.context.lookup(descriptorRef) as any;

                                                    const fontFileKeys = [
                                                        'FontFile',
                                                        'FontFile2',
                                                        'FontFile3',
                                                    ];
                                                    for (const key of fontFileKeys) {
                                                        if (descriptor.has(PDFName.of(key))) {
                                                            descriptor.delete(PDFName.of(key));
                                                            changesMade = true;
                                                        }
                                                    }
                                                }
                                            } catch (e: any) {
                                                console.warn(
                                                    `Could not process font ${fontKey}:`,
                                                    e.message
                                                );
                                            }
                                        }
                                    } catch (e: any) {
                                        console.warn(
                                            'Could not access font dictionary:',
                                            e.message
                                        );
                                    }
                                }
                            } catch (e: any) {
                                console.warn(
                                    'Could not access Resources for fonts:',
                                    e.message
                                );
                            }
                        }
                    } catch (e: any) {
                        console.warn(
                            `Could not remove fonts from page ${pageIndex + 1}:`,
                            e.message
                        );
                    }
                }

                if ((pdfDoc as any).fonts && (pdfDoc as any).fonts.length > 0) {
                    (pdfDoc as any).fonts = [];
                    changesMade = true;
                }
            } catch (e: any) {
                console.warn(`Could not remove fonts: ${e.message}`);
            }
        }

        if (!changesMade) {
            showAlert(
                'No Changes',
                'No items were selected for removal or none were found in the PDF.'
            );
            if (loaderModal) loaderModal.classList.add('hidden');
            return;
        }

        const sanitizedPdfBytes = await pdfDoc.save();
        downloadFile(
            new Blob([sanitizedPdfBytes as BlobPart], { type: 'application/pdf' }),
            'sanitized.pdf'
        );
        showAlert('Success', 'PDF has been sanitized and downloaded.', 'success', () => { resetState(); });
    } catch (e: any) {
        console.error('Sanitization Error:', e);
        showAlert('Error', `An error occurred during sanitization: ${e.message}`);
    } finally {
        if (loaderModal) loaderModal.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    if (fileInput && dropZone) {
        fileInput.addEventListener('change', function (e) {
            handleFileSelect((e.target as HTMLInputElement).files);
        });

        dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            handleFileSelect(e.dataTransfer?.files);
        });

        fileInput.addEventListener('click', function () {
            fileInput.value = '';
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', sanitizePdf);
    }
});
