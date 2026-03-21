export const FORM_CREATOR_FIELD_TYPES = [
  'text',
  'checkbox',
  'radio',
  'dropdown',
  'optionlist',
  'button',
  'signature',
  'date',
  'image',
  'barcode',
] as const;

export type FormCreatorFieldType = (typeof FORM_CREATOR_FIELD_TYPES)[number];

export interface ExtractionViewportMetrics {
  pdfViewerOffset: {
    x: number;
    y: number;
  };
  pdfViewerScale: number;
}

export interface ExtractExistingFieldsOptions {
  pdfDoc: import('pdf-lib').PDFDocument;
  fieldCounterStart: number;
  metrics: ExtractionViewportMetrics;
}

export interface ExtractExistingFieldsResult {
  fields: FormField[];
  extractedFieldNames: Set<string>;
  nextFieldCounter: number;
}

export interface ExtractedFieldLike {
  type: 'text' | 'radio';
  name: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  tooltip: string;
  required: boolean;
  readOnly: boolean;
  checked?: boolean;
  exportValue?: string;
  groupName?: string;
}

export interface FormField {
  id: string;
  type: FormCreatorFieldType;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  defaultValue: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  textColor: string;
  required: boolean;
  readOnly: boolean;
  tooltip: string;
  combCells: number;
  maxLength: number;
  options?: string[];
  checked?: boolean;
  exportValue?: string;
  groupName?: string;
  label?: string;
  pageIndex: number;
  action?: 'none' | 'reset' | 'print' | 'url' | 'js' | 'showHide';
  actionUrl?: string;
  jsScript?: string;
  targetFieldName?: string;
  visibilityAction?: 'show' | 'hide' | 'toggle';
  dateFormat?: string;
  multiline?: boolean;
  borderColor?: string;
  hideBorder?: boolean;
  transparentBackground?: boolean;
  barcodeFormat?: string;
  barcodeValue?: string;
}

export interface PageData {
  index: number;
  width: number;
  height: number;
  pdfPageData?: string;
}
