/**
 * Message contract for `office-editor.worker.js` - the worker that drives
 * LibreOfficeKit directly for real document editing.
 *
 * LibreOfficeKit measures everything in twips: 1440 per inch, 1 twip = 1/20
 * point. Coordinates on every message below are twips unless named `...Pixel`.
 */

/** LOK key event types (`LibreOfficeKitKeyEventType`). */
declare const enum LokKeyEvent {
  Input = 0,
  Up = 1,
}

/** LOK mouse event types (`LibreOfficeKitMouseEventType`). */
declare const enum LokMouseEvent {
  ButtonDown = 0,
  ButtonUp = 1,
  Move = 2,
}

/** LOK selection anchors (`LibreOfficeKitSetTextSelectionType`). */
declare const enum LokSetSelection {
  Start = 0,
  End = 1,
  Reset = 2,
}

interface LokWasmPaths {
  sofficeJs: string;
  /** Blob URL of the decompressed WASM binary. */
  sofficeWasm: string;
  /** Blob URL of the decompressed VFS data package. */
  sofficeData: string;
  sofficeWorkerJs: string;
}

interface LokDocumentSize {
  width: number;
  height: number;
}

/** One event drained from LOK's callback queue. */
interface LokCallbackEvent {
  /** Raw `LibreOfficeKitCallbackType` value. */
  type: number;
  payload: string;
}

type OfficeEditorRequest =
  | { id: number; type: 'init'; paths: LokWasmPaths }
  | { id: number; type: 'open'; bytes: Uint8Array; ext: string }
  | {
      id: number;
      type: 'key';
      eventType: LokKeyEvent;
      charCode: number;
      keyCode: number;
    }
  | { id: number; type: 'type'; text: string }
  | {
      id: number;
      type: 'mouse';
      eventType: LokMouseEvent;
      x: number;
      y: number;
      count?: number;
      buttons?: number;
      modifier?: number;
    }
  | { id: number; type: 'uno'; command: string; args?: string }
  | {
      id: number;
      type: 'setSelection';
      selectionType: LokSetSelection;
      x: number;
      y: number;
    }
  | { id: number; type: 'resetSelection' }
  | { id: number; type: 'selection' }
  | { id: number; type: 'text' }
  | { id: number; type: 'commandValues'; command: string }
  | {
      id: number;
      type: 'zoom';
      tilePixelWidth: number;
      tilePixelHeight: number;
      tileTwipWidth: number;
      tileTwipHeight: number;
    }
  | {
      id: number;
      type: 'paint';
      canvasWidth: number;
      canvasHeight: number;
      tileX: number;
      tileY: number;
      tileWidth: number;
      tileHeight: number;
    }
  | { id: number; type: 'callbacks' }
  | { id: number; type: 'documentSize' }
  | { id: number; type: 'save'; format: string }
  | { id: number; type: 'close' };

/** Sent once when the worker script has evaluated, before `init`. */
interface OfficeEditorReady {
  type: 'ready';
}

/** Progress ping while opening, which takes a noticeable moment. */
interface OfficeEditorStep {
  type: 'step';
  step: string;
}

interface OfficeEditorFailure {
  id: number;
  ok: false;
  error: string;
}

type OfficeEditorSuccess = { id: number; ok: true } & (
  | { version: string }
  | {
      documentType: number;
      parts: number;
      editMode: number;
      size: LokDocumentSize;
    }
  | { text: string }
  | { text: string; selectionType: number }
  | { value: string | null }
  | { pixels: Uint8Array; width: number; height: number }
  | { events: LokCallbackEvent[] }
  | LokDocumentSize
  | { data: Uint8Array }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  | {}
);

type OfficeEditorResponse =
  | OfficeEditorReady
  | OfficeEditorStep
  | OfficeEditorSuccess
  | OfficeEditorFailure;
