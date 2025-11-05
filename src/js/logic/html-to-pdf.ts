import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { pdfExporter } from 'quill-to-pdf';

// Constants
const PDF_CONSTANTS = {
  PIXELS_TO_MM: 0.264583,
  EM_TO_POINTS: 12,
  DEFAULT_LINE_HEIGHT: 3.5,
  PARAGRAPH_SPACING: 2.5,
  MARGIN: 20,
  SUPERSCRIPT_SCALE: 0.7,
  SUPERSCRIPT_OFFSET: 0.4,
  SUBSCRIPT_SCALE: 0.7,
  SUBSCRIPT_OFFSET: 0.25,
  HEADER_SIZES: { 1: 20, 2: 18, 3: 16, 4: 14, 5: 12, 6: 11 },
  DEFAULT_COLORS: {
    BLACK: { r: 0, g: 0, b: 0 },
    LINK_BLUE: { r: 0, g: 102, b: 204 },
    LIGHT_GRAY: { r: 249, g: 249, b: 249 },
    GRAY_BORDER: { r: 221, g: 221, b: 221 },
    CODE_BG: { r: 245, g: 245, b: 245 },
    PLACEHOLDER_GRAY: { r: 128, g: 128, b: 128 }
  }
} as const;

let quill: Quill;

// Utility functions
const rgbToHex = (rgb: string): string => {
  const [r, g, b] = rgb.split(',').map((n: string) => parseInt(n.trim()));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

const parseColor = (colorStr?: string): { r: number; g: number; b: number } => {
  if (!colorStr || !colorStr.startsWith('#')) return PDF_CONSTANTS.DEFAULT_COLORS.BLACK;

  try {
    return {
      r: parseInt(colorStr.slice(1, 3), 16),
      g: parseInt(colorStr.slice(3, 5), 16),
      b: parseInt(colorStr.slice(5, 7), 16)
    };
  } catch {
    return PDF_CONSTANTS.DEFAULT_COLORS.BLACK;
  }
};

const generateFilename = (): string =>
  `document-${new Date().toISOString().slice(0, 10)}.pdf`;

const generateTextPDF = async (): Promise<void> => {
  try {
    const delta = quill.getContents();
    const pdfBlob: Blob = await pdfExporter.generatePdf(delta);
    downloadFile(pdfBlob, generateFilename());
  } catch (error) {
    console.error('Text PDF generation failed:', error);
    showAlert('Error', 'Failed to generate text-based PDF. Try the Browser Print or Image PDF options.');
  }
};

const extractAndProcessHtmlContent = (): string => {
  let htmlContent = quill.root.innerHTML;

  // Process inline styles to ensure they work in PDF
  htmlContent = htmlContent.replace(/style="([^"]*)"/g, (match, styles) => {
    const processedStyles = styles
      // Convert RGB colors to hex (both color and background-color)
      .replace(/(background-)?color:\s*rgb\(([^)]+)\)/g, (colorMatch: string, bgPrefix: string, rgb: string) => {
        const hex = rgbToHex(rgb);
        return `${bgPrefix || ''}color: ${hex}`;
      })
      // Convert em to points
      .replace(/font-size:\s*(\d+(?:\.\d+)?)em/g, (_, em: string) =>
        `font-size: ${Math.round(parseFloat(em) * PDF_CONSTANTS.EM_TO_POINTS)}pt`
      )
      .replace(/\s+/g, ' ')
      .trim();

    return `style="${processedStyles}"`;
  });

  // Convert class-based alignment to inline styles
  const alignmentMap = {
    center: 'center',
    right: 'right',
    justify: 'justify'
  };

  Object.entries(alignmentMap).forEach(([cls, align]) => {
    const regex = new RegExp(`<p([^>]*)\\sclass="([^"]*ql-align-${cls}[^"]*)"([^>]*)>`, 'g');
    htmlContent = htmlContent.replace(regex, `<p$1 style="text-align: ${align};"$3>`);
  });

  return htmlContent;
};

const loadImageAsBase64 = (src: string): Promise<{ data: string; width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleError = (error?: any) => {
      console.warn('Error loading/converting image:', src, error);
      resolve(null);
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return handleError('No canvas context');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        resolve({
          data: canvas.toDataURL('image/jpeg', 0.8),
          width: img.width,
          height: img.height
        });
      } catch (error) {
        handleError(error);
      }
    };

    img.onerror = () => handleError();
    img.src = src;
  });
};



const calculateScriptFormatting = (segment: any) => {
  let adjustedFontSize = segment.fontSize;
  let yOffset = 0;

  if (segment.script === 'super') {
    adjustedFontSize = segment.fontSize * PDF_CONSTANTS.SUPERSCRIPT_SCALE;
    yOffset = -(segment.fontSize * PDF_CONSTANTS.SUPERSCRIPT_OFFSET);
  } else if (segment.script === 'sub') {
    adjustedFontSize = segment.fontSize * PDF_CONSTANTS.SUBSCRIPT_SCALE;
    yOffset = segment.fontSize * PDF_CONSTANTS.SUBSCRIPT_OFFSET;
  }

  return { adjustedFontSize, yOffset };
};

const getAlignedX = (alignment: string, currentX: number, lineWidth: number, pageWidth: number, margin: number): number => {
  switch (alignment) {
    case 'center': return pageWidth / 2 - lineWidth / 2;
    case 'right': return pageWidth - margin - lineWidth;
    default: return currentX;
  }
};

const renderTextDecorations = (pdf: any, segment: any, renderX: number, currentY: number, yOffset: number, lineWidth: number, adjustedFontSize: number) => {
  const { r, g, b } = segment.textColor;
  pdf.setDrawColor(r, g, b);

  if (segment.underline) {
    const underlineY = currentY + yOffset + 1;
    pdf.setLineWidth(0.2);
    pdf.line(renderX, underlineY, renderX + lineWidth, underlineY);
  }

  if (segment.strike) {
    const strikeY = currentY + yOffset - (adjustedFontSize * 0.1);
    pdf.setLineWidth(0.3);
    pdf.line(renderX, strikeY, renderX + lineWidth, strikeY);
  }
};

const renderFormattedText = (
  pdf: any,
  formattedSegments: any[],
  fullText: string,
  startX: number,
  startY: number,
  maxWidth: number,
  alignment: string,
  blockType: string,
  margin: number,
  pageWidth: number,
  lineHeight: number = PDF_CONSTANTS.DEFAULT_LINE_HEIGHT
) => {
  if (!formattedSegments.length) return;

  let currentX = startX;
  let currentY = startY;

  for (const segment of formattedSegments) {
    const { adjustedFontSize, yOffset } = calculateScriptFormatting(segment);

    pdf.setFont(segment.fontFamily, segment.fontStyle);
    pdf.setFontSize(adjustedFontSize);
    pdf.setTextColor(segment.textColor.r, segment.textColor.g, segment.textColor.b);

    // Handle background color (completely skip for code blocks and blockquotes since they have unified backgrounds)
    if (segment.backgroundColor && blockType !== 'code' && blockType !== 'blockquote') {
      const textWidth = pdf.getTextWidth(segment.text);
      const textHeight = segment.fontSize * 0.352778;
      pdf.setFillColor(segment.backgroundColor.r, segment.backgroundColor.g, segment.backgroundColor.b);
      pdf.rect(currentX, currentY - textHeight, textWidth, textHeight * 1.2, 'F');
    }

    const textLines = pdf.splitTextToSize(segment.text, maxWidth);

    textLines.forEach((line: string, i: number) => {
      const lineWidth = pdf.getTextWidth(line);
      const renderX = getAlignedX(alignment, currentX, lineWidth, pageWidth, margin);

      pdf.text(line, renderX, currentY + yOffset);
      renderTextDecorations(pdf, segment, renderX, currentY, yOffset, lineWidth, adjustedFontSize);

      if (i < textLines.length - 1) {
        currentY += lineHeight;
      }
    });

    // Position for next segment
    if (textLines.length === 1) {
      currentX += pdf.getTextWidth(segment.text);
    } else {
      currentX = startX;
      currentY += lineHeight;
    }
  }
};

const getFontStyle = (attrs: any): string => {
  if (attrs.bold && attrs.italic) return 'bolditalic';
  if (attrs.bold) return 'bold';
  if (attrs.italic) return 'italic';
  return 'normal';
};

const getFontSize = (blockType: string, attrs: any): number => {
  let baseSize = blockType === 'code' ? 10 : blockType === 'blockquote' ? 11 : 12;

  if (attrs.size === 'small') return Math.max(8, baseSize - 2);
  if (attrs.size === 'large') return baseSize + 4;
  if (attrs.size === 'huge') return baseSize + 8;

  return baseSize;
};

const getFontFamily = (blockType: string, attrs: any): string => {
  if (blockType === 'code' || attrs.font === 'monospace') return 'courier';
  if (attrs.font === 'serif') return 'times';
  return 'helvetica';
};

const renderImagePlaceholder = (pdf: any, message: string, currentY: number): number => {
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(PDF_CONSTANTS.DEFAULT_COLORS.PLACEHOLDER_GRAY.r, PDF_CONSTANTS.DEFAULT_COLORS.PLACEHOLDER_GRAY.g, PDF_CONSTANTS.DEFAULT_COLORS.PLACEHOLDER_GRAY.b);
  pdf.text(`[Image: ${message}]`, PDF_CONSTANTS.MARGIN, currentY);
  return currentY + PDF_CONSTANTS.DEFAULT_LINE_HEIGHT + PDF_CONSTANTS.PARAGRAPH_SPACING;
};

const renderBlockQuote = async (pdf: any, formattedSegments: any[], lineText: string, currentY: number, maxWidth: number, pageWidth: number): Promise<number> => {
  const boxStartX = PDF_CONSTANTS.MARGIN;
  const textPadding = 8; // Horizontal padding
  const verticalPadding = 5;
  const textStartX = boxStartX + textPadding;
  const availableTextWidth = maxWidth - (textPadding * 2);

  const textLines = pdf.splitTextToSize(lineText, availableTextWidth);
  const textHeight = textLines.length * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT;
  const blockHeight = textHeight + (verticalPadding * 2); // Top + bottom padding
  const boxWidth = maxWidth;

  // Text should start with proper top padding from the box top
  // Improved baseline calculation for better vertical centering
  const textStartY = currentY + verticalPadding + (PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.9); // Better baseline offset

  // Draw background rectangle
  pdf.setFillColor(PDF_CONSTANTS.DEFAULT_COLORS.LIGHT_GRAY.r, PDF_CONSTANTS.DEFAULT_COLORS.LIGHT_GRAY.g, PDF_CONSTANTS.DEFAULT_COLORS.LIGHT_GRAY.b);
  pdf.rect(boxStartX, currentY, boxWidth, blockHeight, 'F');

  // Draw left border line
  pdf.setDrawColor(PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.r, PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.g, PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.b);
  pdf.setLineWidth(2);
  pdf.line(boxStartX, currentY, boxStartX, currentY + blockHeight);

  // Render text with proper vertical positioning inside the box and tighter line spacing
  await renderFormattedText(pdf, formattedSegments, lineText, textStartX, textStartY, availableTextWidth, 'left', 'blockquote', PDF_CONSTANTS.MARGIN, pageWidth, PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.9);

  // Return position after the block
  return currentY + blockHeight + PDF_CONSTANTS.PARAGRAPH_SPACING;
};

const renderCodeBlock = async (pdf: any, formattedSegments: any[], lineText: string, currentY: number, maxWidth: number, pageWidth: number): Promise<number> => {
  // Consistent positioning with blockquote
  const boxStartX = PDF_CONSTANTS.MARGIN;
  const textPadding = 8; // Horizontal padding
  const verticalPadding = 5;
  const textStartX = boxStartX + textPadding;
  const availableTextWidth = maxWidth - (textPadding * 2);

  const textLines = pdf.splitTextToSize(lineText, availableTextWidth);
  const textHeight = textLines.length * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT;
  const blockHeight = textHeight + (verticalPadding * 2); // Top + bottom padding
  const boxWidth = maxWidth;

  // Text should start with proper top padding from the box top
  // Improved baseline calculation for better vertical centering
  const textStartY = currentY + verticalPadding + (PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.9); // Better baseline offset

  // Draw background rectangle
  pdf.setFillColor(PDF_CONSTANTS.DEFAULT_COLORS.CODE_BG.r, PDF_CONSTANTS.DEFAULT_COLORS.CODE_BG.g, PDF_CONSTANTS.DEFAULT_COLORS.CODE_BG.b);
  pdf.rect(boxStartX, currentY, boxWidth, blockHeight, 'F');

  // Draw border around the entire box
  pdf.setDrawColor(PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.r, PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.g, PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.b);
  pdf.setLineWidth(0.5);
  pdf.rect(boxStartX, currentY, boxWidth, blockHeight, 'S');

  // Render text with proper vertical positioning inside the box and tighter line spacing
  await renderFormattedText(pdf, formattedSegments, lineText, textStartX, textStartY, availableTextWidth, 'left', 'code', PDF_CONSTANTS.MARGIN, pageWidth, PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.9);

  // Return position after the block
  return currentY + blockHeight + PDF_CONSTANTS.PARAGRAPH_SPACING;
};

const processInlineImages = async (pdf: any, block: any, currentY: number, maxWidth: number, pageHeight: number): Promise<number> => {
  if (!block.images?.length) return currentY;

  for (const image of block.images) {
    try {
      const imageData = await loadImageAsBase64(image.src);
      if (imageData) {
        currentY += 5; // Small spacing

        const maxInlineImageWidth = maxWidth / 2;
        const maxInlineImageHeight = 50;

        let imgWidth = imageData.width * PDF_CONSTANTS.PIXELS_TO_MM;
        let imgHeight = imageData.height * PDF_CONSTANTS.PIXELS_TO_MM;

        // Scale to fit constraints
        if (imgWidth > maxInlineImageWidth) {
          const ratio = maxInlineImageWidth / imgWidth;
          imgWidth = maxInlineImageWidth;
          imgHeight *= ratio;
        }

        if (imgHeight > maxInlineImageHeight) {
          const ratio = maxInlineImageHeight / imgHeight;
          imgHeight = maxInlineImageHeight;
          imgWidth *= ratio;
        }

        // Check for page break
        if (currentY + imgHeight > pageHeight - PDF_CONSTANTS.MARGIN) {
          pdf.addPage();
          currentY = PDF_CONSTANTS.MARGIN;
        }

        pdf.addImage(imageData.data, 'JPEG', PDF_CONSTANTS.MARGIN, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5;
      }
    } catch (error) {
      console.warn('Error processing inline image:', error);
    }
  }

  return currentY;
};

const renderRegularParagraph = async (pdf: any, formattedSegments: any[], lineText: string, currentY: number, maxWidth: number, alignment: string, pageWidth: number, pageHeight: number, block: any): Promise<number> => {
  // Note: Text rendering for paragraphs is now handled in the main flow to prevent doubling
  // This function only handles post-text processing like images and positioning

  // Process inline images
  currentY = await processInlineImages(pdf, block, currentY, maxWidth, pageHeight);

  // Calculate spacing - handle empty paragraphs differently
  if (!lineText.trim()) {
    // Empty paragraph - no additional spacing since it was already added in main flow
    return currentY + PDF_CONSTANTS.PARAGRAPH_SPACING;
  } else {
    // Non-empty paragraph - add text height and spacing
    const textLines = pdf.splitTextToSize(lineText, maxWidth);
    return currentY + textLines.length * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT + PDF_CONSTANTS.PARAGRAPH_SPACING;
  }
};

const renderBlockType = async (pdf: any, blockType: string, formattedSegments: any[], lineText: string, currentY: number, maxWidth: number, alignment: string, pageWidth: number, pageHeight: number, block: any): Promise<number> => {
  switch (blockType) {
    case 'blockquote':
      return await renderBlockQuote(pdf, formattedSegments, lineText, currentY, maxWidth, pageWidth);
    case 'code':
      return await renderCodeBlock(pdf, formattedSegments, lineText, currentY, maxWidth, pageWidth);
    default:
      return await renderRegularParagraph(pdf, formattedSegments, lineText, currentY, maxWidth, alignment, pageWidth, pageHeight, block);
  }
};

const generateAdvancedTextPdf = async (): Promise<void> => {
  try {
    const { jsPDF } = await import('jspdf');

    // Create PDF with proper text rendering
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - (PDF_CONSTANTS.MARGIN * 2);

    let currentY: number = PDF_CONSTANTS.MARGIN;

    // Get Quill delta and convert to structured content
    const delta = quill.getContents();
    const content = parseQuillDelta(delta);

    // Track list numbers
    let currentListNumber = 1;
    let lastListType = null;

    // Process each content block
    for (const block of content) {
      // Check if we need a new page
      if (currentY > pageHeight - PDF_CONSTANTS.MARGIN - 20) {
        pdf.addPage();
        currentY = PDF_CONSTANTS.MARGIN;
      }

      let startX = PDF_CONSTANTS.MARGIN;
      let alignment = block.attributes?.align || 'left';

      switch (block.type) {
        case 'header':
          const fontSize = PDF_CONSTANTS.HEADER_SIZES[block.level as keyof typeof PDF_CONSTANTS.HEADER_SIZES] || 12;
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(fontSize);
          currentY += PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.7; // Reduced header top spacing

          const headerText = block.segments.map((seg: any) => seg.text).join('');
          pdf.text(headerText, startX, currentY);
          currentY += PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.8 + PDF_CONSTANTS.PARAGRAPH_SPACING; // Reduced header bottom spacing
          break;

        case 'paragraph':
        case 'blockquote':
        case 'code':
          currentY += 1; // Reduced top spacing

          // Process text segments with formatting
          let lineText = '';
          let currentX: number = startX;

          // Store formatted text segments for proper rendering
          const formattedSegments: any[] = [];

          for (const segment of block.segments) {
            const attrs = segment.attributes || {};

            if (segment.type === 'image') {
              // Handle images - try to load and embed, fallback to placeholder
              try {
                // Store image info for processing after text
                if (!block.images) block.images = [];
                block.images.push({
                  src: segment.src,
                  position: lineText.length
                });
              } catch (error) {
                lineText += '[IMAGE: Error loading]';
              }
              continue;
            } else if (segment.type === 'link') {
              // Handle links
              lineText += `[LINK: ${segment.url}]`;
              continue;
            }

            // Handle regular text segments with proper formatting
            const segmentText = segment.text || '';

            const fontStyle = getFontStyle(attrs);
            const segmentSize = getFontSize(block.type, attrs);
            const fontFamily = getFontFamily(block.type, attrs);

            // Parse colors
            let textColor = parseColor(attrs.color);

            // Handle link formatting (override color with blue)
            if (attrs.link) {
              textColor = PDF_CONSTANTS.DEFAULT_COLORS.LINK_BLUE;

              // Store link info for later processing
              if (!block.links) block.links = [];
              block.links.push({
                text: segmentText,
                url: attrs.link,
                startIndex: lineText.length,
                length: segmentText.length
              });
            }

            // Parse background color (skip for code blocks since they have unified backgrounds)
            let backgroundColor = null;
            if (attrs.background && block.type !== 'code') {
              const bgColor = parseColor(attrs.background);
              if (bgColor !== PDF_CONSTANTS.DEFAULT_COLORS.BLACK) {
                backgroundColor = bgColor;
              }
            }

            // Store formatted segment for rendering
            formattedSegments.push({
              text: segmentText,
              fontFamily,
              fontStyle,
              fontSize: segmentSize,
              textColor,
              backgroundColor,
              underline: attrs.underline || false,
              strike: attrs.strike || attrs.strikethrough || false,
              script: attrs.script || null, // Add script attribute for super/sub
              startIndex: lineText.length,
              endIndex: lineText.length + segmentText.length
            });

            lineText += segmentText;
          }

          // Handle different block types with visual indicators
          // Note: blockquote and code blocks handle their own text rendering, paragraphs need separate rendering
          if (block.type === 'paragraph') {
            if (formattedSegments.length > 0 && lineText.trim()) {
              // Render formatted text segments for non-empty paragraphs with tighter line spacing
              await renderFormattedText(pdf, formattedSegments, lineText, currentX, currentY, maxWidth, alignment, block.type, PDF_CONSTANTS.MARGIN, pageWidth, PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.9);
            } else if (!lineText.trim()) {
              // Handle empty paragraph - add minimal spacing to preserve the empty line
              currentY += PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.8;
            }
          }

          currentY = await renderBlockType(pdf, block.type, formattedSegments, lineText, currentY, maxWidth, alignment, pageWidth, pageHeight, block);
          break;

        case 'list':
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);

          // Reset list counter if list type changed
          if (lastListType !== block.type + (block.ordered ? 'ordered' : 'unordered')) {
            currentListNumber = 1;
            lastListType = block.type + (block.ordered ? 'ordered' : 'unordered');
          }

          const listText = block.segments.map((seg: any) => seg.text || (seg.type === 'image' ? '[IMAGE]' : seg.type === 'link' ? `[${seg.url}]` : '')).join('');
          let bullet;
          if (block.ordered) {
            bullet = `${currentListNumber}. `;
            currentListNumber++;
          } else {
            bullet = '• ';
          }

          const listLines = pdf.splitTextToSize(bullet + listText, maxWidth - 15);
          pdf.text(listLines, PDF_CONSTANTS.MARGIN + 10, currentY);
          currentY += listLines.length * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT + 1.5; // Reduced from +3 to +1.5
          break;

        case 'image':
          // Handle standalone images
          try {
            const imageSegment = block.segments.find((seg: any) => seg.type === 'image');
            if (imageSegment && imageSegment.src) {
              // Try to load and embed the actual image
              const imageData = await loadImageAsBase64(imageSegment.src);

              if (imageData) {
                // Calculate image dimensions to fit within page margins
                const maxImageWidth = maxWidth;
                const maxImageHeight = 100; // Max height in mm

                let imgWidth = imageData.width * PDF_CONSTANTS.PIXELS_TO_MM;
                let imgHeight = imageData.height * PDF_CONSTANTS.PIXELS_TO_MM;

                // Scale down if too large
                if (imgWidth > maxImageWidth) {
                  const ratio = maxImageWidth / imgWidth;
                  imgWidth = maxImageWidth;
                  imgHeight *= ratio;
                }

                if (imgHeight > maxImageHeight) {
                  const ratio = maxImageHeight / imgHeight;
                  imgHeight = maxImageHeight;
                  imgWidth *= ratio;
                }

                // Check if image fits on current page
                if (currentY + imgHeight > pageHeight - PDF_CONSTANTS.MARGIN) {
                  pdf.addPage();
                  currentY = PDF_CONSTANTS.MARGIN;
                }

                // Add the image to PDF
                pdf.addImage(imageData.data, 'JPEG', PDF_CONSTANTS.MARGIN, currentY, imgWidth, imgHeight);
                currentY += imgHeight + PDF_CONSTANTS.PARAGRAPH_SPACING;
              } else {
                currentY = renderImagePlaceholder(pdf, `Unable to load - ${imageSegment.src}`, currentY);
              }
            }
          } catch (error) {
            console.warn('Error handling image in PDF:', error);
            currentY = renderImagePlaceholder(pdf, 'Error loading', currentY);
          }
          break;

      default:
        // Reset list counter for non-list items
        if (block.type !== 'list') {
          currentListNumber = 1;
          lastListType = null;
        }
        break;
      }
    }

    // Download the PDF
    const pdfBlob = pdf.output('blob');
    downloadFile(pdfBlob, generateFilename());

  } catch (error) {
    console.error('Advanced text PDF generation failed:', error);
    throw error;
  }
};

const determineLineType = (attrs: any, currentLine: any): void => {
  if (attrs.header) {
    currentLine.type = 'header';
    currentLine.level = attrs.header;
  } else if (attrs.blockquote) {
    currentLine.type = 'blockquote';
  } else if (attrs['code-block']) {
    currentLine.type = 'code';
  } else if (attrs.list) {
    currentLine.type = 'list';
    currentLine.ordered = attrs.list === 'ordered';
  }
  currentLine.attributes = attrs;
};

const processTextInsert = (text: string, attrs: any, currentLine: any, content: any[]): any => {
  if (!text.includes('\n')) {
    currentLine.segments.push({ text, attributes: attrs });
    return currentLine;
  }

  // Special handling for code blocks - keep all lines together in a single block
  if (attrs['code-block']) {
    // For code blocks, add the entire text as one segment with newlines preserved
    currentLine.segments.push({ text, attributes: attrs });
    return currentLine;
  }

  const parts = text.split('\n');

  // Add first part to current line (even if empty)
  currentLine.segments.push({ text: parts[0] || '', attributes: attrs });

  // Process complete lines (all but the last part)
  for (let i = 0; i < parts.length - 1; i++) {
    // Always push the current line (even if it's empty - this preserves empty lines)
    determineLineType(attrs, currentLine);
    content.push(currentLine);

    // Start new line for next iteration
    currentLine = { type: 'paragraph', segments: [], attributes: {} };

    // Add the next part (even if it's empty - this creates empty paragraphs)
    if (i < parts.length - 2) {
      const nextPart = parts[i + 1];
      currentLine.segments.push({ text: nextPart || '', attributes: attrs });
    }
  }

  // Handle last part (even if empty)
  const lastPart = parts[parts.length - 1];
  currentLine.segments.push({ text: lastPart || '', attributes: attrs });

  return currentLine;
};

const processObjectInsert = (insertObj: any, attrs: any, currentLine: any): void => {
  if (insertObj.image) {
    currentLine.segments.push({
      type: 'image',
      src: insertObj.image,
      attributes: attrs
    });
  } else if (insertObj.link) {
    currentLine.segments.push({
      type: 'link',
      url: insertObj.link,
      attributes: attrs
    });
  } else {
    currentLine.segments.push({
      text: '[Embed]',
      attributes: attrs
    });
  }
};

const parseQuillDelta = (delta: any): any[] => {
  const content: any[] = [];
  if (!delta.ops) return content;

  let currentLine: any = { type: 'paragraph', segments: [], attributes: {} };

  for (const op of delta.ops) {
    if (typeof op.insert === 'string') {
      currentLine = processTextInsert(op.insert, op.attributes || {}, currentLine, content);
    } else if (typeof op.insert === 'object') {
      processObjectInsert(op.insert, op.attributes || {}, currentLine);
    }
  }

  // Add final line (including empty lines to preserve all line breaks)
  if (currentLine.segments.length > 0 || content.length > 0) {
    content.push(currentLine);
  }

  return content;
};

const generatePrintCSS = (): string => `
  @page { margin: 20mm; size: A4; }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    font-size: 12pt; line-height: 1.6; color: #333; margin: 0; padding: 0; background: white;
  }
  
  /* Headers */
  h1, h2, h3, h4, h5, h6 { font-weight: bold; line-height: 1.3; }
  h1 { font-size: 24pt; margin: 16pt 0 12pt 0; }
  h2 { font-size: 20pt; margin: 14pt 0 10pt 0; }
  h3 { font-size: 18pt; margin: 12pt 0 8pt 0; }
  h4 { font-size: 16pt; margin: 10pt 0 6pt 0; }
  h5 { font-size: 14pt; margin: 8pt 0 6pt 0; }
  h6 { font-size: 13pt; margin: 8pt 0 6pt 0; }
  
  /* Text formatting */
  strong, b { font-weight: bold !important; }
  em, i { font-style: italic !important; }
  u { text-decoration: underline !important; }
  s { text-decoration: line-through !important; }
  sup { vertical-align: super; font-size: 0.75em; }
  sub { vertical-align: sub; font-size: 0.75em; }
  
  /* Quill-specific sizes */
  .ql-size-small { font-size: 10pt !important; }
  .ql-size-large { font-size: 18pt !important; }
  .ql-size-huge { font-size: 32pt !important; }
  
  /* Alignment */
  .ql-align-center { text-align: center; }
  .ql-align-right { text-align: right; }
  .ql-align-justify { text-align: justify; }
  
  /* Indentation - generate dynamically */
  ${Array.from({length: 8}, (_, i) => `.ql-indent-${i + 1} { padding-left: ${(i + 1) * 20}pt; }`).join('\n  ')}
  
  /* Lists, blocks, and elements */
  ul, ol { margin: 8pt 0; padding-left: 20pt; }
  li { margin: 4pt 0; }
  p { margin: 6pt 0; }
  a { color: #0066cc; text-decoration: underline; }
  img { max-width: 100%; height: auto; margin: 8pt 0; }
  
  blockquote {
    margin: 12pt 20pt; padding: 8pt 16pt; border-left: 4pt solid #ddd;
    background: #f9f9f9; font-style: italic;
  }
  
  pre, .ql-code-block {
    background: #f5f5f5; border: 1pt solid #ddd; border-radius: 4pt;
    padding: 12pt; font-family: 'Courier New', Courier, monospace;
    font-size: 10pt; margin: 8pt 0;
  }
  
  @media print { body { -webkit-print-color-adjust: exact; } }
`;

const usePrintToPdf = (): void => {
  const printWin = window.open('', '_blank');
  if (!printWin) {
    showAlert('Error', 'Could not open print window. Please check your popup blocker.');
    return;
  }

  const processedHtml = extractAndProcessHtmlContent();

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Document</title>
        <meta charset="utf-8">
        <style>${generatePrintCSS()}</style>
      </head>
      <body>${processedHtml}</body>
    </html>
  `);

  printWin.document.close();
  printWin.focus();
  printWin.print();
};

const generateAdvancedPdf = async (): Promise<void> => {
  showLoader('Generating Advanced Text PDF...');
  try {
    await generateAdvancedTextPdf();
  } catch (error) {
    console.error('Advanced text PDF generation failed:', error);
    showAlert('Error', 'Failed to generate advanced text PDF.');
  } finally {
    hideLoader();
  }
};

export async function htmlToPdf() {
  showLoader('Creating PDF...');
  try {
    await generateTextPDF();
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to create PDF from text.');
  } finally {
    hideLoader();
  }
}



export function mountHtmlToPdfTool() {
  const container = document.querySelector('#html-to-pdf-container');
  if (!container) return;

  container.innerHTML = `
    <div class="p-6 flex flex-col h-full">
      <div id="editor" class="bg-white border-2 border-gray-300 rounded-lg overflow-hidden" style="height: 500px; max-height: 60vh; display: flex; flex-direction: column;"></div>
    </div>

    <div class="mt-6 space-y-3">
      <div class="space-y-2">
        <button id="text-pdf" class="btn-gradient w-full">Basic Text PDF (quill-to-pdf)</button>
        <p class="text-sm text-gray-600 ml-2">• Fastest • Limited formatting • Selectable text • Smallest file size</p>
      </div>
      
      <div class="space-y-2">
        <button id="advanced-pdf" class="btn-gradient w-full">Advanced Text PDF (Recommended)</button>
        <p class="text-sm text-gray-600 ml-2">• Good formatting • Selectable text • Small file size • Proper structure</p>
      </div>
      
      <div class="space-y-2">
        <button id="print-to-pdf" class="btn-outline w-full">Browser Print to PDF</button>
        <p class="text-sm text-gray-600 ml-2">• Best formatting • Selectable text • Uses browser engine • Requires user interaction</p>
      </div>
    </div>
  `;

  quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ]
    },
    placeholder: 'Start typing your document…',
  });

  // Fix Quill toolbar styling issues - use timeout to ensure DOM is ready
  setTimeout(() => {
    const editorContainer = document.querySelector('#editor');
    const toolbar = document.querySelector('.ql-toolbar');
    const container = document.querySelector('.ql-container');
    const editor = document.querySelector('.ql-editor');

    // Make the parent editor container establish a new stacking context
    if (editorContainer) {
      (editorContainer as HTMLElement).style.cssText = `
        height: 500px !important;
        max-height: 60vh !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        border: 2px solid #d1d5db !important;
        border-radius: 8px !important;
        background: white !important;
        position: relative !important;
      `;
    }

    if (toolbar) {
      (toolbar as HTMLElement).style.cssText = `
        background: #fafafa !important;
        border: none !important;
        border-bottom: 1px solid #ccc !important;
        border-radius: 8px 8px 0 0 !important;
        padding: 8px !important;
        position: sticky !important;
        top: 0 !important;
        z-index: 100 !important;
        flex-shrink: 0 !important;
        order: 1 !important;
      `;
    }

    if (container) {
      (container as HTMLElement).style.cssText = `
        background: white !important;
        border: none !important;
        border-radius: 0 0 8px 8px !important;
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        order: 2 !important;
      `;
    }

    if (editor) {
      (editor as HTMLElement).style.cssText = `
        background: white !important;
        color: #333 !important;
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 12px 15px !important;
        border: none !important;
        outline: none !important;
      `;
    }

    // Fix Quill tooltips and overlays positioning
    const style = document.createElement('style');
    style.textContent = `
      .ql-tooltip {
        position: fixed !important;
        z-index: 2000 !important;
        background: white !important;
        border: 1px solid #ccc !important;
        border-radius: 4px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        max-width: 320px !important;
        padding: 8px !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
      
      .ql-tooltip.ql-editing {
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
      
      .ql-tooltip input[type=text] {
        width: 220px !important;
        padding: 8px 10px !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        font-size: 14px !important;
        margin-bottom: 8px !important;
      }
      
      .ql-tooltip .ql-action,
      .ql-tooltip .ql-remove {
        margin: 0 2px !important;
        padding: 6px 12px !important;
        border: none !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        text-decoration: none !important;
      }
      
      .ql-tooltip .ql-action {
        background: #007bff !important;
        color: white !important;
      }
      
      .ql-tooltip .ql-action:hover {
        background: #0056b3 !important;
      }
      
      .ql-tooltip .ql-remove {
        background: #6c757d !important;
        color: white !important;
      }
      
      .ql-tooltip .ql-remove:hover {
        background: #545b62 !important;
      }
      
      /* Ensure tooltips are always visible and don't get cut off by overflow */
      #editor {
        overflow: visible !important;
      }
      
      .ql-container {
        overflow: visible !important;
      }
      
      .ql-editor {
        overflow-y: auto !important;
        overflow-x: visible !important;
      }
      
      /* Fix for link preview */
      .ql-tooltip[data-mode="link"]::before {
        content: "Visit URL:" !important;
        font-size: 12px !important;
        color: #666 !important;
        margin-bottom: 4px !important;
        display: block !important;
      }
    `;
    document.head.appendChild(style);
  }, 100);

  // ---- Button handlers ----
  document.getElementById('text-pdf')?.addEventListener('click', htmlToPdf);
  document.getElementById('advanced-pdf')?.addEventListener('click', generateAdvancedPdf);
  document.getElementById('print-to-pdf')?.addEventListener('click', usePrintToPdf);
}
