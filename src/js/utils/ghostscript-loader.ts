/**
 * PDF/A Conversion using Ghostscript WASM
 * * Converts PDFs to PDF/A-1b, PDF/A-2b, or PDF/A-3b format.
 */

import loadWASM from '@bentopdf/gs-wasm';
import { getWasmBaseUrl, fetchWasmFile } from '../config/wasm-cdn-config.js';
import { PDFDocument, PDFDict, PDFName, PDFArray } from 'pdf-lib';

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
    const gsBaseUrl = getWasmBaseUrl('ghostscript');
    gs = (await loadWASM({
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return gsBaseUrl + 'gs.wasm';
        }
        return path;
      },
      print: (text: string) => console.log('[GS]', text),
      printErr: (text: string) => console.error('[GS Error]', text),
    })) as GhostscriptModule;
    cachedGsModule = gs;
  }

  const pdfaMap: Record<PdfALevel, string> = {
    'PDF/A-1b': '1',
    'PDF/A-2b': '2',
    'PDF/A-3b': '3',
  };

  const inputPath = '/tmp/input.pdf';
  const outputPath = '/tmp/output.pdf';
  const iccPath = '/tmp/pdfa.icc';
  const pdfaDefPath = '/tmp/pdfa.ps';

  gs.FS.writeFile(inputPath, pdfData);
  console.log('[Ghostscript] Input file size:', pdfData.length);

  onProgress?.(`Converting to ${level}...`);

  try {
    const iccFileName = 'sRGB_IEC61966-2-1_no_black_scaling.icc';
    const response = await fetchWasmFile('ghostscript', iccFileName);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ICC profile: ${iccFileName}. Ensure it is in your assets folder.`
      );
    }

    const iccData = new Uint8Array(await response.arrayBuffer());
    console.log(
      '[Ghostscript] sRGB v2 ICC profile loaded:',
      iccData.length,
      'bytes'
    );

    gs.FS.writeFile(iccPath, iccData);
    console.log('[Ghostscript] sRGB ICC profile written to FS:', iccPath);

    const iccHex = Array.from(iccData)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    console.log('[Ghostscript] ICC profile hex length:', iccHex.length);

    const pdfaSubtype = level === 'PDF/A-1b' ? '/GTS_PDFA1' : '/GTS_PDFA';

    const pdfaPS = `%!
% PDF/A definition file for ${level}

% Define the ICC profile stream object with embedded hex data
[/_objdef {icc_PDFA} /type /stream /OBJ pdfmark
[{icc_PDFA} << /N 3 >> /PUT pdfmark
[{icc_PDFA} <${iccHex}> /PUT pdfmark

% Define the OutputIntent dictionary
[/_objdef {OutputIntent_PDFA} /type /dict /OBJ pdfmark
[{OutputIntent_PDFA} <<
  /Type /OutputIntent
  /S ${pdfaSubtype}
  /DestOutputProfile {icc_PDFA}
  /OutputConditionIdentifier (sRGB IEC61966-2.1)
  /Info (sRGB IEC61966-2.1)
  /RegistryName (http://www.color.org)
>> /PUT pdfmark

% Attach OutputIntent to the document Catalog
[{Catalog} << /OutputIntents [ {OutputIntent_PDFA} ] >> /PUT pdfmark
`;

    gs.FS.writeFile(pdfaDefPath, pdfaPS);
    console.log(
      '[Ghostscript] PDFA PostScript created with embedded ICC hex data'
    );
  } catch (e) {
    console.error('[Ghostscript] Failed to setup PDF/A assets:', e);
    throw new Error('Conversion failed: could not create PDF/A definition');
  }

  const args = [
    '-dNOSAFER',
    '-dBATCH',
    '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    `-dPDFA=${pdfaMap[level]}`,
    '-dPDFACompatibilityPolicy=1',
    `-dCompatibilityLevel=${level === 'PDF/A-1b' ? '1.4' : '1.7'}`,
    '-sColorConversionStrategy=UseDeviceIndependentColor',
    '-sICCProfilesDir=/tmp/',
    `-sOutputICCProfile=${iccPath}`,
    `-sDefaultRGBProfile=${iccPath}`,
    `-sBlendColorProfile=${iccPath}`,
    '-dCompressPages=true',
    '-dWriteObjStms=false',
    '-dWriteXRefStm=false',
    '-dEmbedAllFonts=true',
    '-dSubsetFonts=true',
    '-dAutoRotatePages=/None',
    `-sOutputFile=${outputPath}`,
    pdfaDefPath,
    inputPath,
  ];

  console.log('[Ghostscript] Running PDF/A conversion...');
  try {
    console.log('[Ghostscript] Checking version:');
    gs.callMain(['--version']);
  } catch (e) {
    console.warn('[Ghostscript] Could not check version:', e);
  }

  let exitCode: number;
  try {
    exitCode = gs.callMain(args);
  } catch (e) {
    console.error('[Ghostscript] Exception:', e);
    throw new Error(`Ghostscript threw an exception: ${e}`);
  }

  console.log('[Ghostscript] Exit code:', exitCode);

  if (exitCode !== 0) {
    try {
      gs.FS.unlink(inputPath);
    } catch {
      /* ignore */
    }
    try {
      gs.FS.unlink(outputPath);
    } catch {
      /* ignore */
    }
    try {
      gs.FS.unlink(iccPath);
    } catch {
      /* ignore */
    }
    try {
      gs.FS.unlink(pdfaDefPath);
    } catch {
      /* ignore */
    }
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
  try {
    gs.FS.unlink(inputPath);
  } catch {
    /* ignore */
  }
  try {
    gs.FS.unlink(outputPath);
  } catch {
    /* ignore */
  }
  try {
    gs.FS.unlink(iccPath);
  } catch {
    /* ignore */
  }
  try {
    gs.FS.unlink(pdfaDefPath);
  } catch {
    /* ignore */
  }

  if (level !== 'PDF/A-1b') {
    onProgress?.('Post-processing for transparency compliance...');
    console.log(
      '[Ghostscript] Adding Group dictionaries to pages for transparency compliance...'
    );

    try {
      output = await addPageGroupDictionaries(output);
      console.log('[Ghostscript] Page Group dictionaries added successfully');
    } catch (e) {
      console.error('[Ghostscript] Failed to add Group dictionaries:', e);
    }
  }

  return output;
}

async function addPageGroupDictionaries(
  pdfData: Uint8Array
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfData, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const catalog = pdfDoc.catalog;
  const outputIntentsArray = catalog.lookup(PDFName.of('OutputIntents'));

  let iccProfileRef: ReturnType<typeof PDFDict.prototype.get> = undefined;

  if (outputIntentsArray instanceof PDFArray) {
    const firstIntent = outputIntentsArray.lookup(0);
    if (firstIntent instanceof PDFDict) {
      iccProfileRef = firstIntent.get(PDFName.of('DestOutputProfile'));
    }
  }

  const updateGroupCS = (groupDict: PDFDict) => {
    if (!iccProfileRef) return;

    const currentCS = groupDict.get(PDFName.of('CS'));

    if (currentCS instanceof PDFName) {
      const csName = currentCS.decodeText();
      if (
        csName === 'DeviceRGB' ||
        csName === 'DeviceGray' ||
        csName === 'DeviceCMYK'
      ) {
        const iccColorSpace = pdfDoc.context.obj([
          PDFName.of('ICCBased'),
          iccProfileRef,
        ]);
        groupDict.set(PDFName.of('CS'), iccColorSpace);
      }
    } else if (!currentCS) {
      const iccColorSpace = pdfDoc.context.obj([
        PDFName.of('ICCBased'),
        iccProfileRef,
      ]);
      groupDict.set(PDFName.of('CS'), iccColorSpace);
    }
  };

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const pageDict = page.node;

    const existingGroup = pageDict.lookup(PDFName.of('Group'));
    if (existingGroup) {
      if (existingGroup instanceof PDFDict) {
        updateGroupCS(existingGroup);
      }
    } else if (iccProfileRef) {
      const colorSpace = pdfDoc.context.obj([
        PDFName.of('ICCBased'),
        iccProfileRef,
      ]);
      const groupDict = pdfDoc.context.obj({
        Type: 'Group',
        S: 'Transparency',
        I: false,
        K: false,
      });
      (groupDict as PDFDict).set(PDFName.of('CS'), colorSpace);
      pageDict.set(PDFName.of('Group'), groupDict);
    }
  }

  if (iccProfileRef) {
    pdfDoc.context.enumerateIndirectObjects().forEach(([ref, obj]) => {
      if (
        obj instanceof PDFDict ||
        (obj && typeof obj === 'object' && 'dict' in obj)
      ) {
        const dict =
          'dict' in obj ? (obj as { dict: PDFDict }).dict : (obj as PDFDict);

        const subtype = dict.get(PDFName.of('Subtype'));
        if (subtype instanceof PDFName && subtype.decodeText() === 'Form') {
          const group = dict.lookup(PDFName.of('Group'));
          if (group instanceof PDFDict) {
            updateGroupCS(group);
          }
        }
      }
    });
  }

  return await pdfDoc.save({
    useObjectStreams: false,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });
}

export async function convertFileToPdfA(
  file: File,
  level: PdfALevel = 'PDF/A-2b',
  onProgress?: (msg: string) => void
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);
  const result = await convertToPdfA(pdfData, level, onProgress);
  const copy = new Uint8Array(result.length);
  copy.set(result);
  return new Blob([copy], { type: 'application/pdf' });
}

export async function convertFontsToOutlines(
  pdfData: Uint8Array,
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  onProgress?.('Loading Ghostscript...');

  let gs: GhostscriptModule;

  if (cachedGsModule) {
    gs = cachedGsModule;
  } else {
    const gsBaseUrl = getWasmBaseUrl('ghostscript');
    gs = (await loadWASM({
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return gsBaseUrl + 'gs.wasm';
        }
        return path;
      },
      print: (text: string) => console.log('[GS]', text),
      printErr: (text: string) => console.error('[GS Error]', text),
    })) as GhostscriptModule;
    cachedGsModule = gs;
  }

  const inputPath = '/tmp/input.pdf';
  const outputPath = '/tmp/output.pdf';

  gs.FS.writeFile(inputPath, pdfData);

  onProgress?.('Converting fonts to outlines...');

  const args = [
    '-dNOSAFER',
    '-dBATCH',
    '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    '-dNoOutputFonts',
    '-dCompressPages=true',
    '-dAutoRotatePages=/None',
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];

  let exitCode: number;
  try {
    exitCode = gs.callMain(args);
  } catch (e) {
    try {
      gs.FS.unlink(inputPath);
    } catch {}
    throw new Error(`Ghostscript threw an exception: ${e}`);
  }

  if (exitCode !== 0) {
    try {
      gs.FS.unlink(inputPath);
    } catch {}
    try {
      gs.FS.unlink(outputPath);
    } catch {}
    throw new Error(`Ghostscript conversion failed with exit code ${exitCode}`);
  }

  let output: Uint8Array;
  try {
    output = gs.FS.readFile(outputPath);
  } catch (e) {
    throw new Error('Ghostscript did not produce output file');
  }

  try {
    gs.FS.unlink(inputPath);
  } catch {}
  try {
    gs.FS.unlink(outputPath);
  } catch {}

  return output;
}

export async function convertFileToOutlines(
  file: File,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);
  const result = await convertFontsToOutlines(pdfData, onProgress);
  const copy = new Uint8Array(result.length);
  copy.set(result);
  return new Blob([copy], { type: 'application/pdf' });
}
