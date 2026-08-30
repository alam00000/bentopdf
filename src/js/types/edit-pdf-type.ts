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

export interface EditorAnnotationRect {
  origin: { x: number; y: number };
  size: { width: number; height: number };
}

export interface EditorAnnotationObjectLite {
  id?: string;
  pageIndex?: number;
  type?: number;
  intent?: string;
  contents?: string;
  fontSize?: number;
  fontColor?: string;
  textAlign?: number;
  verticalAlign?: number;
  opacity?: number;
  color?: string;
  backgroundColor?: string;
  rect?: EditorAnnotationRect;
  rotation?: number;
  fontFamilyName?: string;
  fontPostScriptName?: string;
  fontFaceName?: string;
}

export interface AnnotationPluginLite {
  getState: () => {
    byUid: Record<string, { object: EditorAnnotationObjectLite }>;
  };
}

export interface FreeTextSystemFontAnnotation {
  id: string;
  pageIndex: number;
  contents: string;
  fontSize: number;
  fontColor: string;
  textAlign: number;
  verticalAlign: number;
  opacity: number;
  backgroundColor?: string;
  rect: EditorAnnotationRect;
  fontPostScriptName: string;
  rotation?: number;
}
