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
  moveItem,
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
