import { describe, it, expect } from 'vitest';
import {
  textNeedsRtlFix,
  toVisualOrder,
} from '../js/utils/rtl-form-appearance';

describe('rtl-form-appearance', () => {
  it('only targets Hebrew values', () => {
    expect(textNeedsRtlFix('שלום')).toBe(true);
    expect(textNeedsRtlFix('Hello 123')).toBe(false);
    expect(textNeedsRtlFix('')).toBe(false);
    expect(textNeedsRtlFix(undefined)).toBe(false);
  });

  it('reorders pure Hebrew right-to-left', () => {
    const { visual, rtl } = toVisualOrder('שלום');
    expect(rtl).toBe(true);
    expect(visual).toBe('םולש');
  });

  it('keeps numbers and Latin runs left-to-right inside Hebrew', () => {
    expect(toVisualOrder('דירה 12').visual).toBe('12 הריד');
    expect(toVisualOrder('מייל: a@b.co').visual).toBe('a@b.co :ליימ');
  });

  it('mirrors brackets in RTL text', () => {
    expect(toVisualOrder('קומה (2)').visual).toBe('(2) המוק');
  });

  it('leaves LTR paragraphs alone', () => {
    const { visual, rtl } = toVisualOrder('Name: שי');
    expect(rtl).toBe(false);
    expect(visual).toBe('Name: יש');
  });
});
