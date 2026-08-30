import {
  latin,
  parsePdf,
  streamData,
  withObjStm,
  dictAt,
  probePdfBytes,
} from './shadingsurgery.js';

const mul = (m, n) => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4],
  m[4] * n[1] + m[5] * n[3] + n[5],
];
const I = [1, 0, 0, 1, 0, 0];

const TOKEN_RE =
  /\((?:\\.|[^\\)])*\)|<<[\s\S]*?>>|<[0-9A-Fa-f\s]*>|\[(?:\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]*>|[^\]])*\]|\/[^\s/<>()[\]{}%]*|[^\s/<>()[\]{}%]+/g;

const OPERATOR = /^[A-Za-z'"][A-Za-z0-9*'"]*$/;

function analyzeContent(content, fontIsT3) {
  const blocks = [];
  const tjs = [];
  const stack = [];
  let ctm = I;
  let fill = null,
    strokeC = null,
    gsOp = null;
  let tf = null,
    tfSize = 0,
    tc = null,
    tw = null,
    tz = null,
    tl = null,
    ts = null,
    trm = null;
  let btEntry = null;
  let tm = I,
    tlm = I;
  let blk = null;
  let pend = [];
  const hexCodes = (tok) => {
    const out = [];
    if (tok[0] === '<') {
      const h = tok.slice(1, -1).replace(/\s+/g, '');
      for (let i = 0; i < h.length; i += 2) {
        const b = h.slice(i, i + 2);
        out.push(parseInt(b.length === 2 ? b : b + '0', 16));
      }
    } else if (tok[0] === '(') {
      const s = tok.slice(1, -1);
      for (let i = 0; i < s.length; i++) {
        let c = s[i];
        if (c === '\\') {
          const n = s[i + 1];
          if (n >= '0' && n <= '7') {
            let oct = '';
            while (oct.length < 3 && s[i + 1] >= '0' && s[i + 1] <= '7')
              oct += s[++i];
            out.push(parseInt(oct, 8));
            continue;
          }
          i++;
          c = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }[n] ?? n;
        }
        out.push(c.charCodeAt(0) & 0xff);
      }
    }
    return out;
  };
  const show = (tok) => {
    if (tok == null) return;
    let codes = [];
    if (tok[0] === '[') {
      for (const el of tok
        .slice(1, -1)
        .matchAll(/\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]*>/g))
        codes = codes.concat(hexCodes(el[0]));
    } else codes = hexCodes(tok);
    const dev = mul(tm, ctm);
    tjs.push({
      e: dev[4],
      f: dev[5],
      font: tf,
      size: tfSize,
      codes,
      block: blocks.length,
    });
    if (blk) {
      blk.shows.push(tjs.length - 1);
      if (tf) blk.fonts.add(tf);
      else blk.selfContained = false;
    }
  };
  for (const m of content.matchAll(TOKEN_RE)) {
    const t = m[0],
      at = m.index;
    if (!OPERATOR.test(t) || /^[\d.]/.test(t)) {
      pend.push(t);
      continue;
    }
    const nums = () => pend.map(Number);
    switch (t) {
      case 'q':
        stack.push({
          ctm,
          fill,
          strokeC,
          gsOp,
          tf,
          tfSize,
          tc,
          tw,
          tz,
          tl,
          ts,
          trm,
        });
        break;
      case 'Q': {
        const s = stack.pop();
        if (s)
          ({ ctm, fill, strokeC, gsOp, tf, tfSize, tc, tw, tz, tl, ts, trm } =
            s);
        break;
      }
      case 'cm': {
        const n = nums();
        if (n.length === 6) ctm = mul(n, ctm);
        break;
      }
      case 'gs':
        gsOp = pend[0] + ' gs';
        break;
      case 'g':
      case 'rg':
      case 'k':
        fill = pend.join(' ') + ' ' + t;
        break;
      case 'G':
      case 'RG':
      case 'K':
        strokeC = pend.join(' ') + ' ' + t;
        break;
      case 'sc':
      case 'scn':
        fill = pend.join(' ') + ' ' + t;
        break;
      case 'SC':
      case 'SCN':
        strokeC = pend.join(' ') + ' ' + t;
        break;
      case 'BT':
        tm = I;
        tlm = I;
        btEntry = { fill, strokeC, gsOp, tf, tfSize, tc, tw, tz, tl, ts, trm };
        blk = {
          start: at,
          end: -1,
          fonts: new Set(),
          shows: [],
          selfContained: true,
          entry: btEntry,
        };
        break;
      case 'ET':
        if (blk) {
          blk.end = at + 2;
          blocks.push(blk);
        }
        blk = null;
        break;
      case 'Tf':
        tf = pend[0] ? pend[0].slice(1) : null;
        tfSize = Number(pend[1]) || 0;
        break;
      case 'Tm': {
        const n = nums();
        if (n.length === 6) {
          tm = n;
          tlm = n;
        }
        break;
      }
      case 'Td': {
        const n = nums();
        tlm = mul([1, 0, 0, 1, n[0] || 0, n[1] || 0], tlm);
        tm = tlm;
        break;
      }
      case 'TD': {
        const n = nums();
        tl = -(n[1] || 0);
        tlm = mul([1, 0, 0, 1, n[0] || 0, n[1] || 0], tlm);
        tm = tlm;
        break;
      }
      case 'T*':
        tlm = mul([1, 0, 0, 1, 0, -(tl || 0)], tlm);
        tm = tlm;
        break;
      case 'TL':
        tl = Number(pend[0]) || 0;
        break;
      case 'Tc':
        tc = pend[0] + ' Tc';
        break;
      case 'Tw':
        tw = pend[0] + ' Tw';
        break;
      case 'Tz':
        tz = pend[0] + ' Tz';
        break;
      case 'Ts':
        ts = pend[0] + ' Ts';
        break;
      case 'Tr':
        trm = pend[0] + ' Tr';
        break;
      case 'Tj':
        show(pend[pend.length - 1]);
        break;
      case 'TJ':
        show(pend[pend.length - 1]);
        break;
      case "'":
        tlm = mul([1, 0, 0, 1, 0, -(tl || 0)], tlm);
        tm = tlm;
        show(pend[pend.length - 1]);
        break;
      case '"':
        tlm = mul([1, 0, 0, 1, 0, -(tl || 0)], tlm);
        tm = tlm;
        show(pend[pend.length - 1]);
        break;
      default:
        break;
    }
    pend = [];
  }
  for (const b of blocks) {
    if (!b.shows.length) b.selfContained = false;
    for (const si of b.shows) {
      const tj = tjs[si];
      if (!tj.font || !fontIsT3(tj.font)) b.selfContained = false;
    }
  }
  return { blocks, tjs };
}

function pageT3Fonts(op, pgBody) {
  let resBody;
  const rref = pgBody.match(/\/Resources\s+(\d+)\s+\d+\s+R/);
  if (rref) resBody = op.objBody(parseInt(rref[1], 10))?.body ?? '';
  else resBody = dictAt(pgBody, pgBody.indexOf('/Resources')) ?? '';
  const fontDict = resBody && dictAt(resBody, resBody.indexOf('/Font'));
  if (!fontDict) return null;
  const t3 = new Set();
  const nums = {};
  for (const m of fontDict.matchAll(
    /\/([A-Za-z0-9_.#-]+)\s+(\d+)\s+\d+\s+R/g
  )) {
    const num = parseInt(m[2], 10);
    nums[m[1]] = num;
    const fo = op.objBody(num);
    if (fo && /\/Subtype\s*\/Type3\b/.test(fo.body)) t3.add(m[1]);
  }
  return t3.size
    ? { t3, nums, resBody, resRef: rref ? parseInt(rref[1], 10) : -1 }
    : null;
}

export async function protectType3Text(bytes) {
  if (!probePdfBytes(bytes).type3) return null;
  const src = latin(bytes);
  if (!/\/Subtype\s*\/Type3\b/.test(src)) return null;
  const op = await withObjStm(bytes, src, parsePdf(src));
  if (!op) return null;
  let next = op.size;
  const newObjs = [],
    pageRewrites = [];
  const seg = {};

  for (let pi = 0; pi < 4096; pi++) {
    const pgNum = op.pageNum(pi);
    if (pgNum < 0) break;
    const pg = op.objBody(pgNum);
    if (!pg) continue;
    const fonts = pageT3Fonts(op, pg.body);
    if (!fonts) continue;

    const cOne = pg.body.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
    const cArr = pg.body.match(/\/Contents\s*\[([^\]]*)\]/);
    const refs = cOne
      ? [parseInt(cOne[1], 10)]
      : cArr
        ? [...cArr[1].matchAll(/(\d+)\s+\d+\s+R/g)].map((r) =>
            parseInt(r[1], 10)
          )
        : [];
    if (!refs.length) continue;
    let content = '';
    let ok = true;
    for (const rn of refs) {
      const o = op.objBody(rn);
      const d = o && (await streamData(bytes, src, o));
      if (d == null) {
        ok = false;
        break;
      }
      content += d + '\n';
    }
    if (!ok) continue;

    const { blocks, tjs } = analyzeContent(content, (n) => fonts.t3.has(n));
    seg[pi] = {
      fonts: fonts.nums,
      t3: [...fonts.t3],
      tjs: tjs.map((j) => ({
        e: j.e,
        f: j.f,
        font: j.font,
        size: j.size,
        codes: j.codes,
      })),
    };
    const liftable = blocks.filter((b) => b.selfContained);
    if (!liftable.length) continue;

    const resNum = next++;
    newObjs.push({ num: resNum, body: fonts.resBody.trim() || '<< >>' });

    const added = [];
    for (const b of [...liftable].sort((x, y) => y.start - x.start)) {
      const en = b.entry;
      const pre = [en.fill, en.strokeC, en.gsOp].filter(Boolean).join('\n');
      const tstate = [
        en.tf ? `/${en.tf} ${en.tfSize} Tf` : null,
        en.tc,
        en.tw,
        en.tz,
        en.ts,
        en.trm,
        en.tl != null ? `${en.tl} TL` : null,
      ]
        .filter(Boolean)
        .join(' ');
      let ops = content.slice(b.start, b.end);
      if (tstate) ops = ops.replace(/^BT\b/, 'BT ' + tstate);
      if (pre) ops = pre + '\n' + ops;
      const num = next++;
      const name = `ECT3${num}`;
      newObjs.push({
        num,
        body:
          `<< /Type /XObject /Subtype /Form /FormType 1` +
          ` /BBox [ -100000 -100000 100000 100000 ]` +
          ` /Resources ${resNum} 0 R /Length ${ops.length + 1} >>\nstream\n${ops}\nendstream`,
      });
      content =
        content.slice(0, b.start) + `/${name} Do\n` + content.slice(b.end);
      added.push({ name, num });
    }

    const cnum = next++;
    newObjs.push({
      num: cnum,
      body: `<< /Length ${content.length + 1} >>\nstream\n${content}\nendstream`,
    });
    const entries = added.map((a) => `/${a.name} ${a.num} 0 R`).join(' ');
    let newPage = pg.body.replace(
      cOne ? cOne[0] : cArr[0],
      `/Contents ${cnum} 0 R`
    );
    if (fonts.resRef >= 0) {
      let res = fonts.resBody.trim();
      const xo = res.match(/\/XObject\s*<<([\s\S]*?)>>/);
      res = xo
        ? res.replace(xo[0], `/XObject <<${xo[1]} ${entries} >>`)
        : res.replace(/^<</, `<< /XObject << ${entries} >> `);
      pageRewrites.push({ num: fonts.resRef, body: res });
    } else {
      const resDict = dictAt(pg.body, pg.body.indexOf('/Resources'));
      const xo = resDict.match(/\/XObject\s*<<([\s\S]*?)>>/);
      const newRes = xo
        ? resDict.replace(xo[0], `/XObject <<${xo[1]} ${entries} >>`)
        : resDict.replace(/^<</, `<< /XObject << ${entries} >> `);
      newPage = newPage.replace(resDict, newRes);
    }
    pageRewrites.push({ num: pgNum, body: newPage });
  }
  if (!pageRewrites.length) return null;

  const out = appendRevision(src, op.rootNum, next, pageRewrites, newObjs);
  return { bytes: out, seg };
}

export async function protectFragileText(bytes) {
  if (!probePdfBytes(bytes).quartz) return null;
  const src = latin(bytes);
  if (!/Quartz PDFContext/.test(src)) return null;
  if (!/\/BaseFont\s*\/[A-Z]{6}\+/.test(src)) return null;
  const op = await withObjStm(bytes, src, parsePdf(src));
  if (!op) return null;
  let next = op.size;
  const newObjs = [],
    pageRewrites = [];
  const pages = [];

  for (let pi = 0; pi < 4096; pi++) {
    const pgNum = op.pageNum(pi);
    if (pgNum < 0) break;
    const pg = op.objBody(pgNum);
    if (!pg) continue;
    let resBody;
    const rref = pg.body.match(/\/Resources\s+(\d+)\s+\d+\s+R/);
    if (rref) resBody = op.objBody(parseInt(rref[1], 10))?.body ?? '';
    else resBody = dictAt(pg.body, pg.body.indexOf('/Resources')) ?? '';
    const fontDict = resBody && dictAt(resBody, resBody.indexOf('/Font'));
    if (!fontDict || !/\/[A-Za-z0-9_.#-]+\s+\d+\s+\d+\s+R/.test(fontDict))
      continue;

    const cOne = pg.body.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
    const cArr = pg.body.match(/\/Contents\s*\[([^\]]*)\]/);
    const refs = cOne
      ? [parseInt(cOne[1], 10)]
      : cArr
        ? [...cArr[1].matchAll(/(\d+)\s+\d+\s+R/g)].map((r) =>
            parseInt(r[1], 10)
          )
        : [];
    if (!refs.length) continue;
    let content = '';
    let ok = true;
    for (const rn of refs) {
      const o = op.objBody(rn);
      const d = o && (await streamData(bytes, src, o));
      if (d == null) {
        ok = false;
        break;
      }
      content += d + '\n';
    }
    if (!ok) continue;

    const { blocks } = analyzeContent(content, () => true);
    const liftable = blocks.filter((b) => b.selfContained);
    if (!liftable.length) continue;

    const resNum = next++;
    newObjs.push({ num: resNum, body: resBody.trim() || '<< >>' });
    const added = [];
    for (const b of [...liftable].sort((x, y) => y.start - x.start)) {
      const en = b.entry;
      const pre = [en.fill, en.strokeC, en.gsOp].filter(Boolean).join('\n');
      const tstate = [
        en.tf ? `/${en.tf} ${en.tfSize} Tf` : null,
        en.tc,
        en.tw,
        en.tz,
        en.ts,
        en.trm,
        en.tl != null ? `${en.tl} TL` : null,
      ]
        .filter(Boolean)
        .join(' ');
      let ops = content.slice(b.start, b.end);
      if (tstate) ops = ops.replace(/^BT\b/, 'BT ' + tstate);
      if (pre) ops = pre + '\n' + ops;
      const num = next++;
      const name = `ECFT${num}`;
      newObjs.push({
        num,
        body:
          `<< /Type /XObject /Subtype /Form /FormType 1` +
          ` /BBox [ -100000 -100000 100000 100000 ]` +
          ` /Resources ${resNum} 0 R /Length ${ops.length + 1} >>\nstream\n${ops}\nendstream`,
      });
      content =
        content.slice(0, b.start) + `/${name} Do\n` + content.slice(b.end);
      added.push({ name, num });
    }

    const cnum = next++;
    newObjs.push({
      num: cnum,
      body: `<< /Length ${content.length + 1} >>\nstream\n${content}\nendstream`,
    });
    const entries = added.map((a) => `/${a.name} ${a.num} 0 R`).join(' ');
    let newPage = pg.body.replace(
      cOne ? cOne[0] : cArr[0],
      `/Contents ${cnum} 0 R`
    );
    if (rref) {
      let res = resBody.trim();
      const xo = res.match(/\/XObject\s*<<([\s\S]*?)>>/);
      res = xo
        ? res.replace(xo[0], `/XObject <<${xo[1]} ${entries} >>`)
        : res.replace(/^<</, `<< /XObject << ${entries} >> `);
      pageRewrites.push({ num: parseInt(rref[1], 10), body: res });
    } else {
      const resDict = dictAt(pg.body, pg.body.indexOf('/Resources'));
      const xo = resDict.match(/\/XObject\s*<<([\s\S]*?)>>/);
      const newRes = xo
        ? resDict.replace(xo[0], `/XObject <<${xo[1]} ${entries} >>`)
        : resDict.replace(/^<</, `<< /XObject << ${entries} >> `);
      newPage = newPage.replace(resDict, newRes);
    }
    pageRewrites.push({ num: pgNum, body: newPage });
    pages.push(pi);
  }
  if (!pageRewrites.length) return null;
  return {
    bytes: appendRevision(src, op.rootNum, next, pageRewrites, newObjs),
    pages,
  };
}

export async function consolidateContentArrays(bytes) {
  if (!probePdfBytes(bytes).contentsArray && bytes.length > 4 << 20)
    return null;
  const src = latin(bytes);
  const rawHasArrays = /\/Contents\s*\[/.test(src);
  if (!rawHasArrays && bytes.length > 4 << 20) return null;
  const op = await withObjStm(bytes, src, parsePdf(src));
  if (!op) return null;
  let next = op.size;
  const newObjs = [],
    pageRewrites = [];
  for (let pi = 0; pi < 4096; pi++) {
    const pgNum = op.pageNum(pi);
    if (pgNum < 0) break;
    const pg = op.objBody(pgNum);
    if (!pg) continue;
    const cArr = pg.body.match(/\/Contents\s*\[([^\]]*)\]/);
    if (!cArr) continue;
    const refs = [...cArr[1].matchAll(/(\d+)\s+\d+\s+R/g)].map((r) =>
      parseInt(r[1], 10)
    );
    if (refs.length < 2) continue;
    let content = '';
    let ok = true;
    for (const rn of refs) {
      const o = op.objBody(rn);
      const d = o && (await streamData(bytes, src, o));
      if (d == null) {
        ok = false;
        break;
      }
      content += d + '\n';
    }
    if (!ok) continue;
    const cnum = next++;
    newObjs.push({
      num: cnum,
      body: `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    });
    pageRewrites.push({
      num: pgNum,
      body: pg.body.replace(cArr[0], `/Contents ${cnum} 0 R`),
    });
  }
  if (!pageRewrites.length) return null;
  return appendRevision(src, op.rootNum, next, pageRewrites, newObjs);
}

export function applyType3LeftoverSurgery(savedBytes, jobs) {
  jobs = (jobs || []).filter(
    (j) =>
      j &&
      j.seg &&
      (j.state || []).some((o) => o.t3 && o.glyphs && o.glyphs.length)
  );
  if (!jobs.length) return null;
  const saved = latin(savedBytes);
  const sp = parsePdf(saved);
  if (!sp) return null;
  let next = sp.size;
  const newObjs = [],
    pageRewrites = [];
  const injected = {};

  for (const job of jobs) {
    const leftovers = job.state.filter(
      (o) => o.t3 && o.glyphs && o.glyphs.length
    );
    leftovers.sort((a, b) => {
      const band = (o) => Math.round(-o.m[5] / 6);
      return band(a) - band(b) || a.m[4] - b.m[4];
    });
    const tjs = job.seg.tjs || [];
    const anchors = job.anchors || {};
    const usedTj = new Set();
    const lines = [];
    const injectedTjs = [];
    for (const o of leftovers) {
      let name = anchors[o.font] ?? null;
      const oCodes = o.glyphs.map((g) => g[0]);
      if (!name) {
        const sameCodes = (tj) =>
          tj.codes.length === oCodes.length &&
          tj.codes.every((c, k) => c === oCodes[k]);
        let hit = tjs.findIndex(
          (tj, i) =>
            !usedTj.has(i) &&
            Math.abs(tj.e - o.m[4]) < 0.05 &&
            Math.abs(tj.f - o.m[5]) < 0.05 &&
            sameCodes(tj)
        );
        if (hit < 0)
          hit = tjs.findIndex((tj, i) => !usedTj.has(i) && sameCodes(tj));
        if (hit < 0) {
          hit = tjs.findIndex(
            (tj, i) =>
              !usedTj.has(i) &&
              tj.codes.length >= oCodes.length &&
              oCodes.every((c, k) => c === tj.codes[k])
          );
        }
        if (hit < 0) {
          console.warn('[type3] leftover glyph unmatched — skipped');
          continue;
        }
        usedTj.add(hit);
        name = tjs[hit].font;
      }
      const shownCodes = [];
      const num6 = (v) => (Math.round(v * 10000) / 10000).toString();
      const hex = (c) =>
        '<' +
        (c > 255
          ? c.toString(16).padStart(4, '0')
          : c.toString(16).padStart(2, '0')) +
        '>';
      let ops = 'q ';
      ops += `${num6(o.fill[0] / 255)} ${num6(o.fill[1] / 255)} ${num6(o.fill[2] / 255)} rg `;
      ops += `${num6(o.stroke[0] / 255)} ${num6(o.stroke[1] / 255)} ${num6(o.stroke[2] / 255)} RG `;
      if (o.sw > 0) ops += `${num6(o.sw)} w `;
      ops += `BT ${o.m.map(num6).join(' ')} Tm /${name} ${num6(o.size)} Tf `;
      if (o.tr) ops += `${o.tr} Tr `;
      const known = new Set();
      for (const tj of tjs)
        if (tj.font === name) tj.codes.forEach((c) => known.add(c));
      let px = 0,
        py = 0;
      o.glyphs.forEach(([c, gx, gy], gi) => {
        if (gi === 0) {
          if (gx || gy) ops += `${num6(gx)} ${num6(gy)} Td `;
        } else ops += `${num6(gx - px)} ${num6(gy - py)} Td `;
        px = gx;
        py = gy;
        if (known.has(c)) {
          ops += hex(c) + ' Tj ';
          shownCodes.push(c);
        }
      });
      ops += 'ET Q';
      injectedTjs.push({
        e: o.m[4],
        f: o.m[5],
        font: name,
        size: o.size,
        codes: shownCodes,
      });
      lines.push(ops);
    }
    if (!lines.length) continue;

    const prefix = 'ET Q\n'.repeat(leftovers.length);
    const body = prefix + lines.join('\n') + '\n';

    const pgNum = sp.pageNum(job.pageIndex);
    if (pgNum < 0) continue;
    const spg = sp.objBody(pgNum);
    if (!spg) continue;
    const cOne = spg.body.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
    const cArr = spg.body.match(/\/Contents\s*\[([^\]]*)\]/);
    if (!cOne && !cArr) continue;
    const snum = next++;
    newObjs.push({
      num: snum,
      body: `<< /Length ${body.length} >>\nstream\n${body}endstream`,
    });
    const refList = cOne ? `${cOne[1]} 0 R` : cArr[1].trim();
    let newPage = spg.body.replace(
      cOne ? cOne[0] : cArr[0],
      `/Contents [ ${refList} ${snum} 0 R ]`
    );

    const usedNames = new Set(
      (lines.join(' ').match(/\/([A-Za-z0-9_.#-]+)\s+[\d.]+\s+Tf/g) ?? []).map(
        (s) => s.match(/\/([A-Za-z0-9_.#-]+)/)[1]
      )
    );
    const rref = newPage.match(/\/Resources\s+(\d+)\s+\d+\s+R/);
    if (rref) {
      const rnum = parseInt(rref[1], 10);
      const ro = sp.objBody(rnum);
      if (ro) {
        const res = mergeFonts(ro.body, usedNames, job.seg.fonts);
        if (res !== ro.body) pageRewrites.push({ num: rnum, body: res });
      }
    } else {
      newPage = mergeFonts(newPage, usedNames, job.seg.fonts);
    }
    pageRewrites.push({ num: pgNum, body: newPage });
    injected[job.pageIndex] = injectedTjs;
  }
  if (!newObjs.length) return null;
  return {
    bytes: appendRevision(saved, sp.rootNum, next, pageRewrites, newObjs),
    injected,
  };
}

function mergeFonts(body, usedNames, fontNums) {
  const resAt = body.indexOf('/Resources');
  const resDict = resAt >= 0 ? dictAt(body, resAt) : dictAt(body, 0);
  if (!resDict) return body;
  const fontDict = dictAt(resDict, resDict.indexOf('/Font'));
  const missing = [...usedNames].filter(
    (n) =>
      fontNums[n] != null &&
      !(fontDict || '').match(
        new RegExp('/' + n.replace(/[^A-Za-z0-9_]/g, '\\$&') + '[\\s/]')
      )
  );
  if (!missing.length) return body;
  const entries = missing.map((n) => `/${n} ${fontNums[n]} 0 R`).join(' ');
  let newRes;
  if (fontDict)
    newRes = resDict.replace(
      fontDict,
      fontDict.replace(/^<</, `<< ${entries} `)
    );
  else newRes = resDict.replace(/^<</, `<< /Font << ${entries} >> `);
  return body.replace(resDict, newRes);
}

function appendRevision(src, rootNum, size, pageRewrites, newObjs) {
  let out = src;
  if (!out.endsWith('\n')) out += '\n';
  const offsets = new Map();
  const emit = (num, body) => {
    offsets.set(num, out.length);
    out += `${num} 0 obj\n${body.trim()}\nendobj\n`;
  };
  for (const o of pageRewrites) emit(o.num, o.body);
  for (const o of newObjs) emit(o.num, o.body);
  const xrefAt = out.length;
  const nums = [...offsets.keys()].sort((a, b) => a - b);
  let xref = 'xref\n';
  for (let i = 0; i < nums.length; ) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    xref += `${nums[i]} ${j - i + 1}\n`;
    for (let k = i; k <= j; k++)
      xref += String(offsets.get(nums[k])).padStart(10, '0') + ' 00000 n \n';
    i = j + 1;
  }
  out += xref;
  const prevAt = src.lastIndexOf('startxref');
  const prevNum = parseInt(src.slice(prevAt + 9).trim(), 10);
  const infoM = src
    .slice(src.lastIndexOf('trailer'))
    .match(/\/Info\s+(\d+)\s+\d+\s+R/);
  out +=
    `trailer\n<< /Size ${size} /Root ${rootNum} 0 R` +
    (infoM ? ` /Info ${infoM[1]} 0 R` : '') +
    (Number.isFinite(prevNum) ? ` /Prev ${prevNum}` : '') +
    ` >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  const u8 = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) u8[i] = out.charCodeAt(i) & 0xff;
  return u8;
}
