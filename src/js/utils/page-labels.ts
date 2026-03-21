import type { PageLabelStyleName } from '@/types';

export const PAGE_LABEL_STYLE_OPTIONS = [
  'DecimalArabic',
  'LowercaseRoman',
  'UppercaseRoman',
  'LowercaseLetters',
  'UppercaseLetters',
  'NoLabelPrefixOnly',
] as const satisfies readonly PageLabelStyleName[];

export type { PageLabelStyleName } from '@/types';

type CpdfLabelStyleSource = {
  decimalArabic: number;
  lowercaseRoman: number;
  uppercaseRoman: number;
  lowercaseLetters: number;
  uppercaseLetters: number;
  noLabelPrefixOnly?: number;
};

const NO_LABEL_PREFIX_ONLY_FALLBACK = 5 as CpdfLabelStyle;

export function resolvePageLabelStyle(
  cpdf: CpdfLabelStyleSource,
  style: PageLabelStyleName
): CpdfLabelStyle {
  switch (style) {
    case 'DecimalArabic':
      return cpdf.decimalArabic as CpdfLabelStyle;
    case 'LowercaseRoman':
      return cpdf.lowercaseRoman as CpdfLabelStyle;
    case 'UppercaseRoman':
      return cpdf.uppercaseRoman as CpdfLabelStyle;
    case 'LowercaseLetters':
      return cpdf.lowercaseLetters as CpdfLabelStyle;
    case 'UppercaseLetters':
      return cpdf.uppercaseLetters as CpdfLabelStyle;
    case 'NoLabelPrefixOnly':
      return (
        (cpdf.noLabelPrefixOnly as CpdfLabelStyle | undefined) ??
        NO_LABEL_PREFIX_ONLY_FALLBACK
      );
  }
}

export function normalizePageLabelStartValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(0, Math.floor(value));
}
