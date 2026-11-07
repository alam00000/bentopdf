import type {
  CompareTextItem,
  ComparePageSignature,
  ComparePagePair,
  CompareChangeSummary,
  CompareTextChange,
} from './types.ts';
import { diffTextRuns } from './engine/diff-text-runs.ts';
import { pairPages } from './engine/pair-pages.ts';
import { trText } from '../i18n/i18n.js';

export function diffStrings(): Record<string, string> {
  const strings: Record<string, string> = {};
  const add = (english: string, translated: string) => {
    strings[english] = translated;
  };
  add(
    'Replaced "{{beforeText}}" with "{{afterText}}"',
    trText("تم استبدال \"{{beforeText}}\" بـ \"{{afterText}}\"")
  );
  add('Removed "{{beforeText}}"', trText("تمت إزالة \"{{beforeText}}\""));
  add('Added "{{afterText}}"', trText("تمت إضافة \"{{afterText}}\""));
  add(
    'Style changed ({{length}} regions)',
    trText("تم تغيير النمط ({{length}} من المناطق)")
  );
  add('Font: {{bFont}} → {{aFont}}', trText("الخط: {{bFont}} ← {{aFont}}"));
  add(
    'Font size: {{bSize}} → {{aSize}}',
    trText("حجم الخط: {{bSize}} ← {{aSize}}")
  );
  add('Moved "{{value}}"', trText("تم نقل \"{{value}}\""));
  return strings;
}

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
        p.reject(new Error(trText("تعطل العامل")));
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
  if (!w) return Promise.reject(new Error(trText("لا يوجد عامل معالجة")));
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
      strings: diffStrings(),
    })) as { changes: CompareTextChange[]; summary: CompareChangeSummary };
    return result;
  } catch {
    return diffTextRuns(beforeItems, afterItems, diffStrings());
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
