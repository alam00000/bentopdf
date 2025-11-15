let cpdfLoaded = false;
let cpdfLoadPromise: Promise<void> | null = null;

//TODO: @ALAM,is it better to use a worker to load the cpdf library?
// or just use the browser version?
export async function ensureCpdfLoaded(): Promise<void> {
  if (cpdfLoaded) return;

  if (cpdfLoadPromise) {
    return cpdfLoadPromise;
  }

  cpdfLoadPromise = new Promise((resolve, reject) => {
    if (typeof (window as any).coherentpdf !== 'undefined') {
      cpdfLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/coherentpdf.browser.min.js';
    script.onload = () => {
      cpdfLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load CoherentPDF library'));
    };
    document.head.appendChild(script);
  });

  return cpdfLoadPromise;
}

/**
 * Gets the cpdf instance, ensuring it's loaded first
 */
export async function getCpdf(): Promise<any> {
  await ensureCpdfLoaded();
  return (window as any).coherentpdf;
}

