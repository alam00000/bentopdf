self.importScripts('/coherentpdf.browser.min.js');

function extractAttachmentsFromPDFsInWorker(fileBuffers, fileNames) {
  try {
    const allAttachments = [];
    const totalFiles = fileBuffers.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const buffer = fileBuffers[i];
      const fileName = fileNames[i];
      const uint8Array = new Uint8Array(buffer);
      
      let pdf;
      try {
        pdf = coherentpdf.fromMemory(uint8Array, '');
      } catch (error) {
        console.warn(`Failed to load PDF: ${fileName}`, error);
        continue;
      }

      coherentpdf.startGetAttachments(pdf);
      const attachmentCount = coherentpdf.numberGetAttachments();

      if (attachmentCount === 0) {
        console.warn(`No attachments found in ${fileName}`);
        coherentpdf.deletePdf(pdf);
        continue;
      }

      const baseName = fileName.replace(/\.pdf$/i, '');
      for (let j = 0; j < attachmentCount; j++) {
        try {
          const attachmentName = coherentpdf.getAttachmentName(j);
          const attachmentPage = coherentpdf.getAttachmentPage(j);
          const attachmentData = coherentpdf.getAttachmentData(j);

          let uniqueName = attachmentName;
          let counter = 1;
          while (allAttachments.some(att => att.name === uniqueName)) {
            const nameParts = attachmentName.split('.');
            if (nameParts.length > 1) {
              const extension = nameParts.pop();
              uniqueName = `${nameParts.join('.')}_${counter}.${extension}`;
            } else {
              uniqueName = `${attachmentName}_${counter}`;
            }
            counter++;
          }

          if (attachmentPage > 0) {
            uniqueName = `${baseName}_page${attachmentPage}_${uniqueName}`;
          } else {
            uniqueName = `${baseName}_${uniqueName}`;
          }

          allAttachments.push({
            name: uniqueName,
            data: attachmentData.buffer.slice(0)
          });
        } catch (error) {
          console.warn(`Failed to extract attachment ${j} from ${fileName}:`, error);
        }
      }

      coherentpdf.endGetAttachments();
      coherentpdf.deletePdf(pdf);
    }

    if (allAttachments.length === 0) {
      self.postMessage({
        status: 'error',
        message: 'No attachments were found in the selected PDF(s).'
      });
      return;
    }
    
    const response = {
      status: 'success',
      attachments: []
    };

    const transferBuffers = [];
    for (const attachment of allAttachments) {
      response.attachments.push({
        name: attachment.name,
        data: attachment.data
      });
      transferBuffers.push(attachment.data);
    }

    self.postMessage(response, transferBuffers);
  } catch (error) {
    self.postMessage({
      status: 'error',
      message: error instanceof Error
        ? error.message
        : 'Unknown error occurred during attachment extraction.'
    });
  }
}

self.onmessage = (e) => {
  if (e.data.command === 'extract-attachments') {
    extractAttachmentsFromPDFsInWorker(e.data.fileBuffers, e.data.fileNames);
  }
};