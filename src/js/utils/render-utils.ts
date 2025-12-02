import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

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
    pdfjsDoc: any;
    fileName?: string;
    container: HTMLElement;
    scale?: number;
    createWrapper: (canvas: HTMLCanvasElement, pageNumber: number, fileName?: string) => HTMLElement;
}

/**
 * Lazy loading state
 */
interface LazyLoadState {
    observer: IntersectionObserver | null;
    pendingTasks: Map<HTMLElement, PageTask>;
    isRendering: boolean;
    eagerLoadQueue: PageTask[];
    nextEagerIndex: number;
}

const lazyLoadState: LazyLoadState = {
    observer: null,
    pendingTasks: new Map(),
    isRendering: false,
    eagerLoadQueue: [],
    nextEagerIndex: 0,
};

/**
 * Creates a placeholder element for a page that will be lazy-loaded
 */
export function createPlaceholder(pageNumber: number, fileName?: string): HTMLElement {
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
    skeletonContainer.className = 'relative w-full h-36 bg-gray-700 rounded-md animate-pulse flex items-center justify-center';

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
    pdfjsDoc: any,
    pageNumber: number,
    scale: number = 0.5
): Promise<HTMLCanvasElement> {
    const page = await pdfjsDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const context = canvas.getContext('2d')!;

    await page.render({
        canvasContext: context,
        canvas: canvas,
        viewport,
    }).promise;

    return canvas;
}

/**
 * Renders a batch of pages in parallel
 */
async function renderPageBatch(
    tasks: PageTask[],
    onProgress?: (current: number, total: number) => void
): Promise<void> {
    const renderPromises = tasks.map(async (task) => {
        try {
            const canvas = await renderPageToCanvas(
                task.pdfjsDoc,
                task.pageNumber,
                task.scale || 0.5
            );

            const wrapper = task.createWrapper(canvas, task.pageNumber, task.fileName);

            // Find and replace the placeholder for this specific page number
            const placeholder = task.container.querySelector(
                `[data-page-number="${task.pageNumber}"][data-lazy-load="true"]`
            );

            if (placeholder) {
                // Replace placeholder with rendered page
                task.container.replaceChild(wrapper, placeholder);
            } else {
                // Fallback: shouldn't happen with new approach, but just in case
                console.warn(`No placeholder found for page ${task.pageNumber}, appending instead`);
                task.container.appendChild(wrapper);
            }

            return wrapper;
        } catch (error) {
            console.error(`Error rendering page ${task.pageNumber}:`, error);
            return null;
        }
    });

    await Promise.all(renderPromises);
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
                const task = lazyLoadState.pendingTasks.get(placeholder);

                if (task) {
                    // Immediately unobserve to prevent multiple triggers
                    observer.unobserve(placeholder);
                    lazyLoadState.pendingTasks.delete(placeholder);

                    // Render this page immediately (not waiting for isRendering flag)
                    renderPageBatch([task], config.onProgress)
                        .then(() => {
                            // Trigger callback after lazy load batch
                            if (config.onBatchComplete) {
                                config.onBatchComplete();
                            }

                            // Check if all pages are rendered
                            if (lazyLoadState.pendingTasks.size === 0 && lazyLoadState.observer) {
                                lazyLoadState.observer.disconnect();
                                lazyLoadState.observer = null;
                            }
                        })
                        .catch((error) => {
                            console.error(`Error lazy loading page ${task.pageNumber}:`, error);
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
    pdfjsDoc: any,
    container: HTMLElement,
    createWrapper: (canvas: HTMLCanvasElement, pageNumber: number, fileName?: string) => HTMLElement,
    config: RenderConfig = {}
): Promise<void> {
    const {
        batchSize = 8,  // Increased from 5 to 8 for faster initial render
        useLazyLoading = true,
        eagerLoadBatches = 2, // Eagerly load 1 batch ahead by default
        onProgress,
        onBatchComplete,
    } = config;

    const totalPages = pdfjsDoc.numPages;

    // Render more pages initially to reduce lazy loading issues
    const initialRenderCount = useLazyLoading
        ? Math.min(20, totalPages) // Increased from 12 to 20 pages
        : totalPages;

    // CRITICAL FIX: Create placeholders for ALL pages first to maintain order
    const placeholders: HTMLElement[] = [];
    for (let i = 1; i <= totalPages; i++) {
        const placeholder = createPlaceholder(i);
        container.appendChild(placeholder);
        placeholders.push(placeholder);
    }

    const tasks: PageTask[] = [];

    // Create tasks for all pages
    for (let i = 1; i <= totalPages; i++) {
        tasks.push({
            pageNumber: i,
            pdfjsDoc,
            container,
            scale: config.useLazyLoading ? 0.3 : 0.5,
            createWrapper,
        });
    }

    // If lazy loading is enabled, set up observer for pages beyond initial render
    if (useLazyLoading && totalPages > initialRenderCount) {
        const observer = setupLazyRendering(container, config);

        for (let i = initialRenderCount + 1; i <= totalPages; i++) {
            const placeholder = placeholders[i - 1];
            // Store the task for lazy rendering
            lazyLoadState.pendingTasks.set(placeholder, tasks[i - 1]);
            observer.observe(placeholder);
        }

        // Prepare eager load queue
        const eagerStartIndex = initialRenderCount;
        const eagerEndIndex = Math.min(
            eagerStartIndex + (eagerLoadBatches * batchSize),
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

        await new Promise<void>((resolve) => {
            requestIdleCallbackPolyfill(async () => {
                await renderPageBatch(batch, onProgress);

                if (onProgress) {
                    onProgress(Math.min(i + batchSize, initialRenderCount), totalPages);
                }

                if (onBatchComplete) {
                    onBatchComplete();
                }

                resolve();
            });
        });
    }

    // Start eager loading AFTER initial batch is complete
    if (useLazyLoading && eagerLoadBatches > 0 && totalPages > initialRenderCount) {
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

        // Remove these tasks from pending since we're rendering them eagerly
        batch.forEach(task => {
            const placeholder = Array.from(lazyLoadState.pendingTasks.entries())
                .find(([_, t]) => t.pageNumber === task.pageNumber)?.[0];
            if (placeholder && lazyLoadState.observer) {
                lazyLoadState.observer.unobserve(placeholder);
                lazyLoadState.pendingTasks.delete(placeholder);
            }
        });

        await renderPageBatch(batch, config.onProgress);

        if (config.onBatchComplete) {
            config.onBatchComplete();
        }

        // Update next eager index
        lazyLoadState.nextEagerIndex = batchEnd;

        // Queue next eager batch
        const remainingBatches = Math.ceil((eagerLoadQueue.length - batchEnd) / batchSize);
        if (remainingBatches > 0 && remainingBatches < eagerLoadBatches) {
            // Continue eager loading if we have more batches within the eager threshold
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
    lazyLoadState.isRendering = false;
    lazyLoadState.eagerLoadQueue = [];
    lazyLoadState.nextEagerIndex = 0;
}
