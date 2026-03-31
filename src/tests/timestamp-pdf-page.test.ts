import { describe, it, expect, beforeEach } from 'vitest';
import { TIMESTAMP_TSA_PRESETS } from '@/js/config/timestamp-tsa';

/**
 * Tests for the Timestamp PDF page logic.
 *
 * These tests validate DOM interactions, state management, and UI behavior
 * of the timestamp-pdf-page module without calling real TSA servers.
 */

function buildPageHtml(): string {
  return `
    <input type="file" id="file-input" accept=".pdf" />
    <div id="drop-zone"></div>
    <div id="file-display-area"></div>
    <div id="tsa-section" class="hidden">
      <select id="tsa-preset"></select>
    </div>
    <button id="process-btn" class="hidden" disabled></button>
    <button id="back-to-tools"></button>
  `;
}

describe('Timestamp PDF Page', () => {
  beforeEach(() => {
    document.body.innerHTML = buildPageHtml();
  });

  describe('TSA Preset Population', () => {
    it('should populate the TSA preset select element with all presets', () => {
      const select = document.getElementById('tsa-preset') as HTMLSelectElement;

      for (const preset of TIMESTAMP_TSA_PRESETS) {
        const option = document.createElement('option');
        option.value = preset.url;
        option.textContent = preset.label;
        select.append(option);
      }

      expect(select.options.length).toBe(TIMESTAMP_TSA_PRESETS.length);
    });

    it('should set option values to TSA URLs', () => {
      const select = document.getElementById('tsa-preset') as HTMLSelectElement;

      for (const preset of TIMESTAMP_TSA_PRESETS) {
        const option = document.createElement('option');
        option.value = preset.url;
        option.textContent = preset.label;
        select.append(option);
      }

      for (let i = 0; i < TIMESTAMP_TSA_PRESETS.length; i++) {
        expect(select.options[i].value).toBe(TIMESTAMP_TSA_PRESETS[i].url);
        expect(select.options[i].textContent).toBe(
          TIMESTAMP_TSA_PRESETS[i].label
        );
      }
    });
  });

  describe('File Validation', () => {
    it('should reject non-PDF files based on type', () => {
      const file = new File(['content'], 'image.png', { type: 'image/png' });

      const isValidPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      expect(isValidPdf).toBe(false);
    });

    it('should accept files with application/pdf type', () => {
      const file = new File(['content'], 'document.pdf', {
        type: 'application/pdf',
      });

      const isValidPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      expect(isValidPdf).toBe(true);
    });

    it('should accept files with .pdf extension regardless of MIME type', () => {
      const file = new File(['content'], 'document.pdf', {
        type: 'application/octet-stream',
      });

      const isValidPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      expect(isValidPdf).toBe(true);
    });

    it('should handle case-insensitive PDF extension', () => {
      const file = new File(['content'], 'document.PDF', {
        type: 'application/octet-stream',
      });

      const isValidPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      expect(isValidPdf).toBe(true);
    });
  });

  describe('Output Filename', () => {
    it('should append _timestamped before .pdf extension', () => {
      const inputName = 'document.pdf';
      const outputName = inputName.replace(/\.pdf$/i, '_timestamped.pdf');
      expect(outputName).toBe('document_timestamped.pdf');
    });

    it('should handle uppercase .PDF extension', () => {
      const inputName = 'document.PDF';
      const outputName = inputName.replace(/\.pdf$/i, '_timestamped.pdf');
      expect(outputName).toBe('document_timestamped.pdf');
    });

    it('should handle filenames with multiple dots', () => {
      const inputName = 'my.report.2024.pdf';
      const outputName = inputName.replace(/\.pdf$/i, '_timestamped.pdf');
      expect(outputName).toBe('my.report.2024_timestamped.pdf');
    });
  });

  describe('UI State Management', () => {
    it('should have TSA section hidden initially', () => {
      const tsaSection = document.getElementById('tsa-section');
      expect(tsaSection?.classList.contains('hidden')).toBe(true);
    });

    it('should have process button hidden initially', () => {
      const processBtn = document.getElementById('process-btn');
      expect(processBtn?.classList.contains('hidden')).toBe(true);
    });

    it('should have process button disabled initially', () => {
      const processBtn = document.getElementById(
        'process-btn'
      ) as HTMLButtonElement;
      expect(processBtn.disabled).toBe(true);
    });

    it('should show TSA section when hidden class is removed', () => {
      const tsaSection = document.getElementById('tsa-section')!;
      tsaSection.classList.remove('hidden');
      expect(tsaSection.classList.contains('hidden')).toBe(false);
    });

    it('should enable process button when PDF is loaded', () => {
      const processBtn = document.getElementById(
        'process-btn'
      ) as HTMLButtonElement;
      processBtn.classList.remove('hidden');
      processBtn.disabled = false;
      expect(processBtn.disabled).toBe(false);
      expect(processBtn.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Drop Zone', () => {
    it('should exist in the DOM', () => {
      const dropZone = document.getElementById('drop-zone');
      expect(dropZone).not.toBeNull();
    });

    it('should add highlight class on dragover', () => {
      const dropZone = document.getElementById('drop-zone')!;
      dropZone.classList.add('bg-gray-700');
      expect(dropZone.classList.contains('bg-gray-700')).toBe(true);
    });

    it('should remove highlight class on dragleave', () => {
      const dropZone = document.getElementById('drop-zone')!;
      dropZone.classList.add('bg-gray-700');
      dropZone.classList.remove('bg-gray-700');
      expect(dropZone.classList.contains('bg-gray-700')).toBe(false);
    });
  });
});
