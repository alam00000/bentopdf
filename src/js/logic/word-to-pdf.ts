import { ZetaHelperMain } from '../../lib/zetajs/zetaHelper';

/**
 * Wait until all specified DOM elements exist.
 */
function waitForElements(ids: string[], timeout = 5000): Promise<Record<string, HTMLElement>> {
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

/**
 * Setup Word → PDF tool (works multiple times without reload)
 */
export async function setupWordToPdfTool() {
  let elements;
  try {
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

  // ✅ Handle file uploads repeatedly
  input.onchange = async () => {
    if (!input.files || input.files.length === 0) {
      console.error('No file selected.');
      return;
    }

    input.disabled = true;

    // 🧩 Create a *fresh* ZetaHelper for each file
    const zHM = new ZetaHelperMain('/static/office_thread.js', {
      threadJsType: 'module',
      wasmPkg: 'url:/static/'
    });

    const file = input.files[0];
    let name = file.name;
    let from = '/tmp/input';
    const n = name.lastIndexOf('.');
    if (n > 0) {
      from += name.substring(n);
      name = name.substring(0, n);
    }

    // Start ZetaHelper thread
    zHM.start(() => {
      file.arrayBuffer().then(data => {
        try {
          window.FS.writeFile(from, new Uint8Array(data));
        } catch (e) {
          console.error('Error writing file to FS:', e);
          input.disabled = false;
          return;
        }

        // Send conversion command
        zHM.thrPort.postMessage({ cmd: 'convert', name, from, to: '/tmp/output' });
      });

      // Handle messages from worker
      zHM.thrPort.onmessage = (e) => {
        switch (e.data.cmd) {
          case 'converted':
            try { window.FS.unlink(e.data.from); } catch {}
            const data = window.FS.readFile(e.data.to);
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Show PDF
            iframe.src = url;
            wordToPdfOutput.classList.remove('hidden');

            // Optional download
            if (downloadCheckbox.checked) {
              const a = document.createElement('a');
              a.href = url;
              a.download = `${e.data.name || 'output'}.pdf`;
              a.click();
            }

            try { window.FS.unlink(e.data.to); } catch {}
            input.disabled = false;

            // 🧹 Clean up worker
            zHM.terminate();
            break;

          case 'start':
            input.disabled = false;
            break;

          default:
            console.error('Unknown command:', e.data.cmd);
        }
      };
    });
  };
}
