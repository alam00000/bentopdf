import { WasmProvider } from './wasm-provider';
import { wfError } from '../workflow/errors';

export interface InterleaveFile {
  name: string;
  data: ArrayBuffer;
}

export async function interleavePdfs(
  files: InterleaveFile[]
): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error(wfError('alternateMergeNeedsTwo'));
  }

  const cpdfBaseUrl = WasmProvider.getUrl('cpdf');
  if (!cpdfBaseUrl) {
    throw new Error(wfError('cpdfNotConfigured'));
  }

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
        cpdfUrl: cpdfBaseUrl + 'coherentpdf.browser.min.js',
      },
      files.map((f) => f.data)
    );
  });
}
