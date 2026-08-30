import '@phosphor-icons/web/regular';
import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { t } from '../i18n/i18n';
import { batchDecryptIfNeeded } from '../utils/password-prompt.js';
import { setupFormatDock, setupFindSheet } from './edit-pdf-text-dock';

interface DocDescription {
  meta: { name: string; size: number; source?: string } | null;
  info: { pages: number; signatures: number } | null;
  pdfa: boolean;
  fields: Record<string, string>;
  pageSize: { w: number; h: number } | null;
}

function buildMenu(anchor: HTMLElement, cls: string): HTMLDivElement {
  const menu = document.createElement('div');
  menu.className = `ecmenu ${cls}`;
  const rect = anchor.getBoundingClientRect();
  const app = document.getElementById('text-editor-app');
  if (!app) return menu;
  if (rect.top > window.innerHeight / 2) {
    menu.style.bottom = `${window.innerHeight - rect.top + 6}px`;
  } else {
    menu.style.top = `${rect.bottom + 6}px`;
  }
  menu.style.left = `${Math.max(8, rect.left)}px`;
  menu.addEventListener('click', (e) => e.stopPropagation());
  app.appendChild(menu);
  const dismiss = (e: MouseEvent) => {
    if (e.target === anchor || anchor.contains(e.target as Node)) return;
    menu.remove();
    window.removeEventListener('click', dismiss);
  };
  window.setTimeout(() => window.addEventListener('click', dismiss), 0);
  return menu;
}

function menuItem(
  label: string,
  checked: boolean,
  onPick: () => void,
  icon?: string
): HTMLButtonElement {
  const item = document.createElement('button');
  item.className = 'ecmenu-item';
  const mark = document.createElement('i');
  mark.className = checked ? 'ph ph-check' : 'ecmenu-blank';
  const text = document.createElement('span');
  text.textContent = label;
  if (icon) {
    const glyph = document.createElement('i');
    glyph.className = `ph ${icon} ecmenu-icon`;
    item.append(mark, glyph, text);
  } else {
    item.append(mark, text);
  }
  item.addEventListener('click', onPick);
  return item;
}

const SCOPES: [string, string, string][] = [
  ['text', 'Edit Text', 'ph-text-t'],
  ['image', 'Edit Images', 'ph-image'],
  ['shape', 'Edit Shapes', 'ph-shapes'],
];

function setupEditMenu() {
  const editBtn = document.querySelector<HTMLButtonElement>(
    '#tools [data-tool="edit"]'
  );
  const label = document.getElementById('editLabel');
  const scopeSel = document.getElementById(
    'editScope'
  ) as HTMLSelectElement | null;
  if (!editBtn || !label || !scopeSel) return;
  let picked = new Set<string>(['all']);
  const apply = () => {
    const value = [...picked].join(',');
    if (!scopeSel.querySelector(`option[value="${value}"]`)) {
      const opt = document.createElement('option');
      opt.value = value;
      scopeSel.appendChild(opt);
    }
    scopeSel.value = value;
    scopeSel.dispatchEvent(new Event('change'));
    label.textContent = picked.has('all')
      ? 'Edit All'
      : 'Edit ' +
        SCOPES.filter(([k]) => picked.has(k))
          .map(([, l]) => l.replace('Edit ', ''))
          .join(' + ');
  };
  let open: HTMLDivElement | null = null;
  const caret = editBtn.querySelector('.editcaret');
  const markOpen = (isOpen: boolean) => caret?.classList.toggle('up', isOpen);
  editBtn.addEventListener('click', () => {
    if (open?.isConnected) {
      open.remove();
      open = null;
      markOpen(false);
      return;
    }
    const menu = buildMenu(editBtn, 'editmenu');
    open = menu;
    markOpen(true);
    const watch = new MutationObserver(() => {
      if (!menu.isConnected) {
        markOpen(false);
        watch.disconnect();
      }
    });
    const host = menu.parentElement;
    if (host) watch.observe(host, { childList: true });
    const rebuild = () => {
      menu.replaceChildren();
      menu.appendChild(
        menuItem(
          'Edit All',
          picked.has('all'),
          () => {
            picked = new Set(['all']);
            apply();
            rebuild();
          },
          'ph-selection-all'
        )
      );
      for (const [key, lbl, glyph] of SCOPES) {
        menu.appendChild(
          menuItem(
            lbl,
            picked.has(key),
            () => {
              if (picked.has('all')) picked.clear();
              if (picked.has(key)) picked.delete(key);
              else picked.add(key);
              if (picked.size === 0 || picked.size === SCOPES.length)
                picked = new Set(['all']);
              apply();
              rebuild();
            },
            glyph
          )
        );
      }
    };
    rebuild();
  });
}

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200, 400];

function zoomRow(
  label: string,
  active: boolean,
  icon: string | null,
  onPick: () => void
) {
  const item = document.createElement('button');
  item.className = `ecmenu-item${active ? ' active' : ''}`;
  if (icon) {
    const i = document.createElement('i');
    i.className = `ph ${icon}`;
    item.appendChild(i);
  }
  const text = document.createElement('span');
  text.textContent = label;
  item.appendChild(text);
  item.addEventListener('click', onPick);
  return item;
}

function fitPage() {
  const stage = document.getElementById('stage');
  const wrap = document.getElementById('pageWrap');
  const mod = appModule;
  if (!stage || !wrap || !mod) return;
  const z = mod.getZoom();
  const pw = wrap.offsetWidth / z;
  const ph = wrap.offsetHeight / z;
  if (pw <= 0 || ph <= 0) return;
  mod.setZoom(
    Math.min((stage.clientWidth - 48) / pw, (stage.clientHeight - 48) / ph)
  );
}

function setupZoomMenu() {
  const btn = document.getElementById('zoomMenuBtn');
  const zoomLabel = document.getElementById('zoomLabel');
  if (!btn || !zoomLabel) return;
  let open: HTMLDivElement | null = null;
  btn.addEventListener('click', () => {
    if (open?.isConnected) {
      open.remove();
      open = null;
      return;
    }
    const current = parseInt(zoomLabel.textContent ?? '', 10);
    const menu = buildMenu(btn, 'zoommenu');
    open = menu;
    for (const pct of ZOOM_PRESETS) {
      menu.appendChild(
        zoomRow(`${pct}%`, current === pct, null, () => {
          appModule?.setZoom(pct / 100);
          menu.remove();
        })
      );
    }
    menu.appendChild(document.createElement('hr'));
    menu.appendChild(
      zoomRow('Fit to Page', false, 'ph-arrows-out', () => {
        fitPage();
        menu.remove();
      })
    );
    menu.appendChild(
      zoomRow('Fit to Width', false, 'ph-arrows-out-line-horizontal', () => {
        document.getElementById('zoomFit')?.click();
        menu.remove();
      })
    );
    menu.appendChild(document.createElement('hr'));
    const form = document.createElement('form');
    form.className = 'zoomcustom';
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '20';
    inp.max = '600';
    inp.placeholder = 'Custom Zoom';
    const pctSpan = document.createElement('span');
    pctSpan.textContent = '%';
    form.append(inp, pctSpan);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = parseFloat(inp.value);
      if (Number.isFinite(v) && v >= 20 && v <= 600) {
        appModule?.setZoom(v / 100);
        menu.remove();
      }
    });
    menu.appendChild(form);
    window.setTimeout(() => inp.focus(), 0);
  });
}

function setupBarCollapse() {
  const viewbar = document.getElementById('viewbar');
  const collapse = document.getElementById('vbCollapse');
  const restore = document.getElementById('vbRestore');
  if (!viewbar || !collapse || !restore) return;
  collapse.addEventListener('click', () => {
    viewbar.setAttribute('hidden', '');
    restore.removeAttribute('hidden');
  });
  restore.addEventListener('click', () => {
    viewbar.removeAttribute('hidden');
    restore.setAttribute('hidden', '');
  });
}

function formatPdfDate(raw: string): string {
  const m = raw.match(/D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
  if (!m) return raw;
  const [, y, mo, d, h, mi] = m;
  let out = `${y}`;
  if (mo) out = `${mo}/${d ?? '01'}/${y}`;
  if (h) out += `, ${h}:${mi ?? '00'}`;
  return out;
}

interface EditorAppModule {
  openFile: (file: File) => Promise<void>;
  engineReady: Promise<boolean>;
  setZoom: (z: number) => void;
  getZoom: () => number;
  getDocDescription: () => DocDescription;
  setOnSaved: (fn: ((kb: number, fileName: string) => void) | null) => void;
}

function relocateAddText() {
  const addTextBtn = document.querySelector<HTMLButtonElement>(
    '#tools [data-tool="addText"]'
  );
  const editBtn = document.querySelector<HTMLButtonElement>(
    '#tools [data-tool="edit"]'
  );
  const findBtn = document.getElementById('find');
  if (!addTextBtn || !editBtn || !findBtn?.parentElement) return;
  addTextBtn.replaceChildren();
  const icon = document.createElement('i');
  icon.className = 'ph ph-text-t';
  addTextBtn.appendChild(icon);
  addTextBtn.classList.add('btn', 'icon');
  addTextBtn.title = 'Add a text box';
  findBtn.parentElement.insertBefore(addTextBtn, findBtn);
  const sync = () =>
    addTextBtn.classList.toggle('on', !editBtn.classList.contains('on'));
  new MutationObserver(sync).observe(editBtn, {
    attributes: true,
    attributeFilter: ['class'],
  });
  sync();
}

function setupDocPanel() {
  const btn = document.getElementById('docInfoBtn');
  const app = document.getElementById('text-editor-app');
  if (!btn || !app) return;
  let overlay: HTMLDivElement | null = null;
  const close = () => {
    overlay?.remove();
    overlay = null;
  };
  btn.addEventListener('click', () => {
    if (overlay) {
      close();
      return;
    }
    const desc = appModule?.getDocDescription();
    if (!desc?.meta) return;
    overlay = document.createElement('div');
    overlay.id = 'docModalOverlay';
    overlay.addEventListener('click', close);
    const modal = document.createElement('div');
    modal.id = 'docModal';
    modal.addEventListener('click', (e) => e.stopPropagation());
    const head = document.createElement('div');
    head.className = 'docmodal-head';
    const title = document.createElement('span');
    title.textContent = 'Document Properties';
    const x = document.createElement('button');
    x.className = 'btn icon';
    x.title = 'Close';
    const xi = document.createElement('i');
    xi.className = 'ph ph-x';
    x.appendChild(xi);
    x.addEventListener('click', close);
    head.append(title, x);
    modal.appendChild(head);
    const f = desc.fields ?? {};
    const inch = (pt: number) => (pt / 72).toFixed(2);
    const groups: [string, [string, string][]][] = [
      [
        'Description',
        [
          ['File', desc.meta.name],
          ['Title', f.Title || '—'],
          ['Author', f.Author || '—'],
          ['Subject', f.Subject || '—'],
          ['Keywords', f.Keywords || '—'],
          ['Created', f.CreationDate ? formatPdfDate(f.CreationDate) : '—'],
          ['Modified', f.ModDate ? formatPdfDate(f.ModDate) : '—'],
          ['Application', f.Creator || '—'],
        ],
      ],
      [
        'Advanced',
        [
          ['PDF Producer', f.Producer || '—'],
          ['File Size', `${(desc.meta.size / 1024).toFixed(0)} KB`],
          [
            'Page Size',
            desc.pageSize
              ? `${inch(desc.pageSize.w)} × ${inch(desc.pageSize.h)} in`
              : '—',
          ],
          ['Number of Pages', desc.info?.pages ? String(desc.info.pages) : '—'],
          ...(desc.info?.signatures
            ? ([['Signatures', String(desc.info.signatures)]] as [
                string,
                string,
              ][])
            : []),
          ...(desc.pdfa
            ? ([['Conformance', 'PDF/A']] as [string, string][])
            : []),
        ],
      ],
    ];
    for (const [name, rows] of groups) {
      const sect = document.createElement('section');
      const h = document.createElement('h4');
      h.textContent = name;
      sect.appendChild(h);
      const dl = document.createElement('dl');
      for (const [k, v] of rows) {
        const dt = document.createElement('dt');
        dt.textContent = k;
        const dd = document.createElement('dd');
        dd.textContent = v;
        dl.append(dt, dd);
      }
      sect.appendChild(dl);
      modal.appendChild(sect);
    }
    overlay.appendChild(modal);
    app.appendChild(overlay);
  });
}

let appModule: EditorAppModule | null = null;

function closeEditor() {
  document.getElementById('text-editor-app')?.setAttribute('hidden', '');
  document.getElementById('uploader')?.classList.remove('hidden');
  document.getElementById('tool-landing')?.classList.remove('hidden');
}
let launching = false;

function fitMobileWidth() {
  const mod = appModule;
  const stage = document.getElementById('stage');
  const wrap = document.getElementById('pageWrap');
  if (!mod || !stage || !wrap) return;
  const w = wrap.getBoundingClientRect().width;
  if (!(w > 0) || !(stage.clientWidth > 0)) return;
  const target = Math.min(
    6,
    Math.max(0.2, mod.getZoom() * ((stage.clientWidth - 20) / w))
  );
  mod.setZoom(target);
}

async function launchEditor(file: File) {
  if (launching) return;
  launching = true;
  showLoader('Loading PDF Text Editor...');
  try {
    hideLoader();
    const decrypted = await batchDecryptIfNeeded([file]);
    if (decrypted.length === 0) return;
    showLoader('Loading PDF Text Editor...');
    document.getElementById('uploader')?.classList.add('hidden');
    document.getElementById('tool-landing')?.classList.add('hidden');
    document.getElementById('text-editor-app')?.removeAttribute('hidden');
    if (!appModule) {
      appModule = (await import('../editcore/app.js')) as EditorAppModule;
      appModule.setOnSaved((kb) => {
        showAlert(
          t('common.success'),
          t('tools:editPdfText.saved', { size: kb }),
          'success',
          () => {
            closeEditor();
          }
        );
      });
      relocateAddText();
      setupDocPanel();
      setupEditMenu();
      setupZoomMenu();
      setupBarCollapse();
    }
    const engineOk = await appModule.engineReady;
    if (!engineOk) {
      throw new Error('WASM engine failed to initialize');
    }
    await appModule.openFile(decrypted[0]);
    if (window.matchMedia('(max-width: 768px)').matches) fitMobileWidth();
  } catch (error) {
    console.error('Error loading PDF Text Editor:', error);
    showAlert(t('common.error'), t('tools:editPdfText.failedToLoad'));
    closeEditor();
  } finally {
    hideLoader();
    launching = false;
  }
}

function handleFiles(files: FileList) {
  const pdf = Array.from(files).find(
    (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
  );
  if (!pdf) {
    showAlert('Invalid File', 'Please upload a valid PDF file.');
    return;
  }
  void launchEditor(pdf);
}

function attachSteppers() {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    '#inspector input.num'
  );
  for (const input of inputs) {
    const wrap = document.createElement('div');
    wrap.className = 'stepper';
    input.replaceWith(wrap);
    const mk = (dir: -1 | 1, icon: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'stepbtn';
      b.tabIndex = -1;
      const i = document.createElement('i');
      i.className = `ph ${icon}`;
      b.appendChild(i);
      b.addEventListener('click', () => {
        if (input.disabled || input.value === '') return;
        if (dir > 0) input.stepUp();
        else input.stepDown();
        input.dispatchEvent(new Event('change'));
      });
      return b;
    };
    const col = document.createElement('div');
    col.className = 'stepcol';
    col.append(mk(1, 'ph-caret-up'), mk(-1, 'ph-caret-down'));
    wrap.append(input, col);
  }
}

function showMobileHistory() {
  const undo = document.getElementById('undo');
  const redo = document.getElementById('redo');
  const host = document.getElementById('save')?.parentElement;
  if (!undo || !redo || !host) return;
  for (const b of [undo, redo]) {
    b.removeAttribute('hidden');
    b.classList.add('btn', 'icon');
  }
  host.append(undo, redo);
}

function initializePage() {
  createIcons({ icons });
  attachSteppers();

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');

  if (fileInput) {
    const onPick = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        handleFiles(input.files);
      }
    };
    fileInput.addEventListener('change', onPick);
    fileInput.addEventListener('input', onPick);
    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-indigo-500');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-indigo-500');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-500');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    });
  }

  for (const id of ['stage', 'inspector']) {
    const el = document.getElementById(id);
    if (!el) continue;
    let timer = 0;
    el.addEventListener(
      'scroll',
      () => {
        el.classList.add('is-scrolling');
        window.clearTimeout(timer);
        timer = window.setTimeout(
          () => el.classList.remove('is-scrolling'),
          700
        );
      },
      { passive: true }
    );
  }

  const inspector = document.getElementById('inspector');
  const toggleInspector = document.getElementById('toggleInspector');
  if (inspector && toggleInspector) {
    toggleInspector.classList.add('on');
    toggleInspector.addEventListener('click', () => {
      inspector.classList.toggle('collapsed');
      toggleInspector.classList.toggle(
        'on',
        !inspector.classList.contains('collapsed')
      );
    });
    if (window.matchMedia('(max-width: 768px)').matches) {
      toggleInspector.classList.remove('on');
      setupFormatDock();
      setupFindSheet();
      showMobileHistory();
    }
  }

  const findBtn = document.getElementById('find');
  const findbar = document.getElementById('findbar');
  if (findBtn && findbar) {
    const sync = () => findBtn.classList.toggle('on', !findbar.hidden);
    new MutationObserver(sync).observe(findbar, {
      attributes: true,
      attributeFilter: ['hidden'],
    });
    sync();
  }

  const hud = document.getElementById('zoomHud');
  if (hud) {
    hud.removeAttribute('hidden');
    let hudTimer = 0;
    const flash = (text: string) => {
      if (!document.getElementById('viewbar')?.hidden) return;
      if (!text || text.includes('–')) return;
      hud.textContent = text;
      hud.classList.add('show');
      window.clearTimeout(hudTimer);
      hudTimer = window.setTimeout(() => hud.classList.remove('show'), 900);
    };
    for (const id of ['zoomLabel', 'pageLabel']) {
      const label = document.getElementById(id);
      if (!label) continue;
      let last = label.textContent ?? '';
      new MutationObserver(() => {
        const now = label.textContent ?? '';
        if (now === last) return;
        last = now;
        if (document.activeElement === label) return;
        flash(now);
      }).observe(label, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  }

  const pageLabel = document.getElementById('pageLabel');
  const pageInput = document.getElementById(
    'pageInput'
  ) as HTMLInputElement | null;
  const pageTotal = document.getElementById('pageTotal');
  if (pageLabel && pageInput && pageTotal) {
    const parse = () => {
      const parts = (pageLabel.textContent ?? '').split('/');
      return {
        current: parseInt(parts[0] ?? '', 10),
        total: parseInt(parts[1] ?? '', 10),
      };
    };
    const sync = () => {
      const { current, total } = parse();
      if (!Number.isFinite(current) || !Number.isFinite(total)) return;
      if (document.activeElement !== pageInput)
        pageInput.value = String(current);
      pageInput.max = String(total);
      pageTotal.textContent = `/ ${total}`;
    };
    new MutationObserver(sync).observe(pageLabel, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    sync();
    pageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        sync();
        pageInput.blur();
        return;
      }
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const { current, total } = parse();
      const target = parseInt(pageInput.value, 10);
      pageInput.blur();
      if (
        !Number.isFinite(current) ||
        !Number.isFinite(total) ||
        !Number.isFinite(target)
      ) {
        sync();
        return;
      }
      const clamped = Math.min(Math.max(target, 1), total);
      const delta = clamped - current;
      if (delta === 0) {
        sync();
        return;
      }
      const btn = document.getElementById(delta > 0 ? 'next' : 'prev');
      for (let i = 0; i < Math.abs(delta); i++) btn?.click();
    });
    pageInput.addEventListener('blur', sync);
  }

  const findText = document.getElementById(
    'findText'
  ) as HTMLInputElement | null;
  if (findText) {
    let searchTimer = 0;
    findText.addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      if (!findText.value.trim()) return;
      searchTimer = window.setTimeout(() => {
        document.getElementById('findNext')?.click();
      }, 350);
    });
  }

  const stage = document.getElementById('stage');
  const pageWrap = document.getElementById('pageWrap');
  if (stage && pageWrap) {
    let commitTimer = 0;
    let gestureScale = 1;
    let active = false;
    let focusX = 0;
    let focusY = 0;
    const beginGesture = (clientX: number, clientY: number) => {
      active = true;
      gestureScale = 1;
      const wrapRect = pageWrap.getBoundingClientRect();
      focusX = clientX - wrapRect.left;
      focusY = clientY - wrapRect.top;
      pageWrap.style.transformOrigin = `${focusX}px ${focusY}px`;
      pageWrap.style.willChange = 'transform';
    };
    const commitGesture = () => {
      active = false;
      const mod = appModule;
      if (!mod) return;
      const startZoom = mod.getZoom();
      const target = Math.min(6, Math.max(0.2, startZoom * gestureScale));
      const applied = target / startZoom;
      const preLeft = stage.scrollLeft;
      const preTop = stage.scrollTop;
      pageWrap.style.transform = '';
      pageWrap.style.willChange = '';
      mod.setZoom(target);
      stage.scrollLeft = preLeft + focusX * (applied - 1);
      stage.scrollTop = preTop + focusY * (applied - 1);
      gestureScale = 1;
    };
    stage.addEventListener(
      'wheel',
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        if (!appModule) return;
        if (!active) beginGesture(e.clientX, e.clientY);
        else window.clearTimeout(commitTimer);
        gestureScale *= 1 - e.deltaY * 0.01;
        gestureScale = Math.max(0.1, Math.min(10, gestureScale));
        pageWrap.style.transform = `scale(${gestureScale})`;
        commitTimer = window.setTimeout(commitGesture, 150);
      },
      { passive: false }
    );
    let pinchD0 = 0;
    let pinchBase = 1;
    stage.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 2 || !appModule) return;
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        pinchD0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (!(pinchD0 > 0)) return;
        window.clearTimeout(commitTimer);
        if (!active) {
          beginGesture(
            (a.clientX + b.clientX) / 2,
            (a.clientY + b.clientY) / 2
          );
        }
        pinchBase = gestureScale;
      },
      { passive: false }
    );
    stage.addEventListener(
      'touchmove',
      (e) => {
        if (!active || e.touches.length !== 2 || !(pinchD0 > 0)) return;
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        gestureScale = Math.max(0.1, Math.min(10, pinchBase * (d / pinchD0)));
        pageWrap.style.transform = `scale(${gestureScale})`;
      },
      { passive: false }
    );
    const endPinch = (e: TouchEvent) => {
      if (!active || !(pinchD0 > 0)) return;
      if (e.touches.length >= 2) return;
      pinchD0 = 0;
      window.clearTimeout(commitTimer);
      commitTimer = window.setTimeout(commitGesture, 60);
    };
    stage.addEventListener('touchend', endPinch);
    stage.addEventListener('touchcancel', endPinch);
  }

  const mainEl = document.getElementById('main');
  if (mainEl) {
    const DRAG_SEL =
      '.obj-handle,.rot-handle,.para-handle,.edit-move,.multi-box,.obj-box,.sel-para';
    mainEl.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        const t = e.target as HTMLElement | null;
        const grip = t?.closest?.(DRAG_SEL) as HTMLElement | null;
        if (!grip) return;
        e.preventDefault();
        const tt = e.touches[0];
        grip.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            clientX: tt.clientX,
            clientY: tt.clientY,
            buttons: 1,
          })
        );
        const move = (ev: TouchEvent) => {
          ev.preventDefault();
          const m = ev.touches[0];
          if (!m) return;
          window.dispatchEvent(
            new MouseEvent('mousemove', {
              clientX: m.clientX,
              clientY: m.clientY,
              buttons: 1,
            })
          );
        };
        const end = (ev: TouchEvent) => {
          const m = ev.changedTouches[0];
          window.dispatchEvent(
            new MouseEvent('mouseup', {
              clientX: m?.clientX ?? tt.clientX,
              clientY: m?.clientY ?? tt.clientY,
            })
          );
          grip.removeEventListener('touchmove', move);
          grip.removeEventListener('touchend', end);
          grip.removeEventListener('touchcancel', end);
        };
        grip.addEventListener('touchmove', move, { passive: false });
        grip.addEventListener('touchend', end);
        grip.addEventListener('touchcancel', end);
      },
      { passive: false }
    );
  }

  if (window.visualViewport) {
    let kbTimer = 0;
    let lastVh = window.visualViewport.height;
    const app = document.getElementById('text-editor-app');
    window.visualViewport.addEventListener('resize', () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const shrunk = vv.height < lastVh - 80;
      lastVh = vv.height;
      app?.classList.toggle('kb-open', window.innerHeight - vv.height > 150);
      if (!shrunk) return;
      window.clearTimeout(kbTimer);
      kbTimer = window.setTimeout(() => {
        const ed = document.querySelector('#overlay .editor');
        ed?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 120);
    });
  }

  document.getElementById('back-to-tools')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });

  document.getElementById('exitEditor')?.addEventListener('click', () => {
    window.location.reload();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}
