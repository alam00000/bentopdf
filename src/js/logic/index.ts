// import { mdToPdf } from './md-to-pdf.js';

import { processAndSave } from './duplicate-organize.js';

import { setupCropperTool } from './cropper.js';

export const toolLogic: Record<
  string,
  | {
      process?: (...args: unknown[]) => Promise<unknown>;
      setup?: (...args: unknown[]) => Promise<unknown>;
    }
  | ((...args: unknown[]) => unknown)
> = {
  'duplicate-organize': { process: processAndSave },

  cropper: { setup: setupCropperTool },
};
