import { merge, setupMergeTool } from './merge.js';
import { setupSplitTool, split } from './split.js';
import { encrypt } from './encrypt.js';
import { decrypt } from './decrypt.js';
import { organize } from './organize.js';
import { rotate } from './rotate.js';
import { addPageNumbers } from './add-page-numbers.js';
import { pdfToJpg } from './pdf-to-jpg.js';
import { jpgToPdf } from './jpg-to-pdf.js';
import { scanToPdf } from './scan-to-pdf.js';
import { compress } from './compress.js';
import { pdfToGreyscale } from './pdf-to-greyscale.js';
import { pdfToZip } from './pdf-to-zip.js';
import { editMetadata } from './edit-metadata.js';
import { removeMetadata } from './remove-metadata.js';
import { flatten } from './flatten.js';
import { pdfToPng } from './pdf-to-png.js';
import { pngToPdf } from './png-to-pdf.js';
import { pdfToWebp } from './pdf-to-webp.js';
import { webpToPdf } from './webp-to-pdf.js';
import { deletePages } from './delete-pages.js';
import { addBlankPage } from './add-blank-page.js';
import { extractPages } from './extract-pages.js';
import { addWatermark, setupWatermarkUI } from './add-watermark.js';
import { addHeaderFooter } from './add-header-footer.js';
import { imageToPdf } from './image-to-pdf.js';
import { changePermissions } from './change-permissions.js';
import { pdfToMarkdown } from './pdf-to-markdown.js';
import { txtToPdf } from './txt-to-pdf.js';
import { invertColors } from './invert-colors.js';
// import { viewMetadata } from './view-metadata.js';
import { reversePages } from './reverse-pages.js';
// import { mdToPdf } from './md-to-pdf.js';
import { svgToPdf } from './svg-to-pdf.js';
import { bmpToPdf } from './bmp-to-pdf.js';
import { heicToPdf } from './heic-to-pdf.js';
import { tiffToPdf } from './tiff-to-pdf.js';
import { pdfToBmp } from './pdf-to-bmp.js';
import { pdfToTiff } from './pdf-to-tiff.js';
import { splitInHalf } from './split-in-half.js';
import { analyzeAndDisplayDimensions } from './page-dimensions.js';
import { nUpTool, setupNUpUI } from './n-up.js';
import { processAndSave } from './duplicate-organize.js';
import { combineToSinglePage } from './combine-single-page.js';
import { fixDimensions, setupFixDimensionsUI } from './fix-dimensions.js';
import { changeBackgroundColor } from './change-background-color.js';
import { changeTextColor, setupTextColorTool } from './change-text-color.js';
import { setupCompareTool } from './compare-pdfs.js';
import { setupOcrTool } from './ocr-pdf.js';
import { wordToPdf } from './word-to-pdf.js';
import { applyAndSaveSignatures, setupSignTool } from './sign-pdf.js';
import {
  removeAnnotations,
  setupRemoveAnnotationsTool,
} from './remove-annotations.js';
import { setupCropperTool } from './cropper.js';
import { processAndDownloadForm, setupFormFiller } from './form-filler.js';
import { posterize, setupPosterizeTool } from './posterize.js';
import {
  removeBlankPages,
  setupRemoveBlankPagesTool,
} from './remove-blank-pages.js';
import { alternateMerge, setupAlternateMergeTool } from './alternate-merge.js';

export const toolLogic = {
  merge: { process: merge, setup: setupMergeTool },
  split: { process: split, setup: setupSplitTool },
  encrypt,
  decrypt,
  organize,
  rotate,
  'add-page-numbers': addPageNumbers,
  'pdf-to-jpg': pdfToJpg,
  'jpg-to-pdf': jpgToPdf,
  'scan-to-pdf': scanToPdf,
  compress,
  'pdf-to-greyscale': pdfToGreyscale,
  'pdf-to-zip': pdfToZip,
  'edit-metadata': editMetadata,
  'remove-metadata': removeMetadata,
  flatten,
  'pdf-to-png': pdfToPng,
  'png-to-pdf': pngToPdf,
  'pdf-to-webp': pdfToWebp,
  'webp-to-pdf': webpToPdf,
  'delete-pages': deletePages,
  'add-blank-page': addBlankPage,
  'extract-pages': extractPages,
  'add-watermark': { process: addWatermark, setup: setupWatermarkUI },
  'add-header-footer': addHeaderFooter,
  'image-to-pdf': imageToPdf,
  'change-permissions': changePermissions,
  'pdf-to-markdown': pdfToMarkdown,
  'txt-to-pdf': txtToPdf,
  'invert-colors': invertColors,
  'reverse-pages': reversePages,
  // 'md-to-pdf': mdToPdf,
  'svg-to-pdf': svgToPdf,
  'bmp-to-pdf': bmpToPdf,
  'heic-to-pdf': heicToPdf,
  'tiff-to-pdf': tiffToPdf,
  'pdf-to-bmp': pdfToBmp,
  'pdf-to-tiff': pdfToTiff,
  'split-in-half': splitInHalf,
  'page-dimensions': analyzeAndDisplayDimensions,
  'n-up': { process: nUpTool, setup: setupNUpUI },
  'duplicate-organize': { process: processAndSave },
  'combine-single-page': combineToSinglePage,
  'fix-dimensions': { process: fixDimensions, setup: setupFixDimensionsUI },
  'change-background-color': changeBackgroundColor,
  'change-text-color': { process: changeTextColor, setup: setupTextColorTool },
  'compare-pdfs': { setup: setupCompareTool },
  'ocr-pdf': { setup: setupOcrTool },
  'word-to-pdf': wordToPdf,
  'sign-pdf': { process: applyAndSaveSignatures, setup: setupSignTool },
  'remove-annotations': {
    process: removeAnnotations,
    setup: setupRemoveAnnotationsTool,
  },
  cropper: { setup: setupCropperTool },
  'form-filler': { process: processAndDownloadForm, setup: setupFormFiller },
  posterize: { process: posterize, setup: setupPosterizeTool },
  'remove-blank-pages': {
    process: removeBlankPages,
    setup: setupRemoveBlankPagesTool,
  },
  'alternate-merge': {
    process: alternateMerge,
    setup: setupAlternateMergeTool,
  },
};
