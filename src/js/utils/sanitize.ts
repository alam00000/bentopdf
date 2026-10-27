import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFArray,
  PDFStream,
  PDFObject,
  PDFRef,
  PDFRawStream,
  PDFFlateStream,
  PDFPageLeaf,
  PDFContext,
  decodePDFRawStream,
} from 'pdf-lib';
import {
  loadPdfDocument,
  removeUnreferencedObjects,
} from './load-pdf-document.js';
import { flattenFormsInDoc } from './flatten-annotations.js';
import { parseContentOperations } from './pdf-content-tokens.js';
import type { ContentOperation, PDFDocumentInternal } from '@/types';

import { trText } from '../i18n/i18n.js';

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

function forEachDict(pdfDoc: PDFDocument, visit: (dict: PDFDict) => void) {
  const walk = (value: PDFObject) => {
    if (value instanceof PDFStream) {
      walk(value.dict);
    } else if (value instanceof PDFDict) {
      visit(value);
      for (const [, entry] of value.entries()) walk(entry);
    } else if (value instanceof PDFArray) {
      for (const entry of value.asArray()) walk(entry);
    }
  };
  for (const [, object] of pdfDoc.context.enumerateIndirectObjects()) {
    walk(object);
  }
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
    forEachDict(pdfDoc, (dict) => {
      dict.delete(PDFName.of('Metadata'));
      dict.delete(PDFName.of('PieceInfo'));
      dict.delete(PDFName.of('Thumb'));
    });
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

const DANGEROUS_ACTIONS = new Set([
  'JavaScript',
  'Launch',
  'ImportData',
  'SubmitForm',
  'GoToE',
  'Rendition',
]);

function isDangerousAction(action: PDFDict): boolean {
  const type = action.lookup(PDFName.of('S'));
  return (
    action.has(PDFName.of('JS')) ||
    (type instanceof PDFName && DANGEROUS_ACTIONS.has(type.decodeText()))
  );
}

function keepSafeActions(
  context: PDFContext,
  value: PDFObject,
  seen: Set<PDFObject>
): PDFObject[] {
  const resolved = context.lookup(value);
  if (resolved instanceof PDFArray) {
    if (seen.has(resolved)) return [];
    seen.add(resolved);
    return resolved
      .asArray()
      .flatMap((item) => keepSafeActions(context, item, seen));
  }
  if (!(resolved instanceof PDFDict) || !isDangerousAction(resolved)) {
    return [value];
  }
  if (seen.has(resolved)) return [];
  seen.add(resolved);
  const next = resolved.get(PDFName.of('Next'));
  return next ? keepSafeActions(context, next, seen) : [];
}

function removeDangerousActions(context: PDFContext, dict: PDFDict) {
  dict.delete(PDFName.of('AA'));
  const keys = ['A', 'OpenAction', 'PA'];
  if (dict.has(PDFName.of('S'))) keys.push('Next');
  for (const key of keys) {
    const name = PDFName.of(key);
    const value = dict.get(name);
    if (value === undefined) continue;
    const resolved = context.lookup(value);
    if (key !== 'Next' && !(resolved instanceof PDFDict)) continue;
    const safeActions = keepSafeActions(context, value, new Set());
    const originalActions =
      resolved instanceof PDFArray ? resolved.asArray() : [value];
    if (
      safeActions.length === originalActions.length &&
      safeActions.every((item, i) => item === originalActions[i])
    ) {
      continue;
    }
    if (safeActions.length === 0) {
      dict.delete(name);
    } else if (key === 'Next' && safeActions.length > 1) {
      dict.set(name, context.obj(safeActions));
    } else {
      dict.set(name, safeActions[0]);
    }
  }
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

  const acroForm = catalogDict.lookup(PDFName.of('AcroForm'));
  if (acroForm instanceof PDFDict) {
    acroForm.delete(PDFName.of('XFA'));
    catalogDict.delete(PDFName.of('NeedsRendering'));
  }

  forEachDict(pdfDoc, (dict) => removeDangerousActions(pdfDoc.context, dict));
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

  for (const [, object] of pdfDoc.context.enumerateIndirectObjects()) {
    if (object instanceof PDFDict) {
      object.delete(PDFName.of('AF'));
    } else if (object instanceof PDFStream) {
      object.dict.delete(PDFName.of('AF'));
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

function createOptionalContentVisibility(pdfDoc: PDFDocument) {
  const context = pdfDoc.context;
  const ocProperties = pdfDoc.catalog.lookup(PDFName.of('OCProperties'));
  const config =
    ocProperties instanceof PDFDict
      ? ocProperties.lookup(PDFName.of('D'))
      : undefined;
  const getConfigGroups = (key: string) => {
    const list =
      config instanceof PDFDict ? config.lookup(PDFName.of(key)) : undefined;
    return new Set(
      list instanceof PDFArray
        ? list.asArray().map((item) => context.lookup(item))
        : []
    );
  };
  const onGroups = getConfigGroups('ON');
  const offGroups = getConfigGroups('OFF');
  const hiddenByDefault =
    config instanceof PDFDict &&
    config.lookup(PDFName.of('BaseState')) === PDFName.of('OFF');
  const isGroupVisible = (group: PDFObject) =>
    !offGroups.has(group) && (!hiddenByDefault || onGroups.has(group));
  const expressionCache = new Map<PDFObject, boolean | undefined>();

  const isExpressionVisible = (
    value: PDFObject | undefined,
    depth: number
  ): boolean | undefined => {
    const resolved = context.lookup(value);
    if (resolved instanceof PDFDict) return isGroupVisible(resolved);
    if (!(resolved instanceof PDFArray) || resolved.size() < 2 || depth > 32) {
      return undefined;
    }
    if (expressionCache.has(resolved)) return expressionCache.get(resolved);
    const operator = resolved.lookup(0);
    const results = resolved
      .asArray()
      .slice(1)
      .map((item) => isExpressionVisible(item, depth + 1));
    let result: boolean | undefined;
    if (!results.every((item) => item !== undefined)) {
      result = undefined;
    } else if (operator === PDFName.of('And')) {
      result = results.every(Boolean);
    } else if (operator === PDFName.of('Or')) {
      result = results.some(Boolean);
    } else if (operator === PDFName.of('Not') && results.length === 1) {
      result = !results[0];
    }
    expressionCache.set(resolved, result);
    return result;
  };

  return (value: PDFObject | undefined): boolean => {
    const dict = context.lookup(value);
    if (!(dict instanceof PDFDict)) return true;
    if (dict.lookup(PDFName.of('Type')) !== PDFName.of('OCMD')) {
      return isGroupVisible(dict);
    }
    if (dict.has(PDFName.of('VE'))) {
      return isExpressionVisible(dict.get(PDFName.of('VE')), 0) === true;
    }
    const groups = dict.lookup(PDFName.of('OCGs'));
    const states = (
      groups instanceof PDFArray
        ? groups.asArray().map((group) => context.lookup(group))
        : [groups]
    )
      .filter((group) => group instanceof PDFDict)
      .map((group) => isGroupVisible(group));
    if (states.length === 0) return true;
    const policy = dict.lookup(PDFName.of('P'));
    if (policy === undefined || policy === PDFName.of('AnyOn')) {
      return states.some(Boolean);
    }
    if (policy === PDFName.of('AllOn')) return states.every(Boolean);
    if (policy === PDFName.of('AnyOff')) return !states.every(Boolean);
    if (policy === PDFName.of('AllOff')) return !states.some(Boolean);
    return false;
  };
}

const STATE_OPERATORS = new Set(
  'q Q cm w J j M d ri i gs CS cs SC SCN sc scn G g RG rg K k BT ET Tc Tw Tz TL Tf Tr Ts Td TD Tm T* BX EX'.split(
    ' '
  )
);
const PATH_OPERATORS = new Set('m l c v y h re W W*'.split(' '));
const PAINT_OPERATORS = new Set('S s f F f* B B* b b* n'.split(' '));

function readStreamBytes(stream: PDFStream): Uint8Array {
  if (stream instanceof PDFRawStream) {
    return decodePDFRawStream(stream).decode();
  }
  if (stream instanceof PDFFlateStream) return stream.getUnencodedContents();
  return stream.getContents();
}

const NEWLINE = new Uint8Array([0x0a]);

function concatBytes(pieces: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(
    pieces.reduce((size, piece) => size + piece.length, 0)
  );
  let offset = 0;
  for (const piece of pieces) {
    result.set(piece, offset);
    offset += piece.length;
  }
  return result;
}

function readPageContent(page: PDFPageLeaf): Uint8Array | undefined {
  const contents = page.Contents();
  if (!contents) return undefined;
  const streams =
    contents instanceof PDFArray ? contents.asArray() : [contents];
  return concatBytes(
    streams.flatMap((item) => {
      const stream = page.context.lookup(item);
      return stream instanceof PDFStream
        ? [readStreamBytes(stream), NEWLINE]
        : [];
    })
  );
}

function isContentStream(dict: PDFDict): boolean {
  const subtype = dict.lookup(PDFName.of('Subtype'));
  return (
    subtype === PDFName.of('Form') ||
    (subtype === undefined &&
      dict.has(PDFName.of('BBox')) &&
      !dict.has(PDFName.of('ShadingType')))
  );
}

function removeHiddenContent(
  context: PDFContext,
  bytes: Uint8Array,
  resources: PDFDict | undefined,
  isVisible: (value: PDFObject | undefined) => boolean
): Uint8Array | undefined {
  const hiddenXObjects = new Set<PDFName>();
  const xObjects = resources?.lookup(PDFName.of('XObject'));
  if (xObjects instanceof PDFDict) {
    for (const [name, value] of xObjects.entries()) {
      const xObject = context.lookup(value);
      if (
        xObject instanceof PDFStream &&
        xObject.dict.has(PDFName.of('OC')) &&
        !isVisible(xObject.dict.get(PDFName.of('OC')))
      ) {
        hiddenXObjects.add(name);
      }
    }
  }
  if (
    hiddenXObjects.size === 0 &&
    !new TextDecoder('latin1').decode(bytes).includes('BDC')
  ) {
    return undefined;
  }

  const properties = resources?.lookup(PDFName.of('Properties'));
  const startsHiddenSection = (operation: ContentOperation) => {
    const [tag, property] = operation.operands;
    if (tag?.kind !== 'name' || PDFName.of(tag.value) !== PDFName.of('OC')) {
      return false;
    }
    const value =
      property?.kind === 'name' && properties instanceof PDFDict
        ? properties.get(PDFName.of(property.value))
        : undefined;
    if (value === undefined) {
      throw new Error(trText('Unresolved optional content reference'));
    }
    return !isVisible(value);
  };

  const encoder = new TextEncoder();
  const pieces: Uint8Array[] = [];
  const write = (...parts: Uint8Array[]) => pieces.push(NEWLINE, ...parts);
  const writeOperation = (operation: ContentOperation) =>
    write(bytes.subarray(operation.start, operation.end));
  const openSections: boolean[] = [];
  let hiddenDepth = 0;
  let path: ContentOperation[] = [];
  let changed = false;
  let previousEnd = 0;

  for (const operation of parseContentOperations(bytes)) {
    const { operator, operands } = operation;
    const hidden = hiddenDepth > 0;
    const gapStart = previousEnd;
    previousEnd = operation.end;
    const keepOriginal = () =>
      pieces.push(bytes.subarray(gapStart, operation.end));
    if (operator === 'BMC' || operator === 'BDC') {
      const startsHidden =
        !hidden && operator === 'BDC' && startsHiddenSection(operation);
      openSections.push(startsHidden);
      if (startsHidden) hiddenDepth++;
      if (hidden || startsHidden) {
        changed = true;
      } else {
        keepOriginal();
      }
      continue;
    }
    if (operator === 'EMC') {
      if (openSections.pop()) hiddenDepth--;
      if (hidden) {
        changed = true;
        if (hiddenDepth === 0) path = [];
      } else {
        keepOriginal();
      }
      continue;
    }
    if (!hidden) {
      const target = operands[0];
      if (
        operator === 'Do' &&
        target?.kind === 'name' &&
        hiddenXObjects.has(PDFName.of(target.value))
      ) {
        changed = true;
      } else {
        keepOriginal();
      }
      continue;
    }
    changed = true;
    if (STATE_OPERATORS.has(operator)) {
      writeOperation(operation);
    } else if (PATH_OPERATORS.has(operator)) {
      path.push(operation);
    } else if (PAINT_OPERATORS.has(operator)) {
      if (
        path.some((item) => item.operator === 'W' || item.operator === 'W*')
      ) {
        path.forEach(writeOperation);
        write(encoder.encode('n'));
      }
      path = [];
    } else if (operator === "'") {
      write(encoder.encode('T*'));
    } else if (operator === '"' && operands.length === 3) {
      write(
        bytes.subarray(operands[0].start, operands[0].end),
        encoder.encode(' Tw '),
        bytes.subarray(operands[1].start, operands[1].end),
        encoder.encode(' Tc T*')
      );
    }
  }

  if (!changed) return undefined;
  if (hiddenDepth === 0) pieces.push(bytes.subarray(previousEnd));
  return concatBytes(pieces);
}

function mergePageResources(pdfDoc: PDFDocument): PDFDict {
  const context = pdfDoc.context;
  const merged = new Map<string, Map<string, PDFObject>>();
  const conflicts = new Set<string>();

  for (const page of pdfDoc.getPages()) {
    const resources = page.node.Resources();
    for (const category of ['XObject', 'Properties']) {
      const entries = resources?.lookup(PDFName.of(category));
      if (!(entries instanceof PDFDict)) continue;
      const mergedEntries = merged.get(category) ?? new Map();
      merged.set(category, mergedEntries);
      for (const [name, value] of entries.entries()) {
        const key = `${category}/${name.decodeText()}`;
        const existing = mergedEntries.get(name.decodeText());
        if (existing && existing.toString() !== value.toString()) {
          conflicts.add(key);
        }
        mergedEntries.set(name.decodeText(), value);
      }
    }
  }

  const resources = context.obj({});
  for (const [category, entries] of merged) {
    const dict = context.obj({});
    for (const [name, value] of entries) {
      if (!conflicts.has(`${category}/${name}`)) {
        dict.set(PDFName.of(name), value);
      }
    }
    resources.set(PDFName.of(category), dict);
  }
  return resources;
}

function removeLayersFromDoc(pdfDoc: PDFDocument) {
  const catalogDict = getCatalogDict(pdfDoc);
  const context = pdfDoc.context;
  const pageContents: [PDFPageLeaf, Uint8Array][] = [];
  const streamContents: [PDFRef, PDFStream, Uint8Array][] = [];
  const hiddenAnnots = new Set<PDFObject>();
  const hiddenXObjects = new Set<PDFObject>();

  if (catalogDict.has(PDFName.of('OCProperties'))) {
    const isVisible = createOptionalContentVisibility(pdfDoc);

    for (const page of pdfDoc.getPages()) {
      const content = readPageContent(page.node);
      const filtered =
        content &&
        removeHiddenContent(context, content, page.node.Resources(), isVisible);
      if (filtered) pageContents.push([page.node, filtered]);

      for (const annotRef of page.node.Annots()?.asArray() ?? []) {
        const annot = context.lookup(annotRef);
        if (
          annot instanceof PDFDict &&
          annot.has(PDFName.of('OC')) &&
          !isVisible(annot.get(PDFName.of('OC')))
        ) {
          hiddenAnnots.add(annotRef);
        }
      }
    }

    const inheritedResources = mergePageResources(pdfDoc);
    for (const [ref, object] of context.enumerateIndirectObjects()) {
      if (!(object instanceof PDFStream)) continue;
      if (
        object.dict.has(PDFName.of('OC')) &&
        !isVisible(object.dict.get(PDFName.of('OC')))
      ) {
        hiddenXObjects.add(ref);
      }
      if (!isContentStream(object.dict)) continue;
      const resources = object.dict.lookup(PDFName.of('Resources'));
      const filtered = removeHiddenContent(
        context,
        readStreamBytes(object),
        resources instanceof PDFDict ? resources : inheritedResources,
        isVisible
      );
      if (filtered) streamContents.push([ref, object, filtered]);
    }
  }

  for (const [page, content] of pageContents) {
    page.set(
      PDFName.of('Contents'),
      context.register(context.flateStream(content))
    );
  }

  for (const [ref, stream, content] of streamContents) {
    const replacement = context.flateStream(content);
    for (const [key, value] of stream.dict.entries()) {
      if (
        !['Filter', 'DecodeParms', 'Length', 'DL'].includes(key.decodeText())
      ) {
        replacement.dict.set(key, value);
      }
    }
    context.assign(ref, replacement);
  }

  for (const page of pdfDoc.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    for (let i = annots.size() - 1; i >= 0; i--) {
      if (hiddenAnnots.has(annots.get(i))) annots.remove(i);
    }
  }

  catalogDict.delete(PDFName.of('OCProperties'));

  forEachDict(pdfDoc, (dict) => {
    dict.delete(PDFName.of('OCProperties'));
    dict.delete(PDFName.of('OC'));

    const xObjects = dict.lookup(PDFName.of('XObject'));
    if (xObjects instanceof PDFDict) {
      for (const [name, value] of xObjects.entries()) {
        if (hiddenXObjects.has(value)) xObjects.delete(name);
      }
    }

    const properties = dict.lookup(PDFName.of('Properties'));
    if (properties instanceof PDFDict) {
      for (const [name, value] of properties.entries()) {
        const type = lookupAsDict(pdfDoc, value)?.lookup(PDFName.of('Type'));
        if (type === PDFName.of('OCG') || type === PDFName.of('OCMD')) {
          properties.delete(name);
        }
      }
      if (properties.entries().length === 0) {
        dict.delete(PDFName.of('Properties'));
      }
    }
  });
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
): Promise<{ pdfDoc: PDFDocument; bytes: Uint8Array; skipped: string[] }> {
  const pdfDoc = await loadPdfDocument(pdfBytes);
  const skipped: string[] = [];

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
        skipped.push('flatten forms');
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
      skipped.push('remove JavaScript');
    }
  }

  if (options.removeEmbeddedFiles) {
    try {
      removeEmbeddedFilesFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove embedded files: ${getErrorMessage(e)}`);
      skipped.push('remove embedded files');
    }
  }

  if (options.removeLayers) {
    try {
      removeLayersFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove layers: ${getErrorMessage(e)}`);
      skipped.push('remove layers');
    }
  }

  if (options.removeLinks) {
    try {
      removeLinksFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove links: ${getErrorMessage(e)}`);
      skipped.push('remove links');
    }
  }

  if (options.removeStructureTree) {
    try {
      removeStructureTreeFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove structure tree: ${getErrorMessage(e)}`);
      skipped.push('remove the structure tree');
    }
  }

  if (options.removeMarkInfo) {
    try {
      removeMarkInfoFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove MarkInfo: ${getErrorMessage(e)}`);
      skipped.push('remove MarkInfo');
    }
  }

  if (options.removeFonts) {
    try {
      removeFontsFromDoc(pdfDoc);
    } catch (e: unknown) {
      console.warn(`Could not remove fonts: ${getErrorMessage(e)}`);
      skipped.push('remove fonts');
    }
  }

  const savedBytes = await pdfDoc.save();
  return {
    pdfDoc,
    bytes: await removeUnreferencedObjects(savedBytes),
    skipped,
  };
}
