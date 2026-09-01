importScripts('qpdf-loader.js');

self.onmessage = async function (e) {
  const { command, files, jobs } = e.data;

  try {
    const qpdf = await loadQpdfRuntime();
    if (command === 'merge') {
      mergePDFs(qpdf, files, jobs);
    }
  } catch (error) {
    self.postMessage({
      status: 'error',
      message:
        (error && error.message) ||
        'Unknown error while merging PDFs. Please try again.',
    });
  }
};

function mergePDFs(qpdf, files, jobs) {
  const written = [];
  try {
    const pathForName = new Map();
    files.forEach((file, i) => {
      if (pathForName.has(file.name)) {
        throw new Error(
          'Merge received two files with the same name: ' + file.name
        );
      }
      const path = `/in${i}.pdf`;
      qpdf.FS.writeFile(path, new Uint8Array(file.data));
      written.push(path);
      pathForName.set(file.name, path);
    });

    const args = ['--empty', '--pages'];
    for (const job of jobs) {
      const path = pathForName.get(job.fileName);
      if (!path) {
        throw new Error(
          'Merge job references an unknown file: ' + job.fileName
        );
      }
      if (!job.pageSpec) {
        throw new Error('Merge job is missing a page range: ' + job.fileName);
      }
      args.push(path, job.pageSpec);
    }

    if (args.length < 4) {
      throw new Error('No valid files or pages to merge.');
    }

    args.push('--', '/out.pdf');

    const exitCode = qpdf.callMain(args);
    if (exitCode !== 0) {
      throw new Error(
        'Merge failed (qpdf exit code ' +
          exitCode +
          '). Check the page ranges and make sure all PDFs are valid.'
      );
    }

    const bytes = qpdf.FS.readFile('/out.pdf', { encoding: 'binary' });
    if (!bytes || bytes.length === 0) {
      throw new Error('Merge produced an empty PDF.');
    }

    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    );

    self.postMessage({ status: 'success', pdfBytes: buffer }, [buffer]);
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
