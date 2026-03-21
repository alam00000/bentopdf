import { PDFDocument, PDFName } from 'pdf-lib';

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

function removeJavascriptFromDoc(pdfDoc: PDFDocument) {
  if ((pdfDoc as any).javaScripts && (pdfDoc as any).javaScripts.length > 0) {
    (pdfDoc as any).javaScripts = [];
  }

  const catalogDict = (pdfDoc.catalog as any).dict;

  const namesRef = catalogDict.get(PDFName.of('Names'));
  if (namesRef) {
    try {
      const namesDict = pdfDoc.context.lookup(namesRef) as any;
      if (namesDict.has(PDFName.of('JavaScript'))) {
        namesDict.delete(PDFName.of('JavaScript'));
      }
    } catch (e: any) {
      console.warn('Could not access Names/JavaScript:', e.message);
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
              }
            } catch (e: any) {
              console.warn('Could not read action:', e.message);
            }
          }

          if (annot.has(PDFName.of('AA'))) {
            annot.delete(PDFName.of('AA'));
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
            }

            if (field.has(PDFName.of('AA'))) {
              field.delete(PDFName.of('AA'));
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
}

function removeEmbeddedFilesFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = (pdfDoc.catalog as any).dict;

  const namesRef = catalogDict.get(PDFName.of('Names'));
  if (namesRef) {
    try {
      const namesDict = pdfDoc.context.lookup(namesRef) as any;
      if (namesDict.has(PDFName.of('EmbeddedFiles'))) {
        namesDict.delete(PDFName.of('EmbeddedFiles'));
      }
    } catch (e: any) {
      console.warn('Could not access Names/EmbeddedFiles:', e.message);
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
          const annot = pdfDoc.context.lookup(ref) as any;
          const subtype = annot
            .get(PDFName.of('Subtype'))
            ?.toString()
            .substring(1);

          if (subtype !== 'FileAttachment') {
            annotsToKeep.push(ref);
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

  if (
    (pdfDoc as any).embeddedFiles &&
    (pdfDoc as any).embeddedFiles.length > 0
  ) {
    (pdfDoc as any).embeddedFiles = [];
  }

  if (catalogDict.has(PDFName.of('Collection'))) {
    catalogDict.delete(PDFName.of('Collection'));
  }
}

function removeLayersFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = (pdfDoc.catalog as any).dict;

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
          const resourcesDict = pdfDoc.context.lookup(resourcesRef) as any;
          if (resourcesDict.has(PDFName.of('Properties'))) {
            resourcesDict.delete(PDFName.of('Properties'));
          }
        } catch (e: any) {
          console.warn('Could not access Resources:', e.message);
        }
      }
    } catch (e: any) {
      console.warn('Could not remove page layers:', e.message);
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
        }
      } catch (e: any) {
        console.warn('Could not access Names/Dests:', e.message);
      }
    }

    if (catalogDict.has(PDFName.of('Dests'))) {
      catalogDict.delete(PDFName.of('Dests'));
    }
  } catch (e: any) {
    console.warn('Could not remove named destinations:', e.message);
  }
}

function removeStructureTreeFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = (pdfDoc.catalog as any).dict;

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
    } catch (e: any) {
      console.warn('Could not remove page StructParents:', e.message);
    }
  }

  if (catalogDict.has(PDFName.of('ParentTree'))) {
    catalogDict.delete(PDFName.of('ParentTree'));
  }
}

function removeMarkInfoFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = (pdfDoc.catalog as any).dict;

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
          const resourcesDict = pdfDoc.context.lookup(resourcesRef) as any;

          if (resourcesDict.has(PDFName.of('Font'))) {
            const fontRef = resourcesDict.get(PDFName.of('Font'));

            try {
              const fontDict = pdfDoc.context.lookup(fontRef) as any;
              const fontKeys = fontDict.keys();

              for (const fontKey of fontKeys) {
                try {
                  const specificFontRef = fontDict.get(fontKey);
                  const specificFont = pdfDoc.context.lookup(
                    specificFontRef
                  ) as any;

                  if (specificFont.has(PDFName.of('FontDescriptor'))) {
                    const descriptorRef = specificFont.get(
                      PDFName.of('FontDescriptor')
                    );
                    const descriptor = pdfDoc.context.lookup(
                      descriptorRef
                    ) as any;

                    const fontFileKeys = ['FontFile', 'FontFile2', 'FontFile3'];
                    for (const key of fontFileKeys) {
                      if (descriptor.has(PDFName.of(key))) {
                        descriptor.delete(PDFName.of(key));
                      }
                    }
                  }
                } catch (e: any) {
                  console.warn(`Could not process font ${fontKey}:`, e.message);
                }
              }
            } catch (e: any) {
              console.warn('Could not access font dictionary:', e.message);
            }
          }
        } catch (e: any) {
          console.warn('Could not access Resources for fonts:', e.message);
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
  }
}

export async function sanitizePdf(
  pdfBytes: Uint8Array,
  options: SanitizeOptions
): Promise<{ pdfDoc: PDFDocument; bytes: Uint8Array }> {
  const pdfDoc = await PDFDocument.load(pdfBytes);

  if (options.flattenForms) {
    try {
      flattenFormsInDoc(pdfDoc);
    } catch (e: any) {
      console.warn(`Could not flatten forms: ${e.message}`);
      try {
        const catalogDict = (pdfDoc.catalog as any).dict;
        if (catalogDict.has(PDFName.of('AcroForm'))) {
          catalogDict.delete(PDFName.of('AcroForm'));
        }
      } catch (removeError: any) {
        console.warn('Could not remove AcroForm:', removeError.message);
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
    } catch (e: any) {
      console.warn(`Could not remove JavaScript: ${e.message}`);
    }
  }

  if (options.removeEmbeddedFiles) {
    try {
      removeEmbeddedFilesFromDoc(pdfDoc);
    } catch (e: any) {
      console.warn(`Could not remove embedded files: ${e.message}`);
    }
  }

  if (options.removeLayers) {
    try {
      removeLayersFromDoc(pdfDoc);
    } catch (e: any) {
      console.warn(`Could not remove layers: ${e.message}`);
    }
  }

  if (options.removeLinks) {
    try {
      removeLinksFromDoc(pdfDoc);
    } catch (e: any) {
      console.warn(`Could not remove links: ${e.message}`);
    }
  }

  if (options.removeStructureTree) {
    try {
      removeStructureTreeFromDoc(pdfDoc);
    } catch (e: any) {
      console.warn(`Could not remove structure tree: ${e.message}`);
    }
  }

  if (options.removeMarkInfo) {
    try {
      removeMarkInfoFromDoc(pdfDoc);
    } catch (e: any) {
      console.warn(`Could not remove MarkInfo: ${e.message}`);
    }
  }

  if (options.removeFonts) {
    try {
      removeFontsFromDoc(pdfDoc);
    } catch (e: any) {
      console.warn(`Could not remove fonts: ${e.message}`);
    }
  }

  const savedBytes = await pdfDoc.save();
  return { pdfDoc, bytes: new Uint8Array(savedBytes) };
}
