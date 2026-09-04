// Merge performance baseline harness.
// Drives the BentoPDF merge-pdf page in a real browser (Playwright-core) against
// the examples/ corpus, measuring per-phase timing and recording outcomes
// (ok / hang / crash / corrupt / error-alert) plus (Chromium) main-thread JS heap.
//
// Usage:
//   node scripts/perf/merge-baseline.mjs [--browser chromium|firefox] [--combo "a,b|c,d"]
//
// Requires a running dev server on http://localhost:5173 and playwright-core
// (npm i --no-save playwright-core@1.62.1). Browsers resolve from the Playwright
// cache; override with CHROMIUM_PATH / FIREFOX_PATH env vars.

import { chromium, firefox } from 'playwright-core';
import {
  statSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  appendFileSync,
} from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'http://localhost:5173';
const OUT_DIR = resolve(ROOT, 'scripts/perf/results');

function progress(line) {
  const msg = `${new Date().toISOString()} ${line}`;
  console.log(msg);
  mkdirSync(OUT_DIR, { recursive: true });
  appendFileSync(resolve(OUT_DIR, 'run.log'), msg + '\n');
}

const FILES = {
  '100826WE': resolve(ROOT, 'examples/100826WE.pdf'),
  120826: resolve(ROOT, 'examples/120826.pdf'),
  170826: resolve(ROOT, 'examples/170826.pdf'),
  190826: resolve(ROOT, 'examples/190826.pdf'),
  sample: resolve(ROOT, 'src/tests/fixtures/sample.pdf'),
};

const BROWSERS = {
  chromium: {
    launch: () =>
      chromium.launch({
        ...(process.env.CHROMIUM_PATH
          ? { executablePath: process.env.CHROMIUM_PATH }
          : {}),
        headless: true,
        args: ['--no-sandbox'],
      }),
    hasMemory: true,
  },
  firefox: {
    launch: () =>
      firefox.launch({
        ...(process.env.FIREFOX_PATH
          ? { executablePath: process.env.FIREFOX_PATH }
          : {}),
        headless: true,
      }),
    hasMemory: false,
  },
};

function parseArgs(argv) {
  const args = { browser: 'chromium', combos: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--browser') args.browser = argv[++i];
    if (argv[i] === '--combo') args.combos = argv[++i];
  }
  if (!BROWSERS[args.browser])
    throw new Error('unknown browser: ' + args.browser);
  if (args.combos) {
    args.combos = args.combos
      .split('|')
      .map((c) => c.split(',').map((s) => s.trim()));
  } else {
    args.combos = [
      ['sample'],
      ['190826'],
      ['100826WE', '120826'],
      ['170826', '190826'],
      ['100826WE', '120826', '170826', '190826'],
    ];
  }
  return args;
}

async function measurePage(browser, comboKeys) {
  const combo = comboKeys.map((k) => ({
    key: k,
    name: k + '.pdf',
    path: FILES[k],
  }));
  for (const f of combo) {
    if (!existsSync(f.path)) throw new Error('missing file ' + f.path);
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  const consoleLines = [];
  const pageErrors = [];
  const workerErrors = [];
  const workerRequests = [];
  let crashed = false;

  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error' || /error|fail|out of memory|memory/i.test(t))
      consoleLines.push(t);
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('crash', () => {
    crashed = true;
  });
  page.on('request', (r) => {
    if (/coherent/i.test(r.url())) workerRequests.push(r.url());
  });
  page.on('worker', (w) => {
    w.on('console', (m) => {
      if (m.type() === 'error') workerErrors.push(m.text());
    });
    w.on('error', (e) => workerErrors.push(String(e)));
  });

  const mem = async () => {
    if (!BROWSERS[args.browser].hasMemory) return null;
    try {
      return await page.evaluate(() => {
        const m = performance.memory;
        return m ? Math.round(m.usedJSHeapSize / 1048576) : null; // MB
      });
    } catch {
      return null;
    }
  };

  const out = {
    combo: comboKeys.join('+'),
    browser: args.browser,
    phases: {},
    outcome: 'ok',
    downloadSize: null,
    cpdfUrls: [],
    memAfterLoadMB: null,
    memAfterMergeMB: null,
    consoleLines: [],
    pageErrors: [],
    workerErrors: [],
  };

  try {
    await page.goto(BASE + '/merge-pdf.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForSelector('#file-input', { timeout: 30000 });

    const tLoadStart = Date.now();
    await page.setInputFiles(
      '#file-input',
      combo.map((f) => f.path)
    );
    // Wait for upload processing to actually START: the change handler shows the loader.
    // Tolerant of fast loads: with the qpdf engine some combos process faster
    // than the loader's visible window, so don't fail the run when the loader
    // can't be caught — the ready-state wait below is the real gate.
    try {
      await page.waitForSelector('#loader-modal:not(.hidden)', {
        timeout: 3000,
      });
    } catch {
      progress('  (loader window already passed; relying on ready-state wait)');
    }
    // Then wait until loading fully done: loader hidden, files panel visible,
    // and the process button enabled. (Not checking these separately lets the
    // loader-hidden state race past the pre-upload moment — the button starts
    // inside #merge-options which is 'hidden' until files exist.
    await page.waitForFunction(
      () => {
        const b = document.getElementById('process-btn');
        const lm = document.getElementById('loader-modal');
        const mo = document.getElementById('merge-options');
        return (
          b &&
          !b.disabled &&
          (!lm || lm.classList.contains('hidden')) &&
          mo &&
          !mo.classList.contains('hidden')
        );
      },
      { timeout: 900000 }
    );
    out.phases.loadAndParseMs = Date.now() - tLoadStart;
    out.memAfterLoadMB = await mem();

    out.cpdfUrls = await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .map((r) => r.name)
        .filter((n) => /coherent/i.test(n))
    );
    // The merge worker runs in its own global: importScripts of cpdf won't show in the
    // main page's resource timing, so ask each worker about its own fetched scripts.
    for (const w of page.workers()) {
      try {
        const urls = await w.evaluate(() =>
          performance
            .getEntriesByType('resource')
            .map((r) => r.name)
            .filter((n) => /coherent/i.test(n))
        );
        out.cpdfUrls.push(...urls);
      } catch {
        /* worker may have terminated */
      }
    }
    out.cpdfUrls = [...new Set([...out.cpdfUrls, ...workerRequests])];

    progress(
      `  ${out.combo}: loaded+parsed in ${out.phases.loadAndParseMs}ms; clicking merge`
    );

    let dl = null;
    page.on('download', (d) => {
      if (!dl) dl = d;
    });

    const tMergeStart = Date.now();
    const maxWaitMs = 600000; // 10 min cap per merge
    await page.click('#process-btn');

    // Poll UI state instead of waiting blindly for a download: break early on
    // error-alert, crash, or loader-hide-without-download.
    while (Date.now() - tMergeStart < maxWaitMs) {
      if (crashed) {
        out.outcome = 'crash';
        break;
      }
      if (dl) {
        out.outcome = 'ok';
        break;
      }
      const state = await page
        .evaluate(() => {
          const lm = document.getElementById('loader-modal');
          const am = document.getElementById('alert-modal');
          return {
            loaderHidden: !lm || lm.classList.contains('hidden'),
            alertVisible: !!am && !am.classList.contains('hidden'),
            alertText:
              (document.getElementById('alert-title')?.textContent || '') +
              '|' +
              (document.getElementById('alert-message')?.textContent || ''),
          };
        })
        .catch(() => null);
      if (state && state.alertVisible) {
        if (/^success\|/i.test(state.alertText)) {
          // The success alert proves the merge produced output; the download
          // event may lag this poll by a tick — keep polling for it instead of
          // misclassifying as error-alert.
          if (!out.consoleLines.some((l) => l.startsWith('alert: Success'))) {
            out.consoleLines.push('alert: ' + state.alertText);
          }
        } else {
          out.outcome = 'error-alert';
          out.consoleLines.push('alert: ' + state.alertText);
          break;
        }
      }
      if (
        state &&
        !state.loaderHidden &&
        Date.now() - tMergeStart > 30000 &&
        (Date.now() - tMergeStart) % 30000 < 1000
      ) {
        progress(
          `  ${out.combo}: loader still visible at ${Date.now() - tMergeStart}ms`
        );
      }
      await page.waitForTimeout(1000);
    }
    if (out.outcome === 'ok' && dl) {
      out.phases.mergeMs = Date.now() - tMergeStart;
      const fail = await dl.failure().catch(() => null);
      if (fail) {
        out.outcome = 'corrupt';
        out.consoleLines.push('download failure: ' + fail);
      } else {
        const target = resolve(
          OUT_DIR,
          `dl-${out.browser}-${out.combo.replace(/\+/g, '_')}.pdf`
        );
        await dl.saveAs(target).catch(() => {});
        if (existsSync(target)) out.downloadSize = statSync(target).size;
        if (!out.downloadSize || out.downloadSize === 0)
          out.outcome = 'corrupt';
        else if (out.downloadSize < 1000) out.outcome = 'corrupt';
      }
      await page.waitForTimeout(500);
      const alertText = await page
        .evaluate(() => {
          const am = document.getElementById('alert-modal');
          if (!am || am.classList.contains('hidden')) return null;
          return (
            (document.getElementById('alert-title')?.textContent || '') +
            '|' +
            (document.getElementById('alert-message')?.textContent || '')
          );
        })
        .catch(() => null);
      if (alertText) out.consoleLines.push('alert: ' + alertText);
    } else if (out.outcome === 'ok' && !dl) {
      out.outcome =
        Date.now() - tMergeStart >= maxWaitMs ? 'hang' : 'no-download';
    }
    if (out.outcome === 'hang' || Date.now() - tMergeStart >= maxWaitMs) {
      const state = await page
        .evaluate(() => {
          const lm = document.getElementById('loader-modal');
          return { loaderHidden: !lm || lm.classList.contains('hidden') };
        })
        .catch(() => null);
      if (state && !state.loaderHidden)
        out.consoleLines.push('still loading after cap');
    }
    if (out.outcome === 'ok') out.phases.mergeMs = Date.now() - tMergeStart;
    out.memAfterMergeMB = await mem();
    progress(
      `  ${out.combo}: outcome=${out.outcome} merge=${out.phases.mergeMs ?? '—'}ms dl=${out.downloadSize ?? '—'}`
    );
  } catch (e) {
    if (crashed) out.outcome = 'crash';
    else {
      out.outcome = 'harness-error';
      out.consoleLines.push(String(e));
    }
  } finally {
    out.consoleLines = out.consoleLines.concat(
      pageErrors.map((p) => 'pageerror: ' + p)
    );
    out.workerErrors = workerErrors;
    await context.close();
  }
  return out;
}

function toTable(rows) {
  const head = [
    'combo',
    'browser',
    'load+parse(ms)',
    'merge(ms)',
    'outcome',
    'dl bytes',
    'mem after load(MB)',
    'mem after merge(MB)',
  ];
  const lines = [head.join(' | '), head.map(() => '---').join(' | ')];
  for (const r of rows) {
    lines.push(
      [
        r.combo,
        r.browser,
        r.phases.loadAndParseMs ?? '—',
        r.phases.mergeMs ?? '—',
        r.outcome,
        r.downloadSize ?? '—',
        r.memAfterLoadMB ?? '—',
        r.memAfterMergeMB ?? '—',
      ].join(' | ')
    );
  }
  return lines.join('\n');
}

const args = parseArgs(process.argv.slice(2));
mkdirSync(OUT_DIR, { recursive: true });

console.log(
  `Baseline run: browser=${args.browser} combos=${JSON.stringify(args.combos)}`
);
const rows = [];
for (const combo of args.combos) {
  console.log(`\n== ${args.browser} :: ${combo.join(' + ')} ==`);
  const browser = await BROWSERS[args.browser].launch();
  try {
    const r = await measurePage(browser, combo);
    console.log(JSON.stringify(r, null, 1));
    rows.push(r);
  } finally {
    await browser.close();
  }
}

const md = [
  '# Merge Baseline',
  '',
  `Run: ${new Date().toISOString()}  browser=${args.browser}`,
  '',
  toTable(rows),
  '',
  '## cpdf build(s) loaded (expected: none — merge runs on the qpdf engine)',
  ...[...new Set(rows.flatMap((r) => r.cpdfUrls))].map((u) => `- \`${u}\``),
  '',
  '## Notes per run',
  ...rows.map((r) => {
    const notes = [];
    if (r.workerErrors.length)
      notes.push(`worker errors: ${r.workerErrors.join('; ')}`);
    if (r.pageErrors.length)
      notes.push(`page errors: ${r.pageErrors.join('; ')}`);
    if (r.consoleLines.length)
      notes.push(`console: ${r.consoleLines.join('; ')}`);
    return `- **${r.combo} (${r.browser})**: ${notes.length ? notes.join(' ') : 'no extra notes'}`;
  }),
].join('\n');

const outFile = resolve(OUT_DIR, `baseline-${args.browser}.md`);
writeFileSync(outFile, md);
console.log(`\nWrote ${outFile}`);
