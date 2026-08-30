type SectionSpec = { id: string; title: string; icon: string };
type RangeLink = { range: HTMLInputElement; num: HTMLInputElement };

const TEXT_SECTIONS: SectionSpec[] = [
  { id: 'font', title: 'Font', icon: 'ph-text-aa' },
  { id: 'size', title: 'Font Size', icon: 'ph-text-t' },
  { id: 'color', title: 'Text Color', icon: 'ph-palette' },
  { id: 'align', title: 'Alignment', icon: 'ph-text-align-left' },
  { id: 'spacing', title: 'Spacing', icon: 'ph-arrows-out-line-vertical' },
  { id: 'lists', title: 'Lists', icon: 'ph-list-bullets' },
  { id: 'more', title: 'More', icon: 'ph-dots-three' },
];
const SCOPE_SECTION: SectionSpec = {
  id: 'scope',
  title: 'Edit Scope',
  icon: 'ph-pencil-simple',
};
const STROKE_SECTION: SectionSpec = {
  id: 'stroke',
  title: 'Path Stroke',
  icon: 'ph-path',
};
const MULTI_SECTION: SectionSpec = {
  id: 'alignMulti',
  title: 'Align Objects',
  icon: 'ph-align-left',
};

const OBJ_BTN_IDS = [
  'rotL',
  'rotR',
  'flipH',
  'flipV',
  'replImg',
  'extEdit',
  'altText',
  'front',
  'back',
  'dupe',
];

const SLIDER_FIELDS: [string, string][] = [
  ['fLine', 'Line'],
  ['fPara', 'Paragraph'],
  ['fChar', 'Character'],
  ['fWordSp', 'Word'],
];
const MORE_FIELDS: [string, string][] = [
  ['fHScale', 'H-Scale %'],
  ['fFirstInd', 'First Indent'],
  ['fHangInd', 'Hanging Indent'],
];

const q = (id: string): HTMLElement | null => document.getElementById(id);

const ph = (name: string): HTMLElement => {
  const i = document.createElement('i');
  i.className = `ph ${name}`;
  return i;
};

const div = (cls: string): HTMLDivElement => {
  const d = document.createElement('div');
  d.className = cls;
  return d;
};

const mkBtn = (cls: string, label: string): HTMLButtonElement => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.title = label;
  b.setAttribute('aria-label', label);
  b.addEventListener('mousedown', (e) => e.preventDefault());
  return b;
};

const rowOf = (el: Element | null): HTMLElement | null => {
  const r = el?.closest('.row');
  return r instanceof HTMLElement ? r : null;
};

const stepperOf = (el: Element | null): HTMLElement | null => {
  const s = el?.closest('.stepper');
  return s instanceof HTMLElement ? s : null;
};

const numInput = (id: string): HTMLInputElement | null => {
  const el = q(id);
  return el instanceof HTMLInputElement ? el : null;
};

function setupPagePill(): void {
  const save = q('save');
  const pageLabel = q('pageLabel');
  const app = q('text-editor-app');
  if (!save || !pageLabel || !app || !save.parentElement) return;
  const pill = mkBtn('dpagepill', 'Go to page');
  pill.textContent = '– / –';
  save.parentElement.insertBefore(pill, save);
  const syncPill = () => {
    pill.textContent = pageLabel.textContent ?? '';
  };
  new MutationObserver(syncPill).observe(pageLabel, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  syncPill();
  const parse = () => {
    const parts = (pageLabel.textContent ?? '').split('/');
    return {
      current: parseInt(parts[0] ?? '', 10),
      total: parseInt(parts[1] ?? '', 10),
    };
  };
  let menu: HTMLDivElement | null = null;
  const closeMenu = () => {
    menu?.remove();
    menu = null;
  };
  pill.addEventListener('click', () => {
    if (menu) {
      closeMenu();
      return;
    }
    menu = div('ecmenu dpagemenu');
    const rect = pill.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.right = '8px';
    menu.addEventListener('click', (e) => e.stopPropagation());
    const nav = div('dpagenav');
    const prevB = mkBtn('dnavbtn', 'Previous page');
    prevB.appendChild(ph('ph-caret-left'));
    prevB.addEventListener('click', () => q('prev')?.click());
    const nextB = mkBtn('dnavbtn', 'Next page');
    nextB.appendChild(ph('ph-caret-right'));
    nextB.addEventListener('click', () => q('next')?.click());
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '1';
    inp.step = '1';
    inp.className = 'dpageinp';
    inp.setAttribute('aria-label', 'Page number');
    const st = parse();
    if (Number.isFinite(st.current)) inp.value = String(st.current);
    if (Number.isFinite(st.total)) inp.max = String(st.total);
    const go = () => {
      const p = parse();
      const target = parseInt(inp.value, 10);
      if (
        !Number.isFinite(p.current) ||
        !Number.isFinite(p.total) ||
        !Number.isFinite(target)
      )
        return;
      const clamped = Math.min(Math.max(target, 1), p.total);
      const delta = clamped - p.current;
      const btn = q(delta > 0 ? 'next' : 'prev');
      for (let i = 0; i < Math.abs(delta); i++) btn?.click();
      closeMenu();
    };
    inp.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      go();
    });
    const goBtn = mkBtn('dnavbtn dgo', 'Go to page');
    goBtn.textContent = 'Go';
    goBtn.addEventListener('click', go);
    nav.append(prevB, inp, goBtn, nextB);
    menu.appendChild(nav);
    menu.appendChild(document.createElement('hr'));
    const props = mkBtn('ecmenu-item', 'Document properties');
    const propLabel = document.createElement('span');
    propLabel.textContent = 'Document properties';
    props.append(ph('ph-info'), propLabel);
    props.addEventListener('click', () => {
      closeMenu();
      q('docInfoBtn')?.click();
    });
    menu.appendChild(props);
    app.appendChild(menu);
    const dismiss = (e: MouseEvent) => {
      if (e.target === pill || pill.contains(e.target as Node)) return;
      closeMenu();
      window.removeEventListener('click', dismiss);
    };
    window.setTimeout(() => window.addEventListener('click', dismiss), 0);
  });
}

export function setupFormatDock(): void {
  const inspector = q('inspector');
  const app = q('text-editor-app');
  const contextbar = q('contextbar');
  const alignTools = q('alignTools');
  const pStrokeRow = q('pStrokeRow');
  const scopeSel = q('editScope');
  const editBtn =
    document.querySelector<HTMLButtonElement>('[data-tool="edit"]');
  if (
    !inspector ||
    !app ||
    !contextbar ||
    !alignTools ||
    !pStrokeRow ||
    !editBtn ||
    !(scopeSel instanceof HTMLSelectElement)
  )
    return;

  inspector.classList.remove('collapsed');
  const rangeLinks: RangeLink[] = [];

  const panel = div('dockpanel');
  const clip = div('dockclip');
  const body = div('dockbody');
  const head = div('dockhead');
  const dtitle = div('dtitle');
  const dticon = document.createElement('span');
  const dtext = document.createElement('span');
  dtitle.append(dticon, dtext);
  const dclose = mkBtn('dclose', 'Close panel');
  dclose.appendChild(ph('ph-x'));
  head.append(dtitle, dclose);
  const slotsWrap = div('dockslots');
  body.append(head, slotsWrap);
  clip.appendChild(body);
  panel.appendChild(clip);

  const rail = div('dockrail');
  const chipsWrap = div('dockchips');
  const acts = div('dockacts');
  const delChip = mkBtn('dchip ddel', 'Delete');
  delChip.appendChild(ph('ph-trash'));
  delChip.addEventListener('click', () => q('del')?.click());
  acts.appendChild(delChip);
  rail.append(chipsWrap, acts);
  inspector.append(panel, rail);

  const slots = new Map<string, HTMLElement>();
  const mkSlot = (id: string): HTMLElement => {
    const s = div('dslot');
    s.dataset.sec = id;
    slotsWrap.appendChild(s);
    slots.set(id, s);
    return s;
  };

  const sliderRow = (id: string, label: string): HTMLElement | null => {
    const num = numInput(id);
    if (!num) return null;
    const stepper = stepperOf(num);
    const row = div('dfield');
    const lab = div('dlab');
    lab.textContent = label;
    const range = document.createElement('input');
    range.type = 'range';
    range.min = num.min;
    range.max = num.max;
    range.step = num.step;
    range.value = num.value || num.min;
    range.setAttribute('aria-label', label);
    range.addEventListener('pointerdown', () => {
      range.dataset.drag = '1';
    });
    range.addEventListener('pointerup', () => {
      delete range.dataset.drag;
    });
    range.addEventListener('input', () => {
      num.value = range.value;
    });
    range.addEventListener('change', () => {
      delete range.dataset.drag;
      num.value = range.value;
      num.dispatchEvent(new Event('change'));
    });
    rangeLinks.push({ range, num });
    row.append(lab, range, stepper ?? num);
    return row;
  };

  const sizeSlot = mkSlot('size');
  const fSize = numInput('fSize');
  if (fSize) {
    const sizer = div('dsizer');
    const step = (dir: -1 | 1, icon: string, label: string) => {
      const b = mkBtn('dstep', label);
      b.appendChild(ph(icon));
      b.addEventListener('click', () => {
        if (fSize.disabled || fSize.value === '') return;
        if (dir > 0) fSize.stepUp();
        else fSize.stepDown();
        fSize.dispatchEvent(new Event('change'));
      });
      return b;
    };
    const minus = step(-1, 'ph-minus', 'Decrease size');
    const plus = step(1, 'ph-plus', 'Increase size');
    const host = stepperOf(fSize) ?? fSize;
    sizer.append(minus, host, plus);
    sizeSlot.appendChild(sizer);
  }

  const colorSlot = mkSlot('color');
  const colorRow = rowOf(q('fColor'));
  if (colorRow) colorSlot.appendChild(colorRow);

  const alignSlot = mkSlot('align');
  const alignRow = rowOf(q('fAlign'));
  if (alignRow) alignSlot.appendChild(alignRow);
  const dirLab = div('dlab dsublab');
  dirLab.textContent = 'Direction';
  alignSlot.appendChild(dirLab);
  const dirRow = rowOf(q('fDir'));
  if (dirRow) alignSlot.appendChild(dirRow);

  const spacingSlot = mkSlot('spacing');
  for (const [id, label] of SLIDER_FIELDS) {
    const row = sliderRow(id, label);
    if (row) spacingSlot.appendChild(row);
  }

  const listsSlot = mkSlot('lists');
  const listsRow = rowOf(q('fList'));
  if (listsRow) listsSlot.appendChild(listsRow);

  const moreSlot = mkSlot('more');
  const outLab = div('dlab dsublab');
  outLab.textContent = 'Outline';
  moreSlot.appendChild(outLab);
  const outlineRow = rowOf(q('fStrokeColor'));
  if (outlineRow) moreSlot.appendChild(outlineRow);
  for (const [id, label] of MORE_FIELDS) {
    const row = sliderRow(id, label);
    if (row) moreSlot.appendChild(row);
  }

  const strokeSlot = mkSlot('stroke');
  strokeSlot.appendChild(pStrokeRow);

  const multiSlot = mkSlot('alignMulti');
  multiSlot.appendChild(alignTools);

  const scopeSlot = mkSlot('scope');
  const scopeWrap = div('dscope');
  scopeSlot.appendChild(scopeWrap);
  let picked = new Set<string>(['all']);
  const scopeDefs: [string, string][] = [
    ['all', 'All'],
    ['text', 'Text'],
    ['image', 'Images'],
    ['shape', 'Shapes'],
  ];
  const renderScope = () => {
    scopeWrap.replaceChildren();
    for (const [key, label] of scopeDefs) {
      const b = mkBtn(`dscopebtn${picked.has(key) ? ' on' : ''}`, label);
      b.textContent = label;
      b.addEventListener('click', () => {
        if (key === 'all') picked = new Set(['all']);
        else {
          if (picked.has('all')) picked.clear();
          if (picked.has(key)) picked.delete(key);
          else picked.add(key);
          if (picked.size === 0 || picked.size === 3) picked = new Set(['all']);
        }
        applyScope();
      });
      scopeWrap.appendChild(b);
    }
  };
  const applyScope = () => {
    const value = [...picked].join(',');
    if (!scopeSel.querySelector(`option[value="${value}"]`)) {
      const o = document.createElement('option');
      o.value = value;
      scopeSel.appendChild(o);
    }
    scopeSel.value = value;
    scopeSel.dispatchEvent(new Event('change'));
    renderScope();
  };
  renderScope();

  let activeSec: string | null = null;
  let syncTimer = 0;

  const stopSync = () => {
    window.clearInterval(syncTimer);
    syncTimer = 0;
  };
  const startSync = () => {
    stopSync();
    syncTimer = window.setInterval(() => {
      for (const l of rangeLinks) {
        if (l.range.dataset.drag) continue;
        if (l.num.value !== '' && l.range.value !== l.num.value)
          l.range.value = l.num.value;
      }
    }, 400);
  };
  const syncRangesNow = () => {
    for (const l of rangeLinks) {
      if (l.num.value !== '') l.range.value = l.num.value;
    }
  };

  const setHead = (spec: SectionSpec) => {
    dticon.replaceChildren(ph(spec.icon));
    dtext.textContent = spec.title;
  };
  const showSlot = (id: string) => {
    for (const [k, s] of slots) s.classList.toggle('act', k === id);
  };

  const closePanel = () => {
    panel.classList.remove('open');
    activeSec = null;
    stopSync();
    markActive();
  };

  const dismissKeyboard = (): void => {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    const a = document.activeElement;
    if (a instanceof HTMLElement && a.isContentEditable) a.blur();
  };

  const openSec = (spec: SectionSpec) => {
    dismissKeyboard();
    const isOpen = panel.classList.contains('open');
    if (isOpen && activeSec === spec.id) {
      closePanel();
      return;
    }
    if (isOpen) {
      body.classList.add('fading');
      window.setTimeout(() => {
        setHead(spec);
        showSlot(spec.id);
        body.classList.remove('fading');
      }, 120);
    } else {
      setHead(spec);
      showSlot(spec.id);
      panel.classList.add('open');
    }
    activeSec = spec.id;
    syncRangesNow();
    startSync();
    markActive();
  };
  dclose.addEventListener('click', closePanel);

  const dim = div('ddim');
  const sheet = div('dsheet');
  const grab = div('dgrab');
  grab.appendChild(document.createElement('span'));
  const shead = div('dsheethead');
  shead.append(ph('ph-text-aa'), document.createTextNode(' Select Font'));
  const fontListEl = div('dfontlist');
  sheet.append(grab, shead, fontListEl);
  inspector.append(dim, sheet);

  let sheetOpen = false;
  const rebuildFonts = () => {
    const fam = q('fFamily');
    if (!(fam instanceof HTMLSelectElement)) return;
    fontListEl.replaceChildren();
    const current = fam.value;
    for (const opt of Array.from(fam.options)) {
      const b = mkBtn(`dfrow${opt.value === current ? ' on' : ''}`, opt.value);
      b.style.fontFamily = `"${opt.value.replace(/"/g, '')}", sans-serif`;
      const name = document.createElement('span');
      name.textContent = opt.value;
      const chk = ph('ph-check');
      chk.classList.add('dfchk');
      b.append(name, chk);
      b.addEventListener('click', () => {
        fam.value = opt.value;
        fam.dispatchEvent(new Event('change'));
        rebuildFonts();
        window.setTimeout(closeSheet, 180);
      });
      fontListEl.appendChild(b);
    }
    if ('queryLocalFonts' in window) {
      fontListEl.appendChild(div('ddivider'));
      const sys = mkBtn('dfrow dfsys', 'Load system fonts');
      const label = document.createElement('span');
      label.textContent = 'Load system fonts…';
      sys.appendChild(label);
      sys.addEventListener('click', () => q('sysFonts')?.click());
      fontListEl.appendChild(sys);
    }
  };
  const openSheet = () => {
    dismissKeyboard();
    rebuildFonts();
    sheetOpen = true;
    dim.classList.add('show');
    sheet.classList.add('open');
    markActive();
  };
  const closeSheet = () => {
    if (!sheetOpen) return;
    sheetOpen = false;
    dim.classList.remove('show');
    sheet.classList.remove('open');
    sheet.style.transform = '';
    markActive();
  };
  dim.addEventListener('click', closeSheet);

  let dragY: number | null = null;
  grab.addEventListener('pointerdown', (e) => {
    dragY = e.clientY;
    sheet.classList.add('drag');
    grab.setPointerCapture(e.pointerId);
  });
  grab.addEventListener('pointermove', (e) => {
    if (dragY === null) return;
    const dy = Math.max(0, e.clientY - dragY);
    sheet.style.transform = `translateY(${dy}px)`;
  });
  const endDrag = (e: PointerEvent) => {
    if (dragY === null) return;
    const dy = Math.max(0, e.clientY - dragY);
    dragY = null;
    sheet.classList.remove('drag');
    sheet.style.transform = '';
    if (dy > 90) closeSheet();
  };
  grab.addEventListener('pointerup', endDrag);
  grab.addEventListener('pointercancel', endDrag);

  const famSel = q('fFamily');
  if (famSel) {
    new MutationObserver(() => {
      if (sheetOpen) rebuildFonts();
    }).observe(famSel, { childList: true });
  }

  const visibleObjBtns = (): HTMLButtonElement[] => {
    const out: HTMLButtonElement[] = [];
    for (const id of OBJ_BTN_IDS) {
      const b = q(id);
      if (b instanceof HTMLButtonElement && !b.hidden) out.push(b);
    }
    return out;
  };

  const computeMode = (): 'text' | 'object' | 'idle' => {
    if (!inspector.hasAttribute('disabled')) return 'text';
    if (visibleObjBtns().length || !alignTools.hidden) return 'object';
    return 'idle';
  };

  const secChip = (spec: SectionSpec): HTMLButtonElement => {
    const b = mkBtn('dchip', spec.title);
    b.dataset.sec = spec.id;
    b.appendChild(ph(spec.icon));
    b.addEventListener('click', () => {
      if (spec.id === 'font') {
        if (sheetOpen) closeSheet();
        else openSheet();
      } else openSec(spec);
    });
    return b;
  };

  const proxyChip = (src: HTMLButtonElement): HTMLButtonElement => {
    const b = mkBtn('dchip', src.title || 'Action');
    b.dataset.proxy = src.id;
    const icon = src.querySelector('i');
    b.appendChild(
      icon ? (icon.cloneNode(true) as HTMLElement) : ph('ph-circle')
    );
    b.addEventListener('click', () => src.click());
    return b;
  };

  const toolChip = (
    id: string,
    icon: string,
    label: string,
    onTap: () => void
  ): HTMLButtonElement => {
    const b = mkBtn('dchip', label);
    b.dataset.tool = id;
    b.appendChild(ph(icon));
    b.addEventListener('click', onTap);
    return b;
  };

  let lastMode: 'text' | 'object' | 'idle' | null = null;

  const togglesRow = q('fToggles');
  const toggleChip = (src: HTMLButtonElement): HTMLButtonElement => {
    const b = mkBtn('dchip', src.title || 'Toggle style');
    b.dataset.tog = src.dataset.t ?? '';
    const icon = src.querySelector('i');
    b.appendChild(
      icon ? (icon.cloneNode(true) as HTMLElement) : ph('ph-circle')
    );
    b.addEventListener('click', () => src.click());
    return b;
  };

  const buildRail = () => {
    const mode = computeMode();
    chipsWrap.replaceChildren();
    if (mode !== 'idle') {
      chipsWrap.appendChild(
        toolChip('done', 'ph-check', 'Done — back to tools', () => {
          closePanel();
          closeSheet();
          editBtn.click();
        })
      );
    }
    if (mode === 'text') {
      for (const s of TEXT_SECTIONS) {
        chipsWrap.appendChild(secChip(s));
        if (s.id === 'color' && togglesRow) {
          for (const t of togglesRow.children) {
            if (t instanceof HTMLButtonElement)
              chipsWrap.appendChild(toggleChip(t));
          }
        }
      }
    } else if (mode === 'idle') {
      chipsWrap.appendChild(
        toolChip('edit', 'ph-pencil-simple', 'Edit tool', () => {
          if (editBtn.classList.contains('on')) openSec(SCOPE_SECTION);
          else {
            closePanel();
            applyScope();
          }
        })
      );
      chipsWrap.appendChild(
        toolChip('addText', 'ph-textbox', 'Add a text box', () => {
          closePanel();
          document
            .querySelector<HTMLButtonElement>('[data-tool="addText"]')
            ?.click();
        })
      );
      chipsWrap.appendChild(
        toolChip('addImage', 'ph-image', 'Add an image', () => {
          closePanel();
          q('addImage')?.click();
        })
      );
      chipsWrap.appendChild(
        toolChip('find', 'ph-magnifying-glass', 'Find & replace', () => {
          closePanel();
          q('find')?.click();
        })
      );
    }
    if (!alignTools.hidden) chipsWrap.appendChild(secChip(MULTI_SECTION));
    if (!pStrokeRow.hidden) chipsWrap.appendChild(secChip(STROKE_SECTION));
    for (const b of visibleObjBtns()) chipsWrap.appendChild(proxyChip(b));
    const delBtn = q('del');
    acts.hidden = !(delBtn instanceof HTMLButtonElement) || delBtn.hidden;
    markActive();
  };

  function markActive(): void {
    const editOn = editBtn.classList.contains('on');
    for (const c of chipsWrap.children) {
      if (!(c instanceof HTMLElement)) continue;
      if (c.dataset.sec) {
        c.classList.toggle(
          'on',
          c.dataset.sec === 'font' ? sheetOpen : c.dataset.sec === activeSec
        );
      } else if (c.dataset.tog) {
        const src = togglesRow?.querySelector(`[data-t="${c.dataset.tog}"]`);
        c.classList.toggle('on', !!src?.classList.contains('on'));
      } else if (c.dataset.tool === 'edit') {
        c.classList.toggle('on', editOn || activeSec === 'scope');
      } else if (c.dataset.tool === 'addText') {
        c.classList.toggle('on', !editOn);
      }
    }
  }

  let raf = 0;
  const refresh = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const mode = computeMode();
      if (mode !== lastMode) {
        closePanel();
        closeSheet();
        lastMode = mode;
      }
      buildRail();
      if (activeSec && !chipsWrap.querySelector(`[data-sec="${activeSec}"]`))
        closePanel();
    });
  };

  new MutationObserver(refresh).observe(inspector, {
    attributes: true,
    attributeFilter: ['disabled', 'hidden'],
  });
  new MutationObserver(refresh).observe(contextbar, {
    attributes: true,
    subtree: true,
    attributeFilter: ['hidden'],
  });
  new MutationObserver(refresh).observe(alignTools, {
    attributes: true,
    attributeFilter: ['hidden'],
  });
  new MutationObserver(refresh).observe(pStrokeRow, {
    attributes: true,
    attributeFilter: ['hidden'],
  });
  new MutationObserver(() => markActive()).observe(editBtn, {
    attributes: true,
    attributeFilter: ['class'],
  });
  if (togglesRow) {
    new MutationObserver(() => markActive()).observe(togglesRow, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class'],
    });
  }

  const vv = window.visualViewport;
  if (vv) {
    const updateOffset = () => {
      const off = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      app.style.setProperty('--eckb', `${Math.round(off)}px`);
    };
    vv.addEventListener('resize', updateOffset);
    vv.addEventListener('scroll', updateOffset);
    updateOffset();
  }

  const publishDockHeight = () => {
    app.style.setProperty(
      '--ecdock',
      `${Math.round(inspector.getBoundingClientRect().height)}px`
    );
  };
  new ResizeObserver(publishDockHeight).observe(inspector);
  publishDockHeight();

  setupPagePill();
  refresh();
}

export function setupFindSheet(): void {
  const findbar = q('findbar');
  if (!findbar) return;
  const closeFind = () => q('findDone')?.click();
  const grab = div('ecgrab');
  grab.appendChild(document.createElement('span'));
  findbar.prepend(grab);
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let vel = 0;
  let mode: 'idle' | 'undecided' | 'drag' | 'scroll' = 'idle';
  const onStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    startY = lastY = e.touches[0].clientY;
    lastT = performance.now();
    vel = 0;
    const onGrab = (e.target as HTMLElement | null)?.closest('.ecgrab');
    mode = onGrab ? 'drag' : 'undecided';
  };
  const onMove = (e: TouchEvent) => {
    if (mode === 'idle' || mode === 'scroll') return;
    const y = e.touches[0].clientY;
    const dy = y - startY;
    if (mode === 'undecided') {
      if (Math.abs(dy) < 6) return;
      if (dy > 0 && findbar.scrollTop <= 0) mode = 'drag';
      else {
        mode = 'scroll';
        return;
      }
    }
    e.preventDefault();
    const now = performance.now();
    vel = (y - lastY) / Math.max(1, now - lastT);
    lastY = y;
    lastT = now;
    findbar.style.transform = `translateY(${Math.max(0, y - startY)}px)`;
  };
  const onEnd = () => {
    if (mode !== 'drag') {
      mode = 'idle';
      return;
    }
    mode = 'idle';
    const dy = Math.max(0, lastY - startY);
    findbar.style.transform = '';
    if (dy > 90 || vel > 0.55) {
      const anim = findbar.animate(
        [
          { transform: `translateY(${dy}px)` },
          { transform: 'translateY(110%)' },
        ],
        { duration: 160, easing: 'ease-in' }
      );
      anim.onfinish = () => closeFind();
    } else if (dy > 0) {
      findbar.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: 'none' }],
        { duration: 160, easing: 'ease-out' }
      );
    }
  };
  findbar.addEventListener('touchstart', onStart, { passive: true });
  findbar.addEventListener('touchmove', onMove, { passive: false });
  findbar.addEventListener('touchend', onEnd);
  findbar.addEventListener('touchcancel', onEnd);
  let findWasOpen = !findbar.hidden;
  new MutationObserver(() => {
    const open = !findbar.hidden;
    if (open && !findWasOpen) {
      findbar.animate(
        [{ transform: 'translateY(40px)' }, { transform: 'none' }],
        { duration: 200, easing: 'ease-out' }
      );
    }
    findWasOpen = open;
  }).observe(findbar, { attributes: true, attributeFilter: ['hidden'] });
}
