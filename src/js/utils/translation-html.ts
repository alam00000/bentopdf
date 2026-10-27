import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['br', 'strong', 'em'];

export function sanitizeTranslationHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
}
