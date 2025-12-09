import { formatBytes, readFileAsArrayBuffer } from '../utils/helpers'
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js'

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

function updateFileList() {
  if (!selectedFile) {
    fileListDiv.classList.add('hidden')
    fileListDiv.innerHTML = ''
    return
  }

  fileListDiv.classList.remove('hidden')
  fileListDiv.innerHTML = ''

  const wrapper = document.createElement('div')
  wrapper.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg mb-2'

  const nameSpan = document.createElement('span')
  nameSpan.className = 'truncate font-medium text-gray-200'
  nameSpan.textContent = selectedFile.name

  const sizeSpan = document.createElement('span')
  sizeSpan.className = 'ml-3 text-gray-400 text-xs flex-shrink-0'
  sizeSpan.textContent = formatBytes(selectedFile.size)

  wrapper.append(nameSpan, sizeSpan)
  fileListDiv.appendChild(wrapper)
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

  const viewerUrl = new URL(import.meta.env.BASE_URL + '/pdfjs-annotation-viewer/web/viewer.html', window.location.origin)
  iframe.src = `${viewerUrl.toString()}?file=${encodeURIComponent(currentBlobUrl)}`

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
          result.catch((err: unknown) => {
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