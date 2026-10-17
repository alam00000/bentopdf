import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetState } from '../js/logic/crop-pdf-page.ts';

// Test resetState function for cropping
describe('resetState', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('scrolls the page to the top after resetting', () => {
    resetState();

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });
});
