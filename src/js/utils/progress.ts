import { showLoader } from '../ui.js';
import { trText } from '../i18n/i18n.js';

const clampPercent = (value: number): number =>
  Math.min(99, Math.max(0, Math.round(value)));

/**
 * Reports per-file progress in the shared loader, e.g. "Processing image 3/10...".
 *
 * `current` is 1-based. The progress bar reflects *completed* work: the first
 * file shows 0% and the last one starts at ((total - 1) / total) * 100, so the
 * bar never reads 100% while a file is still being processed.
 */
export function showFileProgress(
  label: string,
  current: number,
  total: number
): void {
  if (!Number.isFinite(current) || !Number.isFinite(total)) return;

  const safeTotal = Math.floor(total);
  if (safeTotal <= 0 || current <= 0) return;

  const safeCurrent = Math.min(Math.floor(current), safeTotal);

  showLoader(
    trText('{{label}} {{current}}/{{total}}...', {
      label: trText(label),
      current: safeCurrent,
      total: safeTotal,
    }),
    clampPercent(((safeCurrent - 1) / safeTotal) * 100)
  );
}
