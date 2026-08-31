/**
 * Native file delivery.
 *
 * On the web, every tool finishes by clicking a hidden `<a download>`. Inside a
 * WebView that either does nothing at all or dumps the file somewhere the user
 * can never find, so we intercept those clicks and hand the result to the OS:
 * the file is written to the app's cache and offered through the system share
 * sheet ("Save to Files" on iOS, the share/save targets on Android).
 *
 * Intercepting at the anchor level means all ~300 existing call sites keep
 * working untouched, including the ones that build their own anchor inline.
 */
import { hasPlugin } from './platform.js';
import { showToast } from './toast.js';

/** Anchors we created ourselves, so the patched `click()` lets them through. */
const passthrough = new WeakSet<HTMLAnchorElement>();

const isInterceptableHref = (href: string): boolean =>
  href.startsWith('blob:') || href.startsWith('data:') || href.startsWith('/');

const blobFromHref = async (href: string): Promise<Blob> => {
  const response = await fetch(href);
  if (!response.ok) {
    throw new Error(`Could not read the generated file (${response.status})`);
  }
  return response.blob();
};

const toBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.onload = () => {
      const result = String(reader.result);
      // strip the `data:<mime>;base64,` prefix Filesystem does not want
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });

/** Keeps names filesystem-safe without mangling the user's original name. */
const safeFilename = (name: string): string => {
  const cleaned = name.replace(/[/\\?%*:|"<>]/g, '-').trim();
  return cleaned || `bentopdf-${Date.now()}.pdf`;
};

/**
 * Writes the blob into the app's cache directory and returns a file:// URI the
 * share sheet can hand to other apps.
 */
const writeToCache = async (blob: Blob, filename: string): Promise<string> => {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const path = `BentoPDF/${filename}`;

  await Filesystem.mkdir({
    path: 'BentoPDF',
    directory: Directory.Cache,
    recursive: true,
  }).catch(() => {
    // already exists - the only failure we expect here
  });

  await Filesystem.writeFile({
    path,
    directory: Directory.Cache,
    data: await toBase64(blob),
  });

  const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
  return uri;
};

/**
 * Saves a result the way the platform expects: share sheet first, with a
 * plain save into the app's Documents folder as the fallback.
 */
export const deliverFile = async (
  blob: Blob,
  filename: string
): Promise<void> => {
  const name = safeFilename(filename);

  if (!hasPlugin('Filesystem')) {
    showToast('File saving is unavailable in this build');
    return;
  }

  try {
    const uri = await writeToCache(blob, name);

    if (hasPlugin('Share')) {
      const { Share } = await import('@capacitor/share');
      try {
        await Share.share({ title: name, files: [uri] });
        return;
      } catch {
        // The user dismissed the sheet, or no target could handle the file.
        // Either way the file is already on disk - fall through to the save.
      }
    }

    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    await Filesystem.writeFile({
      path: `BentoPDF/${name}`,
      directory: Directory.Documents,
      data: await toBase64(blob),
      recursive: true,
    });
    showToast(`Saved to Documents/BentoPDF/${name}`);
  } catch (error) {
    console.error('[native] Failed to save file', error);
    showToast('Could not save the file');
  }
};

const handleDownloadAnchor = (anchor: HTMLAnchorElement): void => {
  const filename = anchor.getAttribute('download') || 'bentopdf.pdf';
  const href = anchor.href;

  void (async () => {
    try {
      await deliverFile(await blobFromHref(href), filename);
    } catch (error) {
      console.error('[native] Failed to read download target', error);
      showToast('Could not prepare the file');
    }
  })();
};

/** True when this anchor represents a file download we should take over. */
const shouldIntercept = (anchor: HTMLAnchorElement): boolean =>
  !passthrough.has(anchor) &&
  anchor.hasAttribute('download') &&
  isInterceptableHref(anchor.getAttribute('href') || '');

export const initNativeDownloads = (): void => {
  // 1. Programmatic downloads - `helpers.ts#downloadFile` and friends build an
  //    anchor and call `.click()` on it directly.
  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function patchedClick(
    this: HTMLAnchorElement
  ): void {
    if (shouldIntercept(this)) {
      handleDownloadAnchor(this);
      return;
    }
    originalClick.call(this);
  };

  // 2. Downloads the user taps directly (result links rendered into the page).
  document.addEventListener(
    'click',
    (event) => {
      const anchor = (event.target as Element | null)?.closest?.('a[download]');
      if (!anchor || !shouldIntercept(anchor as HTMLAnchorElement)) return;
      event.preventDefault();
      handleDownloadAnchor(anchor as HTMLAnchorElement);
    },
    true
  );
};

/** Opt an anchor out of interception (used for in-app navigation links). */
export const allowNativeAnchor = (anchor: HTMLAnchorElement): void => {
  passthrough.add(anchor);
};
