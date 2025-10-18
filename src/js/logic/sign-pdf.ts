import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import html2canvas from 'html2canvas';

const signState = {
  pdf: null,
  canvas: null,
  context: null,
  pageRendering: false,
  currentPageNum: 1,
  scale: 1.0,
  pageSnapshot: null,
  drawCanvas: null,
  drawContext: null,
  isDrawing: false,
  savedSignatures: [],
  placedSignatures: [],
  activeSignature: null,
  interactionMode: 'none',
  draggedSigId: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  hoveredSigId: null,
  resizeHandle: null,
};

async function renderPage(num: any) {
  signState.pageRendering = true;
  const page = await signState.pdf.getPage(num);
  const viewport = page.getViewport({ scale: signState.scale });
  signState.canvas.height = viewport.height;
  signState.canvas.width = viewport.width;
  await page.render({ canvasContext: signState.context, viewport }).promise;

  signState.pageSnapshot = signState.context.getImageData(
    0,
    0,
    signState.canvas.width,
    signState.canvas.height
  );

  drawSignatures();

  signState.pageRendering = false;
  document.getElementById('current-page-display-sign').textContent = num;
}

function drawSignatures() {
  if (!signState.pageSnapshot) return;
  signState.context.putImageData(signState.pageSnapshot, 0, 0);

  signState.placedSignatures
    .filter((sig) => sig.pageIndex === signState.currentPageNum - 1)
    .forEach((sig) => {
      signState.context.drawImage(
        sig.image,
        sig.x,
        sig.y,
        sig.width,
        sig.height
      );

      if (
        signState.hoveredSigId === sig.id ||
        signState.draggedSigId === sig.id
      ) {
        signState.context.strokeStyle = '#4f46e5';
        signState.context.setLineDash([6, 3]);
        signState.context.strokeRect(sig.x, sig.y, sig.width, sig.height);
        signState.context.setLineDash([]);

        drawResizeHandles(sig);
      }
    });
}

function drawResizeHandles(sig: any) {
  const handleSize = 8;
  const halfHandle = handleSize / 2;
  const handles = getResizeHandles(sig);
  signState.context.fillStyle = '#4f46e5';
  Object.values(handles).forEach((handle) => {
    signState.context.fillRect(
      handle.x - halfHandle,
      handle.y - halfHandle,
      handleSize,
      handleSize
    );
  });
}

async function fitToWidth() {
  const page = await signState.pdf.getPage(signState.currentPageNum);
  const container = document.getElementById('canvas-container-sign');
  signState.scale =
    container.clientWidth / page.getViewport({ scale: 1.0 }).width;
  renderPage(signState.currentPageNum);
}

function setupDrawingCanvas() {
  signState.drawCanvas = document.getElementById('signature-draw-canvas');
  signState.drawContext = signState.drawCanvas.getContext('2d');

  const rect = signState.drawCanvas.getBoundingClientRect();
  const dpi = window.devicePixelRatio || 1;
  signState.drawCanvas.width = rect.width * dpi;
  signState.drawCanvas.height = rect.height * dpi;
  signState.drawContext.scale(dpi, dpi);
  signState.drawContext.lineWidth = 2;

  const colorPicker = document.getElementById('signature-color');

  colorPicker.oninput = () =>
    (signState.drawContext.strokeStyle = (
      colorPicker as HTMLInputElement
    ).value);
  signState.drawContext.strokeStyle = (colorPicker as HTMLInputElement).value;

  const start = (e: any) => {
    signState.isDrawing = true;
    const pos = getMousePos(signState.drawCanvas, e.touches ? e.touches[0] : e);
    signState.drawContext.beginPath();
    signState.drawContext.moveTo(pos.x, pos.y);
  };
  const draw = (e: any) => {
    if (!signState.isDrawing) return;
    e.preventDefault();
    const pos = getMousePos(signState.drawCanvas, e.touches ? e.touches[0] : e);
    signState.drawContext.lineTo(pos.x, pos.y);
    signState.drawContext.stroke();
  };
  const stop = () => (signState.isDrawing = false);

  ['mousedown', 'touchstart'].forEach((evt) =>
    signState.drawCanvas.addEventListener(evt, start, { passive: false })
  );
  ['mousemove', 'touchmove'].forEach((evt) =>
    signState.drawCanvas.addEventListener(evt, draw, { passive: false })
  );
  ['mouseup', 'mouseleave', 'touchend'].forEach((evt) =>
    signState.drawCanvas.addEventListener(evt, stop)
  );
}

function getMousePos(canvas: any, evt: any) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function addSignatureToSaved(imageDataUrl: any) {
  const img = new Image();
  img.src = imageDataUrl;
  signState.savedSignatures.push(img);
  renderSavedSignatures();
}

function renderSavedSignatures() {
  const container = document.getElementById('saved-signatures-container');
  container.textContent = ''; //change
  signState.savedSignatures.forEach((img, index) => {
    const wrapper = document.createElement('div');
    wrapper.className =
      'saved-signature p-1 bg-white rounded-md cursor-pointer border-2 border-transparent hover:border-indigo-500 h-16';
    img.className = 'h-full w-auto mx-auto';
    wrapper.appendChild(img);
    container.appendChild(wrapper);

    wrapper.onclick = () => {
      signState.activeSignature = { image: img, index };
      document
        .querySelectorAll('.saved-signature')
        .forEach((el) => el.classList.remove('selected'));
      wrapper.classList.add('selected');
    };
  });
}

function getResizeHandles(sig: any) {
  return {
    'top-left': { x: sig.x, y: sig.y },
    'top-middle': { x: sig.x + sig.width / 2, y: sig.y },
    'top-right': { x: sig.x + sig.width, y: sig.y },
    'middle-left': { x: sig.x, y: sig.y + sig.height / 2 },
    'middle-right': { x: sig.x + sig.width, y: sig.y + sig.height / 2 },
    'bottom-left': { x: sig.x, y: sig.y + sig.height },
    'bottom-middle': { x: sig.x + sig.width / 2, y: sig.y + sig.height },
    'bottom-right': { x: sig.x + sig.width, y: sig.y + sig.height },
  };
}

function getHandleAtPos(pos: any, sig: any) {
  const handles = getResizeHandles(sig);
  const handleSize = 10;
  for (const [name, handlePos] of Object.entries(handles)) {
    if (
      Math.abs(pos.x - handlePos.x) < handleSize &&
      Math.abs(pos.y - handlePos.y) < handleSize
    ) {
      return name;
    }
  }
  return null;
}

function setupPlacementListeners() {
  const canvas = signState.canvas;
  const ghost = document.getElementById('signature-ghost');

  const mouseMoveHandler = (e: any) => {
    if (signState.interactionMode !== 'none') return;

    if (signState.activeSignature) {
      ghost.style.backgroundImage = `url('${signState.activeSignature.image.src}')`;
      ghost.style.width = '150px';
      ghost.style.height = `${(signState.activeSignature.image.height / signState.activeSignature.image.width) * 150}px`;
      ghost.style.left = `${e.clientX + 5}px`;
      ghost.style.top = `${e.clientY + 5}px`;
      ghost.classList.remove('hidden');
    }

    const pos = getMousePos(canvas, e);
    let foundSigId: any = null;
    let foundHandle = null;

    signState.placedSignatures
      .filter((s) => s.pageIndex === signState.currentPageNum - 1)
      .reverse()
      .forEach((sig) => {
        if (foundSigId) return;
        const handle = getHandleAtPos(pos, sig);
        if (handle) {
          foundSigId = sig.id;
          foundHandle = handle;
        } else if (
          pos.x >= sig.x &&
          pos.x <= sig.x + sig.width &&
          pos.y >= sig.y &&
          pos.y <= sig.y + sig.height
        ) {
          foundSigId = sig.id;
        }
      });

    canvas.className = '';
    if (foundHandle) {
      if (['top-left', 'bottom-right'].includes(foundHandle))
        canvas.classList.add('resize-nwse');
      else if (['top-right', 'bottom-left'].includes(foundHandle))
        canvas.classList.add('resize-nesw');
      else if (['top-middle', 'bottom-middle'].includes(foundHandle))
        canvas.classList.add('resize-ns');
      else if (['middle-left', 'middle-right'].includes(foundHandle))
        canvas.classList.add('resize-ew');
    } else if (foundSigId) {
      canvas.classList.add('movable');
    }

    if (signState.hoveredSigId !== foundSigId) {
      signState.hoveredSigId = foundSigId;
      drawSignatures();
    }
  };

  canvas.addEventListener('mousemove', mouseMoveHandler);
  document
    .getElementById('canvas-container-sign')
    .addEventListener('mouseleave', () => ghost.classList.add('hidden'));

  const onDragStart = (e: any) => {
    const pos = getMousePos(canvas, e.touches ? e.touches[0] : e);
    let clickedOnSignature = false;

    signState.placedSignatures
      .filter((s) => s.pageIndex === signState.currentPageNum - 1)
      .reverse()
      .forEach((sig) => {
        if (clickedOnSignature) return;
        const handle = getHandleAtPos(pos, sig);
        if (handle) {
          signState.interactionMode = 'resize';
          signState.resizeHandle = handle;
          signState.draggedSigId = sig.id;
          clickedOnSignature = true;
        } else if (
          pos.x >= sig.x &&
          pos.x <= sig.x + sig.width &&
          pos.y >= sig.y &&
          pos.y <= sig.y + sig.height
        ) {
          signState.interactionMode = 'drag';
          signState.draggedSigId = sig.id;
          signState.dragOffsetX = pos.x - sig.x;
          signState.dragOffsetY = pos.y - sig.y;
          clickedOnSignature = true;
        }
      });

    if (clickedOnSignature) {
      ghost.classList.add('hidden');
    } else if (signState.activeSignature) {
      const sigWidth = 150;
      const sigHeight =
        (signState.activeSignature.image.height /
          signState.activeSignature.image.width) *
        sigWidth;
      signState.placedSignatures.push({
        id: Date.now(),
        image: signState.activeSignature.image,
        x: pos.x - sigWidth / 2,
        y: pos.y - sigHeight / 2,
        width: sigWidth,
        height: sigHeight,
        pageIndex: signState.currentPageNum - 1,
        aspectRatio: sigWidth / sigHeight,
      });
      drawSignatures();
    }
  };

  const onDragMove = (e: any) => {
    if (signState.interactionMode === 'none') return;
    e.preventDefault();
    const pos = getMousePos(canvas, e.touches ? e.touches[0] : e);
    const sig = signState.placedSignatures.find(
      (s) => s.id === signState.draggedSigId
    );
    if (!sig) return;

    if (signState.interactionMode === 'drag') {
      sig.x = pos.x - signState.dragOffsetX;
      sig.y = pos.y - signState.dragOffsetY;
    } else if (signState.interactionMode === 'resize') {
      const originalRight = sig.x + sig.width;
      const originalBottom = sig.y + sig.height;

      if (signState.resizeHandle.includes('right'))
        sig.width = Math.max(20, pos.x - sig.x);
      if (signState.resizeHandle.includes('bottom'))
        sig.height = Math.max(20, pos.y - sig.y);
      if (signState.resizeHandle.includes('left')) {
        sig.width = Math.max(20, originalRight - pos.x);
        sig.x = originalRight - sig.width;
      }
      if (signState.resizeHandle.includes('top')) {
        sig.height = Math.max(20, originalBottom - pos.y);
        sig.y = originalBottom - sig.height;
      }

      if (
        signState.resizeHandle.includes('left') ||
        signState.resizeHandle.includes('right')
      ) {
        sig.height = sig.width / sig.aspectRatio;
      } else if (
        signState.resizeHandle.includes('top') ||
        signState.resizeHandle.includes('bottom')
      ) {
        sig.width = sig.height * sig.aspectRatio;
      }
    }
    drawSignatures();
  };

  const onDragEnd = () => {
    signState.interactionMode = 'none';
    signState.draggedSigId = null;
    drawSignatures();
  };

  ['mousedown', 'touchstart'].forEach((evt) =>
    canvas.addEventListener(evt, onDragStart, { passive: false })
  );
  ['mousemove', 'touchmove'].forEach((evt) =>
    canvas.addEventListener(evt, onDragMove, { passive: false })
  );
  ['mouseup', 'mouseleave', 'touchend'].forEach((evt) =>
    canvas.addEventListener(evt, onDragEnd)
  );
}

export async function setupSignTool() {
  document.getElementById('signature-editor').classList.remove('hidden');

  signState.canvas = document.getElementById('canvas-sign');
  signState.context = signState.canvas.getContext('2d');
  const pdfData = await state.pdfDoc.save();
  // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
  signState.pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  document.getElementById('total-pages-display-sign').textContent =
    signState.pdf.numPages;

  await fitToWidth();
  setupDrawingCanvas();
  setupPlacementListeners();

  document.getElementById('prev-page-sign').onclick = () => {
    if (signState.currentPageNum > 1) {
      signState.currentPageNum--;
      renderPage(signState.currentPageNum);
    }
  };
  document.getElementById('next-page-sign').onclick = () => {
    if (signState.currentPageNum < signState.pdf.numPages) {
      signState.currentPageNum++;
      renderPage(signState.currentPageNum);
    }
  };
  document.getElementById('zoom-in-btn').onclick = () => {
    signState.scale += 0.25;
    renderPage(signState.currentPageNum);
  };
  document.getElementById('zoom-out-btn').onclick = () => {
    signState.scale = Math.max(0.25, signState.scale - 0.25);
    renderPage(signState.currentPageNum);
  };
  document.getElementById('fit-width-btn').onclick = fitToWidth;
  document.getElementById('undo-btn').onclick = () => {
    signState.placedSignatures.pop();
    drawSignatures();
  };

  const tabs = ['draw', 'type', 'upload'];
  const tabButtons = tabs.map((t) => document.getElementById(`${t}-tab-btn`));
  const tabPanels = tabs.map((t) => document.getElementById(`${t}-panel`));
  tabButtons.forEach((button, index) => {
    button.onclick = () => {
      tabPanels.forEach((panel) => panel.classList.add('hidden'));
      tabButtons.forEach((btn) => {
        btn.classList.remove('border-indigo-500', 'text-white');
        btn.classList.add('border-transparent', 'text-gray-400');
      });
      tabPanels[index].classList.remove('hidden');
      button.classList.add('border-indigo-500', 'text-white');
      button.classList.remove('border-transparent', 'text-gray-400');
    };
  });

  document.getElementById('clear-draw-btn').onclick = () =>
    signState.drawContext.clearRect(
      0,
      0,
      signState.drawCanvas.width,
      signState.drawCanvas.height
    );
  document.getElementById('save-draw-btn').onclick = () => {
    addSignatureToSaved(signState.drawCanvas.toDataURL());
    signState.drawContext.clearRect(
      0,
      0,
      signState.drawCanvas.width,
      signState.drawCanvas.height
    );
  };

  const textInput = document.getElementById('signature-text-input');
  const fontPreview = document.getElementById('font-preview');
  const fontFamilySelect = document.getElementById('font-family-select');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');
  const fontColorPicker = document.getElementById('font-color-picker');

  const updateFontPreview = () => {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    fontPreview.textContent = textInput.value || 'Your Name';
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    fontPreview.style.fontFamily = fontFamilySelect.value;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    fontPreview.style.fontSize = `${fontSizeSlider.value}px`;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    fontPreview.style.color = fontColorPicker.value;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    fontSizeValue.textContent = fontSizeSlider.value;
  };

  [textInput, fontFamilySelect, fontSizeSlider, fontColorPicker].forEach((el) =>
    el.addEventListener('input', updateFontPreview)
  );
  updateFontPreview();

  document.getElementById('save-type-btn').onclick = async () => {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    if (!textInput.value) return;
    const canvas = await html2canvas(fontPreview, {
      backgroundColor: null,
      scale: 2,
    });
    addSignatureToSaved(canvas.toDataURL());
  };

  document.getElementById('signature-upload-input').onchange = (e) => {
    // @ts-expect-error TS(2339) FIXME: Property 'files' does not exist on type 'EventTarg... Remove this comment to see the full error message
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => addSignatureToSaved(event.target.result);
    reader.readAsDataURL(file);
  };
}

export async function applyAndSaveSignatures() {
  if (signState.placedSignatures.length === 0) {
    showAlert('No Signatures Placed', 'Please place at least one signature.');
    return;
  }
  showLoader('Applying signatures...');
  try {
    const pages = state.pdfDoc.getPages();
    for (const sig of signState.placedSignatures) {
      const page = pages[sig.pageIndex];
      const originalPageSize = page.getSize();
      const pngBytes = await fetch(sig.image.src).then((res) =>
        res.arrayBuffer()
      );
      const pngImage = await state.pdfDoc.embedPng(pngBytes);

      const renderedPage = await signState.pdf.getPage(sig.pageIndex + 1);
      const renderedViewport = renderedPage.getViewport({
        scale: signState.scale,
      });
      const scaleRatio = originalPageSize.width / renderedViewport.width;

      page.drawImage(pngImage, {
        x: sig.x * scaleRatio,
        y:
          originalPageSize.height -
          sig.y * scaleRatio -
          sig.height * scaleRatio,
        width: sig.width * scaleRatio,
        height: sig.height * scaleRatio,
      });
    }

    const newPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([newPdfBytes], { type: 'application/pdf' }),
      'signed.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to apply signatures.');
  } finally {
    hideLoader();
  }
}
