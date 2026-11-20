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
 */
export function hasForbiddenDash(html, customTexts = []) {
  let ownText = html;
  for (const text of customTexts.filter(Boolean)) {
    for (const form of new Set([text, escapeHtml(text)])) {
      ownText = ownText.split(form).join('');
    }
  }
  return DASH.test(ownText);
}
