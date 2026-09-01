import { wfError } from '../workflow/errors';
import { buildInterleaveSeries } from './qpdf-merge-helpers';
import { getPDFDocument } from './helpers';

export interface InterleaveFile {
  name: string;
  data: ArrayBuffer;
}

export async function interleavePdfs(
  files: InterleaveFile[],
  options?: { pageCounts?: number[] }
): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error(wfError('alternateMergeNeedsTwo'));
  }

  let pageCounts = options?.pageCounts;
  if (!pageCounts || pageCounts.length !== files.length) {
    pageCounts = await Promise.all(
      files.map(async (f) => {
        const doc = await getPDFDocument({ data: f.data.slice(0) }).promise;
        const count = doc.numPages;
        await doc.destroy();
        return count;
      })
    );
  }

  const series = buildInterleaveSeries(pageCounts);

  return new Promise<Uint8Array>((resolve, reject) => {
    const worker = new Worker(
      import.meta.env.BASE_URL + 'workers/alternate-merge.worker.js'
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
      reject(
        new Error(
          wfError('alternateMergeWorkerError', { message: err.message })
        )
      );
    };

    worker.postMessage(
      {
        command: 'interleave',
        files,
        series,
      },
      files.map((f) => f.data)
    );
  });
}
