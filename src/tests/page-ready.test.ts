import { describe, it, expect, vi } from 'vitest';
import { onPageReady } from '../js/i18n/i18n';

describe('onPageReady', () => {
  it('runs the callback once translations and the DOM are ready', async () => {
    const callback = vi.fn();
    onPageReady(callback);
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
  });

  it('runs every registered callback exactly once', async () => {
    const first = vi.fn();
    const second = vi.fn();
    onPageReady(first);
    onPageReady(second);
    await vi.waitFor(() => {
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });
  });
});

describe('onPageReady file drops', () => {
  it('keeps the browser from opening a dropped file until the page is ready', async () => {
    let ready = false;
    onPageReady(() => {
      ready = true;
    });
    const early = new Event('drop', { cancelable: true });
    window.dispatchEvent(early);
    expect(ready).toBe(false);
    expect(early.defaultPrevented).toBe(true);

    await vi.waitFor(() => expect(ready).toBe(true));
    const late = new Event('drop', { cancelable: true });
    window.dispatchEvent(late);
    expect(late.defaultPrevented).toBe(false);
  });
});
