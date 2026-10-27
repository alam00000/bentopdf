import type { WorkflowControlOption, WorkflowControlSpec } from '@/types';
import { getAvailableTesseractLanguageEntries } from '../../utils/tesseract-language-availability.js';

export const MAX_TEXT_CONTROL_LENGTH = 1000;

const BOOLEAN: WorkflowControlSpec = { kind: 'boolean' };
const COLOR: WorkflowControlSpec = { kind: 'color' };
const PASSWORD: WorkflowControlSpec = { kind: 'password' };
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function toOptions(entries: [string, string][]): WorkflowControlOption[] {
  return entries.map(([value, label]) => ({ value, label }));
}

function selectSpec(...entries: [string, string][]): WorkflowControlSpec {
  return { kind: 'select', options: toOptions(entries) };
}

function numberSpec(
  min: number,
  max: number,
  step?: number
): WorkflowControlSpec {
  return { kind: 'number', min, max, step };
}

const PAGE_ORIENTATION = selectSpec(
  ['auto', 'Auto (Keep Original)'],
  ['portrait', 'Portrait'],
  ['landscape', 'Landscape']
);

const PAGE_COORDINATE = numberSpec(0, 14400);

const CONTROL_SPECS: Record<string, Record<string, WorkflowControlSpec>> = {
  AddBlankPageNode: {
    blankPosition: selectSpec(
      ['end', 'End'],
      ['start', 'Beginning'],
      ['after', 'After Page...']
    ),
    afterPage: numberSpec(1, 100000, 1),
    count: numberSpec(1, 100, 1),
  },
  AdjustColorsNode: {
    brightness: numberSpec(-100, 100, 1),
    contrast: numberSpec(-100, 100, 1),
    saturation: numberSpec(-100, 100, 1),
    hueShift: numberSpec(0, 360, 1),
    temperature: numberSpec(-50, 50, 1),
    tint: numberSpec(-50, 50, 1),
    gamma: numberSpec(0.2, 5, 0.1),
    sepia: numberSpec(0, 100, 1),
  },
  AlternateMergeNode: {
    retainPageLabels: BOOLEAN,
  },
  BackgroundColorNode: {
    color: COLOR,
  },
  BookletNode: {
    gridMode: selectSpec(
      ['1x2', '1x2 (Booklet)'],
      ['2x2', '2x2 (4-up)'],
      ['2x4', '2x4 (8-up)'],
      ['4x4', '4x4 (16-up)']
    ),
    paperSize: selectSpec(
      ['Letter', 'Letter'],
      ['A4', 'A4'],
      ['A3', 'A3'],
      ['Tabloid', 'Tabloid'],
      ['Legal', 'Legal']
    ),
    orientation: PAGE_ORIENTATION,
  },
  CombineSinglePageNode: {
    orientation: selectSpec(
      ['vertical', 'Vertical'],
      ['horizontal', 'Horizontal']
    ),
    spacing: numberSpec(0, 1000),
    backgroundColor: COLOR,
    separator: BOOLEAN,
    separatorThickness: numberSpec(0.5, 50, 0.5),
    separatorColor: COLOR,
  },
  CompressNode: {
    compressionLevel: selectSpec(
      ['low', 'Low (Best Quality)'],
      ['medium', 'Medium (Recommended)'],
      ['high', 'High (Smallest Files)'],
      ['lossless', 'Lossless (No Quality Loss)']
    ),
    targetKilobytes: numberSpec(0, 1048576, 1),
    convertToGrayscale: BOOLEAN,
  },
  CropNode: {
    top: PAGE_COORDINATE,
    bottom: PAGE_COORDINATE,
    left: PAGE_COORDINATE,
    right: PAGE_COORDINATE,
  },
  DecryptNode: {
    password: PASSWORD,
  },
  DeskewNode: {
    skewThreshold: selectSpec(
      ['0.1', '0.1° (Very Sensitive)'],
      ['0.5', '0.5° (Default)'],
      ['1.0', '1.0° (Normal)'],
      ['2.0', '2.0° (Less Sensitive)']
    ),
    processingDpi: selectSpec(
      ['100', '100 (Fast)'],
      ['150', '150 (Default)'],
      ['200', '200 (Better)'],
      ['300', '300 (Best Quality)']
    ),
  },
  DividePagesNode: {
    direction: selectSpec(
      ['vertical', 'Vertical'],
      ['horizontal', 'Horizontal']
    ),
  },
  EmailToPdfNode: {
    pageSize: selectSpec(
      ['a4', 'A4'],
      ['letter', 'Letter'],
      ['legal', 'Legal']
    ),
    includeCcBcc: BOOLEAN,
    includeAttachments: BOOLEAN,
  },
  EncryptNode: {
    userPassword: PASSWORD,
    ownerPassword: PASSWORD,
  },
  FixPageSizeNode: {
    targetSize: selectSpec(
      ['A4', 'A4'],
      ['Letter', 'Letter'],
      ['Legal', 'Legal'],
      ['A3', 'A3'],
      ['A5', 'A5'],
      ['Tabloid', 'Tabloid'],
      ['Custom', 'Custom']
    ),
    orientation: PAGE_ORIENTATION,
    scalingMode: selectSpec(
      ['fit', 'Fit (keep full page visible)'],
      ['fill', 'Fill (cover full target page)']
    ),
    backgroundColor: COLOR,
    customWidth: numberSpec(1, 5080),
    customHeight: numberSpec(1, 5080),
    customUnits: selectSpec(['mm', 'Millimeters (mm)'], ['in', 'Inches (in)']),
  },
  HeaderFooterNode: {
    fontSize: numberSpec(4, 72, 1),
    color: COLOR,
  },
  MergeNode: {
    retainPageLabels: BOOLEAN,
  },
  NUpNode: {
    pagesPerSheet: selectSpec(['2', '2'], ['4', '4'], ['9', '9'], ['16', '16']),
    orientation: PAGE_ORIENTATION,
    margins: BOOLEAN,
    border: BOOLEAN,
    borderColor: COLOR,
  },
  OCRNode: {
    language: {
      kind: 'multiselect',
      options: toOptions(getAvailableTesseractLanguageEntries()),
      separator: '+',
    },
    resolution: selectSpec(
      ['2.0', 'Standard (192 DPI)'],
      ['3.0', 'High (288 DPI)'],
      ['4.0', 'Ultra (384 DPI)']
    ),
    binarize: BOOLEAN,
  },
  PageNumbersNode: {
    position: selectSpec(
      ['bottom-center', 'Bottom Center'],
      ['bottom-left', 'Bottom Left'],
      ['bottom-right', 'Bottom Right'],
      ['top-center', 'Top Center'],
      ['top-left', 'Top Left'],
      ['top-right', 'Top Right']
    ),
    fontSize: numberSpec(4, 72, 1),
    numberFormat: selectSpec(
      ['simple', 'Simple (1, 2, 3)'],
      ['page_x_of_y', 'Page X of Y']
    ),
    color: COLOR,
  },
  PdfToImagesNode: {
    format: selectSpec(
      ['jpg', 'JPG'],
      ['png', 'PNG'],
      ['webp', 'WebP'],
      ['svg', 'SVG']
    ),
    quality: numberSpec(10, 100, 1),
    dpi: numberSpec(72, 600, 1),
  },
  PdfToPdfANode: {
    level: selectSpec(
      ['PDF/A-1b', 'PDF/A-1b (Strict, no transparency)'],
      ['PDF/A-2b', 'PDF/A-2b (Recommended)'],
      ['PDF/A-3b', 'PDF/A-3b (Modern, allows attachments)']
    ),
    preFlatten: BOOLEAN,
  },
  PosterizeNode: {
    rows: numberSpec(1, 8, 1),
    cols: numberSpec(1, 8, 1),
  },
  RasterizeNode: {
    rasterizeDpi: selectSpec(
      ['72', '72 (Screen)'],
      ['150', '150 (Default)'],
      ['200', '200 (Good)'],
      ['300', '300 (Print)'],
      ['600', '600 (High Quality)']
    ),
    imageFormat: selectSpec(
      ['png', 'PNG (Lossless)'],
      ['jpeg', 'JPEG (Smaller file size)']
    ),
    grayscale: BOOLEAN,
  },
  RedactNode: {
    redactMode: selectSpec(
      ['text', 'Search Text'],
      ['area', 'Area (Coordinates)']
    ),
    x0: PAGE_COORDINATE,
    y0: PAGE_COORDINATE,
    x1: PAGE_COORDINATE,
    y1: PAGE_COORDINATE,
    fillColor: COLOR,
  },
  RemoveBlankPagesNode: {
    threshold: numberSpec(0.1, 5, 0.1),
  },
  RotateNode: {
    angle: selectSpec(
      ['90', '90° Clockwise'],
      ['180', '180°'],
      ['270', '90° Counter-clockwise']
    ),
  },
  SanitizeNode: {
    flattenForms: BOOLEAN,
    removeMetadata: BOOLEAN,
    removeAnnotations: BOOLEAN,
    removeJavascript: BOOLEAN,
    removeEmbeddedFiles: BOOLEAN,
    removeLayers: BOOLEAN,
    removeLinks: BOOLEAN,
    removeStructureTree: BOOLEAN,
    removeMarkInfo: BOOLEAN,
    removeFonts: BOOLEAN,
  },
  ScannerEffectNode: {
    grayscale: BOOLEAN,
    border: BOOLEAN,
    rotation: numberSpec(-5, 5, 0.1),
    rotationVariance: numberSpec(0, 3, 0.1),
    brightness: numberSpec(-50, 50, 1),
    contrast: numberSpec(-50, 50, 1),
    blur: numberSpec(0, 3, 0.1),
    noise: numberSpec(0, 50, 1),
    yellowish: numberSpec(0, 50, 1),
    resolution: numberSpec(72, 300, 1),
  },
  TableOfContentsNode: {
    fontSize: numberSpec(10, 72, 1),
    fontFamily: selectSpec(
      ['0', 'Times Roman'],
      ['1', 'Times Bold'],
      ['2', 'Times Italic'],
      ['3', 'Times Bold Italic'],
      ['4', 'Helvetica'],
      ['5', 'Helvetica Bold'],
      ['6', 'Helvetica Oblique'],
      ['7', 'Helvetica Bold Oblique'],
      ['8', 'Courier'],
      ['9', 'Courier Bold'],
      ['10', 'Courier Oblique'],
      ['11', 'Courier Bold Oblique']
    ),
  },
  TextToPdfNode: {
    fontSize: numberSpec(6, 72, 1),
    fontFamily: selectSpec(
      ['helv', 'Helvetica'],
      ['times', 'Times Roman'],
      ['cour', 'Courier'],
      ['tiro', 'Times Italic']
    ),
    fontColor: COLOR,
  },
  WatermarkNode: {
    fontSize: numberSpec(10, 200, 1),
    color: COLOR,
    opacity: numberSpec(0, 100, 1),
    angle: numberSpec(-180, 180, 1),
    position: selectSpec(
      ['center', 'Center'],
      ['top-left', 'Top Left'],
      ['top', 'Top'],
      ['top-right', 'Top Right'],
      ['left', 'Left'],
      ['right', 'Right'],
      ['bottom-left', 'Bottom Left'],
      ['bottom', 'Bottom'],
      ['bottom-right', 'Bottom Right']
    ),
    tileGapX: numberSpec(0, 200, 1),
    tileGapY: numberSpec(0, 200, 1),
  },
};

export function getControlSpec(
  nodeType: string,
  key: string
): WorkflowControlSpec | undefined {
  if (!Object.hasOwn(CONTROL_SPECS, nodeType)) return undefined;
  const specs = CONTROL_SPECS[nodeType];
  return Object.hasOwn(specs, key) ? specs[key] : undefined;
}

export function sanitizeWithControlSpec(
  spec: WorkflowControlSpec | undefined,
  value: unknown,
  fallback: unknown
): unknown {
  switch (spec?.kind) {
    case 'password':
      return '';
    case 'select':
      return spec.options.some((option) => option.value === String(value))
        ? value
        : fallback;
    case 'multiselect': {
      if (typeof value !== 'string') return fallback;
      const allowed = new Set(spec.options.map((option) => option.value));
      const kept = [...new Set(value.split(spec.separator))].filter((part) =>
        allowed.has(part)
      );
      return kept.length > 0 ? kept.join(spec.separator) : fallback;
    }
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
        ? Math.min(spec.max, Math.max(spec.min, value))
        : fallback;
    case 'boolean':
      return value === 'true' || value === 'false' ? value : fallback;
    case 'color':
      return typeof value === 'string' && HEX_COLOR.test(value)
        ? value
        : fallback;
    default:
      if (typeof value === 'string') {
        return value.slice(0, MAX_TEXT_CONTROL_LENGTH);
      }
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      return fallback;
  }
}
