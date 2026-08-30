const FONT_CDN =
  import.meta.env.VITE_EMBEDPDF_FONTS_URL ||
  'https://cdn.jsdelivr.net/npm/@embedpdf';

const CHARSET = {
  ANSI: 0,
  DEFAULT: 1,
  SHIFTJIS: 128,
  HANGEUL: 129,
  GB2312: 134,
  CHINESEBIG5: 136,
  GREEK: 161,
  TURKISH: 162,
  VIETNAMESE: 163,
  HEBREW: 177,
  ARABIC: 178,
  BALTIC: 186,
  RUSSIAN: 204,
  THAI: 222,
  EASTEUROPE: 238,
} as const;

const PACK = {
  jp: 'fonts-jp@1.0.0/fonts/NotoSansJP-Regular.otf',
  kr: 'fonts-kr@1.0.0/fonts/NotoSansKR-Regular.otf',
  sc: 'fonts-sc@1.0.0/fonts/NotoSansHans-Regular.otf',
  tc: 'fonts-tc@1.0.0/fonts/NotoSansHant-Regular.otf',
  arabic: 'fonts-arabic@1.0.0/fonts/NotoNaskhArabic-Regular.ttf',
  hebrew: 'fonts-hebrew@1.0.0/fonts/NotoSansHebrew-Regular.ttf',
  latin: 'fonts-latin@1.0.0/fonts/NotoSans-Regular.ttf',
} as const;

export const editorFontFallback = {
  baseUrl: FONT_CDN,
  fonts: {
    [CHARSET.SHIFTJIS]: PACK.jp,
    [CHARSET.HANGEUL]: PACK.kr,
    [CHARSET.GB2312]: PACK.sc,
    [CHARSET.CHINESEBIG5]: PACK.tc,
    [CHARSET.ARABIC]: PACK.arabic,
    [CHARSET.HEBREW]: PACK.hebrew,
    [CHARSET.GREEK]: PACK.latin,
    [CHARSET.TURKISH]: PACK.latin,
    [CHARSET.VIETNAMESE]: PACK.latin,
    [CHARSET.BALTIC]: PACK.latin,
    [CHARSET.RUSSIAN]: PACK.latin,
    [CHARSET.EASTEUROPE]: PACK.latin,
    [CHARSET.THAI]: PACK.latin,
    [CHARSET.ANSI]: PACK.latin,
    [CHARSET.DEFAULT]: PACK.latin,
  },
  defaultFont: PACK.latin,
};
