// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { hasForbiddenDash } from '../../scripts/house-style.mjs';

describe('hasForbiddenDash', () => {
  it('flags em and en dashes in BentoPDF wording', () => {
    expect(hasForbiddenDash('<p>Fast — and private</p>')).toBe(true);
    expect(hasForbiddenDash('<p>Pages 1–3</p>')).toBe(true);
    expect(hasForbiddenDash('<p>Fast, and private</p>')).toBe(false);
  });

  it('ignores dashes in a custom footer or brand name', () => {
    const footer = '© 2026 Acme – Internal tools';
    const html = `<title>Merge PDF | Acme — PDF</title><p>${footer}</p>`;

    expect(hasForbiddenDash(html, [footer])).toBe(true);
    expect(hasForbiddenDash(html, ['Acme — PDF', footer])).toBe(false);
  });

  it('ignores the HTML-escaped form of the custom text', () => {
    const footer = 'R&D – "Internal"';
    const html = '<p>R&amp;D – &quot;Internal&quot;</p>';

    expect(hasForbiddenDash(html, [footer])).toBe(false);
  });

  it('still flags BentoPDF dashes on a page with custom text', () => {
    const html = '<p>Acme – Internal</p><p>Merge — split</p>';

    expect(hasForbiddenDash(html, ['Acme – Internal'])).toBe(true);
  });

  it('skips unset custom values', () => {
    expect(hasForbiddenDash('<p>Plain</p>', [undefined, ''])).toBe(false);
  });
});
