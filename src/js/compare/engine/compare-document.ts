import type {
  ComparePageModel,
  ComparePagePair,
  ComparePageResult,
  CompareChangeSummary,
  CompareTextChange,
  CompareTextItem,
} from '../types.ts';
import {
  classifyChangeCategory,
  diffAnnotations,
  diffImages,
  buildCategorySummary,
  isHeaderFooterZone,
} from './compare-content.ts';
import { comparePageModels } from './compare-page-models.ts';
import { diffTextRuns } from './diff-text-runs.ts';
import { itemPositionKey, repeatedItemKeys } from './fixed-layer.ts';

export interface DocumentPagePair {
  pair: ComparePagePair;
  left: ComparePageModel | null;
  right: ComparePageModel | null;
}

function tagItems(
  items: CompareTextItem[],
  pageNumber: number
): CompareTextItem[] {
  return items.map((item) => ({ ...item, pageNumber }));
}

function documentRepeatedKeys(
  pages: DocumentPagePair[],
  side: 'left' | 'right'
): Set<string> {
  const models = pages
    .map((entry) => entry[side])
    .filter((model): model is ComparePageModel => model !== null);
  return repeatedItemKeys(models);
}

function isFixedItem(
  item: CompareTextItem,
  pageHeight: number,
  repeatedKeys: Set<string>
): boolean {
  return (
    item.layer === 'background' ||
    isHeaderFooterZone([item.rect], pageHeight) ||
    repeatedKeys.has(itemPositionKey(item))
  );
}

function splitPageItems(
  model: ComparePageModel,
  repeatedKeys: Set<string>,
  detectFixed: boolean
): { flow: CompareTextItem[]; fixed: CompareTextItem[] } {
  const flow: CompareTextItem[] = [];
  const fixed: CompareTextItem[] = [];
  for (const item of model.textItems) {
    if (detectFixed && isFixedItem(item, model.height, repeatedKeys)) {
      fixed.push(item);
    } else {
      flow.push(item);
    }
  }
  return { flow, fixed };
}

export function collectDocumentItems(
  pages: DocumentPagePair[],
  detectFixed = true
): {
  beforeItems: CompareTextItem[];
  afterItems: CompareTextItem[];
} {
  const leftRepeated = detectFixed
    ? documentRepeatedKeys(pages, 'left')
    : new Set<string>();
  const rightRepeated = detectFixed
    ? documentRepeatedKeys(pages, 'right')
    : new Set<string>();
  const beforeItems: CompareTextItem[] = [];
  const afterItems: CompareTextItem[] = [];

  for (const { left, right } of pages) {
    if (!left || !right) continue;
    beforeItems.push(
      ...tagItems(
        splitPageItems(left, leftRepeated, detectFixed).flow,
        left.pageNumber
      )
    );
    afterItems.push(
      ...tagItems(
        splitPageItems(right, rightRepeated, detectFixed).flow,
        right.pageNumber
      )
    );
  }

  return { beforeItems, afterItems };
}

function summarizeChanges(changes: CompareTextChange[]): CompareChangeSummary {
  const summary: CompareChangeSummary = {
    added: 0,
    removed: 0,
    modified: 0,
    moved: 0,
    styleChanged: 0,
  };
  for (const change of changes) {
    if (change.type === 'added') summary.added += 1;
    else if (change.type === 'removed') summary.removed += 1;
    else if (change.type === 'modified') summary.modified += 1;
    else if (change.type === 'moved') summary.moved += 1;
    else if (change.type === 'style-changed') summary.styleChanged += 1;
  }
  return summary;
}

export function buildDocumentResults(
  pages: DocumentPagePair[],
  diff: { changes: CompareTextChange[]; summary: CompareChangeSummary },
  detectFixed = true
): Map<number, ComparePageResult> {
  const results = new Map<number, ComparePageResult>();
  const pairByLeftPage = new Map<number, DocumentPagePair>();
  const pairByRightPage = new Map<number, DocumentPagePair>();
  const bucketedChanges = new Map<number, CompareTextChange[]>();
  const leftRepeated = detectFixed
    ? documentRepeatedKeys(pages, 'left')
    : new Set<string>();
  const rightRepeated = detectFixed
    ? documentRepeatedKeys(pages, 'right')
    : new Set<string>();

  for (const entry of pages) {
    const { pair, left, right } = entry;
    if (left && right) {
      pairByLeftPage.set(left.pageNumber, entry);
      pairByRightPage.set(right.pageNumber, entry);
      bucketedChanges.set(pair.pairIndex, []);
    } else {
      const result = comparePageModels(left, right);
      result.confidence = pair.confidence;
      results.set(pair.pairIndex, result);
    }
  }

  const pushInto = (
    entry: DocumentPagePair | undefined,
    change: CompareTextChange
  ) => {
    if (!entry) return;
    bucketedChanges.get(entry.pair.pairIndex)?.push(change);
  };

  for (const change of diff.changes) {
    const before =
      change.beforePage != null
        ? pairByLeftPage.get(change.beforePage)
        : undefined;
    const after =
      change.afterPage != null
        ? pairByRightPage.get(change.afterPage)
        : undefined;

    if (change.type === 'added') {
      pushInto(after, change);
    } else if (change.type === 'removed') {
      pushInto(before, change);
    } else if (
      before &&
      after &&
      before.pair.pairIndex === after.pair.pairIndex
    ) {
      pushInto(before, change);
    } else {
      pushInto(before, { ...change, id: `${change.id}-b`, afterRects: [] });
      pushInto(after, { ...change, id: `${change.id}-a`, beforeRects: [] });
    }
  }

  for (const entry of pages) {
    const { pair, left, right } = entry;
    if (!left || !right) continue;

    const pageHeight = Math.max(left.height, right.height);
    const fixedChanges = diffTextRuns(
      splitPageItems(left, leftRepeated, detectFixed).fixed,
      splitPageItems(right, rightRepeated, detectFixed).fixed
    ).changes.map((change) => ({ ...change, id: `fixed-${change.id}` }));
    const textChanges = [
      ...(bucketedChanges.get(pair.pairIndex) ?? []),
      ...fixedChanges,
    ];
    for (const change of textChanges) {
      if (change.category === 'text') {
        change.category = classifyChangeCategory(change, pageHeight);
      }
    }

    const allChanges = [...textChanges];
    allChanges.push(
      ...diffAnnotations(
        left.annotations ?? [],
        right.annotations ?? [],
        allChanges.length
      )
    );
    allChanges.push(
      ...diffImages(left.images ?? [], right.images ?? [], allChanges.length)
    );

    results.set(pair.pairIndex, {
      status: allChanges.length > 0 ? 'changed' : 'match',
      leftPageNumber: left.pageNumber,
      rightPageNumber: right.pageNumber,
      changes: allChanges,
      summary: summarizeChanges(textChanges),
      categorySummary: buildCategorySummary(allChanges),
      visualDiff: null,
      confidence: pair.confidence,
      usedOcr: left.source === 'ocr' || right.source === 'ocr',
    });
  }

  return results;
}
