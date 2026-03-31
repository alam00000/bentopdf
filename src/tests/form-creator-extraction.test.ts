import { describe, expect, it } from 'vitest';
import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFRadioGroup,
  PDFRef,
  PDFString,
  PDFTextField,
  PDFWidgetAnnotation,
  rgb,
} from 'pdf-lib';
import { extractExistingFields } from '../js/logic/form-creator-extraction.ts';
import type { ExtractedFieldLike } from '@/types';

const TEST_EXTRACTION_METRICS = {
  pdfViewerOffset: { x: 0, y: 0 },
  pdfViewerScale: 1,
};

function extractFieldsForTest(pdfDoc: PDFDocument): ExtractedFieldLike[] {
  const result = extractExistingFields({
    pdfDoc,
    fieldCounterStart: 0,
    metrics: TEST_EXTRACTION_METRICS,
  });

  return result.fields
    .filter(
      (
        field
      ): field is typeof field & {
        type: 'text' | 'radio';
      } => field.type === 'text' || field.type === 'radio'
    )
    .map((field) => ({
      type: field.type,
      name: field.name,
      pageIndex: field.pageIndex,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
      tooltip: field.tooltip,
      required: field.required,
      readOnly: field.readOnly,
      checked: field.checked,
      exportValue: field.exportValue,
      groupName: field.groupName,
    }));
}

function getWidgetRef(
  widget: PDFWidgetAnnotation,
  pdfDoc: PDFDocument
): PDFRef {
  const ref = pdfDoc.context.getObjectRef(widget.dict);
  if (!ref) {
    throw new Error('Expected widget dictionary to be registered in context');
  }
  return ref;
}

function getPageAnnotsArray(pdfDoc: PDFDocument, pageIndex: number): PDFArray {
  const page = pdfDoc.getPages()[pageIndex];
  const annots = page.node.get(PDFName.of('Annots'));
  const annotsArray = pdfDoc.context.lookupMaybe(annots, PDFArray);
  if (!annotsArray) {
    throw new Error(`Expected page ${pageIndex} to have an /Annots array`);
  }
  return annotsArray;
}

function removeAnnotRefFromPage(
  pdfDoc: PDFDocument,
  pageIndex: number,
  targetRef: PDFRef
): void {
  const annotsArray = getPageAnnotsArray(pdfDoc, pageIndex);
  const kept = annotsArray.asArray().filter((object) => object !== targetRef);

  const replacement = pdfDoc.context.obj(kept) as PDFArray;
  pdfDoc.getPages()[pageIndex].node.set(PDFName.of('Annots'), replacement);
}

function addAnnotRefToPage(
  pdfDoc: PDFDocument,
  pageIndex: number,
  annotRef: PDFRef
): void {
  const annotsArray = getPageAnnotsArray(pdfDoc, pageIndex);
  annotsArray.push(annotRef);
}

async function buildTwoPageDropdownPdf(): Promise<{
  pdfDoc: PDFDocument;
}> {
  const pdfDoc = await PDFDocument.create();
  const page1 = pdfDoc.addPage([600, 800]);
  const page2 = pdfDoc.addPage([600, 800]);
  const form = pdfDoc.getForm();

  const dropdown = form.createDropdown('statusSelect');
  dropdown.addToPage(page2, {
    x: 110,
    y: 300,
    width: 220,
    height: 40,
    borderColor: rgb(0, 0, 0),
  });
  dropdown.setOptions(['Draft', 'Final']);
  dropdown.select('Final');
  dropdown.acroField
    .getWidgets()[0]
    .dict.set(PDFName.of('TU'), PDFString.of('Status tooltip'));

  const page1Field = form.createTextField('page1CompanionField');
  page1Field.addToPage(page1, {
    x: 80,
    y: 580,
    width: 180,
    height: 50,
    borderColor: rgb(0, 0, 0),
  });

  return { pdfDoc };
}

async function buildTwoPageTextFieldPdf(): Promise<{
  pdfDoc: PDFDocument;
  page1Field: PDFTextField;
  page2Field: PDFTextField;
}> {
  const pdfDoc = await PDFDocument.create();
  const page1 = pdfDoc.addPage([600, 800]);
  const page2 = pdfDoc.addPage([600, 800]);
  const form = pdfDoc.getForm();

  const page1Field = form.createTextField('page1TextField');
  page1Field.addToPage(page1, {
    x: 80,
    y: 580,
    width: 320,
    height: 80,
    borderColor: rgb(0, 0, 0),
  });
  page1Field.setText('Page 1');
  page1Field.enableRequired();
  page1Field.acroField
    .getWidgets()[0]
    .dict.set(PDFName.of('TU'), PDFString.of('First page tooltip'));

  const page2Field = form.createTextField('page2TextField');
  page2Field.addToPage(page2, {
    x: 90,
    y: 360,
    width: 360,
    height: 120,
    borderColor: rgb(0, 0, 0),
  });
  page2Field.setText('Page 2');
  page2Field.enableReadOnly();
  page2Field.acroField
    .getWidgets()[0]
    .dict.set(PDFName.of('TU'), PDFString.of('Second page tooltip'));

  return { pdfDoc, page1Field, page2Field };
}

async function buildTwoPageRadioPdf(): Promise<{
  pdfDoc: PDFDocument;
  radioGroup: PDFRadioGroup;
}> {
  const pdfDoc = await PDFDocument.create();
  const page1 = pdfDoc.addPage([600, 800]);
  const page2 = pdfDoc.addPage([600, 800]);
  const form = pdfDoc.getForm();

  const radioGroup = form.createRadioGroup('statusGroup');
  radioGroup.enableRequired();

  radioGroup.addOptionToPage('draft', page1, {
    x: 120,
    y: 620,
    width: 20,
    height: 20,
    borderColor: rgb(0, 0, 0),
  });

  radioGroup.addOptionToPage('final', page2, {
    x: 180,
    y: 420,
    width: 20,
    height: 20,
    borderColor: rgb(0, 0, 0),
  });

  radioGroup.select('final');

  const widgets = radioGroup.acroField.getWidgets();
  widgets[0].dict.set(PDFName.of('TU'), PDFString.of('Draft option'));
  widgets[1].dict.set(PDFName.of('TU'), PDFString.of('Final option'));

  return { pdfDoc, radioGroup };
}

describe('form creator extraction regression', () => {
  it('keeps text fields on their original pages when widgets have no /P entry', async () => {
    const { pdfDoc, page1Field, page2Field } = await buildTwoPageTextFieldPdf();

    const page1Widget = page1Field.acroField.getWidgets()[0];
    const page2Widget = page2Field.acroField.getWidgets()[0];

    page1Widget.dict.delete(PDFName.of('P'));
    page2Widget.dict.delete(PDFName.of('P'));

    const extracted = extractFieldsForTest(pdfDoc);

    expect(extracted).toHaveLength(2);

    const first = extracted.find((field) => field.name === 'page1TextField');
    const second = extracted.find((field) => field.name === 'page2TextField');

    expect(first).toMatchObject({
      type: 'text',
      pageIndex: 0,
      tooltip: 'First page tooltip',
      required: true,
      readOnly: false,
    });

    expect(second).toMatchObject({
      type: 'text',
      pageIndex: 1,
      tooltip: 'Second page tooltip',
      required: false,
      readOnly: true,
    });
  });

  it('prefers the explicit widget /P page reference when present', async () => {
    const { pdfDoc, page1Field } = await buildTwoPageTextFieldPdf();

    const widget = page1Field.acroField.getWidgets()[0];
    const page2Ref = pdfDoc.getPages()[1].ref;

    widget.setP(page2Ref);

    const extracted = extractFieldsForTest(pdfDoc);
    const field = extracted.find((entry) => entry.name === 'page1TextField');

    expect(field).toBeDefined();
    expect(field?.pageIndex).toBe(1);
  });

  it('extracts radio widgets across different pages when /P is missing', async () => {
    const { pdfDoc, radioGroup } = await buildTwoPageRadioPdf();

    const widgets = radioGroup.acroField.getWidgets();
    widgets.forEach((widget) => {
      widget.dict.delete(PDFName.of('P'));
    });

    const extracted = extractFieldsForTest(pdfDoc)
      .filter((field) => field.name === 'statusGroup')
      .sort((a, b) => a.pageIndex - b.pageIndex);

    expect(extracted).toHaveLength(2);
    expect(extracted[0]).toMatchObject({
      type: 'radio',
      pageIndex: 0,
      exportValue: 'draft',
      tooltip: 'Draft option',
      groupName: 'statusGroup',
      required: true,
    });
    expect(extracted[1]).toMatchObject({
      type: 'radio',
      pageIndex: 1,
      exportValue: 'final',
      tooltip: 'Final option',
      groupName: 'statusGroup',
      required: true,
    });
  });

  it('skips fields whose widgets cannot be resolved to any page', async () => {
    const { pdfDoc, page2Field } = await buildTwoPageTextFieldPdf();

    const page2Widget = page2Field.acroField.getWidgets()[0];
    const page2WidgetRef = getWidgetRef(page2Widget, pdfDoc);

    page2Widget.dict.delete(PDFName.of('P'));
    removeAnnotRefFromPage(pdfDoc, 1, page2WidgetRef);

    const extracted = extractFieldsForTest(pdfDoc);

    expect(extracted.map((field) => field.name)).toEqual(['page1TextField']);
    expect(
      extracted.find((field) => field.name === 'page2TextField')
    ).toBeUndefined();

    addAnnotRefToPage(pdfDoc, 1, page2WidgetRef);
    const extractedAfterRestore = extractFieldsForTest(pdfDoc);
    expect(extractedAfterRestore.map((field) => field.name).sort()).toEqual([
      'page1TextField',
      'page2TextField',
    ]);
  });

  it('matches the same real-world failure mode as the reported sample structure', async () => {
    const { pdfDoc, page1Field, page2Field } = await buildTwoPageTextFieldPdf();

    const page1Widget = page1Field.acroField.getWidgets()[0];
    const page2Widget = page2Field.acroField.getWidgets()[0];

    page1Widget.dict.delete(PDFName.of('P'));
    page2Widget.dict.delete(PDFName.of('P'));

    const page1Annots = getPageAnnotsArray(pdfDoc, 0);
    const page2Annots = getPageAnnotsArray(pdfDoc, 1);

    expect(page1Annots.asArray()).toHaveLength(1);
    expect(page2Annots.asArray()).toHaveLength(1);

    const extracted = extractFieldsForTest(pdfDoc);
    const pageMap = Object.fromEntries(
      extracted.map((field) => [field.name, field.pageIndex])
    );

    expect(pageMap).toEqual({
      page1TextField: 0,
      page2TextField: 1,
    });
  });

  it('extracts non-radio field metadata through the shared helper path', async () => {
    const { pdfDoc } = await buildTwoPageDropdownPdf();
    const dropdownWidget = pdfDoc
      .getForm()
      .getDropdown('statusSelect')
      .acroField.getWidgets()[0];

    dropdownWidget.dict.delete(PDFName.of('P'));

    const extracted = extractExistingFields({
      pdfDoc,
      fieldCounterStart: 7,
      metrics: TEST_EXTRACTION_METRICS,
    });

    const dropdownField = extracted.fields.find(
      (field) => field.name === 'statusSelect'
    );

    expect(extracted.nextFieldCounter).toBe(9);
    expect(extracted.extractedFieldNames.has('statusSelect')).toBe(true);
    expect(dropdownField).toMatchObject({
      id: 'field_8',
      type: 'dropdown',
      pageIndex: 1,
      tooltip: 'Status tooltip',
      options: ['Draft', 'Final'],
      defaultValue: 'Final',
    });
  });

  it('preserves widget geometry while resolving pages through /Annots fallback', async () => {
    const { pdfDoc, page2Field } = await buildTwoPageTextFieldPdf();

    const widget = page2Field.acroField.getWidgets()[0];
    const rect = widget.getRectangle();

    widget.dict.delete(PDFName.of('P'));

    const extracted = extractFieldsForTest(pdfDoc);
    const field = extracted.find((entry) => entry.name === 'page2TextField');

    expect(field).toBeDefined();
    expect(field).toMatchObject({
      pageIndex: 1,
      x: rect.x,
      y: pdfDoc.getPages()[1].getSize().height - rect.y - rect.height,
      width: rect.width,
      height: rect.height,
    });
  });

  it('does not confuse annotation ownership across pages when multiple widgets exist', async () => {
    const { pdfDoc, page1Field, page2Field } = await buildTwoPageTextFieldPdf();

    const extraPage1 = pdfDoc.getForm().createTextField('page1ExtraField');
    extraPage1.addToPage(pdfDoc.getPages()[0], {
      x: 40,
      y: 120,
      width: 140,
      height: 30,
      borderColor: rgb(0, 0, 0),
    });

    page1Field.acroField.getWidgets()[0].dict.delete(PDFName.of('P'));
    page2Field.acroField.getWidgets()[0].dict.delete(PDFName.of('P'));
    extraPage1.acroField.getWidgets()[0].dict.delete(PDFName.of('P'));

    const extracted = extractFieldsForTest(pdfDoc);
    const pageMap = new Map(
      extracted.map((field) => [field.name, field.pageIndex])
    );

    expect(pageMap.get('page1TextField')).toBe(0);
    expect(pageMap.get('page1ExtraField')).toBe(0);
    expect(pageMap.get('page2TextField')).toBe(1);
  });
});
