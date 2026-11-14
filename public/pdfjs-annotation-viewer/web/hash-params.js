// Provide a minimal HASH_PARAMS implementation expected by the
// pdfjs-annotation-extension bundle. It mirrors the core viewer's
// hash parsing behaviour enough to avoid runtime errors.
//
// This lives in its own same-origin file so the viewer can load it under a
// Content-Security-Policy that disallows inline scripts.
(function () {
  if (window.HASH_PARAMS) {
    return;
  }
  const hash = window.location.hash || '';
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  window.HASH_PARAMS = {
    get(name) {
      // Always return a string to avoid null/undefined consumers
      // calling .slice()/etc. on a non-string value.
      const v = params.get(name);
      return v == null ? '' : String(v);
    },
  };
})();
