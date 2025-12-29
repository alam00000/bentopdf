/**
 * PDF/A Conversion using Ghostscript WASM
 * 
 * Converts PDFs to PDF/A-1b, PDF/A-2b, or PDF/A-3b format.
 */

import loadWASM from '@bentopdf/gs-wasm';

interface GhostscriptModule {
  FS: {
    writeFile(path: string, data: Uint8Array | string): void;
    readFile(path: string, opts?: { encoding?: string }): Uint8Array;
    unlink(path: string): void;
    stat(path: string): { size: number };
  };
  callMain(args: string[]): number;
}

export type PdfALevel = 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';

let cachedGsModule: GhostscriptModule | null = null;

export function setCachedGsModule(module: GhostscriptModule): void {
  cachedGsModule = module;
}

export function getCachedGsModule(): GhostscriptModule | null {
  return cachedGsModule;
}

/**
 * Encode binary data to Adobe ASCII85 (Base85) format.
 * This matches Python's base64.a85encode(data, adobe=True)
 */
function encodeBase85(data: Uint8Array): string {
  const POW85 = [85 * 85 * 85 * 85, 85 * 85 * 85, 85 * 85, 85, 1];
  let result = '';

  // Process 4 bytes at a time
  for (let i = 0; i < data.length; i += 4) {
    // Get 4 bytes (pad with zeros if needed)
    let value = 0;
    const remaining = Math.min(4, data.length - i);
    for (let j = 0; j < 4; j++) {
      value = value * 256 + (j < remaining ? data[i + j] : 0);
    }

    // Special case: all zeros become 'z'
    if (value === 0 && remaining === 4) {
      result += 'z';
    } else {
      // Encode to 5 ASCII85 characters
      const encoded: string[] = [];
      for (let j = 0; j < 5; j++) {
        encoded.push(String.fromCharCode((value / POW85[j]) % 85 + 33));
      }
      // For partial blocks, only output needed characters
      result += encoded.slice(0, remaining + 1).join('');
    }
  }

  return result;
}

export async function convertToPdfA(
  pdfData: Uint8Array,
  level: PdfALevel = 'PDF/A-2b',
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Loading Ghostscript...');

  let gs: GhostscriptModule;

  if (cachedGsModule) {
    gs = cachedGsModule;
  } else {
    gs = await loadWASM({
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return import.meta.env.BASE_URL + 'ghostscript-wasm/gs.wasm';
        }
        return path;
      },
      print: (text: string) => console.log('[GS]', text),
      printErr: (text: string) => console.error('[GS Error]', text),
    }) as GhostscriptModule;
    cachedGsModule = gs;
  }


  const pdfaMap: Record<PdfALevel, string> = {
    'PDF/A-1b': '1',
    'PDF/A-2b': '2',
    'PDF/A-3b': '3',
  };

  const inputPath = '/tmp/input.pdf';
  const outputPath = '/tmp/output.pdf';

  gs.FS.writeFile(inputPath, pdfData);
  console.log('[Ghostscript] Input file size:', pdfData.length);

  onProgress?.(`Converting to ${level}...`);
  const pdfaDefPath = '/tmp/pdfa.ps';

  try {
    const response = await fetch(import.meta.env.BASE_URL + 'ghostscript-wasm/sRGB_v4_ICC_preference.icc');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const iccData = new Uint8Array(await response.arrayBuffer());
    console.log('[Ghostscript] sRGB v4 ICC profile loaded:', iccData.length, 'bytes');

    // Write ICC profile as a binary file to FS (eliminates encoding issues)
    const iccPath = '/tmp/pdfa.icc';
    gs.FS.writeFile(iccPath, iccData);
    console.log('[Ghostscript] sRGB ICC profile written to FS:', iccPath);

    // Generate PostScript with reference to ICC file (Standard OCRmyPDF/GS approach)
    const pdfaPS = `%!
% Define OutputIntent subtype based on PDF/A level
/OutputIntentSubtype ${level === 'PDF/A-1b' ? '/GTS_PDFA1' : '/GTS_PDFA'} def

[/_objdef {icc_PDFA} /type /stream /OBJ pdfmark
[{icc_PDFA} <</N 3 >> /PUT pdfmark
[{icc_PDFA} (${iccPath}) (r) file /PUT pdfmark

[/_objdef {OutputIntent_PDFA} /type /dict /OBJ pdfmark
[{OutputIntent_PDFA} <<
  /Type /OutputIntent
  /S OutputIntentSubtype
  /DestOutputProfile {icc_PDFA}
  /OutputConditionIdentifier (sRGB)
>> /PUT pdfmark

[{Catalog} <<
  /OutputIntents [ {OutputIntent_PDFA} ]
>> /PUT pdfmark
`;
    gs.FS.writeFile(pdfaDefPath, pdfaPS);
    console.log('[Ghostscript] PDFA PostScript created with embedded ICC profile');
  } catch (e) {
    console.error('[Ghostscript] Failed to create PDFA PostScript:', e);
    throw new Error('Conversion failed: could not create PDF/A definition');
  }

  const args = [
    '-dBATCH',
    '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    `-dPDFA=${pdfaMap[level]}`,
    '-dPDFACompatibilityPolicy=1',
    `-dCompatibilityLevel=${level === 'PDF/A-1b' ? '1.4' : '1.7'}`,
    '-sColorConversionStrategy=RGB',
    '-dEmbedAllFonts=true',
    '-dSubsetFonts=true',
    '-dAutoRotatePages=/None',
    `-sOutputFile=${outputPath}`,
    pdfaDefPath,
    inputPath,
  ];

  console.log('[Ghostscript] Running PDF/A conversion...');

  let exitCode: number;
  try {
    exitCode = gs.callMain(args);
  } catch (e) {
    console.error('[Ghostscript] Exception:', e);
    throw new Error(`Ghostscript threw an exception: ${e}`);
  }

  console.log('[Ghostscript] Exit code:', exitCode);

  if (exitCode !== 0) {
    try { gs.FS.unlink(inputPath); } catch { /* ignore */ }
    try { gs.FS.unlink(outputPath); } catch { /* ignore */ }
    throw new Error(`Ghostscript conversion failed with exit code ${exitCode}`);
  }

  // Read output
  let output: Uint8Array;
  try {
    const stat = gs.FS.stat(outputPath);
    console.log('[Ghostscript] Output file size:', stat.size);
    output = gs.FS.readFile(outputPath);
  } catch (e) {
    console.error('[Ghostscript] Failed to read output:', e);
    throw new Error('Ghostscript did not produce output file');
  }

  // Cleanup
  try { gs.FS.unlink(inputPath); } catch { /* ignore */ }
  try { gs.FS.unlink(outputPath); } catch { /* ignore */ }

  return output;
}

export async function convertFileToPdfA(
  file: File,
  level: PdfALevel = 'PDF/A-2b',
  onProgress?: (msg: string) => void
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);
  const result = await convertToPdfA(pdfData, level, onProgress);
  // Copy to regular ArrayBuffer to avoid SharedArrayBuffer issues
  const copy = new Uint8Array(result.length);
  copy.set(result);
  return new Blob([copy], { type: 'application/pdf' });
}
