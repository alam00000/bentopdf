
















import { pdfToMarkdown } from './pdf-to-markdown.js';
import { repairPdf } from './repair-pdf.js';


// import { mdToPdf } from './md-to-pdf.js';







import { processAndSave } from './duplicate-organize.js';






import { wordToPdf } from './word-to-pdf.js';

import { setupCropperTool } from './cropper.js';









export const toolLogic = {



















  'duplicate-organize': { process: processAndSave },







  cropper: { setup: setupCropperTool },


};

