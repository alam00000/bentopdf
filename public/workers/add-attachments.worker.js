const baseUrl = self.location.href.substring(0, self.location.href.lastIndexOf('/workers/') + 1);
self.importScripts(baseUrl + 'coherentpdf.browser.min.js');

function parsePageRange(rangeString, totalPages) {
  const pages = new Set();
  const parts = rangeString.split(',').map(s => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(s => parseInt(s.trim(), 10));
      if (isNaN(start) || isNaN(end)) continue;
      for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
        pages.add(i);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function addAttachmentsToPDFInWorker(pdfBuffer, attachmentBuffers, attachmentNames, attachmentLevel, pageRange) {
  try {
    const uint8Array = new Uint8Array(pdfBuffer);

    let pdf;
    try {
      pdf = coherentpdf.fromMemory(uint8Array, '');
    } catch (error) {
      const errorMsg = error.message || error.toString();

      if (errorMsg.includes('Failed to read PDF') ||
        errorMsg.includes('Could not read object') ||
        errorMsg.includes('No /Root entry') ||
        errorMsg.includes('PDFError')) {
        self.postMessage({
          status: 'error',
          message: 'The PDF file has structural issues and cannot be processed. The file may be corrupted, incomplete, or created with non-standard tools. Please try:\n\n• Opening and re-saving the PDF in another PDF viewer\n• Using a different PDF file\n• Repairing the PDF with a PDF repair tool'
        });
      } else {
        self.postMessage({
          status: 'error',
          message: `Failed to load PDF: ${errorMsg}`
        });
      }
      return;
    }

    const totalPages = coherentpdf.pages(pdf);

    let targetPages = [];
    if (attachmentLevel === 'page') {
      if (!pageRange) {
        self.postMessage({
          status: 'error',
          message: 'Page range is required for page-level attachments.'
        });
        coherentpdf.deletePdf(pdf);
        return;
      }
      targetPages = parsePageRange(pageRange, totalPages);
      if (targetPages.length === 0) {
        self.postMessage({
          status: 'error',
          message: 'Invalid page range specified.'
        });
        coherentpdf.deletePdf(pdf);
        return;
      }
    }

    for (let i = 0; i < attachmentBuffers.length; i++) {
      try {
        const attachmentData = new Uint8Array(attachmentBuffers[i]);
        const attachmentName = attachmentNames[i];

        if (attachmentLevel === 'document') {
          coherentpdf.attachFileFromMemory(attachmentData, attachmentName, pdf);
        } else {
          for (const pageNum of targetPages) {
            coherentpdf.attachFileToPageFromMemory(attachmentData, attachmentName, pdf, pageNum);
          }
        }
      } catch (error) {
        console.warn(`Failed to attach file ${attachmentNames[i]}:`, error);
        self.postMessage({
          status: 'error',
          message: `Failed to attach file ${attachmentNames[i]}: ${error.message || error}`
        });
        coherentpdf.deletePdf(pdf);
        return;
      }
    }

    // Save the modified PDF
    const modifiedBytes = coherentpdf.toMemory(pdf, false, false);
    coherentpdf.deletePdf(pdf);

    const buffer = modifiedBytes.buffer.slice(
      modifiedBytes.byteOffset,
      modifiedBytes.byteOffset + modifiedBytes.byteLength
    );

    self.postMessage({
      status: 'success',
      modifiedPDF: buffer
    }, [buffer]);

  } catch (error) {
    self.postMessage({
      status: 'error',
      message: error instanceof Error
        ? error.message
        : 'Unknown error occurred while adding attachments.'
    });
  }
}

self.onmessage = (e) => {
  if (e.data.command === 'add-attachments') {
    addAttachmentsToPDFInWorker(
      e.data.pdfBuffer,
      e.data.attachmentBuffers,
      e.data.attachmentNames,
      e.data.attachmentLevel || 'document',
      e.data.pageRange || ''
    );
  }
};
