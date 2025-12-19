const baseUrl = self.location.href.substring(0, self.location.href.lastIndexOf('/workers/') + 1);
self.importScripts(baseUrl + 'coherentpdf.browser.min.js');

self.onmessage = function (e) {
    const { command, files } = e.data;

    if (command === 'interleave') {
        interleavePDFs(files);
    }
};

function interleavePDFs(files) {
    try {
        const loadedPdfs = [];
        const pageCounts = [];

        for (const file of files) {
            const uint8Array = new Uint8Array(file.data);
            const pdfDoc = coherentpdf.fromMemory(uint8Array, "");
            loadedPdfs.push(pdfDoc);
            pageCounts.push(coherentpdf.pages(pdfDoc));
        }

        if (loadedPdfs.length < 2) {
            throw new Error('At least two PDF files are required for interleaving.');
        }

        const maxPages = Math.max(...pageCounts);

        const pdfsToMerge = [];
        const rangesToMerge = [];

        for (let i = 1; i <= maxPages; i++) {
            for (let j = 0; j < loadedPdfs.length; j++) {
                if (i <= pageCounts[j]) {
                    pdfsToMerge.push(loadedPdfs[j]);
                    rangesToMerge.push(coherentpdf.range(i, i));
                }
            }
        }

        if (pdfsToMerge.length === 0) {
            throw new Error('No valid pages to merge.');
        }

        const mergedPdf = coherentpdf.mergeSame(pdfsToMerge, true, true, rangesToMerge);

        const mergedPdfBytes = coherentpdf.toMemory(mergedPdf, false, true);
        const buffer = mergedPdfBytes.buffer;
        coherentpdf.deletePdf(mergedPdf);
        loadedPdfs.forEach(pdf => coherentpdf.deletePdf(pdf));

        self.postMessage({
            status: 'success',
            pdfBytes: buffer
        }, [buffer]);

    } catch (error) {
        self.postMessage({
            status: 'error',
            message: error.message || 'Unknown error during interleave merge'
        });
    }
}
