import { describe, it, expect, vi, beforeEach } from 'vitest';

const { createMock, optionMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  optionMock: vi.fn(),
}));

vi.mock('sortablejs', () => ({
  default: { create: createMock },
}));

import {
  createDragHandle,
  enableFileListReorder,
  enableFileListSort,
  itemsInListOrder,
  moveItem,
  sortFiles,
} from '@/js/utils/sortable-file-list';

type OnEnd = (evt: { oldIndex?: number; newIndex?: number }) => void;

function lastOnEnd(): OnEnd {
  return createMock.mock.calls[createMock.mock.calls.length - 1][1].onEnd;
}

describe('moveItem', () => {
  it('should move an item forward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('should move an item backward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('should not mutate the input array', () => {
    const items = ['a', 'b', 'c'];
    moveItem(items, 0, 2);
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('should return an unchanged copy for out-of-range indices', () => {
    expect(moveItem(['a', 'b'], -1, 1)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});

describe('createDragHandle', () => {
  it('should create an element Sortable can use as a handle', () => {
    const handle = createDragHandle();
    expect(handle.classList.contains('drag-handle')).toBe(true);
    expect(handle.getAttribute('aria-label')).toBe('Drag to reorder');
    expect(handle.querySelector('i.ph.ph-dots-six-vertical')).not.toBeNull();
  });
});

describe('enableFileListReorder', () => {
  beforeEach(() => {
    createMock.mockReset();
    optionMock.mockReset();
    createMock.mockImplementation(() => ({ option: optionMock }));
  });

  it('should create Sortable restricted to the drag handle', () => {
    const container = document.createElement('div');
    enableFileListReorder(container, vi.fn());

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock.mock.calls[0][0]).toBe(container);
    expect(createMock.mock.calls[0][1].handle).toBe('.drag-handle');
  });

  it('should report moves to the callback', () => {
    const onReorder = vi.fn();
    enableFileListReorder(document.createElement('div'), onReorder);

    lastOnEnd()({ oldIndex: 2, newIndex: 0 });
    expect(onReorder).toHaveBeenCalledWith(2, 0);
  });

  it('should ignore drops that do not change position', () => {
    const onReorder = vi.fn();
    enableFileListReorder(document.createElement('div'), onReorder);

    lastOnEnd()({ oldIndex: 1, newIndex: 1 });
    lastOnEnd()({ oldIndex: undefined, newIndex: 1 });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('should reuse the Sortable instance and swap the callback on re-render', () => {
    const container = document.createElement('div');
    enableFileListReorder(container, vi.fn());
    const second = vi.fn();
    enableFileListReorder(container, second);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(optionMock).toHaveBeenCalledWith('onEnd', expect.any(Function));

    const swapped: OnEnd = optionMock.mock.calls[0][1];
    swapped({ oldIndex: 0, newIndex: 1 });
    expect(second).toHaveBeenCalledWith(0, 1);
  });
});

const file = (name: string, lastModified = 0, size = 0) => ({
  name,
  lastModified,
  size,
});
const names = (items: { name: string }[]) => items.map((item) => item.name);

describe('sortFiles', () => {
  const photos = [
    file('img10.jpg', 300, 20),
    file('img2.jpg', 100, 40),
    file('IMG1.jpg', 400, 10),
    file('img100.jpg', 200, 30),
  ];

  it('should sort names with numbers by value, ignoring case', () => {
    expect(names(sortFiles(photos, 'name', 'asc'))).toEqual([
      'IMG1.jpg',
      'img2.jpg',
      'img10.jpg',
      'img100.jpg',
    ]);
    expect(names(sortFiles(photos, 'name', 'desc'))).toEqual([
      'img100.jpg',
      'img10.jpg',
      'img2.jpg',
      'IMG1.jpg',
    ]);
  });

  it('should sort by modified date in both directions', () => {
    expect(names(sortFiles(photos, 'date', 'asc'))).toEqual([
      'img2.jpg',
      'img100.jpg',
      'img10.jpg',
      'IMG1.jpg',
    ]);
    expect(names(sortFiles(photos, 'date', 'desc'))).toEqual([
      'IMG1.jpg',
      'img10.jpg',
      'img100.jpg',
      'img2.jpg',
    ]);
  });

  it('should sort by size in both directions', () => {
    expect(names(sortFiles(photos, 'size', 'asc'))).toEqual([
      'IMG1.jpg',
      'img10.jpg',
      'img100.jpg',
      'img2.jpg',
    ]);
    expect(names(sortFiles(photos, 'size', 'desc'))).toEqual([
      'img2.jpg',
      'img100.jpg',
      'img10.jpg',
      'IMG1.jpg',
    ]);
  });

  it('should break ties by name', () => {
    const copied = [file('b10.jpg', 5), file('b2.jpg', 5), file('a.jpg', 9)];
    expect(names(sortFiles(copied, 'date', 'asc'))).toEqual([
      'b2.jpg',
      'b10.jpg',
      'a.jpg',
    ]);
  });

  it('should not mutate the input array', () => {
    const items = [file('b'), file('a')];
    sortFiles(items, 'name', 'asc');
    expect(names(items)).toEqual(['b', 'a']);
  });
});

describe('enableFileListSort', () => {
  const setup = () => {
    const row = document.createElement('div');
    row.append(
      document.createElement('button'),
      document.createElement('button')
    );
    document.body.appendChild(row);
    return row;
  };

  const toggle = (row: HTMLElement) =>
    row.querySelector<HTMLButtonElement>('.file-sort > button')!.click();

  const menuItems = (row: HTMLElement) =>
    Array.from(
      row.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')
    );

  const pick = (row: HTMLElement, label: string) => {
    toggle(row);
    menuItems(row)
      .find((item) => item.textContent === label)!
      .click();
  };

  it('should add one sort button at the end of the controls row', () => {
    const row = setup();
    enableFileListSort(row, [file('a'), file('b')], vi.fn());
    enableFileListSort(row, [file('a'), file('b')], vi.fn());

    expect(row.querySelectorAll('.file-sort')).toHaveLength(1);
    expect(row.lastElementChild?.classList.contains('file-sort')).toBe(true);
    expect(row.querySelector('i.ph-arrows-down-up')).not.toBeNull();
  });

  it('should list the fields, then the directions', () => {
    const row = setup();
    enableFileListSort(row, [file('a'), file('b')], vi.fn());
    toggle(row);

    expect(menuItems(row).map((item) => item.textContent)).toEqual([
      'None',
      'Name',
      'Modified date',
      'Size',
      'Ascending',
      'Descending',
    ]);
    expect(
      menuItems(row).map((item) => item.getAttribute('aria-checked'))
    ).toEqual(['true', 'false', 'false', 'false', 'true', 'false']);
  });

  it('should hide the button when there is nothing to sort', () => {
    const row = setup();
    enableFileListSort(row, [file('a')], vi.fn());
    const root = row.querySelector('.file-sort')!;
    expect(root.classList.contains('hidden')).toBe(true);

    enableFileListSort(row, [file('a'), file('b')], vi.fn());
    expect(root.classList.contains('hidden')).toBe(false);
  });

  it('should do nothing without a controls row', () => {
    expect(() => enableFileListSort(null, [file('a')], vi.fn())).not.toThrow();
  });

  it('should sort when a field is picked and re-sort on direction change', () => {
    const row = setup();
    const onSort = vi.fn();
    enableFileListSort(row, [file('10.jpg'), file('2.jpg')], onSort);

    pick(row, 'Name');
    expect(names(onSort.mock.calls[0][0])).toEqual(['2.jpg', '10.jpg']);

    pick(row, 'Descending');
    expect(names(onSort.mock.calls[1][0])).toEqual(['10.jpg', '2.jpg']);

    toggle(row);
    expect(
      menuItems(row).map((item) => item.getAttribute('aria-checked'))
    ).toEqual(['false', 'true', 'false', 'false', 'false', 'true']);
  });

  it('should restore the order files were added in', () => {
    const row = setup();
    const onSort = vi.fn();
    const added = [file('c'), file('a'), file('b')];
    enableFileListSort(row, added, onSort);
    pick(row, 'Name');

    const sorted = onSort.mock.calls[0][0];
    enableFileListSort(row, [sorted[2], sorted[0], sorted[1]], onSort);
    pick(row, 'None');
    expect(names(onSort.mock.calls[1][0])).toEqual(['c', 'a', 'b']);

    pick(row, 'Descending');
    expect(names(onSort.mock.calls[2][0])).toEqual(['b', 'a', 'c']);
  });

  it('should go back to the order added when the list is replaced', () => {
    const row = setup();
    enableFileListSort(row, [file('b'), file('a')], vi.fn());
    pick(row, 'Size');
    pick(row, 'Descending');

    enableFileListSort(row, [file('d'), file('c')], vi.fn());
    toggle(row);
    expect(
      menuItems(row).map((item) => item.getAttribute('aria-checked'))
    ).toEqual(['true', 'false', 'false', 'false', 'true', 'false']);
  });

  it('should close the menu on Escape', () => {
    const row = setup();
    enableFileListSort(row, [file('a'), file('b')], vi.fn());
    toggle(row);
    const menu = row.querySelector('[role="menu"]')!;
    expect(menu.classList.contains('hidden')).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(menu.classList.contains('hidden')).toBe(true);
        resolve();
      });
    });
  });

  it('should keep the chosen sort when the row is rebuilt', () => {
    const key = document.createElement('div');
    const files = [file('b'), file('a')];
    const first = setup();
    enableFileListSort(first, files, vi.fn(), key);
    pick(first, 'Name');

    const second = setup();
    const onSort = vi.fn();
    enableFileListSort(second, files, onSort, key);
    expect(second.querySelector('.file-sort')).not.toBeNull();

    pick(second, 'Descending');
    expect(names(onSort.mock.calls[0][0])).toEqual(['b', 'a']);
  });

  it('should sort the latest files after a re-render', () => {
    const row = setup();
    enableFileListSort(row, [file('a'), file('d')], vi.fn());
    const onSort = vi.fn();
    enableFileListSort(row, [file('c'), file('b')], onSort);

    pick(row, 'Name');
    expect(names(onSort.mock.calls[0][0])).toEqual(['b', 'c']);
  });
});

describe('itemsInListOrder', () => {
  const listOf = (...keys: string[]) => {
    const list = document.createElement('ul');
    for (const key of keys) {
      const row = document.createElement('li');
      row.dataset.fileName = key;
      list.appendChild(row);
    }
    return list;
  };

  it('should follow the order of the rendered rows after a drag', () => {
    const items = ['a.pdf', 'b.pdf', 'c.pdf'];
    expect(
      itemsInListOrder(listOf('2_c.pdf', '0_a.pdf', '1_b.pdf'), items)
    ).toEqual(['c.pdf', 'a.pdf', 'b.pdf']);
  });

  it('should keep the items when the list has not been rendered', () => {
    expect(itemsInListOrder(null, ['a', 'b'])).toEqual(['a', 'b']);
    expect(itemsInListOrder(listOf(), ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('should keep the items when the rows are out of date', () => {
    expect(itemsInListOrder(listOf('1_b', '0_a'), ['a', 'b', 'c'])).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(itemsInListOrder(listOf('0_a', '5_x'), ['a', 'b'])).toEqual([
      'a',
      'b',
    ]);
    expect(itemsInListOrder(listOf('0_a', '0_a'), ['a', 'b'])).toEqual([
      'a',
      'b',
    ]);
    expect(itemsInListOrder(listOf('x', '0_a'), ['a', 'b'])).toEqual([
      'a',
      'b',
    ]);
  });
});
