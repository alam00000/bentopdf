/*
 * coherentpdf.global.d.ts — TypeScript type definitions for BentoPDF / CoherentPDF integration
 *
 * These type definitions were written by Alam for use in the BentoPDF project.
 * They describe APIs provided by the CoherentPDF library (cpdf.js) but are original
 * work created for type safety and integration.
 *
 * Copyright © 2025 BentoPDF
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
  type CpdfPaperSize =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15;
  type CpdfPositionAnchor =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12;
  type CpdfFont = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  type CpdfJustification = 0 | 1 | 2;
  type CpdfLayout = 0 | 1 | 2 | 3 | 4 | 5;
  type CpdfMode = 0 | 1 | 2 | 3 | 4;
  type CpdfLabelStyle = 0 | 1 | 2 | 3 | 4;
}

// This tells TypeScript that a variable named 'coherentpdf'
// exists in the global scope and has this shape.
declare const coherentpdf: {
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
   * Writes the PDF document to memory as a byte array.
   * @param pdf The PDF document.
   * @param linearize If true, linearizes the PDF.
   * @param make_id If true, generates a new `/ID`.
   * @returns The PDF document as a byte array.
   */
  toMemory(pdf: CoherentPdf, linearize: boolean, make_id: boolean): Uint8Array;

  /**
   * Returns the total number of pages in the PDF document.
   * @param pdf The PDF document.
   * @returns The number of pages.
   */
  pages(pdf: CoherentPdf): number;

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
   * Typesets a Table of Contents (TOC) page based on existing bookmarks and prepends it to the document.
   * @param pdf The PDF document.
   * @param font The font constant for the TOC text.
   * @param fontsize The font size for the TOC text.
   * @param title The title for the TOC page.
   * @param bookmark If true, the TOC page itself gets a bookmark.
   */
  tableOfContents(
    pdf: CoherentPdf,
    font: CpdfFont,
    fontsize: number,
    title: string,
    bookmark: boolean
  ): void;

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
};

export { coherentpdf };
