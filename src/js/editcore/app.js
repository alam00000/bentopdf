window.addEventListener('error', (e) => {
  if (!document.title.startsWith('E2E') && !document.title.startsWith('REPRO'))
    document.title =
      'JSERROR: ' +
      e.message +
      ' @' +
      (e.filename || '').split('/').pop() +
      ':' +
      e.lineno;
});
window.addEventListener('unhandledrejection', (e) => {
  document.title =
    'UNHANDLED: ' +
    ((e.reason && (e.reason.stack || e.reason.message)) || e.reason);
});
import { PdfEngine, OBJ } from './core.js';
import { applyTagSurgery } from './tagsurgery.js';
import { pageHasPatternFill, protectPatternArtwork } from './shadingsurgery.js';
import {
  protectType3Text,
  protectFragileText,
  consolidateContentArrays,
} from './type3surgery.js';

const $ = (id) => document.getElementById(id);
const state = {
  engine: null,
  docEpoch: 0,
  textSel: null,
  zoom: 1,
  tool: 'edit',
  editScope: 'all',
  notifiedSubs: new Set(),
  docInfo: null,
  pdfa: false,
  guides: { v: [], h: [] },
  paragraphs: [],
  selection: null,
  editing: null,
  dirty: false,
  fileName: 'document.pdf',
  undo: [],
  redo: [],
};
const MAX_UNDO = 20;
const MAX_UNDO_BYTES = 256 << 20;
const INCREMENTAL_SNAPSHOT_LIMIT = 12 << 20;

function pushUndo(entry) {
  state.undo.push(entry);
  if (state.undo.length > MAX_UNDO) state.undo.shift();
  let held = 0;
  for (let i = state.undo.length - 1; i >= 0; i--) {
    held += state.undo[i].bytes?.length || 0;
    if (held > MAX_UNDO_BYTES && i > 0) {
      state.undo.splice(0, i);
      break;
    }
  }
  state.redo = [];
}

const WEB_FALLBACK = (family, kind) => {
  if (kind === 'mono') return `"${family}", 'Courier New', monospace`;
  if (kind === 'serif') return `"${family}", 'Times New Roman', Times, serif`;
  const f = (family || '').toLowerCase();
  if (f.includes('georgia')) return "Georgia, 'Times New Roman', serif";
  if (f.includes('courier') || f.includes('mono'))
    return "'Courier New', monospace";
  if (
    f.includes('times') ||
    f.includes('serif') ||
    f.includes('roman') ||
    f.includes('minion') ||
    f.includes('garamond') ||
    f.includes('book')
  )
    return "'Times New Roman', Times, serif";
  if (family && !/helvetica|arial/i.test(family))
    return `"${family}", Helvetica, Arial, sans-serif`;
  return 'Helvetica, Arial, sans-serif';
};

const rgbaToCss = (n) =>
  `rgba(${(n >>> 24) & 255}, ${(n >>> 16) & 255}, ${(n >>> 8) & 255}, ${(n & 255) / 255})`;
const cssHexToRgba = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0;
};
const rgbaToHex = (n) => {
  const c = (v) => v.toString(16).padStart(2, '0');
  return '#' + c((n >>> 24) & 255) + c((n >>> 16) & 255) + c((n >>> 8) & 255);
};

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), 2200);
}

const P = () => state.engine;
const paraRectView = (box) => ({
  x: box.x * state.zoom,
  y: (P().pageHeight - box.top) * state.zoom,
  w: box.w * state.zoom,
  h: box.h * state.zoom,
});

const rotRad = (para) => ((para?.rotation || 0) * Math.PI) / 180;
const toPage = (e) => {
  const rect = $('page').getBoundingClientRect();
  return {
    px: (e.clientX - rect.left) / state.zoom,
    py: P().pageHeight - (e.clientY - rect.top) / state.zoom,
  };
};

const textToPage = (para, x, y) => {
  const t = rotRad(para);
  if (!t) return { x, y };
  const c = Math.cos(t),
    s = Math.sin(t);
  return { x: x * c - y * s, y: x * s + y * c };
};
const pageToText = (para, x, y) => {
  const t = rotRad(para);
  if (!t) return { x, y };
  const c = Math.cos(t),
    s = Math.sin(t);
  return { x: x * c + y * s, y: -x * s + y * c };
};
const paraPlacement = (para) => {
  const b = para.box;
  const tl = textToPage(para, b.x, b.top);
  return {
    x: tl.x * state.zoom,
    y: (P().pageHeight - tl.y) * state.zoom,
    w: b.w * state.zoom,
    h: b.h * state.zoom,
    deg: -(para.rotation || 0),
  };
};
const BOX_PAD = 0;
const applyPlacement = (el, pl, out = 0) => {
  Object.assign(el.style, {
    left: pl.x - out + 'px',
    top: pl.y - out + 'px',
    width: pl.w + 2 * out + 'px',
    height: pl.h + 2 * out + 'px',
  });
  if (pl.deg) {
    el.style.transform = `rotate(${pl.deg}deg)`;
    el.style.transformOrigin = '0 0';
  }
};
const EDITOR_PAD = 2;
function positionWrap(el, para) {
  const pl = paraPlacement(para);
  el.style.left = pl.x + 'px';
  el.style.top = pl.y + 'px';
  el.style.transformOrigin = '0 0';
  el.style.transform = pl.deg
    ? `rotate(${pl.deg}deg) translate(${-EDITOR_PAD}px, ${-EDITOR_PAD}px)`
    : `translate(${-EDITOR_PAD}px, ${-EDITOR_PAD}px)`;
}
const objRectView = (b) => ({
  x: b.x * state.zoom,
  y: (P().pageHeight - (b.y + b.h)) * state.zoom,
  w: b.w * state.zoom,
  h: b.h * state.zoom,
});

let engineReadyResolve;
const engineReady = new Promise((resolve) => {
  engineReadyResolve = resolve;
});

(async function init() {
  try {
    state.engine = await PdfEngine.create();
  } catch (e) {
    toast('Failed to load the WASM engine: ' + e.message);
    engineReadyResolve(false);
    return;
  }
  engineReadyResolve(true);
  wireUI();
  const params = new URLSearchParams(location.search);
  const trace = params.get('trace')
    ? (m) => {
        document.title = 'TRACE ' + m;
      }
    : () => {};
  trace('wired');
  const demo = params.get('demo');
  if (demo) {
    try {
      trace('fetching ' + demo);
      const bytes = new Uint8Array(await (await fetch(demo)).arrayBuffer());
      trace('fetched ' + bytes.length);
      const file = new File([bytes], demo.split('/').pop() || 'demo.pdf', {
        type: 'application/pdf',
      });
      await openFile(file, demo, bytes);
      trace('opened');
    } catch (e) {
      trace('openfail ' + e.message);
      toast('Demo load failed: ' + e.message);
    }
  }
  const wantPage = parseInt(params.get('page') || '', 10);
  if (demo && wantPage >= 1) {
    try {
      goToPage(wantPage - 1);
    } catch {}
  }
  if (params.get('e2e') && demo) runE2E();
  if (params.get('undotrace')) window.__undoTrace = true;
  if (params.get('repro') && demo) setTimeout(runRepro, 300);
  const eo = params.get('editopen');
  const typein = params.get('typein');
  const pg = parseInt(params.get('pg') || '0', 10);
  if (pg > 1 && demo)
    setTimeout(() => {
      goToPage(pg - 1);
    }, 200);
  if (eo && demo)
    setTimeout(() => {
      setTool('edit');
      const eds = state.paragraphs.filter((q) => q.editable);
      const p =
        eo === '#L'
          ? eds
              .slice()
              .sort(
                (a, b) =>
                  b.runs.map((r) => r.text).join('').length -
                  a.runs.map((r) => r.text).join('').length
              )[0]
          : eds.find((q) =>
              q.runs
                .map((r) => r.text)
                .join('')
                .includes(eo)
            );
      if (p) beginEdit(p);
      if (p && typein)
        setTimeout(() => {
          const ed2 = state.editing?.editable;
          if (!ed2) return;
          ed2.focus();
          const caretAt = params.get('caret');
          if (caretAt != null && state.editing?.locked) {
            lockedCaretSet(ed2, Math.max(0, parseInt(caretAt, 10) || 0));
          }
          for (const piece of typein.split(/(\n|\b)/)) {
            if (piece === '\n') {
              ed2.dispatchEvent(
                new KeyboardEvent('keydown', {
                  key: 'Enter',
                  bubbles: true,
                  cancelable: true,
                })
              );
            } else if (piece === '\b') {
              const kd = new KeyboardEvent('keydown', {
                key: 'Backspace',
                bubbles: true,
                cancelable: true,
              });
              ed2.dispatchEvent(kd);
              if (!kd.defaultPrevented) document.execCommand('delete');
            } else if (piece) {
              document.execCommand('insertText', false, piece);
            }
          }
          if (params.get('delcommit'))
            setTimeout(() => {
              const eng = P();
              const orig = eng.commitParagraph.bind(eng);
              let reply = null;
              eng.commitParagraph = (...a) => {
                reply = orig(...a);
                return reply;
              };
              endEdit(true);
              eng.commitParagraph = orig;
              const hx = (t) =>
                [...t].map((c) => c.codePointAt(0).toString(16)).join(' ');
              const d = document.createElement('pre');
              d.id = 'devout';
              d.textContent =
                'surgical=' +
                !!(reply && reply.surgical) +
                ' reply=' +
                (reply ? 'ok' : 'null') +
                '\n' +
                state.paragraphs
                  .map((q) => hx(q.runs.map((r) => r.text).join('')))
                  .join('\n');
              document.body.appendChild(d);
            }, 900);
          if (params.get('probeshift')) {
            const samples = [];
            const t0 = performance.now();
            const tick = () => {
              const ed3 = state.editing?.editable;
              if (ed3) {
                const r = document.createRange();
                const tw = document.createTreeWalker(ed3, NodeFilter.SHOW_TEXT);
                let first = null;
                while (tw.nextNode()) {
                  const tx = tw.currentNode;
                  if (tx.data && tx.data.replace(/​/g, '').trim()) {
                    first = tx;
                    break;
                  }
                }
                if (first) {
                  r.selectNodeContents(first);
                  const rect = r.getBoundingClientRect();
                  const wrap = state.editing.el.getBoundingClientRect();
                  samples.push(
                    `${Math.round(performance.now() - t0)}ms glyph=${rect.left.toFixed(1)},${rect.top.toFixed(1)} wrap=${wrap.left.toFixed(1)},${wrap.top.toFixed(1)}`
                  );
                }
              }
              if (performance.now() - t0 < 1600) setTimeout(tick, 120);
              else {
                const d = document.createElement('pre');
                d.id = 'shiftprobe';
                d.textContent = samples.join('\n');
                document.body.appendChild(d);
              }
            };
            tick();
          }
        }, 600);
    }, 300);
  const ue = params.get('undoshot');
  if (ue && demo)
    setTimeout(() => {
      if (ue === 'before') return;
      const p = state.paragraphs.find(
        (q) =>
          q.editable &&
          !q.rotation &&
          q.runs.map((r) => r.text).join('').length > 20
      );
      if (!p) return;
      const runs = p.runs.map((r, i) => ({
        ...r,
        rgba: r.rgba >>> 0,
        sourceIndex: i,
      }));
      runs[runs.length - 1] = {
        ...runs[runs.length - 1],
        text: runs[runs.length - 1].text + ' q1',
      };
      snapshotEdit('edit text', p);
      const u = P().commitParagraph(p.id, runs, p.format);
      if (u) replaceParagraph(p.id, u);
      refreshAfterMutation();
      setTimeout(() => {
        restore(state.undo, state.redo);
        renderPage();
      }, 300);
    }, 700);
  if (params.get('spell') && demo)
    setTimeout(() => {
      spellStart();
    }, 700);
  const tsel = params.get('textsel');
  if (tsel && demo)
    setTimeout(() => {
      const H = P().pageHeight,
        W = P().pageWidth;
      const sel = P().selectText(
        0,
        H * 0.98,
        W,
        H * 0.55,
        tsel === 'rect' ? 1 : 0
      );
      showTextSelection(sel);
    }, 600);
  const lrep = params.get('lines');
  if (lrep && demo)
    setTimeout(async () => {
      setTool('edit');
      const p = state.paragraphs.find(
        (q) =>
          q.editable &&
          q.runs
            .map((r) => r.text)
            .join('')
            .includes(lrep)
      );
      const out = [];
      if (!p) out.push('no paragraph matching ' + JSON.stringify(lrep));
      else {
        beginEdit(p);
        try {
          await document.fonts.ready;
        } catch {}
        await new Promise((r) => setTimeout(r, 400));
        const es = state.editing,
          pv = es.preview;
        out.push(
          `pinned=${pv?.pinned} lines: page ${p.lines.length} preview ${pv?.lines.length}`
        );
        {
          const fb = [...es.editable.querySelectorAll('span[data-fitw]')];
          const scaled = fb.filter((b) =>
            (b.firstElementChild?.style.transform || '').includes('scaleX')
          );
          const tracked = fb.filter(
            (b) => (b.firstElementChild?.style.letterSpacing || '') !== ''
          );
          const ks = scaled
            .slice(0, 6)
            .map((b) => b.firstElementChild.style.transform);
          out.push(
            `  fit boxes: ${fb.length}, scaled ${scaled.length}, tracked ${tracked.length} ${JSON.stringify(ks)}`
          );
        }
        p.runs.slice(0, 4).forEach((r, i) => {
          let synth = '?';
          try {
            const b = P().synthRunFont(p.id, i);
            synth =
              b === 'dishonest'
                ? 'dishonest'
                : b
                  ? b.length + ' bytes'
                  : 'null';
          } catch (e) {
            synth = 'throw ' + e.message;
          }
          const emb = (() => {
            try {
              const b = P().runFontData(p.id, i);
              return b
                ? b.length + (isLoadableSfnt(b) ? ' sfnt' : ' raw')
                : 'none';
            } catch {
              return '?';
            }
          })();
          out.push(
            `  run ${i} "${(r.text || '').slice(0, 14)}" family=${r.family} synth=${synth} embedded=${emb} loaded=${docFontsReady.get(docFontKey(r)) || '-'}`
          );
        });
        const els = [...es.editable.querySelectorAll('.eline')];
        const pageR = $('page').getBoundingClientRect();
        {
          const cv = $('page'),
            ctx = cv.getContext('2d');
          const dpr = devicePixelRatio || 1;
          const bx = Math.max(0, Math.floor(p.box.x * state.zoom * dpr));
          const by = Math.max(
            0,
            Math.floor((P().pageHeight - p.box.top) * state.zoom * dpr)
          );
          const bw = Math.min(
            cv.width - bx,
            Math.ceil(p.box.w * state.zoom * dpr)
          );
          const bh = Math.min(
            cv.height - by,
            Math.ceil(p.box.h * state.zoom * dpr)
          );
          let ink = 0;
          if (bw > 0 && bh > 0) {
            const d = ctx.getImageData(bx, by, bw, bh).data;
            for (let q = 0; q < d.length; q += 4) if (d[q + 1] < 200) ink++;
          }
          out.push(`canvas ink under the open editor: ${ink}px (want ~0)`);
        }
        els.forEach((d, k) => {
          const sp = [...d.querySelectorAll('span')].find((q) =>
            q.textContent.trim()
          );
          let got = NaN;
          if (sp) {
            const r = sp.getBoundingClientRect();
            const cs = getComputedStyle(sp);
            const F = parseFloat(cs.fontSize);
            const ad = fontAD(
              cs.fontFamily,
              parseInt(cs.fontWeight) >= 600,
              cs.fontStyle.includes('italic')
            );
            got = P().pageHeight - (r.top + ad.a * F - pageR.top) / state.zoom;
          }
          out.push(
            `  L${k} page ${p.lines[k]?.y?.toFixed(2)}  preview ${pv?.lines[k]?.baseline?.toFixed(2)}` +
              `  rendered ${isNaN(got) ? '-' : got.toFixed(2)}  exact=${d.dataset.exact}  start=${JSON.stringify((d.textContent || '').slice(0, 6))} end=${JSON.stringify((d.textContent || '').slice(-4))}`
          );
        });
        {
          const M = P().M;
          const ptr = M._ec_test_pagetext(P().session, P().page);
          const chars = JSON.parse(M.UTF8ToString(ptr));
          M._ec_string_free(ptr);
          const lineTxt = (els[0]?.textContent || '').replace(/\u200B/g, '');
          const vis = [];
          for (let i = 0; i < lineTxt.length && vis.length < 18; i++)
            if (!/\s/.test(lineTxt[i])) vis.push([lineTxt[i], i]);
          const codes = vis.map(([c]) => c.codePointAt(0));
          const pageVis = [];
          for (const c of chars)
            if (!/\s/.test(String.fromCodePoint(c[0]))) pageVis.push(c);
          let at = -1;
          outer: for (let i = 0; i + codes.length <= pageVis.length; i++) {
            for (let j = 0; j < codes.length; j++)
              if (pageVis[i + j][0] !== codes[j]) continue outer;
            at = i;
            break;
          }
          const pageR3 = $('page').getBoundingClientRect();
          const walker = document.createTreeWalker(
            els[0],
            NodeFilter.SHOW_TEXT
          );
          const nodes = [];
          for (let nnn = walker.nextNode(); nnn; nnn = walker.nextNode())
            nodes.push(nnn);
          let flat = '',
            map = [];
          for (const nd of nodes)
            for (let k = 0; k < nd.textContent.length; k++) {
              flat += nd.textContent[k];
              map.push([nd, k]);
            }
          const domVis = [];
          for (let i = 0; i < flat.length; i++)
            if (!/\s/.test(flat[i]) && !/[\u200B]/.test(flat[i]))
              domVis.push(i);
          let worst = 0,
            worstAt = '';
          if (at >= 0 && domVis.length >= codes.length) {
            for (let j = 0; j < codes.length; j++) {
              const [nd, k] = map[domVis[j]] || [];
              if (!nd) continue;
              const rg = document.createRange();
              rg.setStart(nd, k);
              rg.setEnd(nd, k + 1);
              const rr = rg.getBoundingClientRect();
              if (!rr.width && !rr.height) continue;
              const got = (rr.left - pageR3.left) / state.zoom;
              const want = pageVis[at + j][2] / 10;
              if (Math.abs(got - want) > worst) {
                worst = Math.abs(got - want);
                worstAt = String.fromCodePoint(codes[j]) + '@' + j;
              }
              if (j < 20)
                out.push(
                  `    ch ${JSON.stringify(String.fromCodePoint(codes[j]))} page ${want.toFixed(2)} overlay ${got.toFixed(2)} d=${(got - want).toFixed(2)}`
                );
            }
          }
          out.push(
            `per-glyph drift vs the page: worst ${worst.toFixed(2)}pt (${worstAt || 'n/a'}) over ${codes.length} chars` +
              ` [pageIdx=${at} probe=${JSON.stringify(vis.map(([c]) => c).join(''))}]`
          );
          {
            const jumps = [];
            for (const ln2 of els) {
              const walk2 = document.createTreeWalker(
                ln2,
                NodeFilter.SHOW_TEXT
              );
              let flat2 = '';
              const map2 = [];
              for (let n2 = walk2.nextNode(); n2; n2 = walk2.nextNode())
                for (let k2 = 0; k2 < n2.textContent.length; k2++) {
                  flat2 += n2.textContent[k2];
                  map2.push([n2, k2]);
                }
              const vis2 = [];
              for (let q = 0; q < flat2.length; q++)
                if (!/[\s\u200B\uFFFC]/.test(flat2[q])) vis2.push(q);
              if (vis2.length < 8) continue;
              const codes2 = vis2.map((q) => flat2.codePointAt(q));
              const rectOf2 = (q) => {
                const [nd2, k3] = map2[q];
                const rg2 = document.createRange();
                rg2.setStart(nd2, k3);
                rg2.setEnd(nd2, k3 + 1);
                const r2 = rg2.getBoundingClientRect();
                return r2.width || r2.height
                  ? (r2.left - pageR3.left) / state.zoom
                  : null;
              };
              const x02 = rectOf2(vis2[0]);
              let at2 = -1,
                best2 = Infinity;
              outer2: for (
                let q = 0;
                q + codes2.length <= pageVis.length;
                q++
              ) {
                for (let z2 = 0; z2 < codes2.length; z2++)
                  if (pageVis[q + z2][0] !== codes2[z2]) continue outer2;
                const dd = Math.abs(pageVis[q][2] / 10 - x02);
                if (dd < best2) {
                  best2 = dd;
                  at2 = q;
                }
              }
              if (at2 < 0 || best2 > 3) continue;
              let prevD = 0;
              for (let z2 = 0; z2 < codes2.length; z2++) {
                const g2 = rectOf2(vis2[z2]);
                if (g2 === null) continue;
                const d2 = g2 - pageVis[at2 + z2][2] / 10;
                if (Math.abs(d2 - prevD) > 0.8 && jumps.length < 8)
                  jumps.push(
                    `${JSON.stringify(String.fromCodePoint(codes2[z2]))} d=${d2.toFixed(2)} (${d2 - prevD >= 0 ? '+' : ''}${(d2 - prevD).toFixed(2)}) after ${JSON.stringify(flat2.slice(Math.max(0, vis2[z2] - 10), vis2[z2]))}`
                  );
                prevD = d2;
              }
            }
            if (jumps.length) out.push('  drift jumps: ' + jumps.join(' | '));
          }
        }
        {
          const d0 = els[0];
          const pageR2 = $('page').getBoundingClientRect();
          [...(d0?.children || [])].slice(0, 8).forEach((box, bi) => {
            const br = box.getBoundingClientRect();
            const inner = box.querySelector('span');
            const ir = inner?.getBoundingClientRect();
            const cs2 = inner ? getComputedStyle(inner) : null;
            out.push(
              `  box${bi} x=${((br.left - pageR2.left) / state.zoom).toFixed(2)}` +
                ` w=${(br.width / state.zoom).toFixed(2)} ink=${ir ? (ir.width / state.zoom).toFixed(2) : '-'}` +
                ` font=${cs2 ? cs2.fontSize + ' ' + cs2.fontFamily.slice(0, 24) : '-'}` +
                ` ${JSON.stringify((box.textContent || '').slice(0, 12))}`
            );
            if (bi === 6)
              out.push('  box6 html: ' + box.outerHTML.slice(0, 400));
          });
        }
        endEdit(false);
      }
      const pre = document.createElement('pre');
      pre.id = 'diagout';
      pre.textContent = out.join('\n');
      document.body.appendChild(pre);
      document.title = 'DIAGDONE';
    }, 500);
  const dg = params.get('diag');
  if (dg && demo)
    setTimeout(() => {
      const out = [];
      setTool('edit');
      const p = state.paragraphs.find(
        (q) =>
          q.editable &&
          q.runs
            .map((r) => r.text)
            .join('')
            .includes(dg)
      );
      out.push(
        'model text: ' + JSON.stringify(p.runs.map((r) => r.text).join(''))
      );
      beginEdit(p);
      const ed = state.editing.editable;
      ed.focus();
      const r0 = ed.getBoundingClientRect();
      ed.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          clientX: r0.left + 20,
          clientY: r0.top + 20,
        })
      );
      ed.dispatchEvent(
        new MouseEvent('mouseup', {
          bubbles: true,
          clientX: r0.left + 20,
          clientY: r0.top + 20,
        })
      );
      out.push('editor innerHTML: ' + ed.innerHTML.slice(0, 200));
      out.push(
        'editor textContent: ' + JSON.stringify(ed.textContent.slice(0, 80))
      );
      const parsed = parseEditor(ed, p.runs);
      out.push(
        'parseEditor text: ' +
          JSON.stringify(
            parsed
              .map((r) => r.text)
              .join('')
              .slice(0, 80)
          )
      );
      for (let i = 0; i < Math.max(parsed.length, p.runs.length); i++) {
        const a = p.runs[i]?.text ?? '<missing>',
          b = parsed[i]?.text ?? '<missing>';
        if (a === b) continue;
        out.push('  run ' + i + ' model  ' + JSON.stringify(a.slice(0, 90)));
        out.push('  run ' + i + ' parsed ' + JSON.stringify(b.slice(0, 90)));
      }
      out.push(
        'run counts: model ' + p.runs.length + ' parsed ' + parsed.length
      );
      {
        const A = p.runs.map((r) => r.text).join(''),
          B = parsed.map((r) => r.text).join('');
        let i = 0;
        while (i < A.length && i < B.length && A[i] === B[i]) i++;
        const cps = (t) =>
          [...t]
            .map(
              (c) =>
                'U+' +
                c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
            )
            .join(' ');
        out.push(
          'text lengths: model ' +
            A.length +
            ' parsed ' +
            B.length +
            ', first difference at ' +
            i
        );
        out.push('  model  ' + cps(A.slice(Math.max(0, i - 6), i + 8)));
        out.push('  parsed ' + cps(B.slice(Math.max(0, i - 6), i + 8)));
        [...ed.querySelectorAll('.eline')].forEach((d, k) => {
          const t = d.textContent;
          if (!t.includes('\uFFFC')) return;
          out.push(
            '  line ' +
              k +
              ' dom ' +
              cps(t.slice(0, 12)) +
              ' html ' +
              d.innerHTML.slice(0, 260)
          );
        });
      }
      endEdit(true);
      const after = state.paragraphs.find(
        (q) =>
          q.runs
            .map((r) => r.text)
            .join('')
            .includes('REPORT') ||
          q.runs
            .map((r) => r.text)
            .join('')
            .includes(dg.slice(0, 4))
      );
      out.push(
        'committed text: ' +
          JSON.stringify(
            (after?.runs.map((r) => r.text).join('') || '').slice(0, 80)
          ) +
          ' lines=' +
          after?.lines.length
      );
      const pre = document.createElement('pre');
      pre.id = 'diagout';
      pre.textContent = out.join('\n');
      pre.style.cssText =
        'position:fixed;left:0;bottom:0;z-index:99;color:#0f0;background:#000;font:12px monospace;padding:6px;white-space:pre-wrap;max-width:100vw';
      document.body.appendChild(pre);
      document.title = 'DIAGDONE';
    }, 400);
  const et = params.get('edittext');
  if (et && demo) {
    const [find, repl] = et.split('|');
    const target = state.paragraphs.find(
      (p) =>
        p.editable &&
        p.runs
          .map((r) => r.text)
          .join('')
          .includes(find)
    );
    if (target) {
      const runs = target.runs.map((r, i) => ({
        ...r,
        rgba: r.rgba >>> 0,
        text: r.text.split(find).join(repl),
        sourceIndex: i,
      }));
      const u = P().commitParagraph(target.id, runs, target.format);
      if (u) {
        replaceParagraph(target.id, u);
        state.dirty = true;
        renderPage();
      }
    }
  }
})();

async function runRepro() {
  const log = [];
  const stopAfter = parseInt(
    new URLSearchParams(location.search).get('stop') || '0',
    10
  );
  const say = (m) => {
    log.push(m);
    if (stopAfter && log.length >= stopAfter) throw { stopNow: true };
  };
  const canvas = $('page');
  const inkOf = () => {
    const d = canvas
      .getContext('2d')
      .getImageData(0, 0, canvas.width, canvas.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 1] < 200) n++;
    return n;
  };
  window.__censusStart = (() => {
    const rows = [];
    for (let i = 0; i < P().objectCount(); i++) {
      const o = P().objectAt(i);
      if (!o) continue;
      const b = P().objectBounds(o.handle);
      rows.push(
        `${o.type}@${b ? b.x.toFixed(1) + ',' + b.y.toFixed(1) + ' ' + b.w.toFixed(1) + 'x' + b.h.toFixed(1) : '?'}`
      );
    }
    return rows.sort();
  })();
  const undoBase = state.undo.length;
  const ink00 = inkOf();
  window.__inkVirgin = ink00;

  const reproDoubleEdit = async () => {
    const out = [];
    for (let n = 1; n <= 2; n++) {
      const p = state.paragraphs.find(
        (q) =>
          q.editable &&
          !q.rotation &&
          q.runs.map((r) => r.text).join('').length > 20
      );
      if (!p) {
        out.push('no paragraph');
        break;
      }
      const runs = p.runs.map((r, i) => ({ ...r, sourceIndex: i }));
      runs[runs.length - 1] = {
        ...runs[runs.length - 1],
        text: runs[runs.length - 1].text + ' q' + n,
      };
      snapshotEdit('edit text', p);
      const u = P().commitParagraph(p.id, runs, p.format);
      if (u) replaceParagraph(p.id, u);
      refreshAfterMutation();
      await new Promise((r) => setTimeout(r, 400));
      renderPage();
      out.push('edit' + n + ' ink ' + inkOf());
    }
    let guard = 0;
    while (state.undo.length > undoBase && guard++ < 10)
      restore(state.undo, state.redo);
    refreshModel();
    renderPage();
    return 'double edit: ' + out.join(' | ') + ' (want both ~equal)';
  };
  const reproTextSelection = () => {
    endEdit(false);
    const H = P().pageHeight,
      W = P().pageWidth;
    const sel = P().selectText(0, H * 0.92, W, H * 0.45, 0);
    if (!sel) return 'page text selection: engine returned nothing (want text)';
    showTextSelection(sel);
    const drawn = document.querySelectorAll('.textsel').length;
    const marquee = P().selectText(W * 0.1, H * 0.5, W * 0.9, H * 0.9, 1);
    clearTextSelection();
    const gone = document.querySelectorAll('.textsel').length;
    return (
      'page text selection: ' +
      sel.blocks.length +
      ' blocks / ' +
      sel.quads.length +
      ' quads drawn ' +
      drawn +
      ', marquee ' +
      (marquee ? marquee.blocks.length : 0) +
      ' blocks, cleared ' +
      (gone === 0) +
      ' (want >1 blocks, quads==drawn, cleared true)'
    );
  };
  const reproSpelling = async () => {
    endEdit(false);
    const ok = await spellDictionary();
    if (!ok) return 'spelling: no dictionary (skipped)';
    const p = state.paragraphs.find(
      (q) =>
        q.editable &&
        q.runs
          .map((r) => r.text)
          .join('')
          .split(/\s+/).length > 4
    );
    if (!p) return 'spelling: no paragraph to test';
    const runs = p.runs.map((r, i) => ({
      ...r,
      rgba: r.rgba >>> 0,
      sourceIndex: i,
    }));
    runs[0] = { ...runs[0], text: 'definitly ' + runs[0].text };
    snapshotEdit('edit text', p);
    const u = P().commitParagraph(p.id, runs, p.format);
    if (u) replaceParagraph(p.id, u);
    refreshAfterMutation();
    spellRescan();
    const found = spell.list.some((w) => w.word.toLowerCase() === 'definitly');
    const before = spell.list.length;
    spell.at = spell.list.findIndex(
      (w) => w.word.toLowerCase() === 'definitly'
    );
    if (spell.at >= 0) {
      $('spellFix').value = 'definitely';
      spellChange();
    }
    const fixed = !spell.list.some((w) => w.word.toLowerCase() === 'definitly');
    const text = state.paragraphs
      .map((q) => q.runs.map((r) => r.text).join(''))
      .join(' ');
    restore(state.undo, state.redo);
    restore(state.undo, state.redo);
    return (
      'spelling: ' +
      ' found=' +
      found +
      ' (' +
      before +
      ' flagged) fixed=' +
      fixed +
      ' corrected=' +
      text.includes('definitely') +
      ' (want true true true)'
    );
  };
  const reproUndoParity = () => {
    endEdit(false);
    const census = () => {
      const rows = [];
      for (let i = 0; i < P().objectCount(); i++) {
        const o = P().objectAt(i);
        if (!o) continue;
        const b = P().objectBounds(o.handle);
        rows.push(
          `${o.type}@${b ? b.x.toFixed(1) + ',' + b.y.toFixed(1) + ' ' + b.w.toFixed(1) + 'x' + b.h.toFixed(1) : '?'}`
        );
      }
      return rows.sort();
    };
    const censusStart = window.__censusStart || [];
    let guard = 0;
    const trace = [];
    while (state.undo.length > undoBase && guard++ < 40) {
      const top = state.undo[state.undo.length - 1];
      const kind = top?.engine
        ? (top.label || 'engine') + (top.what ? '[' + top.what + ']' : '')
        : 'bytes';
      restore(state.undo, state.redo);
      renderPage();
      {
        const now = census();
        const extra = now.filter((r) => !censusStart.includes(r)).length;
        const miss = censusStart.filter((r) => !now.includes(r)).length;
        trace.push(`${kind}:${inkOf()}(+${extra}/-${miss})`);
      }
    }
    if (window.__undoTrace) say('  undo trace: ' + trace.join(' '));
    if (window.__undoTrace && window.__ledger)
      say('  ledger: ' + window.__ledger.join(' | '));
    {
      const now = census();
      const missing = censusStart.filter((r) => !now.includes(r));
      const extra = now.filter((r) => !censusStart.includes(r));
      if (censusStart.length && (missing.length || extra.length))
        (say(
          '  displaced: missing ' +
            JSON.stringify(missing.slice(0, 3)) +
            ' extra ' +
            JSON.stringify(extra.slice(0, 3))
        ),
          say(
            '  note: ' +
              missing.length +
              '/' +
              extra.length +
              ' objects re-emitted rather than restored verbatim (same ink; an ' +
              'undo may rebuild a paragraph instead of putting its old objects ' +
              'back)'
          ));
    }
    renderPage();
    const inkZ = inkOf();
    const par = Math.min(ink00, inkZ) / Math.max(1, Math.max(ink00, inkZ));
    const refs = [ink00, window.__inkVirgin, window.__inkNormalized].filter(
      (v) => v !== undefined
    );
    const best = Math.max(
      ...refs.map((v) => Math.min(v, inkZ) / Math.max(1, Math.max(v, inkZ)))
    );
    return (
      'undo parity: ink ' +
      ink00 +
      ' → ' +
      inkZ +
      (best > 0.995 ? ' (clean)' : ' GARBLED (' + (par * 100).toFixed(1) + '%)')
    );
  };
  const rect = canvas.getBoundingClientRect();
  const z = state.zoom;
  const pageToClient = (px, py) => ({
    x: rect.left + px * z,
    y: rect.top + (P().pageHeight - py) * z,
  });
  const fire = (el, type, cx, cy, detail = 1) =>
    el.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: cx,
        clientY: cy,
        detail,
      })
    );

  const reproObjectMove = (
    wantType,
    label,
    minW,
    minH,
    maxW = 1e9,
    maxH = 1e9
  ) => {
    let imgObj = null;
    for (let i = 0; i < P().objectCount(); i++) {
      const o = P().objectAt(i);
      if (o && o.type === wantType) {
        const b = P().objectBounds(o.handle);
        if (b && b.w > minW && b.h > minH && b.w < maxW && b.h < maxH) {
          imgObj = { ...o, bounds: b };
          break;
        }
      }
    }
    if (!imgObj) return null;
    endEdit(false);
    selectObject(imgObj);
    const inkAt = (b) => {
      const cv = $('page');
      const ctx = cv.getContext('2d');
      const zz = state.zoom * devicePixelRatio;
      const H = P().pageHeight;
      const x0 = Math.max(0, Math.round(b.x * zz)),
        y0 = Math.max(0, Math.round((H - b.y - b.h) * zz));
      const w = Math.min(cv.width - x0, Math.round(b.w * zz)),
        h = Math.min(cv.height - y0, Math.round(b.h * zz));
      if (w <= 0 || h <= 0) return 0;
      const d = ctx.getImageData(x0, y0, w, h).data;
      let n = 0;
      for (let k = 0; k < d.length; k += 4)
        if (d[k] < 200 || d[k + 1] < 200 || d[k + 2] < 200) n++;
      return n;
    };
    const before = inkAt(imgObj.bounds);
    const box = $('overlay').querySelector('.obj-box');
    if (!box) return label + ' move: obj-box missing';
    {
      const rb = box.getBoundingClientRect();
      let threw = null;
      const onErr = (ev) => {
        threw = ev.message || String(ev.error);
      };
      window.addEventListener('error', onErr);
      try {
        box.dispatchEvent(
          new MouseEvent('mousemove', {
            bubbles: true,
            clientX: rb.left + rb.width / 2,
            clientY: rb.top + rb.height / 2,
          })
        );
      } catch (err) {
        threw = err.message;
      }
      window.removeEventListener('error', onErr);
      if (threw) return label + ' move: hover threw ' + threw + ' (want none)';
      if (!box.style.cursor)
        return label + ' move: hover set no cursor (want move/text)';
    }
    const r = box.getBoundingClientRect();
    fire(box, 'mousedown', r.left + r.width / 2, r.top + r.height / 2);
    fire(
      window,
      'mousemove',
      r.left + r.width / 2 + 90,
      r.top + r.height / 2 + 40
    );
    fire(
      window,
      'mouseup',
      r.left + r.width / 2 + 90,
      r.top + r.height / 2 + 40
    );
    const nb = state.selection?.bounds || P().objectBounds(imgObj.handle);
    const after = inkAt(nb);
    return (
      label +
      ' move: ink ' +
      before +
      ' -> ' +
      after +
      ' (want similar, not ~0)'
    );
  };
  const reproSynthFont = async () => {
    for (const p of state.paragraphs) {
      for (let i = 0; i < p.runs.length; i++) {
        const d = P().runFontData(p.id, i);
        if (!d) continue;
        const synth = P().synthRunFont(p.id, i);
        if (synth === 'dishonest') continue;
        if (!synth) {
          if (isLoadableSfnt(d)) continue;
          return 'synth overlay font: engine returned null';
        }
        try {
          const face = new FontFace('ecsynthrepro', synth.buffer);
          await face.load();
          document.fonts.add(face);
          const cv = document.createElement('canvas');
          const cx = cv.getContext('2d');
          cx.font = '100px ecsynthrepro';
          const wi = cx.measureText('iii').width,
            wM = cx.measureText('MMM').width;
          document.fonts.delete(face);
          return (
            'synth overlay font: loaded, widths iii=' +
            wi.toFixed(0) +
            ' MMM=' +
            wM.toFixed(0) +
            (wM > wi && wi > 0 ? ' OK' : ' BAD')
          );
        } catch (e) {
          return 'synth overlay font: FontFace REJECTED (' + e.message + ')';
        }
      }
    }
    return null;
  };
  const reproRotateChrome = () => {
    const msg = [];
    let obj = null;
    for (let i = 0; i < P().objectCount(); i++) {
      const o = P().objectAt(i);
      if (o && o.type !== OBJ.TEXT) {
        const b = P().objectBounds(o.handle);
        if (b && b.w > 20 && b.h > 6) {
          obj = { ...o, bounds: b };
          break;
        }
      }
    }
    if (obj) {
      endEdit(false);
      selectObject(obj);
      msg.push(
        'obj-click rotate: knob=' +
          !!$('overlay').querySelector('.rot-handle') +
          ' btn=' +
          !$('rotL').hidden +
          ' (want true true)'
      );
    }
    const p = state.paragraphs.find((q) => q.editable && !q.rotation);
    if (p) {
      beginEdit(p);
      msg.push(
        'edit-mode rotate knob=' +
          !!$('overlay').querySelector('.edit-chrome .rot-handle') +
          ' (want true)'
      );
      endEdit(false);
    }
    return msg.join('; ') || null;
  };
  const reproArabicCommit = () => {
    const p = state.paragraphs.find((q) =>
      /[\u0600-\u06FF]/.test(q.runs.map((r) => r.text).join(''))
    );
    if (!p) return null;
    endEdit(false);
    const runs = p.runs.map((r, i) => ({
      ...r,
      rgba: r.rgba >>> 0,
      sourceIndex: i,
    }));
    runs[0] = { ...runs[0], text: runs[0].text + ' بت' };
    const u = P().commitParagraph(p.id, runs, p.format);
    if (!u) return 'arabic commit: FAILED';
    refreshModel();
    const t = state.paragraphs
      .map((q) => q.runs.map((r) => r.text).join(''))
      .join('\n');
    const roundTrip = t.includes(' بت') || t.includes('بت ');
    const garbage = /ÿ/.test(t);
    return (
      'arabic commit: round-trip=' +
      roundTrip +
      ' garbage=' +
      garbage +
      ' (want true false)'
    );
  };
  const reproRtlBackspace = () => {
    const RTL = /[\u0590-\u05FF\u0600-\u06FF]/;
    const p = state.paragraphs.find(
      (q) =>
        q.editable &&
        !q.rotation &&
        RTL.test(q.runs.map((r) => r.text).join(''))
    );
    if (!p) return null;
    endEdit(false);
    const before = p.runs.map((r) => r.text).join('');
    if (before.length < 2) return null;
    beginEdit(p);
    const es = state.editing;
    if (!es?.editable) return 'rtl backspace: no editor';
    const domText = (es.editable.textContent || '').replace(/\u200B/g, '');
    lockedCaretSet(es.editable, before.length);
    document.execCommand('delete');
    const domAfter = (es.editable.textContent || '').replace(/\u200B/g, '');
    endEdit(true);
    refreshModel();
    const want = before.slice(0, -1);
    const cand = state.paragraphs
      .map((q) => q.runs.map((r) => r.text).join(''))
      .filter((t) => RTL.test(t));
    const after = cand.includes(want)
      ? want
      : (cand.find((t) => t !== before && t.length === want.length) ??
        '(no match)');
    let out =
      'rtl backspace: ' +
      JSON.stringify(before) +
      ' -> ' +
      JSON.stringify(after);
    out +=
      after === want
        ? ' (last logical char, OK)'
        : '  MISMATCH want ' +
          JSON.stringify(want) +
          ' | dom ' +
          JSON.stringify(domText) +
          ' -> ' +
          JSON.stringify(domAfter);
    return out;
  };
  const reproRtlArrows = () => {
    const RTL = /[\u0590-\u05FF\u0600-\u06FF]/;
    const p = state.paragraphs.find(
      (q) =>
        q.editable &&
        !q.rotation &&
        RTL.test(q.runs.map((r) => r.text).join(''))
    );
    if (!p) return null;
    endEdit(false);
    beginEdit(p);
    const es = state.editing;
    if (!es?.editable || !es.locked) {
      endEdit(false);
      return 'rtl arrows: no locked editor';
    }
    const ed = es.editable;
    const key = (k) =>
      ed.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: k,
          bubbles: true,
          cancelable: true,
        })
      );
    lockedCaretSet(ed, 5);
    key('ArrowRight');
    const afterRight = lockedCaretGet(ed);
    lockedCaretSet(ed, 5);
    key('ArrowLeft');
    const afterLeft = lockedCaretGet(ed);
    endEdit(false);
    const ok = afterRight === 6 && afterLeft === 4;
    return (
      'rtl arrows: from 5 -> Right ' +
      afterRight +
      ', Left ' +
      afterLeft +
      (ok ? ' (logical, OK)' : '  MISMATCH want Right 6, Left 4')
    );
  };
  const reproFindReplace = () => {
    const msg = [];
    const opts = { cs: false, word: false, noAcc: false };
    let needle = null,
      total = 0;
    for (const q of state.paragraphs) {
      if (!q.editable) continue;
      for (const w of paraText(q).match(/[A-Za-z\u0600-\u06FF]{3,}/g) || []) {
        let n = 0;
        for (const r of state.paragraphs)
          if (r.editable) n += paraMatches(r, w, opts).length;
        if (n >= 2) {
          needle = w;
          total = n;
          break;
        }
      }
      if (needle) break;
    }
    if (needle) {
      state.find = null;
      const a = findStep(needle, 1),
        b = findStep(needle, 1);
      const advanced =
        !!a && !!b && !(a.paraId === b.paraId && a.start === b.start);
      const c = findStep(needle, -1);
      const back = !!c && !!a && c.paraId === a.paraId && c.start === a.start;
      msg.push(
        `find "${needle}": ${total} matches, next advances=${advanced}, ` +
          `prev returns=${back}` +
          (advanced && back ? '' : '  MISMATCH')
      );
      state.find = null;
      clearTextSelection();
    }
    const fake = {
      runs: [
        { text: 'abcd', rgba: 0 },
        { text: 'efgh', rgba: 0 },
        { text: 'ijkl', rgba: 0 },
      ],
    };
    const spans = paraMatches(fake, 'defghi', opts);
    const rebuilt =
      spans.length === 1
        ? runsWithReplacements(fake, spans, '@')
            .map((r) => r.text)
            .join('')
        : '(no match)';
    const okX = spans.length === 1 && rebuilt === 'abc@jkl';
    msg.push(
      `cross-run replace: "abcd|efgh|ijkl" - "defghi" => "${rebuilt}"` +
        (okX ? ' (OK)' : '  MISMATCH want abc@jkl')
    );
    return msg.join('; ');
  };
  const reproBlockSelect = () => {
    const rows = state.paragraphs.filter((q) => q.blockId);
    if (rows.length < 2) return null;
    const id = rows[0].blockId;
    const group = rows.filter((q) => q.blockId === id);
    endEdit(false);
    state.selection = { kind: 'para', para: group[0] };
    drawOverlay();
    const sel = $('overlay').querySelector('.sel-para');
    if (!sel) return 'block select: no selection box  MISMATCH';
    let top = 1e9,
      bot = -1e9;
    for (const q of group) {
      const pl = paraPlacement(q);
      top = Math.min(top, pl.y);
      bot = Math.max(bot, pl.y + pl.h);
    }
    const chrome = sel.parentElement;
    const y = parseFloat(chrome.style.top) + parseFloat(sel.style.top);
    const h = parseFloat(sel.style.height);
    const wantH = bot - top + 2 * BOX_PAD;
    const ok = Math.abs(h - wantH) < 2.5;
    state.selection = null;
    drawOverlay();
    return (
      `block select: ${group.length} rows, outline h=${h.toFixed(0)} ` +
      `want ${wantH.toFixed(0)}` +
      (ok ? ' (one box, OK)' : '  MISMATCH')
    );
  };
  const reproBlockEdit = async () => {
    const rows = state.paragraphs.filter((q) => q.blockId);
    if (rows.length < 2) return null;
    const bid = rows[0].blockId;
    const group = rows.filter((q) => q.blockId === bid);
    endEdit(false);
    setTool('edit');
    beginEdit(group[Math.floor(group.length / 2)]);
    await new Promise((r) => setTimeout(r, 40));
    const ov = $('overlay');
    const blockEl = ov.querySelector('.block-box.active');
    if (!blockEl)
      return "block edit: open row's block has no active box  MISMATCH";
    const br = blockEl.getBoundingClientRect();
    const msg = [];
    const lit = (w, style, color) =>
      parseFloat(w) > 0 &&
      style !== 'none' &&
      !/,\s*0\)$/.test(color) &&
      color !== 'transparent';
    let extra = 0;
    for (const el of ov.querySelectorAll(
      '.para-box, .sel-para, [contenteditable]'
    )) {
      if (el === blockEl) continue;
      const cs = getComputedStyle(el);
      if (
        !lit(cs.borderTopWidth, cs.borderTopStyle, cs.borderTopColor) &&
        !lit(cs.outlineWidth, cs.outlineStyle, cs.outlineColor)
      )
        continue;
      const r = el.getBoundingClientRect();
      if (
        r.left >= br.left - 2 &&
        r.right <= br.right + 2 &&
        r.top >= br.top - 2 &&
        r.bottom <= br.bottom + 2
      )
        extra++;
    }
    msg.push(
      `block edit: ${group.length} rows, boxes nested in the outline=` +
        extra +
        (extra === 0 ? ' (one box, OK)' : '  MISMATCH')
    );
    const strip = ov.querySelector('.edit-move[data-edge="n"]');
    msg.push('move strip on the block box: ' + !!strip);
    if (strip) {
      const topOf = () =>
        group.map(
          (q) => state.paragraphs.find((p) => p.id === q.id)?.box.top ?? 0
        );
      const geo = () =>
        state.paragraphs
          .map((p) => p.box.x.toFixed(2) + ',' + p.box.top.toFixed(2))
          .sort()
          .join('|');
      const before = topOf(),
        geo0 = geo(),
        undo0 = state.undo.length;
      const sr = strip.getBoundingClientRect();
      const cx = sr.left + sr.width / 2,
        cy = sr.top + sr.height / 2;
      fire(strip, 'mousedown', cx, cy);
      fire(window, 'mousemove', cx, cy + 30);
      fire(window, 'mouseup', cx, cy + 30);
      const after = topOf();
      const d0 = after[0] - before[0];
      const together = after.every(
        (t, i) => Math.abs(t - before[i] - d0) < 0.01
      );
      msg.push(
        `block move: ${group.length} rows shifted ${d0.toFixed(1)}pt` +
          (Math.abs(d0) > 1 && together ? ' (whole block, OK)' : '  MISMATCH')
      );
      const steps = state.undo.length - undo0;
      endEdit(false);
      if (steps) {
        restore(state.undo, state.redo);
        renderPage();
      }
      const back = geo() === geo0;
      msg.push(
        `block move undo: ${steps} step, page geometry back=${back}` +
          (steps === 1 && back ? ' (OK)' : '  MISMATCH')
      );
      beginEdit(group[Math.floor(group.length / 2)]);
      await new Promise((r) => setTimeout(r, 40));
      const strip2 = ov.querySelector('.edit-move[data-edge="n"]');
      const g2 = geo(),
        u2 = state.undo.length;
      if (strip2) {
        const s2 = strip2.getBoundingClientRect();
        const x2 = s2.left + s2.width / 2,
          y2 = s2.top + s2.height / 2;
        fire(strip2, 'mousedown', x2, y2);
        fire(window, 'mouseup', x2, y2);
        msg.push(
          'zero-drag: steps +' +
            (state.undo.length - u2) +
            ', geometry ' +
            (geo() === g2 ? 'unmoved' : 'MOVED') +
            (state.undo.length === u2 && geo() === g2 ? ' (OK)' : '  MISMATCH')
        );
        const strip3 = ov.querySelector('.edit-move[data-edge="n"]');
        if (strip3) {
          const s3 = strip3.getBoundingClientRect();
          fire(
            strip3,
            'mousedown',
            s3.left + s3.width / 2,
            s3.top + s3.height / 2
          );
          fire(
            window,
            'mousemove',
            s3.left + s3.width / 2 + 25,
            s3.top + s3.height / 2 + 25
          );
          endEdit(false);
          fire(
            window,
            'mouseup',
            s3.left + s3.width / 2 + 25,
            s3.top + s3.height / 2 + 25
          );
          drawOverlay();
          const boxes = [...ov.querySelectorAll('.block-box')];
          const g3 = geo();
          msg.push(
            'abandoned drag: geometry ' +
              (g3 === g2 ? 'unmoved' : 'MOVED') +
              ', block boxes ' +
              boxes.length +
              (g3 === g2 ? ' (OK)' : '  MISMATCH')
          );
        }
      }
    }
    endEdit(false);
    return msg.join('; ');
  };
  const reproRotateApply = () => {
    const p = state.paragraphs.find(
      (q) => q.editable && !q.rotation && q.lines.length <= 2
    );
    if (!p) return null;
    endEdit(false);
    state.selection = { kind: 'para', para: p };
    updateChrome();
    const btnVisible = !$('rotL').hidden;
    rotateSelection(90);
    const rotated = state.paragraphs.some(
      (q) => Math.abs(Math.abs(q.rotation || 0) - 90) < 3
    );
    return (
      'para rotate: btn=' +
      btnVisible +
      ' applied=' +
      rotated +
      ' (want true true)'
    );
  };
  const reproLiveFidelity = async () => {
    endEdit(false);
    let n = 0,
      pinned = 0,
      worstX = 0,
      worstXs = '',
      spill = 0,
      worstSpill = 0,
      reflowed = 0,
      worstSpillTxt = '';
    let worstGlyph = 0,
      worstGlyphTxt = '',
      glyphChars = 0;
    let multi = 0,
      pinnedMulti = 0;
    for (const p of state.paragraphs.filter(
      (q) => q.editable && !q.rotation && !q.vertical
    )) {
      beginEdit(p);
      await new Promise((r) => setTimeout(r, 40));
      n++;
      if (state.editing?.preview?.pinned) pinned++;
      if (p.lines.length > 1) {
        multi++;
        if (state.editing?.preview?.pinned) pinnedMulti++;
      }
      const xd = lineXDrift(state.editing, state.editing.para || p);
      if (xd && xd.worst > worstX) {
        worstX = xd.worst;
        worstXs = p.runs
          .map((r) => r.text)
          .join('')
          .slice(0, 22);
      }
      const gd = glyphDrift(state.editing, p);
      if (gd) {
        glyphChars += gd.n;
        if (gd.worst > worstGlyph) {
          worstGlyph = gd.worst;
          worstGlyphTxt =
            p.runs
              .map((r) => r.text)
              .join('')
              .slice(0, 16) +
            ' @' +
            gd.ch;
        }
      }
      const over = editorInkOverflow(state.editing, p);
      if (over > 0) {
        spill++;
        if (over > worstSpill) {
          worstSpill = over;
          worstSpillTxt = p.runs
            .map((r) => r.text)
            .join('')
            .slice(0, 22);
        }
      }
      const shown0 = editorLineCount(state.editing.editable);
      if (shown0 !== Math.max(1, p.lines.length)) reflowed++;
      endEdit(false);
    }
    renderPage();
    window.__inkNormalized = inkOf();
    return (
      'live fidelity: ' +
      pinned +
      '/' +
      n +
      " keep the page's breaks (" +
      pinnedMulti +
      '/' +
      multi +
      ' multi-line), ' +
      reflowed +
      ' re-wrapped, ' +
      spill +
      ' spill' +
      (spill
        ? ' (worst ' + worstSpill.toFixed(1) + 'px in "' + worstSpillTxt + '")'
        : '') +
      ', worst glyph drift ' +
      worstGlyph.toFixed(2) +
      'pt over ' +
      glyphChars +
      ' glyphs' +
      (glyphChars ? '' : ' [' + (glyphDrift.why || '?') + ']') +
      (worstGlyphTxt ? ' ("' + worstGlyphTxt + '")' : '') +
      ', worst line-start drift ' +
      worstX.toFixed(2) +
      'px' +
      (worstXs ? ' ("' + worstXs + '")' : '') +
      ' (want all pinned, 0 re-wrapped, 0 spill, drift <1.5)'
    );
  };
  const reproReopenAfterEdit = async () => {
    endEdit(false);
    const p = state.paragraphs.find(
      (q) =>
        q.editable &&
        !q.rotation &&
        q.lines.length >= 3 &&
        q.runs.map((r) => r.text).join('').length > 60
    );
    if (!p) return 'reopen after edit: no multi-line paragraph (skipped)';
    const undo0 = state.undo.length;
    const runs = p.runs.map((r, i) => ({
      ...r,
      rgba: r.rgba >>> 0,
      sourceIndex: i,
    }));
    runs[0] = { ...runs[0], text: 'Zz ' + runs[0].text };
    snapshotEdit('edit text', p);
    const u = P().commitParagraph(p.id, runs, p.format);
    if (u) replaceParagraph(p.id, u);
    refreshAfterMutation();
    const after = state.paragraphs.find((q) => q.id === p.id);
    const anchored = (after?.lines || []).filter(
      (l) => typeof l.px === 'number'
    ).length;
    beginEdit(after);
    await new Promise((r) => setTimeout(r, 80));
    const pinned = !!state.editing?.preview?.pinned;
    const xd = lineXDrift(state.editing, state.editing.para || after);
    const spill = editorInkOverflow(state.editing, after);
    const shownR = editorLineCount(state.editing.editable);
    endEdit(false);
    let guard = 0;
    while (state.undo.length > undo0 && guard++ < 5)
      restore(state.undo, state.redo);
    refreshModel();
    renderPage();
    return (
      'reopen after edit: ' +
      anchored +
      '/' +
      (after?.lines.length || 0) +
      ' lines carry a page origin, pinned=' +
      pinned +
      ', editor shows ' +
      shownR +
      ' of ' +
      (after?.lines.length || 0) +
      ' lines' +
      ', x drift ' +
      (xd ? xd.worst.toFixed(2) : 'n/a') +
      'px, spill ' +
      spill.toFixed(1) +
      'px (want all, true, equal, <1.5)'
    );
  };
  const reproTypedUndo = async () => {
    endEdit(false);
    const census = () => {
      const rows = [];
      for (let i = 0; i < P().objectCount(); i++) {
        const o = P().objectAt(i);
        if (!o) continue;
        const b = P().objectBounds(o.handle);
        rows.push(
          `${o.type}:${b ? b.x.toFixed(1) + ',' + b.y.toFixed(1) + ',' + b.w.toFixed(1) + 'x' + b.h.toFixed(1) : '?'}`
        );
      }
      return rows;
    };
    const p = state.paragraphs.find(
      (q) =>
        q.editable &&
        !q.rotation &&
        q.runs.map((r) => r.text).join('').length > 24
    );
    if (!p) return null;
    const before = census(),
      inkBefore = inkOf();
    const cv0 = $('page');
    const snapPx = window.__undoTrace
      ? cv0.getContext('2d').getImageData(0, 0, cv0.width, cv0.height)
      : null;
    beginEdit(p);
    await new Promise((r) => setTimeout(r, 40));
    const ed = state.editing.editable;
    const walker = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
    const node = walker.nextNode();
    if (node) node.textContent = 'Zz' + node.textContent;
    const undoLenB = state.undo.length,
      depthB = P().historyDepth?.() ?? '?';
    endEdit(true);
    const undoLenA = state.undo.length,
      depthA = P().historyDepth?.() ?? '?';
    const top = state.undo[state.undo.length - 1];
    if (window.__undoTrace)
      say(
        `  typed-undo diag: host undo ${undoLenB}→${undoLenA} (top ${top ? (top.engine ? 'engine' : 'bytes') : '-'}), engine depth ${JSON.stringify(depthB)}→${JSON.stringify(depthA)}`
      );
    refreshAfterMutation();
    const inkEdited = inkOf();
    restore(state.undo, state.redo);
    refreshModel();
    renderPage();
    const after = census(),
      inkAfter = inkOf();
    if (snapPx) {
      const now = cv0
        .getContext('2d')
        .getImageData(0, 0, cv0.width, cv0.height);
      let x0 = 1e9,
        x1 = -1,
        y0 = 1e9,
        y1 = -1,
        n = 0;
      const W = Math.min(snapPx.width, now.width),
        H = Math.min(snapPx.height, now.height);
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const i = (y * snapPx.width + x) * 4,
            j2 = (y * now.width + x) * 4;
          if (Math.abs(snapPx.data[i + 1] - now.data[j2 + 1]) > 60) {
            n++;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      const z = state.zoom * (devicePixelRatio || 1);
      say(
        `  typed-undo pixel diff: ${n}px in view box x ${(x0 / z).toFixed(0)}..${(x1 / z).toFixed(0)} y ${(y0 / z).toFixed(0)}..${(y1 / z).toFixed(0)} (page pts, y from top)`
      );
      say(
        `  edited para box: x ${p.box.x.toFixed(0)}..${(p.box.x + p.box.w).toFixed(0)} yTop ${(P().pageHeight - p.box.top).toFixed(0)}..${(P().pageHeight - p.box.top + p.box.h).toFixed(0)}`
      );
    }
    const missing = before.filter((r) => !after.includes(r)).length;
    const extra = after.filter((r) => !before.includes(r)).length;
    return (
      'typed undo: ' +
      before.length +
      ' → ' +
      after.length +
      ' objects, ' +
      (missing || extra ? missing + '/' + extra + ' re-emitted, ' : '') +
      'ink ' +
      inkBefore +
      ' → edit ' +
      inkEdited +
      ' → undo ' +
      inkAfter +
      (Math.abs(inkAfter - inkBefore) <= 2
        ? ' (restored)'
        : Math.abs(inkAfter - (window.__inkVirgin ?? -1)) <= 2
          ? ' (restored to virgin)'
          : ' NOT RESTORED')
    );
  };
  const reproMoveUndo = () => {
    endEdit(false);
    const census = () => {
      const rows = [];
      for (let i = 0; i < P().objectCount(); i++) {
        const o = P().objectAt(i);
        if (!o) continue;
        const b = P().objectBounds(o.handle);
        rows.push(
          `${o.type}:${b ? b.x.toFixed(1) + ',' + b.y.toFixed(1) : '?'}`
        );
      }
      return rows;
    };
    let obj = null;
    for (let i = 0; i < P().objectCount(); i++) {
      const o = P().objectAt(i);
      if (o && o.type === OBJ.IMAGE) {
        obj = o;
        break;
      }
    }
    if (!obj) return null;
    const before = census();
    snapshotEdit('move object');
    noteMatrix(obj.handle);
    P().translateObject(obj.handle, 40, -30);
    refreshAfterMutation();
    restore(state.undo, state.redo);
    refreshModel();
    renderPage();
    const after = census();
    const same =
      before.length === after.length && before.every((r, i) => r === after[i]);
    if (same)
      return 'move undo: object census restored exactly (want restored)';
    const near = (a, b) => {
      if (a === b) return true;
      const pa = a.match(/^(\d+):(-?[\d.]+),(-?[\d.]+)$/);
      const pb = b.match(/^(\d+):(-?[\d.]+),(-?[\d.]+)$/);
      if (!pa || !pb || pa[1] !== pb[1]) return false;
      return Math.abs(pa[2] - pb[2]) <= 1.0 && Math.abs(pa[3] - pb[3]) <= 1.0;
    };
    if (
      before.length === after.length &&
      before.every((r, i) => near(r, after[i]))
    )
      return 'move undo: census restored within metric noise (≤1pt) (want restored)';
    const inkNow = inkOf();
    const virgin = Math.abs(inkNow - (window.__inkVirgin ?? -1)) <= 2;
    const diffs = [];
    for (
      let i = 0;
      i < Math.max(before.length, after.length) && diffs.length < 3;
      i++
    ) {
      if (before[i] !== after[i])
        diffs.push((before[i] ?? '-') + ' => ' + (after[i] ?? '-'));
    }
    return (
      'move undo: ' +
      (virgin
        ? 'restored to virgin bytes (census re-based, ink ' + inkNow + ')'
        : 'CENSUS DIFFERS (' +
          before.filter((r, i) => r !== after[i]).length +
          ' objects; ' +
          before.length +
          '→' +
          after.length +
          '; e.g. ' +
          diffs.join(' | ') +
          ')') +
      ' (want restored)'
    );
  };
  const reproImageMove = () => {
    const img = reproObjectMove(OBJ.IMAGE, 'image', 20, 8);
    const path = reproObjectMove(OBJ.PATH, 'path', 40, 6, 220, 80);
    return [img, path].filter(Boolean).join('; ') || null;
  };

  try {
    setTool('edit');
    say(await reproLiveFidelity());
    {
      const m = await reproTypedUndo();
      if (m) say(m);
    }
    {
      const m = reproMoveUndo();
      if (m) say(m);
    }
    say(await reproDoubleEdit());
    say(await reproReopenAfterEdit());
    const target = state.paragraphs.find(
      (p) =>
        p.editable &&
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('Revenue')
    );
    if (!target) {
      say("(no 'Revenue' paragraph — skipping click-flow section)");
      throw { skip: true };
    }
    const tr = paraRectView(target.box);
    const box = [...$('overlay').querySelectorAll('.para-box')].find(
      (d) =>
        Math.abs(parseFloat(d.style.left) - (tr.x - BOX_PAD)) < 2 &&
        Math.abs(parseFloat(d.style.top) - (tr.y - BOX_PAD)) < 2
    );
    say('para-box found: ' + !!box);
    const c = pageToClient(target.box.x + 20, target.box.top - 10);
    fire(box, 'mousedown', c.x, c.y);
    fire(window, 'mouseup', c.x, c.y);
    say('editing after click: ' + !!state.editing);

    if (state.editing) {
      const ed = state.editing.editable;
      ed.focus();
      say(
        'firstChild tag: ' +
          ed.firstChild?.nodeName +
          ' src=' +
          ed.firstChild?.dataset?.src
      );
      ed.firstChild.textContent = ed.firstChild.textContent.replace(
        'Revenue',
        'REPRO-TYPED'
      );
      const parsed = parseEditor(ed, state.editing.para.runs);
      say(
        'parsed text: ' +
          parsed
            .map((r) => r.text)
            .join('')
            .slice(0, 40)
      );
      say(
        'orig text: ' +
          state.editing.para.runs
            .map((r) => r.text)
            .join('')
            .slice(0, 40)
      );
    }
    const away = pageToClient(300, 120);
    fire(canvas, 'mousedown', away.x, away.y);
    fire(window, 'mouseup', away.x, away.y);
    say('editing after click-away: ' + !!state.editing + ' (want false)');
    refreshModel();
    const committed = state.paragraphs.some((p) =>
      p.runs
        .map((r) => r.text)
        .join('')
        .includes('REPRO-TYPED')
    );
    say('committed on click-away: ' + committed + ' (want true)');
    say(
      'stale .editor count: ' +
        document.querySelectorAll('.editor').length +
        ' (want 0)'
    );

    const rp2 = state.paragraphs.find(
      (p) =>
        p.editable &&
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('REPRO-TYPED')
    );
    if (rp2) {
      beginEdit(rp2);
      const w0 = state.editing.para.box.w;
      const handle = $('overlay').querySelector(".para-handle[data-ewrap='e']");
      say('edit-mode wrap handle present: ' + !!handle);
      if (handle) {
        const hr = handle.getBoundingClientRect();
        fire(handle, 'mousedown', hr.left + 5, hr.top + 5);
        fire(window, 'mousemove', hr.left + 5 + 80, hr.top + 5);
        fire(window, 'mouseup', hr.left + 5 + 80, hr.top + 5);
        const rp3 =
          state.editing?.para ||
          state.paragraphs.find((p) =>
            p.runs
              .map((r) => r.text)
              .join('')
              .includes('REPRO-TYPED')
          );
        const w1 = rp3?.box.w || 0;
        say(
          'box width ' +
            w0.toFixed(0) +
            ' → ' +
            w1.toFixed(0) +
            ' (want wider), still editing: ' +
            !!state.editing
        );
      }
      if (state.editing?.para) {
        const x0 = state.editing.para.box.x;
        const strip = $('overlay').querySelector('.edit-move[data-edge="n"]');
        say('edit-mode move strip present: ' + !!strip);
        if (strip) {
          const sr = strip.getBoundingClientRect();
          const cx = sr.left + sr.width / 2,
            cy = sr.top + sr.height / 2;
          fire(strip, 'mousedown', cx, cy);
          fire(window, 'mousemove', cx + 40, cy + 25);
          fire(window, 'mouseup', cx + 40, cy + 25);
          const x1 = state.editing?.para?.box.x ?? x0;
          say(
            'box x ' +
              x0.toFixed(0) +
              ' → ' +
              x1.toFixed(0) +
              ' (want bigger), still editing after move: ' +
              !!state.editing
          );
        }
      }
      if (state.editing?.para) {
        const ed = state.editing.editable;
        let textNode = null;
        const tw = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          if (n.textContent.replace(/​/g, '').length >= 6) {
            textNode = n;
            break;
          }
        }
        if (textNode && textNode.textContent.length >= 6) {
          const range = document.createRange();
          range.setStart(textNode, 0);
          range.setEnd(textNode, 5);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          const boldBtn = [...$('fToggles').children].find(
            (b) => b.dataset.t === 'bold'
          );
          const br2 = boldBtn.getBoundingClientRect();
          fire(boldBtn, 'mousedown', br2.left + 3, br2.top + 3);
          fire(boldBtn, 'mouseup', br2.left + 3, br2.top + 3);
          boldBtn.click();
          const parsed = parseEditor(ed, state.editing.para.runs);
          const boldChars = parsed
            .filter((r) => r.bold)
            .reduce((n, r) => n + r.text.length, 0);
          say(
            'real-click bold on selection: ' +
              boldChars +
              ' chars bold (want 5)'
          );

          {
            const ital = [...$('fToggles').children].find(
              (b) => b.dataset.t === 'italic'
            );
            const ir = ital.getBoundingClientRect();
            fire(ital, 'mousedown', ir.left + 3, ir.top + 3);
            fire(ital, 'mouseup', ir.left + 3, ir.top + 3);
            ital.click();
            const orig = state.editing.para.runs;
            const parsed2 = parseEditor(ed, orig);
            const inDom = parsed2
              .filter((r) => r.italic)
              .reduce((n, r) => n + r.text.length, 0);
            say(
              'italic reaches commit: ' +
                inDom +
                ' chars italic, commits=' +
                runsDiffer(parsed2, orig) +
                ' (want >0 and true)'
            );
            ital.click();

            const caret = document.createRange();
            caret.setStart(textNode, 1);
            caret.collapse(true);
            const s2 = window.getSelection();
            s2.removeAllRanges();
            s2.addRange(caret);
            state.editing.lastSel = null;
            fire(ital, 'mousedown', ir.left + 3, ir.top + 3);
            fire(ital, 'mouseup', ir.left + 3, ir.top + 3);
            ital.click();
            const whole = parseEditor(ed, orig);
            const wChars = whole
              .filter((r) => r.italic)
              .reduce((n, r) => n + r.text.length, 0);
            say(
              'italic whole-box: ' +
                wChars +
                ' chars italic, commits=' +
                runsDiffer(whole, orig) +
                ' (want >0 and true)'
            );
            ital.click();
          }
          window.getSelection().removeAllRanges();
          $('fSize').value = '21';
          $('fSize').dispatchEvent(new Event('change'));
          const parsed2 = parseEditor(ed, state.editing.para.runs);
          const bigChars = parsed2
            .filter((r) => Math.round(r.size) === 21)
            .reduce((n, r) => n + r.text.length, 0);
          say(
            'focus-stealing size change on selection: ' +
              bigChars +
              ' chars at 21pt (want 5)'
          );
        }
      }
    }
    {
      const sl = state.paragraphs.find(
        (p) =>
          p.editable &&
          p.lines.length === 1 &&
          !p.runs.some((r) => r.text.includes('\n'))
      );
      if (sl) {
        beginEdit(sl);
        const w0 = state.editing.el.offsetWidth;
        const tn = state.editing.editable.querySelector('span')?.firstChild;
        if (tn) {
          tn.textContent += ' MORE WORDS APPENDED FOR WIDTH';
          state.editing.editable.dispatchEvent(
            new Event('input', { bubbles: true })
          );
          const w1 = state.editing.el.offsetWidth;
          const ln = editorLineCount(state.editing.editable);
          say(
            'single-line live widen: ' +
              w0 +
              ' → ' +
              w1 +
              'px, lines=' +
              ln +
              ' (want wider, 1)'
          );
        }
        endEdit(false);
      }
    }
    {
      const m = reproImageMove();
      if (m) say(m);
    }
    {
      const m = await reproSynthFont();
      if (m) say(m);
    }
    {
      const m = reproRotateChrome();
      if (m) say(m);
    }
    endEdit(false);
    let mismatches = 0,
      checked = 0,
      unanchored = 0,
      pinnedN = 0,
      spilled = 0;
    for (const p of state.paragraphs.filter((q) => q.editable && !q.rotation)) {
      beginEdit(p);
      await new Promise((res) => setTimeout(res, 60));
      const shown = editorLineCount(state.editing.editable);
      const want = Math.max(1, p.lines.length);
      checked++;
      if (state.editing?.preview?.pinned) pinnedN++;
      {
        const over = editorInkOverflow(state.editing, p);
        if (over > 0) {
          spilled++;
          say(
            '  spill: "' +
              p.runs
                .map((r) => r.text)
                .join('')
                .slice(0, 24) +
              '" last line sits ' +
              over.toFixed(1) +
              'px below its box'
          );
        }
      }
      if (shown !== want) {
        mismatches++;
        say(
          '  line mismatch: "' +
            p.runs
              .map((r) => r.text)
              .join('')
              .slice(0, 90) +
            '" shows ' +
            shown +
            ' want ' +
            want +
            ' w=' +
            p.box.w.toFixed(0) +
            ' hang=' +
            (p.format.hangIndent || 0)
        );
      }

      if (state.editing?.locked && state.editing.preview) {
        const pv2 = state.editing.preview;
        const wrapR = state.editing.el.getBoundingClientRect();
        const els = [...state.editing.editable.querySelectorAll('.eline')];
        let worst = 0,
          worstK = -1;
        const pLive = state.editing.para || p;
        const pv0 = state.editing.preview.lines[0];
        const useExt2 =
          pLive.lines?.length === els.length &&
          pv0 &&
          Math.abs(pLive.lines[0].y - pv0.baseline) < 1.6 * (pv0.size || 12);
        els.forEach((d, k) => {
          const L = pv2.lines[k];
          const sp = [...d.querySelectorAll('span')].find((q) =>
            q.textContent.trim()
          );
          if (!L || !sp) return;
          const r = sp.getBoundingClientRect();
          if (!r.height) return;
          const cs2 = getComputedStyle(sp);
          const F = parseFloat(cs2.fontSize);
          const ad = fontAD(
            cs2.fontFamily,
            parseInt(cs2.fontWeight) >= 600,
            cs2.fontStyle.includes('italic')
          );
          const got = r.top + ad.a * F;
          const bl = useExt2 ? pLive.lines[k].y : L.baseline;
          const wantY = wrapR.top + EDITOR_PAD + (pv2.top - bl) * state.zoom;
          const dvv = Math.abs(got - wantY);
          if (dvv > worst) {
            worst = dvv;
            worstK = k;
          }
        });
        const sizeMax = Math.max(...p.runs.map((r) => r.size || 12));
        if (worst > Math.max(2, 0.16 * sizeMax * state.zoom)) {
          mismatches++;
          say(
            '  baseline drift: "' +
              p.runs
                .map((r) => r.text)
                .join('')
                .slice(0, 24) +
              '" line ' +
              worstK +
              ' off by ' +
              worst.toFixed(1) +
              'px (tol ' +
              Math.max(2, 0.16 * sizeMax * state.zoom).toFixed(1) +
              ')'
          );
        }
        const xd = lineXDrift(state.editing, pLive);
        if (xd && xd.worst > 1.5) {
          mismatches++;
          say(
            '  x drift: "' +
              p.runs
                .map((r) => r.text)
                .join('')
                .slice(0, 24) +
              '" line ' +
              xd.k +
              ' off by ' +
              xd.worst.toFixed(1) +
              'px'
          );
        }
        if (xd && xd.loose) unanchored += xd.loose;
      }
      endEdit(false);
    }
    say(
      'editor line-count sweep: ' +
        (checked - mismatches) +
        '/' +
        checked +
        ' exact (want all)' +
        ', ' +
        pinnedN +
        '/' +
        checked +
        " keep the page's own breaks" +
        (spilled ? ', ' + spilled + ' SPILL past their box' : ', 0 spill') +
        (unanchored ? ' [' + unanchored + ' lines not page-anchored]' : '')
    );

    {
      let sanOk = 0,
        sanN = 0;
      window.__sanctityProbe = true;
      const sanPick = (q) =>
        JSON.stringify({
          b: [q.box.x, q.box.top, q.box.w, q.box.h].map((v) => +v.toFixed(2)),
          r: q.runs.map((r) => [
            r.text,
            r.family,
            Math.round(r.size),
            r.rgba >>> 0,
            !!r.bold,
            !!r.italic,
            !!r.underline,
            !!r.strike,
            r.script | 0,
            r.renderMode | 0,
          ]),
        });
      for (const p of state.paragraphs
        .filter((q) => q.editable && !q.rotation)
        .slice(0, 8)) {
        const undo0 = state.undo.length;
        const before = sanPick(p);
        beginEdit(p);
        await new Promise((res) => setTimeout(res, 30));
        endEdit(true);
        const now = state.paragraphs.find((q) => q.id === p.id);
        sanN++;
        if (state.undo.length === undo0 && now && sanPick(now) === before)
          sanOk++;
        else {
          for (const w of window.__sanctityWhy || []) say('  differ: ' + w);
          window.__sanctityWhy = [];
          say(
            '  sanctity broken: "' +
              p.runs
                .map((r) => r.text)
                .join('')
                .slice(0, 26) +
              '"' +
              (state.undo.length !== undo0 ? ' (committed)' : ' (mutated)')
          );
        }
      }
      say('click sanctity: ' + sanOk + '/' + sanN + ' unchanged (want all)');
    }
    {
      const m = reproArabicCommit();
      if (m) say(m);
    }
    {
      const m = reproRtlBackspace();
      if (m) say(m);
    }
    {
      const m = reproRtlArrows();
      if (m) say(m);
    }
    {
      const m = reproFindReplace();
      if (m) say(m);
    }
    {
      const m = reproBlockSelect();
      if (m) say(m);
    }
    {
      const m = await reproBlockEdit();
      if (m) say(m);
    }
    {
      const m = reproRotateApply();
      if (m) say(m);
    }
    {
      const m = reproTextSelection();
      if (m) say(m);
    }
    {
      const m = await reproSpelling();
      if (m) say(m);
    }
    say(reproUndoParity());
  } catch (e) {
    if (e?.stopNow) {
      try {
        say(reproUndoParity());
      } catch {}
    } else if (e?.skip) {
      try {
        {
          const m = reproImageMove();
          if (m) say(m);
        }
        {
          const m = await reproSynthFont();
          if (m) say(m);
        }
        {
          const m = reproRotateChrome();
          if (m) say(m);
        }
        endEdit(false);
        let mismatches = 0,
          checked = 0,
          unanchored = 0;
        for (const p of state.paragraphs.filter(
          (q) => q.editable && !q.rotation
        )) {
          beginEdit(p);
          await new Promise((res) => setTimeout(res, 60));
          const shown = editorLineCount(state.editing.editable);
          const want = Math.max(1, p.lines.length);
          checked++;
          if (shown !== want) {
            mismatches++;
            say(
              '  line mismatch: "' +
                p.runs
                  .map((r) => r.text)
                  .join('')
                  .slice(0, 90) +
                '" shows ' +
                shown +
                ' want ' +
                want +
                ' w=' +
                p.box.w.toFixed(0) +
                ' hang=' +
                (p.format.hangIndent || 0)
            );
          }
          const xd = lineXDrift(state.editing, state.editing?.para || p);
          if (xd && xd.worst > 1.5) {
            mismatches++;
            say(
              '  x drift: "' +
                p.runs
                  .map((r) => r.text)
                  .join('')
                  .slice(0, 24) +
                '" line ' +
                xd.k +
                ' off by ' +
                xd.worst.toFixed(1) +
                'px'
            );
          }
          if (xd && xd.loose) unanchored += xd.loose;
          endEdit(false);
        }
        say(
          'editor line-count sweep: ' +
            (checked - mismatches) +
            '/' +
            checked +
            ' exact (want all)' +
            (unanchored ? ' [' + unanchored + ' lines not page-anchored]' : '')
        );

        {
          let sanOk = 0,
            sanN = 0;
          window.__sanctityProbe = true;
          const sanPick = (q) =>
            JSON.stringify({
              b: [q.box.x, q.box.top, q.box.w, q.box.h].map(
                (v) => +v.toFixed(2)
              ),
              r: q.runs.map((r) => [
                r.text,
                r.family,
                Math.round(r.size),
                r.rgba >>> 0,
                !!r.bold,
                !!r.italic,
                !!r.underline,
                !!r.strike,
                r.script | 0,
                r.renderMode | 0,
              ]),
            });
          for (const p of state.paragraphs
            .filter((q) => q.editable && !q.rotation)
            .slice(0, 8)) {
            const undo0 = state.undo.length;
            const before = sanPick(p);
            beginEdit(p);
            await new Promise((res) => setTimeout(res, 30));
            endEdit(true);
            const now = state.paragraphs.find((q) => q.id === p.id);
            sanN++;
            if (state.undo.length === undo0 && now && sanPick(now) === before)
              sanOk++;
            else {
              for (const w of window.__sanctityWhy || []) say('  differ: ' + w);
              window.__sanctityWhy = [];
              say(
                '  sanctity broken: "' +
                  p.runs
                    .map((r) => r.text)
                    .join('')
                    .slice(0, 26) +
                  '"' +
                  (state.undo.length !== undo0 ? ' (committed)' : ' (mutated)')
              );
            }
          }
          say(
            'click sanctity: ' + sanOk + '/' + sanN + ' unchanged (want all)'
          );
          say(reproUndoParity());
        }
        {
          const m = reproArabicCommit();
          if (m) say(m);
        }
        {
          const m = reproRtlBackspace();
          if (m) say(m);
        }
        {
          const m = reproRtlArrows();
          if (m) say(m);
        }
        {
          const m = reproFindReplace();
          if (m) say(m);
        }
        {
          const m = reproBlockSelect();
          if (m) say(m);
        }
        {
          const m = await reproBlockEdit();
          if (m) say(m);
        }
        {
          const m = reproRotateApply();
          if (m) say(m);
        }
        {
          const m = reproTextSelection();
          if (m) say(m);
        }
        {
          const m = await reproSpelling();
          if (m) say(m);
        }
      } catch (e2) {
        say('EXCEPTION: ' + (e2.stack || e2));
      }
    } else say('EXCEPTION: ' + (e.stack || e));
  }

  const pre = document.createElement('pre');
  pre.id = 'reproout';
  pre.textContent = log.join('\n');
  pre.style.cssText =
    'position:fixed;left:0;bottom:0;z-index:99;color:#0ff;background:#000;font:12px monospace;padding:6px';
  document.body.appendChild(pre);
  document.title = log.join(' | ');
}

async function runE2E() {
  const results = [];
  const check = (c, l) => results.push((c ? 'PASS ' : 'FAIL ') + l);
  try {
    setTool('edit');
    const target = state.paragraphs.find(
      (p) =>
        p.editable &&
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('Revenue')
    );
    check(!!target, 'found paragraph to edit');
    beginEdit(target);
    check(!!state.editing, 'edit overlay opened');
    const ed = state.editing.editable;
    ed.firstChild.textContent = ed.firstChild.textContent.replace(
      'Revenue',
      'BROWSER-EDIT'
    );
    endEdit(true);
    check(!state.editing, 'overlay committed/closed');
    refreshModel();
    const edited = state.paragraphs.find((p) =>
      p.runs
        .map((r) => r.text)
        .join('')
        .includes('BROWSER-EDIT')
    );
    check(!!edited, 'typed edit reflowed into the paragraph');

    const t2 = state.paragraphs.find(
      (p) =>
        p.editable &&
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('operating')
    );
    if (t2) {
      beginEdit(t2);
      state.editing.editable.firstChild.textContent += ' CLICKAWAY';
      $('stage').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      check(!state.editing, 'click outside closed the overlay');
      refreshModel();
      check(
        state.paragraphs.some((p) =>
          p.runs
            .map((r) => r.text)
            .join('')
            .includes('CLICKAWAY')
        ),
        'click outside committed the edit'
      );
    }

    {
      const ed = document.createElement('div');
      const mk = (t) => {
        const s = document.createElement('span');
        s.dataset.src = 0;
        s.dataset.family = 'Times';
        s.dataset.size = '35';
        s.dataset.rgba = '255';
        s.dataset.bold = '0';
        s.dataset.italic = '0';
        s.dataset.underline = '0';
        s.dataset.strike = '0';
        s.dataset.script = '0';
        s.textContent = t;
        return s;
      };
      ed.appendChild(mk('1997'));
      const div = document.createElement('div');
      div.appendChild(mk('ANNUAL REPORT'));
      ed.appendChild(div);
      const parsedTxt = parseEditor(ed, [])
        .map((r) => r.text)
        .join('');
      check(
        parsedTxt === '1997\nANNUAL REPORT',
        'block boundary → hard break preserved (' +
          JSON.stringify(parsedTxt) +
          ')'
      );
      const ed2 = document.createElement('div');
      const s2 = mk('1997');
      s2.appendChild(document.createElement('br'));
      s2.appendChild(document.createTextNode('ANNUAL'));
      ed2.appendChild(s2);
      check(
        parseEditor(ed2, [])
          .map((r) => r.text)
          .join('') === '1997\nANNUAL',
        '<br> → hard break preserved'
      );
    }

    setTool('edit');
    const rp = state.paragraphs.find(
      (p) =>
        p.editable &&
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('Styled fragments')
    );
    if (rp) {
      beginEdit(rp);
      const ed = state.editing.editable;
      const walkE = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
      let firstText = walkE.nextNode();
      while (
        firstText &&
        firstText.textContent.replace(/[\u200B\s]/g, '').length < 6
      )
        firstText = walkE.nextNode();
      const range = document.createRange();
      range.setStart(firstText, 0);
      range.setEnd(firstText, Math.min(6, firstText.textContent.length));
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);
      toggleStyle('bold');
      const parsed = parseEditor(ed, rp.runs);
      const boldRuns = parsed.filter((r) => r.bold);
      const plainRuns = parsed.filter((r) => !r.bold);
      check(
        boldRuns.length >= 1 &&
          plainRuns.length >= 1 &&
          boldRuns[0].text.length <= 8,
        'range styling bolded only the selection (' +
          boldRuns.map((r) => JSON.stringify(r.text.slice(0, 8))).join(',') +
          ')'
      );
      endEdit(true);
      refreshModel();
    }

    setTool('edit');
    const sp = state.paragraphs.find(
      (p) =>
        p.editable &&
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('back to plain')
    );
    if (sp) {
      beginEdit(sp);
      window.getSelection().selectAllChildren(state.editing.editable);
      toggleStyle('underline');
      endEdit(true);
      refreshModel();
      const after = state.paragraphs.find((p) =>
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('back to plain')
      );
      check(
        after && after.runs.some((r) => r.underline),
        'style-only edit (underline) committed without text change'
      );
    }

    setTool('edit');
    drawOverlay();
    const a =
      state.paragraphs.find(
        (p) =>
          p.editable &&
          p.runs
            .map((r) => r.text)
            .join('')
            .includes('Section Overview')
      ) || state.paragraphs.find((p) => p.editable);
    if (a) {
      beginEdit(a);
      state.editing.editable.querySelector('span').textContent += ' SWITCH1';
      const b = state.paragraphs.find((p) => p.editable && p.id !== a.id);
      if (b) {
        beginEdit(b);
        check(
          state.editing?.para?.id === b.id,
          'switched editing to another paragraph'
        );
        endEdit(true);
        refreshModel();
        check(
          state.paragraphs.some((p) =>
            p.runs
              .map((r) => r.text)
              .join('')
              .includes('SWITCH1')
          ),
          'first paragraph auto-committed when switching'
        );
      }
    }

    const edited2 = state.paragraphs.find((p) =>
      p.runs
        .map((r) => r.text)
        .join('')
        .includes('BROWSER-EDIT')
    );
    state.selection = { kind: 'para', para: edited2 || edited };
    toggleStyle('bold');
    const after = state.paragraphs.find((p) =>
      p.runs
        .map((r) => r.text)
        .join('')
        .includes('BROWSER-EDIT')
    );
    check(after && after.runs.some((r) => r.bold), 'inspector bold applied');

    const n = replaceAll('percent', 'PCT', false);
    check(n >= 1, 'replace all worked (' + n + ')');

    const before = state.paragraphs.length;
    snapshotEdit('add text');
    const created = P().addParagraph(
      72,
      250,
      200,
      [
        {
          text: 'E2E added box',
          family: 'Helvetica',
          size: 12,
          rgba: 0x000000ff >>> 0,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          script: 0,
          renderMode: 0,
          strokeRgba: 0,
          strokeWidth: 1,
          hScale: 1,
          rise: 0,
          sourceIndex: -1,
        },
      ],
      { align: 0, lineSpacing: 1.2, charSpacing: 0, paraSpacing: 0 }
    );
    if (created) state.paragraphs.push(created);
    check(created && state.paragraphs.length === before + 1, 'add text box');

    P().loadPage(0);
    refreshModel();
    let imgHandle = 0;
    for (let i = 0; i < P().objectCount(); i++) {
      const o = P().objectAt(i);
      if (o && o.type === OBJ.IMAGE) {
        imgHandle = o.handle;
        break;
      }
    }
    check(!!imgHandle, 'found image object');
    if (imgHandle) {
      const b0 = P().objectBounds(imgHandle);
      P().scaleObject(imgHandle, 1.5, 1.5, b0.x, b0.y);
      const b1 = P().objectBounds(imgHandle);
      check(Math.abs(b1.w - b0.w * 1.5) < 2, 'object resize (scale) applied');
      P().rotateObject(imgHandle, 90);
      check(true, 'object rotate applied');
      const objN = P().objectCount();
      const clone = P().duplicateImage(imgHandle, 15, -15);
      check(
        clone && P().objectCount() === objN + 1,
        'image duplicate created new object'
      );
      check(P().arrangeObject(clone, 'back'), 'arrange z-order applied');
    }

    const pxW = 30,
      pxH = 30,
      px = new Uint8Array(pxW * pxH * 4);
    for (let i = 0; i < px.length; i += 4) {
      px[i] = 200;
      px[i + 1] = 60;
      px[i + 2] = 60;
      px[i + 3] = 255;
    }
    const nBefore = P().objectCount();
    const imgObj = P().insertImage(px, pxW, pxH, 100, 100, 60, 60);
    check(
      imgObj && P().objectCount() === nBefore + 1,
      'add image inserted object'
    );

    setTool('addText');
    const pCount = state.paragraphs.length;
    beginNewTextBox(120, 400, 14);
    check(
      !!state.editing && !!state.editing.newGeom,
      'add-text opened inline empty box'
    );
    state.editing.editable.firstChild.textContent =
      'Typed a brand new text box';
    endEdit(true);
    refreshModel();
    check(
      state.paragraphs.some((p) =>
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('brand new text box')
      ),
      'inline add-text created a paragraph'
    );

    setTool('edit');
    const mp = state.paragraphs.find(
      (p) =>
        p.editable &&
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('BROWSER-EDIT')
    );
    if (mp) {
      const x0 = mp.box.x;
      P().moveParagraph(mp.id, 20, 0);
      refreshModel();
      const mp2 = state.paragraphs.find((p) =>
        p.runs
          .map((r) => r.text)
          .join('')
          .includes('BROWSER-EDIT')
      );
      check(mp2 && Math.abs(mp2.box.x - x0 - 20) < 1.5, 'paragraph moved 20pt');
      const lc0 = mp2.lines.length;
      const rz = P().resizeParagraph(mp2.id, mp2.box.w * 0.5);
      check(
        rz && rz.lines.length >= lc0,
        'paragraph wrap-width resize reflowed'
      );
    }

    refreshModel();
    const dsrc = state.paragraphs.find(
      (p) => p.editable && !p.rotation && p.runs.length >= 1
    );
    if (dsrc) {
      const dup = P().duplicateParagraph(dsrc.id, 12, -12);
      check(!!dup, 'paragraph duplicate created');
      if (dup) {
        check(
          dup.runs[0].family === dsrc.runs[0].family &&
            Math.abs(dup.box.w - dsrc.box.w) < 1.0,
          'paragraph duplicate keeps font + width (' +
            dup.runs[0].family +
            ', ' +
            dup.box.w.toFixed(1) +
            ' vs ' +
            dsrc.box.w.toFixed(1) +
            ')'
        );
      }
    }

    {
      const buf = await (await fetch('sample.pdf')).arrayBuffer();
      const dt = new DataTransfer();
      dt.items.add(new File([buf], 'dropped.pdf', { type: 'application/pdf' }));
      const ev = new Event('drop', { bubbles: true, cancelable: true });
      ev.dataTransfer = dt;
      const nameBefore = state.fileName;
      window.dispatchEvent(
        Object.defineProperty(ev, 'dataTransfer', { value: dt })
      );
      for (let w = 0; w < 40 && !state.fileName.includes('dropped'); w++)
        await new Promise((r) => setTimeout(r, 150));
      check(
        state.fileName.includes('dropped') && state.paragraphs.length > 0,
        'drag-drop opens the PDF (' +
          state.fileName +
          ', ' +
          state.paragraphs.length +
          ' paras)'
      );
    }

    {
      const scopeSel = $('editScope');
      const anyPara = state.paragraphs.find((q) => q.editable);
      const pc =
        anyPara && textToPage(anyPara, anyPara.box.x + 4, anyPara.box.top - 4);
      scopeSel.value = 'image';
      scopeSel.dispatchEvent(new Event('change'));
      const paraHitInImageScope = pc ? hitTestParagraph(pc.x, pc.y) : null;
      scopeSel.value = 'text';
      scopeSel.dispatchEvent(new Event('change'));
      let objHitInTextScope = null;
      for (let i = 0; i < P().objectCount() && !objHitInTextScope; i++) {
        const o = P().objectAt(i);
        if (o && (o.type === OBJ.IMAGE || o.type === OBJ.PATH)) {
          const b = P().objectBounds(o.handle);
          if (b)
            objHitInTextScope = hitTestObject(b.x + b.w / 2, b.y + b.h / 2);
        }
      }
      const paraHitInTextScope = pc ? hitTestParagraph(pc.x, pc.y) : null;
      scopeSel.value = 'all';
      scopeSel.dispatchEvent(new Event('change'));
      check(
        !paraHitInImageScope && !objHitInTextScope && !!paraHitInTextScope,
        'edit scope gates hit-testing (image blocks text; text blocks objects)'
      );
    }
  } catch (e) {
    results.push('EXCEPTION: ' + ((e && e.stack) || e));
  }
  const ok = results.every((r) => r.startsWith('PASS'));
  const out = document.createElement('pre');
  out.id = 'e2eout';
  out.textContent = results.join('\n');
  out.style.cssText =
    'position:fixed;left:0;bottom:0;z-index:99;color:#0f0;background:#000;font:11px monospace;padding:4px';
  document.body.appendChild(out);
  document.title = ok ? 'E2E-GREEN' : 'E2E-FAIL';
}

function renderPage() {
  const eng = P();
  let hide =
    state.editing?.para && !state.editing.pristine
      ? eng.paragraphObjects(state.editing.para.id)
      : null;
  if (hide && state.editing.para.runs) {
    for (const r of state.editing.para.runs)
      if (r.atomic && r.obj) hide.push(r.obj);
  }
  const img = eng.renderPage(state.zoom * devicePixelRatio, hide);
  const canvas = $('page');
  if (canvas.width !== img.width || canvas.height !== img.height) {
    canvas.width = img.width;
    canvas.height = img.height;
  }
  const cssW = eng.pageWidth * state.zoom + 'px';
  const cssH = eng.pageHeight * state.zoom + 'px';
  if (canvas.style.width !== cssW) canvas.style.width = cssW;
  if (canvas.style.height !== cssH) canvas.style.height = cssH;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
  const overlay = $('overlay');
  if (overlay.style.width !== cssW) overlay.style.width = cssW;
  if (overlay.style.height !== cssH) overlay.style.height = cssH;
  drawOverlay();
  drawRulers();
}

let scanningPages = false;

function refreshModel() {
  engineStepEnd();
  state.paragraphs = P().buildModel();
  if (scanningPages) return;
  refreshPageExtras();
}

function refreshPageExtras() {
  prewarmDocFonts();
  const invisibles = state.paragraphs.filter((p) => p.invisible).length;
  if (
    invisibles &&
    !state.paragraphs.some((p) => p.editable) &&
    state.ocrNoticeFor !== P().pageIndex
  ) {
    state.ocrNoticeFor = P().pageIndex;
    toast(
      'Scanned page: its ' +
        invisibles +
        ' text blocks are an invisible ' +
        'OCR layer over the picture — searchable and selectable, but there ' +
        'are no glyphs to edit.'
    );
  }
  if (state.patternPageFor !== P().pageIndex) {
    state.patternPageFor = P().pageIndex;
    state.patternPage = false;
    const want = P().pageIndex,
      bytes = P()._originalBytes;
    if (bytes) {
      pageHasPatternFill(bytes, want)
        .then((v) => {
          if (state.patternPageFor === want) state.patternPage = v;
        })
        .catch(() => {});
    }
  }
}

let liveBlockMove = null;
const liveShift = (q) => {
  if (!liveBlockMove || !q.blockId || q.blockId !== liveBlockMove.blockId)
    return q;
  const dT = pageToText(q, liveBlockMove.dx, liveBlockMove.dy);
  return { ...q, box: { ...q.box, x: q.box.x + dT.x, top: q.box.top + dT.y } };
};

function blockPlacement(para) {
  const pl = paraPlacement(liveShift(para));
  if (!para.blockId) return pl;
  let x = pl.x,
    y = pl.y,
    r = pl.x + pl.w,
    b = pl.y + pl.h;
  for (const q of state.paragraphs) {
    if (q.blockId !== para.blockId || q.id === para.id) continue;
    const o = paraPlacement(liveShift(q));
    if (Math.abs((o.rot || 0) - (pl.rot || 0)) > 0.01) continue;
    x = Math.min(x, o.x);
    y = Math.min(y, o.y);
    r = Math.max(r, o.x + o.w);
    b = Math.max(b, o.y + o.h);
  }
  return { ...pl, x, y, w: r - x, h: b - y };
}

function drawOverlay() {
  const ov = $('overlay');
  const keepParaLayer = inPreviewPass && !!ov.querySelector('.para-layer');
  [...ov.children].forEach((c) => {
    if (c === state.editing?.el) return;
    if (keepParaLayer && c.classList.contains('para-layer')) return;
    c.remove();
  });

  const selPara =
    state.selection?.kind === 'para' ? state.selection.para : null;
  const editingId = state.editing?.para?.id;

  if (state.tool === 'edit' && scopeAllowsPara() && !keepParaLayer) {
    const layer = document.createElement('div');
    layer.className = 'para-layer';
    ov.appendChild(layer);
    const blocks = new Map();
    for (const para of state.paragraphs) {
      if (!para.blockId || para.invisible || !para.editable) continue;
      const pl = paraPlacement(liveShift(para));
      const b = blocks.get(para.blockId);
      if (!b)
        blocks.set(para.blockId, {
          x: pl.x,
          y: pl.y,
          r: pl.x + pl.w,
          b: pl.y + pl.h,
        });
      else {
        b.x = Math.min(b.x, pl.x);
        b.y = Math.min(b.y, pl.y);
        b.r = Math.max(b.r, pl.x + pl.w);
        b.b = Math.max(b.b, pl.y + pl.h);
      }
    }
    const openBlock = state.editing?.para?.blockId || 0;
    for (const [id, g] of blocks) {
      const div = document.createElement('div');
      div.className =
        'para-box block-box' + (id === openBlock ? ' active' : '');
      applyPlacement(
        div,
        { x: g.x, y: g.y, w: g.r - g.x, h: g.b - g.y },
        BOX_PAD
      );
      div.style.pointerEvents = 'none';
      layer.appendChild(div);
    }
    for (const para of state.paragraphs) {
      if (para.id === editingId) continue;
      const inBlock = !!para.blockId && para.editable && !para.invisible;
      if (para.invisible) continue;
      if (!para.editable) continue;
      const div = document.createElement('div');
      div.className = 'para-box' + (inBlock ? ' in-block' : '');
      applyPlacement(div, paraPlacement(liveShift(para)), BOX_PAD);
      if (para.editable) {
        div.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          if (e.shiftKey) {
            toggleMultiSelect({ t: 'para', para });
            return;
          }
          beginEdit(para, { x: e.clientX, y: e.clientY });
        });
        attachParaLongPress(div, para);
      }
      layer.appendChild(div);
    }
  }

  if (state.editing?.para || state.editing?.newGeom) {
    const wrap = ov.querySelector('.editor');
    if (wrap) {
      const blk = state.editing.para?.blockId
        ? blockPlacement(state.editing.para)
        : null;
      const w = blk ? blk.w : wrap.offsetWidth;
      const h = blk ? blk.h : wrap.offsetHeight;
      const chrome = document.createElement('div');
      chrome.className = 'edit-chrome';
      chrome.style.left = blk ? blk.x + 'px' : wrap.style.left;
      chrome.style.top = blk ? blk.y + 'px' : wrap.style.top;
      chrome.style.width = w + 'px';
      chrome.style.height = h + 'px';
      chrome.style.transform = blk
        ? blk.deg
          ? `rotate(${blk.deg}deg)`
          : ''
        : wrap.style.transform;
      chrome.style.transformOrigin = '0 0';
      const S = 7;
      for (const [edge, sx, sy, sw, sh] of [
        ['n', -S, -S, w + 2 * S, S],
        ['s', -S, h, w + 2 * S, S],
        ['w', -S, 0, S, h],
        ['e', w, 0, S, h],
      ]) {
        const st = document.createElement('div');
        st.className = 'edit-move';
        st.dataset.edge = edge;
        Object.assign(st.style, {
          left: sx + 'px',
          top: sy + 'px',
          width: sw + 'px',
          height: sh + 'px',
        });
        chrome.appendChild(st);
      }
      if (blk) {
        ov.appendChild(chrome);
        return;
      }
      for (const [name, fx] of [
        ['w', 0],
        ['e', 1],
      ]) {
        const hd = document.createElement('div');
        hd.className = 'obj-handle para-handle';
        hd.dataset.ewrap = name;
        hd.style.left = w * fx - 5 + 'px';
        hd.style.top = h / 2 - 5 + 'px';
        hd.style.cursor = 'ew-resize';
        chrome.appendChild(hd);
      }
      const rh = document.createElement('div');
      rh.className = 'obj-handle rot-handle';
      rh.title = 'Drag to rotate';
      rh.style.left = w / 2 - 5 + 'px';
      rh.style.top = '-24px';
      chrome.appendChild(rh);
      const stem = document.createElement('div');
      stem.className = 'rot-stem';
      stem.style.left = w / 2 + 'px';
      chrome.appendChild(stem);
      ov.appendChild(chrome);
    }
    return;
  }

  if (state.selection?.kind === 'multi') {
    for (const it of state.selection.items) {
      const box = document.createElement('div');
      box.className = 'multi-box';
      if (it.t === 'para') applyPlacement(box, paraPlacement(it.para));
      else {
        const r = objRectView(it.bounds);
        Object.assign(box.style, {
          left: r.x + 'px',
          top: r.y + 'px',
          width: r.w + 'px',
          height: r.h + 'px',
        });
      }
      box.dataset.idx = state.selection.items.indexOf(it);
      ov.appendChild(box);
    }
    return;
  }

  if (state.selection?.kind === 'object') {
    const r0 = objRectView(state.selection.bounds);
    const r = {
      x: r0.x - BOX_PAD,
      y: r0.y - BOX_PAD,
      w: r0.w + 2 * BOX_PAD,
      h: r0.h + 2 * BOX_PAD,
    };
    const box = document.createElement('div');
    box.className = 'obj-box';
    Object.assign(box.style, {
      left: r.x + 'px',
      top: r.y + 'px',
      width: r.w + 'px',
      height: r.h + 'px',
    });
    box.addEventListener('mousemove', (e) => {
      const pt = toPage(e);
      box.style.cursor = hitTestParagraphStrong(pt.px, pt.py) ? 'text' : 'move';
    });
    ov.appendChild(box);
    const HANDLES = [
      ['nw', 0, 0],
      ['n', 0.5, 0],
      ['ne', 1, 0],
      ['e', 1, 0.5],
      ['se', 1, 1],
      ['s', 0.5, 1],
      ['sw', 0, 1],
      ['w', 0, 0.5],
    ];
    for (const [name, fx, fy] of HANDLES) {
      const h = document.createElement('div');
      h.className = 'obj-handle';
      h.dataset.handle = name;
      h.style.left = r.x + r.w * fx - 5 + 'px';
      h.style.top = r.y + r.h * fy - 5 + 'px';
      h.style.cursor =
        name === 'n' || name === 's'
          ? 'ns-resize'
          : name === 'e' || name === 'w'
            ? 'ew-resize'
            : name === 'nw' || name === 'se'
              ? 'nwse-resize'
              : 'nesw-resize';
      ov.appendChild(h);
    }
    const rh = document.createElement('div');
    rh.className = 'obj-handle rot-handle';
    rh.title = 'Drag to rotate';
    rh.style.left = r.x + r.w / 2 - 5 + 'px';
    rh.style.top = r.y - 24 + 'px';
    ov.appendChild(rh);
    const stem = document.createElement('div');
    stem.className = 'rot-stem';
    stem.style.left = r.x + r.w / 2 + 'px';
    stem.style.top = r.y - 14 + 'px';
    stem.style.height = '14px';
    ov.appendChild(stem);
  } else if (selPara) {
    const pl = blockPlacement(selPara);
    const chrome = document.createElement('div');
    chrome.className = 'sel-chrome';
    applyPlacement(chrome, pl);
    const box = document.createElement('div');
    box.className = 'sel-para';
    Object.assign(box.style, {
      left: -BOX_PAD + 'px',
      top: -BOX_PAD + 'px',
      width: pl.w + 2 * BOX_PAD + 'px',
      height: pl.h + 2 * BOX_PAD + 'px',
    });
    chrome.appendChild(box);
    for (const [name, fx] of [
      ['w', 0],
      ['e', 1],
    ]) {
      const h = document.createElement('div');
      h.className = 'obj-handle para-handle';
      h.dataset.phandle = name;
      h.style.left = pl.w * fx - 5 + 'px';
      h.style.top = pl.h / 2 - 5 + 'px';
      h.style.cursor = 'ew-resize';
      chrome.appendChild(h);
    }
    const rh = document.createElement('div');
    rh.className = 'obj-handle rot-handle';
    rh.title = 'Drag to rotate';
    rh.style.left = pl.w / 2 - 5 + 'px';
    rh.style.top = '-24px';
    chrome.appendChild(rh);
    const stem = document.createElement('div');
    stem.className = 'rot-stem';
    stem.style.left = pl.w / 2 + 'px';
    chrome.appendChild(stem);
    ov.appendChild(chrome);
  }
}

let engineStepOpen = false;
function engineStepBegin(label) {
  if (engineStepOpen) engineStepEnd();
  P().historyBeginStep(label);
  engineStepOpen = true;
  queueMicrotask(engineStepEnd);
}
function engineStepEnd() {
  if (!engineStepOpen) return;
  engineStepOpen = false;
  P().historyEndStep();
}
function noteMatrix(handle) {
  P().historyNoteMatrix(handle);
}
function noteZOrder(handle) {
  P().historyNoteZOrder(handle);
}
function noteInsert(handle) {
  P().historyNoteInsert(handle);
}

function syncHistoryPins() {
  const eng = P();
  if (!eng) return;
  const pins = new Set();
  for (const s of state.undo) if (Number.isInteger(s.page)) pins.add(s.page);
  for (const s of state.redo) if (Number.isInteger(s.page)) pins.add(s.page);
  eng.pinnedPages = pins;
  eng.onPageEvicted = (idx) => {
    state.undo = state.undo.filter((s) => s.page !== idx);
    state.redo = state.redo.filter((s) => s.page !== idx);
  };
}

function snapshotEdit(label, para) {
  if (window.__undoTrace)
    (window.__ledger ||= []).push(
      `push:${label}${para && (para.unwrapsForms || para.sharesObjects) ? '(bytes:para)' : ''}`
    );
  if (para && (para.unwrapsForms || para.sharesObjects)) {
    snapshot();
    return;
  }
  if (P().pageWasNormalized()) {
    snapshot();
    return;
  }
  if (P().normalizeFontsForEdit() > 0) {
    snapshot();
    return;
  }
  engineStepBegin(label || 'edit');
  pushUndo({
    engine: true,
    epoch: state.docEpoch,
    page: P().pageIndex,
    label,
    what: para
      ? (para.runs || [])
          .map((r) => r.text)
          .join('')
          .slice(0, 18)
      : '',
  });
  syncHistoryPins();
}

function snapshot() {
  if (window.__undoTrace) (window.__ledger ||= []).push('push:BYTES');
  engineStepEnd();
  if (!state.dirty && P()._originalBytes) {
    pushUndo({ bytes: P()._originalBytes, page: P().pageIndex });
    return;
  }
  P().normalizeFontsForEdit();
  if (
    !state.patternPage &&
    !P().pageRegenHostile() &&
    !(P()._spliceOk !== false && P()._splicePlans?.length)
  )
    P().generateContent();
  const bytes = P().save({ incremental: snapshotPrefersIncremental() });
  if (bytes) pushUndo({ bytes, page: P().pageIndex });
}

function snapshotPrefersIncremental() {
  const size = P()._originalBytes?.length || 0;
  return size > 0 && size <= INCREMENTAL_SNAPSHOT_LIMIT;
}
function restore(from, to) {
  if (window.__undoTrace)
    (window.__ledger ||= []).push(
      `restore:${from === state.undo ? 'undo' : 'redo'}@${from.length}${from.length ? (from[from.length - 1].engine ? ':eng:' + (from[from.length - 1].label || '') : ':bytes') : ''}`
    );
  if (!from.length) return;
  engineStepEnd();
  const undoing = from === state.undo;
  while (
    from.length &&
    from[from.length - 1].engine &&
    from[from.length - 1].epoch !== state.docEpoch
  ) {
    from.pop();
  }
  if (!from.length) return;
  if (from[from.length - 1].engine) {
    const next = from[from.length - 1];
    if (Number.isInteger(next.page) && next.page !== P().pageIndex) {
      endEdit(false);
      goToPage(next.page);
      refreshModel();
    }
    const snap = from.pop();
    endEdit(false);
    const ok = undoing ? P().historyUndo() : P().historyRedo();
    if (!ok) {
      const depth = P().historyDepth();
      if ((undoing ? depth.undo : depth.redo) > 0) from.push(snap);
      toast('Nothing to ' + (undoing ? 'undo' : 'redo'));
      updateChrome();
      return;
    }
    to.push(snap);
    syncHistoryPins();
    refreshModel();
    state.selection = null;
    state.dirty = true;
    renderPage();
    updateChrome();
    return;
  }
  const cur = P().save({ incremental: true });
  const curPage = P().pageIndex;
  const snap = from.pop();
  endEdit(false);
  try {
    P().reopen(snap.bytes, snap.page);
    state.docEpoch++;
  } catch (err) {
    from.push(snap);
    toast('Undo failed: ' + err.message);
    return;
  }
  if (cur) to.push({ bytes: cur, page: curPage, epoch: state.docEpoch });
  if (snap.bytes === P()._originalBytes) state.dirty = false;
  refreshModel();
  state.selection = null;
  state.dirty = true;
  renderPage();
  updateChrome();
}

const docFonts = new Map();
const docFontsReady = new Map();
const docFontsNull = new Set();
let docFontSeq = 0;
let inPreviewPass = false;

if (typeof document !== 'undefined' && document.fonts?.addEventListener) {
  document.fonts.addEventListener('loadingdone', () => {
    lockedEpoch++;
  });
}

function isLoadableSfnt(bytes) {
  if (bytes.length < 4) return false;
  const b = bytes;
  const tag = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
  return (
    tag === 0x00010000 ||
    tag === 0x4f54544f ||
    tag === 0x74727565 ||
    tag === 0x74746366 ||
    tag === 0x774f4646 ||
    tag === 0x774f4632
  );
}

async function ensureRunFont(para, runIndex, run) {
  const key = docFontKey(run);
  const hit = docFonts.get(key);
  if (hit) return hit.promise;
  const promise = (async () => {
    const load = async (bytes) => {
      const cssFamily = 'ecdoc' + docFontSeq++;
      const face = new FontFace(cssFamily, bytes.buffer);
      await face.load();
      document.fonts.add(face);
      return cssFamily;
    };
    try {
      const synth = P().synthRunFont(para.id, runIndex);
      if (synth === 'dishonest') return null;
      if (synth) return await load(synth);
    } catch {}
    const bytes = P().runFontData(para.id, runIndex);
    try {
      if (bytes && isLoadableSfnt(bytes)) return await load(bytes);
    } catch {}
    return null;
  })();
  docFonts.set(key, { promise });
  promise.then((fam) => {
    if (fam) {
      docFontsReady.set(key, fam);
      lockedEpoch++;
    } else {
      docFontsNull.add(key);
    }
  });
  return promise;
}

async function applyDocFonts(para, ed) {
  const spans = [...ed.querySelectorAll('span[data-src]')];
  const pending = [];
  for (const s of spans) {
    if (s.dataset.atomic === '1') continue;
    const idx = parseInt(s.dataset.src);
    if (!(idx >= 0) || idx >= para.runs.length) continue;
    const run = para.runs[idx];
    const key = docFontKey(run);
    const fam = docFontsReady.get(key);
    if (fam) {
      if (s.dataset.docfont !== fam) {
        s.dataset.docfont = fam;
        s.dataset.docfontFor = s.dataset.family;
        s.dataset.docfontB = run.bold === 2 ? '2' : run.bold ? '1' : '0';
        s.dataset.docfontI = run.italic === 2 ? '2' : run.italic ? '1' : '0';
        applySpanStyle(s);
      }
      continue;
    }
    if (docFontsNull.has(key)) continue;
    pending.push([s, idx, run]);
  }
  if (pending.length) {
    await Promise.all(
      pending.map(async ([s, idx, run]) => {
        const fam = await ensureRunFont(para, idx, run);
        if (fam && state.editing?.editable === ed) {
          s.dataset.docfont = fam;
          s.dataset.docfontFor = s.dataset.family;
          s.dataset.docfontB = run.bold === 2 ? '2' : run.bold ? '1' : '0';
          s.dataset.docfontI = run.italic === 2 ? '2' : run.italic ? '1' : '0';
          applySpanStyle(s);
        }
      })
    );
  }
  if (state.editing?.editable === ed) fitEditorWidth();
}

function editorLineCount(ed) {
  if (ed.dataset?.locked === '1') return ed.querySelectorAll('.eline').length;
  const range = document.createRange();
  range.selectNodeContents(ed);
  const rects = [...range.getClientRects()]
    .filter((r) => r.height > 0 && r.width > 0)
    .sort((a, b) => a.top - b.top);
  let lines = 0,
    lastBottom = -1e9;
  for (const r of rects) {
    if (r.top >= lastBottom - r.height * 0.4) {
      lines++;
      lastBottom = r.bottom;
    } else lastBottom = Math.max(lastBottom, r.bottom);
  }
  return lines;
}

function fitEditorWidth() {
  const e = state.editing;
  if (!e?.para || !e.el?.isConnected) return;
  if (e.locked) {
    if (!inPreviewPass) drawOverlay();
    return;
  }
  if (e.para.rotation) {
    drawOverlay();
    return;
  }
  if (e.singleLine) {
    drawOverlay();
    return;
  }
  const target = Math.max(1, e.para.lines.length);
  const baseW = e.baseW ?? parseFloat(e.el.style.width);
  const step = Math.max(2, baseW * 0.01);
  const minW = baseW * 0.88,
    maxW = baseW * 1.25;
  const setW = (w) => {
    e.el.style.width = w + 'px';
    return editorLineCount(e.editable);
  };
  let w = baseW,
    n = setW(w),
    guard = 0;
  if (n > target) {
    while (n > target && w < maxW && guard++ < 60) n = setW((w += step));
  } else if (n < target) {
    while (n < target && w > minW && guard++ < 60) n = setW((w -= step));
    if (n > target) setW((w += step));
  }
  drawOverlay();
}

function placeCaret(ed, clientX, clientY) {
  const sel = window.getSelection();
  let range = null;
  if (clientX != null) {
    if (document.caretRangeFromPoint)
      range = document.caretRangeFromPoint(clientX, clientY);
    else if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(clientX, clientY);
      if (p) {
        range = document.createRange();
        range.setStart(p.offsetNode, p.offset);
        range.collapse(true);
      }
    }
  }
  if (range && ed.contains(range.startContainer)) {
    if (ed.dataset.locked === '1') {
      const off = lockedPointOffset(
        ed,
        range.startContainer,
        range.startOffset
      );
      if (off >= 0) {
        lockedCaretSet(ed, off);
        return;
      }
    }
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    sel.selectAllChildren(ed);
    sel.collapseToEnd();
  }
}

let fontPrewarmTimer = 0;
function prewarmDocFonts() {
  clearTimeout(fontPrewarmTimer);
  const queue = [];
  const seen = new Set();
  for (const para of state.paragraphs) {
    if (!para.editable || !para.runs) continue;
    para.runs.forEach((run, idx) => {
      const key = docFontKey(run);
      if (seen.has(key) || docFonts.has(key)) return;
      seen.add(key);
      queue.push([para, idx, run]);
    });
  }
  const step = () => {
    const item = queue.shift();
    if (!item) return;
    if (P()?.doc) ensureRunFont(item[0], item[1], item[2]).catch(() => {});
    fontPrewarmTimer = setTimeout(step, 40);
  };
  fontPrewarmTimer = setTimeout(step, 250);
}

function unpristine() {
  const es = state.editing;
  if (!es?.pristine) return;
  es.pristine = false;
  es.el.classList.remove('pristine');
  renderPage();
}

function openEditor(spec, caret) {
  endEdit(true);
  let openPv = null;
  const ov = $('overlay');
  const wrap = document.createElement('div');
  wrap.className = 'editor' + (spec.para?.blockId ? ' in-block' : '');
  const pad = EDITOR_PAD;
  const ed = document.createElement('div');
  ed.contentEditable = 'true';
  ed.spellcheck = $('spellchk')?.checked || false;
  ed.dir = 'auto';

  let singleLine = false;
  if (spec.para) {
    const para = spec.para;
    state.selection = { kind: 'para', para };
    const pl = paraPlacement(para);
    singleLine =
      para.lines.length === 1 && !para.runs.some((r) => r.text.includes('\n'));
    Object.assign(wrap.style, {
      width: pl.w + pad * 2 + 'px',
      minHeight: pl.h + pad * 2 + 'px',
      padding: pad + 'px',
    });
    if (singleLine) {
      wrap.style.width = 'auto';
      wrap.style.minWidth = pl.w + pad * 2 + 'px';
    }
    positionWrap(wrap, para);
    ed.style.lineHeight = para.format.lineSpacing || 1.2;
    ed.style.textAlign =
      ['left', 'center', 'right', 'justify'][para.format.align] || 'left';
    ed.style.letterSpacing =
      para.format.charSpacing || 0
        ? para.format.charSpacing * state.zoom + 'px'
        : '';
    if (para.vertical) {
      ed.style.writingMode = 'vertical-rl';
      wrap.style.height = pl.h + pad * 2 + 'px';
      wrap.style.width = 'auto';
      wrap.style.minWidth = pl.w + pad * 2 + 'px';
      singleLine = false;
    }
    let lockedPv = null;
    if (!para.vertical) {
      try {
        lockedPv = P().previewParagraph(
          para.id,
          runsToInput(para.runs),
          para.format
        );
      } catch {
        lockedPv = null;
      }
      if (lockedPv && lockedPv.lines.length) {
        openPv = lockedPv;
        renderLockedLines(ed, para.runs, lockedPv, para, para.box.x);
        singleLine = false;
        const countable = (s) => s.replace(/[\u200B\u2060\n]/g, '').length;
        const wantChars = para.runs.reduce(
          (n, r) => n + (r.text ? countable(r.text) : 0),
          0
        );
        const gotChars = countable(ed.textContent);
        if (wantChars > 0 && gotChars < wantChars * 0.98) {
          ed.textContent = '';
          delete ed.dataset.locked;
          ed.style.textAlign = '';
          openPv = null;
          lockedPv = null;
        }
      } else {
        lockedPv = null;
      }
    }
    if (!lockedPv) {
      for (let i = 0; i < para.runs.length; i++)
        ed.appendChild(runSpan(para.runs[i], i));
    }
  } else {
    const g = spec.newGeom;
    const vx = g.x * state.zoom,
      vy = (P().pageHeight - g.yTop) * state.zoom;
    Object.assign(wrap.style, {
      left: vx - pad + 'px',
      top: vy - pad + 'px',
      width: g.width * state.zoom + 'px',
      minHeight: g.size * 1.4 * state.zoom + 'px',
      padding: pad + 'px',
    });
    ed.style.lineHeight = 1.25;
    ed.appendChild(
      runSpan(
        {
          text: '',
          family: g.seedFamily || 'Helvetica',
          size: g.size,
          rgba: cssHexToRgba($('fColor').value || '#000000'),
          bold: !!g.seedBold,
          italic: false,
          underline: false,
          strike: false,
          script: 0,
        },
        -1
      )
    );
  }
  ed.style.whiteSpace =
    singleLine || ed.dataset.locked === '1' ? 'pre' : 'pre-wrap';
  ed.style.overflowWrap = 'break-word';
  ed.style.width = '100%';
  wrap.appendChild(ed);
  ov.appendChild(wrap);
  setTimeout(() => {
    try {
      P().normalizeFontsForEdit();
    } catch {}
  }, 0);
  state.editing = {
    para: spec.para || null,
    el: wrap,
    editable: ed,
    newGeom: spec.newGeom || null,
    baseW:
      parseFloat(wrap.style.width) ||
      (spec.para ? paraPlacement(spec.para).w : 0),
    lastSel: null,
    singleLine,
    locked: ed.dataset.locked === '1',
    preview: openPv,
    pristine: !!spec.para && ed.dataset.locked === '1',
  };
  if (state.editing.pristine) wrap.classList.add('pristine');
  else if (spec.para) renderPage();
  ed.focus();
  placeCaret(ed, caret?.x, caret?.y);
  const refocus = () => {
    if (state.editing?.editable === ed && document.activeElement !== ed)
      ed.focus({ preventScroll: true });
  };
  setTimeout(refocus, 0);
  wrap.addEventListener('mouseup', () => setTimeout(refocus, 0));
  if ($('spellLang').value) ed.lang = $('spellLang').value;
  ed.addEventListener('keydown', (e) => {
    if (
      (e.key === 'Backspace' || e.key === 'Delete') &&
      state.editing?.locked &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      const dir = e.key === 'Backspace' ? -1 : 1;
      const INV = /^[\u200B\u2060]*$/;
      const target = (() => {
        const sel = window.getSelection();
        if (!sel.rangeCount || !sel.isCollapsed) return null;
        const r = sel.getRangeAt(0);
        let n = r.startContainer;
        const o = r.startOffset;
        if (n.nodeType === Node.TEXT_NODE) {
          const t = n.textContent;
          if (dir < 0 && !INV.test(t.slice(0, o))) return null;
          if (dir > 0 && !INV.test(t.slice(o))) return null;
          if (n.parentElement?.dataset?.atomic === '1') return n.parentElement;
        } else if (n.childNodes.length) {
          const kid = dir < 0 ? n.childNodes[o - 1] : n.childNodes[o];
          if (kid?.dataset?.atomic === '1') return kid;
          if (kid) n = kid;
        }
        let cur = n;
        while (
          cur.parentNode &&
          cur.parentNode !== ed &&
          !cur.parentNode.classList?.contains('eline')
        )
          cur = cur.parentNode;
        let sib = dir < 0 ? cur.previousSibling : cur.nextSibling;
        while (
          sib &&
          ((sib.nodeType === Node.TEXT_NODE && INV.test(sib.textContent)) ||
            (sib.nodeType === 1 &&
              sib.dataset?.atomic !== '1' &&
              INV.test(sib.textContent)))
        )
          sib = dir < 0 ? sib.previousSibling : sib.nextSibling;
        return sib?.dataset?.atomic === '1' ? sib : null;
      })();
      if (target) {
        e.preventDefault();
        unpristine();
        const v = lockedCaretGet(state.editing.editable);
        target.remove();
        lockedCaretSet(
          state.editing.editable,
          dir < 0 ? Math.max(0, v - 1) : v
        );
        schedulePreview();
        return;
      }
    }
    if (
      (e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
      state.editing?.locked &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      paraIsRtl(state.editing.para)
    ) {
      const from = lockedCaretGet(ed);
      if (from >= 0) {
        const step = e.key === 'ArrowRight' ? 1 : -1;
        const to = Math.max(0, from + step);
        if (e.shiftKey) {
          const cur = lockedSelRange(ed);
          const anchor = cur
            ? cur.start === from
              ? cur.end
              : cur.start
            : from;
          lockedSelSet(ed, Math.min(anchor, to), Math.max(anchor, to));
        } else {
          lockedCaretSet(ed, to);
        }
        e.preventDefault();
        return;
      }
    }
    if (e.key === 'Escape') {
      clearTextSelection();
      e.preventDefault();
      endEdit(true);
    } else if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      state.editing?.para &&
      listPrefixOf(state.editing.para, state.editing.editable)
    ) {
      e.preventDefault();
      continueListItem(
        listPrefixOf(state.editing.para, state.editing.editable)
      );
    } else if (
      e.key === 'Enter' &&
      state.editing?.locked &&
      state.editing.para
    ) {
      e.preventDefault();
      lockedInsertBreak(state.editing);
    } else if (
      e.key === 'Tab' &&
      state.editing?.para &&
      listPrefixOf(state.editing.para, state.editing.editable)
    ) {
      e.preventDefault();
      adjustListLevel(e.shiftKey ? -1 : 1);
    }
  });
  ed.addEventListener('beforeinput', (e) => {
    if (e.inputType !== 'historyUndo' && e.inputType !== 'historyRedo')
      unpristine();
    if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') {
      e.preventDefault();
      restore(
        e.inputType === 'historyUndo' ? state.undo : state.redo,
        e.inputType === 'historyUndo' ? state.redo : state.undo
      );
    }
  });
  ed.addEventListener('compositionstart', () => {
    if (state.editing) state.editing.composing = true;
  });
  ed.addEventListener('compositionend', () => {
    if (!state.editing) return;
    state.editing.composing = false;
    if (state.editing.locked) schedulePreview();
  });
  ed.addEventListener('dblclick', (e) => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !ed.contains(sel.anchorNode)) return;
    const map = [];
    const walk = (n) => {
      for (const c of n.childNodes) {
        if (c.nodeType === Node.TEXT_NODE) {
          for (let k = 0; k < c.textContent.length; k++)
            map.push({ node: c, offset: k, ch: c.textContent[k] });
        } else if (c.nodeName !== 'BR') {
          walk(c);
        }
      }
    };
    walk(ed);
    if (!map.length) return;
    let idx = map.findIndex(
      (m) => m.node === sel.anchorNode && m.offset === sel.anchorOffset
    );
    if (idx < 0) idx = map.findIndex((m) => m.node === sel.anchorNode);
    if (idx < 0) return;
    if (!isWordChar(map[idx].ch) && idx > 0 && isWordChar(map[idx - 1].ch))
      idx--;
    if (!isWordChar(map[idx].ch)) return;
    let from = idx;
    let to = idx;
    while (from > 0 && isWordChar(map[from - 1].ch)) from--;
    while (to + 1 < map.length && isWordChar(map[to + 1].ch)) to++;
    const range = document.createRange();
    range.setStart(map[from].node, map[from].offset);
    range.setEnd(map[to].node, map[to].offset + 1);
    sel.removeAllRanges();
    sel.addRange(range);
    e.preventDefault();
  });

  ed.addEventListener('input', () => {
    if (!state.editing) return;
    unpristine();
    const es = state.editing;
    if (es.locked) {
      schedulePreview();
      return;
    }
    if (es.singleLine && es.para) {
      if (ed.querySelector('div,br') || ed.textContent.includes('\n')) {
        es.singleLine = false;
        const pl2 = paraPlacement(es.para);
        es.el.style.width = pl2.w + EDITOR_PAD * 2 + 'px';
        ed.style.whiteSpace = 'pre-wrap';
      } else if (!es.para.rotation) {
        const align = es.para.format.align;
        if (align === 1 || align === 2) {
          const pl2 = paraPlacement(es.para);
          const grow = es.el.offsetWidth - (pl2.w + EDITOR_PAD * 2);
          if (grow > 0) {
            es.el.style.left = pl2.x - (align === 1 ? grow / 2 : grow) + 'px';
          }
        }
      }
    }
    drawOverlay();
  });
  if (spec.para) {
    buildAtomicSnips(state.editing, spec.para);
    if (state.editing.snips?.size) {
      ed.querySelectorAll('[data-atomic="1"]').forEach(applyAtomicSpanStyle);
    }
    if (ed.dataset.locked !== '1') fitEditorWidth();
    applyDocFonts(spec.para, ed);
    if (ed.dataset.locked === '1' && !state.editing.preview) {
      state.editing.preview = P().previewParagraph(
        spec.para.id,
        runsToInput(spec.para.runs),
        spec.para.format
      );
    }
  } else {
    drawOverlay();
  }
  updateChrome();
  setTimeout(() => {
    const es = state.editing;
    if (!es || es.el !== wrap || !es.locked || !es.para || !es.pristine) return;
    try {
      const eng = P();
      const hide = eng.paragraphObjects(es.para.id) || [];
      if (es.para.runs) {
        for (const r of es.para.runs) if (r.atomic && r.obj) hide.push(r.obj);
      }
      eng.renderPage(state.zoom * devicePixelRatio, hide);
      const pv = es.preview;
      if (
        pv &&
        !es.para.rotation &&
        !es.para.vertical &&
        !es.para.sharesObjects &&
        !es.para.unwrapsForms
      ) {
        const runs = parseEditor(es.editable, es.para.runs);
        if (runs.length) {
          const padM = EDITOR_PAD / state.zoom;
          const topDown = eng.pageHeight - pv.top;
          eng.renderParagraphLive(
            es.para.id,
            runsToInput(runs),
            es.para.format,
            state.zoom * devicePixelRatio,
            pv.x - padM,
            topDown - padM,
            pv.width + 2 * padM,
            pv.height + 2 * padM
          );
        }
      }
    } catch {}
  }, 30);
}

function runsToInput(runs) {
  return runs.map((r, i) => ({
    ...r,
    rgba: r.rgba >>> 0,
    sourceIndex: r.sourceIndex ?? i,
  }));
}

function lockedSlices(pv, runs) {
  const out = [];
  const total = runs.reduce((a, r) => a + r.text.length, 0);
  const flats = pv.lines.map((L) => L.flat);
  for (let k = 0; k < flats.length; k++) {
    if (flats[k] >= 0) continue;
    if (k === 0) {
      flats[k] = 0;
      continue;
    }
    const prev = pv.lines[k - 1];
    const core = prev.cx && prev.cx.length ? prev.cx.length - 1 : 0;
    flats[k] = Math.min(total, flats[k - 1] + core + (prev.hard ? 1 : 0));
  }
  for (let k = 0; k < pv.lines.length; k++) {
    const L = { ...pv.lines[k], flat: flats[k] };
    const N = k + 1 < pv.lines.length ? { flat: flats[k + 1] } : null;
    const segs = [];
    if (L.flat >= 0) {
      let at = L.flat;
      const end = N && N.flat >= 0 ? N.flat : total;
      let base = 0;
      for (let r = 0; r < runs.length && at < end; r++) {
        const len = runs[r].text.length;
        if (base + len > at) {
          const txt = runs[r].text.slice(at - base, Math.min(len, end - base));
          if (txt) segs.push({ src: r, text: txt });
          at = base + Math.min(len, end - base);
        }
        base += len;
      }
    }
    let nl = false;
    if (segs.length) {
      const lastSeg = segs[segs.length - 1];
      if (lastSeg.text.endsWith('\n')) {
        lastSeg.text = lastSeg.text.slice(0, -1);
        nl = true;
        if (!lastSeg.text) segs.pop();
      }
    } else {
      nl = true;
    }
    out.push({ segs, nl });
  }
  return out;
}

const _fontADCache = new Map();
const docFontKey = (r) =>
  `${r.family}|${r.bold === 1 || r.bold === true ? 1 : 0}${r.italic === 1 || r.italic === true ? 1 : 0}`;
function fontAD(family, bold, italic) {
  const key = family + '|' + (bold ? 1 : 0) + (italic ? 1 : 0);
  let m = _fontADCache.get(key);
  if (m) return m;
  const c = (fontAD._cv ||= document.createElement('canvas')).getContext('2d');
  c.font = `${italic ? 'italic ' : ''}${bold ? '700 ' : ''}100px ${family}, sans-serif`;
  const t = c.measureText('Hg');
  const a = (t.fontBoundingBoxAscent ?? 78) / 100;
  const d = (t.fontBoundingBoxDescent ?? 22) / 100;
  m = { a, d };
  _fontADCache.set(key, m);
  return m;
}

function exactMeasureW(text, run, z) {
  const docFam = docFontsReady.get(docFontKey(run));
  const stack =
    (docFam ? `"${docFam}", ` : '') + WEB_FALLBACK(run.family, run.fallback);
  const eb = docFam
    ? run.bold === 2
    : run.bold === 1 || run.bold === true || run.bold === 2;
  const ei = docFam
    ? run.italic === 2
    : run.italic === 1 || run.italic === true || run.italic === 2;
  const cx = (exactMeasureW._cv ||=
    document.createElement('canvas')).getContext('2d');
  cx.font = `${ei ? 'italic ' : ''}${eb ? '700 ' : ''}${(run.size || 12) * z}px ${stack}`;
  const ls = (state.editing?.para?.format?.charSpacing || 0) * z;
  return cx.measureText(text).width * (run.hScale || 1) + ls * text.length;
}

function buildLockedLineExact(div, segs, cx, runs, z) {
  const no = (why) => {
    div.dataset.exact = '0:' + why;
    return false;
  };
  if (!Array.isArray(cx) || cx.length < 2) return no('no cx');
  let lineText = '';
  const charRun = [];
  for (const sg of segs) {
    const r = runs[sg.src];
    for (const ch of sg.text) {
      lineText += ch;
      charRun.push(sg.src);
    }
  }
  const rawCore = lineText.replace(/[ \t]+$/, '');
  const slotOf = [];
  const charOf = [];
  for (let q = 0; q < rawCore.length; q++) {
    if (rawCore[q] === '\u00AD') {
      slotOf.push(charOf.length);
      continue;
    }
    slotOf.push(charOf.length);
    charOf.push(q);
  }
  const core = charOf.map((q) => rawCore[q]).join('');
  if (cx.length !== core.length + 1)
    return no('cx ' + cx.length + ' vs core ' + (core.length + 1));
  if (/[֐-׿؀-ࣿיִ-ﻼ]/.test(core)) return no('rtl');
  const isWS = (ch) => ch === ' ' || ch === '\t';
  const emit = (a, b, host) => {
    let s = a;
    while (s < b) {
      const src = charRun[s];
      let e = s;
      while (e < b && charRun[e] === src) e++;
      host.appendChild(
        runSpan({ ...runs[src], text: lineText.slice(s, e) }, src)
      );
      s = e;
    }
  };
  const measured = (a, b) => {
    let w = 0,
      s = a;
    while (s < b) {
      const src = charRun[s];
      let e = s;
      while (e < b && charRun[e] === src) e++;
      w += exactMeasureW(lineText.slice(s, e), runs[src], z);
      s = e;
    }
    return w;
  };
  const dpr = window.devicePixelRatio || 1;
  const snap = (v) => Math.round(v * z * dpr) / dpr;
  const isAt = (q) => !!runs[charRun[q]]?.atomic;
  const groups = [];
  {
    let a = 0;
    while (a < rawCore.length) {
      const ws = isWS(rawCore[a]);
      const at = isAt(a);
      let b = a;
      if (at) b = a + 1;
      else
        while (b < rawCore.length && isWS(rawCore[b]) === ws && !isAt(b)) b++;
      groups.push({ a, b, ws, at });
      a = b;
    }
  }
  const lead = new Array(groups.length).fill(0);
  for (let g = 0; g + 1 < groups.length; g++) {
    const cur = groups[g],
      next = groups[g + 1];
    if (cur.ws || cur.at || !next.ws || next.at) continue;
    const boxW =
      snap(cx[slotOf[cur.b] ?? cx.length - 1]) - snap(cx[slotOf[cur.a]]);
    const mW = measured(cur.a, cur.b);
    const spare = boxW - mW;
    if (spare > 0.5 && spare < boxW * 0.5) lead[g] = spare;
  }
  let i = 0;
  let gi = -1;
  while (i < rawCore.length) {
    gi++;
    const ws = isWS(rawCore[i]);
    const at0 = isAt(i);
    let j = i;
    if (at0) j = i + 1;
    else while (j < rawCore.length && isWS(rawCore[j]) === ws && !isAt(j)) j++;
    let boxW = snap(cx[slotOf[j] ?? cx.length - 1]) - snap(cx[slotOf[i]]);
    if (lead[gi] > 0) boxW -= lead[gi];
    else if (gi > 0 && lead[gi - 1] > 0) boxW += lead[gi - 1];
    const box = document.createElement('span');
    box.dataset.fitw = '1';
    box.style.display = 'inline-block';
    box.style.whiteSpace = 'pre';
    box.style.verticalAlign = 'baseline';
    box.style.width = boxW + 'px';
    let grpF = 0;
    for (let q = i; q < j; q++)
      grpF = Math.max(grpF, runs[charRun[q]]?.size || 0);
    if (grpF > 0) box.style.fontSize = grpF * z + 'px';
    const mW = isWS(rawCore[i]) || at0 ? boxW : measured(i, j);
    const k = boxW > 0 && mW > 0.5 ? boxW / mW : 1;
    const overflow = mW - boxW;
    const squeeze = boxW > 0 && overflow > Math.max(1.5, 0.045 * boxW);
    if (at0) {
      const anchor = () => {
        const a = document.createElement('span');
        a.style.fontSize = (runs[charRun[i]]?.size || 12) * z + 'px';
        a.appendChild(document.createTextNode('\u200B'));
        return a;
      };
      box.appendChild(anchor());
      box.appendChild(
        runSpan({ ...runs[charRun[i]], text: rawCore[i] }, charRun[i])
      );
      box.appendChild(anchor());
    } else if (squeeze) {
      const chars = Math.max(1, j - i);
      const fontPx = (runs[charRun[i]]?.size || 12) * z;
      const perGap = overflow / chars;
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.style.whiteSpace = 'pre';
      if (chars > 1 && perGap <= 0.12 * fontPx) {
        inner.style.letterSpacing = `${-perGap}px`;
      } else {
        inner.style.transform = `scaleX(${k})`;
        inner.style.transformOrigin = '0 50%';
      }
      emit(i, j, inner);
      box.appendChild(inner);
    } else {
      emit(i, j, box);
    }
    div.appendChild(box);
    i = j;
  }
  if (lineText.length > rawCore.length)
    emit(rawCore.length, lineText.length, div);
  div.dataset.exact = '1';
  return true;
}

function editorInkOverflow(es, para) {
  if (!es?.editable || !para?.lines?.length) return 0;
  const lines = [...es.editable.querySelectorAll('.eline')];
  let sp = null,
    li = -1;
  for (let i = lines.length - 1; i >= 0 && !sp; i--) {
    sp =
      [...lines[i].querySelectorAll('span')].find((q) =>
        q.textContent.trim()
      ) || null;
    if (sp) li = i;
  }
  if (!sp) return 0;
  const r = sp.getBoundingClientRect();
  if (!r.height) return 0;
  const cs = getComputedStyle(sp);
  const F = parseFloat(cs.fontSize);
  const ad = fontAD(
    cs.fontFamily,
    parseInt(cs.fontWeight) >= 600,
    cs.fontStyle.includes('italic')
  );
  const got = r.top + ad.a * F;
  const src =
    li < para.lines.length
      ? para.lines[li].y
      : para.lines[para.lines.length - 1].y;
  const pageR = $('page').getBoundingClientRect();
  const want = pageR.top + (P().pageHeight - src) * state.zoom;
  const size = Math.max(...para.runs.map((q) => q.size || 12), 12);
  return Math.max(0, got - want - Math.max(2, 0.16 * size * state.zoom));
}

function lineXDrift(es, para, runs) {
  const pv = es?.preview;
  if (!pv || !para?.lines) return null;
  const pageR = $('page').getBoundingClientRect();
  const els = [...es.editable.querySelectorAll('.eline')];
  if (els.length !== pv.lines.length || els.length !== para.lines.length)
    return null;
  const origins = pageLineOrigins(pv, runs || para.runs, para);
  let worst = 0,
    k = -1,
    seen = 0,
    loose = 0;
  els.forEach((d, i) => {
    if (origins[i] === null) {
      const el = para.lines[i];
      if (typeof el.px === 'number' && Math.abs(el.px - pv.lines[i].x) > 0.5)
        loose++;
      return;
    }
    const first = d.firstElementChild || d;
    const r = first.getBoundingClientRect();
    if (!r.width && !r.height) return;
    seen++;
    const want = pageR.left + origins[i] * state.zoom;
    const dv = Math.abs(r.left - want);
    if (dv > worst) {
      worst = dv;
      k = i;
    }
  });
  return seen || loose ? { worst, k, loose } : null;
}

function glyphDrift(es, para) {
  glyphDrift.why = '';
  if (!es?.editable || !para) {
    glyphDrift.why = 'no editor';
    return null;
  }
  const M = P().M;
  let chars;
  try {
    const ptr = M._ec_test_pagetext(P().session, P().page);
    chars = JSON.parse(M.UTF8ToString(ptr));
    M._ec_string_free(ptr);
  } catch (e) {
    glyphDrift.why = 'pagetext: ' + e.message;
    return null;
  }
  const pageVis = chars.filter((c) => !/\s/.test(String.fromCodePoint(c[0])));
  const pageR = $('page').getBoundingClientRect();
  const lines = [...es.editable.querySelectorAll('.eline')];
  let worst = 0,
    worstCh = '',
    measured = 0;
  let dbgShort = 0,
    dbgNoMatch = 0,
    dbgNoRect = 0;
  for (const ln of lines) {
    const walker = document.createTreeWalker(ln, NodeFilter.SHOW_TEXT);
    let flat = '';
    const map = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode())
      for (let k = 0; k < n.textContent.length; k++) {
        flat += n.textContent[k];
        map.push([n, k]);
      }
    const vis = [];
    for (let i = 0; i < flat.length; i++)
      if (!/[\s\u200B\uFFFC]/.test(flat[i])) vis.push(i);
    if (vis.length < 6) {
      dbgShort++;
      continue;
    }
    const take = vis.slice(0, 24);
    const codes = take.map((i) => flat.codePointAt(i));
    const rectOf = (i) => {
      const [nd, k] = map[i];
      const rg = document.createRange();
      rg.setStart(nd, k);
      rg.setEnd(nd, k + 1);
      const r = rg.getBoundingClientRect();
      return r.width || r.height ? (r.left - pageR.left) / state.zoom : null;
    };
    const x0 = rectOf(take[0]);
    if (x0 === null) {
      dbgNoRect++;
      continue;
    }
    let at = -1,
      bestD = Infinity;
    outer: for (let i = 0; i + codes.length <= pageVis.length; i++) {
      for (let j = 0; j < codes.length; j++)
        if (pageVis[i + j][0] !== codes[j]) continue outer;
      const d = Math.abs(pageVis[i][2] / 10 - x0);
      if (d < bestD) {
        bestD = d;
        at = i;
      }
    }
    if (at < 0 || bestD > 3) {
      dbgNoMatch++;
      continue;
    }
    for (let j = 0; j < codes.length; j++) {
      const got = rectOf(take[j]);
      if (got === null) continue;
      measured++;
      const d = Math.abs(got - pageVis[at + j][2] / 10);
      if (d > worst) {
        worst = d;
        worstCh = String.fromCodePoint(codes[j]);
      }
    }
  }
  glyphDrift.why = `lines=${lines.length} short=${dbgShort} nomatch=${dbgNoMatch} norect=${dbgNoRect}`;
  return measured ? { worst, ch: worstCh, n: measured } : null;
}

function metricKeys(runs) {
  const out = [];
  for (const r of runs) {
    const key =
      (r.family || '') +
      '|' +
      (r.size || 0) +
      '|' +
      (r.bold === 2 ? 2 : r.bold ? 1 : 0) +
      '|' +
      (r.italic === 2 ? 2 : r.italic ? 1 : 0) +
      '|' +
      (r.script | 0) +
      '|' +
      (r.hScale || 1) +
      '|' +
      (r.rise || 0) +
      '|' +
      (r.atomic ? 1 : 0);
    for (let i = 0; i < (r.text || '').length; i++) out.push(key);
  }
  return out;
}

function pageLineOrigins(pv, runs, para) {
  const n = pv.lines.length;
  const none = new Array(n).fill(null);
  if (!para || !para.lines || para.lines.length !== n) return none;
  const pageText = para.runs.map((r) => r.text).join('');
  const liveText = runs.map((r) => r.text).join('');
  const pageKeys = metricKeys(para.runs);
  const liveKeys = metricKeys(runs);
  const out = none;
  for (let k = 0; k < n; k++) {
    const el = para.lines[k],
      pl = pv.lines[k];
    if (typeof el.px !== 'number' || el.off !== pl.flat) continue;
    const a0 = el.off,
      a1 = k + 1 < n ? para.lines[k + 1].off : pageText.length;
    const b0 = pl.flat;
    if (b0 < 0 || a1 > pageText.length) continue;
    let b1 = -1;
    for (let j = k + 1; j < n && b1 < 0; j++)
      if (pv.lines[j].flat >= 0) b1 = pv.lines[j].flat;
    if (b1 < 0) b1 = k + 1 < n ? b0 + (a1 - a0) : liveText.length;
    if (a1 - a0 !== b1 - b0 || b1 > liveText.length) continue;
    if (pageText.slice(a0, a1) !== liveText.slice(b0, b1)) continue;
    let same = true;
    for (let i = 0; i < a1 - a0 && same; i++)
      same = pageKeys[a0 + i] === liveKeys[b0 + i];
    if (same) out[k] = el.px;
  }
  return out;
}

let lockedEpoch = 0;

function lockedRunSig(r) {
  return [
    Number.isInteger(r.sourceIndex) ? r.sourceIndex : '',
    r.family,
    r.fallback || '',
    r.size,
    (r.rgba ?? 0) >>> 0,
    r.bold === 2 ? 2 : r.bold ? 1 : 0,
    r.italic === 2 ? 2 : r.italic ? 1 : 0,
    r.underline ? 1 : 0,
    r.strike ? 1 : 0,
    r.script | 0,
    r.renderMode | 0,
    (r.strokeRgba || 0) >>> 0,
    r.strokeWidth ?? 1,
    r.hScale ?? 1,
    r.rise ?? 0,
    r.atomic ? 1 : 0,
    r.atomic && r.box ? r.box.slice(0, 5).join(',') : '',
    (r.atomic && r.obj) || '',
  ].join('');
}

function lockedMutatedLines(ed) {
  let obs = ed._ecObs;
  if (!obs) {
    obs = new MutationObserver(() => {});
    obs.observe(ed, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    ed._ecObs = obs;
    return true;
  }
  const recs = obs.takeRecords();
  const marked = new Set();
  for (const rec of recs) {
    let node = rec.target;
    while (node && node !== ed && node.parentNode !== ed)
      node = node.parentNode;
    if (!node || node === ed) return true;
    marked.add(node);
  }
  return marked;
}

const LOCK_CHECK =
  typeof location !== 'undefined' && /[?&]lockcheck/.test(location.search);

let lockedSeq = 0;

function renderLockedLines(ed, runs, pv, para, originX) {
  lockedSeq++;
  const dirty = lockedMutatedLines(ed);
  const z = state.zoom;
  const org = typeof originX === 'number' ? originX : pv.x;
  const n = pv.lines.length;
  ed.dataset.locked = '1';
  ed.style.whiteSpace = 'pre';
  ed.style.textAlign = 'left';
  const slices = lockedSlices(pv, runs);
  const useExt =
    para &&
    para.lines?.length === n &&
    n > 0 &&
    Math.abs(para.lines[0].y - pv.lines[0].baseline) <
      1.6 * (pv.lines[0].size || 12);
  const blOf = (k) => (useExt ? para.lines[k].y : pv.lines[k].baseline);
  const pageOrigin = pageLineOrigins(pv, runs, para);
  const xOf = (k) => {
    const px = pageOrigin[k];
    return px !== null && px - org > -2 ? px : pv.lines[k].x;
  };
  const runSigs = runs.map(lockedRunSig);
  const dpr = window.devicePixelRatio || 1;
  const chSp = state.editing?.para?.format?.charSpacing || 0;
  if (ed.childNodes.length !== ed.children.length) ed.textContent = '';
  const geom = [];
  for (let k = 0; k < n; k++) {
    let A = 0,
      maxF = 0;
    for (const sg of slices[k].segs) {
      const r1 = runs[sg.src] || {};
      const F1 = (r1.size || pv.lines[k].size || 12) * z;
      const docFam = docFontsReady.get(docFontKey(r1));
      const stack =
        (docFam ? `"${docFam}", ` : '') + WEB_FALLBACK(r1.family, r1.fallback);
      const eb = docFam
        ? r1.bold === 2
        : r1.bold === 1 || r1.bold === true || r1.bold === 2;
      const ei = docFam
        ? r1.italic === 2
        : r1.italic === 1 || r1.italic === true || r1.italic === 2;
      const ad1 = fontAD(stack, eb, ei);
      A = Math.max(A, (ad1.a - ad1.d) * F1);
      maxF = Math.max(maxF, F1);
    }
    if (!(A > 0)) {
      const F0 = (pv.lines[k].size || 12) * z;
      A = 0.62 * F0;
      maxF = F0;
    }
    geom.push({ A, maxF });
  }
  const buildLine = (k, t) => {
    const { maxF, A } = geom[k];
    const div = document.createElement('div');
    div.className = 'eline';
    const T = (pv.top - blOf(k)) * z;
    const H = Math.max(4, maxF * 1.2);
    const boxTop = T - (H + A) / 2;
    div.style.height = H + 'px';
    div.style.lineHeight = H + 'px';
    div.style.marginTop = boxTop - t + 'px';
    div.style.fontSize = '0px';
    div.style.marginLeft = (xOf(k) - org) * z + 'px';
    div.style.whiteSpace = 'pre';
    if (slices[k].nl) div.dataset.nl = '1';
    const exact = buildLockedLineExact(
      div,
      slices[k].segs,
      pv.lines[k].cx,
      runs,
      z
    );
    for (let si = 0; !exact && si < slices[k].segs.length; si++) {
      const seg = slices[k].segs[si];
      const isAt = !!runs[seg.src]?.atomic;
      const anchor = () => {
        const a = document.createElement('span');
        a.style.fontSize = (runs[seg.src]?.size || 12) * state.zoom + 'px';
        a.appendChild(document.createTextNode('\u200B'));
        return a;
      };
      if (isAt && si === 0) div.appendChild(anchor());
      div.appendChild(runSpan({ ...runs[seg.src], text: seg.text }, seg.src));
      if (isAt) div.appendChild(anchor());
    }
    if (!exact && !slices[k].segs.length)
      div.appendChild(document.createTextNode(''));
    if (LOCK_CHECK) {
      div._ecDbg = {
        seq: lockedSeq,
        segTxt: slices[k].segs.map((s) => s.src + ':' + s.text).join('\u00b6'),
        cxLen: Array.isArray(pv.lines[k].cx) ? pv.lines[k].cx.length : -1,
      };
    }
    return div;
  };
  let t = 0;
  const sigs = [];
  const reusedNow = [];
  for (let k = 0; k < n; k++) {
    const { maxF, A } = geom[k];
    const T = (pv.top - blOf(k)) * z;
    const H = Math.max(4, maxF * 1.2);
    const boxTop = T - (H + A) / 2;
    let hasAtomic = false;
    let segSig = '';
    let lineTxt = '';
    for (const sg of slices[k].segs) {
      if (runs[sg.src]?.atomic) hasAtomic = true;
      lineTxt += sg.text;
      segSig += sg.src + '' + runSigs[sg.src] + '' + sg.text + '';
    }
    const cx = pv.lines[k].cx;
    const sig =
      lockedEpoch +
      '|' +
      z +
      '|' +
      dpr +
      '|' +
      chSp +
      '|' +
      H +
      '|' +
      (boxTop - t) +
      '|' +
      (xOf(k) - org) * z +
      '|' +
      (slices[k].nl ? 1 : 0) +
      '|' +
      (pv.lines[k].size || 0) +
      '|' +
      segSig +
      '|' +
      (Array.isArray(cx) ? cx.join(',') : '');
    sigs.push(hasAtomic ? null : sig);
    const prev = ed.children[k];
    if (
      !hasAtomic &&
      prev &&
      dirty !== true &&
      !dirty.has(prev) &&
      prev._ecSig === sig
    ) {
      if (prev.textContent === lineTxt) {
        window.__lockReuse = (window.__lockReuse || 0) + 1;
        reusedNow.push(true);
        t = boxTop + H;
        continue;
      }
      window.__lockTextGuard = (window.__lockTextGuard || 0) + 1;
      if (LOCK_CHECK) {
        (window.__lockGuardLog ||= []).push({
          k,
          seq: lockedSeq,
          builtSeq: prev._ecDbg?.seq,
          gotTail: prev.textContent.slice(-50),
          wantTail: lineTxt.slice(-50),
          dbgTxtEqNow: prev._ecDbg
            ? prev._ecDbg.segTxt ===
              slices[k].segs.map((s) => s.src + ':' + s.text).join('\u00b6')
            : null,
        });
      }
    }
    reusedNow.push(false);
    const div = buildLine(k, t);
    div._ecSig = hasAtomic ? null : sig;
    if (prev) ed.replaceChild(div, prev);
    else ed.appendChild(div);
    t = boxTop + H;
  }
  while (ed.children.length > n) ed.lastElementChild.remove();
  if (LOCK_CHECK) {
    window.__lockChecks = (window.__lockChecks || 0) + 1;
    let rt = 0;
    let bad = 0;
    for (let k = 0; k < n; k++) {
      const { maxF, A } = geom[k];
      const T = (pv.top - blOf(k)) * z;
      const H = Math.max(4, maxF * 1.2);
      const boxTop = T - (H + A) / 2;
      const ref = buildLine(k, rt);
      const got = ed.children[k];
      if (!got || got.outerHTML !== ref.outerHTML) {
        bad++;
        window.__lockBad = (window.__lockBad || 0) + 1;
        const a = got ? got.outerHTML : '';
        const b = ref.outerHTML;
        let d = 0;
        while (d < a.length && d < b.length && a[d] === b[d]) d++;
        (window.__lockLog ||= []).push({
          k,
          epoch: lockedEpoch,
          diffAt: d,
          reusedNow: reusedNow[k],
          sigNowEqStored: got ? got._ecSig === sigs[k] : null,
          dirtyState: dirty === true ? 'all' : dirty.size,
          refAgain: buildLine(k, rt).outerHTML === b,
          seqNow: lockedSeq,
          gotDbg: got?._ecDbg || null,
          nowSegTxt: slices[k].segs
            .map((s) => s.src + ':' + s.text)
            .join('\u00b6'),
          nowCxLen: Array.isArray(pv.lines[k].cx) ? pv.lines[k].cx.length : -1,
          gotChildren: got ? got.children.length : -1,
          wantChildren: ref.children.length,
          got: a.slice(Math.max(0, d - 60), d + 160),
          want: b.slice(Math.max(0, d - 60), d + 160),
        });
        if (got) ed.replaceChild(ref, got);
        else ed.appendChild(ref);
      }
      rt = boxTop + H;
    }
    if (bad) console.warn('lockcheck: ' + bad + ' line(s) diverged');
  }
  ed._ecObs?.takeRecords();
  const es0 = state.editing;
  if (document.fonts?.ready && es0 && es0.editable === ed && !es0.fontsRefit) {
    es0.fontsRefit = true;
    document.fonts.ready.then(() => {
      const es = state.editing;
      if (!es || es.editable !== ed || !es.locked || !es.para) return;
      _fontADCache.clear();
      lockedEpoch++;
      schedulePreview();
    });
  }
}

function attachParaLongPress(div, para) {
  div.addEventListener('contextmenu', (e) => e.preventDefault());
  div.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) return;
      if (state.editing?.para?.id === para.id) return;
      const sx = e.touches[0].clientX;
      const sy = e.touches[0].clientY;
      let fired = false;
      const slop = (ev) => {
        const t1 = ev.touches[0];
        if (fired || !t1) return;
        if (Math.hypot(t1.clientX - sx, t1.clientY - sy) > 12) cleanup();
      };
      const drive = (ev) => {
        if (!fired) return;
        ev.preventDefault();
        const t1 = ev.touches[0];
        if (!t1) return;
        window.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: t1.clientX,
            clientY: t1.clientY,
            buttons: 1,
          })
        );
      };
      const finish = (ev) => {
        if (fired) {
          const t1 = ev.changedTouches[0];
          window.dispatchEvent(
            new MouseEvent('mouseup', {
              clientX: t1 ? t1.clientX : sx,
              clientY: t1 ? t1.clientY : sy,
            })
          );
        } else if (ev.type === 'touchend') {
          ev.preventDefault();
          const t1 = ev.changedTouches[0];
          beginEdit(para, {
            x: t1 ? t1.clientX : sx,
            y: t1 ? t1.clientY : sy,
          });
        }
        cleanup();
      };
      const timer = setTimeout(() => {
        fired = true;
        navigator.vibrate?.(12);
        if (state.editing) endEdit(true);
        state.selection = { kind: 'para', para };
        updateChrome();
        drawOverlay();
        const sel = $('overlay').querySelector('.sel-para');
        if (sel) {
          sel.dispatchEvent(
            new MouseEvent('mousedown', {
              bubbles: true,
              clientX: sx,
              clientY: sy,
              buttons: 1,
            })
          );
        }
      }, 450);
      const cleanup = () => {
        clearTimeout(timer);
        div.removeEventListener('touchmove', slop);
        div.removeEventListener('touchmove', drive);
        div.removeEventListener('touchend', finish);
        div.removeEventListener('touchcancel', finish);
      };
      div.addEventListener('touchmove', slop, { passive: true });
      div.addEventListener('touchmove', drive, { passive: false });
      div.addEventListener('touchend', finish);
      div.addEventListener('touchcancel', finish);
    },
    { passive: true }
  );
}

function paraIsRtl(para) {
  if (!para) return false;
  if (para.format?.dir === 2) return true;
  if (para.format?.dir === 1) return false;
  const t = para.runs.map((r) => r.text).join('');
  let rtl = 0,
    ltr = 0;
  for (const ch of t) {
    const c = ch.codePointAt(0);
    if (
      (c >= 0x0590 && c <= 0x08ff) ||
      (c >= 0xfb1d && c <= 0xfdff) ||
      (c >= 0xfe70 && c <= 0xfefc)
    )
      rtl++;
    else if (
      (c >= 0x41 && c <= 0x5a) ||
      (c >= 0x61 && c <= 0x7a) ||
      (c >= 0x00c0 && c <= 0x024f) ||
      (c >= 0x0370 && c <= 0x04ff)
    )
      ltr++;
  }
  return rtl > 0 && rtl >= ltr;
}

function lockedPointOffset(ed, container, contOffset) {
  let off = 0,
    found = -1;
  const zw = (t) => t.split('\u200B').length - 1;
  const walk = (node) => {
    if (found >= 0) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent;
      if (node === container) {
        found = off + contOffset - zw(t.slice(0, contOffset));
        return;
      }
      off += t.length - zw(t);
      return;
    }
    if (node === container) {
      let acc = off;
      for (let i = 0; i < contOffset && i < node.childNodes.length; i++) {
        const t = node.childNodes[i].textContent;
        acc += t.length - (t.split('\u200B').length - 1);
      }
      found = acc;
      return;
    }
    node.childNodes.forEach(walk);
    if (node.classList?.contains('eline') && node.dataset.nl === '1') off += 1;
  };
  walk(ed);
  return found;
}

function lockedCaretGet(ed) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return -1;
  const r = sel.getRangeAt(0);
  if (!ed.contains(r.startContainer)) return -1;
  return lockedPointOffset(ed, r.startContainer, r.startOffset);
}

function lockedSelRange(ed) {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return null;
  const r = sel.getRangeAt(0);
  if (!ed.contains(r.startContainer) || !ed.contains(r.endContainer))
    return null;
  const a = lockedPointOffset(ed, r.startContainer, r.startOffset);
  const b = lockedPointOffset(ed, r.endContainer, r.endOffset);
  if (a < 0 || b < 0 || a === b) return null;
  return { start: Math.min(a, b), end: Math.max(a, b), locked: true };
}

function lockedLocate(ed, target) {
  let off = 0,
    hit = null;
  const walk = (node) => {
    if (hit) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent;
      const len = t.length - (t.split('\u200B').length - 1);
      if (target <= off + len) {
        hit = { node, local: Math.max(0, target - off) };
        return;
      }
      off += len;
      return;
    }
    node.childNodes.forEach(walk);
    if (hit) return;
    if (node.classList?.contains('eline') && node.dataset.nl === '1') {
      off += 1;
      if (target <= off) {
        const nxt = node.nextSibling;
        const t = nxt && (nxt.firstChild?.firstChild || nxt.firstChild || nxt);
        if (t)
          hit =
            t.nodeType === Node.TEXT_NODE
              ? { node: t, local: 0 }
              : { node: nxt, local: 0 };
        else hit = { node, local: node.childNodes.length };
      }
    }
  };
  walk(ed);
  if (hit && hit.node.parentElement?.dataset?.atomic === '1') {
    const span = hit.node.parentElement;
    const sib = hit.local === 0 ? span.previousSibling : span.nextSibling;
    const txt =
      sib &&
      (sib.nodeType === Node.TEXT_NODE
        ? sib
        : sib.nodeType === 1 && sib.firstChild?.nodeType === Node.TEXT_NODE
          ? sib.firstChild
          : null);
    if (txt)
      hit = { node: txt, local: hit.local === 0 ? txt.textContent.length : 0 };
  }
  return hit;
}

function lockedCaretSet(ed, target) {
  if (target < 0) return;
  const sel = window.getSelection();
  const at = lockedLocate(ed, target);
  const r = document.createRange();
  if (at) r.setStart(at.node, at.local);
  else {
    r.selectNodeContents(ed);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
    return;
  }
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
}

function lockedSelSet(ed, start, end) {
  const a = lockedLocate(ed, start),
    b = lockedLocate(ed, end);
  if (!a || !b) {
    lockedCaretSet(ed, end);
    return;
  }
  const sel = window.getSelection();
  const r = document.createRange();
  r.setStart(a.node, a.local);
  r.setEnd(b.node, b.local);
  sel.removeAllRanges();
  sel.addRange(r);
}

let previewRaf = 0;
function schedulePreview() {
  const es = state.editing;
  if (!es || !es.locked || !es.para) return;
  cancelAnimationFrame(previewRaf);
  previewRaf = requestAnimationFrame(() => {
    const es2 = state.editing;
    if (!es2 || !es2.locked || !es2.para) return;
    if (es2.composing) {
      const edC = es2.editable;
      const runsC = parseEditor(edC, es2.para.runs);
      if (!runsC.length) return;
      const pvC = P().previewParagraph(
        es2.para.id,
        runsToInput(runsC),
        es2.para.format
      );
      if (!pvC || !pvC.lines.length) return;
      inPreviewPass = true;
      try {
        es2.preview = pvC;
        applyLockedGeom(es2, pvC);
        updateGlassSurface(es2, pvC, runsC);
        drawOverlay();
      } finally {
        inPreviewPass = false;
      }
      return;
    }
    const ed = es2.editable;
    const runs = parseEditor(ed, es2.para.runs);
    if (!runs.length) return;
    const pv = P().previewParagraph(
      es2.para.id,
      runsToInput(runs),
      es2.para.format
    );
    if (!pv || !pv.lines.length) return;
    inPreviewPass = true;
    try {
      const hadFocus =
        ed === document.activeElement || ed.contains(document.activeElement);
      const selR = lockedSelRange(ed);
      const caret = lockedCaretGet(ed);
      renderLockedLines(ed, runs, pv, es2.para, pv.x);
      applyDocFonts(es2.para, ed);
      if (hadFocus && selR) lockedSelSet(ed, selR.start, selR.end);
      else if (hadFocus) lockedCaretSet(ed, caret);
      es2.preview = pv;
      applyLockedGeom(es2, pv);
      updateGlassSurface(es2, pv, runs);
      drawOverlay();
    } finally {
      inPreviewPass = false;
    }
  });
}

const GLASS_CHECK =
  typeof location !== 'undefined' &&
  new URLSearchParams(location.search).has('glasscheck');

function updateGlassSurface(es, pv, runs) {
  const para = es.para;
  const capable =
    para &&
    es.locked &&
    !es.pristine &&
    !para.rotation &&
    !para.vertical &&
    !para.sharesObjects &&
    !para.unwrapsForms &&
    !es.glassOff;
  if (!capable) {
    es.glassLines = null;
    if (es.glassCanvas) {
      es.glassCanvas.remove();
      es.glassCanvas = null;
    }
    if (!es.pristine) es.el.classList.remove('pristine');
    es.glass = false;
    return;
  }
  const z = state.zoom;
  const scale = z * devicePixelRatio;
  const padM = EDITOR_PAD / z;
  const topDown = P().pageHeight - pv.top;
  const fullX = pv.x - padM;
  const fullY = topDown - padM;
  const fullW = pv.width + 2 * padM;
  const fullH = pv.height + 2 * padM;
  const pxW = Math.round(fullW * scale);
  const pxH = Math.round(fullH * scale);
  let styleH = 19;
  for (const r of runs || []) {
    styleH = (styleH * 31 + ((r.rgba >>> 0) | 0)) | 0;
    styleH = (styleH * 31 + (r.bold ? 2 : 1)) | 0;
    styleH = (styleH * 31 + (r.italic ? 2 : 1)) | 0;
    styleH = (styleH * 31 + (r.underline ? 2 : 1)) | 0;
    styleH = (styleH * 31 + (r.strike ? 2 : 1)) | 0;
    styleH = (styleH * 31 + ((r.script | 0) + 2)) | 0;
    styleH = (styleH * 31 + ((r.renderMode | 0) + 2)) | 0;
    styleH = (styleH * 31 + ((r.strokeRgba >>> 0) | 0)) | 0;
    styleH = (styleH * 31 + Math.round((r.strokeWidth ?? 1) * 100)) | 0;
    styleH = (styleH * 31 + Math.round((r.size ?? 0) * 100)) | 0;
    for (let i = 0; i < (r.family || '').length; i++)
      styleH = (styleH * 31 + r.family.charCodeAt(i)) | 0;
  }

  const keys = [];
  let certain = true;
  for (const ln of pv.lines) {
    let h = styleH;
    h = (h * 31 + Math.round(ln.baseline * 100)) | 0;
    h = (h * 31 + Math.round((ln.x || 0) * 100)) | 0;
    h = (h * 31 + Math.round((ln.size || 0) * 100)) | 0;
    if (Array.isArray(ln.cx) && ln.cx.length) {
      h = (h * 31 + ln.cx.length) | 0;
      for (let i = 0; i < ln.cx.length; i++) {
        h = (h * 31 + Math.round(ln.cx[i] * 50)) | 0;
      }
    } else {
      certain = false;
    }
    keys.push(h);
  }
  const prev = es.glassLines;
  const cv0 = es.glassCanvas;
  const basePxX = Math.round(fullX * scale);
  const basePxY = Math.round(fullY * scale);
  const canPartial =
    certain &&
    prev &&
    cv0 &&
    cv0.isConnected &&
    cv0.width === pxW &&
    cv0.height === pxH &&
    prev.length === keys.length &&
    es.glassOrigin &&
    es.glassOrigin[0] === basePxX &&
    es.glassOrigin[1] === basePxY;
  let r0 = 0;
  let partial = false;
  if (canPartial) {
    let lo = -1,
      hi = -1;
    for (let k = 0; k < keys.length; k++) {
      if (keys[k] !== prev[k]) {
        if (lo < 0) lo = k;
        hi = k;
      }
    }
    if (lo < 0 && !GLASS_CHECK) {
      es.glassLines = keys;
      return;
    }
    if (lo < 0) {
      lo = 0;
      hi = 0;
    }
    const a = Math.max(0, lo - 1);
    const b = Math.min(pv.lines.length - 1, hi + 1);
    const lnA = pv.lines[a],
      lnB = pv.lines[b];
    const topPage = P().pageHeight - lnA.baseline - (lnA.size || 12) * 1.6;
    const botPage = P().pageHeight - lnB.baseline + (lnB.size || 12) * 0.8;
    const rr0 = Math.max(0, Math.floor((topPage - fullY) * scale));
    const rr1 = Math.min(pxH, Math.ceil((botPage - fullY) * scale));
    if (rr1 > rr0 && rr1 - rr0 < pxH * 0.7) {
      partial = true;
      r0 = rr0;
      var bandH = rr1 - rr0;
    }
  }
  let img;
  const rpl0 = performance.now();
  if (partial) {
    img = P().renderParagraphLive(
      para.id,
      runsToInput(runs),
      para.format,
      scale,
      basePxX / scale,
      (basePxY + r0) / scale,
      pxW / scale,
      bandH / scale
    );
  } else {
    img = P().renderParagraphLive(
      para.id,
      runsToInput(runs),
      para.format,
      scale,
      basePxX / scale,
      basePxY / scale,
      pxW / scale,
      pxH / scale
    );
    r0 = 0;
  }
  const rplDt = performance.now() - rpl0;
  if (rplDt > 150) {
    es.glassSlowN = (es.glassSlowN || 0) + 1;
    if (es.glassSlowN >= 2) {
      es.glassOff = true;
      es.glassLines = null;
      if (es.glassCanvas) {
        es.glassCanvas.remove();
        es.glassCanvas = null;
      }
      if (!es.pristine) es.el.classList.remove('pristine');
      es.glass = false;
      if (img) return;
    }
  } else {
    es.glassSlowN = 0;
  }
  if (!img) {
    es.glassLines = null;
    if (es.glassCanvas) {
      es.glassCanvas.remove();
      es.glassCanvas = null;
    }
    if (!es.pristine) es.el.classList.remove('pristine');
    es.glass = false;
    return;
  }
  es.glass = true;
  es.el.classList.add('pristine');
  let cv = es.glassCanvas;
  if (!cv) {
    cv = document.createElement('canvas');
    cv.className = 'glass-live';
    Object.assign(cv.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      pointerEvents: 'none',
      zIndex: '0',
    });
    es.el.insertBefore(cv, es.el.firstChild);
    es.glassCanvas = cv;
    es.editable.style.position = 'relative';
    es.editable.style.zIndex = '1';
  }
  if (cv.width !== pxW || cv.height !== pxH) {
    if (partial) return;
    cv.width = pxW;
    cv.height = pxH;
  }
  cv.style.width = pxW / devicePixelRatio + 'px';
  cv.style.height = pxH / devicePixelRatio + 'px';
  cv.getContext('2d').putImageData(
    new ImageData(img.data, img.width, img.height),
    0,
    r0
  );
  es.glassLines = keys;
  es.glassOrigin = [basePxX, basePxY];
  clearTimeout(es.glassSettle);
  if (partial) {
    es.glassRuns = runs;
    es.glassSettle = setTimeout(() => {
      const cur = state.editing;
      if (cur !== es || !cur.preview || !cur.glassRuns || !cur.locked) return;
      cur.glassLines = null;
      updateGlassSurface(cur, cur.preview, cur.glassRuns);
    }, 250);
  }
  if (GLASS_CHECK) {
    const ref = P().renderParagraphLive(
      para.id,
      runsToInput(runs),
      para.format,
      scale,
      basePxX / scale,
      basePxY / scale,
      pxW / scale,
      pxH / scale
    );
    if (ref) {
      const cur = cv.getContext('2d').getImageData(0, 0, pxW, pxH).data;
      let bad = 0;
      let bx0 = 1e9,
        by0 = 1e9,
        bx1 = -1,
        by1 = -1;
      for (let i = 0; i < cur.length; i++) {
        if (cur[i] !== ref.data[i]) {
          bad++;
          const pxI = (i >> 2) % pxW,
            pyI = ((i >> 2) / pxW) | 0;
          if (pxI < bx0) bx0 = pxI;
          if (pxI > bx1) bx1 = pxI;
          if (pyI < by0) by0 = pyI;
          if (pyI > by1) by1 = pyI;
        }
      }
      window.__glassChecks = (window.__glassChecks || 0) + 1;
      window.__glassPartials =
        (window.__glassPartials || 0) + (partial ? 1 : 0);
      window.__glassBad = Math.max(window.__glassBad || 0, bad);
      (window.__glassLog ||= []).push({
        partial,
        r0,
        bandH: partial ? bandH : pxH,
        pxW,
        pxH,
        bad,
        badBox: bad ? [bx0, by0, bx1, by1] : null,
        lines: pv.lines.length,
        why: partial
          ? ''
          : !certain
            ? 'no-cx'
            : !prev
              ? 'no-prev'
              : !cv0 || !cv0.isConnected
                ? 'no-canvas'
                : cv0.width !== pxW || cv0.height !== pxH
                  ? 'dims'
                  : prev.length !== keys.length
                    ? 'line-count'
                    : !es.glassOrigin ||
                        es.glassOrigin[0] !== basePxX ||
                        es.glassOrigin[1] !== basePxY
                      ? 'origin'
                      : 'band-too-big',
      });
      if (bad && !window.__glassBadShot) {
        const mk = (data) => {
          const c = document.createElement('canvas');
          c.width = pxW;
          c.height = pxH;
          c.getContext('2d').putImageData(new ImageData(data, pxW, pxH), 0, 0);
          return c.toDataURL();
        };
        window.__glassBadShot = {
          cur: mk(new Uint8ClampedArray(cur)),
          ref: mk(ref.data),
          key: window.__glassChecks,
        };
      }
      if (bad) {
        cv.getContext('2d').putImageData(
          new ImageData(ref.data, ref.width, ref.height),
          0,
          0
        );
      }
    }
  }
}

function applyLockedGeom(es, pv) {
  if (!es || !pv) return;
  es.preview = pv;
  const pseudo = {
    ...es.para,
    box: { x: pv.x, top: pv.top, w: pv.width, h: pv.height },
  };
  positionWrap(es.el, pseudo);
  es.el.style.width = pv.width * state.zoom + EDITOR_PAD * 2 + 'px';
  es.el.style.minHeight = pv.height * state.zoom + EDITOR_PAD * 2 + 'px';
  const need = es.editable.scrollWidth + EDITOR_PAD * 2 + 1;
  if (need > parseFloat(es.el.style.width)) es.el.style.width = need + 'px';
  es.el.scrollLeft = 0;
  es.editable.scrollLeft = 0;
}

function beginEdit(para, caret) {
  openEditor({ para }, caret);
}
function beginNewTextBox(x, yTop, size, caret, width) {
  const w = Number.isFinite(width) && width >= 30 ? width : 300;
  openEditor({ newGeom: { x, yTop, width: w, size } }, caret);
}

function runSpan(run, srcIndex) {
  const s = document.createElement('span');
  const parts = (run.text || '').split('\n');
  parts.forEach((part, i) => {
    if (i > 0) s.appendChild(document.createElement('br'));
    if (part) s.appendChild(document.createTextNode(part));
  });
  s.dataset.src = Number.isInteger(run.sourceIndex)
    ? run.sourceIndex
    : srcIndex;
  s.dataset.family = run.family;
  s.dataset.size = run.size;
  s.dataset.rgba = run.rgba >>> 0;
  s.dataset.bold = run.bold === 2 ? 2 : run.bold ? 1 : 0;
  s.dataset.italic = run.italic === 2 ? 2 : run.italic ? 1 : 0;
  s.dataset.underline = run.underline ? 1 : 0;
  s.dataset.strike = run.strike ? 1 : 0;
  s.dataset.script = run.script | 0;
  s.dataset.renderMode = run.renderMode | 0;
  s.dataset.strokeRgba = (run.strokeRgba || 0) >>> 0;
  s.dataset.strokeWidth = run.strokeWidth ?? 1;
  s.dataset.hScale = run.hScale ?? 1;
  s.dataset.rise = run.rise ?? 0;
  s.dataset.fallback = run.fallback || '';
  const dfam = docFontsReady.get(docFontKey(run));
  if (dfam) {
    s.dataset.docfont = dfam;
    s.dataset.docfontFor = run.family;
    s.dataset.docfontB = run.bold === 2 ? '2' : run.bold ? '1' : '0';
    s.dataset.docfontI = run.italic === 2 ? '2' : run.italic ? '1' : '0';
  }
  applySpanStyle(s);
  if (run.atomic) {
    s.dataset.atomic = '1';
    if (run.box) {
      s.dataset.atomicW = run.box[2];
      s.dataset.abox = run.box
        .slice(0, 5)
        .map((v) => +(+v).toFixed(2))
        .join(',');
    }
    if (run.obj) s.dataset.aobj = run.obj;
    s.textContent = '\u2060';
    applyAtomicSpanStyle(s);
  }
  return s;
}

function buildAtomicSnips(es, para) {
  if (!es || para.rotation) return;
  const atoms = (para.runs || []).filter((r) => r.atomic && r.box?.length >= 5);
  if (!atoms.length) return;
  const scale = state.zoom * devicePixelRatio;
  const H = P().pageHeight;
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const r of atoms) {
    const [x, top, w, h] = r.box;
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, H - top);
    x1 = Math.max(x1, x + w);
    y1 = Math.max(y1, H - top + h);
  }
  const fullW = Math.max(1, Math.round(P().pageWidth * scale));
  const fullH = Math.max(1, Math.round(H * scale));
  const px0 = Math.max(0, Math.floor(x0 * scale) - 2);
  const py0 = Math.max(0, Math.floor(y0 * scale) - 2);
  const px1 = Math.min(fullW, Math.ceil(x1 * scale) + 2);
  const py1 = Math.min(fullH, Math.ceil(y1 * scale) + 2);
  const pw = px1 - px0,
    ph = py1 - py0;
  if (pw <= 0 || ph <= 0 || pw > 8192 || ph > 8192) return;
  let img;
  try {
    img = P().renderPageRegion(fullW, fullH, px0, py0, pw, ph);
  } catch {
    return;
  }
  if (!img) return;
  const full = document.createElement('canvas');
  full.width = pw;
  full.height = ph;
  full.getContext('2d').putImageData(new ImageData(img.data, pw, ph), 0, 0);
  es.snips = new Map();
  for (const r of atoms) {
    const key = r.box
      .slice(0, 5)
      .map((v) => +(+v).toFixed(2))
      .join(',');
    if (es.snips.has(key)) continue;
    const [x, top, w, h] = r.box;
    const sx = Math.floor(x * scale) - px0,
      sy = Math.floor((H - top) * scale) - py0;
    const sw = Math.max(1, Math.ceil(w * scale)),
      sh = Math.max(1, Math.ceil(h * scale));
    if (sw > 4000 || sh > 4000) continue;
    const c = document.createElement('canvas');
    c.width = sw;
    c.height = sh;
    c.getContext('2d').drawImage(full, sx, sy, sw, sh, 0, 0, sw, sh);
    es.snips.set(key, c.toDataURL());
  }
}

function applyAtomicSpanStyle(s) {
  s.contentEditable = 'false';
  s.style.color = 'transparent';
  s.style.webkitTextFillColor = 'transparent';
  s.style.textDecoration = 'none';
  s.style.display = 'inline-block';
  s.style.overflow = 'hidden';
  const z = state.zoom;
  const box = (s.dataset.abox || '').split(',').map(Number);
  const snip = state.editing?.snips?.get(s.dataset.abox);
  if (box.length >= 5 && snip) {
    const [, top, w, h, baseline] = box;
    s.style.width = w * z + 'px';
    s.style.height = h * z + 'px';
    s.style.backgroundImage = `url(${snip})`;
    s.style.backgroundSize = '100% 100%';
    s.style.backgroundRepeat = 'no-repeat';
    s.style.verticalAlign = (top - h - baseline) * z + 'px';
    return;
  }
  s.style.background = 'none';
  s.style.verticalAlign = 'baseline';
  const w = parseFloat(s.dataset.atomicW);
  if (w > 0) s.style.width = w * z + 'px';
}
function applySpanStyle(s) {
  const z = state.zoom;
  const size = parseFloat(s.dataset.size);
  const script = parseInt(s.dataset.script) || 0;
  const vis = script !== 0 ? size * 0.58 : size;
  const useDoc =
    s.dataset.docfont &&
    s.dataset.docfontFor === s.dataset.family &&
    (s.dataset.docfontB ?? '0') ===
      (s.dataset.bold === '2' ? '2' : s.dataset.bold === '1' ? '1' : '0') &&
    (s.dataset.docfontI ?? '0') ===
      (s.dataset.italic === '2' ? '2' : s.dataset.italic === '1' ? '1' : '0');
  s.style.fontFamily = useDoc
    ? `"${s.dataset.docfont}", ${WEB_FALLBACK(s.dataset.family, s.dataset.fallback)}`
    : WEB_FALLBACK(s.dataset.family, s.dataset.fallback);
  s.style.fontSize = vis * z + 'px';
  s.style.fontWeight = (
    useDoc
      ? s.dataset.bold === '2'
      : s.dataset.bold === '1' || s.dataset.bold === '2'
  )
    ? '700'
    : '400';
  s.style.fontStyle = (
    useDoc
      ? s.dataset.italic === '2'
      : s.dataset.italic === '1' || s.dataset.italic === '2'
  )
    ? 'italic'
    : 'normal';
  s.style.color = rgbaToCss(parseInt(s.dataset.rgba) >>> 0);
  const deco = [];
  if (s.dataset.underline === '1') deco.push('underline');
  if (s.dataset.strike === '1') deco.push('line-through');
  s.style.textDecoration = deco.join(' ') || 'none';
  s.style.verticalAlign =
    script > 0 ? 'super' : script < 0 ? 'sub' : 'baseline';
  const rm = parseInt(s.dataset.renderMode) || 0;
  const sw = parseFloat(s.dataset.strokeWidth) || 0;
  if ((rm === 1 || rm === 2) && sw > 0) {
    s.style.webkitTextStroke = `${Math.min(3, sw * z * 0.5)}px ${rgbaToCss(parseInt(s.dataset.strokeRgba) >>> 0)}`;
    if (rm === 1) s.style.webkitTextFillColor = 'transparent';
  } else {
    s.style.webkitTextStroke = '';
    s.style.webkitTextFillColor = '';
  }
  const hs = parseFloat(s.dataset.hScale) || 1;
  s.style.display = 'inline-block';
  s.style.transform = hs !== 1 ? `scaleX(${hs})` : '';
  s.style.transformOrigin = '0 50%';
  if (hs === 1) s.style.display = '';
}

function parseEditor(ed, original) {
  const runs = [];
  const pushRun = (text, span) => {
    if (text) text = text.replace(/[\r\u200B]/g, '');
    if (!text) return;
    const st = spanStyle(span, original);
    const last = runs[runs.length - 1];
    if (
      last &&
      sameStyle(last, st) &&
      !last.text.endsWith('\n') &&
      !text.startsWith('\n') &&
      !last.text.includes('\uFFFC') &&
      !text.includes('\uFFFC')
    )
      last.text += text;
    else runs.push({ ...st, text });
  };
  const isBlock = (n) =>
    n.nodeName === 'DIV' || n.nodeName === 'P' || n.nodeName === 'LI';
  let lastSpan = null;
  const collect = (node, curSpan) => {
    node.childNodes.forEach((c) => {
      if (c.nodeType === Node.TEXT_NODE) {
        if (curSpan) lastSpan = curSpan;
        pushRun(c.textContent, curSpan);
      } else if (c.nodeName === 'BR') {
        pushRun('\n', curSpan || lastSpan);
      } else {
        if (c.dataset?.atomic === '1') {
          pushRun('\uFFFC', c);
          const ar = runs[runs.length - 1];
          if (ar && ar.text === '\uFFFC') {
            ar.atomic = true;
            ar.box = c.dataset.abox
              ? c.dataset.abox.split(',').map(Number)
              : [0, 0, parseFloat(c.dataset.atomicW) || 6, 10];
            if (c.dataset.aobj) ar.obj = c.dataset.aobj;
          }
          lastSpan = c;
          return;
        }
        const next =
          c.dataset && c.dataset.src != null
            ? c
            : c.closest?.('span[data-src]') || curSpan;
        const softLine = c.classList?.contains('eline');
        if (
          isBlock(c) &&
          !softLine &&
          runs.length &&
          !runs[runs.length - 1].text.endsWith('\n')
        )
          pushRun('\n', curSpan || lastSpan);
        collect(c, next);
        if (softLine && c.dataset.nl === '1') pushRun('\n', lastSpan);
      }
    });
  };
  collect(ed, null);
  if (runs.length > 1 && runs[runs.length - 1].text === '\n')
    runs[runs.length - 2].text += runs.pop().text;
  return runs.filter((r) => r.text.length > 0);
}

function spanStyle(span, original) {
  if (span && span.dataset && span.dataset.src != null) {
    const d = span.dataset;
    return {
      family: d.family,
      size: parseFloat(d.size),
      rgba: parseInt(d.rgba) >>> 0,
      bold: d.bold === '2' ? 2 : d.bold === '1',
      italic: d.italic === '2' ? 2 : d.italic === '1',
      underline: d.underline === '1',
      strike: d.strike === '1',
      script: parseInt(d.script) || 0,
      renderMode: parseInt(d.renderMode) || 0,
      strokeRgba: (parseInt(d.strokeRgba) || 0) >>> 0,
      strokeWidth: parseFloat(d.strokeWidth) || 1,
      hScale: parseFloat(d.hScale) || 1,
      rise: parseFloat(d.rise) || 0,
      sourceIndex: parseInt(d.src),
    };
  }
  const base = original.find((r) => !r.atomic && !r.text?.includes('￼')) || {
    family: 'Helvetica',
    size: original[0]?.size || 12,
    rgba: 255,
  };
  return {
    family: base.family,
    size: base.size,
    rgba: base.rgba >>> 0,
    bold: !!base.bold,
    italic: !!base.italic,
    underline: false,
    strike: false,
    script: 0,
    renderMode: 0,
    strokeRgba: 0,
    strokeWidth: 1,
    hScale: 1,
    rise: 0,
    sourceIndex: original.indexOf(base),
  };
}
function sameStyle(a, b) {
  return (
    a.family === b.family &&
    a.size === b.size &&
    a.rgba === b.rgba &&
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.script === b.script &&
    a.sourceIndex === b.sourceIndex &&
    (a.renderMode | 0) === (b.renderMode | 0) &&
    (a.strokeRgba || 0) >>> 0 === (b.strokeRgba || 0) >>> 0 &&
    Math.abs((a.strokeWidth ?? 1) - (b.strokeWidth ?? 1)) < 0.05 &&
    Math.abs((a.hScale ?? 1) - (b.hScale ?? 1)) < 0.005 &&
    Math.abs((a.rise ?? 0) - (b.rise ?? 0)) < 0.05
  );
}

function endEdit(commit) {
  const e = state.editing;
  if (!e) return;
  state.editing = null;
  liveBlockMove = null;
  clearTimeout(e.glassSettle);
  P()?.renderParagraphLiveEnd?.();
  e.el?.remove();
  if (commit) {
    if (e.newGeom) {
      const runs = parseEditor(e.editable, []);
      if (runs.some((r) => r.text.trim())) {
        snapshotEdit('delete text', e.para);
        if (e.newGeom.replaces != null) {
          P().deleteParagraph(e.newGeom.replaces);
          state.paragraphs = state.paragraphs.filter(
            (q) => q.id !== e.newGeom.replaces
          );
        }
        const created = P().addParagraph(
          e.newGeom.x,
          e.newGeom.yTop,
          e.newGeom.width,
          runs,
          e.newGeom.fmt || {
            align: 0,
            lineSpacing: 1.25,
            charSpacing: 0,
            paraSpacing: 0,
          }
        );
        if (created) {
          state.paragraphs.push(created);
          state.selection = { kind: 'para', para: created };
          state.dirty = true;
        }
      } else {
        state.selection = null;
      }
    } else {
      const runs = parseEditor(e.editable, e.para.runs);
      if (runs.length && runsDiffer(runs, e.para.runs)) {
        if (window.__sanctityProbe)
          (window.__sanctityWhy ||= []).push(runsDiffer.why);
        snapshotEdit('edit text', e.para);
        const prevBottomEdit = e.para.box
          ? e.para.box.top - e.para.box.h
          : -1e30;
        const updated = P().commitParagraph(e.para.id, runs, e.para.format);
        if (updated) {
          replaceParagraph(e.para.id, updated);
          cascadeParagraphGrowth(updated, prevBottomEdit);
          state.selection = { kind: 'para', para: updated };
          state.dirty = true;
          if (!e.para.sharesObjects && !e.para.unwrapsForms) {
            const pvBox = e.preview
              ? {
                  box: {
                    x: e.preview.x,
                    top: e.preview.top,
                    w: e.preview.width,
                    h: e.preview.height,
                  },
                }
              : null;
            refreshAfterMutation(
              paraDirtyRect(blockMembers(e.para).concat([updated, pvBox]))
            );
            return;
          }
        } else {
          state.undo.pop();
        }
      } else if (!e.para.sharesObjects && !e.para.unwrapsForms) {
        const pvBox = e.preview
          ? {
              box: {
                x: e.preview.x,
                top: e.preview.top,
                w: e.preview.width,
                h: e.preview.height,
              },
            }
          : null;
        refreshAfterMutation(
          paraDirtyRect(blockMembers(e.para).concat([pvBox]))
        );
        return;
      }
    }
  }
  refreshAfterMutation();
}

function updateHoverCursor(e) {
  const canvas = $('page');
  if (!P().doc) {
    canvas.style.cursor = 'default';
    return;
  }
  if (e.target.closest?.('.obj-handle') || e.target.closest?.('.edit-move'))
    return;
  if (state.tool === 'addText') {
    canvas.style.cursor = 'text';
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) / state.zoom,
    py = P().pageHeight - (e.clientY - rect.top) / state.zoom;
  canvas.style.cursor = hitTestParagraphStrong(px, py)
    ? 'text'
    : hitTestObject(px, py)
      ? 'move'
      : hitTestParagraph(px, py)
        ? 'text'
        : 'default';
}

function replaceParagraph(id, updated) {
  const i = state.paragraphs.findIndex((p) => p.id === id);
  if (i >= 0) {
    if (updated) state.paragraphs[i] = updated;
    else state.paragraphs.splice(i, 1);
  } else if (updated) state.paragraphs.push(updated);
}

function runsDiffer(a, b) {
  runsDiffer.why = null;
  const lvl = (v) => (v === 2 ? 2 : v ? 1 : 0);
  const same = (x, y) =>
    x.family === y.family &&
    Math.round(x.size) === Math.round(y.size) &&
    x.rgba >>> 0 === y.rgba >>> 0 &&
    lvl(x.bold) === lvl(y.bold) &&
    lvl(x.italic) === lvl(y.italic) &&
    !!x.underline === !!y.underline &&
    !!x.strike === !!y.strike &&
    (x.script | 0) === (y.script | 0) &&
    (x.renderMode | 0) === (y.renderMode | 0) &&
    (x.strokeRgba || 0) >>> 0 === (y.strokeRgba || 0) >>> 0 &&
    Math.abs((x.strokeWidth ?? 1) - (y.strokeWidth ?? 1)) <= 0.05 &&
    Math.abs((x.hScale ?? 1) - (y.hScale ?? 1)) <= 0.005 &&
    Math.abs((x.rise ?? 0) - (y.rise ?? 0)) <= 0.05;
  const flat = (list) => {
    const out = [];
    for (const r of list) {
      const t = r.text || '';
      for (let i = 0; i < t.length; i++) out.push({ ch: t[i], r });
    }
    return out;
  };
  const fa = flat(a),
    fb = flat(b);
  if (fa.length !== fb.length) {
    runsDiffer.why = `length ${fb.length}→${fa.length}`;
    return true;
  }
  const fields = [
    ['text', (x, y, i) => fa[i].ch !== fb[i].ch],
    ['family', (x, y) => x.family !== y.family],
    ['size', (x, y) => Math.round(x.size) !== Math.round(y.size)],
    ['rgba', (x, y) => x.rgba >>> 0 !== y.rgba >>> 0],
    ['bold', (x, y) => lvl(x.bold) !== lvl(y.bold)],
    ['italic', (x, y) => lvl(x.italic) !== lvl(y.italic)],
    ['underline', (x, y) => !!x.underline !== !!y.underline],
    ['strike', (x, y) => !!x.strike !== !!y.strike],
    ['script', (x, y) => (x.script | 0) !== (y.script | 0)],
    ['renderMode', (x, y) => (x.renderMode | 0) !== (y.renderMode | 0)],
    [
      'strokeRgba',
      (x, y) => (x.strokeRgba || 0) >>> 0 !== (y.strokeRgba || 0) >>> 0,
    ],
    [
      'strokeWidth',
      (x, y) => Math.abs((x.strokeWidth ?? 1) - (y.strokeWidth ?? 1)) > 0.05,
    ],
    ['hScale', (x, y) => Math.abs((x.hScale ?? 1) - (y.hScale ?? 1)) > 0.005],
    ['rise', (x, y) => Math.abs((x.rise ?? 0) - (y.rise ?? 0)) > 0.05],
    ['atomic', (x, y) => !!x.atomic !== !!y.atomic],
  ];
  for (let i = 0; i < fa.length; i++) {
    const x = fa[i].r,
      y = fb[i].r;
    for (const [name, differs] of fields) {
      if (!differs(x, y, i)) continue;
      const ctx = fb
        .slice(Math.max(0, i - 8), i + 8)
        .map((e) => e.ch)
        .join('');
      runsDiffer.why =
        `char ${i} ${name}: ${JSON.stringify(y[name] ?? fb[i].ch)} → ` +
        `${JSON.stringify(x[name] ?? fa[i].ch)} near ${JSON.stringify(ctx)}`;
      return true;
    }
  }
  return false;
}

function cascadeParagraphGrowth(updated, prevBottom) {
  if (!updated?.box || !(prevBottom > -1e29)) return;
  const newBottom = updated.box.top - updated.box.h;
  const delta = prevBottom - newBottom;
  if (!(Math.abs(delta) > 0.5)) return;
  const L = updated.box.x;
  const R = updated.box.x + updated.box.w;
  const span = Math.max(1, R - L);
  const movers = [];
  for (const q of state.paragraphs) {
    if (!q || q.id === updated.id || !q.box) continue;
    if (!q.editable || q.vertical || q.invisible) continue;
    if (Math.abs((q.rotation || 0) - (updated.rotation || 0)) > 0.01) continue;
    if (q.box.top > prevBottom + 0.5) continue;
    const l = q.box.x;
    const r = q.box.x + q.box.w;
    const overlap = Math.min(R, r) - Math.max(L, l);
    if (overlap < 0.35 * Math.min(span, Math.max(1, r - l))) continue;
    movers.push(q);
  }
  for (const q of movers) {
    if (P().moveParagraph(q.id, 0, -delta)) {
      const moved = {
        ...q,
        box: { ...q.box, top: q.box.top - delta },
      };
      replaceParagraph(q.id, moved);
    }
  }
}

function refreshAfterMutation(dirtyRect) {
  if (P()._pageStale) {
    refreshModel();
    dirtyRect = null;
  }
  if (!dirtyRect || !renderPageRegionBlit(dirtyRect)) renderPage();
  else {
    drawOverlay();
    drawRulers();
  }
  updateChrome();
  scheduleRegen();
}

function renderPageRegionBlit(rect) {
  const eng = P();
  const canvas = $('page');
  if (!eng?.doc || !canvas.width || !eng.pageWidth) return false;
  if (state.editing) return false;
  const scale = canvas.width / eng.pageWidth;
  if (Math.abs(canvas.height / eng.pageHeight - scale) > 0.01) return false;
  const pad = 8;
  const px0 = Math.max(0, Math.floor((rect.x - pad) * scale));
  const py0 = Math.max(0, Math.floor((rect.y - pad) * scale));
  const px1 = Math.min(
    canvas.width,
    Math.ceil((rect.x + rect.w + pad) * scale)
  );
  const py1 = Math.min(
    canvas.height,
    Math.ceil((rect.y + rect.h + pad) * scale)
  );
  const pw = px1 - px0,
    ph = py1 - py0;
  if (pw <= 0 || ph <= 0) return false;
  if (pw * ph > canvas.width * canvas.height * 0.6) return false;
  const img = eng.renderPageRegion(
    canvas.width,
    canvas.height,
    px0,
    py0,
    pw,
    ph
  );
  if (!img) return false;
  canvas
    .getContext('2d')
    .putImageData(new ImageData(img.data, img.width, img.height), px0, py0);
  return true;
}

function blockMembers(para) {
  if (!para?.blockId) return [para];
  return state.paragraphs
    .filter((q) => q.blockId === para.blockId)
    .concat([para]);
}

function paraDirtyRect(entries) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  const H = P().pageHeight;
  for (const p of entries) {
    if (!p?.box) continue;
    const top = H - p.box.top;
    x0 = Math.min(x0, p.box.x);
    y0 = Math.min(y0, top);
    x1 = Math.max(x1, p.box.x + p.box.w);
    y1 = Math.max(y1, top + p.box.h);
  }
  if (!(x1 > x0) || !(y1 > y0)) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

let regenTimer = 0;
function scheduleRegen() {
  clearTimeout(regenTimer);
}

function editorSelectionRange(ed) {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!ed.contains(range.startContainer) || !ed.contains(range.endContainer))
    return null;
  const pre = document.createRange();
  pre.selectNodeContents(ed);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  return { start, end: start + range.toString().length };
}

const WORD_CHAR = /[\p{L}\p{N}_'\u2019\uFFFD\uFFFC]/u;

function isWordChar(ch) {
  return !!ch && WORD_CHAR.test(ch);
}

function flattenEditorChars(ed) {
  const chars = [];
  const dsOf = (node) => {
    const span =
      node.nodeType === Node.TEXT_NODE
        ? node.parentElement?.closest('span')
        : node.closest?.('span');
    const d = span?.dataset || {};
    return {
      src: d.src ?? '-1',
      family: d.family || 'Helvetica',
      size: d.size || '12',
      rgba: d.rgba || '255',
      bold: d.bold || '0',
      italic: d.italic || '0',
      underline: d.underline || '0',
      strike: d.strike || '0',
      script: d.script || '0',
      renderMode: d.renderMode || '0',
      strokeRgba: d.strokeRgba || '0',
      strokeWidth: d.strokeWidth || '1',
      hScale: d.hScale || '1',
      rise: d.rise || '0',
      fallback: d.fallback || '',
      docfont: d.docfont || '',
      docfontFor: d.docfontFor || '',
    };
  };
  const isBlock = (n) =>
    n.nodeName === 'DIV' || n.nodeName === 'P' || n.nodeName === 'LI';
  const visit = (node) => {
    for (const c of node.childNodes) {
      if (c.nodeType === Node.TEXT_NODE) {
        const base = dsOf(c);
        for (let k = 0; k < c.textContent.length; k++)
          chars.push({ ch: c.textContent[k], ds: { ...base } });
      } else if (c.nodeName === 'BR') {
        chars.push({ ch: '\n', ds: dsOf(c) });
      } else {
        if (isBlock(c) && chars.length && chars[chars.length - 1].ch !== '\n')
          chars.push({ ch: '\n', ds: dsOf(c) });
        visit(c);
      }
    }
  };
  visit(ed);
  return chars;
}

const dsKey = (d) =>
  `${d.src}|${d.family}|${d.size}|${d.rgba}|${d.bold}|${d.italic}|${d.underline}|${d.strike}|${d.script}|${d.renderMode}|${d.strokeRgba}|${d.strokeWidth}|${d.hScale}|${d.rise}`;

function rebuildEditorFromChars(ed, chars) {
  ed.replaceChildren();
  let i = 0;
  while (i < chars.length) {
    const key = dsKey(chars[i].ds),
      ds = chars[i].ds;
    let text = '';
    while (i < chars.length && dsKey(chars[i].ds) === key) {
      text += chars[i].ch;
      i++;
    }
    const span = document.createElement('span');
    span.textContent = text;
    Object.assign(span.dataset, ds);
    applySpanStyle(span);
    if (ds.atomic === '1') applyAtomicSpanStyle(span);
    ed.appendChild(span);
  }
  if (!ed.childNodes.length) ed.appendChild(document.createElement('span'));
}

function restoreEditorSelection(ed, start, end) {
  const sel = window.getSelection();
  const range = document.createRange();
  let count = 0,
    sN,
    sO,
    eN,
    eO;
  const walk = (node) => {
    for (const c of node.childNodes) {
      if (c.nodeType === Node.TEXT_NODE) {
        const len = c.textContent.length;
        if (sN == null && start <= count + len) {
          sN = c;
          sO = start - count;
        }
        if (eN == null && end <= count + len) {
          eN = c;
          eO = end - count;
        }
        count += len;
      } else if (c.nodeName === 'BR') {
        count += 1;
      } else walk(c);
    }
  };
  walk(ed);
  if (sN && eN) {
    range.setStart(sN, sO);
    range.setEnd(eN, eO);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function dsFromRun(r) {
  return {
    family: r.family,
    size: String(r.size),
    rgba: String(r.rgba >>> 0),
    bold: r.bold === 2 ? '2' : r.bold ? '1' : '0',
    italic: r.italic === 2 ? '2' : r.italic ? '1' : '0',
    underline: r.underline ? '1' : '0',
    strike: r.strike ? '1' : '0',
    script: String(r.script | 0),
    renderMode: String(r.renderMode | 0),
    strokeRgba: String((r.strokeRgba || 0) >>> 0),
    strokeWidth: String(r.strokeWidth ?? 1),
    hScale: String(r.hScale ?? 1),
    rise: String(r.rise ?? 0),
  };
}
function applyDsToRun(r, d) {
  r.family = d.family;
  r.size = parseFloat(d.size);
  r.rgba = parseInt(d.rgba) >>> 0;
  r.bold =
    d.bold === '2' || d.bold === 2
      ? 2
      : d.bold === '1' || d.bold === 1 || d.bold === true;
  r.italic =
    d.italic === '2' || d.italic === 2
      ? 2
      : d.italic === '1' || d.italic === 1 || d.italic === true;
  r.underline = d.underline == 1 || d.underline === true;
  r.strike = d.strike == 1 || d.strike === true;
  r.script = parseInt(d.script) || 0;
  r.renderMode = parseInt(d.renderMode) || 0;
  r.strokeRgba = (parseInt(d.strokeRgba) || 0) >>> 0;
  r.strokeWidth = parseFloat(d.strokeWidth) || 1;
  r.hScale = parseFloat(d.hScale) || 1;
  r.rise = parseFloat(d.rise) || 0;
}

function styleLockedRange(es, sr, mutate) {
  const ed = es.editable;
  const runs = parseEditor(ed, es.para.runs);
  const out = [];
  let at = 0;
  for (const r of runs) {
    const len = r.text.length;
    const s0 = Math.max(at, sr.start),
      e0 = Math.min(at + len, sr.end);
    if (s0 >= e0 || r.text.includes('\uFFFC')) {
      out.push(r);
    } else {
      const pre = r.text.slice(0, s0 - at);
      const mid = r.text.slice(s0 - at, e0 - at);
      const post = r.text.slice(e0 - at);
      if (pre) out.push({ ...r, text: pre });
      const m2 = { ...r, text: mid };
      const d = dsFromRun(m2);
      mutate(d);
      applyDsToRun(m2, d);
      out.push(m2);
      if (post) out.push({ ...r, text: post });
    }
    at += len;
  }
  let pv = null;
  try {
    pv = P().previewParagraph(es.para.id, runsToInput(out), es.para.format);
  } catch {}
  if (pv && pv.lines.length) {
    const hadFocus =
      ed === document.activeElement || ed.contains(document.activeElement);
    renderLockedLines(ed, out, pv, es.para);
    applyDocFonts(es.para, ed);
    es.preview = pv;
    applyLockedGeom(es, pv);
    updateGlassSurface(es, pv, out);
    drawOverlay();
    if (hadFocus) lockedSelSet(ed, sr.start, sr.end);
    es.lastSel = { start: sr.start, end: sr.end, locked: true };
  }
}

function lockedInsertBreak(es) {
  const ed = es.editable;
  let caret = lockedCaretGet(ed);
  if (caret < 0) return;
  unpristine();
  const runs = parseEditor(ed, es.para.runs);
  const out = [];
  let at = 0,
    inserted = false;
  for (const r of runs) {
    const len = r.text.length;
    if (!inserted && caret <= at + len) {
      if (r.text.includes('\uFFFC')) {
        out.push(r);
        if (caret < at + len) caret = at + len;
      } else {
        const k = caret - at;
        const pre = r.text.slice(0, k),
          post = r.text.slice(k);
        if (pre) out.push({ ...r, text: pre });
        out.push({ ...r, text: '\n' });
        if (post) out.push({ ...r, text: post });
        inserted = true;
      }
    } else {
      out.push(r);
    }
    at += len;
  }
  if (!inserted) {
    const last = runs[runs.length - 1];
    out.push(last ? { ...last, text: '\n' } : { text: '\n' });
  }
  let pv = null;
  try {
    pv = P().previewParagraph(es.para.id, runsToInput(out), es.para.format);
  } catch {}
  if (!pv || !pv.lines.length) return;
  renderLockedLines(ed, out, pv, es.para);
  applyDocFonts(es.para, ed);
  es.preview = pv;
  applyLockedGeom(es, pv);
  drawOverlay();
  lockedCaretSet(ed, caret + 1);
}

function styleTargetRuns(mutate) {
  if (state.editing) unpristine();
  if (state.editing) {
    const ed = state.editing.editable;
    if (state.editing.locked) {
      const srL =
        lockedSelRange(ed) ||
        (state.editing.lastSel?.locked ? state.editing.lastSel : null);
      if (srL && srL.end > srL.start) {
        styleLockedRange(state.editing, srL, mutate);
        updateChrome();
        return;
      }
      ed.querySelectorAll('span[data-src]').forEach((sp) => {
        mutate(sp.dataset);
        applySpanStyle(sp);
        if (sp.dataset.atomic === '1') applyAtomicSpanStyle(sp);
      });
      schedulePreview();
      updateChrome();
      return;
    }
    const sr = editorSelectionRange(ed) || state.editing.lastSel;
    if (sr && sr.end > sr.start) {
      const hadFocus =
        ed === document.activeElement || ed.contains(document.activeElement);
      const chars = flattenEditorChars(ed);
      for (let i = sr.start; i < sr.end && i < chars.length; i++)
        mutate(chars[i].ds);
      rebuildEditorFromChars(ed, chars);
      if (hadFocus) restoreEditorSelection(ed, sr.start, sr.end);
      state.editing.lastSel = { ...sr };
    } else {
      ed.querySelectorAll('span').forEach((s) => {
        mutate(s.dataset);
        applySpanStyle(s);
      });
    }
    if (state.editing.locked) schedulePreview();
    updateChrome();
    return;
  }
  if (state.selection?.kind === 'para') {
    const para = state.selection.para;
    const runs = para.runs.map((r, i) => {
      const d = {
        family: r.family,
        size: r.size,
        rgba: r.rgba >>> 0,
        bold: r.bold === 2 ? 2 : r.bold ? 1 : 0,
        italic: r.italic === 2 ? 2 : r.italic ? 1 : 0,
        underline: r.underline ? 1 : 0,
        strike: r.strike ? 1 : 0,
        script: r.script | 0,
        hScale: r.hScale || 1,
        renderMode: r.renderMode | 0,
        strokeRgba: (r.strokeRgba || 0) >>> 0,
        strokeWidth: r.strokeWidth ?? 1,
        rise: r.rise || 0,
      };
      mutate(d);
      return {
        text: r.text,
        family: d.family,
        size: parseFloat(d.size),
        rgba: d.rgba >>> 0,
        bold: parseInt(d.bold) || 0,
        italic: parseInt(d.italic) || 0,
        underline: d.underline == 1,
        strike: d.strike == 1,
        script: parseInt(d.script) || 0,
        renderMode: parseInt(d.renderMode) || 0,
        strokeRgba: (parseInt(d.strokeRgba) || 0) >>> 0,
        strokeWidth: parseFloat(d.strokeWidth) || 1,
        hScale: parseFloat(d.hScale) || 1,
        rise: parseFloat(d.rise) || 0,
        sourceIndex: i,
      };
    });
    snapshotEdit('edit text', para);
    const updated = P().commitParagraph(para.id, runs, para.format);
    if (updated) {
      replaceParagraph(para.id, updated);
      state.selection = { kind: 'para', para: updated };
      state.dirty = true;
    }
  }
  refreshAfterMutation();
}

function changeFormat(mutate) {
  if (state.editing) unpristine();
  if (state.editing?.newGeom) {
    const fmt = { align: 0, lineSpacing: 1.25, charSpacing: 0, paraSpacing: 0 };
    mutate(fmt);
    state.editing.newGeom.fmt = fmt;
    state.editing.editable.style.textAlign =
      ['left', 'center', 'right', 'justify'][fmt.align] || 'left';
    state.editing.editable.style.lineHeight = fmt.lineSpacing;
    updateChrome();
    return;
  }
  let para = state.editing?.para || state.selection?.para;
  if (!para) return;
  const fmt = { ...para.format };
  mutate(fmt);
  const runs = state.editing
    ? parseEditor(state.editing.editable, para.runs)
    : para.runs.map((r, i) => ({ ...r, rgba: r.rgba >>> 0, sourceIndex: i }));
  const safe = runs.length
    ? runs
    : para.runs.map((r, i) => ({ ...r, rgba: r.rgba >>> 0, sourceIndex: i }));
  snapshotEdit('edit text', para);
  const prevBottomFmt = para.box ? para.box.top - para.box.h : -1e30;
  const updated = P().commitParagraph(para.id, safe, fmt);
  if (updated) {
    replaceParagraph(updated.id, updated);
    cascadeParagraphGrowth(updated, prevBottomFmt);
    state.selection = { kind: 'para', para: updated };
    if (state.editing) {
      state.editing.para = updated;
      const ed2 = state.editing.editable;
      ed2.style.textAlign =
        ['left', 'center', 'right', 'justify'][updated.format.align] || 'left';
      if (!state.editing.locked)
        ed2.style.lineHeight = updated.format.lineSpacing || 1.2;
      if (state.editing.locked) schedulePreview();
    }
    state.dirty = true;
  }
  refreshAfterMutation();
}

function scopeAllowsPara() {
  return state.editScope.includes('all') || state.editScope.includes('text');
}
function scopeAllowsObj(type) {
  if (type === OBJ.UNKNOWN || type === OBJ.TEXT) return false;
  if (state.editScope.includes('all')) return true;
  if (state.editScope.includes('image') && type === OBJ.IMAGE) return true;
  if (
    state.editScope.includes('shape') &&
    (type === OBJ.PATH || type === OBJ.FORM)
  )
    return true;
  return false;
}

let objectIndexCache = null;

function objectIndex() {
  const eng = P();
  const epoch = eng._objEpoch || 0;
  if (
    objectIndexCache &&
    objectIndexCache.epoch === epoch &&
    objectIndexCache.page === eng.pageIndex
  )
    return objectIndexCache.items;
  const items = [];
  const n = eng.objectCount();
  for (let i = 0; i < n; i++) {
    const o = eng.objectAt(i);
    if (!o) continue;
    const b = eng.objectBounds(o.handle);
    if (!b) continue;
    items.push({ handle: o.handle, index: i, type: o.type, bounds: b });
  }
  objectIndexCache = { epoch, page: eng.pageIndex, items };
  return items;
}

function hitTestObject(px, py) {
  let best = null;
  for (const o of objectIndex()) {
    if (!scopeAllowsObj(o.type)) continue;
    const b = o.bounds;
    if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) best = o;
  }
  return best ? { ...best } : null;
}

function hitTestParagraph(px, py) {
  if (!scopeAllowsPara()) return null;
  let best = null,
    bestArea = Infinity;
  for (const p of state.paragraphs) {
    if (!p.editable) continue;
    const q = pageToText(p, px, py);
    const x = p.box.x,
      top = p.box.top,
      w = p.box.w,
      h = p.box.h;
    if (
      q.x >= x - 3 &&
      q.x <= x + w + 3 &&
      q.y <= top + 3 &&
      q.y >= top - h - 3
    ) {
      const area = w * h;
      if (area < bestArea) {
        best = p;
        bestArea = area;
      }
    }
  }
  return best;
}

function hitTestParagraphStrong(px, py) {
  if (!scopeAllowsPara()) return null;
  let best = null,
    bestArea = Infinity;
  for (const p of state.paragraphs) {
    if (!p.editable || !p.lines?.length) continue;
    const q = pageToText(p, px, py);
    const sz = p.runs?.reduce((m, r) => Math.max(m, r.size || 0), 0) || 12;
    for (const L of p.lines) {
      if (
        q.x >= L.x - 2 &&
        q.x <= L.x + L.w + 2 &&
        q.y >= L.y - 0.35 * sz &&
        q.y <= L.y + 1.0 * sz
      ) {
        const area = p.box.w * p.box.h;
        if (area < bestArea) {
          best = p;
          bestArea = area;
        }
        break;
      }
    }
  }
  return best;
}

function paraEnvelope(p) {
  const b = p.box;
  const cs = [
    [b.x, b.top],
    [b.x + b.w, b.top],
    [b.x, b.top - b.h],
    [b.x + b.w, b.top - b.h],
  ].map(([x, y]) => textToPage(p, x, y));
  const xs = cs.map((c) => c.x),
    ys = cs.map((c) => c.y);
  const x0 = Math.min(...xs),
    y0 = Math.min(...ys);
  return { x: x0, y: y0, w: Math.max(...xs) - x0, h: Math.max(...ys) - y0 };
}

function selectObject(o) {
  state.selection = o ? { kind: 'object', ...o } : null;
  drawOverlay();
  updateChrome();
}
function selectParagraph(p) {
  state.selection = p ? { kind: 'para', para: p } : null;
  drawOverlay();
  updateChrome();
}

const sameItem = (a, b) =>
  a.t === b.t &&
  (a.t === 'para' ? a.para.id === b.para.id : a.handle === b.handle);

function currentItems() {
  const s = state.selection;
  if (!s) return [];
  if (s.kind === 'multi') return [...s.items];
  if (s.kind === 'para') return [{ t: 'para', para: s.para }];
  if (s.kind === 'object')
    return [{ t: 'obj', handle: s.handle, type: s.type, bounds: s.bounds }];
  return [];
}

function setMultiSelection(items) {
  endEdit(true);
  if (items.length === 0) state.selection = null;
  else if (items.length === 1) {
    const it = items[0];
    state.selection =
      it.t === 'para'
        ? { kind: 'para', para: it.para }
        : {
            kind: 'object',
            handle: it.handle,
            type: it.type,
            bounds: it.bounds,
          };
  } else state.selection = { kind: 'multi', items };
  drawOverlay();
  updateChrome();
}

function toggleMultiSelect(item) {
  endEdit(true);
  const items = currentItems();
  const i = items.findIndex((x) => sameItem(x, item));
  if (i >= 0) items.splice(i, 1);
  else items.push(item);
  setMultiSelection(items);
}

function noteItemMatrix(it) {
  if (it.t === 'obj') noteMatrix(it.handle);
}

function moveItem(it, dx, dy) {
  if (it.t === 'obj') {
    P().translateObject(it.handle, dx, dy);
    it.bounds = P().objectBounds(it.handle);
  } else if (P().moveParagraph(it.para.id, dx, dy)) {
    const dT = pageToText(it.para, dx, dy);
    const moved = {
      ...it.para,
      box: {
        ...it.para.box,
        x: it.para.box.x + dT.x,
        top: it.para.box.top + dT.y,
      },
    };
    replaceParagraph(it.para.id, moved);
    it.para = moved;
  }
}

function itemEnvelope(it) {
  return it.t === 'obj' ? { ...it.bounds } : paraEnvelope(it.para);
}

function alignSelection(op) {
  if (state.selection?.kind !== 'multi') return;
  const items = state.selection.items;
  const envs = items.map(itemEnvelope);
  snapshotEdit('align');
  for (const it of items) noteItemMatrix(it);
  if (op === 'disth' || op === 'distv') {
    if (items.length < 3) {
      state.undo.pop();
      return;
    }
    const horiz = op === 'disth';
    const order = items
      .map((it, i) => ({ it, e: envs[i] }))
      .sort((a, b) =>
        horiz ? a.e.x - b.e.x : b.e.y + b.e.h - (a.e.y + a.e.h)
      );
    const first = order[0].e,
      last = order[order.length - 1].e;
    const span = horiz ? last.x + last.w - first.x : first.y + first.h - last.y;
    const sum = order.reduce((n, o) => n + (horiz ? o.e.w : o.e.h), 0);
    const gap = (span - sum) / (order.length - 1);
    let cursor = horiz ? first.x : first.y + first.h;
    for (const o of order) {
      if (horiz) {
        moveItem(o.it, cursor - o.e.x, 0);
        cursor += o.e.w + gap;
      } else {
        moveItem(o.it, 0, cursor - (o.e.y + o.e.h));
        cursor -= o.e.h + gap;
      }
    }
  } else {
    let target;
    if (op === 'left') target = Math.min(...envs.map((e) => e.x));
    else if (op === 'right') target = Math.max(...envs.map((e) => e.x + e.w));
    else if (op === 'hcenter')
      target = envs.reduce((n, e) => n + e.x + e.w / 2, 0) / envs.length;
    else if (op === 'top') target = Math.max(...envs.map((e) => e.y + e.h));
    else if (op === 'bottom') target = Math.min(...envs.map((e) => e.y));
    else if (op === 'vcenter')
      target = envs.reduce((n, e) => n + e.y + e.h / 2, 0) / envs.length;
    items.forEach((it, i) => {
      const e = envs[i];
      let dx = 0,
        dy = 0;
      if (op === 'left') dx = target - e.x;
      else if (op === 'right') dx = target - (e.x + e.w);
      else if (op === 'hcenter') dx = target - (e.x + e.w / 2);
      else if (op === 'top') dy = target - (e.y + e.h);
      else if (op === 'bottom') dy = target - e.y;
      else if (op === 'vcenter') dy = target - (e.y + e.h / 2);
      moveItem(it, dx, dy);
    });
  }
  state.dirty = true;
  refreshAfterMutation();
}

const LIST_RX =
  /^\s*((\d{1,3})([.)])|([a-z]{1,4})([.)])|([A-Z]{1,4})([.)])|[•◦▪‣●○–—-])\s+/;

const ROMAN = [
  [1000, 'm'],
  [900, 'cm'],
  [500, 'd'],
  [400, 'cd'],
  [100, 'c'],
  [90, 'xc'],
  [50, 'l'],
  [40, 'xl'],
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i'],
];
function romanToInt(str) {
  const s2 = str.toLowerCase();
  let i = 0,
    v = 0;
  for (const [val, sym] of ROMAN) {
    while (s2.startsWith(sym, i)) {
      v += val;
      i += sym.length;
    }
  }
  return i === s2.length && v > 0 ? v : null;
}
function intToRoman(n) {
  let out = '';
  for (const [val, sym] of ROMAN)
    while (n >= val) {
      out += sym;
      n -= val;
    }
  return out;
}
function parseMarker(body) {
  if (/^\d+$/.test(body)) return { kind: 'num', n: parseInt(body, 10) };
  const roman = romanToInt(body);
  if (roman != null && (body.length > 1 || body.toLowerCase() === 'i')) {
    return {
      kind: 'roman',
      n: roman,
      upper: body[0] === body[0].toUpperCase(),
    };
  }
  if (/^[a-zA-Z]$/.test(body)) {
    return {
      kind: 'alpha',
      n: body.toLowerCase().charCodeAt(0) - 96,
      upper: body === body.toUpperCase(),
    };
  }
  return null;
}
function markerText(kind, n, upper, sep) {
  let core = '';
  if (kind === 'num') core = String(n);
  else if (kind === 'alpha')
    core = String.fromCharCode(96 + Math.max(1, Math.min(26, n)));
  else core = intToRoman(Math.max(1, n));
  if (upper) core = core.toUpperCase();
  return core + (sep || '.');
}

function listPrefixOf(para, ed) {
  const t = ed
    ? flattenEditorChars(ed)
        .map((c) => c.ch)
        .join('')
    : para.runs[0]?.text || '';
  const m = t.match(LIST_RX);
  if (m) {
    const body = m[2] || m[4] || m[6];
    const sep = m[3] || m[5] || m[7] || null;
    const seq = body ? parseMarker(body) : null;
    return {
      text: m[1] + ' ',
      num: seq ? seq.n : null,
      sep,
      kind: seq ? seq.kind : null,
      upper: seq ? !!seq.upper : false,
    };
  }
  if (para.marker) return { text: '', num: null, marker: true };
  return null;
}

function continueListItem(lp) {
  const src = state.editing.para;
  const style = { ...src.runs[0] };
  endEdit(true);
  const cur = state.paragraphs.find((q) => q.id === src.id) || src;
  const size = style.size || 12;
  const pitch = Math.max(1, cur.format.lineSpacing || 1.2) * size;
  const yTop = cur.box.top - cur.box.h - Math.max(2, pitch - size);
  const prefix = lp.marker
    ? '\u00a0'
    : lp.num != null
      ? markerText(lp.kind || 'num', lp.num + 1, lp.upper, lp.sep) + ' '
      : lp.text;
  snapshotEdit('add text');
  let created = P().addParagraph(
    cur.box.x,
    yTop,
    cur.box.w,
    [
      {
        text: prefix,
        family: style.family,
        size,
        rgba: style.rgba >>> 0 || 255,
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        script: 0,
        renderMode: 0,
        strokeRgba: 0,
        strokeWidth: 1,
        hScale: 1,
        rise: 0,
        sourceIndex: -1,
      },
    ],
    {
      align: 0,
      lineSpacing: cur.format.lineSpacing || 1.2,
      charSpacing: 0,
      paraSpacing: 0,
    }
  );
  if (created) {
    state.paragraphs.push(created);
    if (lp.marker && !P().cloneMarker(cur.id, created.id)) {
      const fb = P().commitParagraph(
        created.id,
        [
          {
            ...created.runs[0],
            text: '• ',
            rgba: created.runs[0].rgba >>> 0,
            sourceIndex: -1,
          },
        ],
        created.format
      );
      if (fb) {
        replaceParagraph(created.id, fb);
        created = fb;
      }
    }
    if (lp.num != null) renumberListBelow(created, lp.num + 1);
    state.dirty = true;
    renderPage();
    beginEdit(created);
  }
}

function renumberListBelow(fromPara, fromNum) {
  const sibs = state.paragraphs
    .filter(
      (q) =>
        q.id !== fromPara.id &&
        q.editable &&
        Math.abs(q.box.x - fromPara.box.x) < 8 &&
        q.box.top < fromPara.box.top
    )
    .sort((a, b) => b.box.top - a.box.top);
  let expect = fromNum + 1;
  for (const q of sibs) {
    const m = (q.runs[0]?.text || '').match(LIST_RX);
    if (!m) break;
    const body = m[2] || m[4] || m[6];
    const sep = m[3] || m[5] || m[7];
    const seq = body ? parseMarker(body) : null;
    if (!seq) break;
    const runs = q.runs.map((r, i) => ({
      ...r,
      rgba: r.rgba >>> 0,
      sourceIndex: i,
      text:
        i === 0
          ? r.text.replace(
              LIST_RX,
              markerText(seq.kind, expect, seq.upper, sep) + ' '
            )
          : r.text,
    }));
    const u = P().commitParagraph(q.id, runs, q.format);
    if (u) replaceParagraph(q.id, u);
    expect++;
  }
}

function setListMarkerStyle(styleKey) {
  let para = state.editing?.para || state.selection?.para;
  if (!para) return;
  if (state.editing) endEdit(true);
  para = state.paragraphs.find((q) => q.id === para.id) || para;
  const kind =
    styleKey === '1'
      ? 'num'
      : styleKey.toLowerCase() === 'i'
        ? 'roman'
        : 'alpha';
  const upper = styleKey !== '1' && styleKey === styleKey.toUpperCase();
  const group = state.paragraphs
    .filter(
      (q) =>
        q.editable &&
        Math.abs(q.box.x - para.box.x) < 8 &&
        LIST_RX.test(q.runs[0]?.text || '')
    )
    .sort((a, b) => b.box.top - a.box.top);
  if (!group.length) return;
  snapshot();
  let n = 0;
  for (const q of group) {
    const m = (q.runs[0]?.text || '').match(LIST_RX);
    const body = m && (m[2] || m[4] || m[6]);
    if (!body || !parseMarker(body)) continue;
    n++;
    const sep = m[3] || m[5] || m[7] || '.';
    const runs = q.runs.map((r, i) => ({
      ...r,
      rgba: r.rgba >>> 0,
      sourceIndex: i,
      text:
        i === 0
          ? r.text.replace(LIST_RX, markerText(kind, n, upper, sep) + ' ')
          : r.text,
    }));
    const u = P().commitParagraph(q.id, runs, q.format);
    if (u) replaceParagraph(q.id, u);
  }
  state.dirty = n > 0;
  refreshAfterMutation();
}

function toggleListPrefix(kind) {
  let para = state.editing?.para || state.selection?.para;
  if (!para) return;
  if (state.editing) endEdit(true);
  para = state.paragraphs.find((q) => q.id === para.id) || para;
  const t = para.runs[0]?.text || '';
  const m = t.match(LIST_RX);
  let newFirst;
  if (m && ((kind === 'bullet' && !m[2]) || (kind === 'number' && m[2]))) {
    newFirst = t.replace(LIST_RX, '');
  } else {
    const stripped = m ? t.replace(LIST_RX, '') : t;
    if (kind === 'bullet') newFirst = '• ' + stripped;
    else {
      const above = state.paragraphs
        .filter(
          (q) =>
            q.id !== para.id &&
            Math.abs(q.box.x - para.box.x) < 8 &&
            q.box.top > para.box.top
        )
        .sort((a, b) => a.box.top - b.box.top)[0];
      const am = above ? (above.runs[0]?.text || '').match(LIST_RX) : null;
      const n = am && am[2] ? parseInt(am[2], 10) + 1 : 1;
      newFirst = `${n}. ` + stripped;
    }
  }
  const runs = para.runs.map((r, i) => ({
    ...r,
    rgba: r.rgba >>> 0,
    sourceIndex: i,
    text: i === 0 ? newFirst : r.text,
  }));
  snapshotEdit('edit text', para);
  const u = P().commitParagraph(para.id, runs, para.format);
  if (u) {
    replaceParagraph(para.id, u);
    state.selection = { kind: 'para', para: u };
    state.dirty = true;
  }
  refreshAfterMutation();
}

function stagePointHandlers() {
  const canvas = $('page');
  const ov = $('overlay');
  let drag = null;

  window.addEventListener(
    'mousedown',
    (e) => {
      if (!state.editing) return;
      const t = e.target;
      if (
        t.closest?.('.editor') ||
        t.closest?.('#inspector') ||
        t.closest?.('#toolbar') ||
        t.closest?.('#findbar') ||
        t.closest?.('#contextbar') ||
        t.closest?.('.dockpanel') ||
        t.closest?.('.dockrail') ||
        t.closest?.('.dsheet') ||
        t.closest?.('.para-box') ||
        t.closest?.('.para-handle') ||
        t.closest?.('.edit-move') ||
        t.closest?.('.rot-handle')
      )
        return;
      endEdit(true);
      if (!t.closest?.('#pageWrap')) selectObject(null);
    },
    true
  );

  ov.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) return;
      const t0 = e.touches[0];
      const el = document
        .elementFromPoint(t0.clientX, t0.clientY)
        ?.closest?.(
          '.obj-handle, .rot-handle, .para-handle, .edit-move, .sel-para, .obj-box'
        );
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      const sx = t0.clientX;
      const sy = t0.clientY;
      const tapPara =
        el.classList.contains('sel-para') && state.selection?.kind === 'para'
          ? state.selection.para
          : null;
      let fired = false;
      const fire = () => {
        fired = true;
        el.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: sx,
            clientY: sy,
            buttons: 1,
          })
        );
      };
      if (!tapPara) fire();
      const move = (ev) => {
        const t1 = ev.touches[0];
        if (!t1) return;
        ev.preventDefault();
        if (!fired) {
          if (Math.hypot(t1.clientX - sx, t1.clientY - sy) <= 12) return;
          fire();
        }
        window.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: t1.clientX,
            clientY: t1.clientY,
            buttons: 1,
          })
        );
      };
      const end = (ev) => {
        const t1 = ev.changedTouches?.[0];
        if (fired) {
          window.dispatchEvent(
            new MouseEvent('mouseup', {
              clientX: t1 ? t1.clientX : sx,
              clientY: t1 ? t1.clientY : sy,
            })
          );
        } else if (ev.type === 'touchend') {
          beginEdit(tapPara, {
            x: t1 ? t1.clientX : sx,
            y: t1 ? t1.clientY : sy,
          });
        }
        ov.removeEventListener('touchmove', move);
        ov.removeEventListener('touchend', end);
        ov.removeEventListener('touchcancel', end);
      };
      ov.addEventListener('touchmove', move, { passive: false });
      ov.addEventListener('touchend', end);
      ov.addEventListener('touchcancel', end);
    },
    { passive: false }
  );

  ov.addEventListener('mousedown', (e) => {
    const objH = e.target.closest?.(
      '.obj-handle:not(.para-handle):not(.rot-handle)'
    );
    const parH = e.target.closest?.('.para-handle');
    const mvH = e.target.closest?.('.edit-move');
    const rotH = e.target.closest?.('.rot-handle');
    const mbox = e.target.closest?.('.multi-box');
    const { px, py } = toPage(e);
    if (rotH && state.editing?.para) {
      e.stopPropagation();
      e.preventDefault();
      const pid = state.editing.para.id;
      endEdit(true);
      const para = state.paragraphs.find((q) => q.id === pid);
      if (!para) return;
      state.selection = { kind: 'para', para };
      drawOverlay();
      updateChrome();
      const b = para.box;
      const c = textToPage(para, b.x + b.w / 2, b.top - b.h / 2);
      drag = {
        mode: 'prot',
        para,
        cx: c.x,
        cy: c.y,
        a0: Math.atan2(py - c.y, px - c.x),
        delta: 0,
        moved: false,
      };
      return;
    }
    if (rotH && state.selection?.kind === 'object') {
      e.stopPropagation();
      e.preventDefault();
      const bb = state.selection.bounds;
      drag = {
        mode: 'orot',
        handle: state.selection.handle,
        cx: bb.x + bb.w / 2,
        cy: bb.y + bb.h / 2,
        a0: Math.atan2(py - (bb.y + bb.h / 2), px - (bb.x + bb.w / 2)),
        delta: 0,
        moved: false,
      };
      return;
    }
    if (rotH && state.selection?.kind === 'para') {
      e.stopPropagation();
      e.preventDefault();
      const para = state.selection.para;
      const b = para.box;
      const c = textToPage(para, b.x + b.w / 2, b.top - b.h / 2);
      drag = {
        mode: 'prot',
        para,
        cx: c.x,
        cy: c.y,
        a0: Math.atan2(py - c.y, px - c.x),
        delta: 0,
        moved: false,
      };
      return;
    }
    if (mbox && state.selection?.kind === 'multi') {
      e.stopPropagation();
      const it = state.selection.items[+mbox.dataset.idx];
      if (e.shiftKey) {
        toggleMultiSelect(it);
        return;
      }
      drag = {
        mode: 'mmove',
        startPx: px,
        startPy: py,
        moved: false,
        lastDx: 0,
        lastDy: 0,
      };
      return;
    }
    if (mvH && state.editing?.para) {
      e.stopPropagation();
      e.preventDefault();
      drag = {
        mode: 'emove',
        b0: { ...state.editing.para.box },
        blockId: state.editing.para.blockId || 0,
        startPx: px,
        startPy: py,
        moved: false,
        lastDx: 0,
        lastDy: 0,
      };
    } else if (parH && (state.editing?.para || state.editing?.newGeom)) {
      e.stopPropagation();
      const g0 = state.editing.para
        ? { ...state.editing.para.box }
        : {
            x: state.editing.newGeom.x,
            w: state.editing.newGeom.width,
          };
      drag = {
        mode: 'ewrap',
        edge: parH.dataset.ewrap,
        para: state.editing.para,
        b0: g0,
        startPx: px,
        moved: false,
      };
    } else if (objH && state.selection?.kind === 'object') {
      e.stopPropagation();
      drag = {
        mode: 'resize',
        corner: objH.dataset.handle,
        handle: state.selection.handle,
        startPx: px,
        startPy: py,
        b0: { ...state.selection.bounds },
        moved: false,
      };
    } else if (parH && state.selection?.kind === 'para') {
      e.stopPropagation();
      drag = {
        mode: 'pwrap',
        edge: parH.dataset.phandle,
        para: state.selection.para,
        b0: { ...state.selection.para.box },
        startPx: px,
        moved: false,
      };
    }
  });

  ov.addEventListener('mousedown', (e) => {
    if (e.target.closest?.('.obj-handle')) return;
    const { px, py } = toPage(e);
    if (e.target.closest?.('.obj-box') && state.selection?.kind === 'object') {
      e.stopPropagation();
      drag = {
        mode: 'move',
        handle: state.selection.handle,
        startPx: px,
        startPy: py,
        moved: false,
        lastDx: 0,
        lastDy: 0,
        clientX: e.clientX,
        clientY: e.clientY,
      };
    } else if (
      e.target.closest?.('.sel-para') &&
      state.selection?.kind === 'para'
    ) {
      e.stopPropagation();
      drag = {
        mode: 'pmove',
        para: state.selection.para,
        startPx: px,
        startPy: py,
        moved: false,
        lastDx: 0,
        lastDy: 0,
        clientX: e.clientX,
        clientY: e.clientY,
      };
    }
  });

  canvas.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1 || state.editing) return;
      const sx = e.touches[0].clientX;
      const sy = e.touches[0].clientY;
      let fired = false;
      const slop = (ev) => {
        const t1 = ev.touches[0];
        if (fired || !t1) return;
        if (Math.hypot(t1.clientX - sx, t1.clientY - sy) > 12) cleanup();
      };
      const drive = (ev) => {
        if (!fired) return;
        const t1 = ev.touches[0];
        if (!t1) return;
        ev.preventDefault();
        window.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: t1.clientX,
            clientY: t1.clientY,
            buttons: 1,
          })
        );
      };
      const finish = (ev) => {
        if (fired) {
          const t1 = ev.changedTouches?.[0];
          window.dispatchEvent(
            new MouseEvent('mouseup', {
              clientX: t1 ? t1.clientX : sx,
              clientY: t1 ? t1.clientY : sy,
            })
          );
        }
        cleanup();
      };
      const timer = setTimeout(() => {
        fired = true;
        navigator.vibrate?.(12);
        canvas.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: sx,
            clientY: sy,
            buttons: 1,
          })
        );
      }, 450);
      const cleanup = () => {
        clearTimeout(timer);
        canvas.removeEventListener('touchmove', slop);
        canvas.removeEventListener('touchmove', drive);
        canvas.removeEventListener('touchend', finish);
        canvas.removeEventListener('touchcancel', finish);
      };
      canvas.addEventListener('touchmove', slop, { passive: true });
      canvas.addEventListener('touchmove', drive, { passive: false });
      canvas.addEventListener('touchend', finish);
      canvas.addEventListener('touchcancel', finish);
    },
    { passive: true }
  );

  canvas.addEventListener('mousedown', (e) => {
    if (state.editing) return;
    const { px, py } = toPage(e);
    if (state.tool === 'addText') {
      drag = {
        mode: 'newbox',
        startPx: px,
        startPy: py,
        moved: false,
        clientX: e.clientX,
        clientY: e.clientY,
      };
      return;
    }
    const paraStrong = hitTestParagraphStrong(px, py);
    if (paraStrong) {
      if (e.shiftKey) {
        toggleMultiSelect({ t: 'para', para: paraStrong });
        return;
      }
      beginEdit(paraStrong, { x: e.clientX, y: e.clientY });
      return;
    }
    const obj = hitTestObject(px, py);
    if (obj) {
      if (e.shiftKey) {
        toggleMultiSelect({
          t: 'obj',
          handle: obj.handle,
          type: obj.type,
          bounds: obj.bounds,
        });
        return;
      }
      selectObject(obj);
      drag = {
        mode: 'move',
        handle: obj.handle,
        startPx: px,
        startPy: py,
        moved: false,
        lastDx: 0,
        lastDy: 0,
      };
      return;
    }
    const para = hitTestParagraph(px, py);
    if (para) {
      if (e.shiftKey) {
        toggleMultiSelect({ t: 'para', para });
        return;
      }
      beginEdit(para, { x: e.clientX, y: e.clientY });
      return;
    }
    if (!e.altKey) clearTextSelection();
    drag = {
      mode: e.altKey ? 'textsel' : 'marquee',
      startPx: px,
      startPy: py,
      moved: false,
    };
  });

  window.addEventListener('mousemove', (e) => {
    if (!drag) {
      updateHoverCursor(e);
      return;
    }
    const { px, py } = toPage(e);
    drag.moved = true;
    if (drag.mode === 'move') {
      drag.lastDx = px - drag.startPx;
      drag.lastDy = py - drag.startPy;
      drag.smartT ||= collectSmartTargets({ skipObj: new Set([drag.handle]) });
      {
        const s2 = smartSnap(
          state.selection.bounds,
          drag.lastDx,
          drag.lastDy,
          drag.smartT
        );
        drag.lastDx = s2.dx;
        drag.lastDy = s2.dy;
        showSmartGuides(s2.gv, s2.gh);
      }
      const b = state.selection.bounds;
      const r = objRectView({
        ...b,
        x: b.x + drag.lastDx,
        y: b.y + drag.lastDy,
      });
      const box = ov.querySelector('.obj-box');
      if (box) {
        box.style.left = r.x - BOX_PAD + 'px';
        box.style.top = r.y - BOX_PAD + 'px';
      }
    } else if (drag.mode === 'pmove') {
      drag.lastDx = px - drag.startPx;
      drag.lastDy = py - drag.startPy;
      if (!drag.para.rotation) {
        const b = drag.para.box;
        const pc = textToPage(drag.para, b.x, b.top);
        drag.smartT ||= collectSmartTargets({
          skipPara: new Set([drag.para.id]),
        });
        const s2 = smartSnap(
          { x: pc.x, y: pc.y - b.h, w: b.w, h: b.h },
          drag.lastDx,
          drag.lastDy,
          drag.smartT
        );
        drag.lastDx = s2.dx;
        drag.lastDy = s2.dy;
        showSmartGuides(s2.gv, s2.gh);
      }
      const dT = pageToText(drag.para, drag.lastDx, drag.lastDy);
      const tmp = {
        ...drag.para,
        box: {
          ...drag.para.box,
          x: drag.para.box.x + dT.x,
          top: drag.para.box.top + dT.y,
        },
      };
      const pl = paraPlacement(tmp);
      const ch = ov.querySelector('.sel-chrome');
      if (ch) {
        ch.style.left = pl.x + 'px';
        ch.style.top = pl.y + 'px';
      }
    } else if (drag.mode === 'pwrap') {
      const dT = pageToText(drag.para, px - drag.startPx, py - drag.startPy);
      const dx = dT.x;
      let nx = drag.b0.x,
        nw = drag.b0.w;
      if (drag.edge === 'e') nw = Math.max(30, drag.b0.w + dx);
      else {
        nw = Math.max(30, drag.b0.w - dx);
        nx = drag.b0.x + (drag.b0.w - nw);
      }
      drag.nw = nw;
      drag.nx = nx;
      if (!drag.para.rotation) {
        const r = paraRectView({ ...drag.b0, x: nx, w: nw });
        const ch = ov.querySelector('.sel-chrome');
        if (ch) {
          ch.style.left = r.x + 'px';
          ch.style.width = r.w + 'px';
          const bx = ch.querySelector('.sel-para');
          if (bx) bx.style.width = r.w + 'px';
        }
      }
    } else if (drag.mode === 'emove') {
      drag.lastDx = px - drag.startPx;
      drag.lastDy = py - drag.startPy;
      {
        const para = state.editing?.para;
        if (para && !para.rotation) {
          drag.smartT ||= collectSmartTargets({
            skipPara: new Set(
              drag.blockId
                ? state.paragraphs
                    .filter((q) => q.blockId === drag.blockId)
                    .map((q) => q.id)
                : [para.id]
            ),
          });
          const b = drag.b0;
          const s2 = smartSnap(
            { x: b.x, y: b.top - b.h, w: b.w, h: b.h },
            drag.lastDx,
            drag.lastDy,
            drag.smartT
          );
          drag.lastDx = s2.dx;
          drag.lastDy = s2.dy;
          showSmartGuides(s2.gv, s2.gh);
        }
      }
      const wrap = state.editing?.el;
      if (wrap) {
        const para = state.editing.para;
        liveBlockMove = drag.blockId
          ? { blockId: drag.blockId, dx: drag.lastDx, dy: drag.lastDy }
          : null;
        const dT = pageToText(para, drag.lastDx, drag.lastDy);
        positionWrap(wrap, {
          ...para,
          box: { ...drag.b0, x: drag.b0.x + dT.x, top: drag.b0.top + dT.y },
        });
        drawOverlay();
      }
    } else if (drag.mode === 'ewrap') {
      const para = state.editing?.para;
      const dT = pageToText(para, px - drag.startPx, py - drag.startPy);
      const dx = dT.x;
      let nx = drag.b0.x,
        nw = drag.b0.w;
      if (drag.edge === 'e') nw = Math.max(30, drag.b0.w + dx);
      else {
        nw = Math.max(30, drag.b0.w - dx);
        nx = drag.b0.x + (drag.b0.w - nw);
      }
      const wrap = state.editing?.el;
      if (wrap) {
        if ((para && !para.rotation) || state.editing?.newGeom)
          wrap.style.left = nx * state.zoom + 'px';
        wrap.style.minWidth = nw * state.zoom + 'px';
        wrap.style.width = nw * state.zoom + 'px';
        drag.nw = nw;
        drag.nx = nx;
        drawOverlay();
      }
    } else if (drag.mode === 'mmove') {
      drag.lastDx = px - drag.startPx;
      drag.lastDy = py - drag.startPy;
      {
        if (!drag.smartT) {
          const skipPara = new Set(),
            skipObj = new Set();
          let u = null;
          for (const it of state.selection.items) {
            let r = null;
            if (it.t === 'para') {
              skipPara.add(it.para.id);
              if (!it.para.rotation) {
                const b = it.para.box;
                const pc = textToPage(it.para, b.x, b.top);
                r = { x: pc.x, y: pc.y - b.h, w: b.w, h: b.h };
              }
            } else {
              skipObj.add(it.handle);
              r = it.bounds;
            }
            if (r)
              u = !u
                ? { ...r }
                : (() => {
                    const x0 = Math.min(u.x, r.x),
                      y0 = Math.min(u.y, r.y);
                    const x1 = Math.max(u.x + u.w, r.x + r.w),
                      y1 = Math.max(u.y + u.h, r.y + r.h);
                    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
                  })();
          }
          drag.smartT = collectSmartTargets({ skipPara, skipObj });
          drag.smartEnv = u;
        }
        if (drag.smartEnv) {
          const s2 = smartSnap(
            drag.smartEnv,
            drag.lastDx,
            drag.lastDy,
            drag.smartT
          );
          drag.lastDx = s2.dx;
          drag.lastDy = s2.dy;
          showSmartGuides(s2.gv, s2.gh);
        }
      }
      ov.querySelectorAll('.multi-box').forEach((b, i) => {
        const it = state.selection.items[i];
        if (!it) return;
        if (it.t === 'para') {
          const dT = pageToText(it.para, drag.lastDx, drag.lastDy);
          const pl = paraPlacement({
            ...it.para,
            box: {
              ...it.para.box,
              x: it.para.box.x + dT.x,
              top: it.para.box.top + dT.y,
            },
          });
          b.style.left = pl.x + 'px';
          b.style.top = pl.y + 'px';
        } else {
          const r = objRectView({
            ...it.bounds,
            x: it.bounds.x + drag.lastDx,
            y: it.bounds.y + drag.lastDy,
          });
          b.style.left = r.x + 'px';
          b.style.top = r.y + 'px';
        }
      });
    } else if (drag.mode === 'orot') {
      drag.moved = true;
      drag.delta = Math.atan2(py - drag.cy, px - drag.cx) - drag.a0;
      const box = ov.querySelector('.obj-box');
      if (box) {
        box.style.transformOrigin = '50% 50%';
        box.style.transform = `rotate(${(-drag.delta * 180) / Math.PI}deg)`;
      }
    } else if (drag.mode === 'prot') {
      drag.moved = true;
      drag.delta = Math.atan2(py - drag.cy, px - drag.cx) - drag.a0;
      const ch = ov.querySelector('.sel-chrome');
      if (ch) {
        ch.style.transformOrigin = '50% 50%';
        const base = -(drag.para.rotation || 0);
        ch.style.transform = `rotate(${base - (drag.delta * 180) / Math.PI}deg)`;
      }
    } else if (drag.mode === 'newbox' || drag.mode === 'marquee') {
      drag.moved = true;
      drag.lastPx = px;
      drag.lastPy = py;
      if (!drag.el) {
        drag.el = document.createElement('div');
        drag.el.className = 'marquee';
        ov.appendChild(drag.el);
      }
      const z = state.zoom,
        H = P().pageHeight;
      const x0 = Math.min(drag.startPx, px) * z,
        x1 = Math.max(drag.startPx, px) * z;
      const y0 = (H - Math.max(drag.startPy, py)) * z,
        y1 = (H - Math.min(drag.startPy, py)) * z;
      Object.assign(drag.el.style, {
        left: x0 + 'px',
        top: y0 + 'px',
        width: x1 - x0 + 'px',
        height: y1 - y0 + 'px',
      });
    } else if (drag.mode === 'textsel') {
      drag.moved = true;
      drag.lastPx = px;
      drag.lastPy = py;
      showTextSelection(
        P().selectText(drag.startPx, drag.startPy, px, py, e.shiftKey ? 1 : 0)
      );
    } else if (drag.mode === 'resize') {
      const nb = resizedBounds(
        drag.b0,
        drag.corner,
        px - drag.startPx,
        py - drag.startPy
      );
      const r = objRectView(nb);
      const box = ov.querySelector('.obj-box');
      if (box) {
        box.style.left = r.x + 'px';
        box.style.top = r.y + 'px';
        box.style.width = r.w + 'px';
        box.style.height = r.h + 'px';
      }
    }
  });

  window.addEventListener('mouseup', (e) => {
    clearSmartGuides();
    if (drag && drag.moved) {
      const { px, py } = toPage(e);
      if (drag.mode === 'move' && state.selection?.kind === 'object') {
        snapshotEdit('move object');
        noteMatrix(drag.handle);
        P().translateObject(drag.handle, drag.lastDx, drag.lastDy);
        state.selection.bounds = P().objectBounds(drag.handle);
        state.dirty = true;
        refreshAfterMutation();
      } else if (drag.mode === 'resize' && state.selection?.kind === 'object') {
        snapshotEdit('resize object');
        noteMatrix(drag.handle);
        const nb = resizedBounds(
          drag.b0,
          drag.corner,
          px - drag.startPx,
          py - drag.startPy
        );
        const sx = nb.w / Math.max(0.01, drag.b0.w),
          sy = nb.h / Math.max(0.01, drag.b0.h);
        const ax = drag.corner.includes('w')
          ? drag.b0.x + drag.b0.w
          : drag.b0.x;
        const ay = drag.corner.includes('s')
          ? drag.b0.y + drag.b0.h
          : drag.b0.y;
        P().scaleObject(drag.handle, sx, sy, ax, ay);
        state.selection.bounds = P().objectBounds(drag.handle);
        state.dirty = true;
        refreshAfterMutation();
      } else if (drag.mode === 'pmove') {
        snapshotEdit('move text');
        if (P().moveParagraph(drag.para.id, drag.lastDx, drag.lastDy)) {
          const dT = pageToText(drag.para, drag.lastDx, drag.lastDy);
          const moved = {
            ...drag.para,
            box: {
              ...drag.para.box,
              x: drag.para.box.x + dT.x,
              top: drag.para.box.top + dT.y,
            },
          };
          replaceParagraph(drag.para.id, moved);
          state.selection = { kind: 'para', para: moved };
          state.dirty = true;
        }
        refreshAfterMutation();
      } else if (drag.mode === 'pwrap') {
        const nw = drag.nw ?? drag.b0.w;
        snapshotEdit('move text');
        if (drag.edge === 'w' && drag.nx != null) {
          const d = textToPage(drag.para, drag.nx - drag.b0.x, 0);
          P().moveParagraph(drag.para.id, d.x, d.y);
        }
        const updated = P().resizeParagraph(drag.para.id, nw);
        if (updated) {
          replaceParagraph(drag.para.id, updated);
          state.selection = { kind: 'para', para: updated };
          state.dirty = true;
        }
        refreshAfterMutation();
      } else if (drag.mode === 'mmove' && state.selection?.kind === 'multi') {
        snapshotEdit('move');
        for (const it of state.selection.items) noteItemMatrix(it);
        for (const it of state.selection.items)
          moveItem(it, drag.lastDx, drag.lastDy);
        state.dirty = true;
        refreshAfterMutation();
      } else if (drag.mode === 'orot') {
        const deg = (drag.delta * 180) / Math.PI;
        if (Math.abs(deg) > 0.5) {
          snapshotEdit('rotate object');
          noteMatrix(drag.handle);
          P().rotateObjectsAbout([drag.handle], deg, drag.cx, drag.cy);
          if (state.selection?.kind === 'object')
            state.selection.bounds = P().objectBounds(drag.handle);
          state.dirty = true;
        }
        refreshAfterMutation();
      } else if (drag.mode === 'prot' && drag.para) {
        const deg = (drag.delta * 180) / Math.PI;
        if (Math.abs(deg) > 0.5) {
          snapshotEdit('rotate text');
          const handles = P().paragraphObjects(drag.para.id);
          for (const h of handles) noteMatrix(h);
          P().rotateObjectsAbout(handles, deg, drag.cx, drag.cy);
          state.dirty = true;
          refreshModel();
          state.selection = null;
          renderPage();
          updateChrome();
        } else drawOverlay();
      } else if (drag.mode === 'textsel') {
        if (state.textSel?.text) {
          const n = state.textSel.blocks.length;
          toast(
            `Selected ${state.textSel.text.length} characters across ` +
              `${n} block${n === 1 ? '' : 's'} — ⌘C to copy.`
          );
        }
      } else if (drag.mode === 'newbox') {
        drag.el?.remove();
        const x0 = Math.min(drag.startPx, drag.lastPx ?? drag.startPx);
        const x1 = Math.max(drag.startPx, drag.lastPx ?? drag.startPx);
        const yTop = Math.max(drag.startPy, drag.lastPy ?? drag.startPy);
        const w = x1 - x0;
        const d0 = drag;
        drag = null;
        beginNewTextBox(x0, yTop, 14, { x: d0.clientX, y: d0.clientY }, w);
        return;
      } else if (drag.mode === 'marquee') {
        drag.el?.remove();
        const x0 = Math.min(drag.startPx, drag.lastPx ?? drag.startPx);
        const x1 = Math.max(drag.startPx, drag.lastPx ?? drag.startPx);
        const y0 = Math.min(drag.startPy, drag.lastPy ?? drag.startPy);
        const y1 = Math.max(drag.startPy, drag.lastPy ?? drag.startPy);
        const items = [];
        for (const p of state.paragraphs) {
          if (!p.editable || !scopeAllowsPara()) continue;
          const e2 = paraEnvelope(p);
          if (e2.x < x1 && e2.x + e2.w > x0 && e2.y < y1 && e2.y + e2.h > y0)
            items.push({ t: 'para', para: p });
        }
        for (let i = 0; i < P().objectCount(); i++) {
          const o = P().objectAt(i);
          if (!o || !scopeAllowsObj(o.type)) continue;
          const b = P().objectBounds(o.handle);
          if (b && b.x < x1 && b.x + b.w > x0 && b.y < y1 && b.y + b.h > y0)
            items.push({ t: 'obj', handle: o.handle, type: o.type, bounds: b });
        }
        setMultiSelection(items);
      } else if (drag.mode === 'ewrap' && state.editing?.newGeom) {
        const g = state.editing.newGeom;
        g.width = drag.nw ?? drag.b0.w;
        if (drag.edge === 'w' && drag.nx != null) g.x = drag.nx;
        drawOverlay();
      } else if (drag.mode === 'ewrap' && state.editing?.para) {
        const e2 = state.editing;
        const runs = parseEditor(e2.editable, e2.para.runs);
        snapshotEdit('edit text');
        let id = e2.para.id;
        const committed = P().commitParagraph(
          id,
          runs.length
            ? runs
            : e2.para.runs.map((r, i) => ({ ...r, sourceIndex: i })),
          e2.para.format
        );
        if (committed) replaceParagraph(id, committed);
        const nw = drag.nw ?? drag.b0.w;
        if (drag.edge === 'w' && drag.nx != null) {
          const d = textToPage(e2.para, drag.nx - drag.b0.x, 0);
          P().moveParagraph(id, d.x, d.y);
        }
        const resized = P().resizeParagraph(id, nw);
        state.editing = null;
        state.dirty = true;
        if (resized) {
          replaceParagraph(id, resized);
          renderPage();
          beginEdit(resized);
        } else refreshAfterMutation();
      } else if (drag.mode === 'emove' && state.editing?.para) {
        snapshotEdit('move text');
        const es = state.editing;
        liveBlockMove = null;
        const movers = drag.blockId
          ? state.paragraphs.filter((q) => q.blockId === drag.blockId)
          : [es.para];
        for (const q of movers) {
          if (!P().moveParagraph(q.id, drag.lastDx, drag.lastDy)) continue;
          const dT = pageToText(q, drag.lastDx, drag.lastDy);
          const moved = {
            ...q,
            box: { ...q.box, x: q.box.x + dT.x, top: q.box.top + dT.y },
          };
          replaceParagraph(q.id, moved);
          if (q.id === es.para.id) {
            es.para = moved;
            state.selection = { kind: 'para', para: moved };
          }
          state.dirty = true;
        }
        positionWrap(es.el, es.para);
        renderPage();
        updateChrome();
      }
    } else if (
      drag &&
      !drag.moved &&
      drag.mode === 'pmove' &&
      drag.clientX != null
    ) {
      beginEdit(drag.para, { x: drag.clientX, y: drag.clientY });
    } else if (
      drag &&
      !drag.moved &&
      drag.mode === 'move' &&
      drag.clientX != null
    ) {
      const { px, py } = toPage(e);
      const paraOver = hitTestParagraphStrong(px, py);
      if (paraOver) {
        state.selection = null;
        beginEdit(paraOver, { x: drag.clientX, y: drag.clientY });
      }
    } else if (drag && !drag.moved && drag.mode === 'newbox') {
      drag.el?.remove();
      const d0 = drag;
      drag = null;
      beginNewTextBox(d0.startPx, d0.startPy, 14, {
        x: d0.clientX,
        y: d0.clientY,
      });
      return;
    } else if (drag && !drag.moved && drag.mode === 'marquee') {
      drag.el?.remove();
      selectObject(null);
    } else if (drag && !drag.moved && drag.mode === 'prot') {
      drawOverlay();
    }
    liveBlockMove = null;
    drag = null;
  });
}

function resizedBounds(b, corner, dx, dy) {
  let { x, y, w, h } = b;
  if (corner.includes('e')) w = Math.max(4, b.w + dx);
  if (corner.includes('w')) {
    w = Math.max(4, b.w - dx);
    x = b.x + (b.w - w);
  }
  if (corner.includes('n')) h = Math.max(4, b.h + dy);
  if (corner.includes('s')) {
    h = Math.max(4, b.h - dy);
    y = b.y + (b.h - h);
  }
  return { x, y, w, h };
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const foldAccents = (str) =>
  Array.from(str, (ch) => [...ch.normalize('NFD')][0] || ch).join('');
function findOptions() {
  return {
    cs: $('caseSens').checked,
    word: $('wholeWord').checked,
    noAcc: $('noAccents').checked,
  };
}
function findRegex(needle, opts, global) {
  const n = escapeRegex(opts.noAcc ? foldAccents(needle) : needle);
  const body = opts.word ? '(?<![\\p{L}\\p{N}])' + n + '(?![\\p{L}\\p{N}])' : n;
  return new RegExp(body, 'u' + (global ? 'g' : '') + (opts.cs ? '' : 'i'));
}
const paraText = (p) => p.runs.map((r) => r.text).join('');
const findHaystack = (text, opts) => (opts.noAcc ? foldAccents(text) : text);

function paraMatches(p, needle, opts) {
  const hay = findHaystack(paraText(p), opts);
  const out = [];
  for (const m of hay.matchAll(findRegex(needle, opts, true))) {
    if (!m[0].length) continue;
    out.push({ start: m.index, end: m.index + m[0].length });
  }
  return out;
}

function runsWithReplacements(para, spans, replacement) {
  const runs = para.runs.map((r, i) => ({
    ...r,
    rgba: r.rgba >>> 0,
    sourceIndex: i,
  }));
  const locate = (off) => {
    let base = 0;
    for (let i = 0; i < runs.length; i++) {
      const len = runs[i].text.length;
      if (off <= base + len) return { i, o: off - base };
      base += len;
    }
    const last = runs.length - 1;
    return { i: last, o: runs[last].text.length };
  };
  for (let k = spans.length - 1; k >= 0; k--) {
    const s0 = locate(spans[k].start),
      e0 = locate(spans[k].end);
    if (s0.i === e0.i) {
      runs[s0.i].text =
        runs[s0.i].text.slice(0, s0.o) +
        replacement +
        runs[s0.i].text.slice(e0.o);
    } else {
      runs[s0.i].text = runs[s0.i].text.slice(0, s0.o) + replacement;
      for (let i = s0.i + 1; i < e0.i; i++) runs[i].text = '';
      runs[e0.i].text = runs[e0.i].text.slice(e0.o);
    }
  }
  return runs;
}

function matchQuads(para, start, end) {
  let pv = null;
  try {
    pv = P().previewParagraph(para.id, runsToInput(para.runs), para.format);
  } catch {
    pv = null;
  }
  if (!pv || !pv.lines || !pv.lines.length) return [];
  const out = [];
  for (let k = 0; k < pv.lines.length; k++) {
    const L = pv.lines[k];
    if (!L.cx || !L.cx.length || L.flat < 0) continue;
    let nextFlat = Infinity;
    for (let j = k + 1; j < pv.lines.length; j++)
      if (pv.lines[j].flat >= 0) {
        nextFlat = pv.lines[j].flat;
        break;
      }
    const a = Math.max(start, L.flat),
      b = Math.min(end, nextFlat);
    if (a >= b) continue;
    const at = (i) => L.x + L.cx[Math.max(0, Math.min(i, L.cx.length - 1))];
    const x0 = at(a - L.flat),
      x1 = at(b - L.flat);
    const h = (L.size || 12) * 1.25;
    out.push({
      x: Math.min(x0, x1),
      y: L.baseline - h * 0.25,
      w: Math.max(1, Math.abs(x1 - x0)),
      h,
    });
  }
  return out;
}

function showFindHighlight(para, start, end) {
  clearTextSelection();
  const quads = matchQuads(para, start, end);
  if (!quads.length) return;
  const ov = $('overlay'),
    z = state.zoom,
    H = P().pageHeight;
  for (const q of quads) {
    const el = document.createElement('div');
    el.className = 'textsel';
    Object.assign(el.style, {
      left: q.x * z + 'px',
      top: (H - q.y - q.h) * z + 'px',
      width: q.w * z + 'px',
      height: q.h * z + 'px',
    });
    ov.appendChild(el);
  }
}

function pageMatches(needle, opts) {
  const out = [];
  for (const p of state.paragraphs) {
    if (!p.editable) continue;
    for (const m of paraMatches(p, needle, opts))
      out.push({ paraId: p.id, start: m.start, end: m.end });
  }
  return out;
}

function findStep(needle, dir) {
  scanningPages = true;
  try {
    return findStepScan(needle, dir);
  } finally {
    scanningPages = false;
    refreshPageExtras();
  }
}

function findStepScan(needle, dir) {
  const eng = P();
  const opts = findOptions();
  const key = needle + ' ' + JSON.stringify(opts);
  const pages = Math.max(1, eng.pageCount);
  if (!state.find || state.find.key !== key)
    state.find = { key, page: eng.pageIndex, i: dir > 0 ? -1 : 0, total: 0 };
  for (let step = 0; step <= pages; step++) {
    const idx = (((state.find.page + dir * step) % pages) + pages) % pages;
    if (idx !== eng.pageIndex) {
      eng.loadPage(idx);
      refreshModel();
    }
    const all = pageMatches(needle, opts);
    const i = step === 0 ? state.find.i + dir : dir > 0 ? 0 : all.length - 1;
    if (all.length && i >= 0 && i < all.length) {
      const hit = all[i];
      const para = state.paragraphs.find((q) => q.id === hit.paraId);
      state.find = { key, page: idx, i, total: all.length };
      if (para) {
        renderPage();
        state.selection = { kind: 'para', para };
        drawOverlay();
        showFindHighlight(para, hit.start, hit.end);
        updateChrome();
      }
      return {
        paraId: hit.paraId,
        start: hit.start,
        end: hit.end,
        i,
        total: all.length,
        page: idx,
        text: para ? paraText(para).slice(hit.start, hit.end) : '',
      };
    }
    state.find = {
      key,
      page: idx,
      i: dir > 0 ? -1 : all.length,
      total: all.length,
    };
  }
  return null;
}
const findNext = (needle) => findStep(needle, 1);

function replaceAll(needle, replacement) {
  scanningPages = true;
  try {
    return replaceAllScan(needle, replacement);
  } finally {
    scanningPages = false;
    refreshPageExtras();
  }
}

function replaceAllScan(needle, replacement) {
  const eng = P();
  const opts = findOptions();
  let total = 0;
  snapshot();
  for (let idx = 0; idx < Math.max(1, eng.pageCount); idx++) {
    if (idx !== eng.pageIndex) {
      eng.loadPage(idx);
      refreshModel();
    }
    for (const para of [...state.paragraphs]) {
      if (!para.editable) continue;
      const spans = paraMatches(para, needle, opts);
      if (!spans.length) continue;
      const runs = runsWithReplacements(para, spans, replacement);
      const u = P().commitParagraph(para.id, runs, para.format);
      if (u) {
        replaceParagraph(para.id, u);
        total += spans.length;
      }
    }
  }
  state.find = null;
  state.dirty = total > 0;
  renderPage();
  updateChrome();
  return total;
}

function replaceCurrent(needle, replacement) {
  if (!state.find || state.find.i < 0) return 0;
  const opts = findOptions();
  const all = pageMatches(needle, opts);
  const hit = all[state.find.i];
  if (!hit) return 0;
  const para = state.paragraphs.find((q) => q.id === hit.paraId);
  if (!para) return 0;
  snapshotEdit('edit text', para);
  const runs = runsWithReplacements(para, [hit], replacement);
  const u = P().commitParagraph(para.id, runs, para.format);
  if (!u) return 0;
  replaceParagraph(para.id, u);
  state.find.i -= 1;
  state.dirty = true;
  refreshAfterMutation();
  return 1;
}

function adjustListLevel(delta) {
  let para = state.editing?.para || state.selection?.para;
  if (!para) return;
  if (state.editing) endEdit(true);
  para = state.paragraphs.find((q) => q.id === para.id) || para;
  const cur = para.format.listLevel || 0;
  const next = Math.max(0, Math.min(8, cur + delta));
  if (next === cur) return;
  snapshotEdit('move text');
  const STEP = 18;
  if (!P().moveParagraph(para.id, (next - cur) * STEP, 0)) {
    if (state.undo.length) state.undo.pop();
    return;
  }
  para.box.x += (next - cur) * STEP;
  const runs = para.runs.map((r, i) => ({
    ...r,
    rgba: r.rgba >>> 0,
    sourceIndex: i,
  }));
  const u = P().commitParagraph(para.id, runs, {
    ...para.format,
    listLevel: next,
  });
  if (u) replaceParagraph(para.id, u);
  state.dirty = true;
  refreshAfterMutation();
}

function applyPathStroke() {
  if (state.selection?.kind !== 'object' || state.selection.type !== OBJ.PATH)
    return;
  const rgba =
    ((parseInt($('pStrokeColor').value.slice(1), 16) << 8) | 0xff) >>> 0;
  const w = parseFloat($('pStrokeW').value) || 0;
  snapshot();
  P().setPathStroke(state.selection.handle, rgba, Math.max(0.1, w));
  scheduleRegen();
  state.dirty = true;
  renderPage();
  drawOverlay();
  updateChrome();
}

const ECPARA_MIME = 'application/x-ecpara+json';

const esc = (s) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );

function runsToHtml(runs) {
  const spans = runs.map((r) => {
    const deco = [
      r.underline ? 'underline' : '',
      r.strike ? 'line-through' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const css = [
      `font-family:'${(r.family || 'sans-serif').replace(/'/g, '')}'`,
      `font-size:${(r.size || 12).toFixed(1)}pt`,
      r.bold ? 'font-weight:700' : '',
      r.italic ? 'font-style:italic' : '',
      `color:${rgbaToCss(r.rgba >>> 0 || 255)}`,
      deco ? `text-decoration:${deco}` : '',
    ]
      .filter(Boolean)
      .join(';');
    return `<span style="${css}">${esc(r.text).replace(/\n/g, '<br>')}</span>`;
  });
  return `<div>${spans.join('')}</div>`;
}

function cssColorToRgba(css) {
  if (!css) return 255;
  const probe = document.createElement('span');
  probe.style.color = css;
  document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/rgba?\(([^)]+)\)/);
  probe.remove();
  if (!m) return 255;
  const p = m[1].split(',').map((x) => parseFloat(x.trim()));
  const a = p.length > 3 ? Math.round(p[3] * 255) : 255;
  return (
    (((p[0] & 255) << 24) | ((p[1] & 255) << 16) | ((p[2] & 255) << 8) | a) >>>
    0
  );
}

function htmlToRuns(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const runs = [];
  const push = (text, st) => {
    if (!text) return;
    runs.push({
      text,
      family: st.family,
      size: st.size,
      rgba: st.rgba,
      bold: st.bold,
      italic: st.italic,
      underline: st.underline,
      strike: st.strike,
      script: 0,
      renderMode: 0,
      strokeRgba: 0,
      strokeWidth: 1,
      hScale: 1,
      rise: 0,
      sourceIndex: -1,
    });
  };
  const parseSize = (v, inherited) => {
    const n = parseFloat(v);
    if (!(n > 0)) return inherited;
    if (/pt$/.test(v)) return n;
    if (/px$/.test(v)) return n * 0.75;
    if (/em$/.test(v)) return inherited * n;
    if (/%$/.test(v)) return (inherited * n) / 100;
    return n;
  };
  const walk = (node, st) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        push(child.nodeValue.replace(/\s+/g, ' '), st);
        continue;
      }
      if (child.nodeType !== 1) continue;
      const tag = child.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'head') continue;
      if (tag === 'br') {
        if (runs.length) runs[runs.length - 1].text += '\n';
        continue;
      }
      const s = { ...st };
      const cst = child.style || {};
      if (cst.fontFamily)
        s.family =
          cst.fontFamily.split(',')[0].replace(/['"]/g, '').trim() || s.family;
      if (cst.fontSize) s.size = parseSize(cst.fontSize, st.size);
      const w = cst.fontWeight;
      if (tag === 'b' || tag === 'strong') s.bold = true;
      else if (w) s.bold = w === 'bold' || parseInt(w, 10) >= 600;
      if (tag === 'i' || tag === 'em') s.italic = true;
      else if (cst.fontStyle)
        s.italic = cst.fontStyle === 'italic' || cst.fontStyle === 'oblique';
      const deco = cst.textDecorationLine || cst.textDecoration || '';
      if (tag === 'u') s.underline = true;
      else if (deco) s.underline = deco.includes('underline');
      if (tag === 's' || tag === 'strike' || tag === 'del') s.strike = true;
      else if (deco) s.strike = deco.includes('line-through');
      if (cst.color) s.rgba = cssColorToRgba(cst.color);
      if (
        (tag === 'p' || tag === 'div' || tag === 'li') &&
        runs.length &&
        !runs[runs.length - 1].text.endsWith('\n')
      )
        runs[runs.length - 1].text += '\n';
      walk(child, s);
    }
  };
  walk(doc.body, {
    family: 'Helvetica',
    size: 12,
    rgba: 255,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  });
  const out = [];
  for (const r of runs) {
    if (!r.text) continue;
    const last = out[out.length - 1];
    if (
      last &&
      last.family === r.family &&
      last.size === r.size &&
      last.rgba === r.rgba &&
      last.bold === r.bold &&
      last.italic === r.italic &&
      last.underline === r.underline &&
      last.strike === r.strike
    )
      last.text += r.text;
    else out.push(r);
  }
  return out.filter((r) => r.text.trim() || r.text.includes('\n'));
}

const CLIP_FONT_BUDGET = 4 << 20;
function collectBlockFonts(p) {
  const out = {};
  let spent = 0;
  for (let i = 0; i < p.runs.length; i++) {
    const r = p.runs[i];
    const key = (r.family || '') + '|' + (r.bold ? 1 : 0) + (r.italic ? 1 : 0);
    if (!r.family || out[key]) continue;
    let bytes = null;
    try {
      bytes = P().runFontData(p.id, i);
    } catch {
      bytes = null;
    }
    if (!bytes || !bytes.length) continue;
    if (spent + bytes.length > CLIP_FONT_BUDGET) continue;
    spent += bytes.length;
    let bin = '';
    for (let k = 0; k < bytes.length; k += 0x8000)
      bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
    out[key] = btoa(bin);
  }
  return out;
}

function adoptBlockFonts(fonts) {
  if (!fonts) return;
  for (const [key, b64] of Object.entries(fonts)) {
    if (PdfEngine.localFonts.has(key)) continue;
    try {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      PdfEngine.localFonts.set(key, bytes);
      const fam = key.slice(0, key.lastIndexOf('|'));
      if (fam && !PdfEngine.localFonts.has(fam))
        PdfEngine.localFonts.set(fam, bytes);
    } catch {}
  }
}

const spell = {
  list: [],
  at: -1,
  ignored: new Set(),
  loading: null,
  bytes: null,
};

async function spellDictionary() {
  if (P()._dictLoaded) return true;
  if (!spell.loading) {
    spell.loading = (async () => {
      const res = await fetch('dict/en.txt.gz');
      if (!res.ok) throw new Error('dictionary not found');
      let bytes;
      if (typeof DecompressionStream === 'function') {
        const ds = new DecompressionStream('gzip');
        bytes = new Uint8Array(
          await new Response(res.body.pipeThrough(ds)).arrayBuffer()
        );
      } else {
        bytes = new Uint8Array(await res.arrayBuffer());
      }
      spell.bytes = bytes;
      return spellInstall();
    })().catch((e) => {
      toast('Spelling: ' + e.message);
      return false;
    });
  }
  return spell.loading;
}
function spellInstall() {
  if (!spell.bytes) return false;
  const n = P().spellLoad(spell.bytes);
  const extra = userDictionary();
  if (extra.length)
    P().spellLoad(new TextEncoder().encode(extra.join('\n') + '\n'));
  return n > 0;
}

const USER_DICT_KEY = 'ec.userDict';
function userDictionary() {
  try {
    return JSON.parse(localStorage.getItem(USER_DICT_KEY) || '[]');
  } catch {
    return [];
  }
}
function userDictionaryAdd(w) {
  const all = new Set(userDictionary());
  all.add(w.toLowerCase());
  try {
    localStorage.setItem(USER_DICT_KEY, JSON.stringify([...all]));
  } catch {}
}

async function spellStart() {
  if (!P()?.doc) return;
  $('spellbar').hidden = false;
  $('spellStatus').textContent = 'Loading dictionary…';
  const ok = await spellDictionary();
  if (!ok) {
    $('spellStatus').textContent = 'No dictionary.';
    return;
  }
  spellRescan();
  spellNext();
}
function spellRescan() {
  let r = P().spellCheckPage();
  if (r && r.ready === false && spellInstall()) r = P().spellCheckPage();
  spell.list = (r?.words || []).filter(
    (w) =>
      !spell.ignored.has(w.word.toLowerCase()) &&
      !userDictionary().includes(w.word.toLowerCase())
  );
  spell.at = -1;
}
function spellHighlight(hit) {
  document.querySelectorAll('.spellhit').forEach((el) => el.remove());
  if (!hit) return;
  const para = state.paragraphs.find((p) => p.id === hit.id);
  if (!para) return;
  const line =
    (para.lines || [])
      .slice()
      .reverse()
      .find((l) => (l.off ?? 0) <= hit.from) || para.lines?.[0];
  if (!line) return;
  const z = state.zoom,
    H = P().pageHeight;
  const el = document.createElement('div');
  el.className = 'spellhit';
  const size = Math.max(...para.runs.map((r) => r.size || 12));
  Object.assign(el.style, {
    left: (line.hasPenX === false ? line.x : (line.px ?? line.x)) * z + 'px',
    top: (H - line.y - 0.85 * size) * z + 'px',
    width: line.w * z + 'px',
    height: 1.1 * size * z + 'px',
  });
  $('overlay').appendChild(el);
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
function spellShow() {
  const hit = spell.list[spell.at];
  $('spellWord').textContent = hit ? hit.word : '—';
  $('spellFix').value = hit ? hit.word : '';
  $('spellStatus').textContent = spell.list.length
    ? `${spell.at + 1} of ${spell.list.length}`
    : 'No misspellings found.';
  spellHighlight(hit);
}
function spellNext() {
  if (!spell.list.length) {
    spellShow();
    return;
  }
  spell.at = (spell.at + 1) % spell.list.length;
  spellShow();
}
function spellChange() {
  const hit = spell.list[spell.at];
  const fix = $('spellFix').value;
  if (!hit || !fix || fix === hit.word) return;
  const para = state.paragraphs.find((p) => p.id === hit.id);
  if (!para) return;
  const runs = [];
  let at = 0;
  for (let i = 0; i < para.runs.length; i++) {
    const r = para.runs[i];
    const start = at,
      end = at + r.text.length;
    let text = r.text;
    if (hit.from < end && hit.to > start) {
      const a = Math.max(0, hit.from - start),
        b = Math.min(r.text.length, hit.to - start);
      text =
        r.text.slice(0, a) + (start <= hit.from ? fix : '') + r.text.slice(b);
    }
    runs.push({ ...r, text, rgba: r.rgba >>> 0, sourceIndex: i });
    at = end;
  }
  snapshotEdit('spelling', para);
  const u = P().commitParagraph(
    para.id,
    runs.filter((r) => r.text.length),
    para.format
  );
  if (u) replaceParagraph(para.id, u);
  refreshAfterMutation();
  spellRescan();
  spellNext();
}

function showTextSelection(sel) {
  clearTextSelection(false);
  state.textSel = sel;
  if (!sel || !sel.quads.length) return;
  const ov = $('overlay'),
    z = state.zoom,
    H = P().pageHeight;
  for (const q of sel.quads) {
    const el = document.createElement('div');
    el.className = 'textsel';
    Object.assign(el.style, {
      left: q.x * z + 'px',
      top: (H - q.y - q.h) * z + 'px',
      width: q.w * z + 'px',
      height: q.h * z + 'px',
    });
    ov.appendChild(el);
  }
}
function clearTextSelection(drop = true) {
  document.querySelectorAll('.textsel').forEach((el) => el.remove());
  if (drop) state.textSel = null;
}

function wireBlockClipboard() {
  document.addEventListener('copy', (e) => {
    if (!state.editing && state.textSel?.text) {
      e.clipboardData.setData('text/plain', state.textSel.text);
      e.preventDefault();
      toast('Selected text copied.');
      return;
    }
    if (state.editing || state.selection?.kind !== 'para') return;
    const sel = window.getSelection();
    if (sel && String(sel).length) return;
    const p = state.selection.para;
    const payload = {
      v: 1,
      runs: p.runs.map((r) => ({ ...r })),
      format: { ...p.format },
      w: p.box.w,
      fonts: collectBlockFonts(p),
    };
    e.clipboardData.setData(ECPARA_MIME, JSON.stringify(payload));
    e.clipboardData.setData('text/html', runsToHtml(p.runs));
    e.clipboardData.setData('text/plain', p.runs.map((r) => r.text).join(''));
    e.preventDefault();
    toast('Block copied — paste to duplicate with styles.');
  });
  document.addEventListener('paste', (e) => {
    if (state.editing || !P()?.doc) return;
    const raw = e.clipboardData.getData(ECPARA_MIME);
    let data = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (!data || data.v !== 1 || !Array.isArray(data.runs)) return;
    } else {
      const html = e.clipboardData.getData('text/html');
      const runs = html ? htmlToRuns(html) : null;
      if (!runs || !runs.length) return;
      data = { runs, format: {}, w: 300 };
    }
    e.preventDefault();
    adoptBlockFonts(data.fonts);
    const H = P().pageHeight;
    const x = 60,
      yTop = H - 60;
    snapshotEdit('add text');
    const runs = data.runs.map((r) => ({
      ...r,
      rgba: r.rgba >>> 0 || 255,
      sourceIndex: -1,
    }));
    const created = P().addParagraph(
      x,
      yTop,
      Math.max(40, data.w || 200),
      runs,
      data.format || {}
    );
    if (created) {
      state.paragraphs.push(created);
      state.selection = { kind: 'para', para: created };
      state.dirty = true;
      refreshAfterMutation();
      toast('Block pasted.');
    } else if (state.undo.length) state.undo.pop();
  });
}

const SNAP_TOL = 4;
function snapDelta(env, dx, dy) {
  if (!env) return { dx, dy };
  let bestX = null,
    bestY = null;
  for (const gx of state.guides.v) {
    for (const cand of [
      env.x + dx,
      env.x + env.w + dx,
      env.x + env.w / 2 + dx,
    ]) {
      const d = gx - cand;
      if (
        Math.abs(d) <= SNAP_TOL &&
        (bestX == null || Math.abs(d) < Math.abs(bestX))
      )
        bestX = d;
    }
  }
  for (const gy of state.guides.h) {
    for (const cand of [
      env.y + dy,
      env.y + env.h + dy,
      env.y + env.h / 2 + dy,
    ]) {
      const d = gy - cand;
      if (
        Math.abs(d) <= SNAP_TOL &&
        (bestY == null || Math.abs(d) < Math.abs(bestY))
      )
        bestY = d;
    }
  }
  return { dx: dx + (bestX || 0), dy: dy + (bestY || 0) };
}

function collectSmartTargets(opts = {}) {
  const eng = P();
  const t = [];
  const W = eng.pageWidth,
    H = eng.pageHeight;
  t.push({ x: 0, y: 0, w: W, h: H });
  for (const q of state.paragraphs) {
    if (q.rotation || opts.skipPara?.has(q.id)) continue;
    t.push({ x: q.box.x, y: q.box.top - q.box.h, w: q.box.w, h: q.box.h });
  }
  for (const o of objectIndex()) {
    if (t.length >= 400) break;
    if (o.type === 1 || opts.skipObj?.has(o.handle)) continue;
    const b = o.bounds;
    if (b.w > 2 && b.h > 2) t.push(b);
  }
  return t;
}

function smartSnap(env, dx, dy, targets) {
  if (!env) return { dx, dy, gv: null, gh: null };
  const edgesOf = (r) => ({
    xs: [r.x, r.x + r.w / 2, r.x + r.w],
    ys: [r.y, r.y + r.h / 2, r.y + r.h],
  });
  const me = edgesOf({ x: env.x + dx, y: env.y + dy, w: env.w, h: env.h });
  let bx = null,
    by = null;
  for (const g of state.guides.v)
    for (const c of me.xs) {
      const d = g - c;
      if (Math.abs(d) <= SNAP_TOL && (!bx || Math.abs(d) < Math.abs(bx.d)))
        bx = { d, coord: g, ruler: true };
    }
  for (const g of state.guides.h)
    for (const c of me.ys) {
      const d = g - c;
      if (Math.abs(d) <= SNAP_TOL && (!by || Math.abs(d) < Math.abs(by.d)))
        by = { d, coord: g, ruler: true };
    }
  const better = (cand, best) =>
    !best ||
    Math.abs(cand.d) < Math.abs(best.d) - 1e-9 ||
    (Math.abs(cand.d) <= Math.abs(best.d) + 1e-9 && cand.kind && !best.kind);
  for (const tr of targets) {
    const te = edgesOf(tr);
    for (let gi = 0; gi < 3; gi++)
      for (let ci = 0; ci < 3; ci++) {
        const d = te.xs[gi] - me.xs[ci];
        const cand = { d, coord: te.xs[gi], kind: (gi === 1) === (ci === 1) };
        if (Math.abs(d) <= SNAP_TOL && better(cand, bx)) bx = cand;
      }
    for (let gi = 0; gi < 3; gi++)
      for (let ci = 0; ci < 3; ci++) {
        const d = te.ys[gi] - me.ys[ci];
        const cand = { d, coord: te.ys[gi], kind: (gi === 1) === (ci === 1) };
        if (Math.abs(d) <= SNAP_TOL && better(cand, by)) by = cand;
      }
  }
  dx += bx?.d || 0;
  dy += by?.d || 0;
  const fin = { x: env.x + dx, y: env.y + dy, w: env.w, h: env.h };
  let gv = null,
    gh = null;
  if (bx) {
    let lo = fin.y,
      hi = fin.y + fin.h;
    if (bx.ruler) {
      lo = 0;
      hi = P().pageHeight;
    } else
      for (const tr of targets) {
        const xs = [tr.x, tr.x + tr.w / 2, tr.x + tr.w];
        if (xs.some((v) => Math.abs(v - bx.coord) < 0.01)) {
          lo = Math.min(lo, tr.y);
          hi = Math.max(hi, tr.y + tr.h);
        }
      }
    gv = { x: bx.coord, lo, hi };
  }
  if (by) {
    let lo = fin.x,
      hi = fin.x + fin.w;
    if (by.ruler) {
      lo = 0;
      hi = P().pageWidth;
    } else
      for (const tr of targets) {
        const ys = [tr.y, tr.y + tr.h / 2, tr.y + tr.h];
        if (ys.some((v) => Math.abs(v - by.coord) < 0.01)) {
          lo = Math.min(lo, tr.x);
          hi = Math.max(hi, tr.x + tr.w);
        }
      }
    gh = { y: by.coord, lo, hi };
  }
  return { dx, dy, gv, gh };
}

function showSmartGuides(gv, gh) {
  const wrap = $('pageWrap');
  for (const el of wrap.querySelectorAll('.smart-guide')) el.remove();
  if (!P()?.doc) return;
  const H = P().pageHeight,
    z = state.zoom;
  const mk = (css) => {
    const g = document.createElement('div');
    g.className = 'smart-guide';
    g.style.cssText =
      'position:absolute;z-index:6;background:#ff2d55;pointer-events:none;' +
      css;
    wrap.appendChild(g);
  };
  const PAD = 6;
  if (gv)
    mk(
      `left:${(gv.x * z).toFixed(1)}px;top:${((H - gv.hi) * z - PAD).toFixed(1)}px;` +
        `width:1px;height:${((gv.hi - gv.lo) * z + PAD * 2).toFixed(1)}px;`
    );
  if (gh)
    mk(
      `top:${((H - gh.y) * z).toFixed(1)}px;left:${(gh.lo * z - PAD).toFixed(1)}px;` +
        `height:1px;width:${((gh.hi - gh.lo) * z + PAD * 2).toFixed(1)}px;`
    );
}
function clearSmartGuides() {
  for (const el of $('pageWrap').querySelectorAll('.smart-guide')) el.remove();
}

function drawGuides() {
  const wrap = $('pageWrap');
  for (const el of wrap.querySelectorAll('.guide')) el.remove();
  if (!P()?.doc) return;
  const H = P().pageHeight;
  const mk = (vertical, coord) => {
    const g = document.createElement('div');
    g.className = 'guide';
    g.style.cssText =
      'position:absolute;z-index:5;background:#00b3ff;opacity:.7;' +
      (vertical
        ? `left:${coord * state.zoom}px;top:0;width:1px;height:100%;cursor:col-resize;`
        : `top:${(H - coord) * state.zoom}px;left:0;height:1px;width:100%;cursor:row-resize;`);
    g.title = 'Drag to move, double-click to remove';
    g.addEventListener('dblclick', () => {
      const arr = vertical ? state.guides.v : state.guides.h;
      const i = arr.indexOf(coord);
      if (i >= 0) arr.splice(i, 1);
      drawGuides();
    });
    g.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const arr = vertical ? state.guides.v : state.guides.h;
      const i = arr.indexOf(coord);
      const move = (ev) => {
        const r = $('page').getBoundingClientRect();
        const val = vertical
          ? (ev.clientX - r.left) / state.zoom
          : H - (ev.clientY - r.top) / state.zoom;
        if (i >= 0) arr[i] = val;
        drawGuides();
      };
      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    });
    wrap.appendChild(g);
  };
  for (const x of state.guides.v) mk(true, x);
  for (const y of state.guides.h) mk(false, y);
}

function drawRulers() {
  const on = $('rulersChk').checked && P()?.doc;
  let rh = $('rulerH'),
    rv = $('rulerV');
  if (!on) {
    rh?.remove();
    rv?.remove();
    return;
  }
  const wrap = $('pageWrap');
  const H = P().pageHeight,
    W =
      P().pageWidth ||
      $('page').width / (state.zoom * (window.devicePixelRatio || 1));
  const mkCanvas = (id) => {
    let c = $(id);
    if (!c) {
      c = document.createElement('canvas');
      c.id = id;
      c.style.cssText =
        'position:absolute;z-index:6;background:rgba(245,245,245,.95);border:0;';
      wrap.appendChild(c);
      c.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const vertical = id === 'rulerV';
        const move = (ev) => {
          const r = $('page').getBoundingClientRect();
          const val = vertical
            ? (ev.clientX - r.left) / state.zoom
            : H - (ev.clientY - r.top) / state.zoom;
          drag0 = val;
          drawGuides();
        };
        let drag0 = null;
        const arr = vertical ? state.guides.v : state.guides.h;
        const up = (ev) => {
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
          const r = $('page').getBoundingClientRect();
          const val = vertical
            ? (ev.clientX - r.left) / state.zoom
            : H - (ev.clientY - r.top) / state.zoom;
          if (val > 0) {
            arr.push(val);
            drawGuides();
          }
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
      });
    }
    return c;
  };
  rh = mkCanvas('rulerH');
  rv = mkCanvas('rulerV');
  const dpr = window.devicePixelRatio || 1;
  const pw = $('page').getBoundingClientRect();
  rh.width = pw.width * dpr;
  rh.height = 16 * dpr;
  rh.style.width = pw.width + 'px';
  rh.style.height = '16px';
  rh.style.left = '0px';
  rh.style.top = '-18px';
  rv.width = 16 * dpr;
  rv.height = pw.height * dpr;
  rv.style.width = '16px';
  rv.style.height = pw.height + 'px';
  rv.style.left = '-18px';
  rv.style.top = '0px';
  const tick = (ctx, len, horizontal) => {
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#999';
    ctx.fillStyle = '#666';
    ctx.font = '8px system-ui';
    ctx.beginPath();
    for (let v = 0; v <= len; v += 9) {
      const major = v % 72 === 0,
        mid = v % 36 === 0;
      const px = horizontal ? v * state.zoom : (H - v) * state.zoom;
      const t = major ? 10 : mid ? 6 : 3;
      if (horizontal) {
        ctx.moveTo(px, 16);
        ctx.lineTo(px, 16 - t);
      } else {
        ctx.moveTo(16, px);
        ctx.lineTo(16 - t, px);
      }
      if (major && v) {
        if (horizontal) ctx.fillText(String(v / 72), px + 2, 8);
        else {
          ctx.save();
          ctx.translate(8, px - 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(String(v / 72), 0, 0);
          ctx.restore();
        }
      }
    }
    ctx.stroke();
  };
  tick(rh.getContext('2d'), Math.max(W, 2000), true);
  tick(rv.getContext('2d'), H, false);
  drawGuides();
}

function updateChrome() {
  const eng = P();
  const has = eng && eng.doc;
  $('save').disabled = !has;
  $('save').classList.toggle('dirty', state.dirty);
  $('undo').disabled = !state.undo.length;
  $('redo').disabled = !state.redo.length;
  $('pageLabel').textContent = has
    ? `${eng.pageIndex + 1} / ${eng.pageCount}`
    : '– / –';
  $('zoomLabel').textContent = Math.round(state.zoom * 100) + '%';
  const objSel = state.selection?.kind === 'object';
  const paraSel = state.selection?.kind === 'para';
  const multiSel = state.selection?.kind === 'multi';
  for (const id of ['rotL', 'rotR'])
    $(id).hidden = !(objSel || paraSel || multiSel);
  for (const id of ['flipH', 'flipV', 'front', 'back']) $(id).hidden = !objSel;
  $('replImg').hidden = !(objSel && state.selection.type === OBJ.IMAGE);
  $('extEdit').hidden = !(
    objSel &&
    state.selection.type === OBJ.IMAGE &&
    window.showSaveFilePicker
  );
  $('altText').hidden = !(
    objSel &&
    state.selection.type === OBJ.IMAGE &&
    P().objectMcid?.(state.selection.handle) >= 0
  );
  const pathSel = objSel && state.selection.type === OBJ.PATH;
  $('pStrokeRow').hidden = !pathSel;
  if (pathSel) {
    const st = P().pathStyle(state.selection.handle);
    $('pStrokeW').value = (st.stroke ? st.strokeWidth : 0).toFixed(1);
    $('pStrokeColor').value = rgbaToHex(st.strokeRgba >>> 0 || 255);
  }
  for (const id of ['dupe']) $(id).hidden = !(objSel || paraSel);
  $('del').hidden = !(objSel || paraSel || multiSel);
  const seps = document.querySelectorAll('#contextbar .objsep');
  if (seps[0]) seps[0].hidden = !(objSel && state.selection.type === OBJ.IMAGE);
  if (seps[1]) seps[1].hidden = !(objSel || paraSel || multiSel);
  $('alignTools').hidden = !(multiSel && state.selection.items.length >= 2);

  let info = '';
  if (multiSel) {
    info = state.selection.items.length + ' selected';
  } else if (state.selection?.kind === 'object') {
    const t =
      ['', 'Text', 'Path', 'Image', 'Shading', 'Group'][state.selection.type] ||
      'Object';
    info = t + ' object';
  } else if (state.editing?.newGeom) {
    info = 'New text box';
  }
  $('info').textContent = info;
  syncInspector();
}

function syncInspector() {
  const insp = $('inspector');
  const p = state.editing?.para || state.selection?.para;
  const enabled = (!!p || !!state.editing) && state.selection?.kind !== 'multi';
  insp.toggleAttribute('disabled', !enabled);
  if (!enabled) return;
  let r = p?.runs[0] || {};
  if (state.editing) {
    const ed = state.editing.editable;
    let span = null;
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const rng = sel.getRangeAt(0);
      let n = rng.startContainer;
      if (ed.contains(n)) {
        if (n.nodeType === 3 && rng.startOffset === 0 && n.previousSibling)
          n = n.previousSibling;
        if (n.nodeType !== 1) n = n.parentElement;
        span = n?.closest?.('span[data-family]') || null;
      }
    }
    span =
      span || ed.querySelector('span[data-family]') || ed.querySelector('span');
    if (span)
      r = {
        family: span.dataset.family,
        size: parseFloat(span.dataset.size),
        rgba: parseInt(span.dataset.rgba) >>> 0,
        bold: parseInt(span.dataset.bold) >= 1,
        italic: parseInt(span.dataset.italic) >= 1,
        underline: span.dataset.underline === '1',
        strike: span.dataset.strike === '1',
        script: parseInt(span.dataset.script) || 0,
        renderMode: parseInt(span.dataset.renderMode) || 0,
        strokeRgba: (parseInt(span.dataset.strokeRgba) || 0) >>> 0,
        strokeWidth: parseFloat(span.dataset.strokeWidth) || 1,
        hScale: parseFloat(span.dataset.hScale) || 1,
      };
  }
  setSelectValue($('fFamily'), r.family || 'Helvetica');
  $('fSize').value = (r.size || 12).toFixed(0);
  $('fColor').value = rgbaToHex(r.rgba >>> 0 || 255);
  for (const b of $('fToggles').children) {
    const t = b.dataset.t;
    const on =
      (t === 'bold' && r.bold) ||
      (t === 'italic' && r.italic) ||
      (t === 'underline' && r.underline) ||
      (t === 'strike' && r.strike) ||
      (t === 'sup' && r.script > 0) ||
      (t === 'sub' && r.script < 0);
    b.classList.toggle('on', !!on);
  }
  $('fStrokeW').value = (
    r.renderMode === 1 || r.renderMode === 2 ? (r.strokeWidth ?? 1) : 0
  ).toFixed(1);
  $('fStrokeColor').value = rgbaToHex((r.strokeRgba || 0) >>> 0 || 255);
  const fmt = p?.format || {
    align: 0,
    lineSpacing: 1.25,
    paraSpacing: 0,
    charSpacing: 0,
  };
  for (const b of $('fAlign').children)
    b.classList.toggle('on', parseInt(b.dataset.a) === fmt.align);
  $('fLine').value = (fmt.lineSpacing || 1.2).toFixed(2);
  $('fPara').value = (fmt.paraSpacing || 0).toFixed(0);
  $('fChar').value = (fmt.charSpacing || 0).toFixed(1);
  $('fWordSp').value = (fmt.wordSpacing || 0).toFixed(1);
  $('fHScale').value = Math.round((r.hScale || 1) * 100);
  $('fFirstInd').value = (fmt.firstIndent || 0).toFixed(0);
  $('fHangInd').value = (fmt.hangIndent || 0).toFixed(0);
  for (const b of $('fDir').children)
    b.classList.toggle('on', parseInt(b.dataset.d) === (fmt.dir || 0));
}
function setSelectValue(sel, val) {
  if (![...sel.options].some((o) => o.value === val)) {
    const o = document.createElement('option');
    o.value = o.textContent = val;
    sel.insertBefore(o, sel.firstChild);
  }
  sel.value = val;
}

function setTool(tool) {
  endEdit(true);
  state.tool = tool;
  state.selection = null;
  for (const b of document.querySelectorAll('[data-tool]'))
    b.classList.toggle('on', b.dataset.tool === tool);
  drawOverlay();
  updateChrome();
}

let zoomFrame = 0;
let zoomPending = false;
function setZoom(z) {
  endEdit(true);
  state.zoom = Math.min(6, Math.max(0.2, z));
  if (zoomFrame) {
    zoomPending = true;
    return;
  }
  renderPage();
  updateChrome();
  zoomFrame = requestAnimationFrame(() => {
    zoomFrame = 0;
    if (!zoomPending) return;
    zoomPending = false;
    renderPage();
    updateChrome();
  });
}
function getZoom() {
  return state.zoom;
}
function getDocDescription() {
  const eng = P();
  const fields = {};
  if (eng?.doc && eng.metaText) {
    for (const k of [
      'Title',
      'Author',
      'Subject',
      'Keywords',
      'Creator',
      'Producer',
      'CreationDate',
      'ModDate',
    ]) {
      fields[k] = eng.metaText(k);
    }
  }
  return {
    meta: state.docMeta,
    info: state.docInfo,
    pdfa: state.pdfa,
    fields,
    pageSize: eng?.doc ? { w: eng.pageWidth, h: eng.pageHeight } : null,
  };
}
function fitZoom() {
  const stage = $('stage');
  const avail = Math.min(stage.clientWidth - 48, 1400);
  setZoom(avail / P().pageWidth);
}
function goToPage(i) {
  const eng = P();
  if (i < 0 || i >= eng.pageCount) return;
  endEdit(true);
  eng.generateContent();
  eng.loadPage(i);
  state.paragraphs = [];
  state.selection = null;
  renderPage();
  updateChrome();
  setTimeout(() => {
    if (P().pageIndex !== i) return;
    refreshModel();
    drawOverlay();
    updateChrome();
  }, 0);
}

async function openFile(file, sourceUrl = null, knownBytes) {
  endEdit(false);
  if (state.extWatch) {
    clearInterval(state.extWatch);
    state.extWatch = null;
  }
  const otrace = new URLSearchParams(location.search).get('trace')
    ? (m) => {
        document.title = 'OPEN ' + m;
      }
    : () => {};
  otrace('buf');
  let bytes = knownBytes || new Uint8Array(await file.arrayBuffer());
  try {
    const cons = await consolidateContentArrays(bytes);
    if (cons) bytes = cons;
  } catch (e) {
    console.warn('contents consolidation skipped:', e);
  }
  try {
    const prot = await protectPatternArtwork(bytes);
    if (prot) bytes = prot;
  } catch (e) {
    console.warn('pattern protection skipped:', e);
  }
  let t3seg = null;
  try {
    const t3 = await protectType3Text(bytes);
    if (t3) {
      bytes = t3.bytes;
      t3seg = t3.seg;
    }
  } catch (e) {
    console.warn('type3 protection skipped:', e);
  }
  let fragilePages = null;
  try {
    const fr = await protectFragileText(bytes);
    if (fr) {
      bytes = fr.bytes;
      fragilePages = fr.pages;
    }
  } catch (e) {
    console.warn('fragile-text protection skipped:', e);
  }
  otrace('engine.open ' + bytes.length);
  try {
    P().open(bytes);
  } catch (e) {
    if (e.passwordRequired) {
      let pw = prompt('This PDF is password-protected.\nEnter the password:');
      while (pw != null) {
        try {
          P().open(bytes, pw);
          break;
        } catch (e2) {
          if (!e2.passwordRequired) {
            toast(e2.message);
            return;
          }
          pw = prompt('Wrong password. Try again:');
        }
      }
      if (pw == null) return;
    } else {
      toast(e.message);
      return;
    }
  }
  otrace('opened; model');
  if (t3seg) P().setType3Seg(t3seg);
  if (fragilePages) P().setFragilePages(fragilePages);
  state.notifiedSubs = new Set();
  state.docInfo = P().documentInfo ? P().documentInfo() : null;
  state.pdfa = PdfEngine.sniffPdfA ? PdfEngine.sniffPdfA(bytes) : false;
  if (state.docInfo?.signatures > 0) {
    toast(
      'This document is digitally signed — editing invalidates the ' +
        'signature. Saving appends a revision so the signed version stays verifiable.'
    );
  } else if (state.pdfa) {
    toast(
      'This document declares PDF/A conformance — edits may break conformance.'
    );
  }
  state.fileName = file.name.replace(/\.pdf$/i, '') + ' (edited).pdf';
  state.docMeta = { name: file.name, size: bytes.length, source: sourceUrl };
  const chip = $('docName');
  chip.textContent = file.name;
  chip.hidden = false;
  state.undo = [];
  state.redo = [];
  state.dirty = false;
  refreshModel();
  otrace('model done');
  state.selection = null;
  $('empty').hidden = true;
  $('pageWrap').hidden = false;
  $('inspector').hidden = false;
  fitZoom();
  updateChrome();
}

async function saveFile() {
  endEdit(true);
  const incremental = (state.docInfo?.signatures || 0) > 0;
  let bytes = await P().saveSpliced(
    incremental ? { incremental: true } : undefined
  );
  if (!bytes) {
    toast('Save failed.');
    return;
  }
  try {
    const newMarks = P().untaggedMarks();
    const altText = state.pendingAlt || [];
    if (newMarks.length || altText.length) {
      bytes = applyTagSurgery(bytes, {
        pageIndex: P().pageIndex,
        newMarks,
        altText,
      });
      state.pendingAlt = [];
    }
  } catch (e) {
    console.warn('tag surgery skipped:', e);
  }
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = state.fileName;
  a.click();
  URL.revokeObjectURL(a.href);
  state.dirty = false;
  const savedKb = (bytes.length / 1024) | 0;
  if (onSaved) onSaved(savedKb, state.fileName);
  else toast('Saved ' + savedKb + ' KB');
}

let onSaved = null;

function setOnSaved(fn) {
  onSaved = typeof fn === 'function' ? fn : null;
}

function wireUI() {
  const fams = [
    'Helvetica',
    'Arial',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
    'Tahoma',
    'Garamond',
    'Palatino',
  ];
  $('fFamily').append(
    ...fams.map((f) => {
      const o = document.createElement('option');
      o.value = o.textContent = f;
      return o;
    })
  );

  const swatches = [
    '#000000',
    '#737373',
    '#d1d1d1',
    '#ed5924',
    '#f2b705',
    '#3b6ef5',
  ];
  for (const c of swatches) {
    const d = document.createElement('div');
    d.className = 'swatch';
    d.style.background = c;
    d.addEventListener('mousedown', (e) => e.preventDefault());
    d.addEventListener('click', () =>
      styleTargetRuns((s) => {
        s.rgba = cssHexToRgba(c);
      })
    );
    $('fSwatches').appendChild(d);
  }

  for (const b of [...$('fToggles').children, ...$('fAlign').children]) {
    b.addEventListener('mousedown', (e) => e.preventDefault());
  }

  document.addEventListener('selectionchange', () => {
    const e = state.editing;
    if (!e) return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    if (
      !e.editable.contains(r.startContainer) ||
      !e.editable.contains(r.endContainer)
    )
      return;
    e.lastSel = sel.isCollapsed
      ? null
      : e.locked
        ? lockedSelRange(e.editable)
        : editorSelectionRange(e.editable);
  });

  $('file').addEventListener('change', (e) => {
    if (e.target.files[0]) openFile(e.target.files[0]);
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const f = [...(e.dataTransfer?.files || [])].find(
      (x) => x.type === 'application/pdf' || /\.pdf$/i.test(x.name)
    );
    if (f) openFile(f);
    else if (e.dataTransfer?.files?.length) toast('Drop a PDF file.');
  });
  $('save').addEventListener('click', saveFile);
  $('undo').addEventListener('click', () => restore(state.undo, state.redo));
  $('redo').addEventListener('click', () => restore(state.redo, state.undo));
  $('prev').addEventListener('click', () => goToPage(P().pageIndex - 1));
  $('next').addEventListener('click', () => goToPage(P().pageIndex + 1));
  $('zoomIn').addEventListener('click', () => setZoom(state.zoom * 1.25));
  $('zoomOut').addEventListener('click', () => setZoom(state.zoom / 1.25));
  $('zoomFit').addEventListener('click', fitZoom);
  for (const b of document.querySelectorAll('[data-tool]')) {
    b.addEventListener('click', () => setTool(b.dataset.tool));
  }
  $('editScope').addEventListener('change', () => {
    state.editScope = $('editScope').value;
    setTool('edit');
    endEdit(true);
    const sel = state.selection;
    if (sel?.kind === 'para' && !scopeAllowsPara()) state.selection = null;
    if (sel?.kind === 'object' && !scopeAllowsObj(sel.type))
      state.selection = null;
    if (sel?.kind === 'multi') state.selection = null;
    drawOverlay();
    updateChrome();
  });

  $('contextbar')?.addEventListener('mousedown', (e) => {
    if (e.target.closest('button, .swatch, label')) e.preventDefault();
  });

  $('rotL').addEventListener('click', () => {
    settleEditorForParaOp();
    rotateSelection(90);
  });
  $('rotR').addEventListener('click', () => {
    settleEditorForParaOp();
    rotateSelection(-90);
  });
  $('flipH').addEventListener('click', () =>
    objectOp((h) => P().flipObject(h, true))
  );
  $('flipV').addEventListener('click', () =>
    objectOp((h) => P().flipObject(h, false))
  );
  const replaceImageFromBlob = async (handle, blobOrFile, label) => {
    const bmp = await createImageBitmap(blobOrFile);
    const cv = document.createElement('canvas');
    cv.width = bmp.width;
    cv.height = bmp.height;
    const cx = cv.getContext('2d');
    cx.drawImage(bmp, 0, 0);
    const rgba = cx.getImageData(0, 0, cv.width, cv.height).data;
    const bgra = new Uint8Array(rgba.length);
    for (let i = 0; i < rgba.length; i += 4) {
      bgra[i] = rgba[i + 2];
      bgra[i + 1] = rgba[i + 1];
      bgra[i + 2] = rgba[i];
      bgra[i + 3] = rgba[i + 3];
    }
    snapshot();
    if (P().replaceImage(handle, bgra, cv.width, cv.height)) {
      scheduleRegen();
      state.dirty = true;
      renderPage();
      drawOverlay();
      updateChrome();
      toast(label);
      return true;
    }
    if (state.undo.length) state.undo.pop();
    toast('Image replace failed.');
    return false;
  };
  $('replImg').addEventListener('click', () => $('replImgFile').click());
  $('replImgFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (
      !file ||
      state.selection?.kind !== 'object' ||
      state.selection.type !== OBJ.IMAGE
    )
      return;
    await replaceImageFromBlob(state.selection.handle, file, 'Image replaced.');
  });
  $('altText').addEventListener('click', () => {
    const sel = state.selection;
    if (sel?.kind !== 'object' || sel.type !== OBJ.IMAGE) return;
    const mcid = P().objectMcid(sel.handle);
    if (mcid < 0) {
      toast('This image carries no structure tag.');
      return;
    }
    const current =
      (state.pendingAlt || []).find((a) => a.mcid === mcid)?.text ??
      P().structAltFor(mcid) ??
      '';
    const text = prompt(
      'Alternate text for this image (screen readers):',
      current
    );
    if (text === null) return;
    state.pendingAlt = (state.pendingAlt || []).filter((a) => a.mcid !== mcid);
    state.pendingAlt.push({ mcid, text });
    state.dirty = true;
    toast('Alt text staged — applies on Save.');
  });

  $('extEdit').addEventListener('click', async () => {
    const sel = state.selection;
    if (sel?.kind !== 'object' || sel.type !== OBJ.IMAGE) return;
    const img = P().renderImageObject(sel.handle);
    if (!img) {
      toast('Could not export this image.');
      return;
    }
    const cv = document.createElement('canvas');
    cv.width = img.width;
    cv.height = img.height;
    cv.getContext('2d').putImageData(
      new ImageData(img.data, img.width, img.height),
      0,
      0
    );
    const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
    let fh;
    try {
      fh = await showSaveFilePicker({
        suggestedName: 'pdf-image.png',
        types: [
          { description: 'PNG image', accept: { 'image/png': ['.png'] } },
        ],
      });
    } catch {
      return;
    }
    const w = await fh.createWritable();
    await w.write(blob);
    await w.close();
    let lastSeen = (await fh.getFile()).lastModified;
    toast('Exported. Edit + save the PNG in any app — changes re-import live.');
    if (state.extWatch) clearInterval(state.extWatch);
    const handle = sel.handle;
    state.extWatch = setInterval(async () => {
      try {
        const f = await fh.getFile();
        if (f.lastModified === lastSeen) return;
        lastSeen = f.lastModified;
        await replaceImageFromBlob(handle, f, 'External edit re-imported.');
      } catch {
        clearInterval(state.extWatch);
        state.extWatch = null;
      }
    }, 1500);
  });
  $('pStrokeColor').addEventListener('change', () => applyPathStroke());
  $('pStrokeW').addEventListener('change', () => applyPathStroke());
  $('front').addEventListener('click', () => arrangeSel('front'));
  $('back').addEventListener('click', () => arrangeSel('back'));
  $('dupe').addEventListener('click', () => {
    settleEditorForParaOp();
    duplicateSelection();
  });
  $('addImage').addEventListener('click', () => $('imgFile').click());
  $('imgFile').addEventListener('change', (e) => {
    if (e.target.files[0]) addImageFromFile(e.target.files[0]);
    e.target.value = '';
  });
  $('del').addEventListener('click', () => {
    settleEditorForParaOp(false);
    if (state.selection?.kind === 'object') {
      snapshotEdit('delete');
      P().historyRemoveObject(state.selection.handle);
      state.selection = null;
      state.dirty = true;
      refreshAfterMutation();
    } else if (state.selection?.kind === 'para') {
      snapshotEdit('delete text');
      P().deleteParagraph(state.selection.para.id);
      replaceParagraph(state.selection.para.id, null);
      state.selection = null;
      state.dirty = true;
      refreshAfterMutation();
    } else if (state.selection?.kind === 'multi') {
      snapshot();
      for (const it of state.selection.items) {
        if (it.t === 'para') {
          P().deleteParagraph(it.para.id);
          replaceParagraph(it.para.id, null);
        } else P().removeObject(it.handle);
      }
      state.selection = null;
      state.dirty = true;
      refreshAfterMutation();
    }
  });

  $('fFamily').addEventListener('change', async (e) => {
    const fam = e.target.value;
    await ensureLocalFontBytes(fam);
    styleTargetRuns((s) => {
      s.family = fam;
    });
  });
  $('docName').addEventListener('click', () => {
    const m = state.docMeta;
    if (!m) return;
    const kb = (m.size / 1024).toFixed(0);
    toast(
      m.source
        ? `${m.name} — ${kb} KB — loaded from ${new URL(m.source, location.href).href}`
        : `${m.name} — ${kb} KB — chosen from your device (browsers hide the folder path; it stays wherever you picked it)`
    );
  });
  $('sysFonts').addEventListener('click', () => loadSystemFonts(false));
  if (!new URLSearchParams(location.search).get('noauto'))
    loadSystemFonts(true);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker
      .register('sw.js', { updateViaCache: 'none' })
      .then((reg) => reg.update().catch(() => {}))
      .catch(() => {});
  }
  window.addEventListener(
    'pointerdown',
    () => {
      if (!PdfEngine.localFonts.size) loadSystemFonts(true);
    },
    { once: true }
  );
  for (const b of $('fList').children)
    b.addEventListener('click', () => toggleListPrefix(b.dataset.l));
  for (const b of $('alignTools').children)
    b.addEventListener('click', () => alignSelection(b.dataset.al));
  $('copyText').addEventListener('click', async () => {
    if (!P()?.doc) return;
    const t = P().pageTextJson();
    if (!t || !t.text) {
      toast('No text on this page.');
      return;
    }
    try {
      await navigator.clipboard.writeText(t.text);
      const furniture = t.blocks.filter(
        (b) => b.role === 'header' || b.role === 'footer'
      ).length;
      toast(
        `Copied ${t.blocks.length} blocks in reading order` +
          (furniture ? ` (${furniture} header/footer)` : '')
      );
    } catch {
      toast('Clipboard permission denied.');
    }
  });

  $('spellPage').addEventListener('click', () => {
    spellStart();
  });
  $('spellNext').addEventListener('click', () => spellNext());
  $('spellChange').addEventListener('click', () => spellChange());
  $('spellIgnore').addEventListener('click', () => {
    const hit = spell.list[spell.at];
    if (hit) spell.ignored.add(hit.word.toLowerCase());
    spellRescan();
    spellNext();
  });
  $('spellAdd').addEventListener('click', () => {
    const hit = spell.list[spell.at];
    if (!hit) return;
    userDictionaryAdd(hit.word);
    P().spellLoad(new TextEncoder().encode(hit.word.toLowerCase() + '\n'));
    spellRescan();
    spellNext();
  });
  $('spellDone').addEventListener('click', () => {
    $('spellbar').hidden = true;
    document.querySelectorAll('.spellhit').forEach((el) => el.remove());
  });

  $('spellchk').addEventListener('change', (e) => {
    const ed = state.editing?.editable;
    if (ed) {
      ed.spellcheck = e.target.checked;
      ed.blur();
      ed.focus();
    }
  });
  $('fStrokeW').addEventListener('change', (e) => {
    const w = Math.max(0, parseFloat(e.target.value) || 0);
    const rgba = cssHexToRgba($('fStrokeColor').value || '#000000');
    styleTargetRuns((s) => {
      s.strokeWidth = w;
      if (w > 0) {
        s.renderMode = 2;
        s.strokeRgba = rgba;
      } else if (
        (parseInt(s.renderMode) || 0) === 2 ||
        (parseInt(s.renderMode) || 0) === 1
      )
        s.renderMode = 0;
    });
  });
  $('fStrokeColor').addEventListener('input', (e) => {
    const rgba = cssHexToRgba(e.target.value);
    styleTargetRuns((s) => {
      s.strokeRgba = rgba;
      if (
        (parseFloat(s.strokeWidth) || 0) > 0 &&
        (parseInt(s.renderMode) || 0) === 0
      )
        s.renderMode = 2;
    });
  });
  $('fSize').addEventListener('change', (e) =>
    styleTargetRuns((s) => {
      s.size = parseFloat(e.target.value);
    })
  );
  $('fColor').addEventListener('input', (e) =>
    styleTargetRuns((s) => {
      s.rgba = cssHexToRgba(e.target.value);
    })
  );
  for (const b of $('fToggles').children)
    b.addEventListener('click', () => toggleStyle(b.dataset.t));
  for (const b of $('fAlign').children)
    b.addEventListener('click', () =>
      changeFormat((f) => {
        f.align = parseInt(b.dataset.a);
      })
    );
  $('fLine').addEventListener('change', (e) =>
    changeFormat((f) => {
      f.lineSpacing = parseFloat(e.target.value);
    })
  );
  $('fPara').addEventListener('change', (e) =>
    changeFormat((f) => {
      f.paraSpacing = parseFloat(e.target.value);
    })
  );
  $('fChar').addEventListener('change', (e) =>
    changeFormat((f) => {
      f.charSpacing = parseFloat(e.target.value);
    })
  );
  $('fWordSp').addEventListener('change', (e) =>
    changeFormat((f) => {
      f.wordSpacing = parseFloat(e.target.value);
    })
  );
  $('fFirstInd').addEventListener('change', (e) =>
    changeFormat((f) => {
      f.firstIndent = Math.max(0, parseFloat(e.target.value) || 0);
    })
  );
  $('fHangInd').addEventListener('change', (e) =>
    changeFormat((f) => {
      f.hangIndent = Math.max(0, parseFloat(e.target.value) || 0);
    })
  );
  for (const b of $('fDir').children) {
    b.addEventListener('click', () =>
      changeFormat((f) => {
        f.dir = parseInt(b.dataset.d);
      })
    );
  }
  for (const b of $('fLevel').children) {
    b.addEventListener('click', () => adjustListLevel(parseInt(b.dataset.lv)));
  }
  $('fMarkerStyle').addEventListener('change', (e) =>
    setListMarkerStyle(e.target.value)
  );
  $('rulersChk').addEventListener('change', drawRulers);
  wireBlockClipboard();
  $('spellLang').addEventListener('change', () => {
    const ed = state.editing?.editable;
    if (ed) ed.lang = $('spellLang').value || '';
  });
  $('fHScale').addEventListener('change', (e) =>
    styleTargetRuns((s) => {
      s.hScale = parseFloat(e.target.value) / 100;
    })
  );

  $('find').addEventListener('click', () => {
    $('findbar').hidden = !$('findbar').hidden;
    if (!$('findbar').hidden) $('findText').focus();
  });
  $('findDone').addEventListener('click', () => ($('findbar').hidden = true));
  const findReport = (r) => {
    $('findStatus').textContent = r
      ? `${r.i + 1} of ${r.total} on page ${r.page + 1}: ${r.text}`
      : 'Not found';
  };
  const findGo = (dir) => {
    const n = $('findText').value;
    if (!n) return;
    findReport(findStep(n, dir));
  };
  $('findNext').addEventListener('click', () => findGo(1));
  $('findPrev').addEventListener('click', () => findGo(-1));
  $('findText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      findGo(e.shiftKey ? -1 : 1);
    }
  });
  $('replOne').addEventListener('click', () => {
    const n = $('findText').value;
    if (!n) return;
    if (!state.find || state.find.i < 0) findStep(n, 1);
    const done = replaceCurrent(n, $('replText').value);
    $('findStatus').textContent = done ? 'Replaced 1' : 'Not found';
    if (done) findReport(findStep(n, 1));
  });
  $('replAll').addEventListener('click', () => {
    const n = $('findText').value;
    if (!n) return;
    const c = replaceAll(n, $('replText').value);
    $('findStatus').textContent = 'Replaced ' + c;
  });

  stagePointHandlers();

  window.addEventListener('keydown', (e) => {
    const meta = e.metaKey || e.ctrlKey;
    const typing =
      document.activeElement &&
      (['INPUT', 'SELECT'].includes(document.activeElement.tagName) ||
        state.editing);
    if (meta && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (P().doc) saveFile();
    } else if (meta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      restore(state.undo, state.redo);
    } else if (
      meta &&
      (e.key.toLowerCase() === 'y' ||
        (e.key.toLowerCase() === 'z' && e.shiftKey))
    ) {
      e.preventDefault();
      restore(state.redo, state.undo);
    } else if (meta && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      $('findbar').hidden = false;
      $('findText').focus();
    } else if (
      (e.key === 'Backspace' || e.key === 'Delete') &&
      !typing &&
      state.selection
    ) {
      e.preventDefault();
      $('del').click();
    } else if (e.key.startsWith('Arrow') && !typing && state.selection) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const dx =
        e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
      const dy = e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0;
      nudgeSelection(dx, dy);
    }
  });

  window.addEventListener('beforeunload', (e) => {
    if (state.dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  updateChrome();
}

function nudgeSelection(dx, dy) {
  snapshotEdit('nudge');
  if (state.selection?.kind === 'object') {
    noteMatrix(state.selection.handle);
    P().translateObject(state.selection.handle, dx, dy);
    state.selection.bounds = P().objectBounds(state.selection.handle);
    state.dirty = true;
  } else if (state.selection?.kind === 'para') {
    const p = state.selection.para;
    if (P().moveParagraph(p.id, dx, dy)) {
      const dT = pageToText(p, dx, dy);
      const moved = {
        ...p,
        box: { ...p.box, x: p.box.x + dT.x, top: p.box.top + dT.y },
      };
      replaceParagraph(p.id, moved);
      state.selection = { kind: 'para', para: moved };
      state.dirty = true;
    }
  } else if (state.selection?.kind === 'multi') {
    for (const it of state.selection.items) moveItem(it, dx, dy);
    state.dirty = true;
  } else {
    if (state.undo.length) state.undo.pop();
    return;
  }
  refreshAfterMutation();
}

function hasRealVariant(family, bold, italic) {
  const std14 = [
    'helvetica',
    'arial',
    'times',
    'times new roman',
    'courier',
    'courier new',
    'symbol',
    'zapfdingbats',
  ];
  if (std14.includes((family || '').toLowerCase())) return true;
  const styles = localFontMeta.get(family);
  if (!styles) return false;
  const key = (bold ? 'b' : '') + (italic ? 'i' : '');
  return styles.has(key || 'r') || styles.has(key);
}

function toggleStyle(t) {
  styleTargetRuns((s) => {
    const cur = (k) => s[k] == 1 || s[k] === true || s[k] === 2;
    if (t === 'bold') s.bold = cur('bold') ? 0 : 1;
    else if (t === 'italic') s.italic = cur('italic') ? 0 : 1;
    else if (t === 'underline') s.underline = cur('underline') ? 0 : 1;
    else if (t === 'strike') s.strike = cur('strike') ? 0 : 1;
    else if (t === 'sup') s.script = (parseInt(s.script) || 0) === 1 ? 0 : 1;
    else if (t === 'sub') s.script = (parseInt(s.script) || 0) === -1 ? 0 : -1;
  });
}

function settleEditorForParaOp(commit = true) {
  if (!state.editing) return;
  const para = state.editing.para;
  endEdit(commit);
  if (!state.selection && para) {
    const again =
      state.paragraphs.find((p) => p.id === para.id) ||
      state.paragraphs.find(
        (p) =>
          Math.abs(p.box.x - para.box.x) < 1 &&
          Math.abs(p.box.top - para.box.top) < 1
      );
    if (again) state.selection = { kind: 'para', para: again };
  }
}

function rotateSelection(deg) {
  const sel = state.selection;
  if (sel?.kind === 'object') {
    objectOp((h) => P().rotateObject(h, deg));
    return;
  }
  let handles = [],
    cx,
    cy;
  if (sel?.kind === 'para') {
    const b = sel.para.box;
    const c = textToPage(sel.para, b.x + b.w / 2, b.top - b.h / 2);
    cx = c.x;
    cy = c.y;
    handles = P().paragraphObjects(sel.para.id);
  } else if (sel?.kind === 'multi') {
    let x0 = 1e9,
      y0 = 1e9,
      x1 = -1e9,
      y1 = -1e9;
    for (const it of sel.items) {
      const e = itemEnvelope(it);
      x0 = Math.min(x0, e.x);
      y0 = Math.min(y0, e.y);
      x1 = Math.max(x1, e.x + e.w);
      y1 = Math.max(y1, e.y + e.h);
    }
    cx = (x0 + x1) / 2;
    cy = (y0 + y1) / 2;
    for (const it of sel.items) {
      if (it.t === 'obj') handles.push(it.handle);
      else handles.push(...P().paragraphObjects(it.para.id));
    }
  }
  if (!handles.length) return;
  const keepPara = sel?.kind === 'para' ? sel.para : null;
  snapshotEdit('rotate');
  for (const h of handles) noteMatrix(h);
  P().rotateObjectsAbout(handles, deg, cx, cy);
  state.dirty = true;
  refreshModel();
  state.selection = null;
  if (keepPara) {
    const want = keepPara.runs.map((r) => r.text).join('');
    const again =
      state.paragraphs.find((p) => p.id === keepPara.id) ||
      (want
        ? state.paragraphs.find(
            (p) => p.runs.map((r) => r.text).join('') === want
          )
        : null);
    if (again) state.selection = { kind: 'para', para: again };
  }
  renderPage();
  updateChrome();
}

function objectOp(fn, note) {
  if (state.selection?.kind !== 'object') return;
  snapshotEdit('transform');
  noteMatrix(state.selection.handle);
  fn(state.selection.handle);
  state.selection.bounds = P().objectBounds(state.selection.handle);
  state.dirty = true;
  refreshAfterMutation();
  if (note) toast(note);
}

function arrangeSel(op) {
  if (state.selection?.kind !== 'object') return;
  snapshotEdit('arrange');
  noteZOrder(state.selection.handle);
  if (P().arrangeObject(state.selection.handle, op)) {
    state.dirty = true;
    refreshAfterMutation();
  } else if (state.undo.length) state.undo.pop();
}

function duplicateSelection() {
  if (state.selection?.kind === 'object') {
    if (state.selection.type !== OBJ.IMAGE) {
      toast('Duplicate currently supports images and text boxes.');
      return;
    }
    snapshotEdit('duplicate');
    const clone = P().duplicateImage(state.selection.handle, 12, -12);
    if (clone) {
      noteInsert(clone);
      state.selection = {
        kind: 'object',
        handle: clone,
        type: OBJ.IMAGE,
        bounds: P().objectBounds(clone),
      };
      state.dirty = true;
      refreshAfterMutation();
    } else if (state.undo.length) state.undo.pop();
  } else if (state.selection?.kind === 'para') {
    const p = state.selection.para;
    snapshotEdit('duplicate text');
    const created = P().duplicateParagraph(p.id, 12, -12);
    if (created) {
      state.paragraphs.push(created);
      state.selection = { kind: 'para', para: created };
      state.dirty = true;
      refreshAfterMutation();
    } else {
      if (state.undo.length) state.undo.pop();
      toast("This text block can't be duplicated.");
    }
  }
}

const localFontMeta = new Map();

async function loadSystemFonts(silent = false) {
  if (!window.queryLocalFonts) {
    if (!silent)
      toast('System font access needs Chrome/Edge (Local Font Access API).');
    return;
  }
  try {
    const fonts = await window.queryLocalFonts();
    for (const f of fonts) {
      const b = /bold|black|heavy|semi ?bold|extra ?bold/i.test(f.style);
      const i = /italic|oblique/i.test(f.style);
      const key = (b ? '1' : '0') + (i ? '1' : '0');
      let styles = localFontMeta.get(f.family);
      if (!styles) {
        styles = new Map();
        localFontMeta.set(f.family, styles);
      }
      const cur = styles.get(key);
      const exact = /^(regular|bold|italic|bold italic|oblique)$/i.test(
        f.style
      );
      if (
        !cur ||
        (exact &&
          !/^(regular|bold|italic|bold italic|oblique)$/i.test(cur.style))
      ) {
        styles.set(key, f);
      }
    }
    preloadScriptFonts();
    const sel = $('fFamily');
    const cur = sel.value;
    const fams = [...localFontMeta.keys()].sort();
    sel.replaceChildren(
      ...fams.map((f) => {
        const o = document.createElement('option');
        o.value = o.textContent = f;
        return o;
      })
    );
    setSelectValue(sel, cur);
    if (!silent) toast(fams.length + ' system font families available');
  } catch (err) {
    if (!silent) toast('Font access denied: ' + err.message);
  }
}

async function ensureLocalFontBytes(family) {
  const styles = localFontMeta.get(family);
  if (!styles || PdfEngine.localFonts.has(family)) return;
  const MAX = 40 * 1024 * 1024;
  await Promise.allSettled(
    [...styles.entries()].map(async ([key, meta]) => {
      try {
        const blob = await meta.blob();
        if (blob.size > MAX) return;
        const bytes = new Uint8Array(await blob.arrayBuffer());
        PdfEngine.localFonts.set(family + '|' + key, bytes);
        if (key === '00' || !PdfEngine.localFonts.has(family))
          PdfEngine.localFonts.set(family, bytes);
      } catch {}
    })
  );
}

const SCRIPT_FONT_CANDIDATES = [
  'Geeza Pro',
  'Al Nile',
  'Damascus',
  'Baghdad',
  'Noto Naskh Arabic',
  'Noto Sans Arabic',
  'Arial Unicode MS',
  'Arial Hebrew',
  'Lucida Grande',
  'Kohinoor Devanagari',
  'Devanagari MT',
  'ITF Devanagari',
  'Kohinoor Bangla',
  'Bangla MN',
  'Gurmukhi MN',
  'Kohinoor Gujarati',
  'Gujarati MT',
  'Tamil MN',
  'InaiMathi',
  'Kohinoor Telugu',
  'Telugu MN',
  'Kannada MN',
  'Malayalam MN',
  'Thonburi',
  'Sukhumvit Set',
  'Apple SD Gothic Neo',
  'Hiragino Sans',
  'PingFang SC',
];
function preloadScriptFonts() {
  for (const fam of SCRIPT_FONT_CANDIDATES)
    if (localFontMeta.has(fam)) ensureLocalFontBytes(fam);
}

async function addImageFromFile(file) {
  const bitmap = await createImageBitmap(file);
  const c = document.createElement('canvas');
  c.width = bitmap.width;
  c.height = bitmap.height;
  const cx = c.getContext('2d');
  cx.drawImage(bitmap, 0, 0);
  const rgba = cx.getImageData(0, 0, c.width, c.height).data;
  const maxW = 240,
    w = Math.min(maxW, bitmap.width),
    h = w * (bitmap.height / bitmap.width);
  const x = P().pageWidth / 2 - w / 2,
    y = P().pageHeight / 2 - h / 2;
  snapshotEdit('insert image');
  const handle = P().insertImage(
    new Uint8Array(rgba),
    c.width,
    c.height,
    x,
    y,
    w,
    h
  );
  if (handle) {
    noteInsert(handle);
    if (P().pageIsTagged()) P().tagObject(handle, 'Figure');
    state.selection = {
      kind: 'object',
      handle,
      type: OBJ.IMAGE,
      bounds: P().objectBounds(handle),
    };
    state.dirty = true;
    setTool('edit');
    refreshAfterMutation();
    toast('Image added');
  } else if (state.undo.length) state.undo.pop();
}

export {
  openFile,
  engineReady,
  setZoom,
  getZoom,
  getDocDescription,
  setOnSaved,
};
