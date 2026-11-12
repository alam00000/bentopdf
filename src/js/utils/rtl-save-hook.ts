/**
 * Hebrew/RTL fix for pages that save through the bundled PDF.js viewer
 * (Form Filler, Sign PDF). PDF.js can't draw Hebrew with its built-in
 * Helvetica, so we rebuild those appearances with an embedded Hebrew font
 * before the file is downloaded or post-processed.
 */
import { fixRtlFormAppearances } from './rtl-form-appearance.js';
import { getFontForLanguage } from './font-loader.js';

/** The parts of PDF.js's PDFDocumentProxy we use. */
interface ViewerPdfDocument {
  getDownloadInfo?: () => Promise<{ length: number }>;
}

/**
 * Size of the document the viewer opened, so the fix can tell what changed.
 * Takes PDF.js's PDFDocumentProxy, whose typings vary between callers.
 */
export async function originalLengthOf(
  pdfDocument: unknown
): Promise<number | undefined> {
  try {
    const doc = pdfDocument as ViewerPdfDocument | undefined;
    return (await doc?.getDownloadInfo?.())?.length;
  } catch {
    return undefined;
  }
}

/** Returns bytes with Hebrew fields/annotations redrawn, or the input on any problem. */
export async function fixRtlForSave(
  data: Uint8Array,
  originalLength?: number
): Promise<Uint8Array> {
  try {
    // Bytes from the viewer iframe come from another realm; pdf-lib's
    // instanceof checks need a parent-realm copy.
    return await fixRtlFormAppearances(
      new Uint8Array(data),
      async () => {
        const [hebrew, latin] = await Promise.all([
          getFontForLanguage('heb'),
          getFontForLanguage('eng'),
        ]);
        return { hebrew, latin };
      },
      { originalLength }
    );
  } catch (e) {
    console.warn('RTL fix skipped:', e);
    return data;
  }
}

/**
 * Wraps the viewer's downloadManager.download, which its toolbar download
 * button and Form Filler's own button go through.
 */
export async function installRtlSaveHook(
  iframe: HTMLIFrameElement
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = (iframe.contentWindow as any)?.PDFViewerApplication;
    if (!app) return;
    await app.initializedPromise;
    const dm = app.downloadManager;
    if (!dm || dm.__rtlHooked) return;
    const original = dm.download.bind(dm);
    dm.download = async (
      data: Uint8Array | undefined,
      url: string,
      filename: string
    ) => {
      const out =
        data && data.length
          ? await fixRtlForSave(data, await originalLengthOf(app.pdfDocument))
          : data;
      return original(out, url, filename);
    };
    dm.__rtlHooked = true;
  } catch (e) {
    console.warn('Could not install RTL save hook:', e);
  }
}
