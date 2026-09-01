import { wfError } from '../workflow/errors';
import type { MergeFile } from '@/types';

export async function mergePdfsWithQpdf(
  files: MergeFile[]
): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error(wfError('noPdfsConnected', { node: 'Merge' }));
  }

  const jobs = files.map((f, idx) => ({
    fileName: `input-${idx}.pdf`,
    pageSpec: '1-z',
  }));

  const uniqueFiles = files.map(
    (f, idx): MergeFile => ({
      name: `input-${idx}.pdf`,
      data: f.data,
    })
  );

  return new Promise<Uint8Array>((resolve, reject) => {
    const worker = new Worker(
      import.meta.env.BASE_URL + 'workers/merge.worker.js'
    );

    worker.onmessage = (e: MessageEvent) => {
      worker.terminate();
      if (e.data.status === 'success') {
        resolve(new Uint8Array(e.data.pdfBytes));
      } else {
        reject(
          new Error(
            e.data.message || wfError('workerError', { message: 'unknown' })
          )
        );
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(new Error(wfError('workerError', { message: err.message })));
    };

    worker.postMessage(
      {
        command: 'merge',
        files: uniqueFiles,
        jobs,
      },
      uniqueFiles.map((f) => f.data)
    );
  });
}
