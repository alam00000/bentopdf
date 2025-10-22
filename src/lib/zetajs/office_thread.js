import { ZetaHelperMain } from '@zetajs/zetaHelper.js';

// Elements
const canvas = document.getElementById('qtcanvas');
const input = document.getElementById('input');
const fileButton = document.getElementById('file-button');
const downloadCheckbox = document.getElementById('download');
const iframe = document.getElementById('frame');

const wasmPkg = 'url:./static/'; // adjust if needed

const zHM = new ZetaHelperMain('./src/office_thread.js', {
  threadJsType: 'module',
  wasmPkg
});

zHM.start(() => {
  // ✅ Assign onmessage handler immediately after start
  zHM.thrPort.onmessage = (e) => {
    switch (e.data.cmd) {
      case 'converted':
        try { window.FS.unlink(e.data.from); } catch {}
        const data = window.FS.readFile(e.data.to);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        iframe.src = url;

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
        console.warn('Unknown message command:', e.data.cmd);
    }
  };

  // ✅ Assign fileButton click
  fileButton.onclick = () => input.click();

  // ✅ Assign input onchange
  input.onchange = async () => {
    input.disabled = true;
    fileButton.disabled = true;

    const file = input.files?.[0];
    if (!file) return;

    if (!window.FS) {
      console.error('FS not initialized yet.');
      input.disabled = false;
      fileButton.disabled = false;
      return;
    }

    let name = file.name;
    let from = '/tmp/input';
    const n = name.lastIndexOf('.');
    if (n > 0) {
      from += name.substring(n);
      name = name.substring(0, n);
    }

    const arrayBuffer = await file.arrayBuffer();
    window.FS.writeFile(from, new Uint8Array(arrayBuffer));

    zHM.thrPort.postMessage({ cmd: 'convert', name, from, to: '/tmp/output' });
  };
});
