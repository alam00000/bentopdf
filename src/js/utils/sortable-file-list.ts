import Sortable from 'sortablejs';

type ReorderHandler = (oldIndex: number, newIndex: number) => void;

const sortables = new WeakMap<HTMLElement, Sortable>();

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
  handle.title = 'Drag to reorder';
  handle.setAttribute('aria-label', 'Drag to reorder');
  handle.innerHTML = '<i data-lucide="grip-vertical" class="w-4 h-4"></i>';
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
