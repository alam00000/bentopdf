import {
  PDFArray,
  PDFButton,
  PDFCheckBox,
  PDFDict,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFOptionList,
  PDFRadioGroup,
  PDFRef,
  PDFSignature,
  PDFString,
  PDFTextField,
  PDFWidgetAnnotation,
  TextAlignment,
} from 'pdf-lib';
import type {
  ExtractExistingFieldsOptions,
  ExtractExistingFieldsResult,
  ExtractionViewportMetrics,
  FormField,
} from '@/types';

type SupportedPdfField =
  | PDFTextField
  | PDFCheckBox
  | PDFRadioGroup
  | PDFDropdown
  | PDFOptionList
  | PDFButton
  | PDFSignature;

type SupportedFieldType = FormField['type'];

function isSupportedPdfField(field: unknown): field is SupportedPdfField {
  return (
    field instanceof PDFTextField ||
    field instanceof PDFCheckBox ||
    field instanceof PDFRadioGroup ||
    field instanceof PDFDropdown ||
    field instanceof PDFOptionList ||
    field instanceof PDFButton ||
    field instanceof PDFSignature
  );
}

function getSupportedFieldType(field: SupportedPdfField): SupportedFieldType {
  if (field instanceof PDFTextField) return 'text';
  if (field instanceof PDFCheckBox) return 'checkbox';
  if (field instanceof PDFRadioGroup) return 'radio';
  if (field instanceof PDFDropdown) return 'dropdown';
  if (field instanceof PDFOptionList) return 'optionlist';
  if (field instanceof PDFButton) return 'button';
  return 'signature';
}

function getTooltip(widget: PDFWidgetAnnotation): string {
  const tooltip = widget.dict.get(PDFName.of('TU'));
  if (!(tooltip instanceof PDFString)) {
    return '';
  }

  try {
    return tooltip.decodeText();
  } catch (error) {
    console.warn(
      'Failed to decode form field tooltip during extraction:',
      error
    );
    return '';
  }
}

function getPageAnnotationRefs(
  pdfDoc: PDFDocument,
  pageIndex: number
): PDFRef[] {
  const page = pdfDoc.getPages()[pageIndex];
  const annots = page.node.get(PDFName.of('Annots'));
  if (!annots) return [];

  if (annots instanceof PDFArray) {
    return annots
      .asArray()
      .map((entry) => {
        if (entry instanceof PDFRef) {
          return entry;
        }

        return pdfDoc.context.getObjectRef(entry) ?? null;
      })
      .filter((entry): entry is PDFRef => entry instanceof PDFRef);
  }

  const annotsArray = pdfDoc.context.lookupMaybe(annots, PDFArray);
  if (!annotsArray) return [];

  return annotsArray
    .asArray()
    .map((entry) => {
      if (entry instanceof PDFRef) {
        return entry;
      }

      return pdfDoc.context.getObjectRef(entry) ?? null;
    })
    .filter((entry): entry is PDFRef => entry instanceof PDFRef);
}

export function resolveWidgetPageIndex(
  pdfDoc: PDFDocument,
  widget: PDFWidgetAnnotation
): number | null {
  const pdfPages = pdfDoc.getPages();
  const pageRef = widget.P();

  if (pageRef instanceof PDFRef) {
    for (let pageIndex = 0; pageIndex < pdfPages.length; pageIndex += 1) {
      if (pdfPages[pageIndex].ref === pageRef) {
        return pageIndex;
      }
    }
  }

  for (let pageIndex = 0; pageIndex < pdfPages.length; pageIndex += 1) {
    const annotRefs = getPageAnnotationRefs(pdfDoc, pageIndex);
    for (const annotRef of annotRefs) {
      const annotDict = pdfDoc.context.lookupMaybe(annotRef, PDFDict);
      if (annotDict === widget.dict) {
        return pageIndex;
      }
    }
  }

  return null;
}

function buildBaseField(
  pdfField: SupportedPdfField,
  fieldType: SupportedFieldType,
  widget: PDFWidgetAnnotation,
  pageIndex: number,
  id: string,
  metrics: ExtractionViewportMetrics,
  pdfDoc: PDFDocument
): FormField {
  const rect = widget.getRectangle();
  const page = pdfDoc.getPages()[pageIndex];
  const { height: pageHeight } = page.getSize();

  const canvasX = rect.x * metrics.pdfViewerScale + metrics.pdfViewerOffset.x;
  const canvasY =
    (pageHeight - rect.y - rect.height) * metrics.pdfViewerScale +
    metrics.pdfViewerOffset.y;
  const canvasWidth = rect.width * metrics.pdfViewerScale;
  const canvasHeight = rect.height * metrics.pdfViewerScale;

  return {
    id,
    type: fieldType,
    x: canvasX,
    y: canvasY,
    width: canvasWidth,
    height: canvasHeight,
    name: pdfField.getName(),
    defaultValue: '',
    fontSize: 12,
    alignment: 'left',
    textColor: '#000000',
    required: pdfField.isRequired(),
    readOnly: pdfField.isReadOnly(),
    tooltip: getTooltip(widget),
    combCells: 0,
    maxLength: 0,
    pageIndex,
    borderColor: '#000000',
    hideBorder: false,
  };
}

function applyTextFieldDetails(field: FormField, pdfField: PDFTextField): void {
  try {
    field.defaultValue = pdfField.getText() || '';
  } catch (error) {
    console.warn(
      `Failed to read default text for field "${pdfField.getName()}" during extraction:`,
      error
    );
  }

  try {
    field.multiline = pdfField.isMultiline();
  } catch (error) {
    console.warn(
      `Failed to read multiline setting for field "${pdfField.getName()}" during extraction:`,
      error
    );
  }

  try {
    const maxLength = pdfField.getMaxLength();
    if (maxLength !== undefined) {
      if (pdfField.isCombed()) {
        field.combCells = maxLength;
      } else {
        field.maxLength = maxLength;
      }
    }
  } catch (error) {
    console.warn(
      `Failed to read max length for field "${pdfField.getName()}" during extraction:`,
      error
    );
  }

  try {
    const alignment = pdfField.getAlignment();
    if (alignment === TextAlignment.Center) field.alignment = 'center';
    else if (alignment === TextAlignment.Right) field.alignment = 'right';
    else field.alignment = 'left';
  } catch (error) {
    console.warn(
      `Failed to read alignment for field "${pdfField.getName()}" during extraction:`,
      error
    );
    field.alignment = 'left';
  }
}

function applyChoiceFieldDetails(
  field: FormField,
  pdfField: PDFDropdown | PDFOptionList
): void {
  try {
    field.options = pdfField.getOptions();
  } catch (error) {
    console.warn(
      `Failed to read options for field "${pdfField.getName()}" during extraction:`,
      error
    );
  }

  try {
    const selected = pdfField.getSelected();
    if (selected.length > 0) {
      field.defaultValue = selected[0];
    }
  } catch (error) {
    console.warn(
      `Failed to read selected option for field "${pdfField.getName()}" during extraction:`,
      error
    );
  }
}

function buildStandardField(
  pdfDoc: PDFDocument,
  pdfField: Exclude<SupportedPdfField, PDFRadioGroup>,
  widget: PDFWidgetAnnotation,
  pageIndex: number,
  id: string,
  metrics: ExtractionViewportMetrics
): FormField {
  const field = buildBaseField(
    pdfField,
    getSupportedFieldType(pdfField),
    widget,
    pageIndex,
    id,
    metrics,
    pdfDoc
  );

  if (pdfField instanceof PDFTextField) {
    applyTextFieldDetails(field, pdfField);
  } else if (pdfField instanceof PDFCheckBox) {
    try {
      field.checked = pdfField.isChecked();
    } catch (error) {
      console.warn(
        `Failed to read checkbox state for field "${pdfField.getName()}" during extraction:`,
        error
      );
      field.checked = false;
    }
    field.exportValue = 'Yes';
  } else if (pdfField instanceof PDFDropdown) {
    applyChoiceFieldDetails(field, pdfField);
  } else if (pdfField instanceof PDFOptionList) {
    applyChoiceFieldDetails(field, pdfField);
  } else if (pdfField instanceof PDFButton) {
    field.label = 'Button';
    field.action = 'none';
  }

  return field;
}

function buildRadioField(
  pdfDoc: PDFDocument,
  pdfField: PDFRadioGroup,
  widget: PDFWidgetAnnotation,
  pageIndex: number,
  id: string,
  metrics: ExtractionViewportMetrics,
  exportValue: string
): FormField {
  const field = buildBaseField(
    pdfField,
    'radio',
    widget,
    pageIndex,
    id,
    metrics,
    pdfDoc
  );

  field.checked = false;
  field.exportValue = exportValue;
  field.groupName = pdfField.getName();

  return field;
}

export function extractExistingFields(
  options: ExtractExistingFieldsOptions
): ExtractExistingFieldsResult {
  const { pdfDoc, fieldCounterStart, metrics } = options;
  const form = pdfDoc.getForm();
  const extractedFieldNames = new Set<string>();
  const extractedFields: FormField[] = [];
  let fieldCounter = fieldCounterStart;

  for (const rawField of form.getFields()) {
    if (!isSupportedPdfField(rawField)) continue;

    const fieldName = rawField.getName();
    const widgets = rawField.acroField.getWidgets();
    if (widgets.length === 0) continue;

    if (rawField instanceof PDFRadioGroup) {
      const options = rawField.getOptions();

      for (
        let widgetIndex = 0;
        widgetIndex < widgets.length;
        widgetIndex += 1
      ) {
        const widget = widgets[widgetIndex];
        const pageIndex = resolveWidgetPageIndex(pdfDoc, widget);
        if (pageIndex === null) {
          console.warn(
            `Could not resolve page for existing radio widget "${fieldName}", skipping extraction`
          );
          continue;
        }

        fieldCounter += 1;
        extractedFields.push(
          buildRadioField(
            pdfDoc,
            rawField,
            widget,
            pageIndex,
            `field_${fieldCounter}`,
            metrics,
            options[widgetIndex] || 'Yes'
          )
        );
      }

      extractedFieldNames.add(fieldName);
      continue;
    }

    const widget = widgets[0];
    const pageIndex = resolveWidgetPageIndex(pdfDoc, widget);
    if (pageIndex === null) {
      console.warn(
        `Could not resolve page for existing field "${fieldName}", skipping extraction`
      );
      continue;
    }

    fieldCounter += 1;
    extractedFields.push(
      buildStandardField(
        pdfDoc,
        rawField,
        widget,
        pageIndex,
        `field_${fieldCounter}`,
        metrics
      )
    );
    extractedFieldNames.add(fieldName);
  }

  return {
    fields: extractedFields,
    extractedFieldNames,
    nextFieldCounter: fieldCounter,
  };
}
