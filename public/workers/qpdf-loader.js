let qpdfPromise = null;

function loadQpdfRuntime() {
  if (qpdfPromise) return qpdfPromise;

  qpdfPromise = (async () => {
    const baseUrl = new URL('..', self.location.href).href;
    const runtimeUrl = new URL('qpdf.js', baseUrl).href;
    const wasmUrl = new URL('qpdf.wasm', baseUrl).href;

    try {
      self.importScripts(runtimeUrl);
    } catch (error) {
      throw new Error(
        'Failed to load the qpdf engine: ' +
          (error && error.message ? error.message : error)
      );
    }

    if (typeof self.Module !== 'function') {
      throw new Error('The qpdf engine did not initialize.');
    }

    try {
      return await self.Module({ locateFile: () => wasmUrl });
    } catch (error) {
      throw new Error(
        'Failed to initialize the qpdf engine: ' +
          (error && error.message ? error.message : error)
      );
    }
  })();

  qpdfPromise.catch(() => {
    qpdfPromise = null;
  });

  return qpdfPromise;
}
