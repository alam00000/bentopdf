import { wfError } from '../workflow/errors';
import { mergeJobToPageSpec } from './qpdf-merge-helpers';

export interface MergeFile {
  name: string;
  data: ArrayBuffer;
}

export async function mergePdfsWithQpdf(
  files: MergeFile[]
): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error(wfError('noPdfsConnected', { node: 'Merge' }));
  }

  const jobs = files.map((f) => {
    const job = { fileName: f.name, rangeType: 'all' as const };
    return { ...job, pageSpec: mergeJobToPageSpec(job) ?? '1-z' };
  });

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
        files,
        jobs,
      },
      files.map((f) => f.data)
    );
  });
}
