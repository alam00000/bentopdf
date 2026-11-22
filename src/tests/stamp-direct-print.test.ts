// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const viewerPath = resolve(
  process.cwd(),
  'public/pdfjs-annotation-viewer/web/viewer.mjs'
);

const source = readFileSync(viewerPath, 'utf8');

const parsed = ts.createSourceFile(
  'viewer.mjs',
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.JS
);

// Find the actual function inside viewer.mjs.
let functionNode: ts.FunctionDeclaration | undefined;

function findFunction(node: ts.Node): void {
  if (
    ts.isFunctionDeclaration(node) &&
    node.name?.text === 'drawStampsOnPrintCanvas'
  ) {
    functionNode = node;
    return;
  }

  ts.forEachChild(node, findFunction);
}

findFunction(parsed);

if (!functionNode) {
  throw new Error('drawStampsOnPrintCanvas() was not found in viewer.mjs');
}

class MockImage {
  src = '';

  async decode() {
    if (this.src === 'broken-image') {
      throw new Error('Image decoding failed');
    }
  }
}

// Execute the real function in an isolated test context.
const drawStampsOnPrintCanvas = runInNewContext(
  `${functionNode.getText(parsed)}
   drawStampsOnPrintCanvas;`,
  {
    Image: MockImage,
    console,
  }
) as (args: {
  stamps: unknown[];
  ctx: CanvasRenderingContext2D;
  printResolution: number;
}) => Promise<void>;

function createContext() {
  const ctx = {
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    canvas: {
      width: 1200,
      height: 1600,
    },
  };

  return ctx;
}

function createStamp(overrides: Record<string, unknown> = {}) {
  return {
    subtype: 'Stamp',
    pageNumber: 1,
    konvaClientRect: {
      x: 72,
      y: 144,
      width: 144,
      height: 72,
    },
    contentsObj: {
      image: 'data:image/png;base64,test',
    },
    ...overrides,
  };
}

describe('drawStampsOnPrintCanvas', () => {
  it('renders a single stamp', async () => {
    const ctx = createContext();

    await drawStampsOnPrintCanvas({
      stamps: [createStamp()],
      ctx: ctx as unknown as CanvasRenderingContext2D,
      printResolution: 72,
    });

    expect(ctx.drawImage).toHaveBeenCalledTimes(1);

    expect(ctx.drawImage).toHaveBeenCalledWith(
      expect.any(MockImage),
      72,
      144,
      144,
      72
    );
  });

  it('renders multiple stamps', async () => {
    const ctx = createContext();

    await drawStampsOnPrintCanvas({
      stamps: [createStamp(), createStamp(), createStamp()],
      ctx: ctx as unknown as CanvasRenderingContext2D,
      printResolution: 72,
    });

    expect(ctx.drawImage).toHaveBeenCalledTimes(3);
  });

  it('handles an empty stamp list', async () => {
    const ctx = createContext();

    await expect(
      drawStampsOnPrintCanvas({
        stamps: [],
        ctx: ctx as unknown as CanvasRenderingContext2D,
        printResolution: 72,
      })
    ).resolves.toBeUndefined();

    expect(ctx.drawImage).not.toHaveBeenCalled();
  });

  it('skips stamps without image data', async () => {
    const ctx = createContext();

    await drawStampsOnPrintCanvas({
      stamps: [
        createStamp({
          contentsObj: {},
        }),
      ],
      ctx: ctx as unknown as CanvasRenderingContext2D,
      printResolution: 72,
    });

    expect(ctx.drawImage).not.toHaveBeenCalled();
  });

  it('skips stamps with invalid dimensions', async () => {
    const ctx = createContext();

    await drawStampsOnPrintCanvas({
      stamps: [
        createStamp({
          konvaClientRect: {
            x: 10,
            y: 20,
            width: -100,
            height: 0,
          },
        }),
      ],
      ctx: ctx as unknown as CanvasRenderingContext2D,
      printResolution: 72,
    });

    expect(ctx.drawImage).not.toHaveBeenCalled();
  });

  it('scales coordinates to print resolution', async () => {
    const ctx = createContext();

    await drawStampsOnPrintCanvas({
      stamps: [createStamp()],
      ctx: ctx as unknown as CanvasRenderingContext2D,
      printResolution: 144,
    });

    expect(ctx.drawImage).toHaveBeenCalledWith(
      expect.any(MockImage),
      144,
      288,
      288,
      144
    );
  });

  it('continues printing if image decoding fails', async () => {
    const ctx = createContext();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await expect(
        drawStampsOnPrintCanvas({
          stamps: [
            createStamp({
              contentsObj: {
                image: 'broken-image',
              },
            }),
          ],
          ctx: ctx as unknown as CanvasRenderingContext2D,
          printResolution: 72,
        })
      ).resolves.toBeUndefined();

      expect(ctx.drawImage).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('does not render selection controls', async () => {
    const ctx = createContext();

    await drawStampsOnPrintCanvas({
      stamps: [
        createStamp({
          selected: true,
          showDeleteButton: true,
          showCommentButton: true,
        }),
      ],
      ctx: ctx as unknown as CanvasRenderingContext2D,
      printResolution: 72,
    });

    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
  });
});
