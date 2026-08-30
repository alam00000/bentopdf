const latin = (u8) => {
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < u8.length; i += CH) {
    s += String.fromCharCode.apply(
      null,
      u8.subarray(i, Math.min(i + CH, u8.length))
    );
  }
  return s;
};

export function applyTagSurgery(
  bytes,
  { pageIndex = 0, newMarks = [], altText = [] } = {}
) {
  if (!newMarks.length && !altText.length) return bytes;
  const src = latin(bytes);

  const sx = src.lastIndexOf('startxref');
  if (sx < 0) return bytes;
  const sxNum = parseInt(src.slice(sx + 9).trim(), 10);
  if (!Number.isFinite(sxNum) || src.slice(sxNum, sxNum + 4) !== 'xref') {
    console.warn('[tags] non-classic xref — surgery skipped');
    return bytes;
  }
  const trailerAt = src.lastIndexOf('trailer');
  if (trailerAt < 0) return bytes;
  const trailer = src.slice(trailerAt, sx);
  const tref = (key) => {
    const m = trailer.match(new RegExp('/' + key + '\\s+(\\d+)\\s+\\d+\\s+R'));
    return m ? parseInt(m[1], 10) : -1;
  };
  const tint = (key) => {
    const m = trailer.match(new RegExp('/' + key + '\\s+(\\d+)'));
    return m ? parseInt(m[1], 10) : -1;
  };
  const rootNum = tref('Root');
  const size = tint('Size');
  if (rootNum < 0 || size < 0) return bytes;

  const objBody = (num) => {
    let at = -1;
    for (const m of src.matchAll(
      new RegExp('(?:^|[^0-9])' + num + '\\s+0\\s+obj\\b', 'g')
    )) {
      at = m.index;
    }
    if (at < 0) return null;
    const start = src.indexOf('obj', at) + 3;
    const end = src.indexOf('endobj', start);
    if (end < 0) return null;
    return { start, end, body: src.slice(start, end) };
  };
  const dictRef = (body, key) => {
    const m = body.match(new RegExp('/' + key + '\\s+(\\d+)\\s+\\d+\\s+R'));
    return m ? parseInt(m[1], 10) : -1;
  };
  const dictInt = (body, key) => {
    const m = body.match(new RegExp('/' + key + '\\s+(-?\\d+)'));
    return m ? parseInt(m[1], 10) : -1;
  };

  const root = objBody(rootNum);
  if (!root) return bytes;
  const strNum = dictRef(root.body, 'StructTreeRoot');
  if (strNum < 0) return bytes;
  const str = objBody(strNum);
  if (!str) return bytes;
  const parentTreeNum = dictRef(str.body, 'ParentTree');

  const pagesNum = dictRef(root.body, 'Pages');
  let pageNum = -1;
  {
    let remaining = pageIndex;
    const walk = (num) => {
      const o = objBody(num);
      if (!o) return -1;
      if (/\/Type\s*\/Page\b(?!s)/.test(o.body)) {
        if (remaining === 0) return num;
        remaining--;
        return -1;
      }
      const kids = o.body.match(/\/Kids\s*\[([^\]]*)\]/);
      if (!kids) return -1;
      for (const r of kids[1].matchAll(/(\d+)\s+\d+\s+R/g)) {
        const hit = walk(parseInt(r[1], 10));
        if (hit >= 0) return hit;
      }
      return -1;
    };
    pageNum = walk(pagesNum);
  }
  if (pageNum < 0) return bytes;
  const page = objBody(pageNum);
  const structParents = page ? dictInt(page.body, 'StructParents') : -1;
  if (structParents < 0) {
    console.warn('[tags] page has no /StructParents — surgery skipped');
    return bytes;
  }

  let ptArrayNum = -1;
  {
    const visit = (num) => {
      const o = objBody(num);
      if (!o) return;
      const kids = o.body.match(/\/Kids\s*\[([^\]]*)\]/);
      if (kids) {
        for (const r of kids[1].matchAll(/(\d+)\s+\d+\s+R/g))
          visit(parseInt(r[1], 10));
      }
      const nums = o.body.match(/\/Nums\s*\[([\s\S]*?)\]/);
      if (!nums) return;
      for (const t of nums[1].matchAll(/(\d+)\s+(\d+)\s+\d+\s+R/g)) {
        if (parseInt(t[1], 10) === structParents)
          ptArrayNum = parseInt(t[2], 10);
      }
    };
    if (parentTreeNum >= 0) visit(parentTreeNum);
    else {
      const nums = str.body.match(
        /\/ParentTree\s*<<[\s\S]*?\/Nums\s*\[([\s\S]*?)\]/
      );
      if (nums) {
        for (const t of nums[1].matchAll(/(\d+)\s+(\d+)\s+\d+\s+R/g)) {
          if (parseInt(t[1], 10) === structParents)
            ptArrayNum = parseInt(t[2], 10);
        }
      }
    }
  }
  if (ptArrayNum < 0) {
    console.warn('[tags] ParentTree entry for the page not found — skipped');
    return bytes;
  }
  const ptArr = objBody(ptArrayNum);
  if (!ptArr) return bytes;
  const arrM = ptArr.body.match(/\[([\s\S]*?)\]/);
  if (!arrM) return bytes;
  const items = [];
  for (const t of arrM[1].matchAll(/(\d+\s+\d+\s+R|null)/g))
    items.push(t[1].replace(/\s+/g, ' '));

  let parentNum = strNum;
  {
    const kRef = str.body.match(/\/K\s+(\d+)\s+\d+\s+R/);
    const kArr = str.body.match(/\/K\s*\[\s*(\d+)\s+\d+\s+R/);
    const cand = kRef
      ? parseInt(kRef[1], 10)
      : kArr
        ? parseInt(kArr[1], 10)
        : -1;
    if (cand >= 0) {
      const co = objBody(cand);
      const sName = co && co.body.match(/\/S\s*\/(\w+)/);
      if (sName && /^(Document|Part|Art|Sect|Div)$/.test(sName[1])) {
        parentNum = cand;
      }
    }
  }
  const parent = objBody(parentNum);
  if (!parent) return bytes;

  let next = size;
  const newObjs = [];
  const updated = new Map();
  const esc = (t) =>
    t.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const uniq = [...new Map(newMarks.map((m) => [m.mcid, m])).values()].sort(
    (a, b) => a.mcid - b.mcid
  );
  const addedRefs = [];
  for (const mk of uniq) {
    const alt = altText.find((a) => a.mcid === mk.mcid);
    const num = next++;
    newObjs.push({
      num,
      body:
        `<< /Type /StructElem /S /${mk.type || 'P'} /P ${parentNum} 0 R ` +
        `/Pg ${pageNum} 0 R /K ${mk.mcid}` +
        (alt ? ` /Alt (${esc(alt.text)})` : '') +
        ` >>`,
    });
    addedRefs.push(`${num} 0 R`);
    while (items.length <= mk.mcid) items.push('null');
    items[mk.mcid] = `${num} 0 R`;
  }

  for (const a of altText) {
    if (uniq.some((m) => m.mcid === a.mcid)) continue;
    const entry = items[a.mcid];
    const m = entry && entry.match(/(\d+)\s+0\s+R/);
    if (!m) continue;
    const elemNum = parseInt(m[1], 10);
    const elem = objBody(elemNum);
    if (!elem) continue;
    let body = elem.body;
    body = /\/Alt\s*\([^)]*\)/.test(body)
      ? body.replace(/\/Alt\s*\([^)]*\)/, `/Alt (${esc(a.text)})`)
      : body.replace(/>>\s*$/, `/Alt (${esc(a.text)}) >>`);
    updated.set(elemNum, body);
  }

  if (addedRefs.length) {
    let pb = parent.body;
    const kArr = pb.match(/\/K\s*\[([\s\S]*?)\]/);
    if (kArr) {
      pb = pb.replace(kArr[0], `/K [${kArr[1]} ${addedRefs.join(' ')}]`);
    } else {
      const kOne = pb.match(/\/K\s+((?:\d+\s+\d+\s+R)|\d+)/);
      if (!kOne) return bytes;
      pb = pb.replace(kOne[0], `/K [${kOne[1]} ${addedRefs.join(' ')}]`);
    }
    updated.set(parentNum, pb);
    updated.set(ptArrayNum, `[ ${items.join(' ')} ]`);
  }

  if (!newObjs.length && !updated.size) return bytes;

  let out = src;
  if (!out.endsWith('\n')) out += '\n';
  const offsets = new Map();
  const emit = (num, body) => {
    offsets.set(num, out.length);
    out += `${num} 0 obj\n${body.trim()}\nendobj\n`;
  };
  for (const [num, body] of updated) emit(num, body);
  for (const o of newObjs) emit(o.num, o.body);

  const xrefAt = out.length;
  const nums = [...offsets.keys()].sort((a, b) => a - b);
  let xref = 'xref\n';
  for (let i = 0; i < nums.length; ) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    xref += `${nums[i]} ${j - i + 1}\n`;
    for (let k = i; k <= j; k++) {
      xref += String(offsets.get(nums[k])).padStart(10, '0') + ' 00000 n \n';
    }
    i = j + 1;
  }
  out += xref;
  const infoNum = tref('Info');
  out +=
    `trailer\n<< /Size ${next} /Root ${rootNum} 0 R` +
    (infoNum >= 0 ? ` /Info ${infoNum} 0 R` : '') +
    ` /Prev ${sxNum} >>\nstartxref\n${xrefAt}\n%%EOF\n`;

  const u8 = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) u8[i] = out.charCodeAt(i) & 0xff;
  return u8;
}
