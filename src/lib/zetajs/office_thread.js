import { ZetaHelperMain } from '@zetajs/zetaHelper.js';

// Elements
const canvas = document.getElementById('qtcanvas');
const input = document.getElementById('input');
const fileButton = document.getElementById('file-button');
const downloadCheckbox = document.getElementById('download');
const iframe = document.getElementById('frame');

// Path to your WASM package (adjust if using Vite/public folder)
const wasmPkg = 'url:./static/'; // points to src/static when served over HTTP

// Initialize ZetaHelper
const zHM = new ZetaHelperMain('./src/office_thread.js', {
  threadJsType: 'module',
  wasmPkg
});

// Handle file upload
input.onchange = () => {
  input.disabled = true;
  const file = input.files[0];
  if (!file) return;

  let name = file.name;
  let from = '/tmp/input';
  const n = name.lastIndexOf('.');
  if (n > 0) {
    from += name.substring(n);
    name = name.substring(0, n);
  }

  file.arrayBuffer().then(data => {
    // Write file to in-browser filesystem
    window.FS.writeFile(from, new Uint8Array(data));

    // Send convert command to office_thread
    zHM.thrPort.postMessage({ cmd: 'convert', name, from, to: '/tmp/output' });
  });
};

// Start ZetaHelper
zHM.start(() => {
  zHM.thrPort.onmessage = (e) => {
    switch (e.data.cmd) {

      case 'converted':
        try { window.FS.unlink(e.data.from); } catch {}
        const data = window.FS.readFile(e.data.to);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Open PDF in iframe
        iframe.contentWindow.location.href = url;

        // Optional download
        if (downloadCheckbox.checked) {
          const a = document.createElement('a');
          a.href = url;
          a.download = `${e.data.name || 'output'}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }

        try { window.FS.unlink(e.data.to); } catch {}
        URL.revokeObjectURL(url);
        break;

      case 'start':
        input.disabled = false;
        fileButton.disabled = false;
        break;

      default:
        console.error('Unknown message command:', e.data.cmd);
    }
  };
});
