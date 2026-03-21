import type {
  ComparePageModel,
  ComparePageResult,
  CompareCategorySummary,
} from '../types.ts';
import { diffTextRuns } from './diff-text-runs.ts';
import { diffTextRunsAsync } from '../worker-api.ts';
import {
  classifyChangeCategory,
  diffAnnotations,
  diffImages,
  buildCategorySummary,
} from './compare-content.ts';

const EMPTY_CATEGORY_SUMMARY: CompareCategorySummary = {
  text: 0,
  image: 0,
  'header-footer': 0,
  annotation: 0,
  formatting: 0,
  background: 0,
};

export function comparePageModels(
  leftPage: ComparePageModel | null,
  rightPage: ComparePageModel | null
): ComparePageResult {
  return comparePageModelsCore(leftPage, rightPage, false) as ComparePageResult;
}

export function comparePageModelsAsync(
  leftPage: ComparePageModel | null,
  rightPage: ComparePageModel | null
): Promise<ComparePageResult> {
  return comparePageModelsCore(
    leftPage,
    rightPage,
    true
  ) as Promise<ComparePageResult>;
}

function comparePageModelsCore(
  leftPage: ComparePageModel | null,
  rightPage: ComparePageModel | null,
  useWorker: boolean
): ComparePageResult | Promise<ComparePageResult> {
  if (leftPage && !rightPage) {
    return {
      status: 'left-only',
      leftPageNumber: leftPage.pageNumber,
      rightPageNumber: null,
      changes: [
        {
          id: 'page-removed',
          type: 'page-removed',
          category: 'text',
          description: `Page ${leftPage.pageNumber} exists only in the first PDF.`,
          beforeText: leftPage.plainText.slice(0, 200),
          afterText: '',
          beforeRects: [],
          afterRects: [],
        },
      ],
      summary: { added: 0, removed: 1, modified: 0, moved: 0, styleChanged: 0 },
      categorySummary: { ...EMPTY_CATEGORY_SUMMARY, text: 1 },
      visualDiff: null,
      usedOcr: leftPage.source === 'ocr',
    };
  }

  if (!leftPage && rightPage) {
    return {
      status: 'right-only',
      leftPageNumber: null,
      rightPageNumber: rightPage.pageNumber,
      changes: [
        {
          id: 'page-added',
          type: 'page-added',
          category: 'text',
          description: `Page ${rightPage.pageNumber} exists only in the second PDF.`,
          beforeText: '',
          afterText: rightPage.plainText.slice(0, 200),
          beforeRects: [],
          afterRects: [],
        },
      ],
      summary: { added: 1, removed: 0, modified: 0, moved: 0, styleChanged: 0 },
      categorySummary: { ...EMPTY_CATEGORY_SUMMARY, text: 1 },
      visualDiff: null,
      usedOcr: rightPage.source === 'ocr',
    };
  }

  if (!leftPage || !rightPage) {
    return {
      status: 'match',
      leftPageNumber: null,
      rightPageNumber: null,
      changes: [],
      summary: { added: 0, removed: 0, modified: 0, moved: 0, styleChanged: 0 },
      categorySummary: { ...EMPTY_CATEGORY_SUMMARY },
      visualDiff: null,
      usedOcr: false,
    };
  }

  function buildResult(diff: {
    changes: ComparePageResult['changes'];
    summary: ComparePageResult['summary'];
  }): ComparePageResult {
    const allChanges = [...diff.changes];
    const pageHeight = Math.max(leftPage!.height, rightPage!.height);

    for (const c of allChanges) {
      if (c.category === 'text') {
        c.category = classifyChangeCategory(c, pageHeight);
      }
    }

    const annotChanges = diffAnnotations(
      leftPage!.annotations ?? [],
      rightPage!.annotations ?? [],
      allChanges.length
    );
    allChanges.push(...annotChanges);

    const imageChanges = diffImages(
      leftPage!.images ?? [],
      rightPage!.images ?? [],
      allChanges.length
    );
    allChanges.push(...imageChanges);

    return {
      status: allChanges.length > 0 ? 'changed' : 'match',
      leftPageNumber: leftPage!.pageNumber,
      rightPageNumber: rightPage!.pageNumber,
      changes: allChanges,
      summary: diff.summary,
      categorySummary: buildCategorySummary(allChanges),
      visualDiff: null,
      usedOcr: leftPage!.source === 'ocr' || rightPage!.source === 'ocr',
    };
  }

  if (useWorker) {
    return diffTextRunsAsync(leftPage.textItems, rightPage.textItems).then(
      buildResult
    );
  }

  return buildResult(diffTextRuns(leftPage.textItems, rightPage.textItems));
}
