import { PDFDocument as PDFLibDocument, PDFRef } from 'pdf-lib';
import { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';

// Core bookmark types
export type BookmarkColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | null;
export type BookmarkStyle = 'bold' | 'italic' | 'bold-italic' | null;

export interface BookmarkNode {
  id: number;
  title: string;
  page: number;
  children: BookmarkNode[];
  color: BookmarkColor | string;
  style: BookmarkStyle;
  destX: number | null;
  destY: number | null;
  zoom: string | null;
}

export type BookmarkTree = BookmarkNode[];

// Modal system types
export type ModalFieldType = 'text' | 'select' | 'destination' | 'preview';

export interface SelectOption {
  value: string;
  label: string;
}

export interface BaseModalField {
  name: string;
  label: string;
}

export interface TextModalField extends BaseModalField {
  type: 'text';
  placeholder?: string;
}

export interface SelectModalField extends BaseModalField {
  type: 'select';
  options: SelectOption[];
}

export interface DestinationModalField extends BaseModalField {
  type: 'destination';
  page?: number;
  maxPages?: number;
}

export interface PreviewModalField {
  type: 'preview';
  label: string;
}

export type ModalField =
  | TextModalField
  | SelectModalField
  | DestinationModalField
  | PreviewModalField;

export interface ModalResult {
  title?: string;
  color?: string;
  style?: string;
  destPage?: number | null;
  destX?: number | null;
  destY?: number | null;
  zoom?: string | null;
  [key: string]: string | number | null | undefined;
}

export interface ModalDefaultValues {
  title?: string;
  color?: string;
  style?: string;
  destPage?: number;
  destX?: number | null;
  destY?: number | null;
  zoom?: string | null;
  [key: string]: string | number | null | undefined;
}

// Destination picking types
export type DestinationCallback = (
  page: number,
  pdfX: number,
  pdfY: number
) => void;

export interface DestinationPickingState {
  isPickingDestination: boolean;
  currentPickingCallback: DestinationCallback | null;
  destinationMarker: HTMLDivElement | null;
  savedModalOverlay: HTMLDivElement | null;
  savedModal: HTMLDivElement | null;
  currentViewport: PageViewport | null;
}

// State types
export interface BookmarkEditorState {
  pdfLibDoc: PDFLibDocument | null;
  pdfJsDoc: PDFDocumentProxy | null;
  currentPage: number;
  currentZoom: number;
  originalFileName: string;
  bookmarkTree: BookmarkTree;
  history: BookmarkTree[];
  historyIndex: number;
  searchQuery: string;
  csvBookmarks: BookmarkTree | null;
  jsonBookmarks: BookmarkTree | null;
  batchMode: boolean;
  selectedBookmarks: Set<number>;
  collapsedNodes: Set<number>;
}

// PDF outline types (from pdfjs-dist)
export interface PDFOutlineItem {
  title: string;
  dest: string | unknown[] | null;
  items?: PDFOutlineItem[];
  color?: Uint8ClampedArray | [number, number, number];
  bold?: boolean;
  italic?: boolean;
}

export interface FlattenedBookmark extends BookmarkNode {
  level: number;
}

// Outline item for PDF creation
export interface OutlineItem {
  ref: PDFRef;
  dict: {
    set: (key: unknown, value: unknown) => void;
  };
}

// Color mapping types
export type ColorClassMap = Record<string, string>;

export const COLOR_CLASSES: ColorClassMap = {
  red: 'bg-red-100 border-red-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  yellow: 'bg-yellow-100 border-yellow-300',
  purple: 'bg-purple-100 border-purple-300',
};

export const TEXT_COLOR_CLASSES: ColorClassMap = {
  red: 'text-red-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600',
};

export const HEX_COLOR_MAP: Record<string, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#ca8a04',
  purple: '#9333ea',
};

export const PDF_COLOR_MAP: Record<string, [number, number, number]> = {
  red: [1.0, 0.0, 0.0],
  blue: [0.0, 0.0, 1.0],
  green: [0.0, 1.0, 0.0],
  yellow: [1.0, 1.0, 0.0],
  purple: [0.5, 0.0, 0.5],
};
