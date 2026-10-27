import {
  PDFArray,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFObject,
  PDFRawStream,
  PDFRef,
  PDFStream,
  PDFString,
  decodePDFRawStream,
} from 'pdf-lib';
import type { PDFDocument } from 'pdf-lib';
import {
  loadPdfDocument,
  removeUnreferencedObjects,
} from './load-pdf-document.js';

const ANNOTATION_TEXT_KEYS = ['Contents', 'RC', 'T', 'Subj'];
const NON_TEXT_KEYS = new Set(
  ['CreationDate', 'ModDate', 'M', 'ID'].map((key) => PDFName.of(key))
);
const SIGNATURE_TYPES = new Set(
  ['Sig', 'DocTimeStamp'].map((type) => PDFName.of(type))
);
const SIGNATURE_BINARY_KEYS = new Set(
  ['Contents', 'Cert'].map((key) => PDFName.of(key))
);

function decodeText(value: PDFObject | undefined): string | null {
  if (value instanceof PDFString || value instanceof PDFHexString) {
    return value.decodeText();
  }
  return null;
}

function decodeStream(stream: PDFRawStream): Uint8Array | null {
  try {
    return decodePDFRawStream(stream).decode();
  } catch {
    return null;
  }
}

function removeTextFromDocument(doc: PDFDocument, terms: string[]): void {
  const context = doc.context;
  const needles = terms.map((term) => term.toLowerCase());
  const pattern = new RegExp(
    [...terms]
      .sort((a, b) => b.length - a.length)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'),
    'gi'
  );
  const contains = (text: string) => {
    const lowered = text.toLowerCase();
    return needles.some((needle) => lowered.includes(needle));
  };
  const valueContains = (value: PDFObject | undefined): boolean => {
    if (value instanceof PDFArray) return value.asArray().some(valueContains);
    const text = decodeText(value);
    return text !== null && contains(text);
  };
  const resolve = (value: PDFObject | undefined) =>
    value instanceof PDFRef ? context.lookup(value) : value;

  const matchedFiles = new Set<string>();
  for (const [ref, object] of context.enumerateIndirectObjects()) {
    if (
      !(object instanceof PDFRawStream) ||
      object.dict.get(PDFName.of('Type')) !== PDFName.of('EmbeddedFile')
    ) {
      continue;
    }
    const bytes = decodeStream(object);
    if (!bytes) continue;
    const latin1 = new TextDecoder('latin1').decode(bytes);
    const utf16 = new TextDecoder('utf-16le').decode(bytes);
    if (contains(latin1) || contains(utf16)) matchedFiles.add(ref.toString());
  }

  const isMatchedFileSpec = (value: PDFObject | undefined): boolean => {
    const spec = resolve(value);
    if (!(spec instanceof PDFDict)) return false;
    const ef = resolve(spec.get(PDFName.of('EF')));
    if (!(ef instanceof PDFDict)) return false;
    return ef
      .values()
      .some((v) => v instanceof PDFRef && matchedFiles.has(v.toString()));
  };

  const fieldValueContains = (widget: PDFDict): boolean => {
    let node: PDFObject | undefined = widget;
    for (let depth = 0; node instanceof PDFDict && depth < 32; depth++) {
      if (valueContains(resolve(node.get(PDFName.of('V'))))) return true;
      node = resolve(node.get(PDFName.of('Parent')));
    }
    return false;
  };

  let clearedFieldAppearance = false;
  for (const page of doc.getPages()) {
    page.node.delete(PDFName.of('Thumb'));
    const annots = page.node.Annots();
    if (!annots) continue;

    const removed = new Set<string>();
    for (const entry of annots.asArray()) {
      const annot = resolve(entry);
      if (!(annot instanceof PDFDict)) continue;
      const subtype = annot.get(PDFName.of('Subtype'));

      if (subtype === PDFName.of('Widget')) {
        if (fieldValueContains(annot)) {
          annot.delete(PDFName.of('AP'));
          clearedFieldAppearance = true;
        }
        continue;
      }

      const hasText = ANNOTATION_TEXT_KEYS.some((key) =>
        valueContains(resolve(annot.get(PDFName.of(key))))
      );
      const hasFile =
        subtype === PDFName.of('FileAttachment') &&
        isMatchedFileSpec(annot.get(PDFName.of('FS')));
      if (hasText || hasFile) {
        removed.add(entry.toString());
        const popup = annot.get(PDFName.of('Popup'));
        if (popup) removed.add(popup.toString());
      }
    }

    if (removed.size > 0) {
      page.node.set(
        PDFName.of('Annots'),
        context.obj(
          annots.asArray().filter((entry) => !removed.has(entry.toString()))
        )
      );
    }
  }

  if (clearedFieldAppearance) {
    const acroForm = resolve(doc.catalog.get(PDFName.of('AcroForm')));
    if (acroForm instanceof PDFDict) {
      acroForm.set(PDFName.of('NeedAppearances'), context.obj(true));
    }
  }

  const pruneNameTree = (value: PDFObject | undefined, depth = 0) => {
    const node = resolve(value);
    if (!(node instanceof PDFDict) || depth > 32) return;
    const names = resolve(node.get(PDFName.of('Names')));
    if (names instanceof PDFArray) {
      const items = names.asArray();
      const kept: PDFObject[] = [];
      for (let i = 0; i + 1 < items.length; i += 2) {
        if (!isMatchedFileSpec(items[i + 1])) kept.push(items[i], items[i + 1]);
      }
      node.set(PDFName.of('Names'), context.obj(kept));
    }
    const kids = resolve(node.get(PDFName.of('Kids')));
    if (kids instanceof PDFArray) {
      for (const kid of kids.asArray()) pruneNameTree(kid, depth + 1);
    }
  };
  const pruneAssociatedFiles = (dict: PDFDict) => {
    const list = resolve(dict.get(PDFName.of('AF')));
    if (!(list instanceof PDFArray)) return;
    const kept = list.asArray().filter((spec) => !isMatchedFileSpec(spec));
    if (kept.length !== list.size()) {
      dict.set(PDFName.of('AF'), context.obj(kept));
    }
  };

  if (matchedFiles.size > 0) {
    const names = resolve(doc.catalog.get(PDFName.of('Names')));
    if (names instanceof PDFDict) {
      pruneNameTree(names.get(PDFName.of('EmbeddedFiles')));
    }
    for (const [, object] of context.enumerateIndirectObjects()) {
      if (object instanceof PDFDict) pruneAssociatedFiles(object);
      else if (object instanceof PDFStream) pruneAssociatedFiles(object.dict);
    }
  }

  const scrubValue = (value: PDFObject): PDFObject | null => {
    const text = decodeText(value);
    if (text !== null && contains(text)) {
      return PDFHexString.fromText(text.replace(pattern, ''));
    }
    if (value instanceof PDFDict || value instanceof PDFArray) {
      scrubContainer(value);
    }
    return null;
  };

  const scrubContainer = (container: PDFDict | PDFArray) => {
    if (container instanceof PDFDict) {
      const type = container.get(PDFName.of('Type'));
      const isSignature = type instanceof PDFName && SIGNATURE_TYPES.has(type);
      for (const [key, value] of container.entries()) {
        if (NON_TEXT_KEYS.has(key)) continue;
        if (isSignature && SIGNATURE_BINARY_KEYS.has(key)) continue;
        const replacement = scrubValue(value);
        if (replacement) container.set(key, replacement);
      }
    } else {
      container.asArray().forEach((value, index) => {
        const replacement = scrubValue(value);
        if (replacement) container.set(index, replacement);
      });
    }
  };

  for (const [ref, object] of context.enumerateIndirectObjects()) {
    if (object instanceof PDFStream) {
      scrubContainer(object.dict);
      const isMetadata =
        object.dict.get(PDFName.of('Type')) === PDFName.of('Metadata');
      if (isMetadata && object instanceof PDFRawStream) {
        const bytes = decodeStream(object);
        const xml = bytes ? new TextDecoder('utf-8').decode(bytes) : null;
        if (xml !== null && contains(xml)) {
          context.assign(
            ref,
            context.flateStream(xml.replace(pattern, ''), {
              Type: 'Metadata',
              Subtype: 'XML',
            })
          );
        }
      }
    } else if (object instanceof PDFDict || object instanceof PDFArray) {
      scrubContainer(object);
    }
  }
}

export async function redactDocumentData(
  pdf: Uint8Array,
  terms: readonly string[] = []
): Promise<Uint8Array> {
  const doc = await loadPdfDocument(pdf);
  const searchTerms = terms.filter((term) => term.length > 0);
  if (searchTerms.length > 0) {
    removeTextFromDocument(doc, searchTerms);
  } else {
    for (const page of doc.getPages()) page.node.delete(PDFName.of('Thumb'));
  }
  return removeUnreferencedObjects(await doc.save());
}
