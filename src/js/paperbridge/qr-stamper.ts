import * as bwipjs from 'bwip-js/browser';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { buildQRUrl } from './tokens.js';

export interface QRPosition {
  /** Normalized 0-1 from left edge of page */
  x: number;
  /** Normalized 0-1 from top edge of page */
  y: number;
}

export const DEFAULT_QR_SIZE_PT = 60;

/** Default: bottom-right with 1/4" (18pt) print margin */
export function defaultPosition(
  pageWidth: number,
  pageHeight: number,
  qrSize = DEFAULT_QR_SIZE_PT
): QRPosition {
  const marginPt = 18;
  const labelBlockH = 18; // 2 label lines × 8pt + 2pt gap — matches stampPDF
  return {
    x: (pageWidth - qrSize - marginPt) / pageWidth,
    y: 1 - (qrSize + labelBlockH + marginPt) / pageHeight,
  };
}

export interface StampOptions {
  assignmentTitle: string;
  pageCount: number;
  packetCode: string | null;
  mode: 'generic' | 'anonymous';
  /** Per-page normalized positions (0-based index). Falls back to defaultPosition if shorter than page count. */
  positions?: QRPosition[];
  qrSizePt?: number;
}

async function renderQRCodeToPng(url: string): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  bwipjs.toCanvas(canvas, {
    bcid: 'qrcode',
    text: url,
    scale: 4,
    includetext: false,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to render QR code'));
        return;
      }
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), reject);
    }, 'image/png');
  });
}

function buildLabel(opts: StampOptions, pageNumber: number): string[] {
  if (opts.mode === 'anonymous' && opts.packetCode) {
    return [
      `Packet: ${opts.packetCode}`,
      `Page: ${pageNumber} of ${opts.pageCount}`,
    ];
  }
  return [
    opts.assignmentTitle.slice(0, 28),
    `Page: ${pageNumber} of ${opts.pageCount}`,
  ];
}

export async function stampPDF(
  pdfBytes: Uint8Array,
  tokens: string[],
  opts: StampOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const qrSize = opts.qrSizePt ?? DEFAULT_QR_SIZE_PT;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageNumber = i + 1;
    const token = tokens[i];
    if (!token) continue;

    const { width, height } = page.getSize();

    const pos: QRPosition =
      opts.positions && opts.positions[i]
        ? opts.positions[i]
        : defaultPosition(width, height, qrSize);

    const qrUrl = buildQRUrl(token);
    const qrPng = await renderQRCodeToPng(qrUrl);
    const qrImage = await pdfDoc.embedPng(qrPng);

    const labelFontSize = 6;
    const labelLineHeight = 8;
    const labelLines = buildLabel(opts, pageNumber);
    const labelBlockH = labelLines.length * labelLineHeight + 2;

    // pos.x, pos.y are normalized from top-left. Convert to PDF coords (origin = bottom-left).
    const pdfX = pos.x * width;
    const pdfY = (1 - pos.y) * height - qrSize - labelBlockH;

    // Clamp to page bounds
    const clampedX = Math.max(0, Math.min(pdfX, width - qrSize));
    const clampedY = Math.max(0, Math.min(pdfY, height - qrSize - labelBlockH));

    const maxLabelWidth = labelLines.reduce(
      (max, l) => Math.max(max, font.widthOfTextAtSize(l, labelFontSize)),
      0
    );
    const bgWidth = Math.max(qrSize, maxLabelWidth) + 4;
    const bgHeight = qrSize + labelBlockH + 4;

    // White background
    page.drawRectangle({
      x: clampedX - 2,
      y: clampedY - 2,
      width: bgWidth,
      height: bgHeight,
      color: rgb(1, 1, 1),
      opacity: 0.9,
    });

    // QR code image
    page.drawImage(qrImage, {
      x: clampedX,
      y: clampedY + labelBlockH,
      width: qrSize,
      height: qrSize,
    });

    // Label lines (bottom to top in PDF coords)
    for (let li = 0; li < labelLines.length; li++) {
      page.drawText(labelLines[li], {
        x: clampedX,
        y: clampedY + (labelLines.length - 1 - li) * labelLineHeight,
        size: labelFontSize,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
    }
  }

  return pdfDoc.save();
}
