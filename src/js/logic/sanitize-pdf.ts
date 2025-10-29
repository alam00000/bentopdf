import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';
import { removeMetadataFromDoc } from './remove-metadata.js';
import { removeAnnotationsFromDoc } from './remove-annotations.js';
import { flattenFormsInDoc } from './flatten.js';
import { PDFName } from 'pdf-lib';

export async function sanitizePdf() {
  if (!state.pdfDoc) {
    showAlert(String(t('alerts.error')), String(t('alerts.noPdfLoaded')));
    return;
  }

  showLoader(String(t('alerts.sanitizingPdf')));
  try {
    const pdfDoc = state.pdfDoc;

    const shouldFlattenForms = (
      document.getElementById('flatten-forms') as HTMLInputElement
    ).checked;
    const shouldRemoveMetadata = (
      document.getElementById('remove-metadata') as HTMLInputElement
    ).checked;
    const shouldRemoveAnnotations = (
      document.getElementById('remove-annotations') as HTMLInputElement
    ).checked;
    const shouldRemoveJavascript = (
      document.getElementById('remove-javascript') as HTMLInputElement
    ).checked;
    const shouldRemoveEmbeddedFiles = (
      document.getElementById('remove-embedded-files') as HTMLInputElement
    ).checked;
    const shouldRemoveLayers = (
      document.getElementById('remove-layers') as HTMLInputElement
    ).checked;
    const shouldRemoveLinks = (
      document.getElementById('remove-links') as HTMLInputElement
    ).checked;
    const shouldRemoveStructureTree = (
      document.getElementById('remove-structure-tree') as HTMLInputElement
    ).checked;
    const shouldRemoveMarkInfo = (
      document.getElementById('remove-markinfo') as HTMLInputElement
    ).checked;
    const shouldRemoveFonts = (
      document.getElementById('remove-fonts') as HTMLInputElement
    ).checked;

    let changesMade = false;

    if (shouldFlattenForms) {
      try {
        flattenFormsInDoc(pdfDoc);
        changesMade = true;
      } catch (e) {
        console.warn(`Could not flatten forms: ${e.message}`);
        try {
          const catalogDict = pdfDoc.catalog.dict;
          if (catalogDict.has(PDFName.of('AcroForm'))) {
            catalogDict.delete(PDFName.of('AcroForm'));
            changesMade = true;
          }
        } catch (removeError) {
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
        if (pdfDoc.javaScripts && pdfDoc.javaScripts.length > 0) {
          pdfDoc.javaScripts = [];
          changesMade = true;
        }

        const catalogDict = pdfDoc.catalog.dict;

        const namesRef = catalogDict.get(PDFName.of('Names'));
        if (namesRef) {
          try {
            const namesDict = pdfDoc.context.lookup(namesRef);
            if (namesDict.has(PDFName.of('JavaScript'))) {
              namesDict.delete(PDFName.of('JavaScript'));
              changesMade = true;
            }
          } catch (e) {
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
                const annot = pdfDoc.context.lookup(annotRef);

                if (annot.has(PDFName.of('A'))) {
                  const actionRef = annot.get(PDFName.of('A'));
                  try {
                    const actionDict = pdfDoc.context.lookup(actionRef);
                    const actionType = actionDict
                      .get(PDFName.of('S'))
                      ?.toString()
                      .substring(1);

                    if (actionType === 'JavaScript') {
                      annot.delete(PDFName.of('A'));
                      changesMade = true;
                    }
                  } catch (e) {
                    console.warn('Could not read action:', e.message);
                  }
                }

                if (annot.has(PDFName.of('AA'))) {
                  annot.delete(PDFName.of('AA'));
                  changesMade = true;
                }
              } catch (e) {
                console.warn('Could not process annotation for JS:', e.message);
              }
            }
          } catch (e) {
            console.warn('Could not remove page actions:', e.message);
          }
        }

        try {
          const acroFormRef = catalogDict.get(PDFName.of('AcroForm'));
          if (acroFormRef) {
            const acroFormDict = pdfDoc.context.lookup(acroFormRef);
            const fieldsRef = acroFormDict.get(PDFName.of('Fields'));

            if (fieldsRef) {
              const fieldsArray = pdfDoc.context.lookup(fieldsRef);
              const fields = fieldsArray.asArray();

              for (const fieldRef of fields) {
                try {
                  const field = pdfDoc.context.lookup(fieldRef);

                  if (field.has(PDFName.of('A'))) {
                    field.delete(PDFName.of('A'));
                    changesMade = true;
                  }

                  if (field.has(PDFName.of('AA'))) {
                    field.delete(PDFName.of('AA'));
                    changesMade = true;
                  }
                } catch (e) {
                  console.warn('Could not process field for JS:', e.message);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Could not process form fields for JS:', e.message);
        }
      } catch (e) {
        console.warn(`Could not remove JavaScript: ${e.message}`);
      }
    }

    if (shouldRemoveEmbeddedFiles) {
      try {
        const catalogDict = pdfDoc.catalog.dict;

        const namesRef = catalogDict.get(PDFName.of('Names'));
        if (namesRef) {
          try {
            const namesDict = pdfDoc.context.lookup(namesRef);
            if (namesDict.has(PDFName.of('EmbeddedFiles'))) {
              namesDict.delete(PDFName.of('EmbeddedFiles'));
              changesMade = true;
            }
          } catch (e) {
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
                const annot = pdfDoc.context.lookup(ref);
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
          } catch (pageError) {
            console.warn(
              `Could not process page for attachments: ${pageError.message}`
            );
          }
        }

        if (pdfDoc.embeddedFiles && pdfDoc.embeddedFiles.length > 0) {
          pdfDoc.embeddedFiles = [];
          changesMade = true;
        }

        if (catalogDict.has(PDFName.of('Collection'))) {
          catalogDict.delete(PDFName.of('Collection'));
          changesMade = true;
        }
      } catch (e) {
        console.warn(`Could not remove embedded files: ${e.message}`);
      }
    }

    if (shouldRemoveLayers) {
      try {
        const catalogDict = pdfDoc.catalog.dict;

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
                const resourcesDict = pdfDoc.context.lookup(resourcesRef);
                if (resourcesDict.has(PDFName.of('Properties'))) {
                  resourcesDict.delete(PDFName.of('Properties'));
                  changesMade = true;
                }
              } catch (e) {
                console.warn('Could not access Resources:', e.message);
              }
            }
          } catch (e) {
            console.warn('Could not remove page layers:', e.message);
          }
        }
      } catch (e) {
        console.warn(`Could not remove layers: ${e.message}`);
      }
    }

    // TODO:@ALAM
    // Currently if the links are embedded in a stream they can't be removed
    // Find a way to remove them from the stream
    if (shouldRemoveLinks) {
      try {
        const pages = pdfDoc.getPages();

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
          try {
            const page = pages[pageIndex];
            const pageDict = page.node;

            const annotsRef = pageDict.get(PDFName.of('Annots'));
            if (!annotsRef) continue;

            const annotsArray = pdfDoc.context.lookup(annotsRef);
            const annotRefs = annotsArray.asArray();

            if (annotRefs.length === 0) continue;

            const annotsToKeep = [];
            let linksRemoved = 0;

            for (const ref of annotRefs) {
              try {
                const annot = pdfDoc.context.lookup(ref);
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
                      const actionDict = pdfDoc.context.lookup(actionRef);
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
                    } catch (e) {
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
              } catch (e) {
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
          } catch (pageError) {
            console.warn(
              `Could not process page ${pageIndex + 1} for links: ${pageError.message}`
            );
          }
        }

        try {
          const catalogDict = pdfDoc.catalog.dict;
          const namesRef = catalogDict.get(PDFName.of('Names'));
          if (namesRef) {
            try {
              const namesDict = pdfDoc.context.lookup(namesRef);
              if (namesDict.has(PDFName.of('Dests'))) {
                namesDict.delete(PDFName.of('Dests'));
                changesMade = true;
              }
            } catch (e) {
              console.warn('Could not access Names/Dests:', e.message);
            }
          }

          if (catalogDict.has(PDFName.of('Dests'))) {
            catalogDict.delete(PDFName.of('Dests'));
            changesMade = true;
          }
        } catch (e) {
          console.warn('Could not remove named destinations:', e.message);
        }
      } catch (e) {
        console.warn(`Could not remove links: ${e.message}`);
      }
    }

    if (shouldRemoveStructureTree) {
      try {
        const catalogDict = pdfDoc.catalog.dict;

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
          } catch (e) {
            console.warn('Could not remove page StructParents:', e.message);
          }
        }

        if (catalogDict.has(PDFName.of('ParentTree'))) {
          catalogDict.delete(PDFName.of('ParentTree'));
          changesMade = true;
        }
      } catch (e) {
        console.warn(`Could not remove structure tree: ${e.message}`);
      }
    }

    if (shouldRemoveMarkInfo) {
      try {
        const catalogDict = pdfDoc.catalog.dict;

        if (catalogDict.has(PDFName.of('MarkInfo'))) {
          catalogDict.delete(PDFName.of('MarkInfo'));
          changesMade = true;
        }

        if (catalogDict.has(PDFName.of('Marked'))) {
          catalogDict.delete(PDFName.of('Marked'));
          changesMade = true;
        }
      } catch (e) {
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
                const resourcesDict = pdfDoc.context.lookup(resourcesRef);

                if (resourcesDict.has(PDFName.of('Font'))) {
                  const fontRef = resourcesDict.get(PDFName.of('Font'));

                  try {
                    const fontDict = pdfDoc.context.lookup(fontRef);
                    const fontKeys = fontDict.keys();

                    for (const fontKey of fontKeys) {
                      try {
                        const specificFontRef = fontDict.get(fontKey);
                        const specificFont =
                          pdfDoc.context.lookup(specificFontRef);

                        if (specificFont.has(PDFName.of('FontDescriptor'))) {
                          const descriptorRef = specificFont.get(
                            PDFName.of('FontDescriptor')
                          );
                          const descriptor =
                            pdfDoc.context.lookup(descriptorRef);

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

                        // Users/Developers: Uncomment this if you can delete the entire font entry -- might break the rendering though
                        // fontDict.delete(fontKey);
                        // changesMade = true;
                      } catch (e) {
                        console.warn(
                          `Could not process font ${fontKey}:`,
                          e.message
                        );
                      }
                    }
                  } catch (e) {
                    console.warn(
                      'Could not access font dictionary:',
                      e.message
                    );
                  }
                }
              } catch (e) {
                console.warn(
                  'Could not access Resources for fonts:',
                  e.message
                );
              }
            }
          } catch (e) {
            console.warn(
              `Could not remove fonts from page ${pageIndex + 1}:`,
              e.message
            );
          }
        }

        if (pdfDoc.fonts && pdfDoc.fonts.length > 0) {
          pdfDoc.fonts = [];
          changesMade = true;
        }
      } catch (e) {
        console.warn(`Could not remove fonts: ${e.message}`);
      }
    }

    if (!changesMade) {
      showAlert(
        String(t('alerts.noChanges')),
        String(t('alerts.noItemsSelectedForRemoval'))
      );
      hideLoader();
      return;
    }

    const sanitizedPdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([sanitizedPdfBytes], { type: 'application/pdf' }),
      'sanitized.pdf'
    );
    showAlert(String(t('alerts.success')), String(t('alerts.pdfSanitizedSuccess')));
  } catch (e) {
    console.error('Sanitization Error:', e);
    showAlert(String(t('alerts.error')), String(t('alerts.errorDuringSanitization', { error: e.message })));
  } finally {
    hideLoader();
  }
}
