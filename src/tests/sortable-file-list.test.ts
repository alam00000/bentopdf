import { describe, it, expect, vi, beforeEach } from 'vitest';

const { createMock, optionMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  optionMock: vi.fn(),
}));

vi.mock('sortablejs', () => ({
  default: { create: createMock },
}));

import {
  addFilesSorted,
  createDragHandle,
  enableFileListReorder,
  itemsInListOrder,
  moveItem,
  sortByName,
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

const named = (...names: string[]) => names.map((name) => ({ name }));
const names = (items: { name: string }[]) => items.map((item) => item.name);

describe('sortByName', () => {
  it('should sort numbers by value, not character by character', () => {
    expect(
      names(
        sortByName(named('img10.jpg', 'img2.jpg', 'img1.jpg', 'img100.jpg'))
      )
    ).toEqual(['img1.jpg', 'img2.jpg', 'img10.jpg', 'img100.jpg']);
  });

  it('should ignore letter case', () => {
    expect(names(sortByName(named('b.jpg', 'A.jpg', 'c.jpg')))).toEqual([
      'A.jpg',
      'b.jpg',
      'c.jpg',
    ]);
  });

  it('should not mutate the input array', () => {
    const items = named('b', 'a');
    sortByName(items);
    expect(names(items)).toEqual(['b', 'a']);
  });
});

describe('addFilesSorted', () => {
  it('should sort the whole list when it has not been reordered', () => {
    const first = addFilesSorted([], named('3.jpg', '1.jpg'));
    expect(names(addFilesSorted(first, named('2.jpg', '10.jpg')))).toEqual([
      '1.jpg',
      '2.jpg',
      '3.jpg',
      '10.jpg',
    ]);
  });

  it('should keep a manual order and append new files sorted', () => {
    const manual = named('7.jpg', '1.jpg', '2.jpg');
    expect(names(addFilesSorted(manual, named('9.jpg', '3.jpg')))).toEqual([
      '7.jpg',
      '1.jpg',
      '2.jpg',
      '3.jpg',
      '9.jpg',
    ]);
  });

  it('should treat duplicate names as already sorted', () => {
    const existing = named('a.jpg', 'A.jpg');
    expect(names(addFilesSorted(existing, named('0.jpg')))).toEqual([
      '0.jpg',
      'a.jpg',
      'A.jpg',
    ]);
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

  it('should combine with addFilesSorted to keep a dragged order', () => {
    const items = named('1.pdf', '2.pdf', '10.pdf');
    const dragged = itemsInListOrder(
      listOf('2_10.pdf', '0_1.pdf', '1_2.pdf'),
      items
    );
    expect(names(addFilesSorted(dragged, named('9.pdf', '3.pdf')))).toEqual([
      '10.pdf',
      '1.pdf',
      '2.pdf',
      '3.pdf',
      '9.pdf',
    ]);
  });
});
