/**
 * LibreOffice editing worker.
 *
 * The converter package ships a worker with a fixed message API - convert,
 * render, a handful of structured editor operations - and no way to reach the
 * rest of LibreOfficeKit. This worker talks to the same WASM build directly,
 * through the `_lok_*` C shims it exports, and exposes the input surface a
 * real editor needs: key events, mouse events, arbitrary UNO commands, tile
 * painting and the callback queue.
 *
 * It must run in a worker. LibreOffice needs its own event loop; driving these
 * calls from the main thread hangs at the first createView().
 *
 * Message in:  { id, type, ... }   Message out: { id, ok, ... } | { type: 'ready' }
 */

/* eslint-env worker */
/* global importScripts */

'use strict';

// --- LOK constants ---------------------------------------------------------

// LibreOfficeKit works in twips: 1440 per inch, 1 twip = 1/20 point.
const TWIPS_PER_INCH = 1440;

const KEY_EVENT = { input: 0, up: 1 };
const MOUSE_EVENT = { buttonDown: 0, buttonUp: 1, move: 2 };
const SET_SELECTION = { start: 0, end: 1, reset: 2 };

let wasm = null;
let lokPtr = 0;
let docPtr = 0;
let currentPath = '';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// --- WASM memory helpers ---------------------------------------------------

const heapU8 = () => wasm.HEAPU8;

const allocString = (str) => {
  const bytes = textEncoder.encode(str + '\0');
  const ptr = wasm._malloc(bytes.length);
  heapU8().set(bytes, ptr);
  return ptr;
};

const readString = (ptr) => {
  if (!ptr) return null;
  const heap = heapU8();
  let end = ptr;
  while (heap[end] !== 0) end += 1;
  return textDecoder.decode(heap.slice(ptr, end));
};

/** Runs `fn` with temporary C strings and always frees them. */
const withStrings = (values, fn) => {
  const pointers = values.map(allocString);
  try {
    return fn(...pointers);
  } finally {
    for (const ptr of pointers) wasm._free(ptr);
  }
};

const fileUrl = (path) => `file://${path.startsWith('/') ? path : `/${path}`}`;

// --- LOK calls -------------------------------------------------------------

const lok = {
  postKey: (type, charCode, keyCode) =>
    wasm._lok_documentPostKeyEvent(docPtr, type, charCode, keyCode),

  postMouse: (type, x, y, count, buttons, modifier) =>
    wasm._lok_documentPostMouseEvent(
      docPtr,
      type,
      x,
      y,
      count,
      buttons,
      modifier
    ),

  postUno: (command, args) =>
    withStrings([command, args || '{}'], (cmdPtr, argsPtr) =>
      wasm._lok_documentPostUnoCommand(docPtr, cmdPtr, argsPtr, 0)
    ),

  setTextSelection: (type, x, y) =>
    wasm._lok_documentSetTextSelection(docPtr, type, x, y),

  resetSelection: () => wasm._lok_documentResetSelection(docPtr),

  getSelectionType: () => wasm._lok_documentGetSelectionType(docPtr),

  getTextSelection: (mimeType = 'text/plain;charset=utf-8') => {
    const usedMimePtr = wasm._malloc(4);
    try {
      return withStrings([mimeType], (mimePtr) => {
        const resultPtr = wasm._lok_documentGetTextSelection(
          docPtr,
          mimePtr,
          usedMimePtr
        );
        if (!resultPtr) return null;
        const value = readString(resultPtr);
        wasm._free(resultPtr);
        return value;
      });
    } finally {
      wasm._free(usedMimePtr);
    }
  },

  getCommandValues: (command) =>
    withStrings([command], (cmdPtr) => {
      const resultPtr = wasm._lok_documentGetCommandValues(docPtr, cmdPtr);
      if (!resultPtr) return null;
      const value = readString(resultPtr);
      wasm._free(resultPtr);
      return value;
    }),

  documentSize: () => {
    const ptr = wasm._malloc(8);
    try {
      wasm._lok_documentGetDocumentSize(docPtr, ptr, ptr + 4);
      return {
        width: wasm.HEAP32[ptr >> 2] ?? 0,
        height: wasm.HEAP32[(ptr + 4) >> 2] ?? 0,
      };
    } finally {
      wasm._free(ptr);
    }
  },

  setClientZoom: (
    tilePixelWidth,
    tilePixelHeight,
    tileTwipWidth,
    tileTwipHeight
  ) =>
    wasm._lok_documentSetClientZoom(
      docPtr,
      tilePixelWidth,
      tilePixelHeight,
      tileTwipWidth,
      tileTwipHeight
    ),

  paintTile: (
    canvasWidth,
    canvasHeight,
    tileX,
    tileY,
    tileWidth,
    tileHeight
  ) => {
    const size = canvasWidth * canvasHeight * 4;
    const bufferPtr = wasm._malloc(size);
    if (!bufferPtr)
      throw new Error(`Could not allocate ${size} bytes for a tile`);
    try {
      wasm._lok_documentPaintTile(
        docPtr,
        bufferPtr,
        canvasWidth,
        canvasHeight,
        tileX,
        tileY,
        tileWidth,
        tileHeight
      );
      // Copy out of the WASM heap - it can move underneath us.
      return new Uint8Array(heapU8().subarray(bufferPtr, bufferPtr + size));
    } finally {
      wasm._free(bufferPtr);
    }
  },

  pollCallbacks: () => {
    const events = [];
    if (!wasm._lok_pollCallback) return events;
    const bufferSize = 4096;
    const payloadPtr = wasm._malloc(bufferSize);
    const lengthPtr = wasm._malloc(4);
    try {
      for (;;) {
        const type = wasm._lok_pollCallback(payloadPtr, bufferSize, lengthPtr);
        if (type === -1) break;
        const length = Math.min(
          wasm.HEAP32[lengthPtr >> 2] ?? 0,
          bufferSize - 1
        );
        events.push({
          type,
          payload:
            length > 0
              ? textDecoder.decode(
                  heapU8().slice(payloadPtr, payloadPtr + length)
                )
              : '',
        });
      }
    } finally {
      wasm._free(payloadPtr);
      wasm._free(lengthPtr);
    }
    return events;
  },
};

// --- lifecycle -------------------------------------------------------------

const loadModule = (paths) =>
  new Promise((resolve, reject) => {
    self.Module = {
      mainScriptUrlOrBlob: paths.sofficeJs,
      locateFile: (name) => {
        if (name.endsWith('.wasm')) return paths.sofficeWasm;
        if (name.endsWith('.data')) return paths.sofficeData;
        if (name.includes('.worker.')) return paths.sofficeWorkerJs;
        return (
          paths.sofficeJs.slice(0, paths.sofficeJs.lastIndexOf('/') + 1) + name
        );
      },
      print: () => {},
      printErr: () => {},
      onAbort: (reason) => reject(new Error(`WASM aborted: ${reason}`)),
    };

    importScripts(paths.sofficeJs);

    const timeout = setTimeout(
      () => reject(new Error('Timed out initialising the LibreOffice runtime')),
      180000
    );
    const done = () => {
      clearTimeout(timeout);
      resolve(self.Module);
    };
    if (self.Module.calledRun) done();
    else {
      const previous = self.Module.onRuntimeInitialized;
      self.Module.onRuntimeInitialized = () => {
        previous?.();
        done();
      };
    }
  });

const initEngine = async (paths) => {
  wasm = await loadModule(paths);

  for (const dir of ['/tmp', '/tmp/input', '/tmp/output']) {
    try {
      wasm.FS.mkdir(dir);
    } catch {
      // already there
    }
  }

  lokPtr = withStrings(['/instdir/program'], (ptr) =>
    wasm._libreofficekit_hook(ptr)
  );
  if (!lokPtr) throw new Error('Failed to initialise LibreOfficeKit');
};

/**
 * Opens a document for editing.
 *
 * The order here is load-bearing and was derived from the engine's own working
 * diagnostic: a view has to be created and selected, edit mode has to be set
 * explicitly, and a mouse click is needed to give the view focus. Miss any of
 * them and key events and selections are silently ignored.
 */
const step = (name) => self.postMessage({ type: 'step', step: name });

const openDocument = ({ bytes, ext }) => {
  step('close-previous');
  closeDocument();

  currentPath = `/tmp/input/document.${ext || 'docx'}`;
  const incoming = new Uint8Array(bytes);
  step(`write-file: ${incoming.byteLength} bytes`);
  if (!incoming.byteLength) {
    throw new Error(
      'The document arrived empty - its buffer was probably detached in transit'
    );
  }
  wasm.FS.writeFile(currentPath, incoming);
  step(`wrote: ${wasm.FS.stat(currentPath).size} bytes on disk`);

  step('document-load');
  docPtr = withStrings([fileUrl(currentPath)], (ptr) =>
    wasm._lok_documentLoad(lokPtr, ptr)
  );
  if (!docPtr) {
    const errPtr = wasm._lok_getError?.(lokPtr);
    throw new Error(readString(errPtr) || 'Failed to open the document');
  }

  step('init-rendering');
  withStrings([''], (ptr) =>
    wasm._lok_documentInitializeForRendering(docPtr, ptr)
  );

  step('views');
  const existingView = wasm._lok_documentGetView(docPtr);
  if (existingView >= 0) wasm._lok_documentSetView(docPtr, existingView);
  const view = wasm._lok_documentCreateView(docPtr);
  if (view >= 0) wasm._lok_documentSetView(docPtr, view);

  step('edit-mode');
  wasm._lok_documentSetEditMode(docPtr, 1);
  wasm._lok_documentRegisterCallback(docPtr);
  wasm._lok_clearCallbackQueue?.();
  wasm._lok_enableSyncEvents?.();

  step('focus-click');
  // Give the view focus, without which typing goes nowhere.
  lok.postMouse(MOUSE_EVENT.buttonDown, 1000, 1000, 1, 1, 0);
  lok.postMouse(MOUSE_EVENT.buttonUp, 1000, 1000, 1, 1, 0);

  step('describe');
  return {
    documentType: wasm._lok_documentGetDocumentType(docPtr),
    parts: wasm._lok_documentGetParts(docPtr),
    editMode: wasm._lok_documentGetEditMode(docPtr),
    size: lok.documentSize(),
  };
};

const closeDocument = () => {
  if (!docPtr) return;
  try {
    wasm._lok_documentUnregisterCallback?.(docPtr);
    wasm._lok_documentDestroy(docPtr);
  } catch {
    // closing a dead document is not worth reporting
  }
  docPtr = 0;
};

/** Reads the whole document by selecting it and lifting the selection text. */
const readAllText = () => {
  lok.postUno('.uno:SelectAll');
  const text = lok.getTextSelection();
  lok.resetSelection();
  return text ?? '';
};

const saveAs = (format) => {
  const outputPath = `/tmp/output/document.${format}`;
  const ok = withStrings(
    [fileUrl(outputPath), format, ''],
    (urlPtr, formatPtr, optsPtr) =>
      wasm._lok_documentSaveAs(docPtr, urlPtr, formatPtr, optsPtr)
  );
  if (!ok) throw new Error(`LibreOffice could not save as ${format}`);
  const data = wasm.FS.readFile(outputPath);
  wasm.FS.unlink(outputPath);
  return data;
};

// --- message dispatch ------------------------------------------------------

const HANDLERS = {
  init: async (msg) => {
    await initEngine(msg.paths);
    return { version: 'lok-editor-1' };
  },
  open: (msg) => openDocument(msg),
  key: (msg) => {
    lok.postKey(msg.eventType, msg.charCode, msg.keyCode);
    return {};
  },
  type: (msg) => {
    // Convenience: send a whole string as key events.
    for (const ch of String(msg.text)) {
      const code = ch.codePointAt(0);
      lok.postKey(KEY_EVENT.input, code, 0);
      lok.postKey(KEY_EVENT.up, code, 0);
    }
    return {};
  },
  mouse: (msg) => {
    lok.postMouse(
      msg.eventType,
      msg.x,
      msg.y,
      msg.count ?? 1,
      msg.buttons ?? 1,
      msg.modifier ?? 0
    );
    return {};
  },
  uno: (msg) => {
    lok.postUno(msg.command, msg.args);
    return {};
  },
  setSelection: (msg) => {
    lok.setTextSelection(msg.selectionType, msg.x, msg.y);
    return {};
  },
  resetSelection: () => {
    lok.resetSelection();
    return {};
  },
  selection: () => ({
    text: lok.getTextSelection() ?? '',
    selectionType: lok.getSelectionType(),
  }),
  text: () => ({ text: readAllText() }),
  commandValues: (msg) => ({ value: lok.getCommandValues(msg.command) }),
  zoom: (msg) => {
    lok.setClientZoom(
      msg.tilePixelWidth,
      msg.tilePixelHeight,
      msg.tileTwipWidth,
      msg.tileTwipHeight
    );
    return {};
  },
  paint: (msg) => {
    const pixels = lok.paintTile(
      msg.canvasWidth,
      msg.canvasHeight,
      msg.tileX,
      msg.tileY,
      msg.tileWidth,
      msg.tileHeight
    );
    return {
      pixels,
      width: msg.canvasWidth,
      height: msg.canvasHeight,
      transfer: [pixels.buffer],
    };
  },
  callbacks: () => {
    wasm._lok_flushCallbacks?.(docPtr);
    return { events: lok.pollCallbacks() };
  },
  documentSize: () => lok.documentSize(),
  /** Re-assert the editing view after an event that may have stolen focus. */
  reassert: () => {
    const view = wasm._lok_documentGetView(docPtr);
    if (view >= 0) wasm._lok_documentSetView(docPtr, view);
    wasm._lok_documentSetEditMode(docPtr, 1);
    return {};
  },
  editState: () => ({
    editMode: wasm._lok_documentGetEditMode(docPtr),
    view: wasm._lok_documentGetView(docPtr),
    views: wasm._lok_documentGetViewsCount?.(docPtr) ?? -1,
  }),
  save: (msg) => {
    const data = saveAs(msg.format || 'docx');
    return { data, transfer: [data.buffer] };
  },
  close: () => {
    closeDocument();
    return {};
  },
};

self.onmessage = async (event) => {
  const msg = event.data;
  const handler = HANDLERS[msg.type];
  if (!handler) {
    self.postMessage({
      id: msg.id,
      ok: false,
      error: `Unknown message: ${msg.type}`,
    });
    return;
  }
  try {
    const result = (await handler(msg)) ?? {};
    const transfer = result.transfer ?? [];
    delete result.transfer;
    self.postMessage({ id: msg.id, ok: true, ...result }, transfer);
  } catch (error) {
    self.postMessage({
      id: msg.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

self.postMessage({ type: 'ready' });
