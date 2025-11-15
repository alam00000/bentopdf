self.importScripts('/coherentpdf.browser.min.js');

function getAttachmentsFromPDFInWorker(fileBuffer, fileName) {
  try {
    const uint8Array = new Uint8Array(fileBuffer);
    
    let pdf;
    try {
      pdf = coherentpdf.fromMemory(uint8Array, '');
    } catch (error) {
      self.postMessage({
        status: 'error',
        message: `Failed to load PDF: ${fileName}. Error: ${error.message || error}`
      });
      return;
    }

    coherentpdf.startGetAttachments(pdf);
    const attachmentCount = coherentpdf.numberGetAttachments();

    if (attachmentCount === 0) {
      self.postMessage({
        status: 'success',
        attachments: [],
        fileName: fileName
      });
      coherentpdf.deletePdf(pdf);
      return;
    }

    const attachments = [];
    for (let i = 0; i < attachmentCount; i++) {
      try {
        const name = coherentpdf.getAttachmentName(i);
        const page = coherentpdf.getAttachmentPage(i);
        const attachmentData = coherentpdf.getAttachmentData(i);

        const dataArray = new Uint8Array(attachmentData);
        const buffer = dataArray.buffer.slice(dataArray.byteOffset, dataArray.byteOffset + dataArray.byteLength);

        attachments.push({
          index: i,
          name: String(name),  
          page: Number(page), 
          data: buffer
        });
      } catch (error) {
        console.warn(`Failed to get attachment ${i} from ${fileName}:`, error);
      }
    }

    coherentpdf.endGetAttachments();
    coherentpdf.deletePdf(pdf);

    const response = {
      status: 'success',
      attachments: attachments,
      fileName: fileName
    };

    const transferBuffers = attachments.map(att => att.data);
    self.postMessage(response, transferBuffers);
  } catch (error) {
    self.postMessage({
      status: 'error',
      message: error instanceof Error
        ? error.message
        : 'Unknown error occurred during attachment listing.'
    });
  }
}

function editAttachmentsInPDFInWorker(fileBuffer, fileName, attachmentsToRemove) {
  try {
    const uint8Array = new Uint8Array(fileBuffer);
    
    let pdf;
    try {
      pdf = coherentpdf.fromMemory(uint8Array, '');
    } catch (error) {
      self.postMessage({
        status: 'error',
        message: `Failed to load PDF: ${fileName}. Error: ${error.message || error}`
      });
      return;
    }

    if (attachmentsToRemove && attachmentsToRemove.length > 0) {
      coherentpdf.startGetAttachments(pdf);
      const attachmentCount = coherentpdf.numberGetAttachments();
      const attachmentsToKeep = [];
      
      for (let i = 0; i < attachmentCount; i++) {
        if (!attachmentsToRemove.includes(i)) {
          const name = coherentpdf.getAttachmentName(i);
          const page = coherentpdf.getAttachmentPage(i);
          const data = coherentpdf.getAttachmentData(i);
          
          const dataCopy = new Uint8Array(data.length);
          dataCopy.set(new Uint8Array(data));
          
          attachmentsToKeep.push({ 
            name: String(name), 
            page: Number(page),  
            data: dataCopy 
          });
        }
      }
      
      coherentpdf.endGetAttachments();

      coherentpdf.removeAttachedFiles(pdf);
      
      for (const attachment of attachmentsToKeep) {
        if (attachment.page === 0) {
          coherentpdf.attachFileFromMemory(attachment.data, attachment.name, pdf);
        } else {
          coherentpdf.attachFileToPageFromMemory(attachment.data, attachment.name, pdf, attachment.page);
        }
      }
    }
    
    const modifiedBytes = coherentpdf.toMemory(pdf, false, true);
    coherentpdf.deletePdf(pdf);

    const buffer = modifiedBytes.buffer.slice(modifiedBytes.byteOffset, modifiedBytes.byteOffset + modifiedBytes.byteLength);

    const response = {
      status: 'success',
      modifiedPDF: buffer,
      fileName: fileName
    };

    self.postMessage(response, [response.modifiedPDF]);
  } catch (error) {
    self.postMessage({
      status: 'error',
      message: error instanceof Error
        ? error.message
        : 'Unknown error occurred during attachment editing.'
    });
  }
}

self.onmessage = (e) => {
  if (e.data.command === 'get-attachments') {
    getAttachmentsFromPDFInWorker(e.data.fileBuffer, e.data.fileName);
  } else if (e.data.command === 'edit-attachments') {
    editAttachmentsInPDFInWorker(e.data.fileBuffer, e.data.fileName, e.data.attachmentsToRemove);
  }
};