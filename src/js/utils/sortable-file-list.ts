import Sortable from 'sortablejs';
import { trText } from '../i18n/i18n.js';
import type {
  FileSortDirection,
  FileSortField,
  SortableFileItem,
} from '@/types';

type ReorderHandler = (oldIndex: number, newIndex: number) => void;

const sortables = new WeakMap<HTMLElement, Sortable>();

const nameCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

const SORT_FIELDS: FileSortField[] = ['added', 'name', 'date', 'size'];
const SORT_DIRECTIONS: FileSortDirection[] = ['asc', 'desc'];

const fieldLabels = (): Record<FileSortField, string> => ({
  added: trText('None'),
  name: trText('Name'),
  date: trText('Modified date'),
  size: trText('Size'),
});

const directionLabels = (): Record<FileSortDirection, string> => ({
  asc: trText('Ascending'),
  desc: trText('Descending'),
});

interface SortControl {
  root: HTMLElement;
  field: FileSortField;
  direction: FileSortDirection;
  apply: () => void;
}

const sortControls = new WeakMap<HTMLElement, SortControl>();

const addedOrder = new WeakMap<SortableFileItem, number>();
let addedCount = 0;

export function sortFiles<T extends SortableFileItem>(
  items: readonly T[],
  field: FileSortField,
  direction: FileSortDirection
): T[] {
  const sign = direction === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const byField =
      field === 'added'
        ? (addedOrder.get(a) ?? 0) - (addedOrder.get(b) ?? 0)
        : field === 'date'
          ? a.lastModified - b.lastModified
          : field === 'size'
            ? a.size - b.size
            : 0;
    return sign * (byField || nameCollator.compare(a.name, b.name));
  });
}

function createIcon(name: string, extra = ''): HTMLElement {
  const icon = document.createElement('i');
  icon.className = `ph ph-${name} ${extra}`.trim();
  icon.setAttribute('aria-hidden', 'true');
  return icon;
}

function createMenuItem(
  label: string,
  checked: boolean,
  onSelect: () => void,
  iconName?: string
): HTMLButtonElement {
  const item = document.createElement('button');
  item.type = 'button';
  item.setAttribute('role', 'menuitemradio');
  item.setAttribute('aria-checked', String(checked));
  item.className =
    'w-full flex items-center justify-between gap-6 px-4 py-2 text-sm whitespace-nowrap text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none text-left';
  const text = document.createElement('span');
  text.className = 'flex items-center gap-2';
  if (iconName) text.appendChild(createIcon(iconName, 'text-base'));
  text.append(label);
  const check = createIcon(
    'check',
    `text-base text-indigo-400 ${checked ? '' : 'invisible'}`
  );
  item.append(text, check);
  item.addEventListener('click', onSelect);
  return item;
}

function createSortControl(): SortControl {
  const root = document.createElement('div');
  root.className = 'file-sort relative ms-auto';

  const button = document.createElement('button');
  button.type = 'button';
  button.className =
    'flex items-center gap-2 h-10 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white rounded-lg px-3';
  button.setAttribute('aria-label', trText('Sort by'));
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');
  button.title = trText('Sort by');
  button.append(
    createIcon('arrows-down-up', 'text-lg'),
    createIcon('caret-down', 'text-sm')
  );

  const menu = document.createElement('div');
  menu.setAttribute('role', 'menu');
  menu.className =
    'hidden absolute end-0 top-full mt-2 z-30 min-w-[13rem] max-w-[calc(100vw-2rem)] bg-gray-800 border border-gray-600 rounded-xl shadow-xl py-1.5';

  const control: SortControl = {
    root,
    field: 'added',
    direction: 'asc',
    apply: () => {},
  };

  const onOutsideClick = (event: MouseEvent) => {
    if (!root.contains(event.target as Node)) close();
  };
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
      button.focus();
    }
  };
  const close = () => {
    menu.classList.add('hidden');
    button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutsideClick);
    document.removeEventListener('keydown', onKeydown);
  };
  const choose = (update: () => void) => () => {
    update();
    close();
    control.apply();
  };
  const renderMenu = () => {
    const fields = fieldLabels();
    const directions = directionLabels();
    const divider = document.createElement('div');
    divider.className = 'my-1.5 mx-3 border-t border-gray-600';
    menu.replaceChildren(
      ...SORT_FIELDS.map((field) =>
        createMenuItem(
          fields[field],
          control.field === field,
          choose(() => {
            control.field = field;
          })
        )
      ),
      divider,
      ...SORT_DIRECTIONS.map((direction) =>
        createMenuItem(
          directions[direction],
          control.direction === direction,
          choose(() => {
            control.direction = direction;
          }),
          direction === 'asc' ? 'arrow-up' : 'arrow-down'
        )
      )
    );
  };

  button.addEventListener('click', () => {
    if (!menu.classList.contains('hidden')) {
      close();
      return;
    }
    renderMenu();
    menu.classList.remove('hidden');
    button.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKeydown);
    setTimeout(() => document.addEventListener('click', onOutsideClick));
  });

  root.append(button, menu);
  return control;
}

export function enableFileListSort<T extends SortableFileItem>(
  controlsRow: HTMLElement | null,
  items: readonly T[],
  onSort: (sorted: T[]) => void,
  stateKey: HTMLElement | null = controlsRow
): void {
  if (!controlsRow || !stateKey) return;
  let control = sortControls.get(stateKey);
  if (!control) {
    control = createSortControl();
    sortControls.set(stateKey, control);
  }
  if (control.root.parentElement !== controlsRow) {
    controlsRow.classList.add('flex-wrap');
    controlsRow.appendChild(control.root);
  }
  if (items.length > 0 && !items.some((item) => addedOrder.has(item))) {
    control.field = 'added';
    control.direction = 'asc';
  }
  for (const item of items) {
    if (!addedOrder.has(item)) addedOrder.set(item, addedCount++);
  }
  const current = control;
  current.root.classList.toggle('hidden', items.length < 2);
  current.apply = () => {
    onSort(sortFiles(items, current.field, current.direction));
  };
}

export function moveItem<T>(
  items: readonly T[],
  oldIndex: number,
  newIndex: number
): T[] {
  const result = [...items];
  if (
    oldIndex === newIndex ||
    oldIndex < 0 ||
    oldIndex >= result.length ||
    newIndex < 0 ||
    newIndex >= result.length
  ) {
    return result;
  }
  const [moved] = result.splice(oldIndex, 1);
  result.splice(newIndex, 0, moved);
  return result;
}

export function createDragHandle(): HTMLElement {
  const handle = document.createElement('div');
  handle.className =
    'drag-handle cursor-move text-gray-400 hover:text-white p-1 rounded transition-colors flex-shrink-0';
  const label = trText('Drag to reorder');
  handle.title = label;
  handle.setAttribute('aria-label', label);
  const icon = document.createElement('i');
  icon.className = 'ph ph-dots-six-vertical text-base';
  handle.appendChild(icon);
  return handle;
}

// Rows must contain an element created by createDragHandle(). The list is
// re-rendered by the caller, so one Sortable per container is kept and only
// its reorder callback is swapped on subsequent calls.
export function enableFileListReorder(
  container: HTMLElement,
  onReorder: ReorderHandler
): void {
  const onEnd = (evt: Sortable.SortableEvent) => {
    const { oldIndex, newIndex } = evt;
    if (
      oldIndex === undefined ||
      newIndex === undefined ||
      oldIndex === newIndex
    ) {
      return;
    }
    onReorder(oldIndex, newIndex);
  };

  const existing = sortables.get(container);
  if (existing) {
    existing.option('onEnd', onEnd);
    return;
  }

  sortables.set(
    container,
    Sortable.create(container, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd,
    })
  );
}

export function itemsInListOrder<T>(
  container: HTMLElement | null,
  items: readonly T[]
): T[] {
  const order = Array.from(container?.children ?? []).map((row) =>
    parseInt((row as HTMLElement).dataset.fileName ?? '', 10)
  );
  const matchesItems =
    order.length === items.length &&
    new Set(order).size === order.length &&
    order.every((index) => items[index] !== undefined);
  return matchesItems ? order.map((index) => items[index]) : [...items];
}
