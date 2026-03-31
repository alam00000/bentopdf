import { diffTextRuns } from './diff-text-runs.ts';
import { pairPages } from './pair-pages.ts';
import type {
  CompareTextItem,
  ComparePageSignature,
  ComparePagePair,
  CompareChangeSummary,
  CompareTextChange,
} from '../types.ts';

interface DiffMessage {
  type: 'diff';
  id: number;
  beforeItems: CompareTextItem[];
  afterItems: CompareTextItem[];
}

interface PairMessage {
  type: 'pair';
  id: number;
  leftPages: ComparePageSignature[];
  rightPages: ComparePageSignature[];
}

type WorkerMessage = DiffMessage | PairMessage;

interface DiffResult {
  type: 'diff';
  id: number;
  changes: CompareTextChange[];
  summary: CompareChangeSummary;
}

interface PairResult {
  type: 'pair';
  id: number;
  pairs: ComparePagePair[];
}

interface ErrorResult {
  type: 'error';
  id: number;
  message: string;
}

self.onmessage = function (e: MessageEvent<WorkerMessage>) {
  const msg = e.data;
  try {
    if (msg.type === 'diff') {
      const { changes, summary } = diffTextRuns(
        msg.beforeItems,
        msg.afterItems
      );
      const result: DiffResult = {
        type: 'diff',
        id: msg.id,
        changes,
        summary,
      };
      self.postMessage(result);
    } else if (msg.type === 'pair') {
      const pairs = pairPages(msg.leftPages, msg.rightPages);
      const result: PairResult = { type: 'pair', id: msg.id, pairs };
      self.postMessage(result);
    }
  } catch (err) {
    const result: ErrorResult = {
      type: 'error',
      id: msg.id,
      message: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(result);
  }
};
