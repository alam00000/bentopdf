import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetState } from '../js/state';

describe('Watermark Feature', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input type="text" id="watermark-text" value="Test Text" />
      <input type="file" id="image-watermark-input" />
      <input type="number" id="font-size" value="72" />
      <input type="color" id="text-color" value="#000000" />
      <input type="range" id="opacity-text" value="0.3" />
      <input type="range" id="angle-text" value="0" />
      <div id="text-watermark-options"></div>
      <div id="image-watermark-options" class="hidden"></div>
      <input type="radio" name="watermark-type" value="text" checked />
      <input type="radio" name="watermark-type" value="image" />
      <div id="file-display-area"></div>
      <div id="file-controls" class="hidden"></div>
      <button id="process-btn" disabled></button>
      <input type="file" id="file-input" />
      <div id="tool-content"></div>
    `;

    state.activeTool = 'add-watermark';
    state.files = [];
    state.pdfDoc = null;
    state.pdfPages = [];
    state.currentPdfUrl = null;
  });

  describe('resetState', () => {
    it('should clear watermark text input after reset', () => {
      const watermarkText = document.getElementById(
        'watermark-text'
      ) as HTMLInputElement;
      watermarkText.value = 'CONFIDENTIAL';

      resetState();

      expect(state.activeTool).toBe(null);
      expect(state.files).toEqual([]);
      expect(state.pdfDoc).toBe(null);
      expect(state.pdfPages).toEqual([]);
      expect(state.currentPdfUrl).toBe(null);
    });

    it('should reset state files array', () => {
      state.files = [new File(['content'], 'test.pdf')];

      resetState();

      expect(state.files).toEqual([]);
    });

    it('should reset activeTool to null', () => {
      state.activeTool = 'add-watermark';

      resetState();

      expect(state.activeTool).toBe(null);
    });

    it('should reset pdfDoc to null', () => {
      state.pdfDoc = {} as any;

      resetState();

      expect(state.pdfDoc).toBe(null);
    });

    it('should reset pdfPages array', () => {
      state.pdfPages = [1, 2, 3] as any;

      resetState();

      expect(state.pdfPages).toEqual([]);
    });

    it('should reset currentPdfUrl to null', () => {
      state.currentPdfUrl = 'blob:http://example.com/123';

      resetState();

      expect(state.currentPdfUrl).toBe(null);
    });

    it('should clear tool-content innerHTML', () => {
      const toolContent = document.getElementById('tool-content');
      if (toolContent) toolContent.innerHTML = '<div>Some content</div>';

      resetState();

      expect(toolContent?.innerHTML).toBe('');
    });
  });

  describe('Watermark Type Toggle', () => {
    it('should show text options by default', () => {
      const textOptions = document.getElementById('text-watermark-options');
      const imageOptions = document.getElementById('image-watermark-options');

      expect(imageOptions?.classList.contains('hidden')).toBe(true);
      expect(textOptions?.classList.contains('hidden')).toBe(false);
    });

    it('should have text radio checked by default', () => {
      const textRadio = document.querySelector(
        'input[name="watermark-type"][value="text"]'
      ) as HTMLInputElement;
      const imageRadio = document.querySelector(
        'input[name="watermark-type"][value="image"]'
      ) as HTMLInputElement;

      expect(textRadio.checked).toBe(true);
      expect(imageRadio.checked).toBe(false);
    });
  });

  describe('Watermark Input Validation', () => {
    it('should accept valid font size', () => {
      const fontSize = document.getElementById('font-size') as HTMLInputElement;
      fontSize.value = '48';

      expect(parseInt(fontSize.value)).toBeGreaterThan(0);
      expect(parseInt(fontSize.value)).toBeLessThanOrEqual(200);
    });

    it('should have default font size of 72', () => {
      const fontSize = document.getElementById('font-size') as HTMLInputElement;

      expect(parseInt(fontSize.value)).toBe(72);
    });

    it('should accept valid opacity range', () => {
      const opacity = document.getElementById(
        'opacity-text'
      ) as HTMLInputElement;
      opacity.value = '0.5';

      const opacityValue = parseFloat(opacity.value);
      expect(opacityValue).toBeGreaterThanOrEqual(0);
      expect(opacityValue).toBeLessThanOrEqual(1);
    });

    it('should have default opacity of 0.3', () => {
      const opacity = document.getElementById(
        'opacity-text'
      ) as HTMLInputElement;

      expect(parseFloat(opacity.value)).toBe(0.3);
    });

    it('should accept valid angle range', () => {
      const angle = document.getElementById('angle-text') as HTMLInputElement;
      angle.value = '45';

      const angleValue = parseInt(angle.value);
      expect(angleValue).toBeGreaterThanOrEqual(-180);
      expect(angleValue).toBeLessThanOrEqual(180);
    });

    it('should have default angle of 0', () => {
      const angle = document.getElementById('angle-text') as HTMLInputElement;

      expect(parseInt(angle.value)).toBe(0);
    });

    it('should accept valid hex color', () => {
      const textColor = document.getElementById(
        'text-color'
      ) as HTMLInputElement;
      textColor.value = '#FF5733';

      expect(textColor.value).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should have default color of black', () => {
      const textColor = document.getElementById(
        'text-color'
      ) as HTMLInputElement;

      expect(textColor.value).toBe('#000000');
    });
  });

  describe('State Management', () => {
    it('should maintain activeTool as add-watermark', () => {
      expect(state.activeTool).toBe('add-watermark');
    });

    it('should start with empty files array', () => {
      expect(state.files).toEqual([]);
    });

    it('should allow adding files to state', () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      state.files.push(file);

      expect(state.files.length).toBe(1);
      expect(state.files[0].name).toBe('test.pdf');
    });
  });

  describe('UI Elements State', () => {
    it('should have process button disabled by default', () => {
      const processBtn = document.getElementById(
        'process-btn'
      ) as HTMLButtonElement;

      expect(processBtn.disabled).toBe(true);
    });

    it('should have file controls hidden by default', () => {
      const fileControls = document.getElementById('file-controls');

      expect(fileControls?.classList.contains('hidden')).toBe(true);
    });

    it('should have image watermark options hidden by default', () => {
      const imageOptions = document.getElementById('image-watermark-options');

      expect(imageOptions?.classList.contains('hidden')).toBe(true);
    });
  });
});
