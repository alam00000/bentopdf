let cpdfLoaded = false;

function loadCpdf(cpdfUrl) {
  if (cpdfLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (typeof coherentpdf !== 'undefined') {
      cpdfLoaded = true;
      resolve();
      return;
    }

    try {
      self.importScripts(cpdfUrl);
      cpdfLoaded = true;
      resolve();
    } catch (error) {
      reject(new Error('Failed to load CoherentPDF: ' + error.message));
    }
  });
}

self.onmessage = async function (e) {
  const { command, files, cpdfUrl } = e.data;

  if (!cpdfUrl) {
    self.postMessage({
      status: 'error',
      message:
        'CoherentPDF URL not provided. Please configure it in WASM Settings.',
    });
    return;
  }

  try {
    await loadCpdf(cpdfUrl);
  } catch (error) {
    self.postMessage({
      status: 'error',
      message: error.message,
    });
    return;
  }

  if (command === 'interleave') {
    interleavePDFs(files);
  }
};

function interleavePDFs(files) {
  try {
    const loadedPdfs = [];
    const pageCounts = [];

    for (const file of files) {
      const uint8Array = new Uint8Array(file.data);
      const pdfDoc = coherentpdf.fromMemory(uint8Array, '');
      loadedPdfs.push(pdfDoc);
      pageCounts.push(coherentpdf.pages(pdfDoc));
    }

    if (loadedPdfs.length < 2) {
      throw new Error('At least two PDF files are required for interleaving.');
    }

    const maxPages = Math.max(...pageCounts);

    const pdfsToMerge = [];
    const rangesToMerge = [];

    for (let i = 1; i <= maxPages; i++) {
      for (let j = 0; j < loadedPdfs.length; j++) {
        if (i <= pageCounts[j]) {
          pdfsToMerge.push(loadedPdfs[j]);
          rangesToMerge.push(coherentpdf.range(i, i));
        }
      }
    }

    if (pdfsToMerge.length === 0) {
      throw new Error('No valid pages to merge.');
    }

    const mergedPdf = coherentpdf.mergeSame(
      pdfsToMerge,
      true,
      true,
      rangesToMerge
    );

    const mergedPdfBytes = coherentpdf.toMemory(mergedPdf, false, true);
    const buffer = mergedPdfBytes.buffer;
    coherentpdf.deletePdf(mergedPdf);
    loadedPdfs.forEach((pdf) => coherentpdf.deletePdf(pdf));

    self.postMessage(
      {
        status: 'success',
        pdfBytes: buffer,
      },
      [buffer]
    );
  } catch (error) {
    self.postMessage({
      status: 'error',
      message: error.message || 'Unknown error during interleave merge',
    });
  }
}
