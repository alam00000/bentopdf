import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  PendingRedactionChange,
  PendingRedactionItem,
  RedactionPluginEvent,
  RedactionPluginLite,
} from '../js/types/edit-pdf-redaction-type.js';

const { redactDocumentData } = vi.hoisted(() => ({
  redactDocumentData: vi.fn(
    async (pdf: Uint8Array, terms: readonly string[] = []) =>
      Uint8Array.from([...pdf, terms.length])
  ),
}));

vi.mock('../js/utils/redact-document-data.js', () => ({
  redactDocumentData,
}));

vi.mock('../js/utils/disabled-tools.js', () => ({
  getEditorDisabledCategories: (): string[] => [],
}));

const { trackAppliedRedactions, redactionScrubTerms, scrubRedactedText } =
  await import('../js/logic/edit-pdf-page.js');

function mockRedactionPlugin() {
  const pendingListeners = new Set<(event: PendingRedactionChange) => void>();
  const eventListeners = new Set<(event: RedactionPluginEvent) => void>();
  const plugin: RedactionPluginLite = {
    getState: () => ({ pendingCount: 0 }),
    commitAllPending: () => ({ toPromise: async () => true }),
    onPendingChange: (listener) => {
      pendingListeners.add(listener);
      return () => pendingListeners.delete(listener);
    },
    onRedactionEvent: (listener) => {
      eventListeners.add(listener);
      return () => eventListeners.delete(listener);
    },
  };
  const pending = new Map<string, PendingRedactionItem[]>();
  const publish = (documentId: string) => {
    const items = pending.get(documentId) ?? [];
    for (const listener of pendingListeners) {
      listener({ documentId, pending: items.length ? { 0: items } : {} });
    }
  };
  const emit = (event: RedactionPluginEvent) => {
    for (const listener of eventListeners) listener(event);
  };
  return {
    plugin,
    mark(documentId: string, item: PendingRedactionItem) {
      pending.set(documentId, [...(pending.get(documentId) ?? []), item]);
      publish(documentId);
      emit({ type: 'add', documentId });
    },
    unmark(documentId: string, id: string) {
      pending.set(
        documentId,
        (pending.get(documentId) ?? []).filter((item) => item.id !== id)
      );
      publish(documentId);
      emit({ type: 'remove', documentId, id });
    },
    clearAll(documentId: string) {
      pending.set(documentId, []);
      publish(documentId);
      emit({ type: 'clear', documentId });
    },
    apply(documentId: string, ids?: string[]) {
      pending.set(
        documentId,
        ids
          ? (pending.get(documentId) ?? []).filter(
              (item) => !ids.includes(item.id)
            )
          : []
      );
      publish(documentId);
      emit({ type: 'commit', documentId });
    },
  };
}

describe('trackAppliedRedactions', () => {
  it('reports nothing when no redaction was applied', () => {
    const viewer = mockRedactionPlugin();
    const tracker = trackAppliedRedactions(viewer.plugin);
    viewer.mark('doc', { id: 'a', kind: 'text', text: 'Jane Doe' });
    expect(tracker.appliedTexts('doc')).toEqual([]);
  });

  it('keeps the text of applied text marks and skips removed marks', () => {
    const viewer = mockRedactionPlugin();
    const tracker = trackAppliedRedactions(viewer.plugin);
    viewer.mark('doc', { id: 'a', kind: 'text', text: 'Jane Doe' });
    viewer.mark('doc', { id: 'b', kind: 'text', text: 'Removed Mark' });
    viewer.unmark('doc', 'b');
    viewer.mark('doc', { id: 'c', kind: 'area' });
    viewer.apply('doc');
    expect(tracker.appliedTexts('doc')).toEqual(['Jane Doe', undefined]);
  });

  it('does not count marks removed with Clear all as applied', () => {
    const viewer = mockRedactionPlugin();
    const tracker = trackAppliedRedactions(viewer.plugin);
    viewer.mark('doc', { id: 'a', kind: 'text', text: 'Applied Text' });
    viewer.apply('doc');
    viewer.mark('doc', { id: 'b', kind: 'text', text: 'Acme Corp' });
    viewer.clearAll('doc');
    expect(tracker.appliedTexts('doc')).toEqual(['Applied Text']);
  });

  it('counts a single applied mark while others stay pending', () => {
    const viewer = mockRedactionPlugin();
    const tracker = trackAppliedRedactions(viewer.plugin);
    viewer.mark('doc', { id: 'a', kind: 'text', text: 'First' });
    viewer.mark('doc', { id: 'b', kind: 'text', text: 'Second' });
    viewer.apply('doc', ['a']);
    expect(tracker.appliedTexts('doc')).toEqual(['First']);
    viewer.apply('doc', ['b']);
    expect(tracker.appliedTexts('doc')).toEqual(['First', 'Second']);
  });

  it('keeps applied marks separate per document and forgets closed ones', () => {
    const viewer = mockRedactionPlugin();
    const tracker = trackAppliedRedactions(viewer.plugin);
    viewer.mark('one', { id: 'a', kind: 'text', text: 'Alpha' });
    viewer.mark('two', { id: 'b', kind: 'area' });
    viewer.apply('one');
    expect(tracker.appliedTexts('one')).toEqual(['Alpha']);
    expect(tracker.appliedTexts('two')).toEqual([]);
    tracker.forget('one');
    expect(tracker.appliedTexts('one')).toEqual([]);
  });

  it('treats a mark that comes back after a reload as pending again', () => {
    const viewer = mockRedactionPlugin();
    const tracker = trackAppliedRedactions(viewer.plugin);
    const item: PendingRedactionItem = { id: 'a', kind: 'text', text: 'X' };
    viewer.mark('doc', item);
    viewer.apply('doc');
    viewer.mark('doc', item);
    expect(tracker.appliedTexts('doc')).toEqual([]);
  });
});

describe('redactionScrubTerms', () => {
  it('splits lines, trims, dedupes case-insensitively and sorts longest first', () => {
    expect(
      redactionScrubTerms([
        'John',
        undefined,
        ' John Smith \r\nAcme Corp',
        'john',
        '\n',
      ])
    ).toEqual(['John Smith', 'Acme Corp', 'John']);
  });

  it('returns no terms for area-only redactions', () => {
    expect(redactionScrubTerms([undefined, undefined])).toEqual([]);
  });
});

describe('scrubRedactedText', () => {
  beforeEach(() => {
    redactDocumentData.mockClear();
  });

  it('runs one termless pass when no text is known', async () => {
    const out = await scrubRedactedText(Uint8Array.from([1]), []);
    expect(redactDocumentData).toHaveBeenCalledTimes(1);
    expect(redactDocumentData.mock.calls[0][1]).toEqual([]);
    expect([...out]).toEqual([1, 0]);
  });

  it('removes every term in a single pass', async () => {
    const out = await scrubRedactedText(Uint8Array.from([1]), ['abc', 'de']);
    expect(redactDocumentData).toHaveBeenCalledTimes(1);
    expect(redactDocumentData.mock.calls[0][1]).toEqual(['abc', 'de']);
    expect([...out]).toEqual([1, 2]);
  });
});
