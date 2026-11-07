import { tesseractLanguages } from '../config/tesseract-languages.js';

import { trText } from '../i18n/i18n.js';

export const TESSERACT_AVAILABLE_LANGUAGES_ENV_KEY =
  'VITE_TESSERACT_AVAILABLE_LANGUAGES' as const;

type TesseractAvailabilityEnv = Partial<
  Pick<ImportMetaEnv, typeof TESSERACT_AVAILABLE_LANGUAGES_ENV_KEY>
>;

export type TesseractLanguageCode = keyof typeof tesseractLanguages;

function getDefaultEnv(): TesseractAvailabilityEnv {
  return import.meta.env;
}

function normalizeLanguageCodes(value: string | string[]): string[] {
  const rawCodes = Array.isArray(value) ? value : value.split(/[+,]/);
  const seen = new Set<string>();
  const normalizedCodes: string[] = [];

  for (const rawCode of rawCodes) {
    const code = rawCode.trim();
    if (!code || seen.has(code)) {
      continue;
    }
    seen.add(code);
    normalizedCodes.push(code);
  }

  return normalizedCodes;
}

function formatLanguageLabel(code: string): string {
  const label = tesseractLanguages[code as TesseractLanguageCode];
  return label ? `${label} (${code})` : code;
}

export function resolveConfiguredTesseractAvailableLanguages(
  env: TesseractAvailabilityEnv = getDefaultEnv()
): string[] | null {
  const configuredLanguages = env.VITE_TESSERACT_AVAILABLE_LANGUAGES?.trim();
  if (!configuredLanguages) {
    return null;
  }

  return normalizeLanguageCodes(configuredLanguages);
}

export function getAvailableTesseractLanguageEntries(
  env: TesseractAvailabilityEnv = getDefaultEnv()
): Array<[TesseractLanguageCode, string]> {
  const configuredLanguages = resolveConfiguredTesseractAvailableLanguages(env);
  const allEntries = Object.entries(tesseractLanguages) as Array<
    [TesseractLanguageCode, string]
  >;

  if (!configuredLanguages) {
    return allEntries;
  }

  const configuredSet = new Set(configuredLanguages);
  return allEntries.filter(([code]) => configuredSet.has(code));
}

export function getUnavailableTesseractLanguages(
  requestedLanguages: string | string[],
  env: TesseractAvailabilityEnv = getDefaultEnv()
): string[] {
  const configuredLanguages = resolveConfiguredTesseractAvailableLanguages(env);
  if (!configuredLanguages) {
    return [];
  }

  const configuredSet = new Set(configuredLanguages);
  return normalizeLanguageCodes(requestedLanguages).filter(
    (code) => !configuredSet.has(code)
  );
}

export function formatTesseractLanguageList(codes: string[]): string {
  return codes.map(formatLanguageLabel).join(', ');
}

function buildUnsupportedLanguageMessage(
  unavailableLanguages: string[],
  availableLanguages: string[]
): string {
  const unavailableText = formatTesseractLanguageList(unavailableLanguages);
  const availableText = formatTesseractLanguageList(availableLanguages);

  return [
    trText("يتضمن هذا الإصدار من Pixel PDF بيانات OCR للغات {{availableText}} فقط.", {
      availableText,
    }),
    trText(
      "لغة OCR المطلوبة غير متاحة: {{unavailableText}}.",
      { unavailableText }
    ),
    trText(
      "اختر إحدى اللغات المضمّنة أو أعد بناء الحزمة المعزولة عن الإنترنت مع إضافة اللغة الناقصة إلى --ocr-languages."
    ),
  ].join(' ');
}

export class UnsupportedOcrLanguageError extends Error {
  readonly unavailableLanguages: string[];
  readonly availableLanguages: string[];

  constructor(unavailableLanguages: string[], availableLanguages: string[]) {
    super(
      buildUnsupportedLanguageMessage(unavailableLanguages, availableLanguages)
    );
    this.name = 'UnsupportedOcrLanguageError';
    this.unavailableLanguages = unavailableLanguages;
    this.availableLanguages = availableLanguages;
  }
}

export function assertTesseractLanguagesAvailable(
  requestedLanguages: string | string[],
  env: TesseractAvailabilityEnv = getDefaultEnv()
): void {
  const availableLanguages = resolveConfiguredTesseractAvailableLanguages(env);
  if (!availableLanguages) {
    return;
  }

  const unavailableLanguages = getUnavailableTesseractLanguages(
    requestedLanguages,
    env
  );

  if (unavailableLanguages.length > 0) {
    throw new UnsupportedOcrLanguageError(
      unavailableLanguages,
      availableLanguages
    );
  }
}
