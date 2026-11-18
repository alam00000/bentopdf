export type FileSortField = 'added' | 'name' | 'date' | 'size';

export type FileSortDirection = 'asc' | 'desc';

export interface SortableFileItem {
  name: string;
  lastModified: number;
  size: number;
}
