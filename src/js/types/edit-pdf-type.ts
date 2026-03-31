export interface DocManagerPlugin {
  onDocumentClosed: (
    callback: (data: { id?: string } | string) => void
  ) => void;
  onDocumentOpened: (
    callback: (data: { id?: string; name?: string }) => void
  ) => void;
  openDocumentBuffer: (opts: {
    buffer: ArrayBuffer;
    name?: string;
    autoActivate?: boolean;
  }) => void;
  closeDocument: (id: string) => void;
  saveAsCopy: (id: string) => Promise<Uint8Array>;
}
