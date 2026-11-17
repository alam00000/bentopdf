import Sortable from 'sortablejs';
import { trText } from '../i18n/i18n.js';

type ReorderHandler = (oldIndex: number, newIndex: number) => void;

const sortables = new WeakMap<HTMLElement, Sortable>();

const nameCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export function sortByName<T extends { name: string }>(
  items: readonly T[]
): T[] {
  return [...items].sort((a, b) => nameCollator.compare(a.name, b.name));
}

export function addFilesSorted<T extends { name: string }>(
  existing: readonly T[],
  added: readonly T[]
): T[] {
  const isSorted = sortByName(existing).every(
    (item, index) => item === existing[index]
  );
  return isSorted
    ? sortByName([...existing, ...added])
    : [...existing, ...sortByName(added)];
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
