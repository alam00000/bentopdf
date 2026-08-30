import { buildPdf, type PdfObject } from './pdf-builder';

const enc = new TextEncoder();

function grayImage(size: number, shade: number): Uint8Array {
  const px = new Uint8Array(size * size);
  px.fill(shade);
  return px;
}

export function sharedResourcesPdf(pageCount = 8, imageSize = 96): Uint8Array {
  const objects: PdfObject[] = [];
  const kidRefs: string[] = [];

  const pagesRef = 2;
  const firstImage = 3;
  const firstPage = firstImage + pageCount * 1;

  objects.push({ body: '<< /Type /Catalog /Pages 2 0 R >>' });

  const xobjects = Array.from(
    { length: pageCount },
    (_, i) => `/Im${i} ${firstImage + i} 0 R`
  ).join(' ');
  objects.push({ body: '' });

  for (let i = 0; i < pageCount; i++) {
    const data = grayImage(imageSize, 20 + i * 20);
    objects.push({
      body:
        '<< /Type /XObject /Subtype /Image ' +
        `/Width ${imageSize} /Height ${imageSize} ` +
        `/ColorSpace /DeviceGray /BitsPerComponent 8 /Length ${data.length} >>`,
      stream: data,
    });
  }

  for (let i = 0; i < pageCount; i++) {
    const contentRef = firstPage + pageCount + i;
    kidRefs.push(`${firstPage + i} 0 R`);
    objects.push({
      body:
        `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 300 300] ` +
        `/Contents ${contentRef} 0 R >>`,
    });
  }

  for (let i = 0; i < pageCount; i++) {
    const stream = enc.encode(`q 200 0 0 200 40 40 cm /Im${i} Do Q\n`);
    objects.push({ body: `<< /Length ${stream.length} >>`, stream });
  }

  objects[pagesRef - 1] = {
    body:
      `<< /Type /Pages /Kids [${kidRefs.join(' ')}] /Count ${pageCount} ` +
      `/Resources << /XObject << ${xobjects} >> >> >>`,
  };

  return buildPdf(objects);
}

export function bookmarkedPdf(pageCount = 4): Uint8Array {
  const objects: PdfObject[] = [];
  const pagesRef = 2;
  const outlinesRef = 3;
  const firstItem = 4;
  const firstPage = firstItem + pageCount;
  const firstContent = firstPage + pageCount;
  const fontRef = firstContent + pageCount;

  objects.push({
    body: `<< /Type /Catalog /Pages ${pagesRef} 0 R /Outlines ${outlinesRef} 0 R /PageMode /UseOutlines >>`,
  });

  const kidRefs = Array.from(
    { length: pageCount },
    (_, i) => `${firstPage + i} 0 R`
  ).join(' ');
  objects.push({
    body: `<< /Type /Pages /Kids [${kidRefs}] /Count ${pageCount} >>`,
  });

  objects.push({
    body:
      `<< /Type /Outlines /First ${firstItem} 0 R ` +
      `/Last ${firstItem + pageCount - 1} 0 R /Count ${pageCount} >>`,
  });

  for (let i = 0; i < pageCount; i++) {
    const parts = [
      `/Title (Chapter ${i + 1})`,
      `/Parent ${outlinesRef} 0 R`,
      `/Dest [${firstPage + i} 0 R /Fit]`,
    ];
    if (i > 0) parts.push(`/Prev ${firstItem + i - 1} 0 R`);
    if (i < pageCount - 1) parts.push(`/Next ${firstItem + i + 1} 0 R`);
    objects.push({ body: `<< ${parts.join(' ')} >>` });
  }

  for (let i = 0; i < pageCount; i++) {
    objects.push({
      body:
        `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 300 300] ` +
        `/Resources << /Font << /F1 ${fontRef} 0 R >> >> ` +
        `/Contents ${firstContent + i} 0 R >>`,
    });
  }

  for (let i = 0; i < pageCount; i++) {
    const stream = enc.encode(
      `BT /F1 18 Tf 1 0 0 1 40 200 Tm (Chapter ${i + 1}) Tj ET\n`
    );
    objects.push({ body: `<< /Length ${stream.length} >>`, stream });
  }

  objects.push({
    body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  });

  return buildPdf(objects);
}
