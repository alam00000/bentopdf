import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  showLoader: vi.fn(),
}));

vi.mock('../js/ui.js', () => ({
  showLoader: mocks.showLoader,
  hideLoader: vi.fn(),
}));

import { showFileProgress } from '../js/utils/progress.js';

describe('showFileProgress', () => {
  beforeEach(() => {
    mocks.showLoader.mockClear();
  });

  it('shows the current file and total', () => {
    showFileProgress('Processing image', 3, 10);

    expect(mocks.showLoader).toHaveBeenCalledWith(
      'Processing image 3/10...',
      20
    );
  });

  it('reports completed work on the progress bar', () => {
    showFileProgress('Processing image', 1, 10);
    showFileProgress('Processing image', 10, 10);
    showFileProgress('Processing image', 2, 4);

    expect(mocks.showLoader).toHaveBeenNthCalledWith(
      1,
      'Processing image 1/10...',
      0
    );
    expect(mocks.showLoader).toHaveBeenNthCalledWith(
      2,
      'Processing image 10/10...',
      90
    );
    expect(mocks.showLoader).toHaveBeenNthCalledWith(
      3,
      'Processing image 2/4...',
      25
    );
  });

  it('never reports 100% while the last file is still being processed', () => {
    showFileProgress('Processing image', 3, 3);

    expect(mocks.showLoader).toHaveBeenCalledWith(
      'Processing image 3/3...',
      67
    );
  });

  it('clamps the current index to the total', () => {
    showFileProgress('Processing image', 12, 10);

    expect(mocks.showLoader).toHaveBeenCalledWith(
      'Processing image 10/10...',
      90
    );
  });

  it('always passes an integer percent', () => {
    showFileProgress('Processing image', 2, 3);

    const percent = mocks.showLoader.mock.calls[0][1] as number;
    expect(Number.isInteger(percent)).toBe(true);
  });

  it('does nothing for empty or invalid ranges', () => {
    showFileProgress('Processing image', 1, 0);
    showFileProgress('Processing image', 0, 10);
    showFileProgress('Processing image', -1, 10);
    showFileProgress('Processing image', 1, -10);
    showFileProgress('Processing image', Number.NaN, 10);
    showFileProgress('Processing image', 1, Number.NaN);

    expect(mocks.showLoader).not.toHaveBeenCalled();
  });
});
