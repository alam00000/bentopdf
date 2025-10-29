import { resetState } from './state.js';
import { formatBytes } from './utils/helpers.js';
import { tesseractLanguages } from './config/tesseract-languages.js';
import { icons, createIcons } from 'lucide';
import Sortable from 'sortablejs';
import { t } from './i18n/index.js';

// Centralizing DOM element selection
export const dom = {
  gridView: document.getElementById('grid-view'),
  toolGrid: document.getElementById('tool-grid'),
  toolInterface: document.getElementById('tool-interface'),
  toolContent: document.getElementById('tool-content'),
  backToGridBtn: document.getElementById('back-to-grid'),
  loaderModal: document.getElementById('loader-modal'),
  loaderText: document.getElementById('loader-text'),
  alertModal: document.getElementById('alert-modal'),
  alertTitle: document.getElementById('alert-title'),
  alertMessage: document.getElementById('alert-message'),
  alertOkBtn: document.getElementById('alert-ok'),
  heroSection: document.getElementById('hero-section'),
  featuresSection: document.getElementById('features-section'),
  toolsHeader: document.getElementById('tools-header'),
  dividers: document.querySelectorAll('.section-divider'),
  hideSections: document.querySelectorAll('.hide-section'),
};

export const showLoader = (text = 'Processing...') => {
  dom.loaderText.textContent = text;
  dom.loaderModal.classList.remove('hidden');
};

export const hideLoader = () => dom.loaderModal.classList.add('hidden');

export const showAlert = (title: any, message: any) => {
  // Check if title and message are translation keys (start with 'alerts.')
  // or if they're already translated strings
  const translatedTitle = typeof title === 'string' && title.startsWith('alerts.') 
    ? t(title) 
    : title;
  const translatedMessage = typeof message === 'string' && message.startsWith('alerts.') 
    ? t(message) 
    : message;
  
  dom.alertTitle.textContent = translatedTitle;
  dom.alertMessage.textContent = translatedMessage;
  dom.alertModal.classList.remove('hidden');
};

export const hideAlert = () => dom.alertModal.classList.add('hidden');

export const switchView = (view: any) => {
  if (view === 'grid') {
    dom.gridView.classList.remove('hidden');
    dom.toolInterface.classList.add('hidden');
    // show hero and features and header
    dom.heroSection.classList.remove('hidden');
    dom.featuresSection.classList.remove('hidden');
    dom.toolsHeader.classList.remove('hidden');
    // show dividers
    dom.dividers.forEach((divider) => {
      divider.classList.remove('hidden');
    });
    // show hideSections
    dom.hideSections.forEach((section) => {
      section.classList.remove('hidden');
    });

    resetState();
  } else {
    dom.gridView.classList.add('hidden');
    dom.toolInterface.classList.remove('hidden');
    dom.featuresSection.classList.add('hidden');
    dom.heroSection.classList.add('hidden');
    dom.toolsHeader.classList.add('hidden');
    dom.dividers.forEach((divider) => {
      divider.classList.add('hidden');
    });
    dom.hideSections.forEach((section) => {
      section.classList.add('hidden');
    });
  }
};

const thumbnailState = {
  sortableInstances: {},
};

function initializeOrganizeSortable(containerId: any) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (thumbnailState.sortableInstances[containerId]) {
    thumbnailState.sortableInstances[containerId].destroy();
  }

  thumbnailState.sortableInstances[containerId] = Sortable.create(container, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.delete-page-btn',
    preventOnFilter: true,
    onStart: function (evt: any) {
      evt.item.style.opacity = '0.5';
    },
    onEnd: function (evt: any) {
      evt.item.style.opacity = '1';
    },
  });
}

/**
 * Renders page thumbnails for tools like 'Organize' and 'Rotate'.
 * @param {string} toolId The ID of the active tool.
 * @param {object} pdfDoc The loaded pdf-lib document instance.
 */
export const renderPageThumbnails = async (toolId: any, pdfDoc: any) => {
  const containerId = toolId === 'organize' ? 'page-organizer' : 'page-rotator';
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  showLoader('Rendering page previews...');

  const pdfData = await pdfDoc.save();
  // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport: viewport }).promise;

    const wrapper = document.createElement('div');
    wrapper.className = 'page-thumbnail relative group';
    // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'string'.
    wrapper.dataset.pageIndex = i - 1;

    const imgContainer = document.createElement('div');
    imgContainer.className =
      'w-full h-36 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600';

    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.className = 'max-w-full max-h-full object-contain';

    imgContainer.appendChild(img);

    if (toolId === 'organize') {
      wrapper.className = 'page-thumbnail relative group';
      wrapper.appendChild(imgContainer);

      const pageNumSpan = document.createElement('span');
      pageNumSpan.className =
        'absolute top-1 left-1 bg-gray-900 bg-opacity-75 text-white text-xs rounded-full px-2 py-1';
      pageNumSpan.textContent = i.toString();

      const deleteBtn = document.createElement('button');
      deleteBtn.className =
        'delete-page-btn absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.addEventListener('click', (e) => {
        (e.currentTarget as HTMLElement).parentElement.remove();
        initializeOrganizeSortable(containerId);
      });

      wrapper.append(pageNumSpan, deleteBtn);
    } else if (toolId === 'rotate') {
      wrapper.className = 'page-rotator-item flex flex-col items-center gap-2';
      wrapper.dataset.rotation = '0';
      img.classList.add('transition-transform', 'duration-300');
      wrapper.appendChild(imgContainer);

      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'flex items-center justify-center gap-3 w-full';

      const pageNumSpan = document.createElement('span');
      pageNumSpan.className = 'font-medium text-sm text-white';
      pageNumSpan.textContent = i.toString();

      const rotateBtn = document.createElement('button');
      rotateBtn.className =
        'rotate-btn btn bg-gray-700 hover:bg-gray-600 p-2 rounded-full';
      rotateBtn.title = 'Rotate 90°';
      rotateBtn.innerHTML = '<i data-lucide="rotate-cw" class="w-5 h-5"></i>';
      rotateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = (e.currentTarget as HTMLElement).closest(
          '.page-rotator-item'
        ) as HTMLElement;
        const imgEl = card.querySelector('img');
        let currentRotation = parseInt(card.dataset.rotation);
        currentRotation = (currentRotation + 90) % 360;
        card.dataset.rotation = currentRotation.toString();
        imgEl.style.transform = `rotate(${currentRotation}deg)`;
      });

      controlsDiv.append(pageNumSpan, rotateBtn);
      wrapper.appendChild(controlsDiv);
    }

    container.appendChild(wrapper);
    createIcons({ icons });
  }

  if (toolId === 'organize') {
    initializeOrganizeSortable(containerId);
  }

  hideLoader();
};

/**
 * Renders a list of uploaded files in the specified container.
 * @param {HTMLElement} container The DOM element to render the list into.
 * @param {File[]} files The array of file objects.
 */
export const renderFileDisplay = (container: any, files: any) => {
  container.textContent = '';
  if (files.length > 0) {
    files.forEach((file: any) => {
      const fileDiv = document.createElement('div');
      fileDiv.className =
        'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'truncate font-medium text-gray-200';
      nameSpan.textContent = file.name;

      const sizeSpan = document.createElement('span');
      sizeSpan.className = 'flex-shrink-0 ml-4 text-gray-400';
      sizeSpan.textContent = formatBytes(file.size);

      fileDiv.append(nameSpan, sizeSpan);
      container.appendChild(fileDiv);
    });
  }
};

const createFileInputHTML = (options = {}) => {
  // @ts-expect-error TS(2339) FIXME: Property 'multiple' does not exist on type '{}'.
  const multiple = options.multiple ? 'multiple' : '';
  // @ts-expect-error TS(2339) FIXME: Property 'accept' does not exist on type '{}'.
  const acceptedFiles = options.accept || 'application/pdf';
  // @ts-expect-error TS(2339) FIXME: Property 'showControls' does not exist on type '{}... Remove this comment to see the full error message
  const showControls = options.showControls || false; // NEW: Add this parameter

  return `
        <div id="drop-zone" class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors duration-300">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <i data-lucide="upload-cloud" class="w-10 h-10 mb-3 text-gray-400"></i>
                <p class="mb-2 text-sm text-gray-400"><span class="font-semibold" data-i18n="fileUpload.clickToSelect">Click to select a file</span> <span data-i18n="fileUpload.orDragDrop">or drag and drop</span></p>
                <p class="text-xs text-gray-500" data-i18n="${multiple ? 'fileUpload.pdfsOrImages' : 'fileUpload.singlePdf'}">${multiple ? 'PDFs or Images' : 'A single PDF file'}</p>
                <p class="text-xs text-gray-500" data-i18n="fileUpload.filesNeverLeave">Your files never leave your device.</p>
            </div>
            <input id="file-input" type="file" class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" ${multiple} accept="${acceptedFiles}">
        </div>
        
        ${
          showControls
            ? `
            <!-- NEW: Add control buttons for multi-file uploads -->
            <div id="file-controls" class="hidden mt-4 flex gap-3">
                <button id="add-more-btn" class="btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                    <i data-lucide="plus"></i> <span data-i18n="fileUpload.addMoreFiles">Add More Files</span>
                </button>
                <button id="clear-files-btn" class="btn bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
                    <i data-lucide="x"></i> <span data-i18n="fileUpload.clearAll">Clear All</span>
                </button>
            </div>
        `
            : ''
        }
    `;
};

export const toolTemplates = {
  merge: () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.merge.heading">Merge PDFs</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.merge.description">Combine whole files, or select specific pages to merge into a new document.</p>
    ${createFileInputHTML({ multiple: true, showControls: true })} 

    <div id="merge-options" class="hidden mt-6">
        <div class="flex gap-2 p-1 rounded-lg bg-gray-900 border border-gray-700 mb-4">
            <button id="file-mode-btn" class="flex-1 btn bg-indigo-600 text-white font-semibold py-2 rounded-md" data-i18n="toolInterfaces.merge.fileModeBtn">File Mode</button>
            <button id="page-mode-btn" class="flex-1 btn text-gray-300 font-semibold py-2 rounded-md" data-i18n="toolInterfaces.merge.pageModeBtn">Page Mode</button>
        </div>

        <div id="file-mode-panel">
            <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-3">
                <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.merge.fileModeHowItWorks">How it works:</strong></p>
                <ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-1">
                    <li><span data-i18n="toolInterfaces.merge.fileModeInstruction1">Click and drag the</span> <i data-lucide="grip-vertical" class="inline-block w-3 h-3"></i> <span data-i18n="toolInterfaces.merge.fileModeInstruction1">icon to change the order of the files.</span></li>
                    <li data-i18n="toolInterfaces.merge.fileModeInstruction2">In the "Pages" box for each file, you can specify ranges (e.g., "1-3, 5") to merge only those pages.</li>
                    <li data-i18n="toolInterfaces.merge.fileModeInstruction3">Leave the "Pages" box blank to include all pages from that file.</li>
                </ul>
            </div>
            <ul id="file-list" class="space-y-2"></ul>
        </div>

        <div id="page-mode-panel" class="hidden">
             <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-3">
                <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.merge.pageModeHowItWorks">How it works:</strong></p>
                 <ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-1">
                    <li data-i18n="toolInterfaces.merge.pageModeInstruction1">All pages from your uploaded PDFs are shown below.</li>
                    <li data-i18n="toolInterfaces.merge.pageModeInstruction2">Simply drag and drop the individual page thumbnails to create the exact order you want for your new file.</li>
                </ul>
            </div>
             <div id="page-merge-preview" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700 min-h-[200px]"></div>
        </div>
        
        <button id="process-btn" class="btn-gradient w-full mt-6" disabled data-i18n="toolInterfaces.merge.processBtn">Merge PDFs</button>
    </div>
`,

  split: () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.split.heading">Split PDF</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.split.description">Extract pages from a PDF using various methods.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>
    <div id="split-options" class="hidden mt-6">
        
        <label for="split-mode" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.split.splitModeLabel">Split Mode</label>
        <select id="split-mode" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 mb-4">
            <option value="range" data-i18n="toolInterfaces.split.modeRange">Extract by Page Range (Default)</option>
            <option value="even-odd" data-i18n="toolInterfaces.split.modeEvenOdd">Split by Even/Odd Pages</option>
            <option value="all" data-i18n="toolInterfaces.split.modeAll">Split All Pages into Separate Files</option>
            <option value="visual" data-i18n="toolInterfaces.split.modeVisual">Select Pages Visually</option>
        </select>

        <div id="range-panel">
            <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-3">
                <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.split.rangeHowItWorks">How it works:</strong></p>
                <ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-1">
                    <li data-i18n="toolInterfaces.split.rangeInstruction1">Enter page numbers separated by commas (e.g., 2, 8, 14).</li>
                    <li data-i18n="toolInterfaces.split.rangeInstruction2">Enter page ranges using a hyphen (e.g., 5-10).</li>
                    <li data-i18n="toolInterfaces.split.rangeInstruction3">Combine them for complex selections (e.g., 1-3, 7, 12-15).</li>
                </ul>
            </div>
            <p class="mb-2 font-medium text-white"><span data-i18n="toolInterfaces.split.totalPages">Total Pages:</span> <span id="total-pages"></span></p>
            <label for="page-range" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.split.pageRangeLabel">Enter page range:</label>
            <input type="text" id="page-range" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.split.pageRangePlaceholder" placeholder="e.g., 1-5, 8">
        </div>

        <div id="even-odd-panel" class="hidden">
            <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-3">
                <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.split.evenOddHowItWorks">How it works:</strong></p>
                <p class="text-xs text-gray-400 mt-1" data-i18n="toolInterfaces.split.evenOddDescription">This will create a new PDF containing only the even or only the odd pages from your original document.</p>
            </div>
            <div class="flex gap-4">
                <label class="flex-1 flex items-center justify-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer has-[:checked]:bg-indigo-600">
                    <input type="radio" name="even-odd-choice" value="odd" checked class="hidden">
                    <span class="font-semibold text-white" data-i18n="toolInterfaces.split.oddPagesOnly">Odd Pages Only</span>
                </label>
                <label class="flex-1 flex items-center justify-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer has-[:checked]:bg-indigo-600">
                    <input type="radio" name="even-odd-choice" value="even" class="hidden">
                    <span class="font-semibold text-white" data-i18n="toolInterfaces.split.evenPagesOnly">Even Pages Only</span>
                </label>
            </div>
        </div>
        
        <div id="visual-select-panel" class="hidden">
             <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-3">
                <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.split.visualHowItWorks">How it works:</strong></p>
                <p class="text-xs text-gray-400 mt-1" data-i18n="toolInterfaces.split.visualDescription">Click on the page thumbnails below to select them. Click again to deselect. All selected pages will be extracted.</p>
            </div>
             <div id="page-selector-grid" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700 min-h-[150px]"></div>
        </div>

        <div id="all-pages-panel" class="hidden p-3 bg-gray-900 rounded-lg border border-gray-700">
            <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.split.allPagesHowItWorks">How it works:</strong></p>
            <p class="text-xs text-gray-400 mt-1" data-i18n="toolInterfaces.split.allPagesDescription">This mode will create a separate PDF file for every single page in your document and download them together in one ZIP archive.</p>
        </div>
        
        <div id="zip-option-wrapper" class="hidden mt-4">
            <label class="flex items-center gap-2 text-sm font-medium text-gray-300">
                <input type="checkbox" id="download-as-zip" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                <span data-i18n="toolInterfaces.split.zipOptionLabel">Download pages as individual files in a ZIP</span>
            </label>
        </div>
        
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.split.processBtn">Split PDF</button>

    </div>
`,
  encrypt: () => `
  <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.encrypt.heading">Encrypt PDF</h2>
  <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.encrypt.description">Add 256-bit AES password protection to your PDF.</p>
  ${createFileInputHTML()}
  <div id="file-display-area" class="mt-4 space-y-2"></div>
  <div id="encrypt-options" class="hidden space-y-4 mt-6">
      <div>
          <label for="user-password-input" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.encrypt.userPasswordLabel">User Password</label>
          <input required type="password" id="user-password-input" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.encrypt.userPasswordPlaceholder" placeholder="Password to open the PDF">
          <p class="text-xs text-gray-500 mt-1" data-i18n="toolInterfaces.encrypt.userPasswordHelp">Required to open and view the PDF</p>
      </div>
      <div>
          <label for="owner-password-input" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.encrypt.ownerPasswordLabel">Owner Password (Optional)</label>
          <input type="password" id="owner-password-input" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.encrypt.ownerPasswordPlaceholder" placeholder="Password for full permissions (recommended)">
          <p class="text-xs text-gray-500 mt-1" data-i18n="toolInterfaces.encrypt.ownerPasswordHelp">Allows changing permissions and removing encryption</p>
      </div>

      <!-- Restriction checkboxes (shown when owner password is entered) -->
      <div id="restriction-options" class="hidden p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 class="font-semibold text-base mb-2 text-white" data-i18n="toolInterfaces.encrypt.restrictionsHeading">🔒 Restrict PDF Permissions</h3>
        <p class="text-sm text-gray-400 mb-3" data-i18n="toolInterfaces.encrypt.restrictionsDescription">Select which actions to disable:</p>
        <div class="space-y-2">
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="restrict-modify" checked>
            <span data-i18n="toolInterfaces.encrypt.restrictModify">Disable all modifications (--modify=none)</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="restrict-extract" checked>
            <span data-i18n="toolInterfaces.encrypt.restrictExtract">Disable text and image extraction (--extract=n)</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="restrict-print" checked>
            <span data-i18n="toolInterfaces.encrypt.restrictPrint">Disable all printing (--print=none)</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="restrict-accessibility">
            <span data-i18n="toolInterfaces.encrypt.restrictAccessibility">Disable accessibility text copying (--accessibility=n)</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="restrict-annotate">
            <span data-i18n="toolInterfaces.encrypt.restrictAnnotate">Disable annotations (--annotate=n)</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="restrict-assemble">
            <span data-i18n="toolInterfaces.encrypt.restrictAssemble">Disable page assembly (--assemble=n)</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="restrict-form">
            <span data-i18n="toolInterfaces.encrypt.restrictForm">Disable form filling (--form=n)</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="restrict-modify-other">
            <span data-i18n="toolInterfaces.encrypt.restrictModifyOther">Disable other modifications (--modify-other=n)</span>
          </label>
        </div>
      </div>

      <div class="p-4 bg-yellow-900/20 border border-yellow-500/30 text-yellow-200 rounded-lg">
          <h3 class="font-semibold text-base mb-2" data-i18n="toolInterfaces.encrypt.securityRecommendation">⚠️ Security Recommendation</h3>
          <p class="text-sm text-gray-300" data-i18n="toolInterfaces.encrypt.securityNote">For strong security, set both passwords. Without an owner password, the security restrictions (printing, copying, etc.) can be easily bypassed.</p>
      </div>
      <div class="p-4 bg-green-900/20 border border-green-500/30 text-green-200 rounded-lg">
          <h3 class="font-semibold text-base mb-2" data-i18n="toolInterfaces.encrypt.highQualityEncryption">✓ High-Quality Encryption</h3>
          <p class="text-sm text-gray-300" data-i18n="toolInterfaces.encrypt.encryptionNote">256-bit AES encryption without quality loss. Text remains selectable and searchable.</p>
      </div>
      <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.encrypt.processBtn">Encrypt & Download</button>
  </div>
`,
  decrypt: () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.decrypt.heading">Decrypt PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.decrypt.description">Upload an encrypted PDF and provide its password to create an unlocked version.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="decrypt-options" class="hidden space-y-4 mt-6">
            <div>
                <label for="password-input" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.decrypt.passwordLabel">Enter PDF Password</label>
                <input type="password" id="password-input" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.decrypt.passwordPlaceholder" placeholder="Enter the current password">
            </div>
            <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.decrypt.processBtn">Decrypt & Download</button>
        </div>
        <canvas id="pdf-canvas" class="hidden"></canvas>
    `,
  organize: () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.organize.heading">Organize PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.organize.description">Reorder, rotate, or delete pages. Drag and drop pages to reorder them.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="page-organizer" class="hidden grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 my-6"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.organize.processBtn">Save Changes</button>
    `,

  rotate: () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.rotate.heading">Rotate PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.rotate.description">Rotate all or specific pages in a PDF document.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        
        <div id="rotate-all-controls" class="hidden my-6">
            <div class="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-semibold text-gray-400 mb-3 text-center" data-i18n="toolInterfaces.rotate.batchActions">BATCH ACTIONS</h3>
                <div class="flex justify-center gap-4">
                    <button id="rotate-all-left-btn" class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 border border-gray-600 rounded-lg shadow-sm hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transform transition-all duration-150 active:scale-95">
                        <i data-lucide="rotate-ccw" class="mr-2 h-4 w-4"></i>
                        <span data-i18n="toolInterfaces.rotate.rotateAllLeft">Rotate All Left</span>
                    </button>
                    <button id="rotate-all-right-btn" class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 border border-gray-600 rounded-lg shadow-sm hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transform transition-all duration-150 active:scale-95">
                        <i data-lucide="rotate-cw" class="mr-2 h-4 w-4"></i>
                        <span data-i18n="toolInterfaces.rotate.rotateAllRight">Rotate All Right</span>
                    </button>
                </div>
            </div>
        </div>
        <div id="page-rotator" class="hidden grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 my-6"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.rotate.processBtn">Save Rotations</button>
    `,

  'add-page-numbers': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.addPageNumbers.heading">Add Page Numbers</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.addPageNumbers.description">Add customizable page numbers to your PDF file.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="pagenum-options" class="hidden grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
                <label for="position" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addPageNumbers.positionLabel">Position</label>
                <select id="position" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                    <option value="bottom-center" data-i18n="toolInterfaces.addPageNumbers.positionBottomCenter">Bottom Center</option>
                    <option value="bottom-left" data-i18n="toolInterfaces.addPageNumbers.positionBottomLeft">Bottom Left</option>
                    <option value="bottom-right" data-i18n="toolInterfaces.addPageNumbers.positionBottomRight">Bottom Right</option>
                    <option value="top-center" data-i18n="toolInterfaces.addPageNumbers.positionTopCenter">Top Center</option>
                    <option value="top-left" data-i18n="toolInterfaces.addPageNumbers.positionTopLeft">Top Left</option>
                    <option value="top-right" data-i18n="toolInterfaces.addPageNumbers.positionTopRight">Top Right</option>
                </select>
            </div>
            <div>
                <label for="font-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addPageNumbers.fontSizeLabel">Font Size</label>
                <input type="number" id="font-size" value="12" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="number-format" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addPageNumbers.formatLabel">Format</label>
                <select id="number-format" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                    <option value="default" data-i18n="toolInterfaces.addPageNumbers.formatDefault">1, 2, 3...</option>
                    <option value="page_x_of_y" data-i18n="toolInterfaces.addPageNumbers.formatPageXOfY">Page 1/N, 2/N...</option>
                </select>
            </div>
            <div>
                <label for="text-color" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addPageNumbers.textColorLabel">Text Color</label>
                <input type="color" id="text-color" value="#000000" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
            </div>
        </div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.addPageNumbers.processBtn">Add Page Numbers</button>
    `,
  'pdf-to-jpg': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pdfToJpg.heading">PDF to JPG</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pdfToJpg.description">Convert each page of a PDF file into a high-quality JPG image.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="jpg-preview" class="hidden text-center mt-6">
            <p class="mb-4 text-white" data-i18n="toolInterfaces.pdfToJpg.previewText">Click "Download All as ZIP" to get images for all pages.</p>
            <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.pdfToJpg.processBtn">Download All as ZIP</button>
        </div>
    `,
  'jpg-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.jpgToPdf.heading">JPG to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.jpgToPdf.description">Convert one or more JPG images into a single PDF file.</p>
        ${createFileInputHTML({ multiple: true, accept: 'image/jpeg', showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.jpgToPdf.processBtn">Convert to PDF</button>
    `,
  'scan-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.scanToPdf.heading">Scan to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.scanToPdf.description">Use your device's camera to scan documents and save them as a PDF. On desktop, this will open a file picker.</p>
        ${createFileInputHTML({ accept: 'image/*' })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.scanToPdf.processBtn">Create PDF from Scans</button>
    `,

  crop: () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.crop.heading">Crop PDF</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.crop.description">Click and drag to select a crop area on any page. You can set different crop areas for each page.</p>
    ${createFileInputHTML()}
    <div id="crop-editor" class="hidden">
        <div class="flex flex-col md:flex-row items-center justify-center gap-4 mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div id="page-nav" class="flex items-center gap-2"></div>
            <div class="border-l border-gray-600 h-6 mx-2 hidden md:block"></div>
            <div id="zoom-controls" class="flex items-center gap-2">
                <button id="zoom-out-btn" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600" data-i18n-title="toolInterfaces.crop.zoomOut" title="Zoom Out"><i data-lucide="zoom-out" class="w-5 h-5"></i></button>
                <button id="fit-page-btn" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600" data-i18n-title="toolInterfaces.crop.fitPage" title="Fit to View"><i data-lucide="minimize" class="w-5 h-5"></i></button>
                <button id="zoom-in-btn" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600" data-i18n-title="toolInterfaces.crop.zoomIn" title="Zoom In"><i data-lucide="zoom-in" class="w-5 h-5"></i></button>
            </div>
             <div class="border-l border-gray-600 h-6 mx-2 hidden md:block"></div>
            <div id="crop-controls" class="flex items-center gap-2">
                 <button id="clear-crop-btn" class="btn bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg text-sm" data-i18n="toolInterfaces.crop.clearPageBtn" data-i18n-title="toolInterfaces.crop.clearPageTitle" title="Clear crop on this page">Clear Page</button>
                 <button id="clear-all-crops-btn" class="btn bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm" data-i18n="toolInterfaces.crop.clearAllBtn" data-i18n-title="toolInterfaces.crop.clearAllTitle" title="Clear all crop selections">Clear All</button>
            </div>
        </div>
        <div id="canvas-container" class="relative w-full overflow-auto bg-gray-900 rounded-lg border border-gray-600" style="height: 70vh;">
            <canvas id="canvas-editor" class="mx-auto cursor-crosshair"></canvas>
        </div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.crop.processBtn">Apply Crop & Save PDF</button>
    </div>
`,
  compress: () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.compress.heading">Compress PDF</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.compress.description">Reduce file size by choosing the compression method that best suits your document.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>
    <div id="compress-options" class="hidden mt-6 space-y-6">
        <div>
            <label for="compression-level" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.compress.compressionLevelLabel">Compression Level</label>
            <select id="compression-level" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="balanced" data-i18n="toolInterfaces.compress.levelBalanced">Balanced (Recommended)</option>
                <option value="high-quality" data-i18n="toolInterfaces.compress.levelHighQuality">High Quality (Larger file)</option>
                <option value="small-size" data-i18n="toolInterfaces.compress.levelSmallSize">Smallest Size (Lower quality)</option>
                <option value="extreme" data-i18n="toolInterfaces.compress.levelExtreme">Extreme (Very low quality)</option>
            </select>
        </div>

        <div>
            <label for="compression-algorithm" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.compress.compressionAlgorithmLabel">Compression Algorithm</label>
            <select id="compression-algorithm" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="vector" data-i18n="toolInterfaces.compress.algorithmVector">Vector (For Text Heavy PDF)</option>
                <option value="photon" data-i18n="toolInterfaces.compress.algorithmPhoton">Photon (For Complex Images & Drawings)</option>
            </select>
            <p class="mt-2 text-xs text-gray-400" data-i18n="toolInterfaces.compress.algorithmNote">
                Choose 'Vector' for text based PDFs, or 'Photon' for scanned documents and complex images.
            </p>
        </div>

        <button id="process-btn" class="btn-gradient w-full mt-4" disabled data-i18n="toolInterfaces.compress.processBtn">Compress PDF</button>
    </div>
`,
  'pdf-to-greyscale': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pdfToGreyscale.heading">PDF to Greyscale</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pdfToGreyscale.description">Convert all pages of a PDF to greyscale. This is done by rendering each page, applying a filter, and rebuilding the PDF.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.pdfToGreyscale.processBtn">Convert to Greyscale</button>
    `,
  'pdf-to-zip': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pdfToZip.heading">Combine PDFs into ZIP</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pdfToZip.description">Select multiple PDF files to download them together in a single ZIP archive.</p>
        ${createFileInputHTML({ multiple: true, showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.pdfToZip.processBtn">Create ZIP File</button>
    `,

  'edit-metadata': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.editMetadata.heading">Edit PDF Metadata</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.editMetadata.description">Modify the core metadata fields of your PDF. Leave a field blank to clear it.</p>
    
    <div class="p-3 mb-6 bg-gray-900 border border-yellow-500/30 text-yellow-200/80 rounded-lg text-sm flex items-start gap-3">
        <i data-lucide="info" class="w-5 h-5 flex-shrink-0 mt-0.5"></i>
        <div>
            <strong class="font-semibold text-yellow-200" data-i18n="toolInterfaces.editMetadata.importantNote">Important Note:</strong>
            <span data-i18n-html="toolInterfaces.editMetadata.noteText">This tool pdf-lib library, which may update the <strong>Producer</strong>, <strong>CreationDate</strong>, and <strong>ModDate</strong> fields due to its default behavior on upload. To accurately view a file's final metadata after editing, or just normal viewing, please use our <strong>View Metadata</strong> tool.</span>
        </div>
    </div>

    ${createFileInputHTML()}
    
    <div id="metadata-form" class="hidden mt-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label for="meta-title" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.editMetadata.titleLabel">Title</label>
                <input type="text" id="meta-title" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="meta-author" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.editMetadata.authorLabel">Author</label>
                <input type="text" id="meta-author" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="meta-subject" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.editMetadata.subjectLabel">Subject</label>
                <input type="text" id="meta-subject" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
             <div>
                <label for="meta-keywords" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.editMetadata.keywordsLabel">Keywords (comma-separated)</label>
                <input type="text" id="meta-keywords" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="meta-creator" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.editMetadata.creatorLabel">Creator Tool</label>
                <input type="text" id="meta-creator" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="meta-producer" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.editMetadata.producerLabel">Producer Tool</label>
                <input type="text" id="meta-producer" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
             <div>
                <label for="meta-creation-date" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.editMetadata.creationDateLabel">Creation Date</label>
                <input type="datetime-local" id="meta-creation-date" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="meta-mod-date" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.editMetadata.modDateLabel">Modification Date</label>
                <input type="datetime-local" id="meta-mod-date" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
        </div>

        <div id="custom-metadata-container" class="space-y-3 pt-4 border-t border-gray-700">
             <h3 class="text-lg font-semibold text-white" data-i18n="toolInterfaces.editMetadata.customFieldsHeading">Custom Fields</h3>
             <p class="text-sm text-gray-400 -mt-2" data-i18n="toolInterfaces.editMetadata.customFieldsNote">Note: Custom fields are not supported by all PDF readers.</p>
        </div>
        <button id="add-custom-meta-btn" class="btn border border-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
            <i data-lucide="plus"></i> <span data-i18n="toolInterfaces.editMetadata.addCustomFieldBtn">Add Custom Field</span>
        </button>
        
    </div>

    <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.editMetadata.processBtn">Update Metadata & Download</button>
`,

  'remove-metadata': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.removeMetadata.heading">Remove PDF Metadata</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.removeMetadata.description">Completely remove identifying metadata from your PDF.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="hidden mt-6 btn-gradient w-full" data-i18n="toolInterfaces.removeMetadata.processBtn">Remove Metadata & Download</button>
    `,
  flatten: () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.flatten.heading">Flatten PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.flatten.description">Make PDF forms and annotations non-editable by flattening them.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="hidden mt-6 btn-gradient w-full" data-i18n="toolInterfaces.flatten.processBtn">Flatten PDF</button>
    `,
  'pdf-to-png': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pdfToPng.heading">PDF to PNG</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pdfToPng.description">Convert each page of a PDF file into a high-quality PNG image.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="png-preview" class="hidden text-center mt-6">
            <p class="mb-4 text-white" data-i18n="toolInterfaces.pdfToPng.previewText">Your file is ready. Click the button to download a ZIP file containing all PNG images.</p>
            <button id="process-btn" class="btn-gradient w-full" data-i18n="toolInterfaces.pdfToPng.processBtn">Download All as ZIP</button>
        </div>
    `,
  'png-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pngToPdf.heading">PNG to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pngToPdf.description">Convert one or more PNG images into a single PDF file.</p>
        ${createFileInputHTML({ multiple: true, accept: 'image/png', showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.pngToPdf.processBtn">Convert to PDF</button>
    `,
  'pdf-to-webp': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pdfToWebp.heading">PDF to WebP</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pdfToWebp.description">Convert each page of a PDF file into a modern WebP image.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="webp-preview" class="hidden text-center mt-6">
            <p class="mb-4 text-white" data-i18n="toolInterfaces.pdfToWebp.previewText">Your file is ready. Click the button to download a ZIP file containing all WebP images.</p>
            <button id="process-btn" class="btn-gradient w-full" data-i18n="toolInterfaces.pdfToWebp.processBtn">Download All as ZIP</button>
        </div>
    `,
  'webp-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.webpToPdf.heading">WebP to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.webpToPdf.description">Convert one or more WebP images into a single PDF file.</p>
        ${createFileInputHTML({ multiple: true, accept: 'image/webp', showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.webpToPdf.processBtn">Convert to PDF</button>
    `,
  edit: () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.edit.heading">PDF Studio</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.edit.description">An all-in-one PDF workspace where you can annotate, draw, highlight, redact, add comments and shapes, take screenshots, and view PDFs.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="embed-pdf-wrapper" class="hidden mt-6 w-full h-[75vh] border border-gray-600 rounded-lg">
            <div id="embed-pdf-container" class="w-full h-full"></div>
        </div>
    `,
  'delete-pages': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.deletePages.heading">Delete Pages</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.deletePages.description">Remove specific pages or ranges of pages from your PDF file.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="delete-options" class="hidden mt-6">
            <p class="mb-2 font-medium text-white"><span data-i18n="toolInterfaces.deletePages.totalPages">Total Pages:</span> <span id="total-pages"></span></p>
            <label for="pages-to-delete" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.deletePages.pagesLabel">Enter pages to delete (e.g., 2, 4-6, 9):</label>
            <input type="text" id="pages-to-delete" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 mb-6" data-i18n-placeholder="toolInterfaces.deletePages.pagesPlaceholder" placeholder="e.g., 2, 4-6, 9">
            <button id="process-btn" class="btn-gradient w-full" data-i18n="toolInterfaces.deletePages.processBtn">Delete Pages & Download</button>
        </div>
    `,
  'add-blank-page': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.addBlankPage.heading">Add Blank Pages</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.addBlankPage.description">Insert one or more blank pages at a specific position in your document.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="blank-page-options" class="hidden mt-6">
            <p class="mb-2 font-medium text-white"><span data-i18n="toolInterfaces.addBlankPage.totalPages">Total Pages:</span> <span id="total-pages"></span></p>
            <label for="page-number" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addBlankPage.positionLabel">Insert blank pages after page number:</label>
            <input type="number" id="page-number" min="0" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 mb-4" data-i18n-placeholder="toolInterfaces.addBlankPage.positionPlaceholder" placeholder="Enter 0 to add to the beginning">
            <label for="page-count" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addBlankPage.countLabel">Number of blank pages to insert:</label>
            <input type="number" id="page-count" min="1" value="1" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 mb-6" data-i18n-placeholder="toolInterfaces.addBlankPage.countPlaceholder" placeholder="Enter number of pages">
            <button id="process-btn" class="btn-gradient w-full" data-i18n="toolInterfaces.addBlankPage.processBtn">Add Pages & Download</button>
        </div>
    `,
  'extract-pages': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.extractPages.heading">Extract Pages</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.extractPages.description">Extract specific pages from a PDF into separate files. Your files will download in a ZIP archive.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="extract-options" class="hidden mt-6">
            <p class="mb-2 font-medium text-white"><span data-i18n="toolInterfaces.extractPages.totalPages">Total Pages:</span> <span id="total-pages"></span></p>
            <label for="pages-to-extract" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.extractPages.pagesLabel">Enter pages to extract (e.g., 2, 4-6, 9):</label>
            <input type="text" id="pages-to-extract" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 mb-6" data-i18n-placeholder="toolInterfaces.extractPages.pagesPlaceholder" placeholder="e.g., 2, 4-6, 9">
            <button id="process-btn" class="btn-gradient w-full" data-i18n="toolInterfaces.extractPages.processBtn">Extract & Download ZIP</button>
        </div>
    `,

  'add-watermark': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.addWatermark.heading">Add Watermark</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.addWatermark.description">Apply a text or image watermark to every page of your PDF document.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>

    <div id="watermark-options" class="hidden mt-6 space-y-4">
        <div class="flex gap-4 p-2 rounded-lg bg-gray-900">
            <label class="flex-1 flex items-center justify-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer has-[:checked]:bg-indigo-600">
                <input type="radio" name="watermark-type" value="text" checked class="hidden">
                <span class="font-semibold text-white" data-i18n="toolInterfaces.addWatermark.typeText">Text</span>
            </label>
            <label class="flex-1 flex items-center justify-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer has-[:checked]:bg-indigo-600">
                <input type="radio" name="watermark-type" value="image" class="hidden">
                <span class="font-semibold text-white" data-i18n="toolInterfaces.addWatermark.typeImage">Image</span>
            </label>
        </div>

        <div id="text-watermark-options">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="watermark-text" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addWatermark.watermarkTextLabel">Watermark Text</label>
                    <input type="text" id="watermark-text" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.addWatermark.watermarkTextPlaceholder" placeholder="e.g., CONFIDENTIAL">
                </div>
                <div>
                    <label for="font-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addWatermark.fontSizeLabel">Font Size</label>
                    <input type="number" id="font-size" value="72" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                </div>
            </div>
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                    <label for="text-color" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addWatermark.textColorLabel">Text Color</label>
                    <input type="color" id="text-color" value="#000000" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
                </div>
                <div>
                    <label for="opacity-text" class="block mb-2 text-sm font-medium text-gray-300"><span data-i18n="toolInterfaces.addWatermark.opacityLabel">Opacity</span> (<span id="opacity-value-text">0.3</span>)</label>
                    <input type="range" id="opacity-text" value="0.3" min="0" max="1" step="0.1" class="w-full">
                </div>
            </div>
            <div class="mt-4">
                <label for="angle-text" class="block mb-2 text-sm font-medium text-gray-300"><span data-i18n="toolInterfaces.addWatermark.angleLabel">Angle</span> (<span id="angle-value-text">0</span>°)</label>
                <input type="range" id="angle-text" value="0" min="-180" max="180" step="1" class="w-full">
            </div>
        </div>

        <div id="image-watermark-options" class="hidden space-y-4">
            <div>
                <label for="image-watermark-input" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addWatermark.uploadImageLabel">Upload Watermark Image</label>
                <input type="file" id="image-watermark-input" accept="image/png, image/jpeg" class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700">
            </div>
            <div>
                <label for="opacity-image" class="block mb-2 text-sm font-medium text-gray-300"><span data-i18n="toolInterfaces.addWatermark.opacityLabel">Opacity</span> (<span id="opacity-value-image">0.3</span>)</label>
                <input type="range" id="opacity-image" value="0.3" min="0" max="1" step="0.1" class="w-full">
            </div>
            <div>
                <label for="angle-image" class="block mb-2 text-sm font-medium text-gray-300"><span data-i18n="toolInterfaces.addWatermark.angleLabel">Angle</span> (<span id="angle-value-image">0</span>°)</label>
                <input type="range" id="angle-image" value="0" min="-180" max="180" step="1" class="w-full">
            </div>
        </div>

    </div>
    <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.addWatermark.processBtn">Add Watermark & Download</button>
`,

  'add-header-footer': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.addHeaderFooter.heading">Add Header & Footer</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.addHeaderFooter.description">Add custom text to the top and bottom margins of every page.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>
    <div id="header-footer-options" class="hidden mt-6 space-y-4">
        
        <div class="p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-3" data-i18n="toolInterfaces.addHeaderFooter.formattingOptions">Formatting Options</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label for="page-range" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.pageRangeLabel">Page Range (optional)</label>
                    <input type="text" id="page-range" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.addHeaderFooter.pageRangePlaceholder" placeholder="e.g., 1-3, 5">
                    <p class="text-xs text-gray-400 mt-1"><span data-i18n="toolInterfaces.addHeaderFooter.totalPages">Total pages:</span> <span id="total-pages">0</span></p>
                </div>
                <div>
                    <label for="font-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.fontSizeLabel">Font Size</label>
                    <input type="number" id="font-size" value="10" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                </div>
                <div>
                    <label for="font-color" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.fontColorLabel">Font Color</label>
                    <input type="color" id="font-color" value="#000000" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label for="header-left" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.headerLeft">Header Left</label>
                <input type="text" id="header-left" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="header-center" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.headerCenter">Header Center</label>
                <input type="text" id="header-center" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="header-right" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.headerRight">Header Right</label>
                <input type="text" id="header-right" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label for="footer-left" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.footerLeft">Footer Left</label>
                <input type="text" id="footer-left" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="footer-center" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.footerCenter">Footer Center</label>
                <input type="text" id="footer-center" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="footer-right" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.addHeaderFooter.footerRight">Footer Right</label>
                <input type="text" id="footer-right" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
        </div>
    </div>
    <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.addHeaderFooter.processBtn">Apply Header & Footer</button>
`,

  'image-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.imageToPdf.heading">Image to PDF Converter</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.imageToPdf.description">Combine multiple images into a single PDF. Drag and drop to reorder.</p>
        ${createFileInputHTML({ multiple: true, accept: 'image/jpeg,image/png,image/webp', showControls: true })}
        <ul id="image-list" class="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"></ul>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.imageToPdf.processBtn">Convert to PDF</button>
    `,

  'change-permissions': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.changePermissions.heading">Change PDF Permissions</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.changePermissions.description">Modify passwords and permissions without losing quality.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>
    <div id="permissions-options" class="hidden mt-6 space-y-4">
        <div>
            <label for="current-password" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.changePermissions.currentPasswordLabel">Current Password (if encrypted)</label>
            <input type="password" id="current-password" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.changePermissions.currentPasswordPlaceholder" placeholder="Leave blank if PDF is not password-protected">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="new-user-password" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.changePermissions.newUserPasswordLabel">New User Password (optional)</label>
                <input type="password" id="new-user-password" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.changePermissions.newUserPasswordPlaceholder" placeholder="Password to open PDF">
            </div>
            <div>
                <label for="new-owner-password" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.changePermissions.newOwnerPasswordLabel">New Owner Password (optional)</label>
                <input type="password" id="new-owner-password" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.changePermissions.newOwnerPasswordPlaceholder" placeholder="Password for full permissions">
            </div>
        </div>

        <div class="p-4 bg-blue-900/20 border border-blue-500/30 text-blue-200 rounded-lg">
            <h3 class="font-semibold text-base mb-2" data-i18n="toolInterfaces.changePermissions.howItWorksHeading">How It Works</h3>
            <ul class="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li data-i18n-html="toolInterfaces.changePermissions.howItWorksItem1"><strong>User Password:</strong> Required to open the PDF</li>
                <li data-i18n-html="toolInterfaces.changePermissions.howItWorksItem2"><strong>Owner Password:</strong> Required to enforce the permissions below</li>
                <li data-i18n="toolInterfaces.changePermissions.howItWorksItem3">Leave both blank to remove all encryption and restrictions</li>
                <li data-i18n="toolInterfaces.changePermissions.howItWorksItem4">Check boxes below to ALLOW specific actions (unchecked = disabled)</li>
            </ul>
        </div>
        
        <fieldset class="border border-gray-600 p-4 rounded-lg">
            <legend class="px-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.changePermissions.permissionsLegend">Permissions (only enforced with Owner Password):</legend>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <label class="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                    <input type="checkbox" id="allow-printing" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"> 
                    <span data-i18n="toolInterfaces.changePermissions.allowPrinting">Allow Printing</span>
                </label>
                <label class="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                    <input type="checkbox" id="allow-copying" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"> 
                    <span data-i18n="toolInterfaces.changePermissions.allowCopying">Allow Text/Image Extraction</span>
                </label>
                <label class="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                    <input type="checkbox" id="allow-modifying" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"> 
                    <span data-i18n="toolInterfaces.changePermissions.allowModifying">Allow Modifications</span>
                </label>
                <label class="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                    <input type="checkbox" id="allow-annotating" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"> 
                    <span data-i18n="toolInterfaces.changePermissions.allowAnnotating">Allow Annotations</span>
                </label>
                <label class="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                    <input type="checkbox" id="allow-filling-forms" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"> 
                    <span data-i18n="toolInterfaces.changePermissions.allowFillingForms">Allow Form Filling</span>
                </label>
                <label class="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                    <input type="checkbox" id="allow-document-assembly" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"> 
                    <span data-i18n="toolInterfaces.changePermissions.allowDocumentAssembly">Allow Page Assembly</span>
                </label>
                <label class="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                    <input type="checkbox" id="allow-page-extraction" checked class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"> 
                    <span data-i18n="toolInterfaces.changePermissions.allowPageExtraction">Allow Page Extraction</span>
                </label>
            </div>
        </fieldset>
    </div>
    <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.changePermissions.processBtn">Apply Changes</button>
`,

  'pdf-to-markdown': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pdfToMarkdown.heading">PDF to Markdown</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pdfToMarkdown.description">Convert a PDF's text content into a structured Markdown file.</p>
        ${createFileInputHTML({ accept: '.pdf' })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div class="hidden mt-4 p-3 bg-gray-900 border border-yellow-500/30 text-yellow-200 rounded-lg" id="quality-note">
            <p class="text-sm text-gray-400" data-i18n-html="toolInterfaces.pdfToMarkdown.note"><b>Note:</b> This is a text-focused conversion. Tables and images will not be included.</p>
        </div>
        <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.pdfToMarkdown.processBtn">Convert to Markdown</button>
    `,
  'txt-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.txtToPdf.heading">Text to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.txtToPdf.description">Type or paste your text below and convert it to a PDF with custom formatting.</p>
        <textarea id="text-input" rows="12" class="w-full bg-gray-900 border border-gray-600 text-gray-300 rounded-lg p-2.5 font-sans" data-i18n-placeholder="toolInterfaces.txtToPdf.textareaPlaceholder" placeholder="Start typing here..."></textarea>
        <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
                <label for="font-family" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.txtToPdf.fontFamilyLabel">Font Family</label>
                <select id="font-family" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                    <option value="Helvetica" data-i18n="toolInterfaces.txtToPdf.fontHelvetica">Helvetica</option>
                    <option value="TimesRoman" data-i18n="toolInterfaces.txtToPdf.fontTimesRoman">Times New Roman</option>
                    <option value="Courier" data-i18n="toolInterfaces.txtToPdf.fontCourier">Courier</option>
                </select>
            </div>
            <div>
                <label for="font-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.txtToPdf.fontSizeLabel">Font Size</label>
                <input type="number" id="font-size" value="12" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
            </div>
            <div>
                <label for="page-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.txtToPdf.pageSizeLabel">Page Size</label>
                <select id="page-size" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                    <option value="A4" data-i18n="toolInterfaces.txtToPdf.pageSizeA4">A4</option>
                    <option value="Letter" data-i18n="toolInterfaces.txtToPdf.pageSizeLetter">Letter</option>
                </select>
            </div>
            <div>
                <label for="text-color" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.txtToPdf.textColorLabel">Text Color</label>
                <input type="color" id="text-color" value="#000000" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
            </div>
        </div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.txtToPdf.processBtn">Create PDF</button>
    `,
  'invert-colors': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.invertColors.heading">Invert PDF Colors</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.invertColors.description">Convert your PDF to a "dark mode" by inverting its colors. This works best on simple text and image documents.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.invertColors.processBtn">Invert Colors & Download</button>
    `,
  'view-metadata': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.viewMetadata.heading">View PDF Metadata</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.viewMetadata.description">Upload a PDF to view its internal properties, such as Title, Author, and Creation Date.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="metadata-results" class="hidden mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg"></div>
    `,
  'reverse-pages': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.reversePages.heading">Reverse PDF Pages</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.reversePages.description">Flip the order of all pages in your document, making the last page the first.</p>
        ${createFileInputHTML({ multiple: true, accept: 'application/pdf', showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.reversePages.processBtn">Reverse & Download</button>
    `,
  'md-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.mdToPdf.heading">Markdown to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n-html="toolInterfaces.mdToPdf.description">Write in Markdown, select your formatting options, and get a high-quality, multi-page PDF. <br><strong class="text-gray-300">Note:</strong> Images linked from the web (e.g., https://...) require an internet connection to be rendered.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
                <label for="page-format" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.mdToPdf.pageFormatLabel">Page Format</label>
                <select id="page-format" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                    <option value="a4" data-i18n="toolInterfaces.mdToPdf.pageFormatA4">A4</option>
                    <option value="letter" data-i18n="toolInterfaces.mdToPdf.pageFormatLetter">Letter</option>
                </select>
            </div>
            <div>
                <label for="orientation" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.mdToPdf.orientationLabel">Orientation</label>
                <select id="orientation" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                    <option value="portrait" data-i18n="toolInterfaces.mdToPdf.orientationPortrait">Portrait</option>
                    <option value="landscape" data-i18n="toolInterfaces.mdToPdf.orientationLandscape">Landscape</option>
                </select>
            </div>
            <div>
                <label for="margin-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.mdToPdf.marginLabel">Margin Size</label>
                <select id="margin-size" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                    <option value="normal" data-i18n="toolInterfaces.mdToPdf.marginNormal">Normal</option>
                    <option value="narrow" data-i18n="toolInterfaces.mdToPdf.marginNarrow">Narrow</option>
                    <option value="wide" data-i18n="toolInterfaces.mdToPdf.marginWide">Wide</option>
                </select>
            </div>
        </div>
        <div class="h-[50vh]">
            <label for="md-input" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.mdToPdf.editorLabel">Markdown Editor</label>
            <textarea id="md-input" class="w-full h-full bg-gray-900 border border-gray-600 text-gray-300 rounded-lg p-3 font-mono resize-none" data-i18n-placeholder="toolInterfaces.mdToPdf.editorPlaceholder" placeholder="# Welcome to Markdown..."></textarea>
        </div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.mdToPdf.processBtn">Create PDF from Markdown</button>
    `,
  'svg-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.svgToPdf.heading">SVG to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.svgToPdf.description">Convert one or more SVG vector images into a single PDF file.</p>
        ${createFileInputHTML({ multiple: true, accept: 'image/svg+xml', showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.svgToPdf.processBtn">Convert to PDF</button>
    `,
  'bmp-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.bmpToPdf.heading">BMP to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.bmpToPdf.description">Convert one or more BMP images into a single PDF file.</p>
        ${createFileInputHTML({ multiple: true, accept: 'image/bmp', showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.bmpToPdf.processBtn">Convert to PDF</button>
    `,
  'heic-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.heicToPdf.heading">HEIC to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.heicToPdf.description">Convert one or more HEIC (High Efficiency) images from your iPhone or camera into a single PDF file.</p>
        ${createFileInputHTML({ multiple: true, accept: '.heic,.heif', showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.heicToPdf.processBtn">Convert to PDF</button>
    `,
  'tiff-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.tiffToPdf.heading">TIFF to PDF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.tiffToPdf.description">Convert one or more single or multi-page TIFF images into a single PDF file.</p>
        ${createFileInputHTML({ multiple: true, accept: 'image/tiff', showControls: true })}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.tiffToPdf.processBtn">Convert to PDF</button>
    `,
  'pdf-to-bmp': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pdfToBmp.heading">PDF to BMP</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pdfToBmp.description">Convert each page of a PDF file into a BMP image. Your files will be downloaded in a ZIP archive.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.pdfToBmp.processBtn">Convert to BMP & Download ZIP</button>
    `,
  'pdf-to-tiff': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pdfToTiff.heading">PDF to TIFF</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pdfToTiff.description">Convert each page of a PDF file into a high-quality TIFF image. Your files will be downloaded in a ZIP archive.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.pdfToTiff.processBtn">Convert to TIFF & Download ZIP</button>
    `,

  'split-in-half': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.splitInHalf.heading">Split Pages in Half</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.splitInHalf.description">Choose a method to divide every page of your document into two separate pages.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>

        <div id="split-half-options" class="hidden mt-6">
            <label for="split-type" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.splitInHalf.splitTypeLabel">Select Split Type</label>
            <select id="split-type" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 mb-6">
                <option value="vertical" data-i18n="toolInterfaces.splitInHalf.splitVertical">Split Vertically (Left & Right halves)</option>
                <option value="horizontal" data-i18n="toolInterfaces.splitInHalf.splitHorizontal">Split Horizontally (Top & Bottom halves)</option>
            </select>

            <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.splitInHalf.processBtn">Split PDF</button>
        </div>
    `,
  'page-dimensions': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.pageDimensions.heading">Analyze Page Dimensions</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.pageDimensions.description">Upload a PDF to see the precise dimensions, standard size, and orientation of every page.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>

        <div id="dimensions-results" class="hidden mt-6">
            <div class="flex justify-end mb-4">
                <label for="units-select" class="text-sm font-medium text-gray-300 self-center mr-3" data-i18n="toolInterfaces.pageDimensions.unitsLabel">Display Units:</label>
                <select id="units-select" class="bg-gray-700 border border-gray-600 text-white rounded-lg p-2">
                    <option value="pt" selected data-i18n="toolInterfaces.pageDimensions.unitsPoints">Points (pt)</option>
                    <option value="in" data-i18n="toolInterfaces.pageDimensions.unitsInches">Inches (in)</option>
                    <option value="mm" data-i18n="toolInterfaces.pageDimensions.unitsMillimeters">Millimeters (mm)</option>
                    <option value="px" data-i18n="toolInterfaces.pageDimensions.unitsPixels">Pixels (at 96 DPI)</option>
                </select>
            </div>
            <div class="overflow-x-auto rounded-lg border border-gray-700">
                <table class="min-w-full divide-y divide-gray-700 text-sm text-left">
                    <thead class="bg-gray-900">
                        <tr>
                            <th class="px-4 py-3 font-medium text-white" data-i18n="toolInterfaces.pageDimensions.tableHeaderPage">Page #</th>
                            <th class="px-4 py-3 font-medium text-white" data-i18n="toolInterfaces.pageDimensions.tableHeaderDimensions">Dimensions (W x H)</th>
                            <th class="px-4 py-3 font-medium text-white" data-i18n="toolInterfaces.pageDimensions.tableHeaderStandard">Standard Size</th>
                            <th class="px-4 py-3 font-medium text-white" data-i18n="toolInterfaces.pageDimensions.tableHeaderOrientation">Orientation</th>
                        </tr>
                    </thead>
                    <tbody id="dimensions-table-body" class="divide-y divide-gray-700">
                        </tbody>
                </table>
            </div>
        </div>
    `,

  'n-up': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.nUp.heading">N-Up Page Arrangement</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.nUp.description">Combine multiple pages from your PDF onto a single sheet. This is great for creating booklets or proof sheets.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>

        <div id="n-up-options" class="hidden mt-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="pages-per-sheet" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.nUp.pagesPerSheetLabel">Pages Per Sheet</label>
                    <select id="pages-per-sheet" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                        <option value="2" data-i18n="toolInterfaces.nUp.pages2Up">2-Up</option>
                        <option value="4" selected data-i18n="toolInterfaces.nUp.pages4Up">4-Up (2x2)</option>
                        <option value="9" data-i18n="toolInterfaces.nUp.pages9Up">9-Up (3x3)</option>
                        <option value="16" data-i18n="toolInterfaces.nUp.pages16Up">16-Up (4x4)</option>
                    </select>
                </div>
                <div>
                    <label for="output-page-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.nUp.outputPageSizeLabel">Output Page Size</label>
                    <select id="output-page-size" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                        <option value="Letter" data-i18n="toolInterfaces.nUp.outputLetter">Letter (8.5 x 11 in)</option>
                        <option value="Legal" data-i18n="toolInterfaces.nUp.outputLegal">Legal (8.5 x 14 in)</option>
                        <option value="Tabloid" data-i18n="toolInterfaces.nUp.outputTabloid">Tabloid (11 x 17 in)</option>
                        <option value="A4" selected data-i18n="toolInterfaces.nUp.outputA4">A4 (210 x 297 mm)</option>
                        <option value="A3" data-i18n="toolInterfaces.nUp.outputA3">A3 (297 x 420 mm)</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label for="output-orientation" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.nUp.outputOrientationLabel">Output Orientation</label>
                    <select id="output-orientation" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                        <option value="auto" selected data-i18n="toolInterfaces.nUp.orientationAuto">Automatic</option>
                        <option value="portrait" data-i18n="toolInterfaces.nUp.orientationPortrait">Portrait</option>
                        <option value="landscape" data-i18n="toolInterfaces.nUp.orientationLandscape">Landscape</option>
                    </select>
                </div>
                <div class="flex items-end pb-1">
                     <label class="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <input type="checkbox" id="add-margins" checked class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                        <span data-i18n="toolInterfaces.nUp.addMarginsLabel">Add Margins & Gutters</span>
                    </label>
                </div>
            </div>

            <div class="border-t border-gray-700 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex items-center">
                     <label class="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <input type="checkbox" id="add-border" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                        <span data-i18n="toolInterfaces.nUp.addBorderLabel">Draw Border Around Each Page</span>
                    </label>
                </div>
                 <div id="border-color-wrapper" class="hidden">
                    <label for="border-color" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.nUp.borderColorLabel">Border Color</label>
                     <input type="color" id="border-color" value="#000000" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
                </div>
            </div>

            <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.nUp.processBtn">Create N-Up PDF</button>
        </div>
    `,

  'duplicate-organize': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.duplicateOrganize.heading">Page Manager</h2>
        <p class="mb-6 text-gray-400" data-i18n-html="toolInterfaces.duplicateOrganize.description">Drag pages to reorder them. Use the <i data-lucide="copy-plus" class="inline-block w-4 h-4 text-green-400"></i> icon to duplicate a page or the <i data-lucide="x-circle" class="inline-block w-4 h-4 text-red-400"></i> icon to delete it.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>

        <div id="page-manager-options" class="hidden mt-6">
             <div id="page-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 my-6">
                </div>
             <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.duplicateOrganize.processBtn">Save New PDF</button>
        </div>
    `,

  'combine-single-page': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.combineSinglePage.heading">Combine to a Single Page</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.combineSinglePage.description">Stitch all pages of your PDF together vertically to create one continuous, scrollable page.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>

        <div id="combine-options" class="hidden mt-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="page-spacing" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.combineSinglePage.pageSpacingLabel">Spacing Between Pages (in points)</label>
                    <input type="number" id="page-spacing" value="18" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                </div>
                <div>
                    <label for="background-color" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.combineSinglePage.backgroundColorLabel">Background Color</label>
                    <input type="color" id="background-color" value="#FFFFFF" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
                </div>
            </div>
            <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <input type="checkbox" id="add-separator" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                    <span data-i18n="toolInterfaces.combineSinglePage.addSeparatorLabel">Draw a separator line between pages</span>
                </label>
            </div>
            <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.combineSinglePage.processBtn">Combine Pages</button>
        </div>
    `,

  'fix-dimensions': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.fixDimensions.heading">Standardize Page Dimensions</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.fixDimensions.description">Convert all pages in your PDF to a uniform size. Choose a standard format or define a custom dimension.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>

        <div id="fix-dimensions-options" class="hidden mt-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="target-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.fixDimensions.targetSizeLabel">Target Size</label>
                    <select id="target-size" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                        <option value="A4" selected>A4</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                        <option value="Tabloid">Tabloid</option>
                        <option value="A3">A3</option>
                        <option value="A5">A5</option>
                        <option value="Custom" data-i18n="toolInterfaces.fixDimensions.customSize">Custom Size...</option>
                    </select>
                </div>
                <div>
                    <label for="orientation" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.fixDimensions.orientationLabel">Orientation</label>
                    <select id="orientation" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                        <option value="portrait" selected data-i18n="toolInterfaces.fixDimensions.orientationPortrait">Portrait</option>
                        <option value="landscape" data-i18n="toolInterfaces.fixDimensions.orientationLandscape">Landscape</option>
                    </select>
                </div>
            </div>

            <div id="custom-size-wrapper" class="hidden p-4 rounded-lg bg-gray-900 border border-gray-700 grid grid-cols-3 gap-3">
                <div>
                    <label for="custom-width" class="block mb-2 text-xs font-medium text-gray-300" data-i18n="toolInterfaces.fixDimensions.customWidthLabel">Width</label>
                    <input type="number" id="custom-width" value="8.5" class="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-2">
                </div>
                <div>
                    <label for="custom-height" class="block mb-2 text-xs font-medium text-gray-300" data-i18n="toolInterfaces.fixDimensions.customHeightLabel">Height</label>
                    <input type="number" id="custom-height" value="11" class="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-2">
                </div>
                <div>
                    <label for="custom-units" class="block mb-2 text-xs font-medium text-gray-300" data-i18n="toolInterfaces.fixDimensions.customUnitsLabel">Units</label>
                    <select id="custom-units" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2">
                        <option value="in" data-i18n="toolInterfaces.fixDimensions.unitsInches">Inches</option>
                        <option value="mm" data-i18n="toolInterfaces.fixDimensions.unitsMillimeters">Millimeters</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.fixDimensions.scalingMethodLabel">Content Scaling Method</label>
                <div class="flex gap-4 p-2 rounded-lg bg-gray-900">
                    <label class="flex-1 flex items-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer">
                        <input type="radio" name="scaling-mode" value="fit" checked class="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                        <div>
                            <span class="font-semibold text-white" data-i18n="toolInterfaces.fixDimensions.scalingFit">Fit</span>
                            <p class="text-xs text-gray-400" data-i18n="toolInterfaces.fixDimensions.scalingFitDescription">Preserves all content, may add white bars.</p>
                        </div>
                    </label>
                    <label class="flex-1 flex items-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer">
                        <input type="radio" name="scaling-mode" value="fill" class="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                         <div>
                            <span class="font-semibold text-white" data-i18n="toolInterfaces.fixDimensions.scalingFill">Fill</span>
                            <p class="text-xs text-gray-400" data-i18n="toolInterfaces.fixDimensions.scalingFillDescription">Covers the page, may crop content.</p>
                        </div>
                    </label>
                </div>
            </div>

             <div>
                <label for="background-color" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.fixDimensions.backgroundColorLabel">Background Color (for 'Fit' mode)</label>
                <input type="color" id="background-color" value="#FFFFFF" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
            </div>

            <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.fixDimensions.processBtn">Standardize Pages</button>
        </div>
    `,

  'change-background-color': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.changeBackgroundColor.heading">Change Background Color</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.changeBackgroundColor.description">Select a new background color for every page of your PDF.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="change-background-color-options" class="hidden mt-6">
            <label for="background-color" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.changeBackgroundColor.colorLabel">Choose Background Color</label>
            <input type="color" id="background-color" value="#FFFFFF" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
            <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.changeBackgroundColor.processBtn">Apply Color & Download</button>
        </div>
    `,

  'change-text-color': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.changeTextColor.heading">Change Text Color</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.changeTextColor.description">Change the color of dark text in your PDF. This process converts pages to images, so text will not be selectable in the final file.</p>
        ${createFileInputHTML()}
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <div id="text-color-options" class="hidden mt-6 space-y-4">
            <div>
                <label for="text-color-input" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.changeTextColor.colorLabel">Select Text Color</label>
                <input type="color" id="text-color-input" value="#FF0000" class="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                    <h3 class="font-semibold text-white mb-2" data-i18n="toolInterfaces.changeTextColor.originalLabel">Original</h3>
                    <canvas id="original-canvas" class="w-full h-auto rounded-lg border-2 border-gray-600"></canvas>
                </div>
                <div class="text-center">
                    <h3 class="font-semibold text-white mb-2" data-i18n="toolInterfaces.changeTextColor.previewLabel">Preview</h3>
                    <canvas id="text-color-canvas" class="w-full h-auto rounded-lg border-2 border-gray-600"></canvas>
                </div>
            </div>
            <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.changeTextColor.processBtn">Apply Color & Download</button>
        </div>
    `,

  'compare-pdfs': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.comparePdfs.heading">Compare PDFs</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.comparePdfs.description">Upload two files to visually compare them using either an overlay or a side-by-side view.</p>
        
        <div id="compare-upload-area" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="drop-zone-1" class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700">
                <div id="file-display-1" class="flex flex-col items-center justify-center pt-5 pb-6">
                    <i data-lucide="file-scan" class="w-10 h-10 mb-3 text-gray-400"></i>
                    <p class="mb-2 text-sm text-gray-400"><span class="font-semibold" data-i18n="toolInterfaces.comparePdfs.uploadOriginal">Upload Original PDF</span></p>
                </div>
                <input id="file-input-1" type="file" class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept="application/pdf">
            </div>
            <div id="drop-zone-2" class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700">
                <div id="file-display-2" class="flex flex-col items-center justify-center pt-5 pb-6">
                    <i data-lucide="file-diff" class="w-10 h-10 mb-3 text-gray-400"></i>
                    <p class="mb-2 text-sm text-gray-400"><span class="font-semibold" data-i18n="toolInterfaces.comparePdfs.uploadRevised">Upload Revised PDF</span></p>
                </div>
                <input id="file-input-2" type="file" class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept="application/pdf">
            </div>
        </div>

        <div id="compare-viewer" class="hidden mt-6">
            <div class="flex flex-wrap items-center justify-center gap-4 mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <button id="prev-page-compare" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><i data-lucide="chevron-left"></i></button>
                <span class="text-white font-medium"><span data-i18n="toolInterfaces.comparePdfs.pageDisplay">Page</span> <span id="current-page-display-compare">1</span> <span data-i18n="toolInterfaces.comparePdfs.of">of</span> <span id="total-pages-display-compare">1</span></span>
                <button id="next-page-compare" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><i data-lucide="chevron-right"></i></button>
                <div class="border-l border-gray-600 h-6 mx-2"></div>
                <div class="bg-gray-700 p-1 rounded-md flex gap-1">
                    <button id="view-mode-overlay" class="btn bg-indigo-600 px-3 py-1 rounded text-sm font-semibold" data-i18n="toolInterfaces.comparePdfs.viewModeOverlay">Overlay</button>
                    <button id="view-mode-side" class="btn px-3 py-1 rounded text-sm font-semibold" data-i18n="toolInterfaces.comparePdfs.viewModeSideBySide">Side-by-Side</button>
                </div>
                <div class="border-l border-gray-600 h-6 mx-2"></div>
                <div id="overlay-controls" class="flex items-center gap-2">
                    <button id="flicker-btn" class="btn bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md text-sm font-semibold" data-i18n="toolInterfaces.comparePdfs.flickerBtn">Flicker</button>
                    <label for="opacity-slider" class="text-sm font-medium text-gray-300" data-i18n="toolInterfaces.comparePdfs.opacityLabel">Opacity:</label>
                    <input type="range" id="opacity-slider" min="0" max="1" step="0.05" value="0.5" class="w-24">
                </div>
                <div id="side-by-side-controls" class="hidden flex items-center gap-2">
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer">
                        <input type="checkbox" id="sync-scroll-toggle" checked class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                        <span data-i18n="toolInterfaces.comparePdfs.syncScrollLabel">Sync Scrolling</span>
                    </label>
                </div>
            </div>
            <div id="compare-viewer-wrapper" class="compare-viewer-wrapper overlay-mode">
                <div id="panel-1" class="pdf-panel"><canvas id="canvas-compare-1"></canvas></div>
                <div id="panel-2" class="pdf-panel"><canvas id="canvas-compare-2"></canvas></div>
            </div>
        </div>
    `,

  'ocr-pdf': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.ocrPdf.heading">OCR PDF</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.ocrPdf.description">Convert scanned PDFs into searchable documents. Select one or more languages present in your file for the best results.</p>
    
    <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-6">
        <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.ocrPdf.howItWorksHeading">How it works:</strong></p>
        <ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-1">
            <li data-i18n="toolInterfaces.ocrPdf.howItWorksExtract">Extract Text: Uses Tesseract OCR to recognize text from scanned images or PDFs.</li>
            <li data-i18n="toolInterfaces.ocrPdf.howItWorksSearchable">Searchable Output: Creates a new PDF with an invisible text layer, making your document fully searchable while preserving the original appearance.</li>
            <li data-i18n="toolInterfaces.ocrPdf.howItWorksFiltering">Character Filtering: Use whitelists to filter out unwanted characters and improve accuracy for specific document types (invoices, forms, etc.).</li>
            <li data-i18n="toolInterfaces.ocrPdf.howItWorksMultiLang">Multi-language Support: Select multiple languages for documents containing mixed language content.</li>
        </ul>
    </div>
    
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>
    
    <div id="ocr-options" class="hidden mt-6 space-y-4">
        <div>
            <label class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.ocrPdf.languagesLabel">Languages in Document</label>
            <div class="relative">
                <input type="text" id="lang-search" class="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2.5 mb-2" data-i18n-placeholder="toolInterfaces.ocrPdf.searchPlaceholder" placeholder="Search for languages...">
                <div id="lang-list" class="max-h-48 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-gray-900">
                    ${Object.entries(tesseractLanguages)
                      .map(
                        ([code, name]) => `
                        <label class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                            <input type="checkbox" value="${code}" class="lang-checkbox w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                            ${name}
                        </label>
                    `
                      )
                      .join('')}
                </div>
            </div>
             <p class="text-xs text-gray-500 mt-1"><span data-i18n="toolInterfaces.ocrPdf.selectedLabel">Selected:</span> <span id="selected-langs-display" class="font-semibold" data-i18n="toolInterfaces.ocrPdf.selectedNone">None</span></p>
        </div>
        
        <!-- Advanced settings section -->
        <details class="bg-gray-900 border border-gray-700 rounded-lg p-3">
            <summary class="text-sm font-medium text-gray-300 cursor-pointer flex items-center justify-between">
                <span data-i18n="toolInterfaces.ocrPdf.advancedSettings">Advanced Settings (Recommended to improve accuracy)</span>
                <i data-lucide="chevron-down" class="w-4 h-4 transition-transform details-icon"></i>
            </summary>
            <div class="mt-4 space-y-4">
                <!-- Resolution Setting -->
                <div>
                    <label for="ocr-resolution" class="block mb-1 text-xs font-medium text-gray-400" data-i18n="toolInterfaces.ocrPdf.resolutionLabel">Resolution</label>
                    <select id="ocr-resolution" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm">
                        <option value="2.0" data-i18n="toolInterfaces.ocrPdf.resolutionStandard">Standard (192 DPI)</option>
                        <option value="3.0" selected data-i18n="toolInterfaces.ocrPdf.resolutionHigh">High (288 DPI)</option>
                        <option value="4.0" data-i18n="toolInterfaces.ocrPdf.resolutionUltra">Ultra (384 DPI)</option>
                    </select>
                </div>
                <!-- Binarization Toggle -->
                <label class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" id="ocr-binarize" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600">
                    <span data-i18n="toolInterfaces.ocrPdf.binarizeLabel">Binarize Image (Enhance Contrast for Clean Scans)</span>
                </label>
                
                <!-- Character Whitelist Presets -->
                <div>
                    <label for="whitelist-preset" class="block mb-1 text-xs font-medium text-gray-400" data-i18n="toolInterfaces.ocrPdf.whitelistPresetLabel">Character Whitelist Preset</label>
                    <select id="whitelist-preset" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm mb-2">
                        <option value="" data-i18n="toolInterfaces.ocrPdf.presetNone">None (All characters)</option>
                        <option value="alphanumeric" data-i18n="toolInterfaces.ocrPdf.presetAlphanumeric">Alphanumeric + Basic Punctuation</option>
                        <option value="numbers-currency" data-i18n="toolInterfaces.ocrPdf.presetNumbersCurrency">Numbers + Currency Symbols</option>
                        <option value="letters-only" data-i18n="toolInterfaces.ocrPdf.presetLettersOnly">Letters Only (A-Z, a-z)</option>
                        <option value="numbers-only" data-i18n="toolInterfaces.ocrPdf.presetNumbersOnly">Numbers Only (0-9)</option>
                        <option value="invoice" data-i18n="toolInterfaces.ocrPdf.presetInvoice">Invoice/Receipt (Numbers, $, ., -, /)</option>
                        <option value="forms" data-i18n="toolInterfaces.ocrPdf.presetForms">Forms (Alphanumeric + Common Symbols)</option>
                        <option value="custom" data-i18n="toolInterfaces.ocrPdf.presetCustom">Custom...</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1" data-i18n="toolInterfaces.ocrPdf.whitelistHint">Only these characters will be recognized. Leave empty for all characters.</p>
                </div>
                
                <!-- Character Whitelist Input -->
                <div>
                    <label for="ocr-whitelist" class="block mb-1 text-xs font-medium text-gray-400" data-i18n="toolInterfaces.ocrPdf.whitelistLabel">Character Whitelist (Optional)</label>
                    <input type="text" id="ocr-whitelist" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm" data-i18n-placeholder="toolInterfaces.ocrPdf.whitelistPlaceholder" placeholder="e.g., abcdefghijklmnopqrstuvwxyz0123456789$.,">
                    <p class="text-xs text-gray-500 mt-1" data-i18n="toolInterfaces.ocrPdf.whitelistHelp">Only these characters will be recognized. Leave empty for all characters.</p>
                </div>
            </div>
        </details>
        
        <button id="process-btn" class="btn-gradient w-full disabled:opacity-50" disabled data-i18n="toolInterfaces.ocrPdf.processBtn">Start OCR</button>
    </div>

    <div id="ocr-progress" class="hidden mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
        <p id="progress-status" class="text-white mb-2" data-i18n="toolInterfaces.ocrPdf.initializing">Initializing...</p>
        <div class="w-full bg-gray-700 rounded-full h-4">
            <div id="progress-bar" class="bg-indigo-600 h-4 rounded-full transition-width duration-300" style="width: 0%"></div>
        </div>
        <pre id="progress-log" class="mt-4 text-xs text-gray-400 max-h-32 overflow-y-auto bg-black p-2 rounded-md"></pre>
    </div>

    <div id="ocr-results" class="hidden mt-6">
        <h3 class="text-xl font-bold text-white mb-2" data-i18n="toolInterfaces.ocrPdf.ocrComplete">OCR Complete</h3>
        <p class="mb-4 text-gray-400" data-i18n="toolInterfaces.ocrPdf.resultsDesc">Your searchable PDF is ready. You can also copy or download the extracted text below.</p>
        <div class="relative">
            <textarea id="ocr-text-output" rows="10" class="w-full bg-gray-900 border border-gray-600 text-gray-300 rounded-lg p-2.5 font-sans" readonly></textarea>
            <button id="copy-text-btn" class="absolute top-2 right-2 btn bg-gray-700 hover:bg-gray-600 p-2 rounded-md" data-i18n-title="toolInterfaces.ocrPdf.copyToClipboard" title="Copy to Clipboard">
                <i data-lucide="clipboard-copy" class="w-4 h-4 text-gray-300"></i>
            </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <button id="download-txt-btn" class="btn w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600" data-i18n="toolInterfaces.ocrPdf.downloadTxt">Download as .txt</button>
            <button id="download-searchable-pdf" class="btn w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700" data-i18n="toolInterfaces.ocrPdf.downloadSearchablePdf">Download Searchable PDF</button>
        </div>
    </div>
`,

  'word-to-pdf': () => `
        <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.wordToPdf.heading">Word to PDF Converter</h2>
        <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.wordToPdf.description">Upload a .docx file to convert it into a high-quality PDF with selectable text. Complex layouts may not be perfectly preserved.</p>
        
        <div id="file-input-wrapper">
             <div class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <i data-lucide="file-text" class="w-10 h-10 mb-3 text-gray-400"></i>
                    <p class="mb-2 text-sm text-gray-400"><span class="font-semibold" data-i18n="toolInterfaces.wordToPdf.uploadPrompt">Click to select a file</span> <span data-i18n="toolInterfaces.wordToPdf.uploadOr">or drag and drop</span></p>
                    <p class="text-xs text-gray-500" data-i18n="toolInterfaces.wordToPdf.fileType">A single .docx file</p>
                </div>
                <input id="file-input" type="file" class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
            </div>
        </div>
        
        <div id="file-display-area" class="mt-4 space-y-2"></div>
        <button id="process-btn" class="btn-gradient w-full mt-6" disabled>Preview & Convert</button>
    `,

  'sign-pdf': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.signPdf.heading">Sign PDF</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.signPdf.description">Create your signature, select it, then click on the document to place. You can drag to move placed signatures.</p>
    ${createFileInputHTML()}
    
    <div id="signature-editor" class="hidden mt-6">
        <div class="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-4">
            <div class="flex border-b border-gray-700 mb-4">
                <button id="draw-tab-btn" class="flex-1 p-2 text-sm font-semibold border-b-2 border-indigo-500 text-white" data-i18n="toolInterfaces.signPdf.drawTab">Draw</button>
                <button id="type-tab-btn" class="flex-1 p-2 text-sm font-semibold border-b-2 border-transparent text-gray-400" data-i18n="toolInterfaces.signPdf.typeTab">Type</button>
                <button id="upload-tab-btn" class="flex-1 p-2 text-sm font-semibold border-b-2 border-transparent text-gray-400" data-i18n="toolInterfaces.signPdf.uploadTab">Upload</button>
            </div>
            
            <div id="draw-panel">
                <canvas id="signature-draw-canvas" class="bg-white rounded-md cursor-crosshair w-full" height="150"></canvas>
                
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-4 sm:gap-2">
                    <div class="flex items-center gap-2">
                        <label for="signature-color" class="text-sm font-medium text-gray-300" data-i18n="toolInterfaces.signPdf.colorLabel">Color:</label>
                        <input type="color" id="signature-color" value="#22c55e" class="w-10 h-10 bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="clear-draw-btn" class="btn hover:bg-gray-600 text-sm flex-grow sm:flex-grow-0" data-i18n="toolInterfaces.signPdf.clearBtn">Clear</button>
                        <button id="save-draw-btn" class="btn-gradient px-4 py-2 text-sm rounded-lg flex-grow sm:flex-grow-0" data-i18n="toolInterfaces.signPdf.saveSignatureBtn">Save Signature</button>
                    </div>
                </div>
            </div>

            <div id="type-panel" class="hidden">
                <input type="text" id="signature-text-input" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 mb-4" data-i18n-placeholder="toolInterfaces.signPdf.typePlaceholder" placeholder="Type your name here">
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label for="font-family-select" class="block mb-1 text-xs font-medium text-gray-400" data-i18n="toolInterfaces.signPdf.fontStyleLabel">Font Style</label>
                        <select id="font-family-select" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm">
                            <option value="'Great Vibes', cursive" data-i18n="toolInterfaces.signPdf.fontSignature">Signature</option>
                            <option value="'Kalam', cursive" data-i18n="toolInterfaces.signPdf.fontHandwritten">Handwritten</option>
                            <option value="'Dancing Script', cursive" data-i18n="toolInterfaces.signPdf.fontScript">Script</option>
                            <option value="'Lato', sans-serif" data-i18n="toolInterfaces.signPdf.fontRegular">Regular</option>
                            <option value="'Merriweather', serif" data-i18n="toolInterfaces.signPdf.fontFormal">Formal</option>
                        </select>
                    </div>
                     <div>
                        <label for="font-size-slider" class="block mb-1 text-xs font-medium text-gray-400"><span data-i18n="toolInterfaces.signPdf.fontSizeLabel">Font Size</span> (<span id="font-size-value">48</span>px)</label>
                        <input type="range" id="font-size-slider" min="24" max="72" value="32" class="w-full">
                    </div>
                    <div>
                        <label for="font-color-picker" class="block mb-1 text-xs font-medium text-gray-400" data-i18n="toolInterfaces.signPdf.fontColorLabel">Color</label>
                        <input type="color" id="font-color-picker" value="#22c55e" class="w-full h-[38px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer">
                    </div>
                </div>

                <div id="font-preview" class="p-4 h-[80px] bg-transparent rounded-md flex items-center justify-center text-4xl" style="font-family: 'Great Vibes', cursive; font-size: 32px; color: #22c55e;" data-i18n="toolInterfaces.signPdf.fontPreview">Your Name</div>
                 
                <div class="flex justify-end mt-4">
                    <button id="save-type-btn" class="btn-gradient px-4 py-2 text-sm rounded-lg" data-i18n="toolInterfaces.signPdf.saveSignatureBtn">Save Signature</button>
                </div>
            </div>

            <div id="upload-panel" class="hidden">
                <input type="file" id="signature-upload-input" accept="image/png" class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700">
                <span data-i18n="toolInterfaces.signPdf.uploadNote">*png files only</span>
            </div>
            
            <hr class="border-gray-700 my-4">
            <h4 class="text-md font-semibold text-white mb-2" data-i18n="toolInterfaces.signPdf.savedSignaturesHeading">Your Saved Signatures</h4>
            <div id="saved-signatures-container" class="flex flex-wrap gap-2 bg-gray-800 p-2 rounded-md min-h-[50px]">
                <p class="text-xs text-gray-500 text-center w-full" data-i18n="toolInterfaces.signPdf.savedSignaturesEmpty">Your saved signatures will appear here. Click one to select it.</p>
            </div>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-4 mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <button id="prev-page-sign" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><i data-lucide="chevron-left"></i></button>
            <span class="text-white font-medium"><span data-i18n="toolInterfaces.signPdf.pageDisplay">Page</span> <span id="current-page-display-sign">1</span> <span data-i18n="toolInterfaces.signPdf.of">of</span> <span id="total-pages-display-sign">1</span></span>
            <button id="next-page-sign" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><i data-lucide="chevron-right"></i></button>
            <div class="border-l border-gray-600 h-6 mx-2 hidden sm:block"></div>
            <button id="zoom-out-btn" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600"><i data-lucide="zoom-out"></i></button>
            <button id="fit-width-btn" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600"><i data-lucide="minimize"></i></button>
            <button id="zoom-in-btn" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600"><i data-lucide="zoom-in"></i></button>
            <div class="border-l border-gray-600 h-6 mx-2 hidden sm:block"></div>
            <button id="undo-btn" class="btn p-2 rounded-full" data-i18n-title="toolInterfaces.signPdf.undoBtn" title="Undo Last Placement"><i data-lucide="undo-2"></i></button>
        </div>

        <div id="canvas-container-sign" class="relative w-full overflow-auto bg-gray-900 rounded-lg border border-gray-600 h-[60vh] md:h-[80vh]">
            <canvas id="canvas-sign" class="mx-auto"></canvas>
        </div>

    </div>
    <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.signPdf.processBtn">Apply Signatures & Download PDF</button>
`,

  'remove-annotations': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.removeAnnotations.heading">Remove Annotations</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.removeAnnotations.description">Select the types of annotations to remove from all pages or a specific range.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>

    <div id="remove-annotations-options" class="hidden mt-6 space-y-6">
        <div>
            <h3 class="text-lg font-semibold text-white mb-2" data-i18n="toolInterfaces.removeAnnotations.step1">1. Choose Pages</h3>
            <div class="flex gap-4 p-2 rounded-lg bg-gray-900">
                <label class="flex-1 flex items-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer">
                    <input type="radio" name="page-scope" value="all" checked class="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                    <span class="font-semibold text-white" data-i18n="toolInterfaces.removeAnnotations.allPages">All Pages</span>
                </label>
                <label class="flex-1 flex items-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer">
                    <input type="radio" name="page-scope" value="specific" class="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                    <span class="font-semibold text-white" data-i18n="toolInterfaces.removeAnnotations.specificPages">Specific Pages</span>
                </label>
            </div>
            <div id="page-range-wrapper" class="hidden mt-2">
                 <input type="text" id="page-range-input" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.removeAnnotations.pageRangePlaceholder" placeholder="e.g., 1-3, 5, 8">
                 <p class="text-xs text-gray-400 mt-1"><span data-i18n="toolInterfaces.removeAnnotations.totalPages">Total Pages:</span> <span id="total-pages"></span></p>
            </div>
        </div>

        <div>
            <h3 class="text-lg font-semibold text-white mb-2" data-i18n="toolInterfaces.removeAnnotations.step2">2. Select Annotation Types to Remove</h3>
            <div class="space-y-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div class="border-b border-gray-700 pb-2">
                    <label class="flex items-center gap-2 font-semibold text-white cursor-pointer">
                        <input type="checkbox" id="select-all-annotations" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600">
                        <span data-i18n="toolInterfaces.removeAnnotations.selectAll">Select / Deselect All</span>
                    </label>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-2">
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Highlight"> <span data-i18n="toolInterfaces.removeAnnotations.typeHighlight">Highlight</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="StrikeOut"> <span data-i18n="toolInterfaces.removeAnnotations.typeStrikeout">Strikeout</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Underline"> <span data-i18n="toolInterfaces.removeAnnotations.typeUnderline">Underline</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Ink"> <span data-i18n="toolInterfaces.removeAnnotations.typeInk">Ink / Draw</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Polygon"> <span data-i18n="toolInterfaces.removeAnnotations.typePolygon">Polygon</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Square"> <span data-i18n="toolInterfaces.removeAnnotations.typeSquare">Square</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Circle"> <span data-i18n="toolInterfaces.removeAnnotations.typeCircle">Circle</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Line"> <span data-i18n="toolInterfaces.removeAnnotations.typeLine">Line / Arrow</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="PolyLine"> <span data-i18n="toolInterfaces.removeAnnotations.typePolyline">Polyline</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Link"> <span data-i18n="toolInterfaces.removeAnnotations.typeLink">Link</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Text"> <span data-i18n="toolInterfaces.removeAnnotations.typeText">Text (Note)</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="FreeText"> <span data-i18n="toolInterfaces.removeAnnotations.typeFreeText">Free Text</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Popup"> <span data-i18n="toolInterfaces.removeAnnotations.typePopup">Popup / Comment</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Squiggly"> <span data-i18n="toolInterfaces.removeAnnotations.typeSquiggly">Squiggly</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Stamp"> <span data-i18n="toolInterfaces.removeAnnotations.typeStamp">Stamp</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="Caret"> <span data-i18n="toolInterfaces.removeAnnotations.typeCaret">Caret</span></label>
                    <label class="flex items-center gap-2"><input type="checkbox" class="annot-checkbox" value="FileAttachment"> <span data-i18n="toolInterfaces.removeAnnotations.typeFileAttachment">File Attachment</span></label>    
                </div>
            </div>
        </div>
    </div>
    <button id="process-btn" class="hidden btn-gradient w-full mt-6" data-i18n="toolInterfaces.removeAnnotations.processBtn">Remove Selected Annotations</button>
`,

  cropper: () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.cropper.heading">PDF Cropper</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.cropper.description">Upload a PDF to visually crop one or more pages. This tool offers a live preview and two distinct cropping modes.</p>
    
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>
    
    <div id="cropper-ui-container" class="hidden mt-6">
        
        <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-6">
            <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.cropper.howItWorksHeading">How it works:</strong></p>
            <ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-1">
                <li data-i18n="toolInterfaces.cropper.livePreview">Live Preview: See your crop selection in real-time before you apply it.</li>
                <li data-i18n="toolInterfaces.cropper.nonDestructive">Non-Destructive Mode: This is the default mode. It simply "hides" the cropped content by adjusting the page's boundaries. The original text and data are preserved in the file.</li>
                <li data-i18n="toolInterfaces.cropper.destructive">Destructive Mode: This option permanently removes the cropped content by flattening the PDF. Use this for maximum security and smaller file size, but note that it will remove selectable text.</li>
            </ul>
        </div>
        
        <div class="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-4 mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div class="flex items-center gap-2">
                 <button id="prev-page" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
                <span id="page-info" class="text-white font-medium" data-i18n="toolInterfaces.cropper.pageInfo">Page 0 of 0</span>
                <button id="next-page" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
                 <label class="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <input type="checkbox" id="destructive-crop-toggle" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                    <span data-i18n="toolInterfaces.cropper.enableDestructive">Enable Destructive Crop</span>
                </label>
                 <label class="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <input type="checkbox" id="apply-to-all-toggle" class="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                    <span data-i18n="toolInterfaces.cropper.applyToAll">Apply to all pages</span>
                </label>
            </div>
        </div>
        
        <div id="status" class="text-center italic text-gray-400 mb-4" data-i18n="toolInterfaces.cropper.pleaseSelect">Please select a PDF file to begin.</div>
        <div id="cropper-container" class="w-full relative overflow-hidden flex items-center justify-center bg-gray-900 rounded-lg border border-gray-600 min-h-[500px]"></div>
        
        <button id="crop-button" class="btn-gradient w-full mt-6" disabled data-i18n="toolInterfaces.cropper.processBtn">Crop & Download</button>
    </div>
`,

  'form-filler': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.formFiller.heading">PDF Form Filler</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.formFiller.description">Upload a PDF to fill in existing form fields. The PDF view on the right will update as you type.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>
    <div id="form-filler-options" class="hidden mt-6">
        <div class="flex flex-col lg:flex-row gap-4 h-[80vh]">
            
            <!-- Sidebar for form fields -->
            <div class="w-full lg:w-1/3 bg-gray-900 rounded-lg p-4 overflow-y-auto border border-gray-700 flex-shrink-0">
                <div id="form-fields-container" class="space-y-4">
                    <div class="p-4 text-center text-gray-400">
                        <p data-i18n="toolInterfaces.formFiller.noFieldsText">Upload a file to see form fields here.</p>
                    </div>
                </div>
            </div>

            <!-- PDF Viewer -->
            <div class="w-full lg:w-2/3 flex flex-col items-center gap-4">
                <div class="flex flex-nowrap items-center justify-center gap-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <button id="prev-page" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
                        <i data-lucide="chevron-left" class="w-5 h-5"></i>
                    </button>
                    <span class="text-white font-medium">
                        <span data-i18n="toolInterfaces.formFiller.pageDisplay">Page</span> <span id="current-page-display">1</span> <span data-i18n="toolInterfaces.formFiller.of">of</span> <span id="total-pages-display">1</span>
                    </span>
                    <button id="next-page" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                    </button>
                    <button id="zoom-out-btn" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                        <i data-lucide="zoom-out"></i>
                    </button>
                    <button id="zoom-in-btn" class="btn p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                        <i data-lucide="zoom-in"></i>
                    </button>
                </div>

                <div id="pdf-viewer-container" class="relative w-full overflow-auto bg-gray-900 rounded-lg border border-gray-600 flex-grow">
                    <canvas id="pdf-canvas" class="mx-auto max-w-full h-full"></canvas>
                </div>
            </div>
        </div>
        
        <button id="process-btn" class="btn-gradient w-full mt-6 hidden" data-i18n="toolInterfaces.formFiller.processBtn">Save & Download</button>
    </div>
`,

  posterize: () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.posterize.heading">Posterize PDF</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.posterize.description">Split pages into multiple smaller sheets to print as a poster. Navigate the preview and see the grid update based on your settings.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>

    <div id="posterize-options" class="hidden mt-6 space-y-6">

        <div class="space-y-2">
             <label class="block text-sm font-medium text-gray-300"><span data-i18n="toolInterfaces.posterize.pagePreviewLabel">Page Preview</span> (<span id="current-preview-page">1</span> / <span id="total-preview-pages">1</span>)</label>
            <div id="posterize-preview-container" class="relative w-full max-w-xl mx-auto bg-gray-900 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                <button id="prev-preview-page" class="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-gray-700 disabled:opacity-50 z-10"><i data-lucide="chevron-left"></i></button>
                <canvas id="posterize-preview-canvas" class="w-full h-auto rounded-md"></canvas>
                <button id="next-preview-page" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-gray-700 disabled:opacity-50 z-10"><i data-lucide="chevron-right"></i></button>
            </div>
        </div>

        <div class="p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-3" data-i18n="toolInterfaces.posterize.gridLayoutTitle">Grid Layout</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="posterize-rows" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.posterize.rowsLabel">Rows</label>
                    <input type="number" id="posterize-rows" value="1" min="1" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                </div>
                <div>
                    <label for="posterize-cols" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.posterize.columnsLabel">Columns</label>
                    <input type="number" id="posterize-cols" value="2" min="1" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                </div>
            </div>
        </div>

        <div class="p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-3" data-i18n="toolInterfaces.posterize.outputPageSettingsTitle">Output Page Settings</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="output-page-size" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.posterize.pageSizeLabel">Page Size</label>
                    <select id="output-page-size" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                        <option value="A4" selected>A4</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                        <option value="A3">A3</option>
                        <option value="A5">A5</option>
                    </select>
                </div>
                <div>
                    <label for="output-orientation" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.posterize.orientationLabel">Orientation</label>
                    <select id="output-orientation" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                        <option value="auto" selected data-i18n="toolInterfaces.posterize.orientationAuto">Automatic (Recommended)</option>
                        <option value="portrait" data-i18n="toolInterfaces.posterize.orientationPortrait">Portrait</option>
                        <option value="landscape" data-i18n="toolInterfaces.posterize.orientationLandscape">Landscape</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <h3 class="text-lg font-semibold text-white mb-3" data-i18n="toolInterfaces.posterize.advancedOptionsTitle">Advanced Options</h3>
            <div class="space-y-4">
                <div>
                    <label class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.posterize.contentScalingLabel">Content Scaling</label>
                    <div class="flex gap-4 p-2 rounded-lg bg-gray-800">
                        <label class="flex-1 flex items-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer has-[:checked]:bg-indigo-600">
                            <input type="radio" name="scaling-mode" value="fit" checked class="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                            <div>
                                <span class="font-semibold text-white" data-i18n="toolInterfaces.posterize.scalingFit">Fit</span>
                                <p class="text-xs text-gray-400" data-i18n="toolInterfaces.posterize.scalingFitDesc">Preserves all content, may add margins.</p>
                            </div>
                        </label>
                        <label class="flex-1 flex items-center gap-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer has-[:checked]:bg-indigo-600">
                            <input type="radio" name="scaling-mode" value="fill" class="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500">
                             <div>
                                <span class="font-semibold text-white" data-i18n="toolInterfaces.posterize.scalingFill">Fill (Crop)</span>
                                <p class="text-xs text-gray-400" data-i18n="toolInterfaces.posterize.scalingFillDesc">Fills the page, may crop content.</p>
                            </div>
                        </label>
                    </div>
                </div>
                 <div>
                    <label for="overlap" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.posterize.overlapLabel">Overlap (for assembly)</label>
                    <div class="flex items-center gap-2">
                        <input type="number" id="overlap" value="0" min="0" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                        <select id="overlap-units" class="bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5">
                            <option value="pt" data-i18n="toolInterfaces.posterize.overlapPoints">Points</option>
                            <option value="in" data-i18n="toolInterfaces.posterize.overlapInches">Inches</option>
                            <option value="mm" data-i18n="toolInterfaces.posterize.overlapMm">mm</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label for="page-range" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.posterize.pageRangeLabel">Page Range (optional)</label>
                    <input type="text" id="page-range" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.posterize.pageRangePlaceholder" placeholder="e.g., 1-3, 5">
                    <p class="text-xs text-gray-400 mt-1"><span data-i18n="toolInterfaces.posterize.totalPages">Total pages:</span> <span id="total-pages">0</span></p>
                </div>
            </div>
        </div>

        <button id="process-btn" class="btn-gradient w-full mt-6" disabled data-i18n="toolInterfaces.posterize.processBtn">Posterize PDF</button>
    </div>
`,

  'remove-blank-pages': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.removeBlankPages.heading">Remove Blank Pages</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.removeBlankPages.description">Automatically detect and remove blank or nearly blank pages from your PDF. Adjust the sensitivity to control what is considered "blank".</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>

    <div id="remove-blank-options" class="hidden mt-6 space-y-4">
        <div>
            <label for="sensitivity-slider" class="block mb-2 text-sm font-medium text-gray-300">
                <span data-i18n="toolInterfaces.removeBlankPages.sensitivityLabel">Sensitivity</span> (<span id="sensitivity-value">99</span>%)
            </label>
            <input type="range" id="sensitivity-slider" min="80" max="100" value="99" class="w-full">
            <p class="text-xs text-gray-400 mt-1" data-i18n="toolInterfaces.removeBlankPages.sensitivityHelp">Higher sensitivity requires pages to be more "blank" to be removed.</p>
        </div>
        
        <div id="analysis-preview" class="hidden p-4 bg-gray-900 border border-gray-700 rounded-lg">
             <h3 class="text-lg font-semibold text-white mb-2" data-i18n="toolInterfaces.removeBlankPages.analysisHeading">Analysis Results</h3>
             <p id="analysis-text" class="text-gray-300"></p>
             <div id="removed-pages-thumbnails" class="mt-4 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2"></div>
        </div>

        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.removeBlankPages.processBtn">Remove Blank Pages & Download</button>
    </div>
`,

  'alternate-merge': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.alternateMerge.heading">Alternate & Mix Pages</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.alternateMerge.description">Combine pages from 2 or more documents, alternating between them. Drag the files to set the mixing order (e.g., Page 1 from Doc A, Page 1 from Doc B, Page 2 from Doc A, Page 2 from Doc B, etc.).</p>
    ${createFileInputHTML({ multiple: true, accept: 'application/pdf', showControls: true })}
    
    <div id="alternate-merge-options" class="hidden mt-6">
        <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-3">
            <p class="text-sm text-gray-300"><strong class="text-white" data-i18n="toolInterfaces.alternateMerge.howItWorksHeading">How it works:</strong></p>
            <ul class="list-disc list-inside text-xs text-gray-400 mt-1 space-y-1">
                <li data-i18n="toolInterfaces.alternateMerge.howItWorksItem1">The tool will take one page from each document in the order you specify below, then repeat for the next page until all pages are used.</li>
                <li data-i18n="toolInterfaces.alternateMerge.howItWorksItem2">If a document runs out of pages, it will be skipped, and the tool will continue alternating with the remaining documents.</li>
            </ul>
        </div>
        <ul id="alternate-file-list" class="space-y-2"></ul>
        <button id="process-btn" class="btn-gradient w-full mt-6" disabled data-i18n="toolInterfaces.alternateMerge.processBtn">Alternate & Mix PDFs</button>
    </div>
`,

  linearize: () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.linearize.heading">Linearize PDFs (Fast Web View)</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.linearize.description">Optimize multiple PDFs for faster loading over the web. Files will be downloaded in a ZIP archive.</p>
    ${createFileInputHTML({ multiple: true, accept: 'application/pdf', showControls: true })} 
    <div id="file-display-area" class="mt-4 space-y-2"></div>
    <button id="process-btn" class="hidden btn-gradient w-full mt-6" disabled data-i18n="toolInterfaces.linearize.processBtn">Linearize PDFs & Download ZIP</button> 
  `,
  'add-attachments': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.addAttachments.heading">Add Attachments to PDF</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.addAttachments.description">First, upload the PDF document you want to add files to.</p>
    ${createFileInputHTML({ accept: 'application/pdf' })}
    <div id="file-display-area" class="mt-4 space-y-2"></div>

    <div id="attachment-options" class="hidden mt-8">
      <h3 class="text-lg font-semibold text-white mb-3" data-i18n="toolInterfaces.addAttachments.uploadHeading">Upload Files to Attach</h3>
      <p class="mb-4 text-gray-400" data-i18n="toolInterfaces.addAttachments.uploadDescription">Select one or more files to embed within the PDF. You can attach any file type (images, documents, spreadsheets, etc.).</p>
      
      <label for="attachment-files-input" class="w-full flex justify-center items-center px-6 py-10 bg-gray-900 text-gray-400 rounded-lg border-2 border-dashed border-gray-600 hover:bg-gray-800 hover:border-gray-500 cursor-pointer transition-colors">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span class="mt-2 block text-sm font-medium" data-i18n="toolInterfaces.addAttachments.uploadLabel">Click to upload files</span>
          <span class="mt-1 block text-xs" data-i18n="toolInterfaces.addAttachments.uploadHelpText">Any file type, multiple files allowed</span>
        </div>
        <input id="attachment-files-input" name="attachment-files" type="file" class="sr-only" multiple>
      </label>

      <div id="attachment-file-list" class="mt-4 space-y-2"></div>

      <button id="process-btn" class="hidden btn-gradient w-full mt-6" disabled data-i18n="toolInterfaces.addAttachments.processBtn">Embed Files & Download</button>
    </div>
  `,

  'sanitize-pdf': () => `
    <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.sanitizePdf.heading">Sanitize PDF</h2>
    <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.sanitizePdf.description">Remove potentially sensitive or unnecessary information from your PDF before sharing. Select the items you want to remove.</p>
    ${createFileInputHTML()}
    <div id="file-display-area" class="mt-4 space-y-2"></div>

    <div id="sanitize-pdf-options" class="hidden mt-6 space-y-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
        <h3 class="text-lg font-semibold text-white mb-3" data-i18n="toolInterfaces.sanitizePdf.optionsHeading">Sanitization Options</h3>
    <div>
            <span data-i18n="toolInterfaces.sanitizePdf.warningNote">Note: Removing Embedded Fonts may break text rendering! Text may not display correctly or at all. Only use if you're sure the PDF viewer has substitute fonts.</span>
    </div>
        <div class="mb-4">
            <h4 class="text-sm font-semibold text-gray-400 mb-2" data-i18n="toolInterfaces.sanitizePdf.securityHeading">Essential Security</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="flatten-forms" name="sanitizeOption" value="flatten-forms" checked class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.flattenForms">Flatten Form Fields</span>
                </label>
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-metadata" name="sanitizeOption" value="metadata" checked class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.removeMetadata">Remove All Metadata</span>
                </label>
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-annotations" name="sanitizeOption" value="annotations" checked class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.removeAnnotations">Remove Annotations</span>
                </label>
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-javascript" name="sanitizeOption" value="javascript" checked class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.removeJavascript">Remove JavaScript</span>
                </label>
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-embedded-files" name="sanitizeOption" value="embeddedFiles" checked class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.removeEmbeddedFiles">Remove Embedded Files</span>
                </label>
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-layers" name="sanitizeOption" value="layers" checked class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.removeLayers">Remove Layers (OCG)</span>
                </label>
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-links" name="sanitizeOption" value="links" checked class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.removeLinks">Remove External Links</span>
                </label>
            </div>
        </div>

        <div>
            <h4 class="text-sm font-semibold text-gray-400 mb-2" data-i18n="toolInterfaces.sanitizePdf.additionalHeading">Additional Options</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-structure-tree" name="sanitizeOption" value="structure" class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.removeStructure">Remove Structure Tree</span>
                </label>
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-markinfo" name="sanitizeOption" value="markinfo" class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white" data-i18n="toolInterfaces.sanitizePdf.removeMarkinfo">Remove Tagging Info</span>
                </label>
                <label class="flex items-center space-x-2 p-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input type="checkbox" id="remove-fonts" name="sanitizeOption" value="fonts" class="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500">
                    <span class="text-white text-sm" data-i18n="toolInterfaces.sanitizePdf.removeFonts">Remove Embedded Fonts</span>
                </label>
            </div>
        </div>

        <button id="process-btn" class="btn-gradient w-full mt-6" data-i18n="toolInterfaces.sanitizePdf.processBtn">Sanitize PDF & Download</button>
    </div>
`,

  'remove-restrictions': () => `
  <h2 class="text-2xl font-bold text-white mb-4" data-i18n="toolInterfaces.removeRestrictions.heading">Remove PDF Restrictions</h2>
  <p class="mb-6 text-gray-400" data-i18n="toolInterfaces.removeRestrictions.description">Remove security restrictions and unlock PDF permissions for editing and printing.</p>
  ${createFileInputHTML()}
  <div id="file-display-area" class="mt-4 space-y-2"></div>
  <div id="remove-restrictions-options" class="hidden space-y-4 mt-6">
        <div class="p-4 bg-blue-900/20 border border-blue-500/30 text-blue-200 rounded-lg">
          <h3 class="font-semibold text-base mb-2" data-i18n="toolInterfaces.removeRestrictions.howItWorksHeading">How It Works</h3>
          <p class="text-sm text-gray-300 mb-2" data-i18n="toolInterfaces.removeRestrictions.howItWorksText">This operation will:</p>
          <ul class="text-sm text-gray-300 list-disc list-inside space-y-1 ml-2">
            <li data-i18n="toolInterfaces.removeRestrictions.howItWorksItem1">Remove all permission restrictions (printing, copying, editing)</li>
            <li data-i18n="toolInterfaces.removeRestrictions.howItWorksItem2">Remove encryption even if the file is encrypted</li>
            <li data-i18n="toolInterfaces.removeRestrictions.howItWorksItem3">Remove security restrictions associated with digitally signed PDF files (will make signature invalid)</li>
            <li data-i18n="toolInterfaces.removeRestrictions.howItWorksItem4">Create a fully editable, unrestricted PDF</li>
          </ul>
      </div>

      <div>
          <label for="owner-password-remove" class="block mb-2 text-sm font-medium text-gray-300" data-i18n="toolInterfaces.removeRestrictions.ownerPasswordLabel">Owner Password (if required)</label>
          <input type="password" id="owner-password-remove" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5" data-i18n-placeholder="toolInterfaces.removeRestrictions.ownerPasswordPlaceholder" placeholder="Leave empty if PDF has no password">
          <p class="text-xs text-gray-500 mt-1" data-i18n="toolInterfaces.removeRestrictions.ownerPasswordHelp">Enter the owner password if the PDF is password-protected</p>
      </div>

<div class="p-4 bg-red-900/20 border border-red-500/30 text-red-200 rounded-lg">
  <h3 class="font-semibold text-base mb-2">Notice</h3>
  <p class="text-sm text-gray-300 mb-2">This tool is intended for legitimate purposes only, such as:</p>
  <ul class="text-sm text-gray-300 list-disc list-inside space-y-1 ml-2">
    <li>Removing restrictions from PDFs you own or have permission to modify</li>
    <li>Recovering access to a PDF when you legitimately forgot the password</li>
    <li>Accessing content you legally purchased or created</li>
    <li>Editing documents for authorized business purposes</li>
    <li>Opening documents for legitimate archival, compliance, or recovery workflows</li>
    <li class="font-semibold">Limitations: this tool can only remove restrictions from weakly protected PDFs or PDFs that do not have an owner password set. It cannot remove or bypass properly applied AES‑256 (256‑bit) encryption.</li>
  </ul>
  <p class="text-sm text-gray-300 mt-3 font-semibold">
    Using this tool to bypass copyright protections, violate intellectual property rights, or access documents without authorization may be illegal in your jurisdiction. We are not liable for any misuse of this tool — if you're unsure, consult legal counsel or the document owner before proceeding.
  </p>
</div>
      <button id="process-btn" class="btn-gradient w-full mt-6">Remove Restrictions & Download</button>
  </div>
`,
};
