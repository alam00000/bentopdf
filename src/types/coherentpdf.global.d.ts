/*
 * coherentpdf.global.d.ts — TypeScript type definitions for BentoPDF / CoherentPDF integration
 *
 * These type definitions were written by Alam for use in the BentoPDF project.
 * They describe APIs provided by the CoherentPDF library (cpdf.js) but are original
 * work created for type safety and integration.
 *
 * Copyright © 2026 BentoPDF
 * Licensed under the GNU Affero General Public License v3.0 or later (AGPLv3+).
 */
declare global {
  /** Opaque type representing a loaded PDF document instance. */
  type CoherentPdf = object;

  /** Represents a page range, which is an array of page numbers. */
  type CpdfPageRange = number[];

  // --- Type Aliases from Constants ---
  type CpdfPermission = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  type CpdfEncryptionMethod = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  type CpdfPaperSize = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
  type CpdfPositionAnchor = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  type CpdfFont = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  type CpdfJustification = 0 | 1 | 2;
  type CpdfLayout = 0 | 1 | 2 | 3 | 4 | 5;
  type CpdfMode = 0 | 1 | 2 | 3 | 4;
  type CpdfLabelStyle = 0 | 1 | 2 | 3 | 4;
}

// This tells TypeScript that a variable named 'coherentpdf'
// exists in the global scope and has this shape.
declare const coherentpdf: {
  //   0. Preliminaries

  /**
   * Returns a string giving the version number of the CPDF library.
   * @returns The version number.
   */
  version(): string;

  /**
   * Sets the global operation mode to 'fast'. The default is 'slow' mode, which works
   * even on old-fashioned files.
   */
  setFast(): void;

  /**
   * Sets the global operation mode to 'slow'. The default is 'slow' mode, which works
   * even on old-fashioned files.
   */
  setSlow(): void;

  /**
   * Delete a PDF so the memory representing it may be recovered. Must be called for every loaded PDF.
   * @param pdf PDF document to delete.
   */
  deletePdf(pdf: CoherentPdf): void;

  /**
   * A debug function which prints some information about resource usage.
   * Can be used to detect if PDFs or ranges are being deallocated properly.
   */
  onexit(): void;

  //   1. Basics

  /**
   * Loads a PDF file from a given filename. Supply a user password (possibly blank)
   * if the file is encrypted.
   * @param filename File name.
   * @param userpw User password, or blank if none.
   * @returns The loaded PDF document instance.
   */
  fromFile(filename: string, userpw: string): CoherentPdf;

  /**
   * Loads a PDF from a file, doing only minimal parsing (lazily).
   * @param filename File name.
   * @param userpw User password, or blank if none.
   * @returns The loaded PDF document instance.
   */
  fromFileLazy(filename: string, userpw: string): CoherentPdf;

  /**
   * Loads a file from memory given any user password.
   * @param data PDF document as an array of bytes.
   * @param userpw User password, or blank if none.
   * @returns The loaded PDF document instance.
   */
  fromMemory(data: Uint8Array, userpw: string): CoherentPdf;

  /**
   * Loads a file from memory, but lazily (minimal parsing).
   * @param data PDF document as an array of bytes.
   * @param userpw User password, or blank if none.
   * @returns The loaded PDF document instance.
   */
  fromMemoryLazy(data: Uint8Array, userpw: string): CoherentPdf;

  /**
   * Starts enumeration of currently allocated PDFs and returns the total number of PDFs found.
   * Follow with `enumeratePDFsKey` or `enumeratePDFsInfo`.
   * @returns The number of currently allocated PDFs.
   */
  startEnumeratePDFs(): number;

  /**
   * Returns the PDF key for the allocated PDF at the given index (0-based).
   * @param n Index number.
   * @returns PDF key.
   */
  enumeratePDFsKey(n: number): number;

  /**
   * Returns information about the allocated PDF at the given index (0-based).
   * @param n Index number.
   * @returns PDF information.
   */
  enumeratePDFsInfo(n: number): number;

  /**
   * Cleans up after PDF enumeration.
   */
  endEnumeratePDFs(): void;

  /**
   * Converts a figure in centimetres to points (72 points to 1 inch).
   * @param i Figure in centimetres.
   * @returns Figure in points.
   */
  ptOfCm(i: number): number;

  /**
   * Converts a figure in millimetres to points (72 points to 1 inch).
   * @param i Figure in millimetres.
   * @returns Figure in points.
   */
  ptOfMm(i: number): number;

  /**
   * Converts a figure in inches to points (72 points to 1 inch).
   * @param i Figure in inches.
   * @returns Figure in points.
   */
  ptOfIn(i: number): number;

  /**
   * Converts a figure in points to centimetres.
   * @param i Figure in points.
   * @returns Figure in centimetres.
   */
  cmOfPt(i: number): number;

  /**
   * Converts a figure in points to millimetres.
   * @param i Figure in points.
   * @returns Figure in millimetres.
   */
  mmOfPt(i: number): number;

  /**
   * Converts a figure in points to inches.
   * @param i Figure in points.
   * @returns Figure in inches.
   */
  inOfPt(i: number): number;

  /**
   * Parses a page specification string (e.g., "1-3,5,end") and returns a page range array.
   * Validation checks that referenced pages exist within the PDF.
   * @param pdf The PDF document (used for validation).
   * @param pagespec The page specification string.
   * @returns The parsed page range array.
   */
  parsePagespec(pdf: CoherentPdf, pagespec: string): CpdfPageRange;

  /**
   * Validates a page specification string syntactically without needing a PDF document.
   * @param pagespec The page specification string.
   * @returns True if the page specification is syntactically valid.
   */
  validatePagespec(pagespec: string): boolean;

  /**
   * Builds a page specification string from a page range array.
   * @param pdf The PDF document.
   * @param r The page range array.
   * @returns The page specification string (e.g., "1-3,6-end").
   */
  stringOfPagespec(pdf: CoherentPdf, r: CpdfPageRange): string;

  /**
   * Creates an empty page range array.
   * @returns An empty page range.
   */
  blankRange(): CpdfPageRange;

  /**
   * Builds a page range array from one page (`f`) to another inclusive (`t`).
   * @param f Starting page number.
   * @param t Ending page number.
   * @returns The page range array.
   */
  range(f: number, t: number): CpdfPageRange;

  /**
   * Creates a page range array containing all pages in the given document.
   * @param pdf The PDF document.
   * @returns The page range array for all pages.
   */
  all(pdf: CoherentPdf): CpdfPageRange;

  /**
   * Creates a new range containing only the even pages of the input range.
   * @param r_in The input page range.
   * @returns The resulting page range of even pages.
   */
  even(r_in: CpdfPageRange): CpdfPageRange;

  /**
   * Creates a new range containing only the odd pages of the input range.
   * @param r_in The input page range.
   * @returns The resulting page range of odd pages.
   */
  odd(r_in: CpdfPageRange): CpdfPageRange;

  /**
   * Computes the union of two page ranges (pages found in A OR B).
   * @param a First page range.
   * @param b Second page range.
   * @returns The resulting page range.
   */
  rangeUnion(a: CpdfPageRange, b: CpdfPageRange): CpdfPageRange;

  /**
   * Computes the difference of two ranges (pages in A, excluding those also in B).
   * @param a First page range.
   * @param b Second page range.
   * @returns The resulting page range.
   */
  difference(a: CpdfPageRange, b: CpdfPageRange): CpdfPageRange;

  /**
   * Creates a new range by removing duplicate page numbers from the input range.
   * @param a The input page range.
   * @returns The deduplicated page range.
   */
  removeDuplicates(a: CpdfPageRange): CpdfPageRange;

  /**
   * Returns the number of pages contained within a range.
   * @param r The page range.
   * @returns The length of the range.
   */
  rangeLength(r: CpdfPageRange): number;

  /**
   * Gets the page number at position `n` (0-based) in a range.
   * @param r The page range.
   * @param n The position index.
   * @returns The page number at the given position.
   */
  rangeGet(r: CpdfPageRange, n: number): number;

  /**
   * Adds a page number to a range, if it is not already present.
   * @param r The page range.
   * @param page The page number to add.
   */
  rangeAdd(r: CpdfPageRange, page: number): void;

  /**
   * Returns true if the given page number is included in the range.
   * @param r The page range.
   * @param page The page number to check.
   * @returns True if the page is in the range.
   */
  isInRange(r: CpdfPageRange, page: number): boolean;

  /**
   * Returns the total number of pages in the PDF document.
   * @param pdf The PDF document.
   * @returns The number of pages.
   */
  pages(pdf: CoherentPdf): number;

  /**
   * Returns the number of pages in a file as fast as possible, without loading the whole file.
   * @param password The user password.
   * @param filename The file name.
   * @returns The number of pages.
   */
  pagesFast(password: string, filename: string): number;

  /**
   * Returns the number of pages in memory data as fast as possible, without loading the whole file.
   * @param password The user password.
   * @param data The PDF file as a byte array.
   * @returns The number of pages.
   */
  pagesFastMemory(password: string, data: Uint8Array): number;

  /**
   * Writes the PDF document to a file.
   * @param pdf The PDF document.
   * @param filename The file name to write to.
   * @param linearize If true, linearizes the PDF for fast web view.
   * @param make_id If true, generates a new `/ID`.
   */
  toFile(pdf: CoherentPdf, filename: string, linearize: boolean, make_id: boolean): void;

  /**
   * Writes the PDF to a file with extended control over object streams.
   * **WARNING**: The `pdf` argument is **invalid** after this call and should not be used again.
   * @param pdf The PDF document.
   * @param filename The file name to write to.
   * @param linearize If true, linearizes the PDF.
   * @param make_id If true, generates a new `/ID`.
   * @param preserve_objstm Preserve existing object streams.
   * @param generate_objstm Create new object streams.
   * @param compress_objstm Compress new object streams.
   */
  toFileExt(pdf: CoherentPdf, filename: string, linearize: boolean, make_id: boolean, preserve_objstm: boolean, generate_objstm: boolean, compress_objstm: boolean): void;

  /**
   * Writes the PDF document to memory as a byte array.
   * @param pdf The PDF document.
   * @param linearize If true, linearizes the PDF.
   * @param make_id If true, generates a new `/ID`.
   * @returns The PDF document as a byte array.
   */
  toMemory(pdf: CoherentPdf, linearize: boolean, make_id: boolean): Uint8Array;

  /**
   * Writes the PDF to memory as a byte array with extended control over object streams.
   * **WARNING**: The `pdf` argument is **invalid** after this call and should not be used again.
   * @param pdf The PDF document.
   * @param linearize If true, linearizes the PDF.
   * @param make_id If true, generates a new `/ID`.
   * @param preserve_objstm Preserve existing object streams.
   * @param generate_objstm Create new object streams.
   * @param compress_objstm Compress new object streams.
   * @returns The PDF file as a byte array.
   */
  toMemoryExt(pdf: CoherentPdf, linearize: boolean, make_id: boolean, preserve_objstm: boolean, generate_objstm: boolean, compress_objstm: boolean): Uint8Array;

  /**
   * Returns true if the PDF document is encrypted, false otherwise.
   * @param pdf The PDF document.
   * @returns True if encrypted.
   */
  isEncrypted(pdf: CoherentPdf): boolean;

  /**
   * Attempts to decrypt a PDF using the given user password. Raises an exception on failure.
   * @param pdf The PDF document.
   * @param userpw User password.
   */
  decryptPdf(pdf: CoherentPdf, userpw: string): void;

  /**
   * Attempts to decrypt a PDF using the given owner password. Raises an exception on failure.
   * @param pdf The PDF document.
   * @param ownerpw Owner password.
   */
  decryptPdfOwner(pdf: CoherentPdf, ownerpw: string): void;

  /** Cannot edit the document (0) */
  readonly noEdit: CpdfPermission;
  /** Cannot print the document (1) */
  readonly noPrint: CpdfPermission;
  /** Cannot copy the document (2) */
  readonly noCopy: CpdfPermission;
  /** Cannot annotate the document (3) */
  readonly noAnnot: CpdfPermission;
  /** Cannot edit forms in the document (4) */
  readonly noForms: CpdfPermission;
  /** Cannot extract information (5) */
  readonly noExtract: CpdfPermission;
  /** Cannot assemble into a bigger document (6) */
  readonly noAssemble: CpdfPermission;
  /** Cannot print high quality (7) */
  readonly noHqPrint: CpdfPermission;
  /** 40 bit RC4 encryption (0) */
  readonly pdf40bit: CpdfEncryptionMethod;
  /** 128 bit RC4 encryption (1) */
  readonly pdf128bit: CpdfEncryptionMethod;
  /** 128 bit AES encryption, do not encrypt metadata (2) */
  readonly aes128bitfalse: CpdfEncryptionMethod;
  /** 128 bit AES encryption, encrypt metadata (3) */
  readonly aes128bittrue: CpdfEncryptionMethod;
  /** Deprecated: 256 bit AES encryption, do not encrypt metadata (4) */
  readonly aes256bitfalse: CpdfEncryptionMethod;
  /** Deprecated: 256 bit AES encryption, encrypt metadata (5) */
  readonly aes256bittrue: CpdfEncryptionMethod;
  /** 256 bit AES encryption (ISO standard), do not encrypt metadata (6) */
  readonly aes256bitisofalse: CpdfEncryptionMethod;
  /** 256 bit AES encryption (ISO standard), encrypt metadata (7) */
  readonly aes256bitisotrue: CpdfEncryptionMethod;

  /**
   * Writes the PDF document to a file with encryption applied.
   * @param pdf The PDF document.
   * @param encryption_method The encryption method constant.
   * @param permissions An array of permission constants (restrictions).
   * @param ownerpw Owner password.
   * @param userpw User password.
   * @param linearize If true, linearizes the PDF.
   * @param makeid If true, generates a new `/ID`.
   * @param filename The file name to write to.
   */
  toFileEncrypted(pdf: CoherentPdf, encryption_method: CpdfEncryptionMethod, permissions: CpdfPermission[], ownerpw: string, userpw: string, linearize: boolean, makeid: boolean, filename: string): void;

  /**
   * Writes the PDF document to memory as a byte array with encryption applied.
   * @param pdf The PDF document.
   * @param encryption_method The encryption method constant.
   * @param permissions An array of permission constants (restrictions).
   * @param ownerpw Owner password.
   * @param userpw User password.
   * @param linearize If true, linearizes the PDF.
   * @param makeid If true, generates a new `/ID`.
   * @returns The encrypted PDF file as a byte array.
   */
  toMemoryEncrypted(pdf: CoherentPdf, encryption_method: CpdfEncryptionMethod, permissions: CpdfPermission[], ownerpw: string, userpw: string, linearize: boolean, makeid: boolean): Uint8Array;

  /**
   * Writes the PDF to a file with encryption and extended control over object streams.
   * **WARNING**: The `pdf` argument is **invalid** after this call.
   */
  toFileEncryptedExt(pdf: CoherentPdf, encryption_method: CpdfEncryptionMethod, permissions: CpdfPermission[], ownerpw: string, userpw: string, linearize: boolean, makeid: boolean, preserve_objstm: boolean, generate_objstm: boolean, compress_objstm: boolean, filename: string): void;

  /**
   * Writes the PDF to memory with encryption and extended control over object streams.
   * **WARNING**: The `pdf` argument is **invalid** after this call.
   * @returns The encrypted PDF file as a byte array.
   */
  toMemoryEncryptedExt(pdf: CoherentPdf, encryption_method: CpdfEncryptionMethod, permissions: CpdfPermission[], ownerpw: string, userpw: string, linearize: boolean, makeid: boolean, preserve_objstm: boolean, generate_objstm: boolean, compress_objstm: boolean): Uint8Array;

  /**
   * Returns true if the given permission (restriction) is present on the PDF.
   * @param pdf The PDF document.
   * @param permission The permission constant (e.g., `noCopy`).
   * @returns True if the restriction is active.
   */
  hasPermission(pdf: CoherentPdf, permission: CpdfPermission): boolean;

  /**
   * Returns the encryption method currently used on the document.
   * @param pdf The PDF document.
   * @returns The encryption method constant.
   */
  encryptionKind(pdf: CoherentPdf): CpdfEncryptionMethod;

  //   2. Merging and Splitting

  /**
   * Merges a list of PDF documents into a single new PDF.
   * @param pdfs Array of PDF documents to merge.
   * @returns The merged PDF document.
   */
  mergeSimple(pdfs: CoherentPdf[]): CoherentPdf;

  /**
   * Merges PDFs with options for handling numbering and fonts.
   * @param pdfs Array of PDF documents to merge.
   * @param retain_numbering If true, page labels/numbering are not rewritten.
   * @param remove_duplicate_fonts If true, attempts to merge duplicate font resources.
   * @returns The merged PDF document.
   */
  merge(pdfs: CoherentPdf[], retain_numbering: boolean, remove_duplicate_fonts: boolean): CoherentPdf;

  /**
   * Merges PDFs, allowing a specific page range to be selected from each input PDF.
   * This is useful to avoid duplicating content information if source PDFs overlap.
   * @param pdfs Array of PDF documents to merge.
   * @param retain_numbering If true, keeps page numbering.
   * @param remove_duplicate_fonts If true, removes duplicate font data.
   * @param ranges Array of page ranges, one for each input PDF.
   * @returns The merged PDF document.
   */
  mergeSame(pdfs: CoherentPdf[], retain_numbering: boolean, remove_duplicate_fonts: boolean, ranges: CpdfPageRange[]): CoherentPdf;

  /**
   * Creates a new document containing only the pages specified in the page range.
   * @param pdf The source PDF document.
   * @param r The page range to select.
   * @returns The new PDF document.
   */
  selectPages(pdf: CoherentPdf, r: CpdfPageRange): CoherentPdf;

  // Pages

  /**
   * Scales the page dimensions and content by the given scale factors (`sx`, `sy`), centered at (0, 0).
   * Page boxes (crop, media, etc.) are adjusted accordingly.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param sx X-axis scale factor.
   * @param sy Y-axis scale factor.
   */
  scalePages(pdf: CoherentPdf, range: CpdfPageRange, sx: number, sy: number): void;

  /**
   * Scales the content to fit new page dimensions (`sx` width x `sy` height), multiplied by a final `scale`.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param sx Target width dimension.
   * @param sy Target height dimension.
   * @param scale Overall scale factor (typically 1.0).
   */
  scaleToFit(pdf: CoherentPdf, range: CpdfPageRange, sx: number, sy: number, scale: number): void;

  /** A0 Portrait paper (0) */
  readonly a0portrait: CpdfPaperSize;
  /** A1 Portrait paper (1) */
  readonly a1portrait: CpdfPaperSize;
  /** A2 Portrait paper (2) */
  readonly a2portrait: CpdfPaperSize;
  /** A3 Portrait paper (3) */
  readonly a3portrait: CpdfPaperSize;
  /** A4 Portrait paper (4) */
  readonly a4portrait: CpdfPaperSize;
  /** A5 Portrait paper (5) */
  readonly a5portrait: CpdfPaperSize;
  /** A0 Landscape paper (6) */
  readonly a0landscape: CpdfPaperSize;
  /** A1 Landscape paper (7) */
  readonly a1landscape: CpdfPaperSize;
  /** A2 Landscape paper (8) */
  readonly a2landscape: CpdfPaperSize;
  /** A3 Landscape paper (9) */
  readonly a3landscape: CpdfPaperSize;
  /** A4 Landscape paper (10) */
  readonly a4landscape: CpdfPaperSize;
  /** A5 Landscape paper (11) */
  readonly a5landscape: CpdfPaperSize;
  /** US Letter Portrait paper (12) */
  readonly usletterportrait: CpdfPaperSize;
  /** US Letter Landscape paper (13) */
  readonly usletterlandscape: CpdfPaperSize;
  /** US Legal Portrait paper (14) */
  readonly uslegalportrait: CpdfPaperSize;
  /** US Legal Landscape paper (15) */
  readonly uslegallandscape: CpdfPaperSize;

  /**
   * Scales the page content to fit the given predefined paper size, possibly multiplied by an overall scale factor.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param papersize The paper size constant.
   * @param s Overall scale factor.
   */
  scaleToFitPaper(pdf: CoherentPdf, range: CpdfPageRange, papersize: CpdfPaperSize, s: number): void;

  /** Absolute centre (0) */
  readonly posCentre: CpdfPositionAnchor;
  /** Absolute left (1) */
  readonly posLeft: CpdfPositionAnchor;
  /** Absolute right (2) */
  readonly posRight: CpdfPositionAnchor;
  /** The top centre of the page (3) */
  readonly top: CpdfPositionAnchor;
  /** The top left of the page (4) */
  readonly topLeft: CpdfPositionAnchor;
  /** The top right of the page (5) */
  readonly topRight: CpdfPositionAnchor;
  /** The left hand side of the page, halfway down (6) */
  readonly left: CpdfPositionAnchor;
  /** The bottom left of the page (7) */
  readonly bottomLeft: CpdfPositionAnchor;
  /** The bottom middle of the page (8) */
  readonly bottom: CpdfPositionAnchor;
  /** The bottom right of the page (9) */
  readonly bottomRight: CpdfPositionAnchor;
  /** The right hand side of the page, halfway down (10) */
  readonly right: CpdfPositionAnchor;
  /** Diagonal, bottom left to top right (0 parameters) (11) */
  readonly diagonal: CpdfPositionAnchor;
  /** Diagonal, top left to bottom right (0 parameters) (12) */
  readonly reversediagonal: CpdfPositionAnchor;

  /**
   * Scales the contents of pages in the range about a point defined by the anchor and parameters (`p1`, `p2`).
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param anchor The position anchor constant.
   * @param p1 Position argument 1.
   * @param p2 Position argument 2.
   * @param scale Scale factor.
   */
  scaleContents(pdf: CoherentPdf, range: CpdfPageRange, anchor: CpdfPositionAnchor, p1: number, p2: number, scale: number): void;

  /**
   * Shifts the content of the pages in the range by the given horizontal (`dx`) and vertical (`dy`) amounts.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param dx X shift distance.
   * @param dy Y shift distance.
   */
  shiftContents(pdf: CoherentPdf, range: CpdfPageRange, dx: number, dy: number): void;

  /**
   * Changes the viewing rotation of the pages to an absolute value (0, 90, 180, or 270).
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param rotation The absolute rotation value.
   */
  rotate(pdf: CoherentPdf, range: CpdfPageRange, rotation: number): void;

  /**
   * Rotates the content about the centre of the page by the given number of degrees, in a clockwise direction.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param rotation The angle in degrees.
   */
  rotateBy(pdf: CoherentPdf, range: CpdfPageRange, rotation: number): void;

  /**
   * Rotates the content about the centre of the page by the given number of degrees, in a clockwise direction.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param angle The angle in degrees.
   */
  rotateContents(pdf: CoherentPdf, range: CpdfPageRange, angle: number): void;

  /**
   * Changes the viewing rotation of the pages while counter-rotating the dimensions and content
   * such that there is no visual change (makes the document 'upright').
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  upright(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Flips the pages in the range horizontally.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  hFlip(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Flips the pages in the range vertically.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  vFlip(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Crops a page by replacing any existing crop box. Dimensions are in points.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param x X position of the new crop box.
   * @param y Y position of the new crop box.
   * @param w Width of the new crop box.
   * @param h Height of the new crop box.
   */
  crop(pdf: CoherentPdf, range: CpdfPageRange, x: number, y: number, w: number, h: number): void;

  /**
   * Removes any crop box from pages in the range.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  removeCrop(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Removes any trim box from pages in the range.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  removeTrim(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Removes any art box from pages in the range.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  removeArt(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Removes any bleed box from pages in the range.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  removeBleed(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Adds trim marks to the given pages, provided a trim box exists.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  trimMarks(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Shows the page boxes (media, crop, trim, etc.) on the given pages, primarily for debug.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   */
  showBoxes(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Makes a given box a 'hard box', explicitly clipping content to its boundaries.
   * @param pdf The PDF document.
   * @param range The page range to affect.
   * @param boxname The name of the box (e.g., "/CropBox").
   */
  hardBox(pdf: CoherentPdf, range: CpdfPageRange, boxname: string): void;

  //   5. Compression

  /**
   * Compresses any uncompressed streams in the PDF using the Flate algorithm.
   * @param pdf The PDF document.
   */
  compress(pdf: CoherentPdf): void;

  /**
   * Decompresses any supported compressed streams in the PDF.
   * @param pdf The PDF document.
   */
  decompress(pdf: CoherentPdf): void;

  /**
   * Optimizes the PDF structure in memory.
   * @param pdf The PDF document.
   */
  squeezeInMemory(pdf: CoherentPdf): void;

  //   6. Bookmarks

  /**
   * Starts the process of retrieving bookmark information from a PDF.
   * Follow with `numberBookmarks` and accessor functions.
   * @param pdf The PDF document.
   */
  startGetBookmarkInfo(pdf: CoherentPdf): void;

  /**
   * Gets the total number of bookmarks available after calling `startGetBookmarkInfo`.
   * @returns The number of bookmarks.
   */
  numberBookmarks(): number;

  /**
   * Gets the nesting level (0-based) for the bookmark at index `n`.
   * @param n The bookmark index (0-based).
   * @returns The bookmark level.
   */
  getBookmarkLevel(n: number): number;

  /**
   * Gets the target page number (1-based) for the bookmark at index `n`.
   * @param pdf The PDF document.
   * @param n The bookmark index (0-based).
   * @returns The target page number.
   */
  getBookmarkPage(pdf: CoherentPdf, n: number): number;

  /**
   * Returns the text title of the bookmark at index `n`.
   * @param n The bookmark index (0-based).
   * @returns The bookmark text.
   */
  getBookmarkText(n: number): string;

  /**
   * Returns the open/closed status for the bookmark at index `n`.
   * @param n The bookmark index (0-based).
   * @returns True if the bookmark is open.
   */
  getBookmarkOpenStatus(n: number): boolean;

  /**
   * Ends the bookmark retrieval process and cleans up resources.
   */
  endGetBookmarkInfo(): void;

  /**
   * Starts the bookmark setting process for a specified number (`n`) of bookmarks.
   * Follow with setter functions, then `endSetBookmarkInfo`.
   * @param n The total number of bookmarks to set.
   */
  startSetBookmarkInfo(n: number): void;

  /**
   * Sets the nesting level for the bookmark at index `n`.
   * @param n The bookmark index (0-based).
   * @param level The new bookmark level.
   */
  setBookmarkLevel(n: number, level: number): void;

  /**
   * Sets the target page number (1-based) for the bookmark at index `n`.
   * @param pdf The PDF document (used to set the target).
   * @param n The bookmark index (0-based).
   * @param targetpage The target page number.
   */
  setBookmarkPage(pdf: CoherentPdf, n: number, targetpage: number): void;

  /**
   * Sets the open/closed status for the bookmark at index `n`.
   * @param n The bookmark index (0-based).
   * @param status The new open status.
   */
  setBookmarkOpenStatus(n: number, status: boolean): void;

  /**
   * Sets the text title for the bookmark at index `n`.
   * @param n The bookmark index (0-based).
   * @param text The new bookmark text.
   */
  setBookmarkText(n: number, text: string): void;

  /**
   * Ends the bookmark setting process, writing the new bookmarks to the PDF document.
   * @param pdf The PDF document.
   */
  endSetBookmarkInfo(pdf: CoherentPdf): void;

  /**
   * Returns the PDF's bookmark data in a JSON format byte array.
   * @param pdf The PDF document.
   * @returns The JSON bookmark data as a byte array.
   */
  getBookmarksJSON(pdf: CoherentPdf): Uint8Array;

  /**
   * Sets the PDF's bookmarks using JSON data supplied as a byte array.
   * @param pdf The PDF document.
   * @param data JSON bookmark data as a byte array.
   */
  setBookmarksJSON(pdf: CoherentPdf, data: Uint8Array): void;

  /**
   * Typesets a Table of Contents (TOC) page based on existing bookmarks and prepends it to the document.
   * @param pdf The PDF document.
   * @param font The font constant for the TOC text.
   * @param fontsize The font size for the TOC text.
   * @param title The title for the TOC page.
   * @param bookmark If true, the TOC page itself gets a bookmark.
   */
  tableOfContents(pdf: CoherentPdf, font: CpdfFont, fontsize: number, title: string, bookmark: boolean): void;

  //   8. Logos, Watermarks and Stamps

  /**
   * Stamps the content of `stamp_pdf` **on top of** the pages in the target PDF's range.
   * The stamp is placed with its origin at the target's origin (0, 0).
   * @param stamp_pdf The PDF containing the content to stamp.
   * @param pdf The target PDF document.
   * @param range The page range in the target PDF to stamp onto.
   */
  stampOn(stamp_pdf: CoherentPdf, pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Stamps the content of `stamp_pdf` **underneath** the content of the pages in the target PDF's range.
   * The stamp is placed with its origin at the target's origin (0, 0).
   * @param stamp_pdf The PDF containing the content to stamp.
   * @param pdf The target PDF document.
   * @param range The page range in the target PDF to stamp under.
   */
  stampUnder(stamp_pdf: CoherentPdf, pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * A stamping function with extended features for control over placement and scaling.
   * @param pdf The target PDF document (or the document to go over/under).
   * @param pdf2 The stamp PDF (or the document to go under/over).
   * @param range The page range in the target PDF.
   * @param isover If true, `pdf2` content goes over `pdf` content, otherwise under.
   * @param scale_stamp_to_fit Scales the stamp content to fit the page.
   * @param position The position anchor for placing the stamp.
   * @param relative_to_cropbox If true, position is relative to the CropBox, otherwise the MediaBox.
   */
  stampExtended(pdf: CoherentPdf, pdf2: CoherentPdf, range: CpdfPageRange, isover: boolean, scale_stamp_to_fit: boolean, position: CpdfPositionAnchor, relative_to_cropbox: boolean): void;

  /**
   * Combines two PDFs page-by-page, putting each page of `over` on top of each page of `under`.
   * @param under The base PDF document.
   * @param over The overlay PDF document.
   * @returns The resultant combined PDF document.
   */
  combinePages(under: CoherentPdf, over: CoherentPdf): CoherentPdf;

  /** Times Roman font constant (0) */
  readonly timesRoman: CpdfFont;
  /** Times Bold font constant (1) */
  readonly timesBold: CpdfFont;
  /** Times Italic font constant (2) */
  readonly timesItalic: CpdfFont;
  /** Times Bold Italic font constant (3) */
  readonly timesBoldItalic: CpdfFont;
  /** Helvetica font constant (4) */
  readonly helvetica: CpdfFont;
  /** Helvetica Bold font constant (5) */
  readonly helveticaBold: CpdfFont;
  /** Helvetica Oblique font constant (6) */
  readonly helveticaOblique: CpdfFont;
  /** Helvetica Bold Oblique font constant (7) */
  readonly helveticaBoldOblique: CpdfFont;
  /** Courier font constant (8) */
  readonly courier: CpdfFont;
  /** Courier Bold font constant (9) */
  readonly courierBold: CpdfFont;
  /** Courier Oblique font constant (10) */
  readonly courierOblique: CpdfFont;
  /** Courier Bold Oblique font constant (11) */
  readonly courierBoldOblique: CpdfFont;
  /** Left justification constant (0) */
  readonly leftJustify: CpdfJustification;
  /** Centre justification constant (1) */
  readonly centreJustify: CpdfJustification;
  /** Right justification constant (2) */
  readonly rightJustify: CpdfJustification;

  /**
   * Adds text to the pages in the given range with comprehensive control over formatting, color, and positioning.
   * @param metrics If true, only collects metrics (does not add text).
   * @param pdf The PDF document.
   * @param range The page range to add text to.
   * @param text The text to add (use `\n` for newline).
   * @param anchor The position anchor to place the text at.
   * @param p1 Position argument 1.
   * @param p2 Position argument 2.
   * @param linespacing Line spacing.
   * @param bates Starting bates number (if applicable).
   * @param font The font constant.
   * @param fontsize The font size.
   * @param r Red component of color (0.0 to 1.0).
   * @param g Green component of color (0.0 to 1.0).
   * @param b Blue component of color (0.0 to 1.0).
   * @param underneath If true, puts text under existing content (watermark).
   * @param relative_to_cropbox If true, position is relative to the crop box.
   * @param outline If true, renders text as an outline.
   * @param opacity Opacity level (0.0 to 1.0).
   * @param justification The justification constant.
   * @param midline If true, position is relative to the midline, not the baseline.
   * @param topline If true, position is relative to the topline, not the baseline.
   * @param filename Placeholder/legacy argument (often unused).
   * @param linewidth Line width (for outline text).
   * @param embed_fonts If true, embeds font information in the PDF.
   */
  addText(metrics: boolean, pdf: CoherentPdf, range: CpdfPageRange, text: string, anchor: CpdfPositionAnchor, p1: number, p2: number, linespacing: number, bates: number, font: CpdfFont, fontsize: number, r: number, g: number, b: number, underneath: boolean, relative_to_cropbox: boolean, outline: boolean, opacity: number, justification: CpdfJustification, midline: boolean, topline: boolean, filename: string, linewidth: number, embed_fonts: boolean): void;

  /**
   * Adds text with default settings for most parameters.
   * @param pdf The PDF document.
   * @param range The page range to add text to.
   * @param text The text to add (use `\n` for newline).
   * @param anchor The position anchor to place the text at.
   * @param p1 Position argument 1.
   * @param p2 Position argument 2.
   * @param font The font constant.
   * @param fontsize The font size.
   */
  addTextSimple(pdf: CoherentPdf, range: CpdfPageRange, text: string, anchor: CpdfPositionAnchor, p1: number, p2: number, font: CpdfFont, fontsize: number): void;

  /**
   * Removes any text that was previously added by cpdf from the given pages.
   * @param pdf The PDF document.
   * @param range The page range.
   */
  removeText(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Returns the width of a given string in the specified font in thousandths of a point.
   * @param font The font constant.
   * @param text The text string.
   * @returns The text width in thousandths of a point.
   */
  textWidth(font: CpdfFont, text: string): number;

  /**
   * Adds raw PDF content directives to pages in the range.
   * @param content The raw PDF content stream string to add.
   * @param before If true, adds content before existing content; otherwise, adds after.
   * @param pdf The PDF document.
   * @param range The page range.
   */
  addContent(content: string, before: boolean, pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Stamps `stamp_pdf` onto the pages in `pdf` as a shared **Form XObject** and returns the name of the created XObject.
   * @param pdf The target PDF document.
   * @param range The page range.
   * @param stamp_pdf The stamp PDF document.
   * @returns The name of the newly created XObject.
   */
  stampAsXObject(pdf: CoherentPdf, range: CpdfPageRange, stamp_pdf: CoherentPdf): string;

  //   9. Multipage facilities

  /**
   * Imposes pages of the PDF onto fewer pages in various layouts.
   * @param pdf The PDF document to impose.
   * @param x Number of columns (or target width if `fit` is true).
   * @param y Number of rows (or target height if `fit` is true).
   * @param fit If true, fits to page size x*y; otherwise, creates an x by y grid.
   * @param columns If true, arranges by column order; otherwise, by row.
   * @param rtl If true, imposes right-to-left.
   * @param btt If true, imposes bottom-to-top.
   * @param center Unused (placeholder).
   * @param margin Margin around the output pages.
   * @param spacing Spacing between the imposed pages.
   * @param linewidth Line width for imposition guides.
   */
  impose(pdf: CoherentPdf, x: number, y: number, fit: boolean, columns: boolean, rtl: boolean, btt: boolean, center: boolean, margin: number, spacing: number, linewidth: number): void;

  /**
   * Imposes a document "two-up" by **shrinking** each page to fit two original pages onto one new page.
   * @param pdf The PDF document.
   */
  twoUp(pdf: CoherentPdf): void;

  /**
   * Imposes a document "two-up" by **doubling** the page size to fit two pages onto one new page.
   * @param pdf The PDF document.
   */
  twoUpStack(pdf: CoherentPdf): void;

  /**
   * Adds a blank page **before** each page within the specified range.
   * @param pdf The PDF document.
   * @param range The page range.
   */
  padBefore(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Adds a blank page **after** each page within the specified range. (The documentation refers to this as padding every N pages, but the signature matches the definition above).
   * @param pdf The PDF document.
   * @param range The page range.
   */
  padAfter(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Adds a blank page after every `n` pages.
   * @param pdf The PDF document.
   * @param n The interval.
   */
  padEvery(pdf: CoherentPdf, n: number): void;

  /**
   * Adds pages at the **end** of the file to pad the total length to a multiple of `n` pages.
   * @param pdf The PDF document.
   * @param n The multiple to pad to.
   */
  padMultiple(pdf: CoherentPdf, n: number): void;

  /**
   * Adds pages at the **beginning** of the file to pad the total length to a multiple of `n` pages.
   * @param pdf The PDF document.
   * @param n The multiple to pad to.
   */
  padMultipleBefore(pdf: CoherentPdf, n: number): void;

  //   10. Annotations 

  /**
   * Returns the document's annotations data in **JSON format** as a byte array.
   * @param pdf The PDF document.
   * @returns The annotations data.
   */
  annotationsJSON(pdf: CoherentPdf): Uint8Array;

  //   11. Document Information and Metadata

  /**
   * Quickly checks if a PDF file on disk is linearized without loading the whole file.
   * @param filename The file name.
   * @returns True if the document is linearized.
   */
  isLinearized(filename: string): boolean;

  /**
   * Quickly checks if a PDF in memory is linearized without loading the whole file.
   * @param data The PDF file as a byte array.
   * @returns True if the document is linearized.
   */
  isLinearizedMemory(data: Uint8Array): boolean;

  /**
   * Returns the minor version number of the PDF (e.g., 7 for PDF 1.7).
   * @param pdf The PDF document.
   * @returns The minor version number.
   */
  getVersion(pdf: CoherentPdf): number;

  /**
   * Returns the major version number of the PDF (e.g., 1 for PDF 1.7).
   * @param pdf The PDF document.
   * @returns The major version number.
   */
  getMajorVersion(pdf: CoherentPdf): number;

  // PDF Info Dictionary Getters:
  getTitle(pdf: CoherentPdf): string;
  getAuthor(pdf: CoherentPdf): string;
  getSubject(pdf: CoherentPdf): string;
  getKeywords(pdf: CoherentPdf): string;
  getCreator(pdf: CoherentPdf): string;
  getProducer(pdf: CoherentPdf): string;
  getCreationDate(pdf: CoherentPdf): string;
  getModificationDate(pdf: CoherentPdf): string;

  // XMP Metadata Getters:
  getTitleXMP(pdf: CoherentPdf): string;
  getAuthorXMP(pdf: CoherentPdf): string;
  getSubjectXMP(pdf: CoherentPdf): string;
  getKeywordsXMP(pdf: CoherentPdf): string;
  getCreatorXMP(pdf: CoherentPdf): string;
  getProducerXMP(pdf: CoherentPdf): string;
  getCreationDateXMP(pdf: CoherentPdf): string;
  getModificationDateXMP(pdf: CoherentPdf): string;

  // PDF Info Dictionary Setters:
  setTitle(pdf: CoherentPdf, s: string): void;
  setAuthor(pdf: CoherentPdf, s: string): void;
  setSubject(pdf: CoherentPdf, s: string): void;
  setKeywords(pdf: CoherentPdf, s: string): void;
  setCreator(pdf: CoherentPdf, s: string): void;
  setProducer(pdf: CoherentPdf, s: string): void;
  setCreationDate(pdf: CoherentPdf, s: string): void;
  setModificationDate(pdf: CoherentPdf, s: string): void;

  // XMP Metadata Setters:
  setTitleXMP(pdf: CoherentPdf, s: string): void;
  setAuthorXMP(pdf: CoherentPdf, s: string): void;
  setSubjectXMP(pdf: CoherentPdf, s: string): void;
  setKeywordsXMP(pdf: CoherentPdf, s: string): void;
  setCreatorXMP(pdf: CoherentPdf, s: string): void;
  setProducerXMP(pdf: CoherentPdf, s: string): void;
  setCreationDateXMP(pdf: CoherentPdf, s: string): void;
  setModificationDateXMP(pdf: CoherentPdf, s: string): void;

  /**
   * Returns the year, month, day, hour, minute, second, and offset components from a PDF date string.
   * @param dateString The PDF date string.
   * @returns An array of number components.
   */
  getDateComponents(dateString: string): number[];

  /**
   * Builds a PDF date string from individual date and time components.
   * @returns The formatted PDF date string.
   */
  dateStringOfComponents(y: number, m: number, d: number, h: number, min: number, sec: number, hour_offset: number, minute_offset: number): string;

  /**
   * Gets the viewing rotation (0, 90, 180, 270) for a given page.
   * @param pdf The PDF document.
   * @param page The page number (1-based).
   * @returns The page rotation angle.
   */
  getPageRotation(pdf: CoherentPdf, page: number): number;

  /**
   * Returns true if that page has the given box (e.g., "/CropBox").
   * @param pdf The PDF document.
   * @param page The page number (1-based).
   * @param box The box name string.
   * @returns True if the box is present.
   */
  hasBox(pdf: CoherentPdf, page: number, box: string): boolean;

  // Page Box Getters (returns [minX, maxX, minY, maxY] in points):
  getMediaBox(pdf: CoherentPdf, pagenumber: number): number[];
  getCropBox(pdf: CoherentPdf, pagenumber: number): number[];
  getArtBox(pdf: CoherentPdf, pagenumber: number): number[];
  getBleedBox(pdf: CoherentPdf, pagenumber: number): number[];
  getTrimBox(pdf: CoherentPdf, pagenumber: number): number[];

  // Page Box Setters:
  setMediabox(pdf: CoherentPdf, range: CpdfPageRange, minx: number, maxx: number, miny: number, maxy: number): void;
  setCropBox(pdf: CoherentPdf, range: CpdfPageRange, minx: number, maxx: number, miny: number, maxy: number): void;
  setTrimBox(pdf: CoherentPdf, range: CpdfPageRange, minx: number, maxx: number, miny: number, maxy: number): void;
  setBleedBox(pdf: CoherentPdf, range: CpdfPageRange, minx: number, maxx: number, miny: number, maxy: number): void;
  setArtBox(pdf: CoherentPdf, range: CpdfPageRange, minx: number, maxx: number, miny: number, maxy: number): void;

  /**
   * Marks a document as "trapped" in the PDF Info dictionary.
   * @param pdf The PDF document.
   */
  markTrapped(pdf: CoherentPdf): void;

  /**
   * Marks a document as "untrapped" in the PDF Info dictionary.
   * @param pdf The PDF document.
   */
  markUntrapped(pdf: CoherentPdf): void;

  /**
   * Marks a document as "trapped" in the XMP metadata.
   * @param pdf The PDF document.
   */
  markTrappedXMP(pdf: CoherentPdf): void;

  /**
   * Marks a document as "untrapped" in the XMP metadata.
   * @param pdf The PDF document.
   */
  markUntrappedXMP(pdf: CoherentPdf): void;

  /** Single page layout constant (0) */
  readonly singlePage: CpdfLayout;
  /** One column layout constant (1) */
  readonly oneColumn: CpdfLayout;
  /** Two column left layout constant (2) */
  readonly twoColumnLeft: CpdfLayout;
  /** Two column right layout constant (3) */
  readonly twoColumnRight: CpdfLayout;
  /** Two page left layout constant (4) */
  readonly twoPageLeft: CpdfLayout;
  /** Two page right layout constant (5) */
  readonly twoPageRight: CpdfLayout;

  /**
   * Sets the default page layout (viewing preference) for the document.
   * @param pdf The PDF document.
   * @param layout The layout constant.
   */
  setPageLayout(pdf: CoherentPdf, layout: CpdfLayout): void;

  /** Use none page mode constant (0) */
  readonly useNone: CpdfMode;
  /** Use outlines page mode constant (1) */
  readonly useOutlines: CpdfMode;
  /** Use thumbs page mode constant (2) */
  readonly useThumbs: CpdfMode;
  /** Use OC (Optional Content/Layers) page mode constant (3) */
  readonly useOC: CpdfMode;
  /** Use attachments page mode constant (4) */
  readonly useAttachments: CpdfMode;

  /**
   * Sets the default page mode (what is visible on open, e.g., outlines, thumbnails).
   * @param pdf The PDF document.
   * @param mode The page mode constant.
   */
  setPageMode(pdf: CoherentPdf, mode: CpdfMode): void;

  // Viewer Preference Setters:
  hideToolbar(pdf: CoherentPdf, flag: boolean): void;
  hideMenubar(pdf: CoherentPdf, flag: boolean): void;
  hideWindowUi(pdf: CoherentPdf, flag: boolean): void;
  fitWindow(pdf: CoherentPdf, flag: boolean): void;
  centerWindow(pdf: CoherentPdf, flag: boolean): void;
  displayDocTitle(pdf: CoherentPdf, flag: boolean): void;

  /**
   * Sets the document to open at a specified page, optionally with zoom-to-fit.
   * @param pdf The PDF document.
   * @param fit If true, enables zoom-to-fit.
   * @param pagenumber The page number (1-based) to open on.
   */
  openAtPage(pdf: CoherentPdf, fit: boolean, pagenumber: number): void;

  /**
   * Sets the XMP metadata from the contents of a specified file.
   * @param pdf The PDF document.
   * @param filename The file path containing the XMP metadata.
   */
  setMetadataFromFile(pdf: CoherentPdf, filename: string): void;

  /**
   * Sets the XMP metadata from an array of bytes in memory.
   * @param pdf The PDF document.
   * @param data The XMP metadata as a byte array.
   */
  setMetadataFromByteArray(pdf: CoherentPdf, data: Uint8Array): void;

  /**
   * Removes the XMP metadata from the document.
   * @param pdf The PDF document.
   */
  removeMetadata(pdf: CoherentPdf): void;

  /**
   * Returns the XMP metadata from the document as a byte array.
   * @param pdf The PDF document.
   * @returns The XMP metadata.
   */
  getMetadata(pdf: CoherentPdf): Uint8Array;

  /**
   * Builds fresh XMP metadata based on existing metadata in the document.
   * @param pdf The PDF document.
   */
  createMetadata(pdf: CoherentPdf): void;

  /**
   * Sets the date field within the XMP metadata. The date string should be in PDF date format (or the literal 'now').
   * @param pdf The PDF document.
   * @param date The date string.
   */
  setMetadataDate(pdf: CoherentPdf, date: string): void;

  /** Decimal Arabic page label style (1, 2, 3...) (0) */
  readonly decimalArabic: CpdfLabelStyle;
  /** Uppercase Roman page label style (I, II, III...) (1) */
  readonly uppercaseRoman: CpdfLabelStyle;
  /** Lowercase Roman page label style (i, ii, iii...) (2) */
  readonly lowercaseRoman: CpdfLabelStyle;
  /** Uppercase Letters page label style (A, B, C...) (3) */
  readonly uppercaseLetters: CpdfLabelStyle;
  /** Lowercase Letters page label style (a, b, c...) (4) */
  readonly lowercaseLetters: CpdfLabelStyle;

  /**
   * Adds page labels (e.g., Roman numerals) to a specified range of pages.
   * @param pdf The PDF document.
   * @param style The label style constant.
   * @param prefix Prefix text for the label.
   * @param offset Starting number offset.
   * @param range The page range this label sequence applies to.
   * @param progress If true, labels continue the sequence.
   */
  addPageLabels(pdf: CoherentPdf, style: CpdfLabelStyle, prefix: string, offset: number, range: CpdfPageRange, progress: boolean): void;

  /**
   * Removes all page labels from the document.
   * @param pdf The PDF document.
   */
  removePageLabels(pdf: CoherentPdf): void;

  /**
   * Calculates the full label string for a given page number (e.g., if page 5 is labeled as "iii", it returns "iii").
   * @param pdf The PDF document.
   * @param pagenumber The page number (1-based).
   * @returns The calculated page label string.
   */
  getPageLabelStringForPage(pdf: CoherentPdf, pagenumber: number): string;

  /**
   * Starts the process to retrieve information about existing page label sequences and returns the count of label sequences.
   * @param pdf The PDF document.
   * @returns The number of page label sequences.
   */
  startGetPageLabels(pdf: CoherentPdf): number;

  // Accessor functions for retrieved page label data:
  getPageLabelStyle(n: number): CpdfLabelStyle;
  getPageLabelPrefix(n: number): string;
  getPageLabelOffset(n: number): number;
  getPageLabelRange(n: number): number;

  /**
   * Ends the page label retrieval process and cleans up resources.
   */
  endGetPageLabels(): void;

  //   12. File Attachments

  /**
   * Attaches a file from disk to the PDF at the **document level**.
   * @param filename The path to the file on disk.
   * @param pdf The PDF document.
   */
  attachFile(filename: string, pdf: CoherentPdf): void;

  /**
   * Attaches a file from disk to a **specific page number**.
   * @param filename The path to the file on disk.
   * @param pdf The PDF document.
   * @param pagenumber The page number (1-based) to attach to.
   */
  attachFileToPage(filename: string, pdf: CoherentPdf, pagenumber: number): void;

  /**
   * Attaches data from memory to the PDF at the **document level**.
   * @param data The file content as a byte array.
   * @param filename The name to store the attachment under within the PDF.
   * @param pdf The PDF document.
   */
  attachFileFromMemory(data: Uint8Array, filename: string, pdf: CoherentPdf): void;

  /**
   * Attaches data from memory to a **specific page number**.
   * @param data The file content as a byte array.
   * @param filename The name to store the attachment under within the PDF.
   * @param pdf The PDF document.
   * @param pagenumber The page number (1-based) to attach to.
   */
  attachFileToPageFromMemory(data: Uint8Array, filename: string, pdf: CoherentPdf, pagenumber: number): void;

  /**
   * Removes all page- and document-level attachments from the document.
   * @param pdf The PDF document.
   */
  removeAttachedFiles(pdf: CoherentPdf): void;

  /**
   * Starts the process to retrieve information about attached files. Returns the count of attachments.
   * @param pdf The PDF document.
   */
  startGetAttachments(pdf: CoherentPdf): void;

  // Accessor functions for attached file data:
  numberGetAttachments(): number;
  getAttachmentName(n: number): string;
  getAttachmentPage(n: number): number;
  getAttachmentData(n: number): Uint8Array;

  /**
   * Ends the attachment retrieval process and cleans up resources.
   */
  endGetAttachments(): void;

  //  13. Images

  /**
   * Starts the process to retrieve image resolution data for all image uses below a `min_required_resolution` and returns the count of image uses found.
   * @param pdf The PDF document.
   * @param min_required_resolution The minimum required resolution (e.g., 300) to report for image uses below it.
   * @returns The number of image uses found.
   */
  startGetImageResolution(pdf: CoherentPdf, min_required_resolution: number): number;

  // Accessor functions for image resolution data:
  getImageResolutionPageNumber(n: number): number;
  getImageResolutionImageName(n: number): string;
  getImageResolutionXPixels(n: number): number;
  getImageResolutionYPixels(n: number): number;
  getImageResolutionXRes(n: number): number;
  getImageResolutionYRes(n: number): number;

  /**
   * Ends the image resolution retrieval process and cleans up resources.
   */
  endGetImageResolution(): void;

  //   14. Fonts.

  /**
   * Starts the process to retrieve font information used in the PDF.
   * @param pdf The PDF document.
   */
  startGetFontInfo(pdf: CoherentPdf): void;

  /**
   * Returns the number of distinct fonts found in the PDF.
   * @returns The number of fonts.
   */
  numberFonts(): number;

  // Accessor functions for font information:
  getFontPage(n: number): number;
  getFontName(n: number): string;
  getFontType(n: number): string;
  getFontEncoding(n: number): string;

  /**
   * Ends the font information retrieval process and cleans up resources.
   */
  endGetFontInfo(): void;

  /**
   * Removes all font data streams from the document.
   * @param pdf The PDF document.
   */
  removeFonts(pdf: CoherentPdf): void;

  /**
   * Copies a specified font resource from a source PDF (`docfrom`) to every page in the range of a destination PDF (`docto`).
   * @param docfrom The source PDF.
   * @param docto The destination PDF.
   * @param range The page range in the destination to apply the font to.
   * @param pagenumber The page number in the source document where the font is used.
   * @param fontname The name of the font resource.
   */
  copyFont(docfrom: CoherentPdf, docto: CoherentPdf, range: CpdfPageRange, pagenumber: number, fontname: string): void;

  //   15. PDF and JSON

  /**
   * Exports the PDF structure and content to a file in **JSON format**.
   * @param filename The output file path.
   * @param parse_content If true, parses page content streams.
   * @param no_stream_data If true, suppresses raw stream data in the output.
   * @param decompress_streams If true, decompresses streams before exporting.
   * @param pdf The PDF document.
   */
  outputJSON(filename: string, parse_content: boolean, no_stream_data: boolean, decompress_streams: boolean, pdf: CoherentPdf): void;

  /**
   * Exports the PDF structure and content to a **JSON byte array** in memory.
   * @returns The JSON data as a byte array.
   */
  outputJSONMemory(parse_content: boolean, no_stream_data: boolean, decompress_streams: boolean, pdf: CoherentPdf): Uint8Array;

  /**
   * Loads a new PDF document instance from a specified JSON file.
   * @param filename The input JSON file path.
   * @returns The loaded PDF document instance.
   */
  fromJSON(filename: string): CoherentPdf;

  /**
   * Loads a new PDF document instance from a JSON byte array in memory.
   * @param data The input JSON data as a byte array.
   * @returns The loaded PDF document instance.
   */
  fromJSONMemory(data: Uint8Array): CoherentPdf;

  //   16. Optional Content Groups

  /**
   * Starts the process to retrieve Optional Content Group (OCG, or Layer) names and returns the number of OCG entries.
   * @param pdf The PDF document.
   * @returns The number of OCG entries.
   */
  startGetOCGList(pdf: CoherentPdf): number;

  /**
   * Retrieves an OCG name given its serial number (0-based).
   * @param n The serial number.
   * @returns The OCG name string.
   */
  ocgListEntry(n: number): string;

  /**
   * Ends OCG retrieval and cleans up resources.
   */
  endGetOCGList(): void;

  /**
   * Renames an Optional Content Group (OCG/Layer).
   * @param pdf The PDF document.
   * @param name_from The current OCG name.
   * @param name_to The new OCG name.
   */
  ocgRename(pdf: CoherentPdf, name_from: string, name_to: string): void;

  /**
   * Ensures that every OCG appears in the OCG order list (making layers manageable).
   * @param pdf The PDF document.
   */
  ocgOrderAll(pdf: CoherentPdf): void;

  /**
   * Merges multiple OCGs that have the same name into a single OCG.
   * @param pdf The PDF document.
   */
  ocgCoalesce(pdf: CoherentPdf): void;

  //   17. Creating new PDFs

  /**
   * Creates a blank PDF document with pages of the specified width, height (in points), and number of pages.
   * @param w Page width in points.
   * @param h Page height in points.
   * @param pages Number of blank pages to create.
   * @returns The new PDF document instance.
   */
  blankDocument(w: number, h: number, pages: number): CoherentPdf;

  /**
   * Creates a blank PDF document using a predefined paper size constant and specified number of pages.
   * @param papersize The CpdfPaperSize constant.
   * @param pages Number of blank pages to create.
   * @returns The new PDF document instance.
   */
  blankDocumentPaper(papersize: CpdfPaperSize, pages: number): CoherentPdf;

  /**
   * Typesets a UTF8 text file onto a new PDF with given dimensions, font, and font size.
   * @param w Page width in points.
   * @param h Page height in points.
   * @param font The CpdfFont constant.
   * @param fontsize The font size.
   * @param filename The path to the input text file.
   * @returns The new PDF document instance.
   */
  textToPDF(w: number, h: number, font: CpdfFont, fontsize: number, filename: string): CoherentPdf;

  /**
   * Typesets UTF8 text from a byte array onto a new PDF with given dimensions, font, and font size.
   * @param w Page width in points.
   * @param h Page height in points.
   * @param font The CpdfFont constant.
   * @param fontsize The font size.
   * @param data The input text as a byte array.
   * @returns The new PDF document instance.
   */
  textToPDFMemory(w: number, h: number, font: CpdfFont, fontsize: number, data: Uint8Array): CoherentPdf;

  /**
   * Typesets a UTF8 text file onto a new PDF using a predefined paper size, font, and font size.
   * @param papersize The CpdfPaperSize constant.
   * @param font The CpdfFont constant.
   * @param fontsize The font size.
   * @param filename The path to the input text file.
   * @returns The new PDF document instance.
   */
  textToPDFPaper(papersize: CpdfPaperSize, font: CpdfFont, fontsize: number, filename: string): CoherentPdf;

  /**
   * Typesets UTF8 text from a byte array onto a new PDF using a predefined paper size, font, and font size.
   * @param papersize The CpdfPaperSize constant.
   * @param font The CpdfFont constant.
   * @param fontsize The font size.
   * @param data The input text as a byte array.
   * @returns The new PDF document instance.
   */
  textToPDFPaperMemory(papersize: CpdfPaperSize, font: CpdfFont, fontsize: number, data: Uint8Array): CoherentPdf;

  //  18. Miscellaneous

  /**
   * Removes images on the given pages, replacing them with crossed boxes if `boxes` is true.
   * @param pdf The PDF document.
   * @param range The page range.
   * @param boxes If true, replaces images with crossed boxes.
   */
  draft(pdf: CoherentPdf, range: CpdfPageRange, boxes: boolean): void;

  /**
   * Removes all text content from the specified pages.
   * @param pdf The PDF document.
   * @param range The page range.
   */
  removeAllText(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Blackens all text content on the specified pages.
   * @param pdf The PDF document.
   * @param range The page range.
   */
  blackText(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Blackens all line strokes (paths) on the specified pages.
   * @param pdf The PDF document.
   * @param range The page range.
   */
  blackLines(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Blackens all filled shapes on the specified pages.
   * @param pdf The PDF document.
   * @param range The page range.
   */
  blackFills(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Thickens every line less than `min_thickness` to that minimum thickness (in points).
   * @param pdf The PDF document.
   * @param range The page range.
   * @param min_thickness The minimum required line thickness.
   */
  thinLines(pdf: CoherentPdf, range: CpdfPageRange, min_thickness: number): void;

  /**
   * Copies the unique document identifier (`/ID`) from one PDF to another.
   * @param pdf_from The source PDF document.
   * @param pdf_to The destination PDF document.
   */
  copyId(pdf_from: CoherentPdf, pdf_to: CoherentPdf): void;

  /**
   * Removes the unique document identifier (`/ID`).
   * @param pdf The PDF document.
   */
  removeId(pdf: CoherentPdf): void;

  /**
   * Sets the minor version number of a document (e.g., set to 7 for PDF 1.7).
   * @param pdf The PDF document.
   * @param version The minor version number.
   */
  setVersion(pdf: CoherentPdf, version: number): void;

  /**
   * Sets the full major and minor version number of a document (e.g., major=1, minor=7).
   * @param pdf The PDF document.
   * @param major The major version number.
   * @param minor The minor version number.
   */
  setFullVersion(pdf: CoherentPdf, major: number, minor: number): void;

  /**
   * Removes any dictionary entry found anywhere in the document with the given key.
   * @param pdf The PDF document.
   * @param key The dictionary key to remove.
   */
  removeDictEntry(pdf: CoherentPdf, key: string): void;

  /**
   * Removes any dictionary entry with the given key only if its current value matches the search term.
   * @param pdf The PDF document.
   * @param key The dictionary key.
   * @param searchterm The value to search for.
   */
  removeDictEntrySearch(pdf: CoherentPdf, key: string, searchterm: string): void;

  /**
   * Replaces the value associated with the given key anywhere in the document.
   * @param pdf The PDF document.
   * @param key The dictionary key.
   * @param newval The new value string.
   */
  replaceDictEntry(pdf: CoherentPdf, key: string, newval: string): void;

  /**
   * Replaces the value associated with the given key only if the existing value matches the search term.
   * @param pdf The PDF document.
   * @param key The dictionary key.
   * @param newval The new value string.
   * @param searchterm The value to search for.
   */
  replaceDictEntrySearch(pdf: CoherentPdf, key: string, newval: string, searchterm: string): void;

  /**
   * Removes all clipping paths applied to content streams on pages in the specified range.
   * @param pdf The PDF document.
   * @param range The page range.
   */
  removeClipping(pdf: CoherentPdf, range: CpdfPageRange): void;

  /**
   * Returns a JSON array containing any and all values associated with the given key found in the document.
   * @param pdf The PDF document.
   * @param key The dictionary key to search for.
   * @returns The results as a byte array (JSON format).
   */
  getDictEntries(pdf: CoherentPdf, key: string): Uint8Array;
};

export { coherentpdf }