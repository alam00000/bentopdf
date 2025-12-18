const baseUrl = self.location.href.substring(0, self.location.href.lastIndexOf('/workers/') + 1);
self.importScripts(baseUrl + 'coherentpdf.browser.min.js');

function generateTableOfContentsInWorker(
  pdfData,
  title,
  fontSize,
  fontFamily,
  addBookmark
) {
  try {
    const uint8Array = new Uint8Array(pdfData);
    const pdf = coherentpdf.fromMemory(uint8Array, '');

    coherentpdf.startGetBookmarkInfo(pdf);
    const bookmarkCount = coherentpdf.numberBookmarks();
    coherentpdf.endGetBookmarkInfo();

    if (bookmarkCount === 0) {
      coherentpdf.deletePdf(pdf);
      self.postMessage({
        status: 'error',
        message:
          'This PDF does not have any bookmarks. Please add bookmarks first using the Bookmark tool.',
      });
      return;
    }

    coherentpdf.tableOfContents(pdf, fontFamily, fontSize, title, addBookmark);
    const outputBytes = coherentpdf.toMemory(pdf, false, false);
    const outputBytesBuffer = outputBytes.buffer;
    coherentpdf.deletePdf(pdf);

    self.postMessage(
      {
        status: 'success',
        pdfBytes: outputBytesBuffer,
      },
      [outputBytesBuffer]
    );
  } catch (error) {
    self.postMessage({
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during table of contents generation.',
    });
  }
}

self.onmessage = (e) => {
  if (e.data.command === 'generate-toc') {
    generateTableOfContentsInWorker(
      e.data.pdfData,
      e.data.title,
      e.data.fontSize,
      e.data.fontFamily,
      e.data.addBookmark
    );
  }
};
