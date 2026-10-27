export interface PendingRedactionItem {
  id: string;
  kind: 'text' | 'area';
  text?: string;
}

export interface PendingRedactionChange {
  documentId: string;
  pending: Record<number, PendingRedactionItem[]>;
}

export interface RedactionPluginEvent {
  type: string;
  documentId: string;
  id?: string;
}

export interface RedactionPluginLite {
  getState: () => { pendingCount: number };
  commitAllPending: () => { toPromise: () => Promise<boolean> };
  onPendingChange: (
    listener: (event: PendingRedactionChange) => void
  ) => () => void;
  onRedactionEvent: (
    listener: (event: RedactionPluginEvent) => void
  ) => () => void;
}

export interface ActiveDocumentSource {
  getActiveDocumentId: () => string | null;
}

export interface AppliedRedactionTracker {
  appliedTexts: (documentId: string) => (string | undefined)[];
  forget: (documentId: string) => void;
}
