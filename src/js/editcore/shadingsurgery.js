export const bytesHave = (u8, needle) => {
  const n = needle.length;
  const end = u8.length;
  if (!n || end < n) return false;
  const first = needle.charCodeAt(0);
  outer: for (let i = 0; i + n <= end; i++) {
    if (u8[i] !== first) continue;
    for (let j = 1; j < n; j++) {
      if (u8[i + j] !== needle.charCodeAt(j)) continue outer;
    }
    return true;
  }
  return false;
};

const PROBE_NEEDLES = [
  ['pattern', '/Pattern'],
  ['shading', '/Shading'],
  ['type3', '/Type3'],
  ['form', '/Form'],
  ['quartz', 'Quartz PDFContext'],
  ['objStm', '/ObjStm'],
];

const probeMemo = new WeakMap();

export const probePdfBytes = (u8) => {
  const cached = probeMemo.get(u8);
  if (cached) return cached;
  const out = {
    pattern: false,
    shading: false,
    type3: false,
    form: false,
    quartz: false,
    objStm: false,
    contentsArray: false,
    subsetFont: false,
  };
  const end = u8.length;
  const match = (at, text) => {
    if (at + text.length > end) return false;
    for (let j = 1; j < text.length; j++) {
      if (u8[at + j] !== text.charCodeAt(j)) return false;
    }
    return true;
  };
  const skipWs = (at) => {
    while (
      at < end &&
      (u8[at] === 32 || u8[at] === 10 || u8[at] === 13 || u8[at] === 9)
    )
      at++;
    return at;
  };
  for (let i = 0; i < end; i++) {
    const c = u8[i];
    if (c === 81) {
      if (!out.quartz && match(i, 'Quartz PDFContext')) out.quartz = true;
      continue;
    }
    if (c !== 47) continue;
    for (const [key, text] of PROBE_NEEDLES) {
      if (!out[key] && match(i, text)) out[key] = true;
    }
    if (!out.contentsArray && match(i, '/Contents')) {
      if (u8[skipWs(i + 9)] === 91) out.contentsArray = true;
    }
    if (!out.subsetFont && match(i, '/BaseFont')) {
      let k = skipWs(i + 9);
      if (u8[k] === 47) {
        k++;
        let upper = k + 6 <= end;
        for (let t = 0; upper && t < 6; t++) {
          if (u8[k + t] < 65 || u8[k + t] > 90) upper = false;
        }
        if (upper && u8[k + 6] === 43) out.subsetFont = true;
      }
    }
  }
  probeMemo.set(u8, out);
  return out;
};

const latinMemo = new WeakMap();
export const latin = (u8) => {
  const hit = latinMemo.get(u8);
  if (hit) return hit;
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) {
    s += String.fromCharCode.apply(
      null,
      u8.subarray(i, Math.min(i + 0x8000, u8.length))
    );
  }
  latinMemo.set(u8, s);
  return s;
};

const parsePdfMemo = new Map();

export const parsePdf = (src) => {
  const hit = parsePdfMemo.get(src);
  if (hit !== undefined) return hit;
  const built = parsePdfUncached(src);
  if (parsePdfMemo.size > 4) parsePdfMemo.clear();
  parsePdfMemo.set(src, built);
  return built;
};

const parsePdfUncached = (src) => {
  const objAt = new Map();
  for (const m of src.matchAll(/(\d+)\s+0\s+obj\b/g)) {
    if (m.index > 0 && src[m.index - 1] >= '0' && src[m.index - 1] <= '9')
      continue;
    objAt.set(parseInt(m[1], 10), m.index);
  }
  const objBody = (num) => {
    const at = objAt.get(num);
    if (at == null) return null;
    const start = src.indexOf('obj', at) + 3;
    const end = src.indexOf('endobj', start);
    return end < 0 ? null : { start, end, body: src.slice(start, end) };
  };
  const dictRef = (body, key) => {
    const m = body.match(new RegExp('/' + key + '\\s+(\\d+)\\s+\\d+\\s+R'));
    return m ? parseInt(m[1], 10) : -1;
  };
  let rootNum = -1;
  let size = -1;
  for (let tAt = src.length; rootNum < 0; ) {
    tAt = src.lastIndexOf('trailer', tAt - 1);
    if (tAt < 0) break;
    const trailer = src.slice(tAt, tAt + 400);
    if (rootNum < 0) rootNum = dictRef(trailer, 'Root');
  }
  for (const m of src.matchAll(/\/Size\s+(\d+)/g))
    size = Math.max(size, parseInt(m[1], 10));
  if (rootNum < 0) {
    const m = src.match(/\/Root\s+(\d+)\s+\d+\s+R/);
    if (m) rootNum = parseInt(m[1], 10);
  }
  if (rootNum < 0 || size < 0) return null;
  let pageList = null;
  const pageNum = (pageIndex) => {
    if (!pageList) {
      pageList = [];
      const root = objBody(rootNum);
      if (!root) return -1;
      const seen = new Set();
      const walk = (num) => {
        if (seen.has(num) || pageList.length > 8192) return;
        seen.add(num);
        const o = objBody(num);
        if (!o) return;
        if (/\/Type\s*\/Page\b(?!s)/.test(o.body)) {
          pageList.push(num);
          return;
        }
        const kids = o.body.match(/\/Kids\s*\[([^\]]*)\]/);
        if (!kids) return;
        for (const r of kids[1].matchAll(/(\d+)\s+\d+\s+R/g))
          walk(parseInt(r[1], 10));
      };
      walk(dictRef(root.body, 'Pages'));
    }
    return pageIndex < pageList.length ? pageList[pageIndex] : -1;
  };
  return { objBody, dictRef, rootNum, size, pageNum };
};

export const streamData = async (bytes, src, obj) => {
  const si = src.indexOf('stream', obj.start);
  if (si < 0 || si > obj.end) return null;
  let ds = si + 6;
  if (src[ds] === '\r') ds++;
  if (src[ds] === '\n') ds++;
  const indirect = obj.body.match(/\/Length\s+(\d+)\s+\d+\s+R/);
  let len = -1;
  if (indirect) {
    const rx = new RegExp(
      '(?:^|[^0-9])' + indirect[1] + '\\s+0\\s+obj\\s*(\\d+)'
    );
    const rm = src.match(rx);
    if (rm) len = parseInt(rm[1], 10);
  } else {
    const lm = obj.body.match(/\/Length\s+(\d+)/);
    if (lm) len = parseInt(lm[1], 10);
  }
  const de = len >= 0 ? ds + len : src.indexOf('endstream', ds);
  const raw = bytes.subarray(ds, de);
  if (!/\/Filter\s*\/FlateDecode/.test(obj.body)) {
    return /\/Filter/.test(obj.body) ? null : latin(raw);
  }
  try {
    const stream = new Blob([raw])
      .stream()
      .pipeThrough(new DecompressionStream('deflate'));
    const buf = new Uint8Array(await new Response(stream).arrayBuffer());
    return latin(buf);
  } catch {
    return null;
  }
};

const objStmIndex = async (bytes, src) => {
  const out = new Map();
  for (const m of src.matchAll(/(\d+)\s+0\s+obj\b/g)) {
    const start = src.indexOf('obj', m.index) + 3;
    const end = src.indexOf('endobj', start);
    if (end < 0) continue;
    const body = src.slice(start, end);
    if (!/\/Type\s*\/ObjStm/.test(body)) continue;
    const data = await streamData(bytes, src, { start, end, body });
    if (!data) continue;
    const n = parseInt((body.match(/\/N\s+(\d+)/) || [])[1], 10);
    const first = parseInt((body.match(/\/First\s+(\d+)/) || [])[1], 10);
    if (!Number.isFinite(n) || !Number.isFinite(first)) continue;
    const nums = data.slice(0, first).trim().split(/\s+/).map(Number);
    for (let i = 0; i < n; i++) {
      const num = nums[i * 2],
        off = nums[i * 2 + 1];
      if (!Number.isFinite(num) || !Number.isFinite(off)) continue;
      const nextOff = i + 1 < n ? nums[i * 2 + 3] : data.length - first;
      out.set(
        num,
        data.slice(
          first + off,
          first + (Number.isFinite(nextOff) ? nextOff : data.length - first)
        )
      );
    }
  }
  return out;
};

const objStmMemo = new WeakMap();

const objStmIndexCached = async (bytes, src) => {
  const hit = objStmMemo.get(bytes);
  if (hit) return hit;
  const built = await objStmIndex(bytes, src);
  objStmMemo.set(bytes, built);
  return built;
};

export const withObjStm = async (bytes, src, op) => {
  if (!op) return op;
  const idx = await objStmIndexCached(bytes, src);
  if (!idx.size) return op;
  const base = op.objBody;
  const objBody = (num) =>
    base(num) ||
    (idx.has(num) ? { start: -1, end: -1, body: idx.get(num) } : null);
  const dictRef = op.dictRef;
  let pageList = null;
  const pageNum = (index) => {
    if (!pageList) {
      pageList = [];
      const root = objBody(op.rootNum);
      if (!root) return -1;
      const seen = new Set();
      const walk = (num, depth) => {
        if (num < 0 || depth > 32 || seen.has(num) || pageList.length > 8192)
          return;
        seen.add(num);
        const o = objBody(num);
        if (!o) return;
        if (/\/Type\s*\/Page(?![sA-Za-z])/.test(o.body)) {
          pageList.push(num);
          return;
        }
        const kids = o.body.match(/\/Kids\s*\[([^\]]*)\]/);
        if (!kids) return;
        for (const km of kids[1].matchAll(/(\d+)\s+\d+\s+R/g))
          walk(parseInt(km[1], 10), depth + 1);
      };
      walk(dictRef(root.body, 'Pages'), 0);
    }
    return index < pageList.length ? pageList[index] : -1;
  };
  return { ...op, objBody, pageNum };
};

const openQBefore = (content, pos, windowBytes) => {
  const backStart = Math.max(0, pos - windowBytes);
  const back = content.slice(backStart, pos);
  let depth = 0;
  for (let i = back.length - 1; i >= 0; i--) {
    const c = back[i];
    if (c !== 'q' && c !== 'Q') continue;
    const prev = i > 0 ? back[i - 1] : ' ';
    const next = i + 1 < back.length ? back[i + 1] : ' ';
    if (!/[\s>\]]/.test(prev) || !/[\s\/<[(%]/.test(next)) continue;
    if (c === 'Q') depth++;
    else if (depth > 0) depth--;
    else return backStart + i;
  }
  return -1;
};

const STATE_OPS = new Set([
  'm',
  'l',
  'c',
  'v',
  'y',
  're',
  'h',
  'W',
  'W*',
  'n',
  'cm',
  'gs',
  'ri',
  'i',
  'j',
  'J',
  'M',
  'd',
  'w',
  'cs',
  'CS',
  'sc',
  'scn',
  'SC',
  'SCN',
  'g',
  'G',
  'rg',
  'RG',
  'k',
  'K',
  'BX',
  'EX',
]);
const gapIsStateOnly = (gap) => {
  const stripped = gap
    .replace(/%[^\r\n]*/g, ' ')
    .replace(/\((?:\\.|[^\\)])*\)/g, ' ')
    .replace(/<<[\s\S]*?>>/g, ' ')
    .replace(/<[0-9A-Fa-f\s]*>/g, ' ')
    .replace(/\/[A-Za-z0-9_.#-]*/g, ' ')
    .replace(/[+-]?\d*\.?\d+/g, ' ')
    .replace(/[[\]]/g, ' ');
  for (const tok of stripped.split(/\s+/)) {
    if (tok && !STATE_OPS.has(tok)) return false;
  }
  return true;
};

const shBlocks = (content) => {
  const blocks = [];
  for (const m of content.matchAll(
    /\/[A-Za-z0-9_.]+\s+(?:sh|scn)(?![a-zA-Z])/g
  )) {
    let qAt = openQBefore(content, m.index, 4096);
    let endAt = -1;
    const fwd = content.slice(m.index, m.index + 2048);
    const qm = fwd.match(/[\s>\]]Q(?=[\s\/<[(%]|$)/);
    if (qm) endAt = m.index + qm.index + qm[0].length;
    if (qAt < 0 || endAt <= qAt) continue;
    const innerStart = qAt,
      innerEnd = endAt;
    let ops = content.slice(qAt, endAt);
    for (let lvl = 0; lvl < 4; lvl++) {
      const outer = openQBefore(content, qAt, 8192);
      if (outer < 0) break;
      const gap = content.slice(outer + 1, qAt);
      if (!gapIsStateOnly(gap)) break;
      ops = content.slice(outer, qAt) + ops + '\nQ';
      qAt = outer;
    }
    ops = stripTextObjects(ops);
    if (!/\b(?:sh|scn)(?![a-zA-Z])/.test(ops)) continue;
    blocks.push({
      ops,
      at: m.index,
      endAt,
      innerStart,
      innerEnd,
      isPattern: /scn$/.test(m[0].trim()),
    });
  }
  return blocks;
};

const stripTextObjects = (ops) => {
  const tok = /(?:^|[\s>\]<)(])(BT|ET)(?=[\s/<[(]|$)/g;
  let out = '',
    i = 0,
    depth = 0;
  for (const m of ops.matchAll(tok)) {
    const at = m.index + (m[0].length - 2);
    if (m[1] === 'BT') {
      if (depth === 0) out += ops.slice(i, at);
      depth++;
    } else if (depth > 0) {
      depth--;
      if (depth === 0) i = at + 2;
    }
  }
  if (depth === 0) out += ops.slice(i);
  return out;
};

const classifyShadings = (content, blocks) => {
  const btPos = content.search(/(?:^|[^A-Za-z0-9_])BT(?=[^A-Za-z0-9_]|$)/);
  const doM = content.match(/\/[A-Za-z0-9_.]+\s+Do(?![a-zA-Z])/);
  const doPos = doM ? doM.index : -1;
  const firstContent = Math.min(
    ...[btPos, doPos].filter((p) => p >= 0).concat([Infinity])
  );
  return blocks.map((b) => ({ isBackground: b.at < firstContent }));
};

const pageContent = async (bytes, src, parsed, pageIndex) => {
  const pgNum = parsed.pageNum(pageIndex);
  if (pgNum < 0) return null;
  const pg = parsed.objBody(pgNum);
  if (!pg) return null;
  const one = pg.body.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
  const arr = pg.body.match(/\/Contents\s*\[([^\]]*)\]/);
  const refs = one
    ? [parseInt(one[1], 10)]
    : arr
      ? [...arr[1].matchAll(/(\d+)\s+\d+\s+R/g)].map((r) => parseInt(r[1], 10))
      : [];
  let content = '';
  const spans = [];
  for (const rn of refs) {
    const o = parsed.objBody(rn);
    const d = o && (await streamData(bytes, src, o));
    if (d == null) return null;
    spans.push({ start: content.length, end: content.length + d.length });
    content += d + '\n';
  }
  return { content, spans };
};

export async function shadingsForPage(originalBytes, pageIndex) {
  const orig = latin(originalBytes);
  const op = await withObjStm(originalBytes, orig, parsePdf(orig));
  if (!op) return [];
  const pc = await pageContent(originalBytes, orig, op, pageIndex);
  if (pc == null) return [];
  const blocks = shBlocks(pc.content);
  if (!blocks.length) return [];
  return classifyShadings(pc.content, blocks);
}

export async function applyShadingSurgery(savedBytes, originalBytes, pages) {
  if (!Array.isArray(pages)) pages = pages ? [pages] : [];
  pages = pages.filter(Boolean);
  if (!pages.length) return null;
  const saved = latin(savedBytes);
  const sp = await withObjStm(savedBytes, saved, parsePdf(saved));
  if (!sp) return null;
  const sx = saved.lastIndexOf('startxref');
  const sxNum = parseInt(saved.slice(sx + 9).trim(), 10);
  if (!Number.isFinite(sxNum) || saved.slice(sxNum, sxNum + 4) !== 'xref')
    return null;

  const orig = latin(originalBytes);
  const op = await withObjStm(originalBytes, orig, parsePdf(orig));
  if (!op) return null;

  let next = sp.size;
  const pageRewrites = [];
  const contentObjs = [];

  for (const pg of pages) {
    const pageIndex = pg.pageIndex ?? 0;
    const pc = await pageContent(originalBytes, orig, op, pageIndex);
    if (pc == null) continue;
    const { content, spans } = pc;
    const allBlocks = shBlocks(content);
    const blocks = allBlocks.filter((b) => b.isPattern);
    if (!blocks.length) continue;
    let shadings = pg.shadings;
    if (!shadings || !shadings.length)
      shadings = classifyShadings(content, blocks);
    if (shadings.length !== blocks.length)
      shadings = classifyShadings(content, blocks);
    if (!shadings.length || blocks.length < shadings.length) continue;

    const spgNum = sp.pageNum(pageIndex);
    if (spgNum < 0) continue;
    const spg = sp.objBody(spgNum);
    let resBody = '';
    const rref = spg.body.match(/\/Resources\s+(\d+)\s+\d+\s+R/);
    if (rref) resBody = sp.objBody(parseInt(rref[1], 10))?.body ?? '';
    else {
      const k = spg.body.indexOf('/Resources');
      resBody = k >= 0 ? spg.body.slice(k, k + 4000) : '';
    }
    const used = shadings.map((s2, k) => ({ ...s2, ops: blocks[k].ops }));
    let resOk = true;
    for (const u of used) {
      for (const nm of u.ops.matchAll(
        /\/([A-Za-z0-9_.]+)\s+(?:gs|sh|scn|SCN|Do)\b/g
      )) {
        if (!resBody.includes('/' + nm[1])) {
          console.warn(
            `[shading] resource /${nm[1]} missing from saved page ${pageIndex} — page skipped`
          );
          resOk = false;
          break;
        }
      }
      if (!resOk) break;
    }
    if (!resOk) continue;

    const cOne = spg.body.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
    const cArr = spg.body.match(/\/Contents\s*\[([^\]]*)\]/);
    const savedRefs = cOne
      ? [cOne[1] + ' 0 R']
      : cArr
        ? [...cArr[1].matchAll(/\d+\s+\d+\s+R/g)].map((r) => r[0])
        : [];
    if (!savedRefs.length) continue;
    const PAINT_RE =
      /(?:^|[^A-Za-z0-9_*'"])(?:BT|Do|sh|EI|f\*?|F|B\*?|b\*?|S|s)(?![A-Za-z0-9_])/g;
    const paints = (s2) => {
      PAINT_RE.lastIndex = 0;
      let n2 = 0;
      while (PAINT_RE.exec(s2)) n2++;
      return n2;
    };
    const slots = new Map();
    const patternOps = [];
    for (let k2 = 0; k2 < used.length; k2++) {
      const u = used[k2];
      const at = blocks[k2].at;
      const si = spans.findIndex((s2) => at >= s2.start && at < s2.end);
      const matched = si >= 0 && spans.length === savedRefs.length;
      const before =
        matched &&
        paints(content.slice(spans[si].start, at)) <=
          paints(content.slice(at, spans[si].end));
      if (blocks[k2].isPattern) {
        patternOps.push(u.ops);
        continue;
      }
      let slot;
      if (!matched) {
        const textBefore = /(?:^|[^A-Za-z0-9_*'"])BT(?![A-Za-z0-9_])/.test(
          content.slice(0, at)
        );
        slot = textBefore ? 2 * savedRefs.length : 0;
      } else {
        slot = before ? 2 * si : 2 * si + 2;
      }
      if (!slots.has(slot)) slots.set(slot, []);
      slots.get(slot).push(u.ops);
    }

    let splitRefs = null;
    if (patternOps.length && savedRefs.length === 1) {
      const rnum = parseInt(savedRefs[0], 10);
      const sobj = sp.objBody(rnum);
      const sdata = sobj && (await streamData(savedBytes, saved, sobj));
      let cut = -1;
      const rectM = patternOps
        .join('\n')
        .match(/scn\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+re/);
      if (sdata != null && rectM) {
        const want = rectM.slice(1, 5).map(Number);
        for (const rm of sdata.matchAll(
          /(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+re\b/g
        )) {
          const got = rm.slice(1, 5).map(Number);
          if (!want.every((v, i) => Math.abs(v - got[i]) < 0.05)) continue;
          const after = sdata.slice(rm.index);
          const pm = after.match(
            /(?:^|[^A-Za-z0-9_*'"])(?:f\*?|F|B\*?|b\*?|S|s|n)(?![A-Za-z0-9_])/
          );
          if (pm) cut = rm.index + pm.index + pm[0].length;
        }
      }
      if (sdata != null && cut > 0) {
        const mk = (body2) => {
          const num = next++;
          contentObjs.push({
            num,
            body: `<< /Length ${body2.length + 1} >>\nstream\n${body2}\nendstream`,
          });
          return `${num} 0 R`;
        };
        splitRefs = [
          mk(sdata.slice(0, cut)),
          mk(patternOps.join('\n')),
          mk(sdata.slice(cut)),
        ];
      }
    }
    if (patternOps.length && !splitRefs) {
      const slot = 0;
      if (!slots.has(slot)) slots.set(slot, []);
      slots.get(slot).push(...patternOps);
    }
    const refs = [];
    if (splitRefs) refs.push(...splitRefs);
    else
      for (let i2 = 0; i2 <= savedRefs.length; i2++) {
        const ops = slots.get(2 * i2);
        if (ops && ops.length) {
          const body2 = ops.join('\n');
          const num = next++;
          contentObjs.push({
            num,
            body: `<< /Length ${body2.length + 1} >>\nstream\n${body2}\nendstream`,
          });
          refs.push(`${num} 0 R`);
        }
        if (i2 < savedRefs.length) refs.push(savedRefs[i2]);
      }
    const newPage = spg.body.replace(
      cOne ? cOne[0] : cArr[0],
      `/Contents [ ${refs.join(' ')} ]`
    );
    pageRewrites.push({ num: spgNum, body: newPage });
  }
  if (!pageRewrites.length) return null;

  let out = saved;
  if (!out.endsWith('\n')) out += '\n';
  const offsets = new Map();
  const emit = (num, body) => {
    offsets.set(num, out.length);
    out += `${num} 0 obj\n${body.trim()}\nendobj\n`;
  };
  for (const o of pageRewrites) emit(o.num, o.body);
  for (const o of contentObjs) emit(o.num, o.body);
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
  const infoM = saved
    .slice(saved.lastIndexOf('trailer'))
    .match(/\/Info\s+(\d+)\s+\d+\s+R/);
  out +=
    `trailer\n<< /Size ${next} /Root ${sp.rootNum} 0 R` +
    (infoM ? ` /Info ${infoM[1]} 0 R` : '') +
    ` /Prev ${sxNum} >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  const u8 = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) u8[i] = out.charCodeAt(i) & 0xff;
  return u8;
}

export async function pageHasPatternFill(originalBytes, pageIndex) {
  try {
    const probe = probePdfBytes(originalBytes);
    if (!probe.pattern && !probe.objStm) return false;
    const orig = latin(originalBytes);
    const op = await withObjStm(originalBytes, orig, parsePdf(orig));
    if (!op) return false;
    const pc = await pageContent(originalBytes, orig, op, pageIndex);
    if (pc == null) return false;
    return shBlocks(pc.content).some((b) => b.isPattern);
  } catch {
    return false;
  }
}

export const dictAt = (body, at) => {
  const open = body.indexOf('<<', at);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < body.length - 1; i++) {
    if (body[i] === '<' && body[i + 1] === '<') {
      depth++;
      i++;
      continue;
    }
    if (body[i] === '>' && body[i + 1] === '>') {
      depth--;
      i++;
      if (!depth) return body.slice(open, i + 1);
    }
  }
  return null;
};

export async function protectPatternArtwork(bytes) {
  const probe = probePdfBytes(bytes);
  if (!probe.pattern && !probe.shading && !probe.objStm) return null;
  const src = latin(bytes);
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
    const cOne = pg.body.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
    if (!cOne) continue;
    const pc = await pageContent(bytes, src, op, pi);
    if (pc == null) continue;
    const pats = shBlocks(pc.content).filter((b) => b.isPattern);
    if (!pats.length) continue;

    const rref = pg.body.match(/\/Resources\s+(\d+)\s+\d+\s+R/);
    const resDict = rref
      ? dictAt(op.objBody(parseInt(rref[1], 10))?.body ?? '', 0)
      : dictAt(pg.body, pg.body.indexOf('/Resources'));
    if (!resDict) continue;
    const box = pg.body.match(/\/MediaBox\s*\[([^\]]*)\]/);
    if (!box) continue;

    let content = pc.content;
    const added = [];
    for (const b of [...pats].sort((x, y) => y.innerStart - x.innerStart)) {
      const ops = content.slice(b.innerStart, b.innerEnd);
      const num = next++;
      const name = `ECBG${num}`;
      newObjs.push({
        num,
        body:
          `<< /Type /XObject /Subtype /Form /FormType 1 /BBox [ ${box[1].trim()} ]` +
          ` /Resources ${resDict} /Length ${ops.length + 1} >>\nstream\n${ops}\nendstream`,
      });
      content =
        content.slice(0, b.innerStart) +
        `/${name} Do\n` +
        content.slice(b.innerEnd);
      added.push({ name, num });
    }

    const entries = added.map((a) => `/${a.name} ${a.num} 0 R`).join(' ');
    let newRes;
    const xo = resDict.match(/\/XObject\s*<<([\s\S]*?)>>/);
    if (xo)
      newRes = resDict.replace(xo[0], `/XObject <<${xo[1]} ${entries} >>`);
    else newRes = resDict.replace(/^<</, `<< /XObject << ${entries} >> `);

    const cnum = next++;
    newObjs.push({
      num: cnum,
      body: `<< /Length ${content.length + 1} >>\nstream\n${content}\nendstream`,
    });
    let newPage = pg.body.replace(cOne[0], `/Contents ${cnum} 0 R`);
    newPage = rref
      ? newPage.replace(rref[0], `/Resources ${newRes}`)
      : newPage.replace(resDict, newRes);
    pageRewrites.push({ num: pgNum, body: newPage });
  }
  if (!pageRewrites.length) return null;

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
  const prev = src.lastIndexOf('startxref');
  const prevNum = parseInt(src.slice(prev + 9).trim(), 10);
  const infoM = src
    .slice(src.lastIndexOf('trailer'))
    .match(/\/Info\s+(\d+)\s+\d+\s+R/);
  out +=
    `trailer\n<< /Size ${next} /Root ${op.rootNum} 0 R` +
    (infoM ? ` /Info ${infoM[1]} 0 R` : '') +
    (Number.isFinite(prevNum) ? ` /Prev ${prevNum}` : '') +
    ` >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  const u8 = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) u8[i] = out.charCodeAt(i) & 0xff;
  return u8;
}
