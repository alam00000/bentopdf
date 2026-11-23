const DASH = /[—–]/;

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

const escapeHtml = (text) => text.replace(/[&<>"'`=]/g, (c) => HTML_ESCAPES[c]);

/**
 * The house style forbids em and en dashes in BentoPDF's own wording. Text a
 * self-hoster sets through VITE_BRAND_NAME or VITE_FOOTER_TEXT is theirs, so it
 * is left out of the check, both as written and as Handlebars escapes it.
 * Longer text goes first, so a footer that contains the brand name is removed
 * whole before the brand name alone.
 */
export function hasForbiddenDash(html, customTexts = []) {
  const forms = new Set(
    customTexts.filter(Boolean).flatMap((text) => [text, escapeHtml(text)])
  );
  let ownText = html;
  for (const form of [...forms].sort((a, b) => b.length - a.length)) {
    ownText = ownText.split(form).join('');
  }
  return DASH.test(ownText);
}
