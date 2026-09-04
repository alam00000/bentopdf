import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  cleanupLazyRendering,
  renderPagesProgressively,
} from '@/js/utils/render-utils';

/**
 * The merge tool calls renderPagesProgressively once per file against the
 * same container. The lazy-render state used to be module-global with tasks
 * keyed by bare page number, so a second file's setup overwrote the first
 * file's pending tasks and most of its thumbnails froze as skeletons
 * (and page-mode merges silently dropped those pages). These tests pin the
 * per-render isolation the merge page relies on.
 */

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  callback: (
    entries: FakeIntersectionObserverEntry[],
    observer: unknown
  ) => void;
  observed = new Set<Element>();

  constructor(
    callback: (
      entries: FakeIntersectionObserverEntry[],
      observer: unknown
    ) => void
  ) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed.add(target);
  }

  unobserve(target: Element) {
    this.observed.delete(target);
  }

  disconnect() {
    this.observed.clear();
  }
}

interface FakeIntersectionObserverEntry {
  target: Element;
  isIntersecting: boolean;
}

let originalCreateElement: typeof document.createElement;
let originalIO: unknown;

function fakeDoc(pages: number, tag: string): PDFDocumentProxy {
  return {
    numPages: pages,
    getPage: (_pageNumber: number) =>
      Promise.resolve({
        getViewport: ({ scale }: { scale: number }) => ({
          width: 10 * scale,
          height: 10 * scale,
        }),
        render: (opts: { canvas: HTMLCanvasElement }) => ({
          promise: Promise.resolve().then(() => {
            (
              opts.canvas as unknown as { dataset: Record<string, string> }
            ).dataset.tag = tag;
          }),
        }),
      }),
  } as unknown as PDFDocumentProxy;
}

function makeWrapper(
  canvas: HTMLCanvasElement,
  pageNumber: number
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'page-thumbnail';
  el.dataset.pageNumber = String(pageNumber);
  el.dataset.tag =
    (canvas as unknown as { dataset: Record<string, string> }).dataset.tag ||
    '';
  return el;
}

function renderInfo(container: HTMLElement) {
  const wrappers = container.querySelectorAll('.page-thumbnail');
  const skeletons = container.querySelectorAll('[data-lazy-load="true"]');
  return {
    total: wrappers.length,
    skeletons: skeletons.length,
    tags: Array.from(wrappers).map((w) =>
      (w as HTMLElement).dataset.tag === 'a' ? 'a' : 'b'
    ),
  };
}

async function flushIdle() {
  // requestIdleCallback falls back to setTimeout(16) in jsdom
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 20));
  }
}

async function triggerAllLazyTargets() {
  for (const io of FakeIntersectionObserver.instances) {
    io.callback(
      Array.from(io.observed).map((target) => ({
        target,
        isIntersecting: true,
      })) as unknown as IntersectionObserverEntry[],
      io as unknown as IntersectionObserver
    );
  }
  await flushIdle();
}

describe('renderPagesProgressively with multiple files (lazy loading)', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    originalIO = globalThis.IntersectionObserver;
    (
      globalThis as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = FakeIntersectionObserver;
    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tag: string): HTMLElement => {
        if (tag === 'canvas') {
          return {
            height: 0,
            width: 0,
            getContext: () => ({ fillRect: (): void => undefined }),
            toDataURL: () => 'data:image/png;base64,TEST',
            dataset: {} as Record<string, string>,
          } as unknown as HTMLElement;
        }
        return originalCreateElement(tag);
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (
      globalThis as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = originalIO;
  });

  it('renders every page of every file into its own slot when called per file', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const config = {
      batchSize: 5,
      useLazyLoading: true,
      eagerLoadBatches: 0,
      lazyLoadMargin: '10px',
    };
    await renderPagesProgressively(
      fakeDoc(25, 'a'),
      container,
      makeWrapper,
      config
    );
    await renderPagesProgressively(
      fakeDoc(25, 'b'),
      container,
      makeWrapper,
      config
    );

    await triggerAllLazyTargets();

    const info = renderInfo(container);
    expect(info.skeletons).toBe(0);
    expect(info.total).toBe(50);
    // first 25 wrappers belong to doc a, last 25 to doc b
    expect(info.tags.slice(0, 25)).toEqual(
      Array.from({ length: 25 }, () => 'a')
    );
    expect(info.tags.slice(25)).toEqual(Array.from({ length: 25 }, () => 'b'));
  });

  it('renders a single document fully (other tools call it once)', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    await renderPagesProgressively(fakeDoc(25, 'a'), container, makeWrapper, {
      batchSize: 5,
      useLazyLoading: true,
      eagerLoadBatches: 0,
      lazyLoadMargin: '10px',
    });

    await triggerAllLazyTargets();

    const info = renderInfo(container);
    expect(info.skeletons).toBe(0);
    expect(info.total).toBe(25);
    expect(info.tags).toEqual(Array.from({ length: 25 }, () => 'a'));
  });

  it('keeps files independent when their lazy renders interleave', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const config = {
      batchSize: 5,
      useLazyLoading: true,
      eagerLoadBatches: 0,
      lazyLoadMargin: '10px',
    };
    const first = renderPagesProgressively(
      fakeDoc(25, 'a'),
      container,
      makeWrapper,
      config
    );
    const second = renderPagesProgressively(
      fakeDoc(25, 'b'),
      container,
      makeWrapper,
      config
    );
    await Promise.all([first, second]);

    await triggerAllLazyTargets();

    const info = renderInfo(container);
    expect(info.skeletons).toBe(0);
    expect(info.total).toBe(50);
    expect(info.tags.slice(0, 25)).toEqual(
      Array.from({ length: 25 }, () => 'a')
    );
    expect(info.tags.slice(25)).toEqual(Array.from({ length: 25 }, () => 'b'));
  });

  it('disconnects every active lazy render on cleanup, not every other one', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const config = {
      batchSize: 5,
      useLazyLoading: true,
      eagerLoadBatches: 0,
      lazyLoadMargin: '10px',
    };
    await renderPagesProgressively(
      fakeDoc(25, 'a'),
      container,
      makeWrapper,
      config
    );
    await renderPagesProgressively(
      fakeDoc(25, 'b'),
      container,
      makeWrapper,
      config
    );

    expect(FakeIntersectionObserver.instances).toHaveLength(2);
    for (const io of FakeIntersectionObserver.instances) {
      expect(io.observed.size).toBeGreaterThan(0);
    }

    cleanupLazyRendering();

    for (const io of FakeIntersectionObserver.instances) {
      expect(io.observed.size).toBe(0);
    }
  });
});
