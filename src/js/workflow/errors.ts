import { t } from '../i18n/i18n';

export function wfError(
  key: string,
  params?: Record<string, string | number>
): string {
  return t(`tools:pdfWorkflow.errors.${key}`, params);
}
