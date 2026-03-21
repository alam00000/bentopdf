import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Configuration for progressive rendering
 */
export interface RenderConfig {
  batchSize?: number;
  useLazyLoading?: boolean;
  lazyLoadMargin?: string;
  eagerLoadBatches?: number; // Number of batches to load ahead eagerly (default: 2)
  onProgress?: (current: number, total: number) => void;
  onPageRendered?: (pageIndex: number, element: HTMLElement) => void;
  onBatchComplete?: () => void;
  shouldCancel?: () => boolean;
}

/**
 * Page rendering task
 */
interface PageTask {
  pageNumber: number;
  pdfjsDoc: pdfjsLib.PDFDocumentProxy;
  fileName?: string;
  container: HTMLElement;
  scale?: number;
  createWrapper: (
    canvas: HTMLCanvasElement,
    pageNumber: number,
    fileName?: string
  ) => HTMLElement;
  placeholderElement?: HTMLElement;
}

/**
 * Lazy loading state
 */
interface LazyLoadState {
  observer: IntersectionObserver | null;
  pendingTasks: Map<HTMLElement, PageTask>;
  pendingTasksByPageNumber: Map<number, PageTask>;
  isRendering: boolean;
  eagerLoadQueue: PageTask[];
  nextEagerIndex: number;
}

const lazyLoadState: LazyLoadState = {
  observer: null,
  pendingTasks: new Map(),
  pendingTasksByPageNumber: new Map(),
  isRendering: false,
  eagerLoadQueue: [],
  nextEagerIndex: 0,
};

/**
 * Creates a placeholder element for a page that will be lazy-loaded
 */
export function createPlaceholder(
  pageNumber: number,
  fileName?: string
): HTMLElement {
  const placeholder = document.createElement('div');
  placeholder.className =
    'page-thumbnail relative cursor-move flex flex-col items-center gap-1 p-2 border-2 border-gray-600 rounded-lg bg-gray-800 transition-colors';
  placeholder.dataset.pageNumber = pageNumber.toString();
  if (fileName) {
    placeholder.dataset.fileName = fileName;
  }
  placeholder.dataset.lazyLoad = 'true';

  // Create skeleton loader
  const skeletonContainer = document.createElement('div');
  skeletonContainer.className =
    'relative w-full h-36 bg-gray-700 rounded-md animate-pulse flex items-center justify-center';

  const loadingText = document.createElement('span');
  loadingText.className = 'text-gray-500 text-xs';
  loadingText.textContent = 'Loading...';

  skeletonContainer.appendChild(loadingText);
  placeholder.appendChild(skeletonContainer);

  return placeholder;
}

/**
 * Renders a single page to canvas
 */
export async function renderPageToCanvas(
  pdfjsDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const page = await pdfjsDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error(`Failed to get 2D context for page ${pageNumber}`);
  }

  await page.render({
    canvasContext: context,
    canvas: canvas,
    viewport,
  }).promise;

  return canvas;
}

/**
 * Renders a batch of pages
 */
async function renderPageBatch(tasks: PageTask[]): Promise<void> {
  for (const task of tasks) {
    try {
      const canvas = await renderPageToCanvas(
        task.pdfjsDoc,
        task.pageNumber,
        task.scale || 0.5
      );

      const wrapper = task.createWrapper(
        canvas,
        task.pageNumber,
        task.fileName
      );

      let placeholder: Element | null = task.placeholderElement || null;
      if (!placeholder) {
        placeholder = task.container.querySelector(
          `[data-page-number="${task.pageNumber}"][data-lazy-load="true"]`
        );
      }

      if (placeholder && placeholder.parentNode) {
        const parent = placeholder.parentNode;
        parent.insertBefore(wrapper, placeholder);
        parent.removeChild(placeholder);
      } else {
        const existingRendered = task.container.querySelector(
          `[data-page-number="${task.pageNumber}"]:not([data-lazy-load="true"])`
        );
        if (existingRendered) {
          continue;
        }

        const allChildren = Array.from(
          task.container.children
        ) as HTMLElement[];
        let insertBefore: Element | null = null;

        for (const child of allChildren) {
          const childPageNum = parseInt(child.dataset.pageNumber || '0', 10);
          if (childPageNum > task.pageNumber) {
            insertBefore = child;
            break;
          }
        }

        if (insertBefore) {
          task.container.insertBefore(wrapper, insertBefore);
        } else {
          task.container.appendChild(wrapper);
        }
        console.warn(
          `Placeholder not found for page ${task.pageNumber}, inserted at calculated position`
        );
      }
    } catch (error) {
      console.error(`Error rendering page ${task.pageNumber}:`, error);
    }
  }
}

/**
 * Sets up Intersection Observer for lazy loading
 */
function setupLazyRendering(
  container: HTMLElement,
  config: RenderConfig
): IntersectionObserver {
  const options = {
    root: container.closest('.overflow-auto') || null,
    rootMargin: config.lazyLoadMargin || '200px',
    threshold: 0.01,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const placeholder = entry.target as HTMLElement;
        const pageNumberStr = placeholder.dataset.pageNumber;
        if (!pageNumberStr) return;

        const pageNumber = parseInt(pageNumberStr, 10);
        const task = lazyLoadState.pendingTasksByPageNumber.get(pageNumber);

        if (task) {
          // Immediately unobserve to prevent multiple triggers
          observer.unobserve(placeholder);
          lazyLoadState.pendingTasks.delete(placeholder);
          lazyLoadState.pendingTasksByPageNumber.delete(pageNumber);

          task.placeholderElement = placeholder;

          // Render this page immediately (not waiting for isRendering flag)
          renderPageBatch([task])
            .then(() => {
              // Trigger callback after lazy load batch
              if (config.onBatchComplete) {
                config.onBatchComplete();
              }

              // Check if all pages are rendered
              if (
                lazyLoadState.pendingTasks.size === 0 &&
                lazyLoadState.observer
              ) {
                lazyLoadState.observer.disconnect();
                lazyLoadState.observer = null;
              }
            })
            .catch((error) => {
              console.error(
                `Error lazy loading page ${task.pageNumber}:`,
                error
              );
            });
        }
      }
    });
  }, options);

  lazyLoadState.observer = observer;
  return observer;
}

/**
 * Request idle callback with fallback
 */
function requestIdleCallbackPolyfill(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 16); // ~60fps
  }
}

/**
 * Main function to render pages progressively with optional lazy loading
 */
export async function renderPagesProgressively(
  pdfjsDoc: pdfjsLib.PDFDocumentProxy,
  container: HTMLElement,
  createWrapper: (
    canvas: HTMLCanvasElement,
    pageNumber: number,
    fileName?: string
  ) => HTMLElement,
  config: RenderConfig = {}
): Promise<void> {
  const {
    batchSize = 8,
    useLazyLoading = true,
    eagerLoadBatches = 2,
    onProgress,
    onBatchComplete,
  } = config;

  const totalPages = pdfjsDoc.numPages;

  const initialRenderCount = useLazyLoading
    ? Math.min(20, totalPages)
    : totalPages;

  const placeholders: HTMLElement[] = [];
  for (let i = 1; i <= totalPages; i++) {
    const placeholder = createPlaceholder(i);
    container.appendChild(placeholder);
    placeholders.push(placeholder);
  }

  const tasks: PageTask[] = [];

  // Create tasks for all pages with direct placeholder references
  for (let i = 1; i <= totalPages; i++) {
    tasks.push({
      pageNumber: i,
      pdfjsDoc,
      container,
      scale: useLazyLoading ? 0.5 : 1,
      createWrapper,
      placeholderElement: placeholders[i - 1],
    });
  }

  // If lazy loading is enabled, set up observer for pages beyond initial render
  if (useLazyLoading && totalPages > initialRenderCount) {
    const observer = setupLazyRendering(container, config);

    for (let i = initialRenderCount + 1; i <= totalPages; i++) {
      const placeholder = placeholders[i - 1];
      const task = tasks[i - 1];
      // Store the task for lazy rendering
      lazyLoadState.pendingTasks.set(placeholder, task);
      lazyLoadState.pendingTasksByPageNumber.set(task.pageNumber, task);
      observer.observe(placeholder);
    }

    // Prepare eager load queue
    const eagerStartIndex = initialRenderCount;
    const eagerEndIndex = Math.min(
      eagerStartIndex + eagerLoadBatches * batchSize,
      totalPages
    );
    lazyLoadState.eagerLoadQueue = tasks.slice(eagerStartIndex, eagerEndIndex);
    lazyLoadState.nextEagerIndex = 0;
  }

  // Render initial pages in batches
  const initialTasks = tasks.slice(0, initialRenderCount);

  for (let i = 0; i < initialTasks.length; i += batchSize) {
    if (config.shouldCancel?.()) return;

    const batch = initialTasks.slice(i, i + batchSize);

    await new Promise<void>((resolve, reject) => {
      requestIdleCallbackPolyfill(() => {
        renderPageBatch(batch)
          .then(() => {
            if (onProgress) {
              onProgress(
                Math.min(i + batchSize, initialRenderCount),
                totalPages
              );
            }

            if (onBatchComplete) {
              onBatchComplete();
            }

            resolve();
          })
          .catch(reject);
      });
    });
  }

  // Start eager loading AFTER initial batch is complete
  if (
    useLazyLoading &&
    eagerLoadBatches > 0 &&
    totalPages > initialRenderCount
  ) {
    renderEagerBatch(config);
  }
}

/**
 * Manually observe a placeholder element (useful for dynamically created placeholders)
 */
export function observePlaceholder(
  placeholder: HTMLElement,
  task: PageTask
): void {
  if (!lazyLoadState.observer) {
    console.warn('No active observer to register placeholder');
    return;
  }
  lazyLoadState.pendingTasks.set(placeholder, task);
  lazyLoadState.pendingTasksByPageNumber.set(task.pageNumber, task);
  lazyLoadState.observer.observe(placeholder);
}

/**
 * Eagerly renders the next batch in the background
 */
function renderEagerBatch(config: RenderConfig): void {
  const { eagerLoadBatches = 2, batchSize = 8 } = config;

  if (eagerLoadBatches <= 0 || lazyLoadState.eagerLoadQueue.length === 0) {
    return;
  }

  if (config.shouldCancel?.()) return;

  const { nextEagerIndex, eagerLoadQueue } = lazyLoadState;

  if (nextEagerIndex >= eagerLoadQueue.length) {
    return; // All eager batches rendered
  }

  const batchEnd = Math.min(nextEagerIndex + batchSize, eagerLoadQueue.length);
  const batch = eagerLoadQueue.slice(nextEagerIndex, batchEnd);

  requestIdleCallbackPolyfill(async () => {
    if (config.shouldCancel?.()) return;

    const tasksToRender = batch.filter((task) =>
      lazyLoadState.pendingTasksByPageNumber.has(task.pageNumber)
    );

    tasksToRender.forEach((task) => {
      const placeholder = task.placeholderElement;
      if (placeholder && lazyLoadState.observer) {
        lazyLoadState.observer.unobserve(placeholder);
        lazyLoadState.pendingTasks.delete(placeholder);
        lazyLoadState.pendingTasksByPageNumber.delete(task.pageNumber);
      }
    });

    if (tasksToRender.length === 0) {
      lazyLoadState.nextEagerIndex = batchEnd;
      const remainingBatches = Math.ceil(
        (eagerLoadQueue.length - batchEnd) / batchSize
      );
      if (remainingBatches > 0 && remainingBatches < eagerLoadBatches) {
        renderEagerBatch(config);
      }
      return;
    }

    await renderPageBatch(tasksToRender);

    if (config.onBatchComplete) {
      config.onBatchComplete();
    }

    // Update next eager index
    lazyLoadState.nextEagerIndex = batchEnd;

    // Queue next eager batch
    const remainingBatches = Math.ceil(
      (eagerLoadQueue.length - batchEnd) / batchSize
    );
    if (remainingBatches > 0 && remainingBatches < eagerLoadBatches) {
      renderEagerBatch(config);
    }
  });
}

/**
 * Cleanup function to disconnect observers
 */
export function cleanupLazyRendering(): void {
  if (lazyLoadState.observer) {
    lazyLoadState.observer.disconnect();
    lazyLoadState.observer = null;
  }
  lazyLoadState.pendingTasks.clear();
  lazyLoadState.pendingTasksByPageNumber.clear();
  lazyLoadState.isRendering = false;
  lazyLoadState.eagerLoadQueue = [];
  lazyLoadState.nextEagerIndex = 0;
}
