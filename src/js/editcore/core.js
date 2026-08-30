import { createEngineModule, ENGINE_BUILD } from './engine-loader.js';

export const EC_BUILD = ENGINE_BUILD;
const createEditCore = createEngineModule;
const devBust = '';

import { applyType3LeftoverSurgery } from './type3surgery.js';
import { probePdfBytes } from './shadingsurgery.js';

const RUN_SIZE = 60;
const FMT_SIZE = 36;

export const OBJ = {
  UNKNOWN: 0,
  TEXT: 1,
  PATH: 2,
  IMAGE: 3,
  SHADING: 4,
  FORM: 5,
};

const sfntCoverMemo = new WeakMap();

export function sfntCovers(bytes, cps) {
  let per = sfntCoverMemo.get(bytes);
  if (!per) {
    per = new Map();
    sfntCoverMemo.set(bytes, per);
  }
  const key = cps.length ? cps.join(',') : '';
  const hit = per.get(key);
  if (hit !== undefined) return hit;
  const computed = sfntCoversUncached(bytes, cps);
  if (per.size < 512) per.set(key, computed);
  return computed;
}

function sfntCoversUncached(bytes, cps) {
  try {
    const u16 = (o) => (bytes[o] << 8) | bytes[o + 1];
    const u32 = (o) =>
      ((bytes[o] << 24) |
        (bytes[o + 1] << 16) |
        (bytes[o + 2] << 8) |
        bytes[o + 3]) >>>
      0;
    let base = 0;
    if (u32(0) === 0x74746366) base = u32(12);
    const num = u16(base + 4);
    let cmap = 0;
    for (let i = 0; i < num; i++) {
      const o = base + 12 + i * 16;
      if (u32(o) === 0x636d6170) {
        cmap = u32(o + 8);
        break;
      }
    }
    if (!cmap) return false;
    const nt = u16(cmap + 2);
    let sub = 0,
      fmt = -1,
      score = -1;
    for (let i = 0; i < nt; i++) {
      const rec = cmap + 4 + i * 8;
      const pid = u16(rec),
        eid = u16(rec + 2),
        off = cmap + u32(rec + 4);
      const f = u16(off);
      const sc =
        pid === 3 && eid === 10
          ? 3
          : pid === 3 && eid === 1
            ? 2
            : pid === 0
              ? 1
              : 0;
      if (sc > score && (f === 4 || f === 12)) {
        score = sc;
        sub = off;
        fmt = f;
      }
    }
    if (!sub) return false;
    const lookup4 = (cp) => {
      if (cp > 0xffff) return 0;
      const segX2 = u16(sub + 6);
      for (let s2 = 0; s2 < segX2; s2 += 2) {
        const end = u16(sub + 14 + s2);
        if (cp <= end) {
          const start = u16(sub + 16 + segX2 + s2);
          if (cp < start) return 0;
          const delta = u16(sub + 16 + segX2 * 2 + s2);
          const roBase = sub + 16 + segX2 * 3 + s2;
          const ro = u16(roBase);
          if (!ro) return (cp + delta) & 0xffff;
          const g = u16(roBase + ro + (cp - start) * 2);
          return g ? (g + delta) & 0xffff : 0;
        }
      }
      return 0;
    };
    const lookup12 = (cp) => {
      const n = u32(sub + 12);
      let lo = 0,
        hi = n - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1,
          g = sub + 16 + mid * 12;
        const s0 = u32(g),
          e0 = u32(g + 4);
        if (cp < s0) hi = mid - 1;
        else if (cp > e0) lo = mid + 1;
        else return u32(g + 8) + (cp - s0);
      }
      return 0;
    };
    for (const cp of cps) {
      if (cp === 0x20 || cp === 0x0a || cp === 0x0d) continue;
      if ((fmt === 12 ? lookup12(cp) : lookup4(cp)) === 0) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function scriptFallbackFamilies(cps) {
  const TABLE = [
    [
      [
        [0x0600, 0x06ff],
        [0x0750, 0x077f],
        [0xfb50, 0xfdff],
        [0xfe70, 0xfeff],
      ],
      [
        'Geeza Pro',
        'Al Nile',
        'Damascus',
        'Baghdad',
        'Noto Naskh Arabic',
        'Noto Sans Arabic',
        'Arial Unicode MS',
        'Arial',
      ],
    ],
    [
      [
        [0x0590, 0x05ff],
        [0xfb1d, 0xfb4f],
      ],
      [
        'Arial Hebrew',
        'Lucida Grande',
        'Noto Sans Hebrew',
        'Arial Unicode MS',
        'Arial',
      ],
    ],
    [
      [[0x0900, 0x097f]],
      [
        'Kohinoor Devanagari',
        'Devanagari MT',
        'ITF Devanagari',
        'Nirmala UI',
        'Mangal',
        'Noto Sans Devanagari',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0980, 0x09ff]],
      [
        'Kohinoor Bangla',
        'Bangla MN',
        'Nirmala UI',
        'Vrinda',
        'Noto Sans Bengali',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0a00, 0x0a7f]],
      [
        'Gurmukhi MN',
        'Nirmala UI',
        'Raavi',
        'Noto Sans Gurmukhi',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0a80, 0x0aff]],
      [
        'Kohinoor Gujarati',
        'Gujarati MT',
        'Nirmala UI',
        'Shruti',
        'Noto Sans Gujarati',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0b80, 0x0bff]],
      [
        'Tamil MN',
        'InaiMathi',
        'Nirmala UI',
        'Latha',
        'Noto Sans Tamil',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0c00, 0x0c7f]],
      [
        'Kohinoor Telugu',
        'Telugu MN',
        'Nirmala UI',
        'Gautami',
        'Noto Sans Telugu',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0c80, 0x0cff]],
      [
        'Kannada MN',
        'Nirmala UI',
        'Tunga',
        'Noto Sans Kannada',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0d00, 0x0d7f]],
      [
        'Malayalam MN',
        'Nirmala UI',
        'Kartika',
        'Noto Sans Malayalam',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0e00, 0x0e7f]],
      [
        'Thonburi',
        'Sukhumvit Set',
        'Leelawadee UI',
        'Tahoma',
        'Noto Sans Thai',
        'Arial Unicode MS',
      ],
    ],
    [
      [
        [0x3040, 0x30ff],
        [0x3400, 0x9fff],
        [0xf900, 0xfaff],
      ],
      [
        'PingFang SC',
        'Hiragino Sans',
        'Hiragino Sans GB',
        'Songti SC',
        'STHeiti',
        'Apple SD Gothic Neo',
        'Microsoft YaHei',
        'Yu Gothic',
        'Meiryo',
        'SimSun',
        'MS Gothic',
        'Malgun Gothic',
        'Noto Sans CJK SC',
        'Noto Sans SC',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0xac00, 0xd7af]],
      [
        'Apple SD Gothic Neo',
        'AppleGothic',
        'Malgun Gothic',
        'Batang',
        'Noto Sans KR',
        'Noto Sans CJK KR',
        'Arial Unicode MS',
      ],
    ],
    [
      [[0x0b00, 0x0b7f]],
      ['Oriya MN', 'Nirmala UI', 'Kalinga', 'Noto Sans Oriya'],
    ],
    [
      [[0x0d80, 0x0dff]],
      ['Sinhala MN', 'Nirmala UI', 'Iskoola Pota', 'Noto Sans Sinhala'],
    ],
    [
      [[0x0e80, 0x0eff]],
      ['Lao MN', 'Lao Sangam MN', 'Leelawadee UI', 'Noto Sans Lao'],
    ],
    [
      [[0x1000, 0x109f]],
      ['Myanmar MN', 'Myanmar Sangam MN', 'Myanmar Text', 'Noto Sans Myanmar'],
    ],
    [
      [[0x1780, 0x17ff]],
      ['Khmer MN', 'Khmer Sangam MN', 'Leelawadee UI', 'Noto Sans Khmer'],
    ],
    [
      [[0x0530, 0x058f]],
      ['Mshtakan', 'Sylfaen', 'Noto Sans Armenian', 'Arial Unicode MS'],
    ],
    [[[0x10a0, 0x10ff]], ['Noto Sans Georgian', 'Sylfaen', 'Arial Unicode MS']],
    [[[0x1200, 0x137f]], ['Kefa', 'Nyala', 'Noto Sans Ethiopic']],
    [
      [[0x0f00, 0x0fff]],
      ['Kailasa', 'Microsoft Himalaya', 'Noto Sans Tibetan'],
    ],
    [[[0x13a0, 0x13ff]], ['Plantagenet Cherokee', 'Noto Sans Cherokee']],
    [[[0x0700, 0x074f]], ['Noto Sans Syriac', 'Estrangelo Edessa']],
    [[[0x0780, 0x07bf]], ['Noto Sans Thaana', 'MV Boli']],
  ];
  const out = [];
  for (const cp of cps) {
    for (const [ranges, fams] of TABLE) {
      if (ranges.some(([a, b]) => cp >= a && cp <= b))
        for (const f of fams) if (!out.includes(f)) out.push(f);
    }
  }
  return out;
}

const PAGE_CACHE_MAX = 6;

export class PdfEngine {
  static localFonts = new Map();

  constructor(module) {
    this.M = module;
    this.doc = 0;
    this.page = 0;
    this.session = 0;
    this.pageIndex = 0;
    this.pageCount = 0;
    this.pageWidth = 0;
    this.pageHeight = 0;
    this._docBuf = 0;
    this._providerPtr = 0;
  }

  _makeProvider() {
    const M = this.M;
    const norm = (s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .replace(/(psmt|mt|ps)$/, '');
    const normLookup = (fam, styleKey, want) => {
      const target = norm(fam);
      if (!target) return null;
      let anyStyle = null;
      for (const [k, b] of PdfEngine.localFonts) {
        if (!b || !b.length) continue;
        const bar = k.indexOf('|');
        const kf = bar < 0 ? k : k.slice(0, bar);
        if (norm(kf) !== target) continue;
        if (want.length && !sfntCovers(b, want)) continue;
        const ks = bar < 0 ? '' : k.slice(bar + 1);
        if (ks === styleKey) return b;
        if (!anyStyle) anyStyle = b;
      }
      return anyStyle;
    };
    return M.addFunction(
      (ctx, familyPtr, bold, italic, cps, n, outData, outSize) => {
        let fam = M.UTF8ToString(familyPtr);
        fam = fam.replace(/ (serif|mono)$/, '');
        const want = [];
        for (let i = 0; i < n; i++) want.push(M.HEAPU32[(cps >> 2) + i]);
        const styleKey = (bold ? 1 : 0) + '' + (italic ? 1 : 0);
        const sk = '|' + styleKey;
        const names = [fam, ...scriptFallbackFamilies(want)];
        let bytes = null;
        for (const nm of names) {
          for (const k of [nm + sk, nm]) {
            const b = PdfEngine.localFonts.get(k);
            if (b && b.length && (!want.length || sfntCovers(b, want))) {
              bytes = b;
              break;
            }
          }
          if (bytes) break;
        }
        if (!bytes) bytes = normLookup(fam, styleKey, want);
        if (!bytes || !bytes.length) return 0;
        const buf = M._ec_buffer_alloc(bytes.length);
        if (!buf) return 0;
        M.HEAPU8.set(bytes, buf);
        M.HEAPU32[outData >> 2] = buf;
        M.HEAPU32[outSize >> 2] = bytes.length;
        return 1;
      },
      'iiiiiiiii'
    );
  }

  static async create() {
    const M = await createEditCore(
      devBust
        ? {
            locateFile: (f, prefix) => `${prefix}${f}?v=${devBust}`,
          }
        : undefined
    );
    const cfg = M._malloc(48);
    M.HEAPU8.fill(0, cfg, cfg + 48);
    M.HEAPU32[cfg >> 2] = 2;
    M._FPDF_InitLibraryWithConfig(cfg);
    M._free(cfg);
    return new PdfEngine(M);
  }

  static disambiguateSubsetFonts(bytes) {
    const probe = probePdfBytes(bytes);
    if (!probe.subsetFont || !probe.form) return bytes;
    const s = new TextDecoder('latin1').decode(bytes);
    const fonts = [];
    for (const m of s.matchAll(/(\d+)\s+0\s+obj\b/g)) {
      const end = s.indexOf('endobj', m.index);
      if (end < 0) continue;
      const body = s.slice(m.index, end);
      if (!/\/Type\s*\/Font\b/.test(body)) continue;
      const bf = body.match(/\/BaseFont\s*\/([A-Z]{6})\+([^\s/\[\]<>()]+)/);
      if (!bf) continue;
      const fd = body.match(/\/FontDescriptor\s+(\d+)\s+0\s+R/);
      fonts.push({
        obj: Number(m[1]),
        tagAt: m.index + bf.index + bf[0].indexOf(bf[1]),
        tag: bf[1],
        name: bf[2],
        desc: fd ? Number(fd[1]) : 0,
      });
    }
    if (!fonts.length) return bytes;
    const containerFonts = new Set();
    for (const m of s.matchAll(/(\d+)\s+0\s+obj\b/g)) {
      const end = s.indexOf('endobj', m.index);
      if (end < 0) continue;
      const body = s.slice(m.index, end);
      if (!/\/Subtype\s*\/Form\b/.test(body)) continue;
      const fi = body.indexOf('/Font');
      if (fi < 0) continue;
      for (const r of body.slice(fi, fi + 800).matchAll(/(\d+)\s+0\s+R/g))
        containerFonts.add(Number(r[1]));
    }
    if (!containerFonts.size) return bytes;
    const groups = new Map();
    for (const f of fonts) {
      const k = f.tag + '+' + f.name;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(f);
    }
    const taken = new Set(fonts.map((f) => f.tag));
    const tagFor = (n) => {
      let t = '';
      for (let i = 0; i < 6; i++) {
        t = String.fromCharCode(65 + (n % 26)) + t;
        n = Math.floor(n / 26);
      }
      return t;
    };
    let seq = 0;
    const nextTag = () => {
      let t;
      do {
        t = tagFor(seq++);
      } while (taken.has(t));
      taken.add(t);
      return t;
    };
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const faces = new Set(fonts.map((f) => f.name));
    const edits = [];
    for (const [, list] of groups) {
      if (list.length < 2) continue;
      if (
        !list.some((f) => containerFonts.has(f.obj)) ||
        !list.some((f) => !containerFonts.has(f.obj))
      )
        continue;
      for (const f of list) {
        if (!containerFonts.has(f.obj) || !f.name.length) continue;
        let face = null;
        for (let c = 0; c < 26 && !face; c++) {
          const cand = f.name.slice(0, -1) + String.fromCharCode(65 + c);
          if (!faces.has(cand)) face = cand;
        }
        if (!face) continue;
        faces.add(face);
        const tag = nextTag(),
          lastCh = face[face.length - 1];
        edits.push([f.tagAt, tag], [f.tagAt + 7 + f.name.length - 1, lastCh]);
        if (!f.desc) continue;
        const dm = s.match(
          new RegExp('(?:^|[^0-9])(' + f.desc + '\\s+0\\s+obj\\b)')
        );
        if (!dm) continue;
        const dAt = dm.index + dm[0].indexOf(dm[1]);
        const dEnd = s.indexOf('endobj', dAt);
        const dBody = s.slice(dAt, dEnd < 0 ? undefined : dEnd);
        const fn = dBody.match(
          new RegExp('/FontName\\s*/(' + f.tag + ')\\+' + esc(f.name))
        );
        if (!fn) continue;
        const at = dAt + fn.index + fn[0].indexOf(fn[1]);
        edits.push([at, tag], [at + 7 + f.name.length - 1, lastCh]);
      }
    }
    if (!edits.length) return bytes;
    const out = new Uint8Array(bytes);
    for (const [at, text] of edits) {
      for (let i = 0; i < text.length; i++) out[at + i] = text.charCodeAt(i);
    }
    return out;
  }

  open(bytes, password, _reentrant) {
    bytes = PdfEngine.disambiguateSubsetFonts(bytes);
    this._originalBytes = bytes;
    this.close();
    const M = this.M;
    const buf = M._malloc(bytes.length);
    M.HEAPU8.set(bytes, buf);
    let pw = 0;
    if (password) {
      const n = M.lengthBytesUTF8(password) + 1;
      pw = M._malloc(n);
      M.stringToUTF8(password, pw, n);
    }
    const doc = M._FPDF_LoadMemDocument64(buf, bytes.length, pw);
    if (pw) M._free(pw);
    if (!doc) {
      const err = M._FPDF_GetLastError ? M._FPDF_GetLastError() : -1;
      M._free(buf);
      this.lastOpenError = err;
      const e = new Error(
        err === 4
          ? 'This PDF is password-protected.'
          : 'This file could not be opened as a PDF.'
      );
      e.passwordRequired = err === 4;
      throw e;
    }
    this._docBuf = buf;
    this.doc = doc;
    if (!this._providerPtr) this._providerPtr = this._makeProvider();
    this.session = M._ec_session_create(doc, this._providerPtr, 0);
    if (M._ec_set_flatten_forms) {
      const usesPattern = probePdfBytes(bytes).pattern;
      this._usesPattern = usesPattern;
      M._ec_set_flatten_forms(this.session, usesPattern ? 0 : 1);
    }
    this.pageCount = M._FPDF_GetPageCount(doc);
    this._normalized = new Set();
    this._reencoded = new Set();
    this._regenHostile = new Set();
    this._editedPages = new Set();
    this._t3seg = null;
    this._t3state = {};
    this._t3anchors = {};
    this._fragilePages = null;
    this.loadPage(0);

    if (!_reentrant) {
      const info = this.documentInfo();
      this.security = info;
      this._encrypted = !!info.encrypted && !info.signatures;
    }
  }

  reopen(bytes, pageIndex) {
    const keep = this.pageIndex;
    const orig = this._originalBytes;
    const edited = this._editedPages;
    const t3seg = this._t3seg;
    const fragile = this._fragilePages;
    this._splicePlans = null;
    this._spliceOk = false;
    this.open(bytes);
    if (orig) this._originalBytes = orig;
    if (edited) this._editedPages = edited;
    if (fragile) this.setFragilePages([...fragile]);
    if (t3seg) this._t3seg = t3seg;
    this.loadPage(Math.min(pageIndex ?? keep, this.pageCount - 1));
  }

  setType3Seg(seg) {
    if (seg && Object.keys(seg).length) this._t3seg = seg;
  }

  _t3readState() {
    const ptr = this.M._ec_page_text_state(this.session, this.page);
    if (!ptr) return null;
    let st = null;
    try {
      st = JSON.parse(this.M.UTF8ToString(ptr));
    } catch {}
    this.M._ec_string_free(ptr);
    return st;
  }

  _t3anchor(st) {
    const seg = this._t3seg?.[this.pageIndex];
    if (!seg || !st) return;
    const anchors = ((this._t3anchors ||= {})[this.pageIndex] ||= {});
    for (const o of st) {
      if (!o.t3 || !o.glyphs || !o.glyphs.length) continue;
      if (anchors[o.font] != null) continue;
      const oCodes = o.glyphs.map((g) => g[0]);
      const hit = seg.tjs.find(
        (tj) =>
          Math.abs(tj.e - o.m[4]) < 0.05 &&
          Math.abs(tj.f - o.m[5]) < 0.05 &&
          tj.codes.length >= oCodes.length &&
          oCodes.every((c, k) => c === tj.codes[k])
      );
      if (hit) anchors[o.font] = hit.font;
    }
  }

  close() {
    const M = this.M;
    if (this._pageCache) {
      for (const [, handle] of this._pageCache)
        if (handle && handle !== this.page) M._FPDF_ClosePage(handle);
      this._pageCache.clear();
    }
    if (this.page) M._FPDF_ClosePage(this.page);
    if (this.session) M._ec_session_destroy(this.session);
    if (this.doc) M._FPDF_CloseDocument(this.doc);
    if (this._docBuf) M._free(this._docBuf);
    this.page = this.session = this.doc = this._docBuf = 0;
  }

  loadPage(index) {
    const M = this.M;
    this.renderParagraphLiveEnd();
    if (this.page && this._pageDirty) this.generateContent();
    const cache = (this._pageCache ||= new Map());
    if (this.page) cache.set(this.pageIndex, this.page);
    let handle = cache.get(index);
    if (handle) cache.delete(index);
    else handle = M._FPDF_LoadPage(this.doc, index);
    cache.set(index, handle);
    this.page = handle;
    while (cache.size > PAGE_CACHE_MAX) {
      let victim = null;
      for (const key of cache.keys()) {
        if (key === index || this.pinnedPages?.has(key)) continue;
        victim = key;
        break;
      }
      if (victim === null) break;
      const dead = cache.get(victim);
      cache.delete(victim);
      if (dead) {
        this.M._ec_history_drop_page?.(this.session, dead);
        M._FPDF_ClosePage(dead);
      }
      this.onPageEvicted?.(victim);
    }
    this.pageIndex = index;
    this._pageDirty = false;
    this.pageWidth = M._FPDF_GetPageWidthF(this.page);
    this.pageHeight = M._FPDF_GetPageHeightF(this.page);
    if (this._fragilePages?.has(index)) {
      M._ec_mark_fonts_fragile(this.session, this.page);
    }
    this._readPageTransform();
  }

  setFragilePages(pages) {
    this._fragilePages = new Set(pages || []);
    if (this.page && this._fragilePages.has(this.pageIndex)) {
      this.M._ec_mark_fonts_fragile(this.session, this.page);
    }
  }

  pageWasNormalized() {
    return !!this._reencoded?.has(this.pageIndex);
  }

  normalizeFontsForEdit() {
    if (!this.session || this._normalized?.has(this.pageIndex)) return;
    (this._normalized ||= new Set()).add(this.pageIndex);
    const lossy = this.M._ec_page_regen_is_lossy(
      this.session,
      this.page,
      this.pageIndex
    );
    if (lossy === 2) {
      (this._regenHostile ||= new Set()).add(this.pageIndex);
      return 0;
    }
    if (lossy === 3) {
      return 0;
    }
    if (lossy) {
      const rebuilt = this.M._ec_reencode_page_fonts(this.session, this.page);
      this._pageDirty = true;
      if (rebuilt > 0) (this._reencoded ||= new Set()).add(this.pageIndex);
      return rebuilt;
    }
    return 0;
  }

  pageRegenHostile() {
    return !!this._regenHostile?.has(this.pageIndex);
  }

  documentInfo() {
    const M = this.M;
    const ptr = M._ec_document_info(this.doc);
    if (!ptr) return { pages: 0, signatures: 0 };
    const j = M.UTF8ToString(ptr);
    M._ec_string_free(ptr);
    return JSON.parse(j);
  }

  metaText(tag) {
    const M = this.M;
    const kp = M._malloc(tag.length + 1);
    for (let i = 0; i < tag.length; i++) M.HEAPU8[kp + i] = tag.charCodeAt(i);
    M.HEAPU8[kp + tag.length] = 0;
    const n = M._FPDF_GetMetaText(this.doc, kp, 0, 0);
    let out = '';
    if (n > 2) {
      const bp = M._malloc(n);
      M._FPDF_GetMetaText(this.doc, kp, bp, n);
      const chars = [];
      for (let i = 0; i + 1 < n - 1; i += 2)
        chars.push(M.HEAPU8[bp + i] | (M.HEAPU8[bp + i + 1] << 8));
      out = String.fromCharCode(...chars);
      M._free(bp);
    }
    M._free(kp);
    return out;
  }

  static sniffPdfA(bytes) {
    const probe = 'pdfaid:part';
    const limit = Math.min(bytes.length, 4 << 20);
    outer: for (let i = 0; i + probe.length < limit; i++) {
      if (bytes[i] !== 112) continue;
      for (let j = 0; j < probe.length; j++) {
        if (bytes[i + j] !== probe.charCodeAt(j)) continue outer;
      }
      return true;
    }
    return false;
  }

  buildModel() {
    const M = this.M;
    if (this._pageStale) {
      this.renderParagraphLiveEnd();
      if (this._pageDirty) this.generateContent();
      M._FPDF_ClosePage(this.page);
      this.page = M._FPDF_LoadPage(this.doc, this.pageIndex);
      this._pageCache?.set(this.pageIndex, this.page);
      this.onPageEvicted?.(this.pageIndex);
      this._pageStale = false;
      this._pageDirty = false;
    }
    if (this._t3seg && this._t3seg[this.pageIndex]) {
      const st = this._t3readState();
      if (st) this._t3anchor(st);
    }
    const ptr = M._ec_build_page_model(this.session, this.page);
    if (!ptr) return [];
    const json = M.UTF8ToString(ptr);
    M._ec_string_free(ptr);
    this._readPageTransform();
    return JSON.parse(json).paragraphs;
  }

  _readPageTransform() {
    const M = this.M;
    if (!this.session || !this.page) return;
    const cp = M._malloc(24);
    M._ec_page_transform(this.session, this.page, cp);
    this.pageT = Array.from(
      { length: 6 },
      (_, i) => M.HEAPF32[(cp + i * 4) >> 2]
    );
    M._free(cp);
    this.cropX = -this.pageT[4];
    this.cropY = -this.pageT[5];
  }

  toModel(x, y) {
    const t = this.pageT || [1, 0, 0, 1, 0, 0];
    return { x: t[0] * x + t[2] * y + t[4], y: t[1] * x + t[3] * y + t[5] };
  }
  toUser(x, y) {
    const t = this.pageT || [1, 0, 0, 1, 0, 0];
    const det = t[0] * t[3] - t[1] * t[2] || 1;
    const dx = x - t[4],
      dy = y - t[5];
    return {
      x: (t[3] * dx - t[2] * dy) / det,
      y: (-t[1] * dx + t[0] * dy) / det,
    };
  }

  _allocStr(s) {
    const M = this.M;
    const n = M.lengthBytesUTF8(s || '') + 1;
    const p = M._malloc(n);
    M.stringToUTF8(s || '', p, n);
    return p;
  }

  _writeRuns(runs) {
    const M = this.M;
    const arr = M._malloc(RUN_SIZE * runs.length);
    const strs = [];
    runs.forEach((r, i) => {
      const b = arr + i * RUN_SIZE;
      const tp = this._allocStr(r.text);
      const fp = this._allocStr(r.family || '');
      strs.push(tp, fp);
      M.HEAPU32[(b + 0) >> 2] = tp;
      M.HEAPU32[(b + 4) >> 2] = fp;
      M.HEAP32[(b + 8) >> 2] = r.bold === 2 ? 2 : r.bold ? 1 : 0;
      M.HEAP32[(b + 12) >> 2] = r.italic === 2 ? 2 : r.italic ? 1 : 0;
      M.HEAPF32[(b + 16) >> 2] = r.size;
      M.HEAPU32[(b + 20) >> 2] = r.rgba >>> 0;
      M.HEAP32[(b + 24) >> 2] = r.underline ? 1 : 0;
      M.HEAP32[(b + 28) >> 2] = r.strike ? 1 : 0;
      M.HEAP32[(b + 32) >> 2] = r.script | 0;
      M.HEAP32[(b + 36) >> 2] = r.sourceIndex == null ? -1 : r.sourceIndex;
      M.HEAP32[(b + 40) >> 2] = r.renderMode | 0;
      M.HEAPU32[(b + 44) >> 2] = (r.strokeRgba || 0) >>> 0;
      M.HEAPF32[(b + 48) >> 2] = r.strokeWidth || 1;
      M.HEAPF32[(b + 52) >> 2] = r.hScale || 1;
      M.HEAPF32[(b + 56) >> 2] = r.rise || 0;
    });
    return { arr, strs, count: runs.length };
  }

  _writeFmt(fmt) {
    const M = this.M;
    const p = M._malloc(FMT_SIZE);
    M.HEAP32[(p + 0) >> 2] = fmt.align | 0;
    M.HEAPF32[(p + 4) >> 2] = fmt.lineSpacing;
    M.HEAPF32[(p + 8) >> 2] = fmt.charSpacing || 0;
    M.HEAPF32[(p + 12) >> 2] = fmt.paraSpacing || 0;
    M.HEAPF32[(p + 16) >> 2] = fmt.wordSpacing || 0;
    M.HEAPF32[(p + 20) >> 2] = fmt.firstIndent || 0;
    M.HEAPF32[(p + 24) >> 2] = fmt.hangIndent || 0;
    M.HEAP32[(p + 28) >> 2] = fmt.dir | 0;
    M.HEAP32[(p + 32) >> 2] = fmt.listLevel | 0;
    return p;
  }

  _free(alloc) {
    for (const s of alloc.strs) this.M._free(s);
    this.M._free(alloc.arr);
  }

  _decode(ptr) {
    if (!ptr) return null;
    const j = this.M.UTF8ToString(ptr);
    this.M._ec_string_free(ptr);
    return JSON.parse(j);
  }

  previewParagraph(id, runs, fmt) {
    const a = this._writeRuns(runs);
    const f = this._writeFmt(fmt);
    const ptr = this.M._ec_preview_paragraph(
      this.session,
      this.page,
      id,
      a.arr,
      a.count,
      f
    );
    this._free(a);
    this.M._free(f);
    if (!ptr) return null;
    const json = this.M.UTF8ToString(ptr);
    this.M._ec_string_free(ptr);
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  commitParagraph(id, runs, fmt) {
    this._pageDirty = true;
    const a = this._writeRuns(runs);
    const f = this._writeFmt(fmt);
    const out = this._decode(
      this.M._ec_commit_paragraph(
        this.session,
        this.page,
        id,
        a.arr,
        a.count,
        f
      )
    );
    this._free(a);
    this.M._free(f);
    return out;
  }

  renderParagraphLive(id, runs, fmt, scale, mx, my, mw, mh) {
    const M = this.M;
    const a = this._writeRuns(runs);
    const f = this._writeFmt(fmt);
    const wp = M._malloc(8);
    M.HEAP32[wp >> 2] = 0;
    M.HEAP32[(wp + 4) >> 2] = 0;
    const ptr = M._ec_render_paragraph_live(
      this.session,
      this.page,
      id,
      a.arr,
      a.count,
      f,
      scale,
      mx,
      my,
      mw,
      mh,
      wp,
      wp + 4
    );
    const w = M.HEAP32[wp >> 2],
      h = M.HEAP32[(wp + 4) >> 2];
    M._free(wp);
    this._free(a);
    M._free(f);
    if (!ptr || !w || !h) return null;
    const data = new Uint8ClampedArray(M.HEAPU8.subarray(ptr, ptr + w * h * 4));
    M._ec_string_free(ptr);
    return { width: w, height: h, data };
  }

  renderPageRegion(fullW, fullH, px, py, pw, ph) {
    const M = this.M;
    const FPDFBitmap_BGRA = 4;
    const bmp = M._FPDFBitmap_CreateEx(pw, ph, FPDFBitmap_BGRA, 0, 0);
    if (!bmp) return null;
    M._FPDFBitmap_FillRect(bmp, 0, 0, pw, ph, 0xffffffff);
    const FPDF_ANNOT = 0x01,
      FPDF_LCD_TEXT = 0x02,
      FPDF_REVERSE_BYTE_ORDER = 0x10;
    const FLAGS = FPDF_ANNOT | FPDF_LCD_TEXT | FPDF_REVERSE_BYTE_ORDER;
    M._FPDF_RenderPageBitmap(bmp, this.page, -px, -py, fullW, fullH, 0, FLAGS);
    M._ec_form_draw(
      this.session,
      this.page,
      bmp,
      -px,
      -py,
      fullW,
      fullH,
      0,
      FLAGS
    );
    const buf = M._FPDFBitmap_GetBuffer(bmp);
    const stride = M._FPDFBitmap_GetStride(bmp);
    const out = new Uint8ClampedArray(pw * ph * 4);
    if (stride === pw * 4) {
      out.set(M.HEAPU8.subarray(buf, buf + pw * ph * 4));
    } else {
      for (let y = 0; y < ph; y++) {
        out.set(
          M.HEAPU8.subarray(buf + y * stride, buf + y * stride + pw * 4),
          y * pw * 4
        );
      }
    }
    M._FPDFBitmap_Destroy(bmp);
    return { width: pw, height: ph, data: out };
  }

  addParagraph(x, yTop, width, runs, fmt) {
    this._pageDirty = true;
    const a = this._writeRuns(runs);
    const f = this._writeFmt(fmt);
    const out = this._decode(
      this.M._ec_add_paragraph(
        this.session,
        this.page,
        x,
        yTop,
        width,
        a.arr,
        a.count,
        f
      )
    );
    this._free(a);
    this.M._free(f);
    return out;
  }

  synthRunFont(paraId, runIndex) {
    const M = this.M;
    const sp = M._malloc(4);
    M.HEAPU32[sp >> 2] = 0;
    const ptr = M._ec_synth_run_font(
      this.session,
      this.page,
      paraId,
      runIndex,
      sp
    );
    const size = M.HEAPU32[sp >> 2];
    M._free(sp);
    if (!ptr || !size) return null;
    if (size === 1) {
      const flag = M.HEAPU8[ptr];
      M._ec_string_free(ptr);
      return flag === 0xdd ? 'dishonest' : null;
    }
    const bytes = M.HEAPU8.slice(ptr, ptr + size);
    M._ec_string_free(ptr);
    return bytes;
  }

  duplicateParagraph(id, dx, dy) {
    this._pageDirty = true;
    return this._decode(
      this.M._ec_duplicate_paragraph(this.session, this.page, id, dx, dy)
    );
  }

  cloneMarker(srcId, dstId) {
    this._pageDirty = true;
    return this.M._ec_clone_marker(this.session, this.page, srcId, dstId) !== 0;
  }

  moveParagraph(id, dx, dy) {
    this._pageDirty = true;
    return this.M._ec_move_paragraph(this.session, this.page, id, dx, dy) !== 0;
  }

  resizeParagraph(id, width) {
    this._pageDirty = true;
    return this._decode(
      this.M._ec_resize_paragraph(this.session, this.page, id, width)
    );
  }

  historyBeginStep(label) {
    const M = this.M;
    const lbl = this._allocStr(label || 'edit');
    M._ec_history_begin(this.session, this.page, lbl);
    M._free(lbl);
  }
  historyEndStep() {
    const before = this.M._ec_history_depth(this.session, 0);
    this.M._ec_history_end(this.session, this.page);
    if (this._spliceOk === false) return;
    if (this.M._ec_history_depth(this.session, 0) <= before) return;
    const plan = this.lastSplicePlan();
    if (plan) (this._splicePlans ||= []).push({ page: this.pageIndex, plan });
    else this._spliceOk = false;
  }
  lastSplicePlan() {
    const ptr = this.M._ec_last_splice_plan(this.session, this.page);
    if (!ptr) return null;
    const json = this.M.UTF8ToString(ptr);
    this.M._ec_string_free(ptr);
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
  editStep(label, fn) {
    this.historyBeginStep(label);
    try {
      return fn();
    } finally {
      this.historyEndStep();
    }
  }
  historyNoteMatrix(handle) {
    this.M._ec_history_note_matrix(this.session, this.page, handle);
  }
  historyNoteZOrder(handle) {
    this.M._ec_history_note_zorder(this.session, this.page, handle);
  }
  historyNoteInsert(handle) {
    this.M._ec_history_note_insert(this.session, this.page, handle);
  }
  historyRemoveObject(handle) {
    this._pageDirty = true;
    return (
      this.M._ec_history_remove_object(this.session, this.page, handle) !== 0
    );
  }
  historyUndo() {
    this._pageDirty = true;
    const ok = this.M._ec_history_undo(this.session, this.page) !== 0;
    if (ok && this._splicePlans?.length) {
      const last = this._splicePlans[this._splicePlans.length - 1];
      if (last.page === this.pageIndex) this._splicePlans.pop();
      else this._spliceOk = false;
    }
    return ok;
  }
  historyRedo() {
    this._pageDirty = true;
    const ok = this.M._ec_history_redo(this.session, this.page) !== 0;
    if (ok && this._spliceOk !== false) {
      const plan = this.lastSplicePlan();
      if (plan) (this._splicePlans ||= []).push({ page: this.pageIndex, plan });
      else this._spliceOk = false;
    }
    return ok;
  }
  historyDepth() {
    return {
      undo: this.M._ec_history_depth(this.session, 0),
      redo: this.M._ec_history_depth(this.session, 1),
    };
  }
  historyClear() {
    this.M._ec_history_clear(this.session);
  }

  spellLoad(bytes) {
    const M = this.M;
    const buf = M._malloc(bytes.length);
    M.HEAPU8.set(bytes, buf);
    const n = M._ec_spell_load(this.session, buf, bytes.length);
    M._free(buf);
    return n;
  }
  spellCheckPage() {
    const M = this.M;
    const ptr = M._ec_spell_check_page(this.session, this.page);
    if (!ptr) return null;
    const json = M.UTF8ToString(ptr);
    M._ec_string_free(ptr);
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  selectText(x0, y0, x1, y1, mode) {
    const M = this.M;
    const ptr = M._ec_select_text(
      this.session,
      this.page,
      x0,
      y0,
      x1,
      y1,
      mode | 0
    );
    if (!ptr) return null;
    const json = M.UTF8ToString(ptr);
    M._ec_string_free(ptr);
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  pageTextJson() {
    const M = this.M;
    const ptr = M._ec_page_text_json(this.session, this.page);
    if (!ptr) return null;
    const json = M.UTF8ToString(ptr);
    M._ec_string_free(ptr);
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  buildModelInRegion(x, y, w, h) {
    const M = this.M;
    const ptr = M._ec_build_page_model_region(
      this.session,
      this.page,
      x,
      y,
      w,
      h
    );
    if (!ptr) return [];
    const json = M.UTF8ToString(ptr);
    M._ec_string_free(ptr);
    try {
      return JSON.parse(json).paragraphs || [];
    } catch {
      return [];
    }
  }

  deleteParagraph(id) {
    this._pageDirty = true;
    return this.M._ec_delete_paragraph(this.session, this.page, id) !== 0;
  }

  runFontData(paraId, runIndex) {
    const M = this.M;
    const needed = M._ec_get_run_font_data(
      this.session,
      this.page,
      paraId,
      runIndex,
      0,
      0
    );
    if (!needed) return null;
    const buf = M._malloc(needed);
    const written = M._ec_get_run_font_data(
      this.session,
      this.page,
      paraId,
      runIndex,
      buf,
      needed
    );
    const out =
      written > 0
        ? M.HEAPU8.slice(buf, buf + Math.min(needed, written || needed))
        : null;
    M._free(buf);
    return out && out.length ? out : null;
  }

  paragraphObjects(id) {
    const M = this.M;
    const total = M._ec_get_paragraph_objects(
      this.session,
      this.page,
      id,
      0,
      0
    );
    if (total <= 0) return [];
    const out = M._malloc(total * 4);
    M._ec_get_paragraph_objects(this.session, this.page, id, out, total);
    const handles = [];
    for (let i = 0; i < total; i++) handles.push(M.HEAPU32[(out >> 2) + i]);
    M._free(out);
    return handles;
  }

  objectCount() {
    return this.M._FPDFPage_CountObjects(this.page);
  }

  objectAt(index) {
    const M = this.M;
    const h = M._FPDFPage_GetObject(this.page, index);
    if (!h) return null;
    return { handle: h, index, type: M._FPDFPageObj_GetType(h) };
  }

  objectBounds(handle) {
    const b = this._rawBounds(handle);
    if (!b) return null;
    const p0 = this.toModel(b.x, b.y);
    const p1 = this.toModel(b.x + b.w, b.y + b.h);
    return {
      ...b,
      x: Math.min(p0.x, p1.x),
      y: Math.min(p0.y, p1.y),
      w: Math.abs(p1.x - p0.x),
      h: Math.abs(p1.y - p0.y),
    };
  }

  _rawBounds(handle) {
    const M = this.M;
    const p = (this._boundsScratch ||= M._malloc(16));
    const ok = M._FPDFPageObj_GetBounds(handle, p, p + 4, p + 8, p + 12);
    if (!ok) return null;
    const l = M.HEAPF32[p >> 2],
      b = M.HEAPF32[(p + 4) >> 2];
    const r = M.HEAPF32[(p + 8) >> 2],
      t = M.HEAPF32[(p + 12) >> 2];
    return { x: l, y: b, w: r - l, h: t - b };
  }

  deltaToUser(dx, dy) {
    const t = this.pageT || [1, 0, 0, 1, 0, 0];
    const det = t[0] * t[3] - t[1] * t[2] || 1;
    return {
      x: (t[3] * dx - t[2] * dy) / det,
      y: (-t[1] * dx + t[0] * dy) / det,
    };
  }

  translateObject(handle, dx, dy) {
    this._pageDirty = true;
    ({ x: dx, y: dy } = this.deltaToUser(dx, dy));
    const M = this.M;
    const m = M._malloc(24);
    M.HEAPF32[(m + 0) >> 2] = 1;
    M.HEAPF32[(m + 4) >> 2] = 0;
    M.HEAPF32[(m + 8) >> 2] = 0;
    M.HEAPF32[(m + 12) >> 2] = 1;
    M.HEAPF32[(m + 16) >> 2] = dx;
    M.HEAPF32[(m + 20) >> 2] = dy;
    M._FPDFPageObj_TransformClipPath(handle, 1, 0, 0, 1, dx, dy);
    M._FPDFPageObj_TransformF(handle, m);
    M._free(m);
  }

  transformObjectAboutCenter(handle, a, b, c, d) {
    this._pageDirty = true;
    const M = this.M;
    const bounds = this._rawBounds(handle);
    if (!bounds) return;
    const cx = bounds.x + bounds.w / 2,
      cy = bounds.y + bounds.h / 2;
    const e = cx - a * cx - c * cy;
    const f = cy - b * cx - d * cy;
    const m = M._malloc(24);
    M.HEAPF32[(m + 0) >> 2] = a;
    M.HEAPF32[(m + 4) >> 2] = b;
    M.HEAPF32[(m + 8) >> 2] = c;
    M.HEAPF32[(m + 12) >> 2] = d;
    M.HEAPF32[(m + 16) >> 2] = e;
    M.HEAPF32[(m + 20) >> 2] = f;
    M._FPDFPageObj_TransformClipPath(handle, a, b, c, d, e, f);
    M._FPDFPageObj_TransformF(handle, m);
    M._free(m);
  }

  rotateObject(handle, deg) {
    this._pageDirty = true;
    const r = (deg * Math.PI) / 180;
    this.transformObjectAboutCenter(
      handle,
      Math.cos(r),
      Math.sin(r),
      -Math.sin(r),
      Math.cos(r)
    );
  }

  rotateObjectsAbout(handles, deg, cx, cy) {
    ({ x: cx, y: cy } = this.toUser(cx, cy));
    this._pageDirty = true;
    const M = this.M;
    const r = (deg * Math.PI) / 180,
      c = Math.cos(r),
      s = Math.sin(r);
    const m = M._malloc(24);
    M.HEAPF32[(m + 0) >> 2] = c;
    M.HEAPF32[(m + 4) >> 2] = s;
    M.HEAPF32[(m + 8) >> 2] = -s;
    M.HEAPF32[(m + 12) >> 2] = c;
    M.HEAPF32[(m + 16) >> 2] = cx - c * cx + s * cy;
    M.HEAPF32[(m + 20) >> 2] = cy - s * cx - c * cy;
    for (const h of handles) {
      M._FPDFPageObj_TransformClipPath(
        h,
        c,
        s,
        -s,
        c,
        cx - c * cx + s * cy,
        cy - s * cx - c * cy
      );
      M._FPDFPageObj_TransformF(h, m);
    }
    M._free(m);
  }
  flipObject(handle, horizontal) {
    this._pageDirty = true;
    this.transformObjectAboutCenter(
      handle,
      horizontal ? -1 : 1,
      0,
      0,
      horizontal ? 1 : -1
    );
  }

  replaceImage(handle, bgra, width, height) {
    this._pageDirty = true;
    const M = this.M;
    const buf = M._malloc(bgra.length);
    M.HEAPU8.set(bgra, buf);
    const bmp = M._FPDFBitmap_CreateEx(width, height, 4, buf, width * 4);
    let ok = false;
    if (bmp) {
      const pages = M._malloc(4);
      M.HEAP32[pages >> 2] = this.page;
      ok = !!M._FPDFImageObj_SetBitmap(pages, 1, handle, bmp);
      M._free(pages);
      M._FPDFBitmap_Destroy(bmp);
    }
    M._free(buf);
    return ok;
  }

  renderImageObject(handle) {
    const M = this.M;
    const bmp = M._FPDFImageObj_GetRenderedBitmap(this.doc, this.page, handle);
    if (!bmp) return null;
    const w = M._FPDFBitmap_GetWidth(bmp),
      h = M._FPDFBitmap_GetHeight(bmp);
    const stride = M._FPDFBitmap_GetStride(bmp);
    const buf = M._FPDFBitmap_GetBuffer(bmp);
    const out = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const si = buf + y * stride + x * 4,
          di = (y * w + x) * 4;
        out[di] = M.HEAPU8[si + 2];
        out[di + 1] = M.HEAPU8[si + 1];
        out[di + 2] = M.HEAPU8[si];
        out[di + 3] = M.HEAPU8[si + 3];
      }
    }
    M._FPDFBitmap_Destroy(bmp);
    return { data: out, width: w, height: h };
  }

  untaggedMarks() {
    const M = this.M;
    const tree = M._FPDF_StructTree_GetForPage(this.page);
    if (!tree) return [];
    const registered = new Set();
    const walk = (el) => {
      const id = M._FPDF_StructElement_GetMarkedContentID(el);
      if (id >= 0) registered.add(id);
      const n = M._FPDF_StructElement_CountChildren(el);
      for (let i = 0; i < n; i++) {
        const ch = M._FPDF_StructElement_GetChildAtIndex(el, i);
        if (ch) walk(ch);
      }
    };
    const n = M._FPDF_StructTree_CountChildren(tree);
    for (let i = 0; i < n; i++)
      walk(M._FPDF_StructTree_GetChildAtIndex(tree, i));
    M._FPDF_StructTree_Close(tree);
    const out = new Map();
    const key = M._malloc(8);
    M.stringToUTF8('MCID', key, 8);
    const val = M._malloc(4);
    for (let i = 0; i < this.objectCount(); i++) {
      const o = this.objectAt(i);
      if (!o) continue;
      const nm = M._FPDFPageObj_CountMarks(o.handle);
      for (let k = 0; k < nm; k++) {
        const mk = M._FPDFPageObj_GetMark(o.handle, k);
        if (!mk) continue;
        const nb = M._malloc(32),
          need = M._malloc(4);
        let name = '';
        if (M._FPDFPageObjMark_GetName(mk, nb, 32, need)) {
          const len = M.HEAPU32[need >> 2];
          for (let q = 0; q + 2 <= len; q += 2) {
            const c = M.HEAPU8[nb + q] | (M.HEAPU8[nb + q + 1] << 8);
            if (c) name += String.fromCharCode(c);
          }
        }
        M._free(nb);
        M._free(need);
        if (name !== 'P' && name !== 'Figure') continue;
        if (!M._FPDFPageObjMark_GetParamIntValue(mk, key, val)) continue;
        const mcid = M.HEAP32[val >> 2];
        if (mcid >= 0 && !registered.has(mcid))
          out.set(mcid, { mcid, type: name });
      }
    }
    M._free(key);
    M._free(val);
    return [...out.values()].sort((a, b) => a.mcid - b.mcid);
  }

  objectMcid(handle) {
    const M = this.M;
    const key = M._malloc(8);
    M.stringToUTF8('MCID', key, 8);
    const val = M._malloc(4);
    let mcid = -1;
    const nm = M._FPDFPageObj_CountMarks(handle);
    for (let k = 0; k < nm && mcid < 0; k++) {
      const mk = M._FPDFPageObj_GetMark(handle, k);
      if (mk && M._FPDFPageObjMark_GetParamIntValue(mk, key, val)) {
        mcid = M.HEAP32[val >> 2];
      }
    }
    M._free(key);
    M._free(val);
    return mcid;
  }

  tagObject(handle, name) {
    this._pageDirty = true;
    const M = this.M;
    let maxM = -1;
    for (let i = 0; i < this.objectCount(); i++) {
      const o = this.objectAt(i);
      if (o) maxM = Math.max(maxM, this.objectMcid(o.handle));
    }
    const nbuf = M._malloc(name.length + 1);
    M.stringToUTF8(name, nbuf, name.length + 1);
    const mk = M._FPDFPageObj_AddMark(handle, nbuf);
    let ok = false;
    if (mk) {
      const key = M._malloc(8);
      M.stringToUTF8('MCID', key, 8);
      ok = !!M._FPDFPageObjMark_SetIntParam(
        this.doc,
        handle,
        mk,
        key,
        maxM + 1
      );
      M._free(key);
    }
    M._free(nbuf);
    return ok;
  }

  pageIsTagged() {
    const M = this.M;
    const tree = M._FPDF_StructTree_GetForPage(this.page);
    if (!tree) return false;
    const n = M._FPDF_StructTree_CountChildren(tree);
    M._FPDF_StructTree_Close(tree);
    return n > 0;
  }

  structAltFor(mcid) {
    const M = this.M;
    const tree = M._FPDF_StructTree_GetForPage(this.page);
    if (!tree) return null;
    let found = null;
    const walk = (el) => {
      if (found !== null) return;
      if (M._FPDF_StructElement_GetMarkedContentID(el) === mcid) {
        const need = M._FPDF_StructElement_GetAltText(el, 0, 0);
        let txt = '';
        if (need > 2) {
          const buf = M._malloc(need);
          M._FPDF_StructElement_GetAltText(el, buf, need);
          for (let q = 0; q + 2 <= need - 2; q += 2) {
            const c = M.HEAPU8[buf + q] | (M.HEAPU8[buf + q + 1] << 8);
            if (c) txt += String.fromCharCode(c);
          }
          M._free(buf);
        }
        found = txt;
        return;
      }
      const n = M._FPDF_StructElement_CountChildren(el);
      for (let i = 0; i < n; i++) {
        const ch = M._FPDF_StructElement_GetChildAtIndex(el, i);
        if (ch) walk(ch);
      }
    };
    const n = M._FPDF_StructTree_CountChildren(tree);
    for (let i = 0; i < n; i++)
      walk(M._FPDF_StructTree_GetChildAtIndex(tree, i));
    M._FPDF_StructTree_Close(tree);
    return found;
  }

  collectShadings() {
    const out = [];
    let firstOther = -1;
    for (let i = 0; i < this.objectCount(); i++) {
      const o = this.objectAt(i);
      if (!o) continue;
      if (o.type === 4) out.push({ index: i });
      else if (firstOther < 0) firstOther = i;
    }
    return out.map((s2) => ({
      ...s2,
      isBackground: firstOther < 0 || s2.index < firstOther,
    }));
  }

  pathStyle(handle) {
    const M = this.M;
    const p = M._malloc(24);
    const st = { stroke: false, strokeRgba: 0, strokeWidth: 1, fill: false };
    if (M._FPDFPath_GetDrawMode(handle, p, p + 4)) {
      st.fill = M.HEAP32[p >> 2] !== 0;
      st.stroke = M.HEAP32[(p + 4) >> 2] !== 0;
    }
    if (M._FPDFPageObj_GetStrokeColor(handle, p, p + 4, p + 8, p + 12)) {
      st.strokeRgba =
        (((M.HEAPU32[p >> 2] & 0xff) << 24) |
          ((M.HEAPU32[(p + 4) >> 2] & 0xff) << 16) |
          ((M.HEAPU32[(p + 8) >> 2] & 0xff) << 8) |
          (M.HEAPU32[(p + 12) >> 2] & 0xff)) >>>
        0;
    }
    if (M._FPDFPageObj_GetStrokeWidth(handle, p)) {
      st.strokeWidth = M.HEAPF32[p >> 2];
    }
    M._free(p);
    return st;
  }

  setPathStroke(handle, rgba, width) {
    this._pageDirty = true;
    const M = this.M;
    const p = M._malloc(8);
    let fill = 0;
    if (M._FPDFPath_GetDrawMode(handle, p, p + 4)) fill = M.HEAP32[p >> 2];
    M._free(p);
    M._FPDFPageObj_SetStrokeColor(
      handle,
      (rgba >>> 24) & 0xff,
      (rgba >>> 16) & 0xff,
      (rgba >>> 8) & 0xff,
      rgba & 0xff
    );
    M._FPDFPageObj_SetStrokeWidth(handle, width > 0 ? width : 1);
    M._FPDFPath_SetDrawMode(handle, fill, 1);
  }

  removeObject(handle) {
    this._pageDirty = true;
    if (this.M._FPDFPage_RemoveObject(this.page, handle)) {
      this.M._FPDFPageObj_Destroy(handle);
      return true;
    }
    return false;
  }

  scaleObject(handle, sx, sy, anchorX, anchorY) {
    ({ x: anchorX, y: anchorY } = this.toUser(anchorX, anchorY));
    if (this.pageT && Math.abs(this.pageT[0]) < 0.5) {
      const t2 = sx;
      sx = sy;
      sy = t2;
    }
    this._pageDirty = true;
    const M = this.M;
    const m = M._malloc(24);
    M.HEAPF32[(m + 0) >> 2] = sx;
    M.HEAPF32[(m + 4) >> 2] = 0;
    M.HEAPF32[(m + 8) >> 2] = 0;
    M.HEAPF32[(m + 12) >> 2] = sy;
    M.HEAPF32[(m + 16) >> 2] = anchorX - sx * anchorX;
    M.HEAPF32[(m + 20) >> 2] = anchorY - sy * anchorY;
    M._FPDFPageObj_TransformClipPath(
      handle,
      sx,
      0,
      0,
      sy,
      anchorX - sx * anchorX,
      anchorY - sy * anchorY
    );
    M._FPDFPageObj_TransformF(handle, m);
    M._free(m);
  }

  currentIndexOf(handle) {
    for (let i = 0; i < this.objectCount(); i++)
      if (this.M._FPDFPage_GetObject(this.page, i) === handle) return i;
    return -1;
  }

  arrangeObject(handle, op) {
    this._pageDirty = true;
    const M = this.M;
    const idx = this.currentIndexOf(handle);
    if (idx < 0) return false;
    const last = this.objectCount() - 1;
    const target =
      op === 'front'
        ? last
        : op === 'back'
          ? 0
          : op === 'forward'
            ? Math.min(last, idx + 1)
            : Math.max(0, idx - 1);
    if (target === idx) return false;
    if (!M._FPDFPage_RemoveObject(this.page, handle)) return false;
    if (!M._FPDFPage_InsertObjectAtIndex(this.page, handle, target))
      M._FPDFPage_InsertObject(this.page, handle);
    return true;
  }

  insertImage(rgba, pxW, pxH, x, y, w, h) {
    this._pageDirty = true;
    const M = this.M;
    const handle = M._FPDFPageObj_NewImageObj(this.doc);
    if (!handle) return 0;
    const FPDFBitmap_BGRA = 4;
    const bmp = M._FPDFBitmap_Create(pxW, pxH, 1);
    const buf = M._FPDFBitmap_GetBuffer(bmp);
    const stride = M._FPDFBitmap_GetStride(bmp);
    for (let row = 0; row < pxH; row++) {
      let src = row * pxW * 4,
        dst = buf + row * stride;
      for (let col = 0; col < pxW; col++) {
        M.HEAPU8[dst] = rgba[src + 2];
        M.HEAPU8[dst + 1] = rgba[src + 1];
        M.HEAPU8[dst + 2] = rgba[src];
        M.HEAPU8[dst + 3] = rgba[src + 3];
        src += 4;
        dst += 4;
      }
    }
    const pagesPtr = M._malloc(4);
    M.HEAPU32[pagesPtr >> 2] = this.page;
    M._FPDFImageObj_SetBitmap(pagesPtr, 1, handle, bmp);
    M._free(pagesPtr);
    M._FPDFBitmap_Destroy(bmp);
    const m = M._malloc(24);
    M.HEAPF32[(m + 0) >> 2] = w;
    M.HEAPF32[(m + 4) >> 2] = 0;
    M.HEAPF32[(m + 8) >> 2] = 0;
    M.HEAPF32[(m + 12) >> 2] = h;
    const at = this.toUser(x, y);
    M.HEAPF32[(m + 16) >> 2] = at.x;
    M.HEAPF32[(m + 20) >> 2] = at.y;
    M._FPDFPageObj_SetMatrix(handle, m);
    M._free(m);
    M._FPDFPage_InsertObject(this.page, handle);
    return handle;
  }

  duplicateImage(handle, dx, dy) {
    this._pageDirty = true;
    const M = this.M;
    const b = this.objectBounds(handle);
    if (!b) return 0;
    const sz = M._malloc(8);
    let iw = 0,
      ih = 0;
    if (M._FPDFImageObj_GetImagePixelSize(handle, sz, sz + 4)) {
      iw = M.HEAPU32[sz >> 2];
      ih = M.HEAPU32[(sz + 4) >> 2];
    }
    M._free(sz);
    const mp = M._malloc(24);
    let saved = null;
    if (M._FPDFPageObj_GetMatrix(handle, mp)) {
      saved = [0, 1, 2, 3, 4, 5].map((i) => M.HEAPF32[(mp >> 2) + i]);
    }
    const upright =
      saved && saved[1] === 0 && saved[2] === 0 && saved[0] > 0 && saved[3] > 0;
    let boosted = false;
    if (upright && iw > 0 && ih > 0 && (iw > saved[0] || ih > saved[3])) {
      const s = Math.min(1, 4096 / Math.max(iw, ih));
      M.HEAPF32.set([iw * s, 0, 0, ih * s, saved[4], saved[5]], mp >> 2);
      M._FPDFPageObj_SetMatrix(handle, mp);
      boosted = true;
    }
    const bmp = M._FPDFImageObj_GetRenderedBitmap(this.doc, this.page, handle);
    if (boosted) {
      M.HEAPF32.set(saved, mp >> 2);
      M._FPDFPageObj_SetMatrix(handle, mp);
    }
    M._free(mp);
    if (!bmp) return 0;
    const w = M._FPDFBitmap_GetWidth(bmp),
      h = M._FPDFBitmap_GetHeight(bmp);
    const stride = M._FPDFBitmap_GetStride(bmp),
      buf = M._FPDFBitmap_GetBuffer(bmp);
    const rgba = new Uint8Array(w * h * 4);
    for (let row = 0; row < h; row++) {
      let src = buf + row * stride,
        dst = row * w * 4;
      for (let col = 0; col < w; col++) {
        rgba[dst] = M.HEAPU8[src + 2];
        rgba[dst + 1] = M.HEAPU8[src + 1];
        rgba[dst + 2] = M.HEAPU8[src];
        rgba[dst + 3] = M.HEAPU8[src + 3];
        src += 4;
        dst += 4;
      }
    }
    M._FPDFBitmap_Destroy(bmp);
    return this.insertImage(rgba, w, h, b.x + dx, b.y + dy, b.w, b.h);
  }

  objectFill(handle) {
    const M = this.M;
    const p = M._malloc(16);
    const ok = M._FPDFPageObj_GetFillColor(handle, p, p + 4, p + 8, p + 12);
    const r = M.HEAPU32[p >> 2],
      g = M.HEAPU32[(p + 4) >> 2];
    const b = M.HEAPU32[(p + 8) >> 2],
      a = M.HEAPU32[(p + 12) >> 2];
    M._free(p);
    return ok ? { r, g, b, a } : null;
  }
  setObjectFill(handle, r, g, b, a) {
    this._pageDirty = true;
    this.M._FPDFPageObj_SetFillColor(handle, r, g, b, a);
  }

  renderPage(scale, hideHandles = null) {
    const M = this.M;
    const s = Math.min(
      scale,
      4096 / Math.max(1, this.pageWidth),
      4096 / Math.max(1, this.pageHeight)
    );
    scale = Math.max(0.05, s);
    const w = Math.max(1, Math.round(this.pageWidth * scale));
    const h = Math.max(1, Math.round(this.pageHeight * scale));
    let saved = null,
      mp = 0;
    if (hideHandles && hideHandles.length) {
      mp = M._malloc(24);
      saved = [];
      for (const handle of hideHandles) {
        if (!M._FPDFPageObj_GetMatrix(handle, mp)) continue;
        saved.push([handle, M.HEAPF32.slice(mp >> 2, (mp >> 2) + 6)]);
        M.HEAPF32[(mp + 0) >> 2] = 1e-6;
        M.HEAPF32[(mp + 4) >> 2] = 0;
        M.HEAPF32[(mp + 8) >> 2] = 0;
        M.HEAPF32[(mp + 12) >> 2] = 1e-6;
        M.HEAPF32[(mp + 16) >> 2] = -1e6;
        M.HEAPF32[(mp + 20) >> 2] = -1e6;
        M._FPDFPageObj_SetMatrix(handle, mp);
      }
    }
    const FPDFBitmap_BGRA = 4;
    const bmp = M._FPDFBitmap_CreateEx(w, h, FPDFBitmap_BGRA, 0, 0);
    M._FPDFBitmap_FillRect(bmp, 0, 0, w, h, 0xffffffff);
    const FPDF_ANNOT = 0x01,
      FPDF_LCD_TEXT = 0x02,
      FPDF_REVERSE_BYTE_ORDER = 0x10;
    const FLAGS = FPDF_ANNOT | FPDF_LCD_TEXT | FPDF_REVERSE_BYTE_ORDER;
    M._FPDF_RenderPageBitmap(bmp, this.page, 0, 0, w, h, 0, FLAGS);
    M._ec_form_draw(this.session, this.page, bmp, 0, 0, w, h, 0, FLAGS);
    if (saved) {
      for (const [handle, m] of saved) {
        M.HEAPF32.set(m, mp >> 2);
        M._FPDFPageObj_SetMatrix(handle, mp);
      }
      M._free(mp);
    }
    const buf = M._FPDFBitmap_GetBuffer(bmp);
    const stride = M._FPDFBitmap_GetStride(bmp);
    const need = w * h * 4;
    if (this._renderScratch?.length !== need)
      this._renderScratch = new Uint8ClampedArray(need);
    const out = this._renderScratch;
    if (stride === w * 4) {
      out.set(M.HEAPU8.subarray(buf, buf + w * h * 4));
    } else {
      for (let y = 0; y < h; y++) {
        out.set(
          M.HEAPU8.subarray(buf + y * stride, buf + y * stride + w * 4),
          y * w * 4
        );
      }
    }
    M._FPDFBitmap_Destroy(bmp);
    return { width: w, height: h, data: out };
  }

  generateContent() {
    if (!this._pageDirty) return true;
    if (this._t3seg && this._t3seg[this.pageIndex]) {
      const st = this._t3readState();
      if (st) {
        this._t3anchor(st);
        (this._t3state ||= {})[this.pageIndex] = st.filter(
          (o) => o.t3 && !o.inForm && o.glyphs && o.glyphs.length
        );
      }
    }
    if (this.session) this.M._ec_dealias_page_fonts(this.session, this.page);
    this.M._ec_normalize_page_paint(this.page);
    const ok = this.M._FPDFPage_GenerateContent(this.page) !== 0;
    if (ok) this._spliceOk = false;
    if (ok && this._usesPattern) this._pageStale = true;
    if (ok) {
      this._pageDirty = false;
      (this._editedPages ||= new Set()).add(this.pageIndex);
    }
    return ok;
  }

  async saveSpliced(opts) {
    if (
      this._spliceOk === false ||
      !this._splicePlans?.length ||
      !this._originalBytes ||
      this._reencoded?.size ||
      this._normalizedBytes ||
      this._encrypted
    )
      return this.save(opts);
    try {
      const { applyPlan } = await import('./streamsplice.js');
      const writeCount = this._splicePlans.filter(
        (e) => e.plan?.kind === 'write'
      ).length;
      if (writeCount > 1) return this.save(opts);
      let bytes = this._originalBytes;
      for (const { page, plan } of this._splicePlans) {
        const next = await applyPlan(bytes, page, plan);
        if (!next) return this.save(opts);
        bytes = next;
      }
      return bytes;
    } catch {
      return this.save(opts);
    }
  }

  renderParagraphLiveEnd() {
    if (this.M._ec_render_paragraph_live_end && this.session && this.page) {
      this.M._ec_render_paragraph_live_end(this.session, this.page);
    }
  }

  save(opts) {
    this.renderParagraphLiveEnd();
    if (this._pageDirty && !opts?.noRegen) this.generateContent();
    const M = this.M;
    const sizePtr = M._malloc(4);
    const hasT3 = this._t3seg && Object.keys(this._t3seg).length > 0;
    const incremental =
      !this._encrypted && ((opts && opts.incremental) || hasT3);
    const outPtr = M._ec_save_document(this.doc, incremental ? 1 : 2, sizePtr);
    const size = M.HEAPU32[sizePtr >> 2];
    M._free(sizePtr);
    if (!outPtr || !size) return null;
    let bytes = M.HEAPU8.slice(outPtr, outPtr + size);
    M._ec_string_free(outPtr);
    if (hasT3 && this._t3state) {
      try {
        const jobs = Object.entries(this._t3state).map(([pi, state]) => ({
          pageIndex: Number(pi),
          seg: this._t3seg[pi],
          state,
          anchors: this._t3anchors?.[pi] || {},
        }));
        const fixed = applyType3LeftoverSurgery(bytes, jobs);
        if (fixed) {
          bytes = fixed.bytes;
          for (const [pi, tjEntries] of Object.entries(fixed.injected)) {
            this._t3seg[pi]?.tjs?.push(...tjEntries);
          }
        }
      } catch (e) {
        console.warn('type3 surgery skipped:', e);
      }
    }
    return bytes;
  }
}

const OBJECT_MUTATORS = [
  'open',
  'reopen',
  'loadPage',
  'buildModel',
  'generateContent',
  'normalizeFontsForEdit',
  'addParagraph',
  'commitParagraph',
  'deleteParagraph',
  'moveParagraph',
  'resizeParagraph',
  'duplicateParagraph',
  'synthRunFont',
  'translateObject',
  'transformObjectAboutCenter',
  'rotateObject',
  'rotateObjectsAbout',
  'flipObject',
  'scaleObject',
  'arrangeObject',
  'removeObject',
  'replaceImage',
  'insertImage',
  'duplicateImage',
  'setPathStroke',
  'setObjectFill',
  'tagObject',
  'historyUndo',
  'historyRedo',
];

for (const name of OBJECT_MUTATORS) {
  const original = PdfEngine.prototype[name];
  if (typeof original !== 'function') continue;
  PdfEngine.prototype[name] = function wrapped(...args) {
    this._objEpoch = (this._objEpoch || 0) + 1;
    return original.apply(this, args);
  };
}
