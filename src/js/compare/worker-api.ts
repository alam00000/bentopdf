import type {
  CompareTextItem,
  ComparePageSignature,
  ComparePagePair,
  CompareChangeSummary,
  CompareTextChange,
} from './types.ts';
import { diffTextRuns } from './engine/diff-text-runs.ts';
import { pairPages } from './engine/pair-pages.ts';

let worker: Worker | null = null;
let messageId = 0;
const pending = new Map<
  number,
  { resolve: (value: unknown) => void; reject: (reason: unknown) => void }
>();

function getWorker(): Worker | null {
  if (worker) return worker;
  try {
    worker = new Worker(
      new URL('./engine/compare.worker.ts', import.meta.url),
      { type: 'module' }
    );
    worker.onmessage = function (e) {
      const { id, type, ...rest } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (type === 'error') {
        p.reject(new Error((rest as { message: string }).message));
      } else {
        p.resolve(rest);
      }
    };
    worker.onerror = function () {
      worker?.terminate();
      worker = null;
      for (const [, p] of pending) {
        p.reject(new Error('Worker crashed'));
      }
      pending.clear();
    };
    return worker;
  } catch {
    return null;
  }
}

function postToWorker(msg: Record<string, unknown>): Promise<unknown> {
  const w = getWorker();
  if (!w) return Promise.reject(new Error('No worker'));
  const id = ++messageId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ ...msg, id });
  });
}

export async function diffTextRunsAsync(
  beforeItems: CompareTextItem[],
  afterItems: CompareTextItem[]
): Promise<{ changes: CompareTextChange[]; summary: CompareChangeSummary }> {
  try {
    const result = (await postToWorker({
      type: 'diff',
      beforeItems,
      afterItems,
    })) as { changes: CompareTextChange[]; summary: CompareChangeSummary };
    return result;
  } catch {
    return diffTextRuns(beforeItems, afterItems);
  }
}

export async function pairPagesAsync(
  leftPages: ComparePageSignature[],
  rightPages: ComparePageSignature[]
): Promise<ComparePagePair[]> {
  try {
    const result = (await postToWorker({
      type: 'pair',
      leftPages,
      rightPages,
    })) as { pairs: ComparePagePair[] };
    return result.pairs;
  } catch {
    return pairPages(leftPages, rightPages);
  }
}
