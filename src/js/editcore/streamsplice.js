import { latin, parsePdf, streamData, withObjStm } from './shadingsurgery.js';

function scanShowOperand(txt, at, len) {
  const body = txt.slice(at, at + len);
  const codes = [];
  const slots = [];
  let i = 0;
  while (i < body.length) {
    const ch = body[i];
    if (ch === '<') {
      const end = body.indexOf('>', i);
      if (end < 0) return null;
      const rawHex = body.slice(i + 1, end);
      const hex = rawHex.replace(/\s+/g, '');
      if (hex.length % 4 !== 0) return null;
      if (/\s/.test(rawHex)) return null;
      for (let k = 0; k < hex.length; k += 4) {
        codes.push(parseInt(hex.slice(k, k + 4), 16));
        slots.push({ at: at + i + 1 + k, len: 4, index: codes.length - 1 });
      }
      i = end + 1;
      continue;
    }
    if (ch === '(') {
      i++;
      let depth = 1;
      while (i < body.length) {
        const c = body[i];
        if (c === '\\') {
          const oct = body.slice(i + 1).match(/^[0-7]{1,3}/);
          const span = oct ? 1 + oct[0].length : 2;
          codes.push(
            oct
              ? parseInt(oct[0], 8)
              : (ESCAPES[body[i + 1]] ?? body.charCodeAt(i + 1))
          );
          slots.push({ at: at + i, len: span, index: codes.length - 1 });
          i += span;
          continue;
        }
        if (c === '(') depth++;
        else if (c === ')') {
          depth--;
          if (!depth) {
            i++;
            break;
          }
        }
        codes.push(body.charCodeAt(i));
        slots.push({ at: at + i, len: 1, index: codes.length - 1 });
        i++;
      }
      if (depth) return null;
      continue;
    }
    i++;
  }
  return codes.length ? { codes, slots } : null;
}
const ESCAPES = { n: 10, r: 13, t: 9, b: 8, f: 12, '(': 40, ')': 41, '\\': 92 };

function showOperators(txt) {
  const re =
    /\[(?:[^\][]|\\.)*\]\s*TJ|\((?:[^()\\]|\\.)*\)\s*Tj|<[0-9A-Fa-f\s]*>\s*Tj/g;
  return [...txt.matchAll(re)].map((m) => ({ at: m.index, len: m[0].length }));
}

const TM_RE =
  /(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm/g;

function lastTmMatch(txt, at) {
  let last = null;
  for (const m of txt.slice(0, at).matchAll(TM_RE)) last = m;
  return last;
}
function tmBefore(txt, at) {
  const m = lastTmMatch(txt, at);
  return m ? m.slice(1, 7).map(Number) : null;
}
function activeSpacing(txt, at) {
  let tc = 0,
    tw = 0;
  for (const m of txt.slice(0, at).matchAll(/(-?[\d.]+)\s+(Tc|Tw)\b/g)) {
    if (m[2] === 'Tc') tc = Number(m[1]);
    else tw = Number(m[1]);
  }
  return Math.abs(tc) > 1e-6 || Math.abs(tw) > 1e-6;
}

function buildTJ(op, wide) {
  const { after, pos, adv, size } = op;
  if (
    !after?.length ||
    pos?.length !== after.length ||
    adv?.length !== after.length
  )
    return null;
  if (!(size > 0)) return null;
  if (wide == null) wide = after.some((c) => c > 255);
  if (!wide && after.some((c) => c > 255)) return null;
  const hex = (c) =>
    (wide
      ? c.toString(16).padStart(4, '0')
      : c.toString(16).padStart(2, '0')
    ).toUpperCase();
  let out = '[';
  let run = '';
  let pen = pos[0];
  for (let i = 0; i < after.length; i++) {
    if (i > 0) {
      const kern = ((pen - pos[i]) * 1000) / size;
      if (Math.abs(kern) > 1e-4) {
        if (run) {
          out += `<${run}>`;
          run = '';
        }
        out += fmt(kern);
      }
    }
    run += hex(after[i]);
    pen = pos[i] + adv[i];
  }
  if (run) out += `<${run}>`;
  return out + '] TJ';
}

function inlineDict(body, key) {
  const m = body.match(new RegExp(`/${key}\\s*<<`));
  if (!m) return null;
  let i = m.index + m[0].length,
    depth = 1;
  for (let k = i; k < body.length - 1; k++) {
    if (body[k] === '<' && body[k + 1] === '<') {
      depth++;
      k++;
    } else if (body[k] === '>' && body[k + 1] === '>') {
      depth--;
      if (!depth) return { at: m.index, inner: body.slice(i, k), end: k + 2 };
      k++;
    }
  }
  return null;
}

const col = (rgb) => rgb.map((v) => fmt(v / 255)).join(' ');

const STD14 = new Set([
  'Helvetica',
  'Helvetica-Bold',
  'Helvetica-Oblique',
  'Helvetica-BoldOblique',
  'Courier',
  'Courier-Bold',
  'Courier-Oblique',
  'Courier-BoldOblique',
  'Times-Roman',
  'Times-Bold',
  'Times-Italic',
  'Times-BoldItalic',
  'Symbol',
  'ZapfDingbats',
]);

function resolveFontNames(
  pdf,
  pageRec,
  pageNum,
  needed,
  std14Needed,
  startNum
) {
  const resNum = pdf.dictRef(pageRec.body, 'Resources');
  let resBody = null,
    resInline = null;
  if (resNum >= 0) resBody = pdf.objBody(resNum)?.body;
  else {
    resInline = inlineDict(pageRec.body, 'Resources');
    resBody = resInline?.inner;
  }
  if (resBody == null) return null;
  const fontNum = pdf.dictRef(resBody, 'Font');
  let fontBody = null,
    fontInline = null;
  if (fontNum >= 0) fontBody = pdf.objBody(fontNum)?.body;
  else {
    fontInline = inlineDict(resBody, 'Font');
    fontBody = fontInline ? fontInline.inner : '';
  }
  if (fontBody == null) return null;
  const nameOf = new Map();
  const std14NameOf = new Map();
  const extraObjs = [];
  const used = new Set();
  for (const m of fontBody.matchAll(/\/([^\s/<>[\]()]+)\s+(\d+)\s+0\s+R/g)) {
    used.add(m[1]);
    if (!nameOf.has(+m[2])) nameOf.set(+m[2], m[1]);
  }
  let adds = '';
  let seq = 1;
  for (const num of needed) {
    if (!nameOf.has(num) && !pdf.objBody(num)) return null;
    if (nameOf.has(num)) continue;
    let nm;
    do {
      nm = `ECW${seq++}`;
    } while (used.has(nm));
    used.add(nm);
    nameOf.set(num, nm);
    adds += ` /${nm} ${num} 0 R`;
  }
  let free = startNum;
  for (const base of std14Needed || []) {
    if (!STD14.has(base)) return null;
    let nm;
    do {
      nm = `ECW${seq++}`;
    } while (used.has(nm));
    used.add(nm);
    const objn = free++;
    std14NameOf.set(base, nm);
    extraObjs.push({
      num: objn,
      body: `<< /Type /Font /Subtype /Type1 /BaseFont /${base} /Encoding /WinAnsiEncoding >>`,
    });
    adds += ` /${nm} ${objn} 0 R`;
  }
  const updates = [];
  if (adds) {
    if (fontNum >= 0) {
      const fb = pdf.objBody(fontNum).body.trim();
      if (!fb.endsWith('>>')) return null;
      updates.push({ num: fontNum, body: fb.slice(0, -2) + adds + ' >>' });
    } else if (resNum >= 0) {
      const rb = pdf.objBody(resNum).body.trim();
      if (!rb.endsWith('>>')) return null;
      let nb;
      if (fontInline) {
        const inner2 = rb.slice(2, -2);
        const fi = inlineDict(inner2, 'Font');
        if (!fi) return null;
        nb =
          '<<' +
          inner2.slice(0, fi.at) +
          `/Font <<${fi.inner}${adds} >>` +
          inner2.slice(fi.end) +
          '>>';
      } else {
        nb = rb.slice(0, -2) + ` /Font <<${adds} >> >>`;
      }
      updates.push({ num: resNum, body: nb });
    } else {
      const pb = pageRec.body;
      let nb;
      const fi = inlineDict(pb, 'Font');
      if (fi) {
        nb =
          pb.slice(0, fi.at) +
          `/Font <<${fi.inner}${adds} >>` +
          pb.slice(fi.end);
      } else {
        const ri = inlineDict(pb, 'Resources');
        if (!ri) return null;
        nb =
          pb.slice(0, ri.at) +
          `/Resources <<${ri.inner} /Font <<${adds} >> >>` +
          pb.slice(ri.end);
      }
      updates.push({ num: pageNum, body: nb.trim() });
    }
  }
  return { nameOf, std14NameOf, updates, extraObjs, nextFree: free };
}

function danglingCtm(txt) {
  let depth = 0;
  let m = [1, 0, 0, 1, 0, 0];
  const re =
    /(?:^|[\s>\]])((?:-?[\d.]+\s+){6})cm\b|(?:^|[\s>\])])(q)\b|(?:^|[\s>\])])(Q)\b/g;
  for (const t of txt.matchAll(re)) {
    if (t[2]) depth++;
    else if (t[3]) depth = Math.max(0, depth - 1);
    else if (t[1] && depth === 0) {
      const v = t[1].trim().split(/\s+/).map(Number);
      if (v.length === 6 && v.every((x) => Number.isFinite(x))) {
        const [a, b, c, d, e, f] = v,
          [A, B, C, D, E, F] = m;
        m = [
          a * A + b * C,
          a * B + b * D,
          c * A + d * C,
          c * B + d * D,
          e * A + f * C + E,
          e * B + f * D + F,
        ];
      }
    }
  }
  return m;
}
function invertMatrix(m) {
  const [a, b, c, d, e, f] = m;
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-9) return null;
  return [
    d / det,
    -b / det,
    -c / det,
    a / det,
    (c * f - d * e) / det,
    (b * e - a * f) / det,
  ];
}

function buildDrawBlock(drawOps, nameOf, std14NameOf, ctm) {
  let out = '';
  for (const op of drawOps) {
    if (op.kind === 'rectdraw') {
      out += `${col(op.rgb)} rg\n${fmt(op.x)} ${fmt(op.y)} ${fmt(op.w)} ${fmt(op.h)} re f\n`;
      continue;
    }
    const name = op.std14 ? std14NameOf.get(op.std14) : nameOf.get(op.font);
    if (!name) return null;
    const tj = buildTJ(
      { after: op.codes, pos: op.pos, adv: op.adv, size: op.size },
      !!op.wide
    );
    if (tj == null) return null;
    out += 'BT\n' + `${col(op.rgb)} rg\n`;
    if (op.mode) out += `${op.mode} Tr\n`;
    if (op.mode === 1 || op.mode === 2 || op.mode === 5 || op.mode === 6)
      out += `${col(op.srgb)} RG\n${fmt(op.sw)} w\n`;
    out +=
      `/${name} ${fmt(op.size)} Tf\n` +
      op.tm.map(fmt).join(' ') +
      ' Tm\n' +
      tj +
      '\nET\n';
  }
  if (!out) return '';
  let pre = '';
  if (
    ctm &&
    (Math.abs(ctm[0] - 1) > 1e-6 ||
      Math.abs(ctm[1]) > 1e-6 ||
      Math.abs(ctm[2]) > 1e-6 ||
      Math.abs(ctm[3] - 1) > 1e-6 ||
      Math.abs(ctm[4]) > 1e-6 ||
      Math.abs(ctm[5]) > 1e-6)
  ) {
    const inv = invertMatrix(ctm);
    if (!inv) return null;
    pre = inv.map(fmt).join(' ') + ' cm\n';
  }
  return 'q\n' + pre + out + 'Q\n';
}

function fmt(v) {
  let s = v.toFixed(5).replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}

function locate(txt, want, tm) {
  const hits = [];
  for (const op of showOperators(txt)) {
    const s = scanShowOperand(txt, op.at, op.len);
    if (!s || s.codes.length !== want.length) continue;
    if (!s.codes.every((c, i) => c === want[i])) continue;
    hits.push({ op, scan: s, tm: tmBefore(txt, op.at) });
  }
  if (!hits.length) return null;
  if (hits.length === 1) return hits[0];
  const near = hits.filter(
    (h) =>
      h.tm &&
      tm &&
      Math.abs(h.tm[4] - tm[4]) < 0.01 &&
      Math.abs(h.tm[5] - tm[5]) < 0.01
  );
  return near.length === 1 ? near[0] : null;
}

async function findHolderStream(bytes, src, pdf, pageRec, codes) {
  const resNum = pdf.dictRef(pageRec.body, 'Resources');
  const resBody =
    resNum >= 0
      ? pdf.objBody(resNum)?.body
      : pageRec.body.match(/\/Resources\s*<<([\s\S]*?)>>/)?.[1];
  if (!resBody) return null;
  const xoNum = pdf.dictRef(resBody, 'XObject');
  const xoBody =
    xoNum >= 0
      ? pdf.objBody(xoNum)?.body
      : resBody.match(/\/XObject\s*<<([\s\S]*?)>>/)?.[1];
  if (!xoBody) return null;
  for (const m of xoBody.matchAll(/\/([^\s/<>[\]()]+)\s+(\d+)\s+0\s+R/g)) {
    const num = +m[2];
    const rec = pdf.objBody(num);
    if (!rec || !/\/Subtype\s*\/Form/.test(rec.body)) continue;
    const data = await streamData(bytes, src, { num, ...rec });
    if (!data) continue;
    const text = typeof data === 'string' ? data : latin(data);
    if (!locate(text, codes, null)) continue;
    const refs = [...src.matchAll(new RegExp(`\\b${num}\\s+0\\s+R\\b`, 'g'))]
      .length;
    let pagesUsing = 0;
    if (resNum >= 0) {
      for (const pm of src.matchAll(/\/Type\s*\/Page\b/g)) {
        const start = src.lastIndexOf('obj', pm.index);
        const end = src.indexOf('endobj', pm.index);
        if (start < 0 || end < 0) continue;
        if (
          new RegExp(`/Resources\\s+${resNum}\\s+0\\s+R`).test(
            src.slice(start, end)
          )
        )
          pagesUsing++;
      }
    }
    return {
      num,
      rec,
      text,
      name: m[1],
      xoNum,
      xoBody,
      resNum,
      shared: refs > 1 || pagesUsing > 1,
    };
  }
  return null;
}

export async function applyPlan(originalBytes, pageIndex, plan) {
  if (
    !plan ||
    !plan.ops?.length ||
    (plan.kind !== 'delete' && plan.kind !== 'splice' && plan.kind !== 'write')
  )
    return null;
  const src = latin(originalBytes);
  if (/\/Encrypt\s+\d+\s+\d+\s+R|\/Encrypt\s*<</.test(src)) return null;
  let pdf = parsePdf(src);
  if (!pdf) return null;
  pdf = await withObjStm(originalBytes, src, pdf);
  if (!pdf) return null;
  const pageNum = pdf.pageNum(pageIndex);
  if (pageNum == null || pageNum < 0) return null;
  const pageRec = pdf.objBody(pageNum);
  if (!pageRec) return null;
  const cm = pageRec.body.match(/\/Contents\s+(\d+)\s+0\s+R/);
  const cArr = pageRec.body.match(/\/Contents\s*\[([^\]]*)\]/);
  const isWritePlan = plan.ops.some(
    (o) => o.kind === 'blank' || o.kind === 'draw' || o.kind === 'rectdraw'
  );
  let cNum,
    cRec,
    cow = null,
    txt;
  let emptyMembers = [];
  if (cm) {
    cNum = +cm[1];
    cRec = pdf.objBody(cNum);
    if (!cRec) return null;
    const raw = await streamData(originalBytes, src, { num: cNum, ...cRec });
    if (!raw) return null;
    txt = typeof raw === 'string' ? raw : latin(raw);
  } else if (cArr && isWritePlan) {
    const refs = [...cArr[1].matchAll(/(\d+)\s+\d+\s+R/g)].map((m) => +m[1]);
    if (!refs.length) return null;
    let concat = '';
    for (const n of refs) {
      const rec = pdf.objBody(n);
      if (!rec) return null;
      const raw = await streamData(originalBytes, src, { num: n, ...rec });
      if (raw == null) return null;
      concat +=
        (concat ? '\n' : '') + (typeof raw === 'string' ? raw : latin(raw));
    }
    cNum = refs[0];
    cRec = pdf.objBody(cNum);
    txt = concat;
    emptyMembers = refs.slice(1);
  } else {
    return null;
  }

  const firstCodes = plan.ops.find((o) => o.codes)?.codes;
  const isWrite = plan.ops.some(
    (o) => o.kind === 'blank' || o.kind === 'draw' || o.kind === 'rectdraw'
  );
  if (!isWrite && firstCodes && !locate(txt, firstCodes, plan.ops[0].tm)) {
    const holder = await findHolderStream(
      originalBytes,
      src,
      pdf,
      pageRec,
      firstCodes
    );
    if (!holder) return null;
    ({ num: cNum, rec: cRec, text: txt } = holder);
    if (holder.shared) cow = { holder, pageNum, pageRec };
  }

  const edits = [];
  const drawOps = [];
  const blankOps = plan.ops.filter((o) => o.kind === 'blank');
  if (blankOps.length) {
    const all = showOperators(txt).map((o) => ({
      ...o,
      scan: scanShowOperand(txt, o.at, o.len),
    }));
    const matches = (o, codes) =>
      o.scan &&
      o.scan.codes.length === codes.length &&
      o.scan.codes.every((c, i) => c === codes[i]);
    const chainFrom = (start) => {
      const picks = [];
      let k = start;
      for (const op of blankOps) {
        while (k < all.length && !matches(all[k], op.codes)) k++;
        if (k >= all.length) return null;
        picks.push(all[k]);
        k++;
      }
      return picks;
    };
    let chain = null;
    for (let a = 0; a < all.length; a++) {
      if (!matches(all[a], blankOps[0].codes)) continue;
      const c = chainFrom(a);
      if (c) {
        if (chain) {
          chain = null;
          break;
        }
        chain = c;
        for (let a2 = a + 1; a2 < all.length; a2++) {
          if (!matches(all[a2], blankOps[0].codes)) continue;
          const c2 = chainFrom(a2);
          if (c2 && c2[0].at !== c[0].at && c2[0].at > c[c.length - 1].at) {
            chain = null;
          }
          break;
        }
        break;
      }
    }
    if (!chain) return null;
    for (const pick of chain)
      edits.push({ at: pick.at, len: pick.len, text: '[] TJ' });
  }
  for (const op of plan.ops) {
    if (op.kind === 'blank') continue;
    if (op.kind === 'draw' || op.kind === 'rectdraw') {
      drawOps.push(op);
      continue;
    }
    const hit = locate(txt, op.codes, op.tm);
    if (!hit) return null;
    if (op.kind === 'rebuild') {
      if (activeSpacing(txt, hit.op.at)) return null;
      const wide = hit.scan.slots.some((s2) => s2.len === 4);
      const arr = buildTJ(op, wide);
      if (arr == null) return null;
      edits.push({ at: hit.op.at, len: hit.op.len, text: arr });
      if (op.dx || op.dy) {
        const m = lastTmMatch(txt, hit.op.at);
        if (!m) return null;
        const e = Number(m[5]) + (op.dx || 0);
        const f = Number(m[6]) + (op.dy || 0);
        edits.push({
          at: m.index,
          len: m[0].length,
          text: `${m[1]} ${m[2]} ${m[3]} ${m[4]} ${fmt(e)} ${fmt(f)} Tm`,
        });
      }
      continue;
    }
    if (op.kind === 'tm') {
      const m = lastTmMatch(txt, hit.op.at);
      if (!m) return null;
      const e = Number(m[5]) + (op.dx || 0);
      const f = Number(m[6]) + (op.dy || 0);
      const text = `${m[1]} ${m[2]} ${m[3]} ${m[4]} ${fmt(e)} ${fmt(f)} Tm`;
      edits.push({ at: m.index, len: m[0].length, text });
      continue;
    }
    for (const idx of op.drop) {
      const slot = hit.scan.slots[idx];
      if (!slot) return null;
      edits.push({ at: slot.at, len: slot.len, text: '' });
    }
  }
  if (!edits.length && !drawOps.length) return null;
  const sorted = [...edits].sort((a, b) => a.at - b.at);
  for (let i = 1; i < sorted.length; i++)
    if (sorted[i].at < sorted[i - 1].at + sorted[i - 1].len) return null;
  sorted.reverse();
  for (const e of sorted)
    txt = txt.slice(0, e.at) + e.text + txt.slice(e.at + e.len);

  let resourceUpdates = [];
  let extraFontObjs = [];
  if (drawOps.length) {
    if (cow) return null;
    const needed = new Set(
      drawOps.filter((o) => o.kind === 'draw' && !o.std14).map((o) => o.font)
    );
    const std14Needed = new Set(
      drawOps.filter((o) => o.std14).map((o) => o.std14)
    );
    const res = resolveFontNames(
      pdf,
      pageRec,
      pageNum,
      needed,
      std14Needed,
      pdf.size
    );
    if (!res) return null;
    const block = buildDrawBlock(
      drawOps,
      res.nameOf,
      res.std14NameOf,
      danglingCtm(txt)
    );
    if (block == null) return null;
    txt += '\n' + block;
    resourceUpdates = res.updates;
    extraFontObjs = res.extraObjs || [];
  }

  for (const n of emptyMembers) {
    const rec = pdf.objBody(n);
    if (!rec) return null;
    const dict = rec.body
      .slice(0, rec.body.indexOf('stream'))
      .replace(/\/Filter\s*\/\w+/g, '')
      .replace(/\/Filter\s*\[[^\]]*\]/g, '')
      .replace(/\/DecodeParms\s*<<[^>]*>>/g, '')
      .replace(/\/Length\s+\d+(\s+\d+\s+R)?/g, '')
      .replace(/>>\s*$/, '')
      .replace(/^\s*<</, '');
    extraFontObjs.push({ num: n, stream: '', dict });
  }

  return rewriteStream(originalBytes, src, pdf, cNum, cRec, txt, cow, [
    ...resourceUpdates,
    ...extraFontObjs,
  ]);
}

export const spliceDeletion = applyPlan;

const bin = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

function xrefStyle(src) {
  const i = src.lastIndexOf('startxref');
  if (i < 0) return 'classic';
  const m = src.slice(i).match(/startxref\s+(\d+)/);
  if (!m) return 'classic';
  const at = +m[1];
  return /^\s*xref/.test(src.slice(at, at + 8)) ? 'classic' : 'stream';
}

function rewriteStream(originalBytes, src, pdf, num, rec, text, cow, moreObjs) {
  let targetNum = num;
  const extra = [];
  let nextFree = Math.max(pdf.size, num + 1);
  for (const e of moreObjs || [])
    nextFree = Math.max(nextFree, (e.num || 0) + 1);
  if (cow) {
    const h = cow.holder;
    if (h.xoNum < 0 || h.resNum < 0) return null;
    targetNum = nextFree++;
    const newXo = nextFree++;
    const newRes = nextFree++;

    const xo = h.xoBody.replace(
      new RegExp(`(/${h.name}\\s+)\\d+(\\s+0\\s+R)`),
      `$1${targetNum}$2`
    );
    if (xo === h.xoBody) return null;
    extra.push({ num: newXo, body: `<<${xo}>>` });

    const resRec = pdf.objBody(h.resNum);
    if (!resRec) return null;
    const res = resRec.body.replace(
      new RegExp(`(/XObject\\s+)${h.xoNum}(\\s+0\\s+R)`),
      `$1${newXo}$2`
    );
    if (res === resRec.body) return null;
    extra.push({ num: newRes, body: res.trim() });

    const pageBody = cow.pageRec.body.replace(
      new RegExp(`(/Resources\\s+)${h.resNum}(\\s+0\\s+R)`),
      `$1${newRes}$2`
    );
    if (pageBody === cow.pageRec.body) return null;
    extra.push({ num: cow.pageNum, body: pageBody.trim() });
  }
  for (const e of moreObjs || []) extra.push(e);

  const out = bin(text);
  const dict = rec.body.slice(0, rec.body.indexOf('stream'));
  let nd = dict
    .replace(/\/Filter\s*\/\w+/g, '')
    .replace(/\/Filter\s*\[[^\]]*\]/g, '')
    .replace(/\/DecodeParms\s*<<[^>]*>>/g, '')
    .replace(/\/Length\s+\d+(\s+\d+\s+R)?/g, '');
  nd = nd.replace(/>>\s*$/, '').replace(/^\s*<</, '');

  const bytes = [];
  const push = (s2) => {
    for (const ch of bin(s2)) bytes.push(ch);
  };
  const base = originalBytes.length;
  const offsets = new Map();

  push('\n');
  offsets.set(targetNum, base + bytes.length);
  push(`${targetNum} 0 obj\n<<${nd} /Length ${out.length}>>\nstream\n`);
  for (const b2 of out) bytes.push(b2);
  push('\nendstream\nendobj\n');
  for (const e of extra) {
    offsets.set(e.num, base + bytes.length);
    if (e.stream !== undefined) {
      const sb = bin(e.stream);
      push(
        `${e.num} 0 obj\n<<${e.dict || ''} /Length ${sb.length}>>\nstream\n`
      );
      for (const b2 of sb) bytes.push(b2);
      push('\nendstream\nendobj\n');
    } else {
      push(`${e.num} 0 obj\n${e.body}\nendobj\n`);
    }
  }

  const prev = prevStartXref(src);
  const style = xrefStyle(src);
  if (style === 'classic') {
    const xrefAt = base + bytes.length;
    const nums = [...offsets.keys()].sort((x, y) => x - y);
    push('xref\n0 1\n0000000000 65535 f \n');
    for (const n of nums)
      push(
        `${n} 1\n` + String(offsets.get(n)).padStart(10, '0') + ' 00000 n \n'
      );
    const size = Math.max(pdf.size, Math.max(...nums) + 1);
    push(
      `trailer\n<< /Size ${size} /Root ${pdf.rootNum} 0 R /Prev ${prev} >>\n`
    );
    push(`startxref\n${xrefAt}\n%%EOF\n`);
  } else {
    const xrefNum = nextFree++;
    const xrefAt = base + bytes.length;
    offsets.set(xrefNum, xrefAt);
    const nums = [...offsets.keys()].sort((x, y) => x - y);
    const size = Math.max(pdf.size, Math.max(...nums) + 1);
    let index = '';
    const rows = [];
    for (const n of nums) {
      index += `${n} 1 `;
      const off = offsets.get(n);
      rows.push(
        1,
        (off >>> 24) & 0xff,
        (off >>> 16) & 0xff,
        (off >>> 8) & 0xff,
        off & 0xff,
        0,
        0
      );
    }
    push(
      `${xrefNum} 0 obj\n<< /Type /XRef /Size ${size} /Index [ ${index}] ` +
        `/W [1 4 2] /Root ${pdf.rootNum} 0 R /Prev ${prev} ` +
        `/Length ${rows.length} >>\nstream\n`
    );
    for (const b2 of rows) bytes.push(b2);
    push('\nendstream\nendobj\n');
    push(`startxref\n${xrefAt}\n%%EOF\n`);
  }

  const res2 = new Uint8Array(base + bytes.length);
  res2.set(originalBytes, 0);
  res2.set(Uint8Array.from(bytes), base);
  return res2;
}

function prevStartXref(src) {
  const i = src.lastIndexOf('startxref');
  if (i < 0) return 0;
  const m = src.slice(i).match(/startxref\s+(\d+)/);
  return m ? +m[1] : 0;
}
