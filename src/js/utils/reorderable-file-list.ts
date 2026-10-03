import { createIcons, icons } from 'lucide';
import Sortable from 'sortablejs';
import { formatBytes } from './helpers.js';

/**
 * Shared drag-to-reorder file list, used by the tools that combine several
 * uploads into a single ordered document (images-to-PDF, text-to-PDF, ...).
 * The visual order of the rows is the page order of the generated PDF, so the
 * user needs to be able to rearrange them.
 */
export interface ReorderableFileListOptions {
  /** Element that holds the file rows (usually `#file-display-area`). */
  container: HTMLElement;
  /** Files to render, in output order. */
  files: File[];
  /**
   * Called after a drag with the files in their new order. The rows have
   * already been re-labelled in place, so the caller only needs to store the
   * new array — re-rendering is not required.
   */
  onReorder: (files: File[]) => void;
  /** Called with the index of the file whose remove button was clicked. */
  onRemove: (index: number) => void;
}

const sortableInstances = new WeakMap<HTMLElement, Sortable>();

/**
 * Renders `files` into `container` as a drag-sortable list, replacing whatever
 * was there before. Safe to call on every UI update.
 */
export function renderReorderableFileList({
  container,
  files,
  onReorder,
  onRemove,
}: ReorderableFileListOptions): void {
  destroyReorderableFileList(container);
  container.textContent = '';

  // The rows are re-indexed in place after every drag and the caller only
  // rebinds its own array, so the order has to be tracked here: reading the
  // render-time `files` again would map fresh indices onto a stale array.
  let currentFiles = [...files];

  currentFiles.forEach((file, index) => {
    container.appendChild(createFileRow(file, index, onRemove));
  });

  createIcons({ icons });

  if (currentFiles.length === 0) return;

  const instance = Sortable.create(container, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onStart: function (evt: Sortable.SortableEvent) {
      evt.item.style.opacity = '0.5';
    },
    onEnd: function (evt: Sortable.SortableEvent) {
      evt.item.style.opacity = '1';
      // Sync in place rather than re-rendering: destroying the Sortable
      // instance from inside its own onEnd handler is not safe.
      currentFiles = syncOrderWithDom(container, currentFiles);
      onReorder(currentFiles);
    },
  });

  sortableInstances.set(container, instance);
}

/** Tears down the drag behaviour for a container (e.g. when the list empties). */
export function destroyReorderableFileList(container: HTMLElement): void {
  const instance = sortableInstances.get(container);
  if (instance) {
    instance.destroy();
    sortableInstances.delete(container);
  }
}

function createFileRow(
  file: File,
  index: number,
  onRemove: (index: number) => void
): HTMLElement {
  const fileDiv = document.createElement('div');
  fileDiv.className =
    'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm border border-transparent hover:border-indigo-500 transition-colors';
  fileDiv.dataset.fileIndex = String(index);

  const infoContainer = document.createElement('div');
  infoContainer.className =
    'flex items-center gap-2 overflow-hidden flex-1 mr-2';

  const dragHandle = document.createElement('div');
  dragHandle.className =
    'drag-handle cursor-move text-gray-400 hover:text-white p-1 rounded flex-shrink-0 transition-colors';
  dragHandle.title = 'Drag to reorder';
  dragHandle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>`; // Safe: static content

  const orderSpan = document.createElement('span');
  orderSpan.className = 'file-order flex-shrink-0 text-gray-400 text-xs w-6';
  orderSpan.textContent = `${index + 1}.`;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'truncate font-medium text-gray-200';
  nameSpan.title = file.name;
  nameSpan.textContent = file.name;

  const sizeSpan = document.createElement('span');
  sizeSpan.className = 'flex-shrink-0 text-gray-400 text-xs';
  sizeSpan.textContent = `(${formatBytes(file.size)})`;

  infoContainer.append(dragHandle, orderSpan, nameSpan, sizeSpan);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>'; // Safe: static content
  removeBtn.title = 'Remove file';
  removeBtn.onclick = () => {
    // Read the position from the DOM so the handler stays correct after a drag.
    onRemove(Number(fileDiv.dataset.fileIndex));
  };

  fileDiv.append(infoContainer, removeBtn);
  return fileDiv;
}

/**
 * Re-orders `files` to match the current DOM order, then refreshes the position
 * labels and index bookkeeping on the rows.
 */
function syncOrderWithDom(container: HTMLElement, files: File[]): File[] {
  const rows = Array.from(
    container.querySelectorAll<HTMLElement>('[data-file-index]')
  );

  const reordered = rows.map((row) => files[Number(row.dataset.fileIndex)]);

  rows.forEach((row, index) => {
    row.dataset.fileIndex = String(index);
    const orderSpan = row.querySelector('.file-order');
    if (orderSpan) orderSpan.textContent = `${index + 1}.`;
  });

  return reordered;
}
