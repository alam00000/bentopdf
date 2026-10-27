import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument, PDFName, rgb } from 'pdf-lib';

const { isWasmAvailable } = vi.hoisted(() => ({
  isWasmAvailable: vi.fn(),
}));

vi.mock('../js/config/wasm-cdn-config.js', () => ({
  isWasmAvailable,
  getWasmBaseUrl: () => 'https://cdn.example/gs/assets/',
}));

const { normalizeCmykForDocx, pdfUsesCmyk, setCachedGsModule } =
  await import('../js/utils/ghostscript-loader');

const RGB_OUTPUT = new TextEncoder().encode('%PDF-1.4 rgb output');

function fakeGhostscript(exitCode = 0) {
  const files = new Map<string, Uint8Array>();
  const calls: string[][] = [];
  const module = {
    FS: {
      writeFile(path: string, data: Uint8Array | string) {
        files.set(
          path,
          typeof data === 'string' ? new TextEncoder().encode(data) : data
        );
      },
      readFile(path: string) {
        const data = files.get(path);
        if (!data) throw new Error(`no file ${path}`);
        return data;
      },
      unlink(path: string) {
        if (!files.delete(path)) throw new Error(`no file ${path}`);
      },
      stat(path: string) {
        return { size: files.get(path)?.length ?? 0 };
      },
    },
    callMain(args: string[]) {
      calls.push(args);
      const output = args.find((arg) => arg.startsWith('-sOutputFile='));
      if (exitCode === 0 && output) {
        files.set(output.slice('-sOutputFile='.length), RGB_OUTPUT);
      }
      return exitCode;
    },
  };
  setCachedGsModule(module);
  return { files, calls };
}

async function cmykImagePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([200, 200]);
  const image = doc.context.register(
    doc.context.flateStream(new Uint8Array(4 * 4 * 4).fill(128), {
      Type: 'XObject',
      Subtype: 'Image',
      Width: 4,
      Height: 4,
      ColorSpace: 'DeviceCMYK',
      BitsPerComponent: 8,
    })
  );
  page.node.set(
    PDFName.of('Resources'),
    doc.context.obj({ XObject: { Im1: image } })
  );
  page.node.set(
    PDFName.of('Contents'),
    doc.context.register(
      doc.context.flateStream('q 100 0 0 100 50 50 cm /Im1 Do Q')
    )
  );
  return doc.save();
}

async function rgbPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage().drawRectangle({
    x: 10,
    y: 10,
    width: 50,
    height: 50,
    color: rgb(1, 0, 0),
  });
  return doc.save();
}

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

beforeEach(() => {
  isWasmAvailable.mockReset();
  isWasmAvailable.mockReturnValue(true);
});

describe('pdfUsesCmyk', () => {
  it('spots CMYK images, 4-channel ICC profiles and spot colors', async () => {
    const text = (value: string) => new TextEncoder().encode(value);
    expect(pdfUsesCmyk(await cmykImagePdf())).toBe(true);
    expect(pdfUsesCmyk(text('<< /N 4 /Length 3144 >>'))).toBe(true);
    expect(
      pdfUsesCmyk(text('[/Separation /PANTONE#20185 /DeviceRGB 5 0 R]'))
    ).toBe(true);
    expect(
      pdfUsesCmyk(text('[/DeviceN [/Cyan /Black] /DeviceRGB 5 0 R]'))
    ).toBe(true);
  });

  it('ignores RGB-only PDFs and look-alike keys', async () => {
    expect(pdfUsesCmyk(await rgbPdf())).toBe(false);
    const text = (value: string) => new TextEncoder().encode(value);
    expect(pdfUsesCmyk(text('<< /N 40 /Separations 2 >>'))).toBe(false);
    expect(pdfUsesCmyk(text('<< /Type /ObjStm /N 4 /First 20 >>'))).toBe(false);
    expect(pdfUsesCmyk(text('<< /Linearized 1 /L 9000 /N 4 /T 8000 >>'))).toBe(
      false
    );
  });
});

describe('normalizeCmykForDocx', () => {
  it('converts a CMYK PDF to RGB with Ghostscript in safe mode', async () => {
    const gs = fakeGhostscript();
    const output = await normalizeCmykForDocx(pdfBlob(await cmykImagePdf()));

    expect(Array.from(new Uint8Array(await output.arrayBuffer()))).toEqual(
      Array.from(RGB_OUTPUT)
    );
    expect(gs.calls).toHaveLength(1);
    expect(gs.calls[0]).toContain('-dSAFER');
    expect(gs.calls[0]).not.toContain('-dNOSAFER');
    expect(gs.calls[0]).toContain('-sColorConversionStrategy=sRGB');
    expect(gs.files.size).toBe(0);
  });

  it('leaves a PDF without CMYK untouched and never starts Ghostscript', async () => {
    const gs = fakeGhostscript();
    const input = pdfBlob(await rgbPdf());

    expect(await normalizeCmykForDocx(input)).toBe(input);
    expect(gs.calls).toHaveLength(0);
  });

  it('falls back to the original PDF when Ghostscript fails', async () => {
    const gs = fakeGhostscript(1);
    const input = pdfBlob(await cmykImagePdf());
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(await normalizeCmykForDocx(input)).toBe(input);
    expect(gs.files.size).toBe(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('skips the conversion when Ghostscript is not configured', async () => {
    const gs = fakeGhostscript();
    isWasmAvailable.mockReturnValue(false);
    const input = pdfBlob(await cmykImagePdf());

    expect(await normalizeCmykForDocx(input)).toBe(input);
    expect(gs.calls).toHaveLength(0);
  });
});
