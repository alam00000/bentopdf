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
  },
  WordToPdfNode: {
    label: 'Word to PDF',
    category: 'Input',
    icon: 'ph-microsoft-word-logo',
    description: 'Convert Word documents to PDF',
    factory: () => new WordToPdfNode(),
  },
  ExcelToPdfNode: {
    label: 'Excel to PDF',
    category: 'Input',
    icon: 'ph-microsoft-excel-logo',
    description: 'Convert Excel spreadsheets to PDF',
    factory: () => new ExcelToPdfNode(),
  },
  PowerPointToPdfNode: {
    label: 'PowerPoint to PDF',
    category: 'Input',
    icon: 'ph-microsoft-powerpoint-logo',
    description: 'Convert PowerPoint presentations to PDF',
    factory: () => new PowerPointToPdfNode(),
  },
  TextToPdfNode: {
    label: 'Text to PDF',
    category: 'Input',
    icon: 'ph-text-t',
    description: 'Convert plain text to PDF',
    factory: () => new TextToPdfNode(),
  },
  SvgToPdfNode: {
    label: 'SVG to PDF',
    category: 'Input',
    icon: 'ph-file-svg',
    description: 'Convert SVG files to PDF',
    factory: () => new SvgToPdfNode(),
  },
  EpubToPdfNode: {
    label: 'EPUB to PDF',
    category: 'Input',
    icon: 'ph-book-open-text',
    description: 'Convert EPUB ebooks to PDF',
    factory: () => new EpubToPdfNode(),
  },
  EmailToPdfNode: {
    label: 'Email to PDF',
    category: 'Input',
    icon: 'ph-envelope',
    description: 'Convert email files (.eml, .msg) to PDF',
    factory: () => new EmailToPdfNode(),
  },
  XpsToPdfNode: {
    label: 'XPS to PDF',
    category: 'Input',
    icon: 'ph-scan',
    description: 'Convert XPS/OXPS documents to PDF',
    factory: () => new XpsToPdfNode(),
  },
  MobiToPdfNode: {
    label: 'MOBI to PDF',
    category: 'Input',
    icon: 'ph-book-open-text',
    description: 'Convert MOBI e-books to PDF',
    factory: () => new MobiToPdfNode(),
  },
  Fb2ToPdfNode: {
    label: 'FB2 to PDF',
    category: 'Input',
    icon: 'ph-book-bookmark',
    description: 'Convert FB2 e-books to PDF',
    factory: () => new Fb2ToPdfNode(),
  },
  CbzToPdfNode: {
    label: 'CBZ to PDF',
    category: 'Input',
    icon: 'ph-book-open',
    description: 'Convert comic book archives (CBZ/CBR) to PDF',
    factory: () => new CbzToPdfNode(),
  },
  MarkdownToPdfNode: {
    label: 'Markdown to PDF',
    category: 'Input',
    icon: 'ph-markdown-logo',
    description: 'Convert Markdown files to PDF',
    factory: () => new MarkdownToPdfNode(),
  },
  JsonToPdfNode: {
    label: 'JSON to PDF',
    category: 'Input',
    icon: 'ph-file-code',
    description: 'Convert JSON files to PDF',
    factory: () => new JsonToPdfNode(),
  },
  XmlToPdfNode: {
    label: 'XML to PDF',
    category: 'Input',
    icon: 'ph-file-code',
    description: 'Convert XML documents to PDF',
    factory: () => new XmlToPdfNode(),
  },
  WpdToPdfNode: {
    label: 'WPD to PDF',
    category: 'Input',
    icon: 'ph-file-text',
    description: 'Convert WordPerfect documents to PDF',
    factory: () => new WpdToPdfNode(),
  },
  WpsToPdfNode: {
    label: 'WPS to PDF',
    category: 'Input',
    icon: 'ph-file-text',
    description: 'Convert WPS Office documents to PDF',
    factory: () => new WpsToPdfNode(),
  },
  PagesToPdfNode: {
    label: 'Pages to PDF',
    category: 'Input',
    icon: 'ph-file-text',
    description: 'Convert Apple Pages documents to PDF',
    factory: () => new PagesToPdfNode(),
  },
  OdgToPdfNode: {
    label: 'ODG to PDF',
    category: 'Input',
    icon: 'ph-image',
    description: 'Convert OpenDocument Graphics to PDF',
    factory: () => new OdgToPdfNode(),
  },
  PubToPdfNode: {
    label: 'PUB to PDF',
    category: 'Input',
    icon: 'ph-book-open',
    description: 'Convert Microsoft Publisher to PDF',
    factory: () => new PubToPdfNode(),
  },
  VsdToPdfNode: {
    label: 'VSD to PDF',
    category: 'Input',
    icon: 'ph-git-branch',
    description: 'Convert Visio diagrams (VSD/VSDX) to PDF',
    factory: () => new VsdToPdfNode(),
  },
  MergeNode: {
    label: 'Merge PDFs',
    category: 'Organize & Manage',
    icon: 'ph-browsers',
    description: 'Combine multiple PDFs into one',
    factory: () => new MergeNode(),
  },
  SplitNode: {
    label: 'Split PDF',
    category: 'Organize & Manage',
    icon: 'ph-scissors',
    description: 'Extract a range of pages',
    factory: () => new SplitNode(),
  },
  ExtractPagesNode: {
    label: 'Extract Pages',
    category: 'Organize & Manage',
    icon: 'ph-squares-four',
    description: 'Extract pages as separate PDFs',
    factory: () => new ExtractPagesNode(),
  },
  RotateNode: {
    label: 'Rotate',
    category: 'Organize & Manage',
    icon: 'ph-arrow-clockwise',
    description: 'Rotate all pages',
    factory: () => new RotateNode(),
  },
  DeletePagesNode: {
    label: 'Delete Pages',
    category: 'Organize & Manage',
    icon: 'ph-trash',
    description: 'Remove specific pages',
    factory: () => new DeletePagesNode(),
  },
  ReversePagesNode: {
    label: 'Reverse Pages',
    category: 'Organize & Manage',
    icon: 'ph-sort-descending',
    description: 'Reverse page order',
    factory: () => new ReversePagesNode(),
  },
  AddBlankPageNode: {
    label: 'Add Blank Page',
    category: 'Organize & Manage',
    icon: 'ph-file-plus',
    description: 'Insert blank pages',
    factory: () => new AddBlankPageNode(),
  },
  DividePagesNode: {
    label: 'Divide Pages',
    category: 'Organize & Manage',
    icon: 'ph-columns',
    description: 'Split pages vertically or horizontally',
    factory: () => new DividePagesNode(),
  },
  NUpNode: {
    label: 'N-Up',
    category: 'Organize & Manage',
    icon: 'ph-squares-four',
    description: 'Arrange multiple pages per sheet',
    factory: () => new NUpNode(),
  },
  FixPageSizeNode: {
    label: 'Fix Page Size',
    category: 'Organize & Manage',
    icon: 'ph-frame-corners',
    description: 'Standardize all pages to a target size',
    factory: () => new FixPageSizeNode(),
  },
  CombineSinglePageNode: {
    label: 'Combine to Single Page',
    category: 'Organize & Manage',
    icon: 'ph-arrows-out-line-vertical',
    description: 'Stitch all pages into one continuous page',
    factory: () => new CombineSinglePageNode(),
  },
  BookletNode: {
    label: 'Booklet',
    category: 'Organize & Manage',
    icon: 'ph-book-open',
    description: 'Arrange pages for booklet printing',
    factory: () => new BookletNode(),
  },
  PosterizeNode: {
    label: 'Posterize',
    category: 'Organize & Manage',
    icon: 'ph-notepad',
    description: 'Split pages into tile grid for poster printing',
    factory: () => new PosterizeNode(),
  },
  EditMetadataNode: {
    label: 'Edit Metadata',
    category: 'Organize & Manage',
    icon: 'ph-file-code',
    description: 'Edit PDF metadata',
    factory: () => new EditMetadataNode(),
  },
  TableOfContentsNode: {
    label: 'Table of Contents',
    category: 'Organize & Manage',
    icon: 'ph-list',
    description: 'Generate table of contents from bookmarks',
    factory: () => new TableOfContentsNode(),
  },
  OCRNode: {
    label: 'OCR',
    category: 'Organize & Manage',
    icon: 'ph-barcode',
    description: 'Add searchable text layer via OCR',
    factory: () => new OCRNode(),
  },
  CropNode: {
    label: 'Crop',
    category: 'Edit & Annotate',
    icon: 'ph-crop',
    description: 'Trim margins from all pages',
    factory: () => new CropNode(),
  },
  GreyscaleNode: {
    label: 'Greyscale',
    category: 'Edit & Annotate',
    icon: 'ph-palette',
    description: 'Convert to greyscale',
    factory: () => new GreyscaleNode(),
  },
  InvertColorsNode: {
    label: 'Invert Colors',
    category: 'Edit & Annotate',
    icon: 'ph-circle-half',
    description: 'Invert all colors',
    factory: () => new InvertColorsNode(),
  },
  ScannerEffectNode: {
    label: 'Scanner Effect',
    category: 'Edit & Annotate',
    icon: 'ph-scan',
    description: 'Apply scanner simulation effect',
    factory: () => new ScannerEffectNode(),
  },
  AdjustColorsNode: {
    label: 'Adjust Colors',
    category: 'Edit & Annotate',
    icon: 'ph-sliders-horizontal',
    description: 'Adjust brightness, contrast, and colors',
    factory: () => new AdjustColorsNode(),
  },
  BackgroundColorNode: {
    label: 'Background Color',
    category: 'Edit & Annotate',
    icon: 'ph-palette',
    description: 'Change background color',
    factory: () => new BackgroundColorNode(),
  },
  WatermarkNode: {
    label: 'Watermark',
    category: 'Edit & Annotate',
    icon: 'ph-drop',
    description: 'Add text watermark',
    factory: () => new WatermarkNode(),
  },
  PageNumbersNode: {
    label: 'Page Numbers',
    category: 'Edit & Annotate',
    icon: 'ph-list-numbers',
    description: 'Add page numbers',
    factory: () => new PageNumbersNode(),
  },
  HeaderFooterNode: {
    label: 'Header & Footer',
    category: 'Edit & Annotate',
    icon: 'ph-paragraph',
    description: 'Add header and footer text',
    factory: () => new HeaderFooterNode(),
  },
  RemoveBlankPagesNode: {
    label: 'Remove Blank Pages',
    category: 'Edit & Annotate',
    icon: 'ph-file-minus',
    description: 'Remove blank pages automatically',
    factory: () => new RemoveBlankPagesNode(),
  },
  RemoveAnnotationsNode: {
    label: 'Remove Annotations',
    category: 'Edit & Annotate',
    icon: 'ph-eraser',
    description: 'Strip all annotations',
    factory: () => new RemoveAnnotationsNode(),
  },
  CompressNode: {
    label: 'Compress',
    category: 'Optimize & Repair',
    icon: 'ph-lightning',
    description: 'Reduce PDF file size',
    factory: () => new CompressNode(),
  },
  RasterizeNode: {
    label: 'Rasterize',
    category: 'Optimize & Repair',
    icon: 'ph-image',
    description: 'Convert to image-based PDF',
    factory: () => new RasterizeNode(),
  },
  LinearizeNode: {
    label: 'Linearize',
    category: 'Optimize & Repair',
    icon: 'ph-gauge',
    description: 'Optimize PDF for fast web viewing',
    factory: () => new LinearizeNode(),
  },
  DeskewNode: {
    label: 'Deskew',
    category: 'Optimize & Repair',
    icon: 'ph-perspective',
    description: 'Straighten skewed PDF pages',
    factory: () => new DeskewNode(),
  },
  PdfToPdfANode: {
    label: 'PDF to PDF/A',
    category: 'Optimize & Repair',
    icon: 'ph-archive',
    description: 'Convert PDF to PDF/A for archiving',
    factory: () => new PdfToPdfANode(),
  },
  FontToOutlineNode: {
    label: 'Font to Outline',
    category: 'Optimize & Repair',
    icon: 'ph-text-outdent',
    description: 'Convert fonts to vector outlines',
    factory: () => new FontToOutlineNode(),
  },
  RepairNode: {
    label: 'Repair',
    category: 'Optimize & Repair',
    icon: 'ph-wrench',
    description: 'Repair corrupted PDF',
    factory: () => new RepairNode(),
  },
  EncryptNode: {
    label: 'Encrypt',
    category: 'Secure PDF',
    icon: 'ph-lock',
    description: 'Encrypt PDF with password',
    factory: () => new EncryptNode(),
  },
  DecryptNode: {
    label: 'Decrypt',
    category: 'Secure PDF',
    icon: 'ph-lock-open',
    description: 'Remove PDF password protection',
    factory: () => new DecryptNode(),
  },
  SanitizeNode: {
    label: 'Sanitize',
    category: 'Secure PDF',
    icon: 'ph-broom',
    description: 'Remove metadata, scripts, and hidden data',
    factory: () => new SanitizeNode(),
  },
  FlattenNode: {
    label: 'Flatten',
    category: 'Secure PDF',
    icon: 'ph-stack',
    description: 'Flatten forms and annotations',
    factory: () => new FlattenNode(),
  },
  DigitalSignNode: {
    label: 'Digital Sign',
    category: 'Secure PDF',
    icon: 'ph-certificate',
    description: 'Apply a digital signature to PDF',
    factory: () => new DigitalSignNode(),
  },
  RedactNode: {
    label: 'Redact',
    category: 'Secure PDF',
    icon: 'ph-eye-slash',
    description: 'Redact text from PDF',
    factory: () => new RedactNode(),
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
  },
  PdfToTextNode: {
    label: 'PDF to Text',
    category: 'Output',
    icon: 'ph-text-aa',
    description: 'Extract text from PDF',
    factory: () => new PdfToTextNode(),
  },
  PdfToDocxNode: {
    label: 'PDF to DOCX',
    category: 'Output',
    icon: 'ph-microsoft-word-logo',
    description: 'Convert PDF to Word document',
    factory: () => new PdfToDocxNode(),
  },
  PdfToXlsxNode: {
    label: 'PDF to XLSX',
    category: 'Output',
    icon: 'ph-microsoft-excel-logo',
    description: 'Convert PDF tables to Excel',
    factory: () => new PdfToXlsxNode(),
  },
  PdfToCsvNode: {
    label: 'PDF to CSV',
    category: 'Output',
    icon: 'ph-file-csv',
    description: 'Convert PDF tables to CSV',
    factory: () => new PdfToCsvNode(),
  },
  PdfToSvgNode: {
    label: 'PDF to SVG',
    category: 'Output',
    icon: 'ph-file-code',
    description: 'Convert PDF pages to SVG',
    factory: () => new PdfToSvgNode(),
  },
  PdfToMarkdownNode: {
    label: 'PDF to Markdown',
    category: 'Output',
    icon: 'ph-markdown-logo',
    description: 'Convert PDF to Markdown text',
    factory: () => new PdfToMarkdownNode(),
  },
  ExtractImagesNode: {
    label: 'Extract Images',
    category: 'Output',
    icon: 'ph-download-simple',
    description: 'Extract all images from PDF',
    factory: () => new ExtractImagesNode(),
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
