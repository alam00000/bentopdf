import { PDFDocument, PDFName, PDFDict, PDFArray } from 'pdf-lib';
import { loadPdfDocument } from './load-pdf-document.js';
import type { PDFDocumentInternal } from '@/types';

function getCatalogDict(pdfDoc: PDFDocument): PDFDict {
  return pdfDoc.catalog;
}

function lookupAsDict(
  pdfDoc: PDFDocument,
  ref: ReturnType<PDFDict['get']>
): PDFDict | undefined {
  if (!ref) return undefined;
  const result = pdfDoc.context.lookup(ref);
  if (result instanceof PDFDict) return result;
  return undefined;
}

function lookupAsArray(
  pdfDoc: PDFDocument,
  ref: ReturnType<PDFDict['get']>
): PDFArray | undefined {
  if (!ref) return undefined;
  const result = pdfDoc.context.lookup(ref);
  if (result instanceof PDFArray) return result;
  return undefined;
}

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export interface SanitizeOptions {
  flattenForms: boolean;
  removeMetadata: boolean;
  removeAnnotations: boolean;
  removeJavascript: boolean;
  removeEmbeddedFiles: boolean;
  removeLayers: boolean;
  removeLinks: boolean;
  removeStructureTree: boolean;
  removeMarkInfo: boolean;
  removeFonts: boolean;
}

export const defaultSanitizeOptions: SanitizeOptions = {
  flattenForms: true,
  removeMetadata: true,
  removeAnnotations: true,
  removeJavascript: true,
  removeEmbeddedFiles: true,
  removeLayers: true,
  removeLinks: true,
  removeStructureTree: true,
  removeMarkInfo: true,
  removeFonts: false,
};

function removeMetadataFromDoc(pdfDoc: PDFDocument) {
  const infoDict = (pdfDoc as unknown as PDFDocumentInternal).getInfoDict();
  const allKeys = infoDict.keys();
  allKeys.forEach((key: PDFName) => {
    infoDict.delete(key);
  });

  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator('');
  pdfDoc.setProducer('');

  try {
    const catalogDict = getCatalogDict(pdfDoc);
    if (catalogDict.has(PDFName.of('Metadata'))) {
      catalogDict.delete(PDFName.of('Metadata'));
    }
  } catch (e: unknown) {
    console.warn('Could not remove XMP metadata:', getErrorMessage(e));
  }

  try {
    const context = pdfDoc.context;
    if (context.trailerInfo) {
      delete context.trailerInfo.ID;
    }
  } catch (e: unknown) {
    console.warn('Could not remove document IDs:', getErrorMessage(e));
  }

  try {
    const catalogDict = getCatalogDict(pdfDoc);
    if (catalogDict.has(PDFName.of('PieceInfo'))) {
      catalogDict.delete(PDFName.of('PieceInfo'));
    }
  } catch (e: unknown) {
    console.warn('Could not remove PieceInfo:', getErrorMessage(e));
  }
}

function removeAnnotationsFromDoc(pdfDoc: PDFDocument) {
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    try {
      page.node.delete(PDFName.of('Annots'));
    } catch (e: unknown) {
      console.warn(
        'Could not remove annotations from page:',
        getErrorMessage(e)
      );
    }
  }
}

function flattenFormsInDoc(pdfDoc: PDFDocument) {
  const form = pdfDoc.getForm();
  form.flatten();
}

function removeJavascriptFromDoc(pdfDoc: PDFDocument) {
  const pdfDocInternal = pdfDoc as unknown as PDFDocumentInternal;
  if (pdfDocInternal.javaScripts && pdfDocInternal.javaScripts.length > 0) {
    pdfDocInternal.javaScripts = [];
  }

  const catalogDict = getCatalogDict(pdfDoc);

  const namesRef = catalogDict.get(PDFName.of('Names'));
  if (namesRef) {
    try {
      const namesDict = lookupAsDict(pdfDoc, namesRef);
      if (namesDict?.has(PDFName.of('JavaScript'))) {
        namesDict.delete(PDFName.of('JavaScript'));
      }
    } catch (e: unknown) {
      console.warn('Could not access Names/JavaScript:', getErrorMessage(e));
    }
  }

  if (catalogDict.has(PDFName.of('OpenAction'))) {
    catalogDict.delete(PDFName.of('OpenAction'));
  }

  if (catalogDict.has(PDFName.of('AA'))) {
    catalogDict.delete(PDFName.of('AA'));
  }

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    try {
      const pageDict = page.node;

      if (pageDict.has(PDFName.of('AA'))) {
        pageDict.delete(PDFName.of('AA'));
      }

      const annotRefs = pageDict.Annots()?.asArray() || [];
      for (const annotRef of annotRefs) {
        try {
          const annot = lookupAsDict(pdfDoc, annotRef);
          if (!annot) continue;

          if (annot.has(PDFName.of('A'))) {
            const actionRef = annot.get(PDFName.of('A'));
            try {
              const actionDict = lookupAsDict(pdfDoc, actionRef);
              const actionType = actionDict
                ?.get(PDFName.of('S'))
                ?.toString()
                .substring(1);

              if (actionType === 'JavaScript') {
                annot.delete(PDFName.of('A'));
              }
            } catch (e: unknown) {
              console.warn('Could not read action:', getErrorMessage(e));
            }
          }

          if (annot.has(PDFName.of('AA'))) {
            annot.delete(PDFName.of('AA'));
          }
        } catch (e: unknown) {
          console.warn(
            'Could not process annotation for JS:',
            getErrorMessage(e)
          );
        }
      }
    } catch (e: unknown) {
      console.warn('Could not remove page actions:', getErrorMessage(e));
    }
  }

  try {
    const acroFormRef = catalogDict.get(PDFName.of('AcroForm'));
    if (acroFormRef) {
      const acroFormDict = lookupAsDict(pdfDoc, acroFormRef);
      const fieldsRef = acroFormDict?.get(PDFName.of('Fields'));

      if (fieldsRef) {
        const fieldsArray = lookupAsArray(pdfDoc, fieldsRef);
        const fields = fieldsArray?.asArray() || [];

        for (const fieldRef of fields) {
          try {
            const field = lookupAsDict(pdfDoc, fieldRef);
            if (!field) continue;

            if (field.has(PDFName.of('A'))) {
              field.delete(PDFName.of('A'));
            }

            if (field.has(PDFName.of('AA'))) {
              field.delete(PDFName.of('AA'));
            }
          } catch (e: unknown) {
            console.warn('Could not process field for JS:', getErrorMessage(e));
          }
        }
      }
    }
  } catch (e: unknown) {
    console.warn('Could not process form fields for JS:', getErrorMessage(e));
  }
}

function removeEmbeddedFilesFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = getCatalogDict(pdfDoc);

  const namesRef = catalogDict.get(PDFName.of('Names'));
  if (namesRef) {
    try {
      const namesDict = lookupAsDict(pdfDoc, namesRef);
      if (namesDict?.has(PDFName.of('EmbeddedFiles'))) {
        namesDict.delete(PDFName.of('EmbeddedFiles'));
      }
    } catch (e: unknown) {
      console.warn('Could not access Names/EmbeddedFiles:', getErrorMessage(e));
    }
  }

  if (catalogDict.has(PDFName.of('EmbeddedFiles'))) {
    catalogDict.delete(PDFName.of('EmbeddedFiles'));
  }

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    try {
      const annotRefs = page.node.Annots()?.asArray() || [];
      const annotsToKeep = [];

      for (const ref of annotRefs) {
        try {
          const annot = lookupAsDict(pdfDoc, ref);
          const subtype = annot
            ?.get(PDFName.of('Subtype'))
            ?.toString()
            .substring(1);

          if (subtype !== 'FileAttachment') {
            annotsToKeep.push(ref);
          }
        } catch {
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
    } catch (pageError: unknown) {
      console.warn(
        `Could not process page for attachments: ${getErrorMessage(pageError)}`
      );
    }
  }

  const pdfDocInternal = pdfDoc as unknown as PDFDocumentInternal;
  if (pdfDocInternal.embeddedFiles && pdfDocInternal.embeddedFiles.length > 0) {
    pdfDocInternal.embeddedFiles = [];
  }

  if (catalogDict.has(PDFName.of('Collection'))) {
    catalogDict.delete(PDFName.of('Collection'));
  }
}

function removeLayersFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = getCatalogDict(pdfDoc);

  if (catalogDict.has(PDFName.of('OCProperties'))) {
    catalogDict.delete(PDFName.of('OCProperties'));
  }

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    try {
      const pageDict = page.node;

      if (pageDict.has(PDFName.of('OCProperties'))) {
        pageDict.delete(PDFName.of('OCProperties'));
      }

      const resourcesRef = pageDict.get(PDFName.of('Resources'));
      if (resourcesRef) {
        try {
          const resourcesDict = lookupAsDict(pdfDoc, resourcesRef);
          if (resourcesDict?.has(PDFName.of('Properties'))) {
            resourcesDict.delete(PDFName.of('Properties'));
          }
        } catch (e: unknown) {
          console.warn('Could not access Resources:', getErrorMessage(e));
        }
      }
    } catch (e: unknown) {
      console.warn('Could not remove page layers:', getErrorMessage(e));
    }
  }
}

function removeLinksFromDoc(pdfDoc: PDFDocument) {
  const pages = pdfDoc.getPages();

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    try {
      const page = pages[pageIndex];
      const pageDict = page.node;

      const annotsRef = pageDict.get(PDFName.of('Annots'));
      if (!annotsRef) continue;

      const annotsArrayObj = lookupAsArray(pdfDoc, annotsRef);
      if (!annotsArrayObj) continue;
      const annotRefs = annotsArrayObj.asArray();

      if (annotRefs.length === 0) continue;

      const annotsToKeep = [];
      let linksRemoved = 0;

      for (const ref of annotRefs) {
        try {
          const annot = lookupAsDict(pdfDoc, ref);
          if (!annot) {
            annotsToKeep.push(ref);
            continue;
          }
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
                const actionDict = lookupAsDict(pdfDoc, actionRef);
                const actionType = actionDict
                  ?.get(PDFName.of('S'))
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
              } catch (e: unknown) {
                console.warn('Could not read action:', getErrorMessage(e));
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
        } catch (e: unknown) {
          console.warn('Could not process annotation:', getErrorMessage(e));
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
      }
    } catch (pageError: unknown) {
      console.warn(
        `Could not process page ${pageIndex + 1} for links: ${getErrorMessage(pageError)}`
      );
    }
  }

  try {
    const catalogDict = getCatalogDict(pdfDoc);
    const namesRef = catalogDict.get(PDFName.of('Names'));
    if (namesRef) {
      try {
        const namesDict = lookupAsDict(pdfDoc, namesRef);
        if (namesDict?.has(PDFName.of('Dests'))) {
          namesDict.delete(PDFName.of('Dests'));
        }
      } catch (e: unknown) {
        console.warn('Could not access Names/Dests:', getErrorMessage(e));
      }
    }

    if (catalogDict.has(PDFName.of('Dests'))) {
      catalogDict.delete(PDFName.of('Dests'));
    }
  } catch (e: unknown) {
    console.warn('Could not remove named destinations:', getErrorMessage(e));
  }
}

function removeStructureTreeFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = getCatalogDict(pdfDoc);

  if (catalogDict.has(PDFName.of('StructTreeRoot'))) {
    catalogDict.delete(PDFName.of('StructTreeRoot'));
  }

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    try {
      const pageDict = page.node;
      if (pageDict.has(PDFName.of('StructParents'))) {
        pageDict.delete(PDFName.of('StructParents'));
      }
    } catch (e: unknown) {
      console.warn('Could not remove page StructParents:', getErrorMessage(e));
    }
  }

  if (catalogDict.has(PDFName.of('ParentTree'))) {
    catalogDict.delete(PDFName.of('ParentTree'));
  }
}

function removeMarkInfoFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = getCatalogDict(pdfDoc);

  if (catalogDict.has(PDFName.of('MarkInfo'))) {
    catalogDict.delete(PDFName.of('MarkInfo'));
  }

  if (catalogDict.has(PDFName.of('Marked'))) {
    catalogDict.delete(PDFName.of('Marked'));
  }
}

function removeFontsFromDoc(pdfDoc: PDFDocument) {
  const pages = pdfDoc.getPages();

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    try {
      const page = pages[pageIndex];
      const pageDict = page.node;
      const resourcesRef = pageDict.get(PDFName.of('Resources'));

      if (resourcesRef) {
        try {
          const resourcesDict = lookupAsDict(pdfDoc, resourcesRef);
          if (!resourcesDict) continue;

          if (resourcesDict.has(PDFName.of('Font'))) {
            const fontRef = resourcesDict.get(PDFName.of('Font'));

            try {
              const fontDict = lookupAsDict(pdfDoc, fontRef);
              if (!fontDict) continue;
              const fontKeys = fontDict.keys();

              for (const fontKey of fontKeys) {
                try {
                  const specificFontRef = fontDict.get(fontKey);
                  const specificFont = lookupAsDict(pdfDoc, specificFontRef);
                  if (!specificFont) continue;

                  if (specificFont.has(PDFName.of('FontDescriptor'))) {
                    const descriptorRef = specificFont.get(
                      PDFName.of('FontDescriptor')
                    );
                    const descriptor = lookupAsDict(pdfDoc, descriptorRef);
                    if (!descriptor) continue;

                    const fontFileKeys = ['FontFile', 'FontFile2', 'FontFile3'];
                    for (const key of fontFileKeys) {
                      if (descriptor.has(PDFName.of(key))) {
                        descriptor.delete(PDFName.of(key));
                      }
                    }
                  }
                } catch (e: unknown) {
                  console.warn(
                    `Could not process font ${fontKey}:`,
                    getErrorMessage(e)
                  );
                }
              }
            } catch (e: unknown) {
              console.warn(
                'Could not access font dictionary:',
                getErrorMessage(e)
              );
            }
          }
        } catch (e: unknown) {
          console.warn(
            'Could not access Resources for fonts:',
            getErrorMessage(e)
          );
        }
      }
    } catch (e: unknown) {
      console.warn(
        `Could not remove fonts from page ${pageIndex + 1}:`,
        getErrorMessage(e)
      );
    }
  }

  const pdfDocInternal = pdfDoc as unknown as PDFDocumentInternal;
  if (pdfDocInternal.fonts && pdfDocInternal.fonts.length > 0) {
    pdfDocInternal.fonts = [];
  }
}

export async function sanitizePdf(
  pdfBytes: Uint8Array,
  options: SanitizeOptions
): Promise<{ pdfDoc: PDFDocument; bytes: Uint8Array }> {
  const pdfDoc = await loadPdfDocument(pdfBytes);

  if (options.flattenForms) {
    try {
      flattenFormsInDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not flatten forms: ${getErrorMessage(e)}`);
      try {
        const catalogDict = getCatalogDict(pdfDoc);
        if (catalogDict.has(PDFName.of('AcroForm'))) {
          catalogDict.delete(PDFName.of('AcroForm'));
        }
      } catch (removeError: unknown) {
        console.warn(
          'Could not remove AcroForm:',
          getErrorMessage(removeError)
        );
      }
    }
  }

  if (options.removeMetadata) {
    removeMetadataFromDoc(pdfDoc);
  }

  if (options.removeAnnotations) {
    removeAnnotationsFromDoc(pdfDoc);
  }

  if (options.removeJavascript) {
    try {
      removeJavascriptFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove JavaScript: ${getErrorMessage(e)}`);
    }
  }

  if (options.removeEmbeddedFiles) {
    try {
      removeEmbeddedFilesFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove embedded files: ${getErrorMessage(e)}`);
    }
  }

  if (options.removeLayers) {
    try {
      removeLayersFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove layers: ${getErrorMessage(e)}`);
    }
  }

  if (options.removeLinks) {
    try {
      removeLinksFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove links: ${getErrorMessage(e)}`);
    }
  }

  if (options.removeStructureTree) {
    try {
      removeStructureTreeFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove structure tree: ${getErrorMessage(e)}`);
    }
  }

  if (options.removeMarkInfo) {
    try {
      removeMarkInfoFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove MarkInfo: ${getErrorMessage(e)}`);
    }
  }

  if (options.removeFonts) {
    try {
      removeFontsFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove fonts: ${getErrorMessage(e)}`);
    }
  }

  const savedBytes = await pdfDoc.save();
  return { pdfDoc, bytes: new Uint8Array(savedBytes) };
}
