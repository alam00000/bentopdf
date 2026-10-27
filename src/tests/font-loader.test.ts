import { afterEach, describe, expect, it, vi } from 'vitest';

import { getFontAssetFileName } from '../js/config/font-mappings';
import {
  fallbackFontLanguages,
  hasFallbackFonts,
  loadFallbackFonts,
  resolveFontUrl,
} from '../js/utils/font-loader';

describe('font-loader', () => {
  it('uses the default public font URL when no offline font base URL is configured', () => {
    expect(resolveFontUrl('Noto Sans', {})).toBe(
      'https://rawcdn.githack.com/googlefonts/noto-fonts/ffebf8c1ee449e544955a7e813c54f9b73848eac/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
    );
  });

  it('builds a self-hosted font URL when an OCR font base URL is configured', () => {
    expect(
      resolveFontUrl('Noto Naskh Arabic', {
        VITE_OCR_FONT_BASE_URL: 'https://internal.example.com/wasm/ocr/fonts/',
      })
    ).toBe(
      'https://internal.example.com/wasm/ocr/fonts/NotoNaskhArabic-Regular.ttf'
    );
  });

  it('derives the bundled font asset file name from the default font URL', () => {
    expect(getFontAssetFileName('Noto Sans SC')).toBe(
      'NotoSansCJKsc-Regular.otf'
    );
  });

  describe('fallback fonts', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('needs no font for text the standard fonts can encode', () => {
      expect(fallbackFontLanguages('Plain café š € “quotes”').size).toBe(0);
      expect([...fallbackFontLanguages('Příliš ŠĐČĆŽ')]).toEqual(['eng']);
    });

    it('downloads a missing font once and reports success', async () => {
      const fetchFont = vi.fn(async () => new Response(new Uint8Array([1])));
      vi.stubGlobal('fetch', fetchFont);
      const fonts = new Map<string, Uint8Array>();
      const results = await Promise.all([
        loadFallbackFonts(fonts, ['eng']),
        loadFallbackFonts(fonts, ['eng']),
      ]);
      expect(results).toEqual([true, true]);
      expect(fetchFont).toHaveBeenCalledTimes(1);
      expect(hasFallbackFonts(fonts, ['eng'])).toBe(true);
    });

    it('reports failure when only a substitute font arrives, then retries', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) =>
          url.includes('Arabic')
            ? Promise.reject(new Error('offline'))
            : new Response(new Uint8Array([1]))
        )
      );
      const fonts = new Map<string, Uint8Array>();
      expect(await loadFallbackFonts(fonts, ['ara'])).toBe(false);
      expect(hasFallbackFonts(fonts, ['ara'])).toBe(false);

      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(new Uint8Array([1])))
      );
      expect(await loadFallbackFonts(fonts, ['ara'])).toBe(true);
      expect(hasFallbackFonts(fonts, ['ara'])).toBe(true);
    });
  });
});
