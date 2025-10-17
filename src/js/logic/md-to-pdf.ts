// // note: this is a work in progress
// import { showLoader, hideLoader, showAlert } from '../ui.js';
// import { downloadFile } from '../utils/helpers.js';
// import html2canvas from 'html2canvas';

// export async function mdToPdf() {
//   // @ts-expect-error TS(2339) FIXME: Property 'jspdf' does not exist on type 'Window & ... Remove this comment to see the full error message
//   if (
//     typeof window.jspdf === 'undefined' ||
//     typeof window.html2canvas === 'undefined'
//   ) {
//     showAlert(
//       'Libraries Not Ready',
//       'PDF generation libraries are loading. Please try again.'
//     );
//     return;
//   }
//   // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
//   const markdownContent = document.getElementById('md-input').value.trim();
//   if (!markdownContent) {
//     showAlert('Input Required', 'Please enter some Markdown text.');
//     return;
//   }
//   showLoader('Generating High-Quality PDF...');

//   try {
//     // @ts-expect-error TS(2304) FIXME: Cannot find name 'marked'.
//     const htmlContent = marked.parse(markdownContent);
//     // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
//     const pageFormat = document.getElementById('page-format').value;
//     // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
//     const orientation = document.getElementById('orientation').value;
//     // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
//     const marginSize = document.getElementById('margin-size').value;

//     const tempContainer = document.createElement('div');
//     tempContainer.style.cssText =
//       'position: absolute; top: -9999px; left: -9999px; width: 800px; padding: 40px; background: white; color: black;';
//     const styleSheet = document.createElement('style');
//     styleSheet.textContent = `
//             body { font-family: Helvetica, Arial, sans-serif; line-height: 1.6; font-size: 12px; }
//             h1, h2, h3 { margin: 20px 0 10px 0; font-weight: 600; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
//             h1 { font-size: 2em; } h2 { font-size: 1.5em; }
//             p, blockquote, ul, ol, pre, table { margin: 0 0 16px 0; }
//             blockquote { padding: 0 1em; color: #6a737d; border-left: .25em solid #dfe2e5; }
//             pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 6px; }
//             code { font-family: 'Courier New', monospace; background-color: rgba(27,31,35,.05); border-radius: 3px; padding: .2em .4em; }
//             table { width: 100%; border-collapse: collapse; } th, td { padding: 6px 13px; border: 1px solid #dfe2e5; }
//             img { max-width: 100%; }
//         `;
//     tempContainer.appendChild(styleSheet);
//     tempContainer.innerHTML += htmlContent;
//     document.body.appendChild(tempContainer);

//     const canvas = await html2canvas(tempContainer, {
//       scale: 2,
//       useCORS: true,
//     });
//     document.body.removeChild(tempContainer);

//     // @ts-expect-error TS(2339) FIXME: Property 'jspdf' does not exist on type 'Window & ... Remove this comment to see the full error message
//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF({ orientation, unit: 'mm', format: pageFormat });
//     const pageFormats = { a4: [210, 297], letter: [216, 279] };
//     const format = pageFormats[pageFormat];
//     const [pageWidth, pageHeight] =
//       orientation === 'landscape' ? [format[1], format[0]] : format;
//     const margins = { narrow: 10, normal: 20, wide: 30 };
//     const margin = margins[marginSize];
//     const contentWidth = pageWidth - margin * 2;
//     const contentHeight = pageHeight - margin * 2;
//     const imgData = canvas.toDataURL('image/png');
//     const imgHeight = (canvas.height * contentWidth) / canvas.width;

//     let heightLeft = imgHeight;
//     let position = margin;
//     pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
//     heightLeft -= contentHeight;

//     while (heightLeft > 0) {
//       position = position - pageHeight;
//       pdf.addPage();
//       pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
//       heightLeft -= contentHeight;
//     }

//     const pdfBlob = pdf.output('blob');
//     downloadFile(pdfBlob, 'markdown-document.pdf');
//   } catch (error) {
//     console.error('MD to PDF conversion error:', error);
//     showAlert('Conversion Error', 'Failed to generate PDF.');
//   } finally {
//     hideLoader();
//   }
// }
