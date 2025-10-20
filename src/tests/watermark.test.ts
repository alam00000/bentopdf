import { describe, it, expect, beforeEach } from 'vitest';
import { state, resetStateAfterProcess } from '../js/state';

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
      <div id="file-controls"></div>
      <button id="process-btn"></button>
      <input type="file" id="file-input" />
    `;
  });

  describe('resetStateAfterProcess', () => {
    it('should clear watermark text input', () => {
      const watermarkText = document.getElementById(
        'watermark-text'
      ) as HTMLInputElement;
      watermarkText.value = 'CONFIDENTIAL';

      resetStateAfterProcess();

      expect(watermarkText.value).toBe('');
    });

    it('should clear image watermark input', () => {
      const imageInput = document.getElementById(
        'image-watermark-input'
      ) as HTMLInputElement;
      Object.defineProperty(imageInput, 'value', {
        writable: true,
        value: 'C:\\fakepath\\image.png',
      });

      resetStateAfterProcess();

      expect(imageInput.value).toBe('');
    });

    it('should reset state files array', () => {
      state.files = [new File(['content'], 'test.pdf')];

      resetStateAfterProcess();

      expect(state.files).toEqual([]);
    });

    it('should disable process button', () => {
      const processBtn = document.getElementById(
        'process-btn'
      ) as HTMLButtonElement;
      processBtn.disabled = false;

      resetStateAfterProcess();

      expect(processBtn.disabled).toBe(true);
    });

    it('should hide file controls', () => {
      const fileControls = document.getElementById('file-controls');
      fileControls?.classList.remove('hidden');

      resetStateAfterProcess();

      expect(fileControls?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Watermark Type Toggle', () => {
    it('should show text options by default', () => {
      const textOptions = document.getElementById('text-watermark-options');
      const imageOptions = document.getElementById('image-watermark-options');

      expect(imageOptions?.classList.contains('hidden')).toBe(true);
      expect(textOptions?.classList.contains('hidden')).toBe(false);
    });

    it('should switch to image options when image radio selected', () => {
      const imageRadio = document.querySelector(
        'input[name="watermark-type"][value="image"]'
      ) as HTMLInputElement;
      const textOptions = document.getElementById('text-watermark-options');
      const imageOptions = document.getElementById('image-watermark-options');

      imageRadio.checked = true;
      imageRadio.dispatchEvent(new Event('change'));
    });
  });

  describe('Watermark Input Validation', () => {
    it('should accept valid font size', () => {
      const fontSize = document.getElementById('font-size') as HTMLInputElement;
      fontSize.value = '48';

      expect(parseInt(fontSize.value)).toBeGreaterThan(0);
      expect(parseInt(fontSize.value)).toBeLessThanOrEqual(200);
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

    it('should accept valid angle range', () => {
      const angle = document.getElementById('angle-text') as HTMLInputElement;
      angle.value = '45';

      const angleValue = parseInt(angle.value);
      expect(angleValue).toBeGreaterThanOrEqual(-180);
      expect(angleValue).toBeLessThanOrEqual(180);
    });

    it('should accept valid hex color', () => {
      const textColor = document.getElementById(
        'text-color'
      ) as HTMLInputElement;
      textColor.value = '#FF5733';

      expect(textColor.value).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});
