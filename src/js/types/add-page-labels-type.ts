export type PageLabelStyleName =
  | 'DecimalArabic'
  | 'LowercaseRoman'
  | 'UppercaseRoman'
  | 'LowercaseLetters'
  | 'UppercaseLetters'
  | 'NoLabelPrefixOnly';

export interface LabelRule {
  id: string;
  pageRange: string;
  style: PageLabelStyleName;
  prefix: string;
  startValue: number;
  progress: boolean;
}

export interface AddPageLabelsState {
  file: File | null;
  pageCount: number;
  rules: LabelRule[];
}
