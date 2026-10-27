export function resolveTranslation(langResources, key) {
  let namespace = 'common';
  let keyPath = key;
  const colonIndex = key.indexOf(':');
  if (colonIndex !== -1) {
    namespace = key.slice(0, colonIndex);
    keyPath = key.slice(colonIndex + 1);
  }
  let node = langResources[namespace];
  for (const segment of keyPath.split('.')) {
    if (node == null || typeof node !== 'object') return null;
    node = node[segment];
  }
  return typeof node === 'string' && node ? node : null;
}

export function applyServerTranslations(document, langResources) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    const translation = resolveTranslation(langResources, key);
    if (translation) element.textContent = translation;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (!key) return;
    const translation = resolveTranslation(langResources, key);
    if (translation) element.setAttribute('placeholder', translation);
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (!key) return;
    const translation = resolveTranslation(langResources, key);
    if (translation) element.setAttribute('title', translation);
  });
}
