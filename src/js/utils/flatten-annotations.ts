import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFArray,
  PDFRef,
  PDFNumber,
  PDFOperator,
  PDFOperatorNames,
} from 'pdf-lib';

function extractNumbers(arr: PDFArray, count: number): number[] | null {
  if (arr.size() < count) return null;
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const val = arr.lookup(i);
    if (!(val instanceof PDFNumber)) return null;
    result.push(val.asNumber());
  }
  return result;
}

function resolveStreamDict(obj: unknown): PDFDict | null {
  if (obj instanceof PDFDict) return obj;
  if (
    obj !== null &&
    typeof obj === 'object' &&
    'dict' in (obj as Record<string, unknown>)
  ) {
    const dict = (obj as { dict: unknown }).dict;
    if (dict instanceof PDFDict) return dict;
  }
  return null;
}

export function flattenAnnotations(pdfDoc: PDFDocument): void {
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const pageNode = page.node;
    const annotsArr = pageNode.Annots();
    if (!annotsArr) continue;

    const annotRefs = annotsArr.asArray();
    if (annotRefs.length === 0) continue;

    const keptAnnots: PDFRef[] = [];
    let hasChanges = false;

    for (const annotRef of annotRefs) {
      const annot = pdfDoc.context.lookup(annotRef);

      if (!(annot instanceof PDFDict)) {
        if (annotRef instanceof PDFRef) keptAnnots.push(annotRef);
        continue;
      }

      const subtype = annot.get(PDFName.of('Subtype'));
      const subtypeStr = subtype instanceof PDFName ? subtype.decodeText() : '';

      if (subtypeStr === 'Widget') {
        if (annotRef instanceof PDFRef) keptAnnots.push(annotRef);
        continue;
      }

      if (subtypeStr === 'Popup') {
        hasChanges = true;
        continue;
      }

      const flagsObj = annot.get(PDFName.of('F'));
      const flags = flagsObj instanceof PDFNumber ? flagsObj.asNumber() : 0;
      if (flags & 0x02) {
        hasChanges = true;
        continue;
      }

      const apDict = annot.lookup(PDFName.of('AP'));
      if (!(apDict instanceof PDFDict)) {
        hasChanges = true;
        continue;
      }

      let normalAppRef = apDict.get(PDFName.of('N'));
      if (!normalAppRef) {
        hasChanges = true;
        continue;
      }

      const normalApp = pdfDoc.context.lookup(normalAppRef);
      if (normalApp instanceof PDFDict && !normalApp.has(PDFName.of('BBox'))) {
        const as = annot.get(PDFName.of('AS'));
        if (as instanceof PDFName && normalApp.has(as)) {
          normalAppRef = normalApp.get(as)!;
        } else {
          hasChanges = true;
          continue;
        }
      }

      const rectObj = annot.lookup(PDFName.of('Rect'));
      if (!(rectObj instanceof PDFArray)) {
        hasChanges = true;
        continue;
      }

      const rectNums = extractNumbers(rectObj, 4);
      if (!rectNums) {
        hasChanges = true;
        continue;
      }

      const x1 = Math.min(rectNums[0], rectNums[2]);
      const y1 = Math.min(rectNums[1], rectNums[3]);
      const x2 = Math.max(rectNums[0], rectNums[2]);
      const y2 = Math.max(rectNums[1], rectNums[3]);

      if (x2 - x1 < 0.001 || y2 - y1 < 0.001) {
        hasChanges = true;
        continue;
      }

      const resolvedStream = pdfDoc.context.lookup(normalAppRef);
      let bbox = [0, 0, x2 - x1, y2 - y1];

      const streamDict = resolveStreamDict(resolvedStream);
      if (streamDict) {
        const bboxObj = streamDict.lookup(PDFName.of('BBox'));
        if (bboxObj instanceof PDFArray) {
          const bboxNums = extractNumbers(bboxObj, 4);
          if (bboxNums) bbox = bboxNums;
        }
      }

      let appRef: PDFRef;
      if (normalAppRef instanceof PDFRef) {
        appRef = normalAppRef;
      } else {
        appRef = pdfDoc.context.register(normalAppRef as PDFDict);
      }
      const xObjKey = pageNode.newXObject('FlatAnnot', appRef);

      const bw = bbox[2] - bbox[0];
      const bh = bbox[3] - bbox[1];
      const sx = Math.abs(bw) > 0.001 ? (x2 - x1) / bw : 1;
      const sy = Math.abs(bh) > 0.001 ? (y2 - y1) / bh : 1;
      const tx = x1 - bbox[0] * sx;
      const ty = y1 - bbox[1] * sy;

      page.pushOperators(
        PDFOperator.of(PDFOperatorNames.PushGraphicsState),
        PDFOperator.of(PDFOperatorNames.ConcatTransformationMatrix, [
          PDFNumber.of(sx),
          PDFNumber.of(0),
          PDFNumber.of(0),
          PDFNumber.of(sy),
          PDFNumber.of(tx),
          PDFNumber.of(ty),
        ]),
        PDFOperator.of(PDFOperatorNames.DrawObject, [xObjKey]),
        PDFOperator.of(PDFOperatorNames.PopGraphicsState)
      );

      hasChanges = true;
    }

    if (hasChanges) {
      if (keptAnnots.length > 0) {
        pageNode.set(PDFName.of('Annots'), pdfDoc.context.obj(keptAnnots));
      } else {
        pageNode.delete(PDFName.of('Annots'));
      }
    }
  }
}
