import { ZetaHelperMain } from '../../lib/zetajs/zetaHelper';

async function waitForSofficeLoaded(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      if ((window as any).sofficeLoaded) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject('Timeout waiting for soffice.wasm to load.');
      } else {
        requestAnimationFrame(check);
      }
    }
    check();
  });
}

async function waitForElements(ids: string[], timeout = 5000): Promise<Record<string, HTMLElement>> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function check() {
      const elements: Record<string, HTMLElement> = {};
      let allFound = true;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) allFound = false;
        else elements[id] = el;
      }

      if (allFound) resolve(elements);
      else if (Date.now() - start > timeout) reject('Timeout waiting for DOM elements: ' + ids.join(', '));
      else requestAnimationFrame(check);
    }

    check();
  });
}

export async function setupWordToPdfTool() {
  let elements: Record<string, HTMLElement>;
  try {
    await waitForSofficeLoaded();
    elements = await waitForElements([
      'qtcanvas',
      'file-input',
      'download',
      'frame',
      'word-to-pdf-output'
    ]);
  } catch (err) {
    console.error(err);
    return;
  }

  const {
    qtcanvas: canvas,
    'file-input': input,
    download: downloadCheckbox,
    frame: iframe,
    'word-to-pdf-output': wordToPdfOutput
  } = elements;

  const zHM = new ZetaHelperMain('/static/office_thread.js', {
    threadJsType: 'module',
    wasmPkg: 'url:/static/'
  });

  // Assign thrPort.onmessage immediately
  zHM.thrPort.onmessage = (e: MessageEvent) => {
    const data = e.data;
    switch (data.cmd) {
      case 'converted':
        try { (window as any).FS.unlink(data.from); } catch {}
        const fileData = (window as any).FS.readFile(data.to);
        const blob = new Blob([fileData], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Show PDF in iframe
        (iframe as HTMLIFrameElement).src = url;
        wordToPdfOutput.classList.remove('hidden');

        // Download if checkbox is checked
        if ((downloadCheckbox as HTMLInputElement).checked) {
          const a = document.createElement('a');
          a.href = url;
          a.download = `${data.name || 'output'}.pdf`;
          a.click();
        }

        try { (window as any).FS.unlink(data.to); } catch {}
        (input as HTMLInputElement).disabled = false;
        break;

      case 'start':
        // Internal message, can ignore
        break;

      default:
        console.warn('Unknown command from WASM:', data.cmd);
    }
  };

  // Wait for ZetaHelper to initialize
  await new Promise<void>(resolve => zHM.start(resolve));

  // Handle file selection
  (input as HTMLInputElement).onchange = async () => {
    const inputEl = input as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) {
      console.error('No file selected.');
      return;
    }

    inputEl.disabled = true;
    const file = inputEl.files[0];
    let name = file.name;
    let from = '/tmp/input';
    const n = name.lastIndexOf('.');
    if (n > 0) {
      from += name.substring(n);
      name = name.substring(0, n);
    }

    const arrayBuffer = await file.arrayBuffer();
    if (!(window as any).FS) {
      console.error('FS not initialized yet.');
      inputEl.disabled = false;
      return;
    }

    (window as any).FS.writeFile(from, new Uint8Array(arrayBuffer));
    zHM.thrPort.postMessage({ cmd: 'convert', name, from, to: '/tmp/output' });
  };
}
