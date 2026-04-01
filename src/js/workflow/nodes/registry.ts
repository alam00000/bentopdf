import type { BaseWorkflowNode } from './base-node';
import type { NodeCategory } from '../types';
import { PDFInputNode } from './pdf-input-node';
import { ImageInputNode } from './image-input-node';
import { DownloadNode } from './download-node';
import { PdfToImagesNode } from './pdf-to-images-node';
import { MergeNode } from './merge-node';
import { SplitNode } from './split-node';
import { ExtractPagesNode } from './extract-pages-node';
import { RotateNode } from './rotate-node';
import { DeletePagesNode } from './delete-pages-node';
import { ReversePagesNode } from './reverse-pages-node';
import { AddBlankPageNode } from './add-blank-page-node';
import { DividePagesNode } from './divide-pages-node';
import { NUpNode } from './n-up-node';
import { FixPageSizeNode } from './fix-page-size-node';
import { CombineSinglePageNode } from './combine-single-page-node';
import { CropNode } from './crop-node';
import { GreyscaleNode } from './greyscale-node';
import { InvertColorsNode } from './invert-colors-node';
import { ScannerEffectNode } from './scanner-effect-node';
import { AdjustColorsNode } from './adjust-colors-node';
import { BackgroundColorNode } from './background-color-node';
import { WatermarkNode } from './watermark-node';
import { PageNumbersNode } from './page-numbers-node';
import { HeaderFooterNode } from './header-footer-node';
import { CompressNode } from './compress-node';
import { RasterizeNode } from './rasterize-node';
import { OCRNode } from './ocr-node';
import { RemoveBlankPagesNode } from './remove-blank-pages-node';
import { RemoveAnnotationsNode } from './remove-annotations-node';
import { FlattenNode } from './flatten-node';
import { EditMetadataNode } from './edit-metadata-node';
import { SanitizeNode } from './sanitize-node';
import { EncryptNode } from './encrypt-node';
import { DecryptNode } from './decrypt-node';
import { DigitalSignNode } from './digital-sign-node';
import { TimestampNode } from './timestamp-node';
import { RedactNode } from './redact-node';
import { RepairNode } from './repair-node';
import { PdfToTextNode } from './pdf-to-text-node';
import { PdfToDocxNode } from './pdf-to-docx-node';
import { PdfToXlsxNode } from './pdf-to-xlsx-node';
import { PdfToCsvNode } from './pdf-to-csv-node';
import { PdfToSvgNode } from './pdf-to-svg-node';
import { PdfToMarkdownNode } from './pdf-to-markdown-node';
import { ExtractImagesNode } from './extract-images-node';
import { WordToPdfNode } from './word-to-pdf-node';
import { ExcelToPdfNode } from './excel-to-pdf-node';
import { PowerPointToPdfNode } from './powerpoint-to-pdf-node';
import { TextToPdfNode } from './text-to-pdf-node';
import { SvgToPdfNode } from './svg-to-pdf-node';
import { EpubToPdfNode } from './epub-to-pdf-node';
import { LinearizeNode } from './linearize-node';
import { DeskewNode } from './deskew-node';
import { PdfToPdfANode } from './pdf-to-pdfa-node';
import { PosterizeNode } from './posterize-node';
import { BookletNode } from './booklet-node';
import { OverlayNode } from './overlay-node';
import { FontToOutlineNode } from './font-to-outline-node';
import { TableOfContentsNode } from './table-of-contents-node';
import { EmailToPdfNode } from './email-to-pdf-node';
import { XpsToPdfNode } from './xps-to-pdf-node';
import { MobiToPdfNode } from './mobi-to-pdf-node';
import { Fb2ToPdfNode } from './fb2-to-pdf-node';
import { CbzToPdfNode } from './cbz-to-pdf-node';
import { MarkdownToPdfNode } from './markdown-to-pdf-node';
import { JsonToPdfNode } from './json-to-pdf-node';
import { XmlToPdfNode } from './xml-to-pdf-node';
import { WpdToPdfNode } from './wpd-to-pdf-node';
import { WpsToPdfNode } from './wps-to-pdf-node';
import { PagesToPdfNode } from './pages-to-pdf-node';
import { OdgToPdfNode } from './odg-to-pdf-node';
import { PubToPdfNode } from './pub-to-pdf-node';
import { VsdToPdfNode } from './vsd-to-pdf-node';

export interface NodeRegistryEntry {
  label: string;
  category: NodeCategory;
  icon: string;
  description: string;
  factory: () => BaseWorkflowNode;
  hidden?: boolean;
  toolPageId?: string;
}

export const nodeRegistry: Record<string, NodeRegistryEntry> = {
  PDFInputNode: {
    label: 'PDF Input',
    category: 'Input',
    icon: 'ph-file-pdf',
    description: 'Upload one or more PDF files',
    factory: () => new PDFInputNode(),
  },
  ImageInputNode: {
    label: 'Image Input',
    category: 'Input',
    icon: 'ph-image',
    description: 'Upload images and convert to PDF',
    factory: () => new ImageInputNode(),
    toolPageId: 'image-to-pdf',
  },
  WordToPdfNode: {
    label: 'Word to PDF',
    category: 'Input',
    icon: 'ph-microsoft-word-logo',
    description: 'Convert Word documents to PDF',
    factory: () => new WordToPdfNode(),
    toolPageId: 'word-to-pdf',
  },
  ExcelToPdfNode: {
    label: 'Excel to PDF',
    category: 'Input',
    icon: 'ph-microsoft-excel-logo',
    description: 'Convert Excel spreadsheets to PDF',
    factory: () => new ExcelToPdfNode(),
    toolPageId: 'excel-to-pdf',
  },
  PowerPointToPdfNode: {
    label: 'PowerPoint to PDF',
    category: 'Input',
    icon: 'ph-microsoft-powerpoint-logo',
    description: 'Convert PowerPoint presentations to PDF',
    factory: () => new PowerPointToPdfNode(),
    toolPageId: 'powerpoint-to-pdf',
  },
  TextToPdfNode: {
    label: 'Text to PDF',
    category: 'Input',
    icon: 'ph-text-t',
    description: 'Convert plain text to PDF',
    factory: () => new TextToPdfNode(),
    toolPageId: 'txt-to-pdf',
  },
  SvgToPdfNode: {
    label: 'SVG to PDF',
    category: 'Input',
    icon: 'ph-file-svg',
    description: 'Convert SVG files to PDF',
    factory: () => new SvgToPdfNode(),
    toolPageId: 'svg-to-pdf',
  },
  EpubToPdfNode: {
    label: 'EPUB to PDF',
    category: 'Input',
    icon: 'ph-book-open-text',
    description: 'Convert EPUB ebooks to PDF',
    factory: () => new EpubToPdfNode(),
    toolPageId: 'epub-to-pdf',
  },
  EmailToPdfNode: {
    label: 'Email to PDF',
    category: 'Input',
    icon: 'ph-envelope',
    description: 'Convert email files (.eml, .msg) to PDF',
    factory: () => new EmailToPdfNode(),
    toolPageId: 'email-to-pdf',
  },
  XpsToPdfNode: {
    label: 'XPS to PDF',
    category: 'Input',
    icon: 'ph-scan',
    description: 'Convert XPS/OXPS documents to PDF',
    factory: () => new XpsToPdfNode(),
    toolPageId: 'xps-to-pdf',
  },
  MobiToPdfNode: {
    label: 'MOBI to PDF',
    category: 'Input',
    icon: 'ph-book-open-text',
    description: 'Convert MOBI e-books to PDF',
    factory: () => new MobiToPdfNode(),
    toolPageId: 'mobi-to-pdf',
  },
  Fb2ToPdfNode: {
    label: 'FB2 to PDF',
    category: 'Input',
    icon: 'ph-book-bookmark',
    description: 'Convert FB2 e-books to PDF',
    factory: () => new Fb2ToPdfNode(),
    toolPageId: 'fb2-to-pdf',
  },
  CbzToPdfNode: {
    label: 'CBZ to PDF',
    category: 'Input',
    icon: 'ph-book-open',
    description: 'Convert comic book archives (CBZ/CBR) to PDF',
    factory: () => new CbzToPdfNode(),
    toolPageId: 'cbz-to-pdf',
  },
  MarkdownToPdfNode: {
    label: 'Markdown to PDF',
    category: 'Input',
    icon: 'ph-markdown-logo',
    description: 'Convert Markdown files to PDF',
    factory: () => new MarkdownToPdfNode(),
    toolPageId: 'markdown-to-pdf',
  },
  JsonToPdfNode: {
    label: 'JSON to PDF',
    category: 'Input',
    icon: 'ph-file-code',
    description: 'Convert JSON files to PDF',
    factory: () => new JsonToPdfNode(),
    toolPageId: 'json-to-pdf',
  },
  XmlToPdfNode: {
    label: 'XML to PDF',
    category: 'Input',
    icon: 'ph-file-code',
    description: 'Convert XML documents to PDF',
    factory: () => new XmlToPdfNode(),
    toolPageId: 'xml-to-pdf',
  },
  WpdToPdfNode: {
    label: 'WPD to PDF',
    category: 'Input',
    icon: 'ph-file-text',
    description: 'Convert WordPerfect documents to PDF',
    factory: () => new WpdToPdfNode(),
    toolPageId: 'wpd-to-pdf',
  },
  WpsToPdfNode: {
    label: 'WPS to PDF',
    category: 'Input',
    icon: 'ph-file-text',
    description: 'Convert WPS Office documents to PDF',
    factory: () => new WpsToPdfNode(),
    toolPageId: 'wps-to-pdf',
  },
  PagesToPdfNode: {
    label: 'Pages to PDF',
    category: 'Input',
    icon: 'ph-file-text',
    description: 'Convert Apple Pages documents to PDF',
    factory: () => new PagesToPdfNode(),
    toolPageId: 'pages-to-pdf',
  },
  OdgToPdfNode: {
    label: 'ODG to PDF',
    category: 'Input',
    icon: 'ph-image',
    description: 'Convert OpenDocument Graphics to PDF',
    factory: () => new OdgToPdfNode(),
    toolPageId: 'odg-to-pdf',
  },
  PubToPdfNode: {
    label: 'PUB to PDF',
    category: 'Input',
    icon: 'ph-book-open',
    description: 'Convert Microsoft Publisher to PDF',
    factory: () => new PubToPdfNode(),
    toolPageId: 'pub-to-pdf',
  },
  VsdToPdfNode: {
    label: 'VSD to PDF',
    category: 'Input',
    icon: 'ph-git-branch',
    description: 'Convert Visio diagrams (VSD/VSDX) to PDF',
    factory: () => new VsdToPdfNode(),
    toolPageId: 'vsd-to-pdf',
  },
  MergeNode: {
    label: 'Merge PDFs',
    category: 'Organize & Manage',
    icon: 'ph-browsers',
    description: 'Combine multiple PDFs into one',
    factory: () => new MergeNode(),
    toolPageId: 'merge-pdf',
  },
  SplitNode: {
    label: 'Split PDF',
    category: 'Organize & Manage',
    icon: 'ph-scissors',
    description: 'Extract a range of pages',
    factory: () => new SplitNode(),
    toolPageId: 'split-pdf',
  },
  ExtractPagesNode: {
    label: 'Extract Pages',
    category: 'Organize & Manage',
    icon: 'ph-squares-four',
    description: 'Extract pages as separate PDFs',
    factory: () => new ExtractPagesNode(),
    toolPageId: 'extract-pages',
  },
  RotateNode: {
    label: 'Rotate',
    category: 'Organize & Manage',
    icon: 'ph-arrow-clockwise',
    description: 'Rotate all pages',
    factory: () => new RotateNode(),
    toolPageId: 'rotate-pdf',
  },
  DeletePagesNode: {
    label: 'Delete Pages',
    category: 'Organize & Manage',
    icon: 'ph-trash',
    description: 'Remove specific pages',
    factory: () => new DeletePagesNode(),
    toolPageId: 'delete-pages',
  },
  ReversePagesNode: {
    label: 'Reverse Pages',
    category: 'Organize & Manage',
    icon: 'ph-sort-descending',
    description: 'Reverse page order',
    factory: () => new ReversePagesNode(),
    toolPageId: 'reverse-pages',
  },
  AddBlankPageNode: {
    label: 'Add Blank Page',
    category: 'Organize & Manage',
    icon: 'ph-file-plus',
    description: 'Insert blank pages',
    factory: () => new AddBlankPageNode(),
    toolPageId: 'add-blank-page',
  },
  DividePagesNode: {
    label: 'Divide Pages',
    category: 'Organize & Manage',
    icon: 'ph-columns',
    description: 'Split pages vertically or horizontally',
    factory: () => new DividePagesNode(),
    toolPageId: 'divide-pages',
  },
  NUpNode: {
    label: 'N-Up',
    category: 'Organize & Manage',
    icon: 'ph-squares-four',
    description: 'Arrange multiple pages per sheet',
    factory: () => new NUpNode(),
    toolPageId: 'n-up-pdf',
  },
  FixPageSizeNode: {
    label: 'Fix Page Size',
    category: 'Organize & Manage',
    icon: 'ph-frame-corners',
    description: 'Standardize all pages to a target size',
    factory: () => new FixPageSizeNode(),
    toolPageId: 'fix-page-size',
  },
  CombineSinglePageNode: {
    label: 'Combine to Single Page',
    category: 'Organize & Manage',
    icon: 'ph-arrows-out-line-vertical',
    description: 'Stitch all pages into one continuous page',
    factory: () => new CombineSinglePageNode(),
    toolPageId: 'combine-single-page',
  },
  BookletNode: {
    label: 'Booklet',
    category: 'Organize & Manage',
    icon: 'ph-book-open',
    description: 'Arrange pages for booklet printing',
    factory: () => new BookletNode(),
    toolPageId: 'pdf-booklet',
  },
  OverlayNode: {
    label: 'Overlay',
    category: 'Organize & Manage',
    icon: 'ph-stack-simple',
    description: 'Overlay or underlay pages from one PDF onto another',
    factory: () => new OverlayNode(),
    toolPageId: 'overlay-pdf',
  },
  PosterizeNode: {
    label: 'Posterize',
    category: 'Organize & Manage',
    icon: 'ph-notepad',
    description: 'Split pages into tile grid for poster printing',
    factory: () => new PosterizeNode(),
    toolPageId: 'posterize-pdf',
  },
  EditMetadataNode: {
    label: 'Edit Metadata',
    category: 'Organize & Manage',
    icon: 'ph-file-code',
    description: 'Edit PDF metadata',
    factory: () => new EditMetadataNode(),
    toolPageId: 'edit-metadata',
  },
  TableOfContentsNode: {
    label: 'Table of Contents',
    category: 'Organize & Manage',
    icon: 'ph-list',
    description: 'Generate table of contents from bookmarks',
    factory: () => new TableOfContentsNode(),
    toolPageId: 'table-of-contents',
  },
  OCRNode: {
    label: 'OCR',
    category: 'Organize & Manage',
    icon: 'ph-barcode',
    description: 'Add searchable text layer via OCR',
    factory: () => new OCRNode(),
    toolPageId: 'ocr-pdf',
  },
  CropNode: {
    label: 'Crop',
    category: 'Edit & Annotate',
    icon: 'ph-crop',
    description: 'Trim margins from all pages',
    factory: () => new CropNode(),
    toolPageId: 'crop-pdf',
  },
  GreyscaleNode: {
    label: 'Greyscale',
    category: 'Edit & Annotate',
    icon: 'ph-palette',
    description: 'Convert to greyscale',
    factory: () => new GreyscaleNode(),
    toolPageId: 'pdf-to-greyscale',
  },
  InvertColorsNode: {
    label: 'Invert Colors',
    category: 'Edit & Annotate',
    icon: 'ph-circle-half',
    description: 'Invert all colors',
    factory: () => new InvertColorsNode(),
    toolPageId: 'invert-colors',
  },
  ScannerEffectNode: {
    label: 'Scanner Effect',
    category: 'Edit & Annotate',
    icon: 'ph-scan',
    description: 'Apply scanner simulation effect',
    factory: () => new ScannerEffectNode(),
    toolPageId: 'scanner-effect',
  },
  AdjustColorsNode: {
    label: 'Adjust Colors',
    category: 'Edit & Annotate',
    icon: 'ph-sliders-horizontal',
    description: 'Adjust brightness, contrast, and colors',
    factory: () => new AdjustColorsNode(),
    toolPageId: 'adjust-colors',
  },
  BackgroundColorNode: {
    label: 'Background Color',
    category: 'Edit & Annotate',
    icon: 'ph-palette',
    description: 'Change background color',
    factory: () => new BackgroundColorNode(),
    toolPageId: 'background-color',
  },
  WatermarkNode: {
    label: 'Watermark',
    category: 'Edit & Annotate',
    icon: 'ph-drop',
    description: 'Add text watermark',
    factory: () => new WatermarkNode(),
    toolPageId: 'add-watermark',
  },
  PageNumbersNode: {
    label: 'Page Numbers',
    category: 'Edit & Annotate',
    icon: 'ph-list-numbers',
    description: 'Add page numbers',
    factory: () => new PageNumbersNode(),
    toolPageId: 'page-numbers',
  },
  HeaderFooterNode: {
    label: 'Header & Footer',
    category: 'Edit & Annotate',
    icon: 'ph-paragraph',
    description: 'Add header and footer text',
    factory: () => new HeaderFooterNode(),
    toolPageId: 'header-footer',
  },
  RemoveBlankPagesNode: {
    label: 'Remove Blank Pages',
    category: 'Edit & Annotate',
    icon: 'ph-file-minus',
    description: 'Remove blank pages automatically',
    factory: () => new RemoveBlankPagesNode(),
    toolPageId: 'remove-blank-pages',
  },
  RemoveAnnotationsNode: {
    label: 'Remove Annotations',
    category: 'Edit & Annotate',
    icon: 'ph-eraser',
    description: 'Strip all annotations',
    factory: () => new RemoveAnnotationsNode(),
    toolPageId: 'remove-annotations',
  },
  CompressNode: {
    label: 'Compress',
    category: 'Optimize & Repair',
    icon: 'ph-lightning',
    description: 'Reduce PDF file size',
    factory: () => new CompressNode(),
    toolPageId: 'compress-pdf',
  },
  RasterizeNode: {
    label: 'Rasterize',
    category: 'Optimize & Repair',
    icon: 'ph-image',
    description: 'Convert to image-based PDF',
    factory: () => new RasterizeNode(),
    toolPageId: 'rasterize-pdf',
  },
  LinearizeNode: {
    label: 'Linearize',
    category: 'Optimize & Repair',
    icon: 'ph-gauge',
    description: 'Optimize PDF for fast web viewing',
    factory: () => new LinearizeNode(),
    toolPageId: 'linearize-pdf',
  },
  DeskewNode: {
    label: 'Deskew',
    category: 'Optimize & Repair',
    icon: 'ph-perspective',
    description: 'Straighten skewed PDF pages',
    factory: () => new DeskewNode(),
    toolPageId: 'deskew-pdf',
  },
  PdfToPdfANode: {
    label: 'PDF to PDF/A',
    category: 'Optimize & Repair',
    icon: 'ph-archive',
    description: 'Convert PDF to PDF/A for archiving',
    factory: () => new PdfToPdfANode(),
    toolPageId: 'pdf-to-pdfa',
  },
  FontToOutlineNode: {
    label: 'Font to Outline',
    category: 'Optimize & Repair',
    icon: 'ph-text-outdent',
    description: 'Convert fonts to vector outlines',
    factory: () => new FontToOutlineNode(),
    toolPageId: 'font-to-outline',
  },
  RepairNode: {
    label: 'Repair',
    category: 'Optimize & Repair',
    icon: 'ph-wrench',
    description: 'Repair corrupted PDF',
    factory: () => new RepairNode(),
    toolPageId: 'repair-pdf',
  },
  EncryptNode: {
    label: 'Encrypt',
    category: 'Secure PDF',
    icon: 'ph-lock',
    description: 'Encrypt PDF with password',
    factory: () => new EncryptNode(),
    toolPageId: 'encrypt-pdf',
  },
  DecryptNode: {
    label: 'Decrypt',
    category: 'Secure PDF',
    icon: 'ph-lock-open',
    description: 'Remove PDF password protection',
    factory: () => new DecryptNode(),
    toolPageId: 'decrypt-pdf',
  },
  SanitizeNode: {
    label: 'Sanitize',
    category: 'Secure PDF',
    icon: 'ph-broom',
    description: 'Remove metadata, scripts, and hidden data',
    factory: () => new SanitizeNode(),
    toolPageId: 'sanitize-pdf',
  },
  FlattenNode: {
    label: 'Flatten',
    category: 'Secure PDF',
    icon: 'ph-stack',
    description: 'Flatten forms and annotations',
    factory: () => new FlattenNode(),
    toolPageId: 'flatten-pdf',
  },
  DigitalSignNode: {
    label: 'Digital Sign',
    category: 'Secure PDF',
    icon: 'ph-certificate',
    description: 'Apply a digital signature to PDF',
    factory: () => new DigitalSignNode(),
    toolPageId: 'digital-sign-pdf',
  },
  TimestampNode: {
    label: 'Timestamp',
    category: 'Secure PDF',
    icon: 'ph-clock',
    description: 'Add an RFC 3161 document timestamp',
    factory: () => new TimestampNode(),
    toolPageId: 'timestamp-pdf',
  },
  RedactNode: {
    label: 'Redact',
    category: 'Secure PDF',
    icon: 'ph-eye-slash',
    description: 'Redact text from PDF',
    factory: () => new RedactNode(),
    toolPageId: 'edit-pdf',
  },
  DownloadNode: {
    label: 'Download',
    category: 'Output',
    icon: 'ph-download-simple',
    description: 'Download as PDF or ZIP automatically',
    factory: () => new DownloadNode(),
  },
  // Backward compat for saved workflows
  DownloadPDFNode: {
    label: 'Download',
    category: 'Output',
    icon: 'ph-download-simple',
    description: 'Download as PDF or ZIP automatically',
    factory: () => new DownloadNode(),
    hidden: true,
  },
  DownloadZipNode: {
    label: 'Download',
    category: 'Output',
    icon: 'ph-download-simple',
    description: 'Download as PDF or ZIP automatically',
    factory: () => new DownloadNode(),
    hidden: true,
  },
  PdfToImagesNode: {
    label: 'PDF to Images',
    category: 'Output',
    icon: 'ph-file-image',
    description: 'Convert PDF pages to images (ZIP)',
    factory: () => new PdfToImagesNode(),
    toolPageId: 'pdf-to-jpg',
  },
  PdfToTextNode: {
    label: 'PDF to Text',
    category: 'Output',
    icon: 'ph-text-aa',
    description: 'Extract text from PDF',
    factory: () => new PdfToTextNode(),
    toolPageId: 'pdf-to-text',
  },
  PdfToDocxNode: {
    label: 'PDF to DOCX',
    category: 'Output',
    icon: 'ph-microsoft-word-logo',
    description: 'Convert PDF to Word document',
    factory: () => new PdfToDocxNode(),
    toolPageId: 'pdf-to-docx',
  },
  PdfToXlsxNode: {
    label: 'PDF to XLSX',
    category: 'Output',
    icon: 'ph-microsoft-excel-logo',
    description: 'Convert PDF tables to Excel',
    factory: () => new PdfToXlsxNode(),
    toolPageId: 'pdf-to-excel',
  },
  PdfToCsvNode: {
    label: 'PDF to CSV',
    category: 'Output',
    icon: 'ph-file-csv',
    description: 'Convert PDF tables to CSV',
    factory: () => new PdfToCsvNode(),
    toolPageId: 'pdf-to-csv',
  },
  PdfToSvgNode: {
    label: 'PDF to SVG',
    category: 'Output',
    icon: 'ph-file-code',
    description: 'Convert PDF pages to SVG',
    factory: () => new PdfToSvgNode(),
    toolPageId: 'pdf-to-svg',
  },
  PdfToMarkdownNode: {
    label: 'PDF to Markdown',
    category: 'Output',
    icon: 'ph-markdown-logo',
    description: 'Convert PDF to Markdown text',
    factory: () => new PdfToMarkdownNode(),
    toolPageId: 'pdf-to-markdown',
  },
  ExtractImagesNode: {
    label: 'Extract Images',
    category: 'Output',
    icon: 'ph-download-simple',
    description: 'Extract all images from PDF',
    factory: () => new ExtractImagesNode(),
    toolPageId: 'extract-images',
  },
};

export function createNodeByType(type: string): BaseWorkflowNode | null {
  const entry = nodeRegistry[type];
  if (!entry) return null;
  const node = entry.factory();
  node.nodeType = type;
  return node;
}

export function getNodesByCategory(): Record<
  NodeCategory,
  NodeRegistryEntry[]
> {
  const result: Record<NodeCategory, NodeRegistryEntry[]> = {
    Input: [],
    'Edit & Annotate': [],
    'Organize & Manage': [],
    'Optimize & Repair': [],
    'Secure PDF': [],
    Output: [],
  };

  for (const entry of Object.values(nodeRegistry)) {
    if (entry.hidden) continue;
    result[entry.category].push(entry);
  }

  return result;
}
