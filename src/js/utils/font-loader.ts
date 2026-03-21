import {
  getFontAssetFileName,
  getFontUrlForFamily,
  languageToFontFamily,
} from '../config/font-mappings.js';

const fontCache: Map<string, ArrayBuffer> = new Map();

const DB_NAME = 'bentopdf-fonts';
const DB_VERSION = 1;
const STORE_NAME = 'fonts';

type OcrFontEnv = Partial<Pick<ImportMetaEnv, 'VITE_OCR_FONT_BASE_URL'>>;

function getDefaultFontEnv(): OcrFontEnv {
  return import.meta.env;
}

function normalizeFontBaseUrl(url?: string): string | undefined {
  const trimmed = url?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\/+$/, '');
}

export function resolveFontUrl(
  fontFamily: string,
  env: OcrFontEnv = getDefaultFontEnv()
): string {
  const fontBaseUrl = normalizeFontBaseUrl(env.VITE_OCR_FONT_BASE_URL);

  if (fontBaseUrl) {
    return `${fontBaseUrl}/${getFontAssetFileName(fontFamily)}`;
  }

  return getFontUrlForFamily(fontFamily);
}

async function openFontDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getCachedFontFromDB(
  fontFamily: string
): Promise<ArrayBuffer | null> {
  try {
    const db = await openFontDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(fontFamily);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB read failed:', error);
    return null;
  }
}

async function saveFontToDB(
  fontFamily: string,
  fontBuffer: ArrayBuffer
): Promise<void> {
  try {
    const db = await openFontDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(fontBuffer, fontFamily);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB write failed:', error);
  }
}

export async function getFontForLanguage(lang: string): Promise<ArrayBuffer> {
  const fontFamily = languageToFontFamily[lang] || 'Noto Sans';

  if (fontCache.has(fontFamily)) {
    return fontCache.get(fontFamily)!;
  }
  const cachedFont = await getCachedFontFromDB(fontFamily);
  if (cachedFont) {
    fontCache.set(fontFamily, cachedFont);
    return cachedFont;
  }

  try {
    const fontUrl = resolveFontUrl(fontFamily);

    const fontResponse = await fetch(fontUrl);

    if (!fontResponse.ok) {
      throw new Error(`Failed to fetch font file: ${fontResponse.statusText}`);
    }

    const fontBuffer = await fontResponse.arrayBuffer();

    fontCache.set(fontFamily, fontBuffer);
    await saveFontToDB(fontFamily, fontBuffer);

    return fontBuffer;
  } catch (error) {
    console.warn(
      `Failed to fetch font for ${lang} (${fontFamily}), falling back to default.`,
      error
    );

    if (fontFamily !== 'Noto Sans') {
      return await getFontForLanguage('eng');
    }

    throw error;
  }
}

export function detectScripts(text: string): string[] {
  const scripts = new Set<string>();

  // Japanese: Hiragana (\u3040-\u309F) & Katakana (\u30A0-\u30FF)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    scripts.add('jpn');
  }

  // Korean: Hangul Syllables (\uAC00-\uD7A3) & Jamo (\u1100-\u11FF)
  if (/[\uAC00-\uD7A3\u1100-\u11FF]/.test(text)) {
    scripts.add('kor');
  }

  // Chinese: CJK Unified Ideographs (\u4E00-\u9FFF) & Ext A (\u3400-\u4DBF)
  if (/[\u4E00-\u9FFF\u3400-\u4DBF]/.test(text)) {
    scripts.add('chi_sim');
  }

  // Check for Arabic
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text)) {
    scripts.add('ara');
  }

  // Check for Devanagari (Hindi, Marathi, etc.)
  if (/[\u0900-\u097F]/.test(text)) scripts.add('hin');

  // Check for Bengali
  if (/[\u0980-\u09FF]/.test(text)) scripts.add('ben');

  // Check for Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) scripts.add('tam');

  // Check for Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) scripts.add('tel');

  // Check for Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) scripts.add('kan');

  // Check for Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) scripts.add('mal');

  // Check for Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) scripts.add('guj');

  // Check for Punjabi (Gurmukhi)
  if (/[\u0A00-\u0A7F]/.test(text)) scripts.add('pan');

  // Check for Oriya
  if (/[\u0B00-\u0B7F]/.test(text)) scripts.add('ori');

  // Check for Sinhala
  if (/[\u0D80-\u0DFF]/.test(text)) scripts.add('sin');

  // Check for Thai
  if (/[\u0E00-\u0E7F]/.test(text)) scripts.add('tha');

  // Check for Lao
  if (/[\u0E80-\u0EFF]/.test(text)) scripts.add('lao');

  // Check for Khmer
  if (/[\u1780-\u17FF]/.test(text)) scripts.add('khm');

  // Check for Myanmar
  if (/[\u1000-\u109F]/.test(text)) scripts.add('mya');

  // Check for Tibetan
  if (/[\u0F00-\u0FFF]/.test(text)) scripts.add('bod');

  // Check for Georgian
  if (/[\u10A0-\u10FF]/.test(text)) scripts.add('kat');

  // Check for Armenian
  if (/[\u0530-\u058F]/.test(text)) scripts.add('hye');

  // Check for Hebrew
  if (/[\u0590-\u05FF]/.test(text)) scripts.add('heb');

  // Check for Ethiopic
  if (/[\u1200-\u137F]/.test(text)) scripts.add('amh');

  // Check for Cherokee
  if (/[\u13A0-\u13FF]/.test(text)) scripts.add('chr');

  // Check for Syriac
  if (/[\u0700-\u074F]/.test(text)) scripts.add('syr');

  if (scripts.size === 0 || /[a-zA-Z]/.test(text)) {
    scripts.add('eng');
  }

  return Array.from(scripts);
}

export function getLanguageForChar(char: string): string {
  const code = char.charCodeAt(0);

  // Latin (Basic + Supplement + Extended)
  if (code <= 0x024f) return 'eng';

  // Japanese: Hiragana & Katakana
  if (
    (code >= 0x3040 && code <= 0x309f) || // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) // Katakana
  )
    return 'jpn';

  // Korean: Hangul Syllables & Jamo
  if (
    (code >= 0xac00 && code <= 0xd7a3) || // Hangul Syllables
    (code >= 0x1100 && code <= 0x11ff) // Hangul Jamo
  )
    return 'kor';

  // Chinese: CJK Unified Ideographs (Han)
  if (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified
    (code >= 0x3400 && code <= 0x4dbf) // CJK Ext A
  )
    return 'chi_sim';

  // Arabic
  if (
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0x0750 && code <= 0x077f) ||
    (code >= 0x08a0 && code <= 0x08ff)
  )
    return 'ara';

  // Devanagari
  if (code >= 0x0900 && code <= 0x097f) return 'hin';

  // Bengali
  if (code >= 0x0980 && code <= 0x09ff) return 'ben';

  // Tamil
  if (code >= 0x0b80 && code <= 0x0bff) return 'tam';

  // Telugu
  if (code >= 0x0c00 && code <= 0x0c7f) return 'tel';

  // Kannada
  if (code >= 0x0c80 && code <= 0x0cff) return 'kan';

  // Malayalam
  if (code >= 0x0d00 && code <= 0x0d7f) return 'mal';

  // Gujarati
  if (code >= 0x0a80 && code <= 0x0aff) return 'guj';

  // Punjabi (Gurmukhi)
  if (code >= 0x0a00 && code <= 0x0a7f) return 'pan';

  // Oriya
  if (code >= 0x0b00 && code <= 0x0b7f) return 'ori';

  // Sinhala
  if (code >= 0x0d80 && code <= 0x0dff) return 'sin';

  // Thai
  if (code >= 0x0e00 && code <= 0x0e7f) return 'tha';

  // Lao
  if (code >= 0x0e80 && code <= 0x0eff) return 'lao';

  // Khmer
  if (code >= 0x1780 && code <= 0x17ff) return 'khm';

  // Myanmar
  if (code >= 0x1000 && code <= 0x109f) return 'mya';

  // Tibetan
  if (code >= 0x0f00 && code <= 0x0fff) return 'bod';

  // Georgian
  if (code >= 0x10a0 && code <= 0x10ff) return 'kat';

  // Armenian
  if (code >= 0x0530 && code <= 0x058f) return 'hye';

  // Hebrew
  if (code >= 0x0590 && code <= 0x05ff) return 'heb';

  // Ethiopic
  if (code >= 0x1200 && code <= 0x137f) return 'amh';

  // Cherokee
  if (code >= 0x13a0 && code <= 0x13ff) return 'chr';

  // Syriac
  if (code >= 0x0700 && code <= 0x074f) return 'syr';

  // Default to English (Latin)
  return 'eng';
}
