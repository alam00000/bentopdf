importScripts('qpdf-loader.js');

self.onmessage = async function (e) {
  const { command, files, series } = e.data;
  const inputFiles = files || [];
  const inputBuffers = inputFiles.map(function (file) {
    return file.data;
  });

  try {
    const qpdf = await loadQpdfRuntime();
    if (command === 'interleave') {
      interleavePDFs(qpdf, inputFiles, series, inputBuffers);
    } else {
      self.postMessage(
        {
          status: 'error',
          message: 'Unknown interleave command received.',
          files: inputFiles,
        },
        inputBuffers
      );
    }
  } catch (error) {
    self.postMessage(
      {
        status: 'error',
        message:
          (error && error.message) ||
          'Unknown error while mixing PDFs. Please try again.',
        files: inputFiles,
      },
      inputBuffers
    );
  }
};

function interleavePDFs(qpdf, files, series, inputBuffers) {
  const written = [];
  try {
    files.forEach((file, i) => {
      const path = `/in${i}.pdf`;
      qpdf.FS.writeFile(path, new Uint8Array(file.data));
      written.push(path);
    });

    if (files.length < 2) {
      throw new Error('At least two PDF files are required for interleaving.');
    }
    if (!Array.isArray(series) || series.length === 0) {
      throw new Error('No pages to interleave.');
    }

    const args = ['--empty', '--pages'];
    for (const step of series) {
      if (
        !step ||
        typeof step.fileIndex !== 'number' ||
        typeof step.page !== 'number' ||
        step.fileIndex < 0 ||
        step.fileIndex >= files.length
      ) {
        throw new Error('Invalid interleave series received by the worker.');
      }
      args.push(`/in${step.fileIndex}.pdf`, String(step.page));
    }

    args.push('--', '/out.pdf');

    const exitCode = qpdf.callMain(args);
    if (exitCode !== 0) {
      throw new Error(
        'Mixing failed (qpdf exit code ' +
          exitCode +
          '). Please check that all PDFs are valid and try again.'
      );
    }

    const bytes = qpdf.FS.readFile('/out.pdf', { encoding: 'binary' });
    if (!bytes || bytes.length === 0) {
      throw new Error('Mixing produced an empty PDF.');
    }

    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    );

    self.postMessage(
      { status: 'success', pdfBytes: buffer, files: files },
      [buffer].concat(inputBuffers)
    );
  } finally {
    for (const path of written) {
      try {
        qpdf.FS.unlink(path);
      } catch {}
    }
    try {
      qpdf.FS.unlink('/out.pdf');
    } catch (cleanupError) {
      void cleanupError;
    }
  }
}
