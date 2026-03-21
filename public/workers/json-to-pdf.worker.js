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

function convertJSONsToPDFInWorker(fileBuffers, fileNames) {
  try {
    const pdfFiles = [];
    const transferBuffers = [];

    for (let i = 0; i < fileBuffers.length; i++) {
      const buffer = fileBuffers[i];
      const fileName = fileNames[i];
      const uint8Array = new Uint8Array(buffer);

      let pdf;
      try {
        pdf = coherentpdf.fromJSONMemory(uint8Array);
      } catch (error) {
        const errorMsg =
          error && error.message ? error.message : 'Unknown error';
        throw new Error(
          `Failed to convert "${fileName}" to PDF. ` +
            `The JSON file must be in the format produced by cpdf's outputJSONMemory. ` +
            `Error: ${errorMsg}`
        );
      }

      const pdfData = coherentpdf.toMemory(pdf, false, false);

      const pdfBuffer = pdfData.buffer.slice(0);
      pdfFiles.push({
        name: fileName,
        data: pdfBuffer,
      });
      transferBuffers.push(pdfBuffer);

      coherentpdf.deletePdf(pdf);
    }

    self.postMessage(
      {
        status: 'success',
        pdfFiles: pdfFiles,
      },
      transferBuffers
    );
  } catch (error) {
    self.postMessage({
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error during JSON to PDF conversion.',
    });
    return;
  }
}

self.onmessage = async function (e) {
  const { cpdfUrl } = e.data;

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

  if (e.data.command === 'convert') {
    convertJSONsToPDFInWorker(e.data.fileBuffers, e.data.fileNames);
  }
};
