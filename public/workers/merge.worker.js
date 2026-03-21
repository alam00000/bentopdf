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
  const { command, files, jobs, cpdfUrl } = e.data;

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

  if (command === 'merge') {
    mergePDFs(files, jobs);
  }
};

function mergePDFs(files, jobs) {
  try {
    const loadedPdfs = {};
    const pdfsToMerge = [];
    const rangesToMerge = [];

    for (const file of files) {
      const uint8Array = new Uint8Array(file.data);
      const pdfDoc = coherentpdf.fromMemory(uint8Array, '');
      loadedPdfs[file.name] = pdfDoc;
    }

    for (const job of jobs) {
      const sourcePdf = loadedPdfs[job.fileName];
      if (!sourcePdf) continue;

      let range;
      if (job.rangeType === 'all') {
        range = coherentpdf.all(sourcePdf);
      } else if (job.rangeType === 'specific') {
        if (coherentpdf.validatePagespec(job.rangeString)) {
          range = coherentpdf.parsePagespec(sourcePdf, job.rangeString);
        } else {
          range = coherentpdf.all(sourcePdf);
        }
      } else if (job.rangeType === 'single') {
        const pageNum = job.pageIndex + 1;
        range = coherentpdf.range(pageNum, pageNum);
      } else if (job.rangeType === 'range') {
        range = coherentpdf.range(job.startPage, job.endPage);
      }

      pdfsToMerge.push(sourcePdf);
      rangesToMerge.push(range);
    }

    if (pdfsToMerge.length === 0) {
      throw new Error('No valid files or pages to merge.');
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
    Object.values(loadedPdfs).forEach((pdf) => coherentpdf.deletePdf(pdf));

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
      message: error.message || 'Unknown error during merge',
    });
  }
}
