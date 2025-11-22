import { hideLoader, showAlert, showLoader } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

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
  HEADER_SCALES: { 1: 1.7, 2: 1.5, 3: 1.3, 4: 1.0, 5: 0.9, 6: 0.85 },
  DEFAULT_COLORS: {
    BLACK: { r: 0, g: 0, b: 0 },
    LINK_BLUE: { r: 0, g: 102, b: 204 },
    LIGHT_GRAY: { r: 249, g: 249, b: 249 },
    GRAY_BORDER: { r: 128, g: 128, b: 128 },
    CODE_BG: { r: 230, g: 240, b: 255 },
    PLACEHOLDER_GRAY: { r: 128, g: 128, b: 128 },
  },
} as const;

type TextStyleDefaults = {
  fontSize: number;
  fontFamily: string;
};

let textStyleDefaults: TextStyleDefaults = {
  fontSize: 12,
  fontFamily: 'helvetica',
};

let quill: Quill;

// Utility functions
const rgbToHex = (rgb: string): string => {
  const [r, g, b] = rgb.split(',').map((n: string) => parseInt(n.trim()));
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
};

const parseColor = (colorStr?: string): { r: number; g: number; b: number } => {
  if (!colorStr || !colorStr.startsWith('#'))
    return PDF_CONSTANTS.DEFAULT_COLORS.BLACK;

  try {
    return {
      r: parseInt(colorStr.slice(1, 3), 16),
      g: parseInt(colorStr.slice(3, 5), 16),
      b: parseInt(colorStr.slice(5, 7), 16),
    };
  } catch {
    return PDF_CONSTANTS.DEFAULT_COLORS.BLACK;
  }
};

const generateFilename = (): string =>
  `document-${new Date().toISOString().slice(0, 10)}.pdf`;

const extractAndProcessHtmlContent = (): string => {
  let htmlContent = quill.root.innerHTML;

  // Process inline styles to ensure they work in PDF
  htmlContent = htmlContent.replace(/style="([^"]*)"/g, (match, styles) => {
    const processedStyles = styles
      // Convert RGB colors to hex (both color and background-color)
      .replace(
        /(background-)?color:\s*rgb\(([^)]+)\)/g,
        (colorMatch: string, bgPrefix: string, rgb: string) => {
          const hex = rgbToHex(rgb);
          return `${bgPrefix || ''}color: ${hex}`;
        }
      )
      // Convert em to points
      .replace(
        /font-size:\s*(\d+(?:\.\d+)?)em/g,
        (_, em: string) =>
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
    justify: 'justify',
  };

  Object.entries(alignmentMap).forEach(([cls, align]) => {
    const regex = new RegExp(
      `<p([^>]*)\\sclass="([^"]*ql-align-${cls}[^"]*)"([^>]*)>`,
      'g'
    );
    htmlContent = htmlContent.replace(
      regex,
      `<p$1 style="text-align: ${align};"$3>`
    );
  });

  return htmlContent;
};

const loadImageAsBase64 = (
  src: string
): Promise<{ data: string; width: number; height: number } | null> => {
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
          height: img.height,
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

const getAlignedX = (
  alignment: string,
  currentX: number,
  lineWidth: number,
  pageWidth: number,
  margin: number
): number => {
  switch (alignment) {
    case 'center':
      return pageWidth / 2 - lineWidth / 2;
    case 'right':
      return pageWidth - margin - lineWidth;
    default:
      return currentX;
  }
};

const renderTextDecorations = (
  pdf: any,
  segment: any,
  renderX: number,
  currentY: number,
  yOffset: number,
  lineWidth: number,
  adjustedFontSize: number
) => {
  const { r, g, b } = segment.textColor;
  pdf.setDrawColor(r, g, b);

  if (segment.underline) {
    const underlineY = currentY + yOffset + 1;
    pdf.setLineWidth(0.2);
    pdf.line(renderX, underlineY, renderX + lineWidth, underlineY);
  }

  if (segment.strike) {
    const strikeY = currentY + yOffset - adjustedFontSize * 0.1;
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
): number => {
  if (!formattedSegments.length && !fullText.trim()) {
    return startY + lineHeight;
  }

  let currentY = startY;
  const allLines = pdf.splitTextToSize(fullText, maxWidth);

  for (const line of allLines) {
    let currentLineX = getAlignedX(
      alignment,
      startX,
      pdf.getTextWidth(line),
      pageWidth,
      margin
    );

    let segmentIndex = 0;
    let consumedTextInSegment = 0;
    let remainingLineText = line;

    while (
      remainingLineText.length > 0 &&
      segmentIndex < formattedSegments.length
    ) {
      const segment = formattedSegments[segmentIndex];
      const remainingSegmentText = segment.text.substring(
        consumedTextInSegment
      );

      if (!remainingSegmentText) {
        segmentIndex++;
        consumedTextInSegment = 0;
        continue;
      }

      const charsToRender = Math.min(
        remainingSegmentText.length,
        remainingLineText.length
      );
      const textToRender = remainingSegmentText.substring(0, charsToRender);

      const { adjustedFontSize, yOffset } = calculateScriptFormatting(segment);
      pdf.setFont(segment.fontFamily, segment.fontStyle);
      pdf.setFontSize(adjustedFontSize);
      pdf.setTextColor(
        segment.textColor.r,
        segment.textColor.g,
        segment.textColor.b
      );

      if (segment.backgroundColor) {
        const segmentWidth = pdf.getTextWidth(textToRender);
        const textHeight = segment.fontSize * 0.352778;
        pdf.setFillColor(
          segment.backgroundColor.r,
          segment.backgroundColor.g,
          segment.backgroundColor.b
        );
        pdf.rect(
          currentLineX,
          currentY - textHeight,
          segmentWidth,
          textHeight * 1.2,
          'F'
        );
      }

      pdf.text(textToRender, currentLineX, currentY + yOffset);
      const renderedWidth = pdf.getTextWidth(textToRender);
      renderTextDecorations(
        pdf,
        segment,
        currentLineX,
        currentY,
        yOffset,
        renderedWidth,
        adjustedFontSize
      );

      currentLineX += renderedWidth;
      consumedTextInSegment += charsToRender;
      remainingLineText = remainingLineText.substring(charsToRender);

      if (consumedTextInSegment >= segment.text.length) {
        segmentIndex++;
        consumedTextInSegment = 0;
      }
    }
    currentY += lineHeight;
  }

  return currentY;
};
const getFontStyle = (attrs: any): string => {
  if (attrs.bold && attrs.italic) return 'bolditalic';
  if (attrs.bold) return 'bold';
  if (attrs.italic) return 'italic';
  return 'normal';
};

const getFontSize = (blockType: string, attrs: any): number => {
  let baseSize =
    blockType === 'code'
      ? textStyleDefaults.fontSize - 2
      : blockType === 'blockquote'
        ? textStyleDefaults.fontSize - 1
        : textStyleDefaults.fontSize;

  if (attrs.size === 'small') return Math.max(8, baseSize - 2);
  if (attrs.size === 'large') return baseSize + 4;
  if (attrs.size === 'huge') return baseSize + 8;

  return baseSize;
};

const getFontFamily = (blockType: string, attrs: any): string => {
  if (blockType === 'code' || attrs.font === 'monospace') return 'courier';
  if (attrs.font === 'serif') return 'times';
  return textStyleDefaults.fontFamily;
};

const renderImagePlaceholder = (
  pdf: any,
  message: string,
  currentY: number
): number => {
  pdf.setFont(textStyleDefaults.fontFamily, 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(
    PDF_CONSTANTS.DEFAULT_COLORS.PLACEHOLDER_GRAY.r,
    PDF_CONSTANTS.DEFAULT_COLORS.PLACEHOLDER_GRAY.g,
    PDF_CONSTANTS.DEFAULT_COLORS.PLACEHOLDER_GRAY.b
  );
  pdf.text(`[Image: ${message}]`, PDF_CONSTANTS.MARGIN, currentY);
  return (
    currentY +
    PDF_CONSTANTS.DEFAULT_LINE_HEIGHT +
    PDF_CONSTANTS.PARAGRAPH_SPACING
  );
};

const renderBlockQuote = async (
  pdf: any,
  formattedSegments: any[],
  lineText: string,
  currentY: number,
  maxWidth: number,
  pageWidth: number
): Promise<number> => {
  const boxStartX = PDF_CONSTANTS.MARGIN;
  const textPadding = 8;
  const verticalPadding = 5;
  const textStartX = boxStartX + textPadding;
  const availableTextWidth = maxWidth - textPadding * 2;
  const lineHeight = PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.9;

  pdf.setFont(textStyleDefaults.fontFamily, 'normal');
  pdf.setFontSize(textStyleDefaults.fontSize - 1);
  const textLines = pdf.splitTextToSize(lineText, availableTextWidth);
  const textHeight = textLines.length * lineHeight;
  const blockHeight = textHeight + verticalPadding * 2;

  // Corrected: Position the start of the text correctly by adding the first line's height.
  const textStartY = currentY + verticalPadding + lineHeight * 0.8;

  // Draw background rectangle
  pdf.setFillColor(
    PDF_CONSTANTS.DEFAULT_COLORS.LIGHT_GRAY.r,
    PDF_CONSTANTS.DEFAULT_COLORS.LIGHT_GRAY.g,
    PDF_CONSTANTS.DEFAULT_COLORS.LIGHT_GRAY.b
  );
  pdf.rect(boxStartX, currentY, maxWidth, blockHeight, 'F');

  // Draw left border line
  pdf.setDrawColor(
    PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.r,
    PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.g,
    PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.b
  );
  pdf.setLineWidth(2);
  pdf.line(boxStartX, currentY, boxStartX, currentY + blockHeight);

  // Render text inside the block
  await renderFormattedText(
    pdf,
    formattedSegments,
    lineText,
    textStartX,
    textStartY,
    availableTextWidth,
    'left',
    'blockquote',
    PDF_CONSTANTS.MARGIN,
    pageWidth,
    lineHeight
  );

  // Return position after the block
  return currentY + blockHeight + PDF_CONSTANTS.PARAGRAPH_SPACING;
};

const renderCodeBlock = async (
  pdf: any,
  formattedSegments: any[],
  lineText: string,
  currentY: number,
  maxWidth: number,
  pageWidth: number
): Promise<number> => {
  const boxStartX = PDF_CONSTANTS.MARGIN;
  const textPadding = 8;
  const verticalPadding = 5;
  const textStartX = boxStartX + textPadding;
  const availableTextWidth = maxWidth - textPadding * 2;
  const lineHeight = PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.9;

  pdf.setFont('courier', 'normal');
  pdf.setFontSize(textStyleDefaults.fontSize - 2);

  const textLines = pdf.splitTextToSize(lineText, availableTextWidth);
  const textHeight = textLines.length * lineHeight;
  const blockHeight = textHeight + verticalPadding * 2;

  const textStartY = currentY + verticalPadding + lineHeight * 0.8;

  pdf.setDrawColor(
    PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.r,
    PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.g,
    PDF_CONSTANTS.DEFAULT_COLORS.GRAY_BORDER.b
  );
  pdf.setLineWidth(0.5);
  pdf.rect(boxStartX, currentY, maxWidth, blockHeight, 'S');

  await renderFormattedText(
    pdf,
    formattedSegments,
    lineText,
    textStartX,
    textStartY,
    availableTextWidth,
    'left',
    'code',
    PDF_CONSTANTS.MARGIN,
    pageWidth,
    lineHeight
  );

  return currentY + blockHeight + PDF_CONSTANTS.PARAGRAPH_SPACING;
};
const processInlineImages = async (
  pdf: any,
  block: any,
  currentY: number,
  maxWidth: number,
  pageHeight: number
): Promise<number> => {
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

        pdf.addImage(
          imageData.data,
          'JPEG',
          PDF_CONSTANTS.MARGIN,
          currentY,
          imgWidth,
          imgHeight
        );
        currentY += imgHeight + 5;
      }
    } catch (error) {
      console.warn('Error processing inline image:', error);
    }
  }

  return currentY;
};

const generateAdvancedTextPdf = async (): Promise<void> => {
  try {
    const { jsPDF } = await import('jspdf');

    const DEFAULTS = {
      fontFamily: 'helvetica',
      fontSize: 12,
      pageSize: 'a4',
      pageOrientation: 'portrait',
    };

    const fontFamilyKey =
      (
        document.getElementById('font-family') as HTMLSelectElement
      )?.value?.toLowerCase() || DEFAULTS.fontFamily;
    const fontSize =
      parseInt(
        (document.getElementById('font-size') as HTMLInputElement)?.value
      ) || DEFAULTS.fontSize;
    const pageSizeKey =
      (
        document.getElementById('page-size') as HTMLSelectElement
      )?.value?.toLowerCase() || DEFAULTS.pageOrientation;
    const pageOrientationKey =
      (
        document.getElementById('page-orientation') as HTMLSelectElement
      )?.value?.toLowerCase() || DEFAULTS.pageSize;

    textStyleDefaults.fontFamily = fontFamilyKey || DEFAULTS.fontFamily;
    textStyleDefaults.fontSize = fontSize || DEFAULTS.fontSize;

    const orientation =
      pageOrientationKey === 'landscape' || pageOrientationKey === 'l'
        ? 'l'
        : 'p';
    const pdf = new jsPDF(orientation, 'mm', pageSizeKey.toLowerCase());
    pdf.setFont(fontFamilyKey.toLowerCase(), 'normal');
    pdf.setFontSize(fontSize);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - PDF_CONSTANTS.MARGIN * 2;

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

      const startX = PDF_CONSTANTS.MARGIN;
      const alignment = block.attributes?.align || 'left';

      // Process text segments with formatting for all relevant block types
      let lineText = '';
      const formattedSegments: any[] = [];

      for (const segment of block.segments) {
        const attrs = segment.attributes || {};

        if (segment.type === 'image') {
          if (!block.images) block.images = [];
          block.images.push({ src: segment.src, position: lineText.length });
          continue;
        } else if (segment.type === 'link') {
          lineText += `[LINK: ${segment.url}]`;
          continue;
        }

        const segmentText = segment.text || '';
        const fontStyle = getFontStyle(attrs);
        const segmentSize = getFontSize(block.type, attrs);
        const fontFamily = getFontFamily(block.type, attrs);
        let textColor = parseColor(attrs.color);

        if (attrs.link) {
          textColor = PDF_CONSTANTS.DEFAULT_COLORS.LINK_BLUE;
          if (!block.links) block.links = [];
          block.links.push({
            text: segmentText,
            url: attrs.link,
            startIndex: lineText.length,
            length: segmentText.length,
          });
        }

        let backgroundColor = null;
        if (
          attrs.background &&
          block.type !== 'code' &&
          block.type !== 'blockquote'
        ) {
          const bgColor = parseColor(attrs.background);
          if (bgColor !== PDF_CONSTANTS.DEFAULT_COLORS.BLACK) {
            backgroundColor = bgColor;
          }
        }

        formattedSegments.push({
          text: segmentText,
          fontFamily,
          fontStyle,
          fontSize: segmentSize,
          textColor,
          backgroundColor,
          underline: attrs.underline || false,
          strike: attrs.strike || attrs.strikethrough || false,
          script: attrs.script || null,
          startIndex: lineText.length,
          endIndex: lineText.length + segmentText.length,
        });

        lineText += segmentText;
      }

      // Render based on block type
      switch (block.type) {
        case 'header':
          const headerScale =
            PDF_CONSTANTS.HEADER_SCALES[
              block.level as keyof typeof PDF_CONSTANTS.HEADER_SCALES
            ] || 1.0;
          const fontSize = textStyleDefaults.fontSize * headerScale;
          pdf.setFont(textStyleDefaults.fontFamily, 'bold');
          pdf.setFontSize(fontSize);
          currentY += PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.7;
          pdf.text(lineText, startX, currentY);
          currentY +=
            PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.8 +
            PDF_CONSTANTS.PARAGRAPH_SPACING;
          break;

        case 'blockquote':
          currentY = await renderBlockQuote(
            pdf,
            formattedSegments,
            lineText,
            currentY,
            maxWidth,
            pageWidth
          );
          break;

        case 'code':
          currentY = await renderCodeBlock(
            pdf,
            formattedSegments,
            lineText,
            currentY,
            maxWidth,
            pageWidth
          );
          break;

        case 'paragraph':
          if (lineText.trim()) {
            currentY = renderFormattedText(
              pdf,
              formattedSegments,
              lineText,
              startX,
              currentY,
              maxWidth,
              alignment,
              block.type,
              PDF_CONSTANTS.MARGIN,
              pageWidth,
              PDF_CONSTANTS.DEFAULT_LINE_HEIGHT * 0.9
            );
          } else {
            // Handle empty lines by adding a standard line height.
            currentY += PDF_CONSTANTS.DEFAULT_LINE_HEIGHT;
          }
          // Add spacing after the paragraph and process any inline images.
          currentY += PDF_CONSTANTS.PARAGRAPH_SPACING;
          currentY = await processInlineImages(
            pdf,
            block,
            currentY,
            maxWidth,
            pageHeight
          );
          break;

        case 'list':
          pdf.setFont(textStyleDefaults.fontFamily, 'normal');
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);

          if (
            lastListType !==
            block.type + (block.ordered ? 'ordered' : 'unordered')
          ) {
            currentListNumber = 1;
            lastListType =
              block.type + (block.ordered ? 'ordered' : 'unordered');
          }

          const bullet = block.ordered ? `${currentListNumber++}. ` : '• ';
          const listLines = pdf.splitTextToSize(
            bullet + lineText,
            maxWidth - 15
          );
          pdf.text(listLines, PDF_CONSTANTS.MARGIN + 10, currentY);
          currentY +=
            listLines.length * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT + 1.5;
          break;

        case 'image':
          try {
            const imageSegment = block.segments.find(
              (seg: any) => seg.type === 'image'
            );
            if (imageSegment?.src) {
              const imageData = await loadImageAsBase64(imageSegment.src);
              if (imageData) {
                const maxImageWidth = maxWidth;
                const maxImageHeight = 100;
                let imgWidth = imageData.width * PDF_CONSTANTS.PIXELS_TO_MM;
                let imgHeight = imageData.height * PDF_CONSTANTS.PIXELS_TO_MM;

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
                if (currentY + imgHeight > pageHeight - PDF_CONSTANTS.MARGIN) {
                  pdf.addPage();
                  currentY = PDF_CONSTANTS.MARGIN;
                }
                pdf.addImage(
                  imageData.data,
                  'JPEG',
                  PDF_CONSTANTS.MARGIN,
                  currentY,
                  imgWidth,
                  imgHeight
                );
                currentY += imgHeight + PDF_CONSTANTS.PARAGRAPH_SPACING;
              } else {
                currentY = renderImagePlaceholder(
                  pdf,
                  `Unable to load - ${imageSegment.src}`,
                  currentY
                );
              }
            }
          } catch (error) {
            console.warn('Error handling image in PDF:', error);
            currentY = renderImagePlaceholder(pdf, 'Error loading', currentY);
          }
          break;

        default:
          if (block.type !== 'list') {
            currentListNumber = 1;
            lastListType = null;
          }
          break;
      }
    }

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

const parseQuillDelta = (delta: any): any[] => {
  if (!delta || !delta.ops) return [];

  const content: any[] = [];
  const getBlockType = (attributes: any) => {
    if (attributes.header) return 'header';
    if (attributes['code-block']) return 'code';
    if (attributes.blockquote) return 'blockquote';
    if (attributes.list) return 'list';
    return 'paragraph';
  };

  let lineOps: any[] = [];
  for (const op of delta.ops) {
    if (typeof op.insert !== 'string') {
      lineOps.push(op);
      continue;
    }

    const parts = op.insert.split('\n');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part) {
        lineOps.push({ insert: part, attributes: op.attributes });
      }

      if (i < parts.length - 1) {
        const blockOp =
          lineOps.find(
            (o) =>
              o.attributes &&
              (o.attributes.header ||
                o.attributes['code-block'] ||
                o.attributes.blockquote ||
                o.attributes.list)
          ) || op;
        const blockAttrs = blockOp.attributes || {};
        const blockType = getBlockType(blockAttrs);

        const currentBlock: any = {
          type: blockType,
          segments: [],
          attributes: blockAttrs,
        };
        determineLineType(blockAttrs, currentBlock);

        for (const lineOp of lineOps) {
          if (typeof lineOp.insert === 'string') {
            currentBlock.segments.push({
              text: lineOp.insert,
              attributes: lineOp.attributes || {},
            });
          } else if (lineOp.insert && lineOp.insert.image) {
            currentBlock.segments.push({
              type: 'image',
              src: lineOp.insert.image,
              attributes: lineOp.attributes || {},
            });
          }
        }
        content.push(currentBlock);
        lineOps = [];
      }
    }
  }

  if (lineOps.length > 0) {
    const blockOp =
      lineOps.find(
        (op) =>
          op.attributes &&
          (op.attributes.header ||
            op.attributes['code-block'] ||
            op.attributes.blockquote ||
            op.attributes.list)
      ) || {};
    const blockAttrs = blockOp.attributes || {};
    const blockType = getBlockType(blockAttrs);
    const currentBlock: any = {
      type: blockType,
      segments: [],
      attributes: blockAttrs,
    };
    determineLineType(blockAttrs, currentBlock);
    for (const op of lineOps) {
      if (typeof op.insert === 'string') {
        currentBlock.segments.push({
          text: op.insert,
          attributes: op.attributes || {},
        });
      } else if (op.insert && op.insert.image) {
        currentBlock.segments.push({
          type: 'image',
          src: op.insert.image,
          attributes: op.attributes || {},
        });
      }
    }
    if (currentBlock.segments.length > 0) {
      content.push(currentBlock);
    }
  }

  if (content.length < 2) return content;

  const mergedContent = [content[0]];
  for (let i = 1; i < content.length; i++) {
    const prev = mergedContent[mergedContent.length - 1];
    const curr = content[i];
    if (
      (curr.type === 'code' && prev.type === 'code') ||
      (curr.type === 'blockquote' && prev.type === 'blockquote')
    ) {
      prev.segments.push({ text: '\n', attributes: {} });
      prev.segments.push(...curr.segments);
    } else {
      mergedContent.push(curr);
    }
  }

  return mergedContent;
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
  ${Array.from({ length: 8 }, (_, i) => `.ql-indent-${i + 1} { padding-left: ${(i + 1) * 20}pt; }`).join('\n  ')}
  
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
    showAlert(
      'Error',
      'Could not open print window. Please check your popup blocker.'
    );
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
    await generateAdvancedTextPdf();
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
    
    <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label for="font-family" class="block mb-2 text-sm font-medium text-gray-300">Font Family</label>
        <select id="font-family" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
          <option value="helvetica" selected>Helvetica</option>
          <option value="times">Times New Roman</option>
          <option value="courier">Courier</option>
        </select>
      </div>
      <div>
        <label for="font-size" class="block mb-2 text-sm font-medium text-gray-300">Font Size</label>
        <input type="number" id="font-size" value="12" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
      </div>
      <div>
        <label for="page-size" class="block mb-2 text-sm font-medium text-gray-300">Page Size</label>
        <select id="page-size" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
          <option value="a3">A3</option>
          <option value="a4" selected>A4</option>
          <option value="a5">A5</option>
          <option value="letter">Letter</option>
          <option value="legal">Legal</option>
          <option value="tabloid">Tabloid</option>
          <option value="ledger">Ledger</option>
        </select>
      </div>
      <div>
        <label for="page-orientation" class="block mb-2 text-sm font-medium text-gray-300">Page Orientation</label>
        <select id="page-orientation" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
          <option value="portrait" selected>Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
    </div>

    <div class="mt-6 space-y-3">
     
      <div class="space-y-2">
        <button id="advanced-pdf" class="btn-gradient w-full">Advanced Text PDF</button>
        <p class="text-sm text-gray-600 ml-2">• Good formatting • Small file size • Proper structure</p>
      </div>
      
      <div class="space-y-2">
        <button id="print-to-pdf" class="btn-outline w-full">Browser Print to PDF</button>
        <p class="text-sm text-gray-600 ml-2">• Best formatting • Uses browser engine • Requires user interaction</p>
      </div>
    </div>
  `;

  quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
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
  document
    .getElementById('advanced-pdf')
    ?.addEventListener('click', generateAdvancedPdf);
  document
    .getElementById('print-to-pdf')
    ?.addEventListener('click', usePrintToPdf);
}
