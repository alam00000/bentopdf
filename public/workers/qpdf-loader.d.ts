interface QpdfWorkerFS {
  writeFile: (path: string, data: Uint8Array | string) => void;
  readFile: (path: string, opts?: { encoding?: string }) => Uint8Array;
  unlink: (path: string) => void;
}

interface QpdfWorkerInstance {
  callMain: (args: string[]) => number;
  FS: QpdfWorkerFS;
}

declare function loadQpdfRuntime(): Promise<QpdfWorkerInstance>;
