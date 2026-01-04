import { formatBytes, readFileAsArrayBuffer, getPDFDocument } from '../utils/helpers'
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js'
import { createIcons, icons } from 'lucide'

let selectedFile: File | null = null
let viewerIframe: HTMLIFrameElement | null = null
let viewerReady = false
let currentBlobUrl: string | null = null

const pdfInput = document.getElementById('pdfFile') as HTMLInputElement
const fileListDiv = document.getElementById('fileList') as HTMLDivElement
const viewerContainer = document.getElementById('stamp-viewer-container') as HTMLDivElement
const viewerCard = document.getElementById('viewer-card') as HTMLDivElement | null
const saveStampedBtn = document.getElementById('save-stamped-btn') as HTMLButtonElement
const backToToolsBtn = document.getElementById('back-to-tools') as HTMLButtonElement | null
const toolUploader = document.getElementById('tool-uploader') as HTMLDivElement | null
const usernameInput = document.getElementById('stamp-username') as HTMLInputElement | null

function resetState() {
  selectedFile = null
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
  if (viewerIframe && viewerContainer && viewerIframe.parentElement === viewerContainer) {
    viewerContainer.removeChild(viewerIframe)
  }
  viewerIframe = null
  viewerReady = false
  if (viewerCard) viewerCard.classList.add('hidden')
  if (saveStampedBtn) saveStampedBtn.classList.add('hidden')

  if (viewerContainer) {
    viewerContainer.style.height = ''
    viewerContainer.style.aspectRatio = ''
  }

  const isFullWidth = localStorage.getItem('fullWidthMode') !== 'false'
  if (toolUploader && !isFullWidth) {
    toolUploader.classList.remove('max-w-6xl')
    toolUploader.classList.add('max-w-2xl')
  }

  updateFileList()
  if (pdfInput) pdfInput.value = ''
}

function updateFileList() {
  if (!selectedFile) {
    fileListDiv.classList.add('hidden')
    fileListDiv.innerHTML = ''
    return
  }

  fileListDiv.classList.remove('hidden')
  fileListDiv.innerHTML = ''

  // Expand container width for viewer if NOT in full width mode (default to true if not set)
  const isFullWidth = localStorage.getItem('fullWidthMode') !== 'false'
  if (toolUploader && !isFullWidth) {
    toolUploader.classList.remove('max-w-2xl')
    toolUploader.classList.add('max-w-6xl')
  }

  const wrapper = document.createElement('div')
  wrapper.className = 'bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-indigo-500 transition-colors'

  const innerDiv = document.createElement('div')
  innerDiv.className = 'flex items-center justify-between'

  const infoDiv = document.createElement('div')
  infoDiv.className = 'flex-1 min-w-0'

  const nameSpan = document.createElement('p')
  nameSpan.className = 'truncate font-medium text-white'
  nameSpan.textContent = selectedFile.name

  const sizeSpan = document.createElement('p')
  sizeSpan.className = 'text-gray-400 text-sm'
  sizeSpan.textContent = formatBytes(selectedFile.size)

  infoDiv.append(nameSpan, sizeSpan)

  const deleteBtn = document.createElement('button')
  deleteBtn.className = 'text-red-400 hover:text-red-300 p-2 flex-shrink-0 ml-2'
  deleteBtn.title = 'Remove file'
  deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>'
  deleteBtn.onclick = (e) => {
    e.stopPropagation()
    resetState()
  }

  innerDiv.append(infoDiv, deleteBtn)
  wrapper.appendChild(innerDiv)
  fileListDiv.appendChild(wrapper)

  createIcons({ icons })
}

async function adjustViewerHeight(file: File) {
  if (!viewerContainer) return
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = getPDFDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1 })

    // Add ~50px for toolbar height relative to page height
    const aspectRatio = viewport.width / (viewport.height + 50)

    viewerContainer.style.height = 'auto'
    viewerContainer.style.aspectRatio = `${aspectRatio}`
  } catch (e) {
    console.error('Error adjusting viewer height:', e)
    // Fallback if calculation fails
    viewerContainer.style.height = '70vh'
  }
}

async function loadPdfInViewer(file: File) {
  if (!viewerContainer) return

  if (viewerCard) {
    viewerCard.classList.remove('hidden')
  }

  // Clear existing iframe and blob URL
  if (viewerIframe && viewerIframe.parentElement === viewerContainer) {
    viewerContainer.removeChild(viewerIframe)
  }
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
  viewerIframe = null
  viewerReady = false

  // Calculate and apply dynamic height
  await adjustViewerHeight(file)

  const arrayBuffer = await readFileAsArrayBuffer(file)
  const blob = new Blob([arrayBuffer as BlobPart], { type: 'application/pdf' })
  currentBlobUrl = URL.createObjectURL(blob)

  try {
    const existingPrefsRaw = localStorage.getItem('pdfjs.preferences')
    const existingPrefs = existingPrefsRaw ? JSON.parse(existingPrefsRaw) : {}
    delete (existingPrefs as any).annotationEditorMode
    const newPrefs = {
      ...existingPrefs,
      enablePermissions: false,
    }
    localStorage.setItem('pdfjs.preferences', JSON.stringify(newPrefs))
  } catch { }

  const iframe = document.createElement('iframe')
  iframe.className = 'w-full h-full border-0'
  iframe.allowFullscreen = true

  const viewerUrl = new URL(import.meta.env.BASE_URL + 'pdfjs-annotation-viewer/web/viewer.html', window.location.origin)
  const stampUserName = usernameInput?.value?.trim() || ''
  // ae_username is the hash parameter used by pdfjs-annotation-extension to set the username
  const hashParams = stampUserName ? `#ae_username=${encodeURIComponent(stampUserName)}` : ''
  iframe.src = `${viewerUrl.toString()}?file=${encodeURIComponent(currentBlobUrl)}${hashParams}`

  iframe.addEventListener('load', () => {
    setupAnnotationViewer(iframe)
  })

  viewerContainer.appendChild(iframe)
  viewerIframe = iframe
}

function setupAnnotationViewer(iframe: HTMLIFrameElement) {
  try {
    const win = iframe.contentWindow as any
    const doc = win?.document as Document | null
    if (!win || !doc) return

    const initialize = async () => {
      try {
        const app = win.PDFViewerApplication
        if (app?.initializedPromise) {
          await app.initializedPromise
        }

        const eventBus = app?.eventBus
        if (eventBus && typeof eventBus._on === 'function') {
          eventBus._on('annotationeditoruimanager', () => {
            try {
              const stampBtn = doc.getElementById('editorStampButton') as HTMLButtonElement | null
              stampBtn?.click()
            } catch { }
          })
        }

        const root = doc.querySelector('.PdfjsAnnotationExtension') as HTMLElement | null
        if (root) {
          root.classList.add('PdfjsAnnotationExtension_Comment_hidden')
        }

        viewerReady = true
      } catch (e) {
        console.error('Failed to initialize annotation viewer for Add Stamps:', e)
      }
    }

    void initialize()
  } catch (e) {
    console.error('Error wiring Add Stamps viewer:', e)
  }
}

async function onPdfSelected(file: File) {
  selectedFile = file
  updateFileList()
  if (saveStampedBtn) saveStampedBtn.classList.remove('hidden')
  await loadPdfInViewer(file)
}

if (pdfInput) {
  pdfInput.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      const file = target.files[0]
      await onPdfSelected(file)
    }
  })
}

// Add drag/drop support
const dropZone = document.getElementById('drop-zone')
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.classList.add('border-indigo-500')
  })
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-indigo-500')
  })
  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault()
    dropZone.classList.remove('border-indigo-500')
    const file = e.dataTransfer?.files[0]
    if (file && file.type === 'application/pdf') {
      await onPdfSelected(file)
    }
  })
}

if (saveStampedBtn) {
  saveStampedBtn.addEventListener('click', () => {
    if (!viewerIframe) {
      alert('Viewer not ready. Please upload a PDF and wait for it to finish loading.')
      return
    }

    try {
      const win = viewerIframe.contentWindow as any
      const extensionInstance = win?.pdfjsAnnotationExtensionInstance as any

      if (extensionInstance && typeof extensionInstance.exportPdf === 'function') {
        const result = extensionInstance.exportPdf()
        if (result && typeof result.then === 'function') {
          result.then(() => {
            // Reset state after successful export
            setTimeout(() => resetState(), 500)
          }).catch((err: unknown) => {
            console.error('Error while exporting stamped PDF via annotation extension:', err)
          })
        }
        return
      }

      alert('Could not access the stamped-PDF exporter. Please use the Export → PDF button in the viewer toolbar as a fallback.')
    } catch (e) {
      console.error('Failed to trigger stamped PDF export:', e)
      alert('Could not export the stamped PDF. Please use the Export → PDF button in the viewer toolbar as a fallback.')
    }
  })
}

if (backToToolsBtn) {
  backToToolsBtn.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL
  })
}

initializeGlobalShortcuts()