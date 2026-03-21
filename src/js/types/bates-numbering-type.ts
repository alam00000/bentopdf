export interface StylePreset {
  template: string;
  padding: number;
}

export type Position =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right';

export interface FileEntry {
  file: File;
  pageCount: number;
}
