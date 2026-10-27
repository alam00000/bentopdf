# Translations

Page text for the 23 non-English languages lives here. English stays in the HTML source; the build swaps in translations per language.

## Files

- `source.json`: every English text block found on the built pages. The key is a hash of the text, so changing an English sentence makes its old translations stop matching and that sentence shows in English until it is translated again.
- `pages.json`: which texts appear on which page. A page counts as translated in a language when at least 80% of its texts are translated (or `tools.json` has an entry for it). Translated pages get their own canonical URL and hreflang links, and are listed as language alternates of the English page in the sitemap.
- `<lang>/content.json`: hash to translation.
- `ui-source.json`: English interface messages used by the JavaScript (`trText`, `trHtml`). Translations are in `public/locales/<lang>/ui.json`, keyed by the English text.

Terms, Privacy and Licensing stay English; only their navbar and footer are translated. The blog stays English.

## Markup in texts

Links and formatting are replaced by numbered markers: `Read <1>the docs</1> <2/>`. A translation must keep every marker once. Text inside `<1>...</1>` is translated; `<2/>` is an icon or code and is copied. Interface messages use `{{name}}` variables instead.

## Refreshing after English changes

1. Build the site (`npm run build`, and once with `SIMPLE_MODE=true` into another folder).
2. `node scripts/extract-content-segments.mjs dist /path/to/simple-dist` rewrites `source.json` and `pages.json`.
3. `node scripts/extract-ui-strings.mjs` rewrites `ui-source.json`.
4. `node scripts/translations.mjs status` and `node scripts/ui-translations.mjs status` show what is missing per language.
5. `node scripts/translations.mjs chunk <workDir> --lang <lang>` writes chunks with only the texts still missing in that language (without `--lang` it writes every text). After translating, `node scripts/translations.mjs merge <lang> <workDir>/out/<lang>` validates and adds the new translations; it never overwrites an existing translation unless you pass `--replace`, and never deletes anything. `validate <lang>` re-checks a language at any time. Translations of texts that no longer exist in `source.json` are kept and reported as stale; `prune <lang>` removes them once you are sure the extraction was complete (both builds).

## Writing UI text in code

- Text shown by JavaScript goes through `trText('English text {{name}}', { name })` (plain text) or `trHtml` (inside `innerHTML` templates). `showAlert`, `showLoader`, `showAlertModal` and `showModal` translate their arguments themselves, so pass them plain string literals. For templates with values, use `trText` with `{{name}}` variables.
- Do not keep translated text in module-level constants: they are evaluated before the language loads. Build them inside a function that runs when the UI is drawn.
- Page setup code runs inside `onPageReady(...)` (from `src/js/i18n`), which waits for both the DOM and the translations.
- Code that runs in a Web Worker cannot use `trText`. Pass the translated templates in from the main thread (see `diffStrings` in `src/js/compare/worker-api.ts`).
- `src/tests/ui-text-i18n.test.ts` fails on raw English in the common UI sinks and when `ui-source.json` is out of date. Run `node scripts/extract-ui-strings.mjs` after changing UI text. `node scripts/raw-ui-text-scan.mjs` lists the offending lines.

## Docs

Docs translations are Markdown files in `docs/<lang>/`, with menu labels in `docs/.vitepress/i18n/<lang>.json`. See `scripts/docs-translations.mjs` (`check`, `localize`, `labels`). A language is only built into the docs when every English page has a translation. Set `DOCS_LANGUAGES=de,fr` (or `en` alone) to limit which languages are built.
