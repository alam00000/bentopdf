import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createConfiguredTesseractWorker } = vi.hoisted(() => ({
  createConfiguredTesseractWorker: vi.fn(),
}));

const mockWorker = {
  recognize: vi.fn(),
  terminate: vi.fn(),
};

vi.mock('../../js/utils/tesseract-runtime', () => ({
  createConfiguredTesseractWorker,
}));

import { recognizePageCanvas } from '../../js/compare/engine/ocr-page';

describe('compare OCR page recognition', () => {
  beforeEach(() => {
    createConfiguredTesseractWorker.mockReset();
    mockWorker.recognize.mockReset();
    mockWorker.terminate.mockReset();
    createConfiguredTesseractWorker.mockResolvedValue(mockWorker);
  });

  it('uses the configured Tesseract worker and maps OCR words into compare text items', async () => {
    const progress = vi.fn();
    const canvas = {
      width: 300,
      height: 150,
    } as HTMLCanvasElement;

    mockWorker.recognize.mockResolvedValue({
      data: {
        words: [
          {
            text: 'Hello',
            bbox: { x0: 10, y0: 20, x1: 60, y1: 40 },
          },
          {
            text: 'world',
            bbox: { x0: 70, y0: 20, x1: 120, y1: 40 },
          },
        ],
      },
    });

    const model = await recognizePageCanvas(canvas, 'eng', progress);

    expect(createConfiguredTesseractWorker).toHaveBeenCalledWith(
      'eng',
      1,
      expect.any(Function)
    );
    expect(mockWorker.recognize).toHaveBeenCalledWith(canvas);
    expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
    expect(model.source).toBe('ocr');
    expect(model.hasText).toBe(true);
    expect(model.plainText).toContain('Hello');
    expect(model.textItems).toHaveLength(1);

    const logger = createConfiguredTesseractWorker.mock
      .calls[0][2] as (message: { status: string; progress: number }) => void;
    logger({ status: 'recognizing text', progress: 0.5 });
    expect(progress).toHaveBeenCalledWith('recognizing text', 0.5);
  });

  it('terminates the worker when compare OCR fails', async () => {
    const canvas = {
      width: 300,
      height: 150,
    } as HTMLCanvasElement;
    mockWorker.recognize.mockRejectedValueOnce(new Error('compare ocr failed'));

    await expect(recognizePageCanvas(canvas, 'eng')).rejects.toThrow(
      'compare ocr failed'
    );

    expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
  });
});
