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

function convertPDFsToJSONInWorker(fileBuffers, fileNames) {
  try {
    const jsonFiles = [];
    const transferBuffers = [];

    for (let i = 0; i < fileBuffers.length; i++) {
      const buffer = fileBuffers[i];
      const fileName = fileNames[i];
      const uint8Array = new Uint8Array(buffer);
      const pdf = coherentpdf.fromMemory(uint8Array, '');

      const jsonData = coherentpdf.outputJSONMemory(true, false, false, pdf);

      const jsonBuffer = jsonData.buffer.slice(0);
      jsonFiles.push({
        name: fileName,
        data: jsonBuffer,
      });
      transferBuffers.push(jsonBuffer);

      coherentpdf.deletePdf(pdf);
    }

    self.postMessage(
      {
        status: 'success',
        jsonFiles: jsonFiles,
      },
      transferBuffers
    );
  } catch (error) {
    self.postMessage({
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error during PDF to JSON conversion.',
    });
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
    convertPDFsToJSONInWorker(e.data.fileBuffers, e.data.fileNames);
  }
};
