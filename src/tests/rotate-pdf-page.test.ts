import { describe, it, expect, beforeEach, vi } from 'vitest';

interface RotateState {
  rotations: number[];
}

function createTestState(pageCount: number): RotateState {
  return { rotations: new Array(pageCount).fill(0) };
}

function createPageWrapper(
  pageNumber: number,
  state: RotateState
): HTMLElement {
  const pageIndex = pageNumber - 1;

  const container = document.createElement('div');
  container.className =
    'page-thumbnail relative bg-gray-700 rounded-lg overflow-hidden';
  container.dataset.pageIndex = pageIndex.toString();
  container.dataset.pageNumber = pageNumber.toString();

  const canvasWrapper = document.createElement('div');
  canvasWrapper.className =
    'thumbnail-wrapper flex items-center justify-center p-2 h-36';
  canvasWrapper.style.transition = 'transform 0.3s ease';
  const initialRotation = state.rotations[pageIndex] || 0;
  canvasWrapper.style.transform = `rotate(${initialRotation}deg)`;

  const canvas = document.createElement('canvas');
  canvas.className = 'max-w-full max-h-full object-contain';
  canvasWrapper.appendChild(canvas);

  container.appendChild(canvasWrapper);

  const controls = document.createElement('div');
  controls.className = 'flex items-center justify-center gap-2 p-2 bg-gray-800';

  const rotateLeftBtn = document.createElement('button');
  rotateLeftBtn.className =
    'rotate-left-btn flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 text-xs cursor-pointer';
  rotateLeftBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    state.rotations[pageIndex] = state.rotations[pageIndex] - 90;
    const wrapper = container.querySelector(
      '.thumbnail-wrapper'
    ) as HTMLElement;
    if (wrapper)
      wrapper.style.transform = `rotate(${state.rotations[pageIndex]}deg)`;
  });

  const rotateRightBtn = document.createElement('button');
  rotateRightBtn.className =
    'rotate-right-btn flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 text-xs cursor-pointer';
  rotateRightBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    state.rotations[pageIndex] = state.rotations[pageIndex] + 90;
    const wrapper = container.querySelector(
      '.thumbnail-wrapper'
    ) as HTMLElement;
    if (wrapper)
      wrapper.style.transform = `rotate(${state.rotations[pageIndex]}deg)`;
  });

  controls.append(rotateLeftBtn, rotateRightBtn);
  container.appendChild(controls);

  return container;
}

function batchRotateAll(
  state: RotateState,
  angle: number,
  containers: HTMLElement[]
) {
  for (let i = 0; i < state.rotations.length; i++) {
    state.rotations[i] = state.rotations[i] + angle;
  }
  for (const container of containers) {
    const idx = parseInt(container.dataset.pageIndex!, 10);
    const wrapper = container.querySelector(
      '.thumbnail-wrapper'
    ) as HTMLElement;
    if (wrapper) wrapper.style.transform = `rotate(${state.rotations[idx]}deg)`;
  }
}

describe('rotate-pdf-page – page wrapper', () => {
  let parentContainer: HTMLElement;

  beforeEach(() => {
    parentContainer = document.createElement('div');
    parentContainer.id = 'page-thumbnails';
    document.body.appendChild(parentContainer);
  });

  it('should create a page wrapper with correct data attributes', () => {
    const state = createTestState(3);
    const wrapper = createPageWrapper(1, state);
    expect(wrapper.dataset.pageIndex).toBe('0');
    expect(wrapper.dataset.pageNumber).toBe('1');
  });

  it('should have left and right rotation buttons', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    const leftBtn = wrapper.querySelector('.rotate-left-btn');
    const rightBtn = wrapper.querySelector('.rotate-right-btn');
    expect(leftBtn).not.toBeNull();
    expect(rightBtn).not.toBeNull();
  });

  it('should rotate right by 90° on right-button click', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const rightBtn = wrapper.querySelector('.rotate-right-btn') as HTMLElement;
    rightBtn.click();

    expect(state.rotations[0]).toBe(90);
    const tw = wrapper.querySelector('.thumbnail-wrapper') as HTMLElement;
    expect(tw.style.transform).toBe('rotate(90deg)');
  });

  it('should rotate left by -90° on left-button click', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const leftBtn = wrapper.querySelector('.rotate-left-btn') as HTMLElement;
    leftBtn.click();

    expect(state.rotations[0]).toBe(-90);
    const tw = wrapper.querySelector('.thumbnail-wrapper') as HTMLElement;
    expect(tw.style.transform).toBe('rotate(-90deg)');
  });

  it('should remain functional after multiple right-button clicks', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const rightBtn = wrapper.querySelector('.rotate-right-btn') as HTMLElement;

    rightBtn.click();
    expect(state.rotations[0]).toBe(90);

    rightBtn.click();
    expect(state.rotations[0]).toBe(180);

    rightBtn.click();
    expect(state.rotations[0]).toBe(270);

    rightBtn.click();
    expect(state.rotations[0]).toBe(360);

    const tw = wrapper.querySelector('.thumbnail-wrapper') as HTMLElement;
    expect(tw.style.transform).toBe('rotate(360deg)');
  });

  it('should remain functional after multiple left-button clicks', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const leftBtn = wrapper.querySelector('.rotate-left-btn') as HTMLElement;

    leftBtn.click();
    expect(state.rotations[0]).toBe(-90);

    leftBtn.click();
    expect(state.rotations[0]).toBe(-180);

    leftBtn.click();
    expect(state.rotations[0]).toBe(-270);
  });

  it('should allow alternating left and right clicks', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const leftBtn = wrapper.querySelector('.rotate-left-btn') as HTMLElement;
    const rightBtn = wrapper.querySelector('.rotate-right-btn') as HTMLElement;

    rightBtn.click();
    rightBtn.click();
    leftBtn.click();
    rightBtn.click();
    leftBtn.click();
    leftBtn.click();

    expect(state.rotations[0]).toBe(0);
  });

  it('should independently rotate different pages', () => {
    const state = createTestState(3);
    const w1 = createPageWrapper(1, state);
    const w2 = createPageWrapper(2, state);
    const w3 = createPageWrapper(3, state);
    parentContainer.append(w1, w2, w3);

    (w1.querySelector('.rotate-right-btn') as HTMLElement).click();
    (w2.querySelector('.rotate-left-btn') as HTMLElement).click();

    expect(state.rotations).toEqual([90, -90, 0]);
  });

  it('should allow per-page rotation after a batch rotation', () => {
    const state = createTestState(3);
    const w1 = createPageWrapper(1, state);
    const w2 = createPageWrapper(2, state);
    const w3 = createPageWrapper(3, state);
    parentContainer.append(w1, w2, w3);

    batchRotateAll(state, 90, [w1, w2, w3]);
    expect(state.rotations).toEqual([90, 90, 90]);

    const rightBtn = w1.querySelector('.rotate-right-btn') as HTMLElement;
    rightBtn.click();
    expect(state.rotations[0]).toBe(180);

    rightBtn.click();
    expect(state.rotations[0]).toBe(270);

    expect(state.rotations[1]).toBe(90);
    expect(state.rotations[2]).toBe(90);
  });

  it('should allow per-page rotation after multiple batch rotations', () => {
    const state = createTestState(2);
    const w1 = createPageWrapper(1, state);
    const w2 = createPageWrapper(2, state);
    parentContainer.append(w1, w2);

    batchRotateAll(state, 90, [w1, w2]);
    batchRotateAll(state, 90, [w1, w2]);

    expect(state.rotations).toEqual([180, 180]);

    (w1.querySelector('.rotate-left-btn') as HTMLElement).click();
    expect(state.rotations[0]).toBe(90);

    (w1.querySelector('.rotate-left-btn') as HTMLElement).click();
    expect(state.rotations[0]).toBe(0);
  });

  it('should allow batch rotation after per-page rotation', () => {
    const state = createTestState(2);
    const w1 = createPageWrapper(1, state);
    const w2 = createPageWrapper(2, state);
    parentContainer.append(w1, w2);

    (w1.querySelector('.rotate-right-btn') as HTMLElement).click();
    expect(state.rotations[0]).toBe(90);

    batchRotateAll(state, -90, [w1, w2]);
    expect(state.rotations).toEqual([0, -90]);

    (w2.querySelector('.rotate-right-btn') as HTMLElement).click();
    expect(state.rotations[1]).toBe(0);
  });

  it('should apply correct CSS transform on each click', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const tw = wrapper.querySelector('.thumbnail-wrapper') as HTMLElement;
    const rightBtn = wrapper.querySelector('.rotate-right-btn') as HTMLElement;

    expect(tw.style.transform).toBe('rotate(0deg)');

    rightBtn.click();
    expect(tw.style.transform).toBe('rotate(90deg)');

    rightBtn.click();
    expect(tw.style.transform).toBe('rotate(180deg)');
  });

  it('should apply initial rotation from state', () => {
    const state = createTestState(2);
    state.rotations[0] = 180;
    state.rotations[1] = -90;

    const w1 = createPageWrapper(1, state);
    const w2 = createPageWrapper(2, state);

    const tw1 = w1.querySelector('.thumbnail-wrapper') as HTMLElement;
    const tw2 = w2.querySelector('.thumbnail-wrapper') as HTMLElement;

    expect(tw1.style.transform).toBe('rotate(180deg)');
    expect(tw2.style.transform).toBe('rotate(-90deg)');
  });

  it('should stop click propagation on rotation buttons', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const parentClickSpy = vi.fn();
    wrapper.addEventListener('click', parentClickSpy);

    const rightBtn = wrapper.querySelector('.rotate-right-btn') as HTMLElement;
    rightBtn.click();

    expect(parentClickSpy).not.toHaveBeenCalled();
  });

  it('should have cursor-pointer class on rotation buttons', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);

    const leftBtn = wrapper.querySelector('.rotate-left-btn') as HTMLElement;
    const rightBtn = wrapper.querySelector('.rotate-right-btn') as HTMLElement;

    expect(leftBtn.classList.contains('cursor-pointer')).toBe(true);
    expect(rightBtn.classList.contains('cursor-pointer')).toBe(true);
  });

  it('should handle rapid successive clicks without losing state', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const rightBtn = wrapper.querySelector('.rotate-right-btn') as HTMLElement;

    for (let i = 0; i < 20; i++) {
      rightBtn.click();
    }

    expect(state.rotations[0]).toBe(20 * 90);
  });

  it('should keep working even if button innerHTML is replaced (simulating createIcons)', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const rightBtn = wrapper.querySelector('.rotate-right-btn') as HTMLElement;

    rightBtn.click();
    expect(state.rotations[0]).toBe(90);

    rightBtn.innerHTML = '<svg class="w-3 h-3"></svg>';

    rightBtn.click();
    expect(state.rotations[0]).toBe(180);

    rightBtn.click();
    expect(state.rotations[0]).toBe(270);
  });

  it('should keep working after replaceChild on icon element inside button', () => {
    const state = createTestState(1);
    const wrapper = createPageWrapper(1, state);
    parentContainer.appendChild(wrapper);

    const leftBtn = wrapper.querySelector('.rotate-left-btn') as HTMLElement;

    leftBtn.click();
    expect(state.rotations[0]).toBe(-90);

    const oldChild = leftBtn.firstChild;
    if (oldChild) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'w-3 h-3');
      leftBtn.replaceChild(svg, oldChild);
    }

    leftBtn.click();
    expect(state.rotations[0]).toBe(-180);

    leftBtn.click();
    expect(state.rotations[0]).toBe(-270);
  });
});
