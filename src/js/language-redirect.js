(function () {
  var script = document.currentScript;
  if (!script) return;
  var base = (script.getAttribute('data-base') || '/').replace(/\/?$/, '/');
  var languages = (script.getAttribute('data-languages') || '').split(',');
  var fallback = script.getAttribute('data-default-language') || 'en';
  var path = window.location.pathname;
  if (path + '/' === base) path = base;
  if (path.indexOf(base) !== 0) return;
  var rest = path.slice(base.length);
  var first = rest.split('/')[0];
  if (first === 'en' || languages.indexOf(first) !== -1) return;
  if (/^(blog|docs)(\/|$)/.test(rest)) return;

  var choice;
  try {
    choice = window.localStorage.getItem('bentopdf-language');
  } catch {
    choice = null;
  }

  function supported(code) {
    var lower = code.toLowerCase();
    if (/^zh-(tw|hk|mo|hant)/.test(lower)) return 'zh-TW';
    var primary = lower.split('-')[0];
    if (primary === 'en') return 'en';
    return languages.indexOf(primary) !== -1 ? primary : null;
  }

  function cameFromThisSite() {
    var origin = window.location.origin + '/';
    return document.referrer.slice(0, origin.length) === origin;
  }

  function detect() {
    var preferred = window.navigator.languages || [window.navigator.language];
    for (var i = 0; i < preferred.length; i++) {
      if (!preferred[i]) continue;
      var match = supported(preferred[i]);
      if (match) return match;
    }
    return languages.indexOf(fallback) !== -1 ? fallback : 'en';
  }

  var target = null;
  if (choice) {
    if (languages.indexOf(choice) !== -1) target = choice;
  } else if ((rest === '' || rest === 'index.html') && !cameFromThisSite()) {
    target = detect();
  }
  if (!target || target === 'en') return;

  var page = rest === 'index.html' ? '' : rest;
  window.location.replace(
    base +
      target +
      (page ? '/' + page : '') +
      window.location.search +
      window.location.hash
  );
})();
