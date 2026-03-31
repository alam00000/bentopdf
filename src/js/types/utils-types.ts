import type { PDFName, PDFObject } from 'pdf-lib';

export interface PDFDictLike {
  keys(): PDFName[];
  values(): PDFObject[];
  entries(): [PDFName, PDFObject][];
  set(key: PDFName, value: PDFObject): void;
  get(key: PDFName, preservePDFNull?: boolean): PDFObject | undefined;
  has(key: PDFName): boolean;
  delete(key: PDFName): boolean;
  lookup(key: PDFName): PDFObject | undefined;
  asArray?(): PDFObject[];
}

export interface WindowWithCoherentPdf {
  coherentpdf?: unknown;
}

export interface WindowWithLucide {
  lucide?: {
    createIcons(): void;
  };
}

export interface WindowWithI18next {
  i18next?: {
    t(key: string): string;
  };
}

export interface GlobalScopeWithGhostscript {
  loadGS?: (config: { baseUrl: string }) => Promise<GhostscriptDynamicInstance>;
  GhostscriptWASM?: new (url: string) => GhostscriptDynamicInstance;
}

export interface GhostscriptDynamicInstance {
  convertToPDFA?(pdfBuffer: ArrayBuffer, profile: string): Promise<ArrayBuffer>;
  fontToOutline?(pdfBuffer: ArrayBuffer): Promise<ArrayBuffer>;
  init?(): Promise<void>;
}

export interface PyMuPDFCompressOptions {
  images: {
    enabled: boolean;
    quality: number;
    dpiTarget: number;
    dpiThreshold: number;
    convertToGray: boolean;
  };
  scrub: {
    metadata: boolean;
    thumbnails: boolean;
    xmlMetadata?: boolean;
  };
  subsetFonts: boolean;
  save: {
    garbage: 4;
    deflate: boolean;
    clean: boolean;
    useObjstms: boolean;
  };
}

export interface PyMuPDFExtractTextOptions {
  format?: string;
  pages?: number[];
}

export interface PyMuPDFRasterizeOptions {
  dpi?: number;
  format?: string;
  pages?: number[];
  grayscale?: boolean;
  quality?: number;
}

export interface PyMuPDFDocument {
  pageCount: number;
  pages: (() => PyMuPDFPage[]) & PyMuPDFPage[];
  needsPass: boolean;
  isEncrypted: boolean;
  authenticate(password: string): boolean;
  getPage(index: number): PyMuPDFPage;
  save(): Uint8Array;
  close(): void;
  getLayerConfig?(): unknown[];
  addLayer?(name: string): { number: number; xref: number };
  setLayerConfig?(layers: unknown[]): void;
  setLayerVisibility?(xref: number, visible: boolean): void;
  deleteOCG?(xref: number): void;
  addOCGWithParent?(
    name: string,
    parentXref: number
  ): { number: number; xref: number };
  addOCG?(name: string): { number: number; xref: number };
  applyRedactions?(): void;
  searchFor?(text: string, pageNum: number): unknown[];
}

export interface PyMuPDFPage {
  getText(format?: string): string;
  getImages(): Array<{ data: Uint8Array; ext: string; xref: number }>;
  extractTables?(): unknown[];
  findTables(): Array<{
    rows: (string | null)[][];
    markdown: string;
    rowCount: number;
    colCount: number;
  }>;
  extractImage(xref: number): { data: Uint8Array; ext: string } | null;
  toSvg?(): string;
  toPixmap?(options?: { dpi?: number }): {
    toBlob(format: string, quality?: number): Blob;
  };
  addRedactAnnot?(rect: unknown): void;
  searchFor(text: string): unknown[];
  addRedaction(rect: unknown, text: string, fill: unknown): void;
  applyRedactions(): void;
}

export interface PyMuPDFTextToPdfOptions {
  fontSize?: number;
  pageSize?: string;
  fontName?: string;
  textColor?: string;
  margins?: number;
}

export interface PyMuPDFDeskewOptions {
  threshold?: number;
  dpi?: number;
}

export interface PyMuPDFInstance {
  load(): Promise<void>;
  compressPdf(
    file: Blob,
    options: PyMuPDFCompressOptions
  ): Promise<{ blob: Blob; compressedSize: number; usedFallback?: boolean }>;
  convertToPdf(
    file: Blob | File,
    ext: string | { filetype: string }
  ): Promise<Blob>;
  extractText(file: Blob, options?: PyMuPDFExtractTextOptions): Promise<string>;
  extractImages(file: Blob): Promise<Array<{ data: Uint8Array; ext: string }>>;
  extractTables(file: Blob): Promise<unknown[]>;
  toSvg(file: Blob, pageNum: number): Promise<string>;
  renderPageToImage(file: Blob, pageNum: number, scale: number): Promise<Blob>;
  getPageCount(file: Blob): Promise<number>;
  rasterizePdf(
    file: Blob | File,
    options: PyMuPDFRasterizeOptions
  ): Promise<Blob>;
  open(file: Blob | File, password?: string): Promise<PyMuPDFDocument>;
  textToPdf(text: string, options?: PyMuPDFTextToPdfOptions): Promise<Blob>;
  pdfToDocx(file: Blob | File): Promise<Blob>;
  pdfToMarkdown(
    file: Blob | File,
    options?: { includeImages?: boolean }
  ): Promise<string>;
  pdfToText(file: Blob | File): Promise<string>;
  deskewPdf(
    file: Blob,
    options?: PyMuPDFDeskewOptions
  ): Promise<{
    pdf: Blob;
    result: {
      totalPages: number;
      correctedPages: number;
      angles: number[];
      corrected: boolean[];
    };
  }>;
  imageToPdf(file: File, options?: { imageType?: string }): Promise<Blob>;
  imagesToPdf(files: File[]): Promise<Blob>;
  htmlToPdf(html: string, options: unknown): Promise<Blob>;
  pdfToLlamaIndex(file: File): Promise<unknown>;
}

export type { QpdfInstance as QpdfWasmInstance } from '@neslinesli93/qpdf-wasm';

export interface QpdfInstanceExtended {
  callMain: (args: string[]) => number;
  FS: EmscriptenFSExtended;
}

export interface EmscriptenFSExtended {
  mkdir: (path: string) => void;
  mount: (
    type: unknown,
    opts: { blobs: { name: string; data: Blob }[] },
    mountPoint: string
  ) => void;
  unmount: (mountPoint: string) => void;
  writeFile: (
    path: string,
    data: Uint8Array | string,
    opts?: { encoding?: string }
  ) => void;
  readFile: (path: string, opts?: { encoding?: string }) => Uint8Array;
  unlink: (path: string) => void;
  analyzePath: (path: string) => { exists: boolean };
}

export interface CpdfInstance {
  setSlow: () => void;
  fromMemory: (data: Uint8Array, userpw: string) => unknown;
  isEncrypted: (pdf: unknown) => boolean;
  decryptPdf: (pdf: unknown, password: string) => void;
  decryptPdfOwner: (pdf: unknown, password: string) => void;
  toMemory: (pdf: unknown, linearize: boolean, makeId: boolean) => Uint8Array;
  deletePdf: (pdf: unknown) => void;
  startGetBookmarkInfo: (pdf: unknown) => void;
  numberBookmarks: () => number;
  getBookmarkLevel: (index: number) => number;
  getBookmarkPage: (pdf: unknown, index: number) => number;
  endGetBookmarkInfo: () => void;
  parsePagespec: (pdf: unknown, pagespec: string) => unknown;
  removePageLabels: (pdf: unknown) => void;
  all: (pdf: unknown) => unknown;
  addPageLabels: (
    pdf: unknown,
    style: unknown,
    prefix: string,
    offset: number,
    range: unknown,
    progress: boolean
  ) => void;
  decimalArabic: number;
  lowercaseRoman: number;
  uppercaseRoman: number;
  lowercaseLetters: number;
  uppercaseLetters: number;
  noLabelPrefixOnly?: number;
}
