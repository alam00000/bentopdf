import JSZip from 'jszip'
import { downloadFile, formatBytes, readFileAsArrayBuffer } from '../utils/helpers';
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js';

const worker = new Worker(import.meta.env.BASE_URL + 'workers/pdf-to-json.worker.js');

let selectedFiles: File[] = []

const pdfFilesInput = document.getElementById('pdfFiles') as HTMLInputElement
const convertBtn = document.getElementById('convertBtn') as HTMLButtonElement
const statusMessage = document.getElementById('status-message') as HTMLDivElement
const fileListDiv = document.getElementById('fileList') as HTMLDivElement
const backToToolsBtn = document.getElementById('back-to-tools') as HTMLButtonElement

function showStatus(
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
) {
  statusMessage.textContent = message
  statusMessage.className = `mt-4 p-3 rounded-lg text-sm ${type === 'success'
    ? 'bg-green-900 text-green-200'
    : type === 'error'
      ? 'bg-red-900 text-red-200'
      : 'bg-blue-900 text-blue-200'
    }`
  statusMessage.classList.remove('hidden')
}

function hideStatus() {
  statusMessage.classList.add('hidden')
}

function updateFileList() {
  fileListDiv.innerHTML = ''
  if (selectedFiles.length === 0) {
    fileListDiv.classList.add('hidden')
    return
  }

  fileListDiv.classList.remove('hidden')
  selectedFiles.forEach((file) => {
    const fileDiv = document.createElement('div')
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm mb-2'

    const nameSpan = document.createElement('span')
    nameSpan.className = 'truncate font-medium text-gray-200'
    nameSpan.textContent = file.name

    const sizeSpan = document.createElement('span')
    sizeSpan.className = 'flex-shrink-0 ml-4 text-gray-400'
    sizeSpan.textContent = formatBytes(file.size)

    fileDiv.append(nameSpan, sizeSpan)
    fileListDiv.appendChild(fileDiv)
  })
}

pdfFilesInput.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFiles = Array.from(target.files)
    convertBtn.disabled = selectedFiles.length === 0
    updateFileList()

    if (selectedFiles.length === 0) {
      showStatus('Please select at least 1 PDF file', 'info')
    } else {
      showStatus(`${selectedFiles.length} file(s) selected. Ready to convert!`, 'info')
    }
  }
})

async function convertPDFsToJSON() {
  if (selectedFiles.length === 0) {
    showStatus('Please select at least 1 PDF file', 'error')
    return
  }

  try {
    convertBtn.disabled = true
    showStatus('Reading files (Main Thread)...', 'info')

    const fileBuffers = await Promise.all(
      selectedFiles.map(file => readFileAsArrayBuffer(file))
    )

    showStatus('Converting PDFs to JSON..', 'info')

    worker.postMessage({
      command: 'convert',
      fileBuffers: fileBuffers,
      fileNames: selectedFiles.map(f => f.name)
    }, fileBuffers);

  } catch (error) {
    console.error('Error reading files:', error)
    showStatus(`❌ Error reading files: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    convertBtn.disabled = false
  }
}

worker.onmessage = async (e: MessageEvent) => {
  convertBtn.disabled = false;

  if (e.data.status === 'success') {
    const jsonFiles = e.data.jsonFiles as Array<{ name: string, data: ArrayBuffer }>;

    try {
      showStatus('Creating ZIP file...', 'info')

      const zip = new JSZip()
      jsonFiles.forEach(({ name, data }) => {
        const jsonName = name.replace(/\.pdf$/i, '.json')
        const uint8Array = new Uint8Array(data)
        zip.file(jsonName, uint8Array)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadFile(zipBlob, 'pdfs-to-json.zip')

      showStatus('✅ PDFs converted to JSON successfully! ZIP download started.', 'success')

      selectedFiles = []
      pdfFilesInput.value = ''
      fileListDiv.innerHTML = ''
      fileListDiv.classList.add('hidden')
      convertBtn.disabled = true

      setTimeout(() => {
        hideStatus()
      }, 3000)

    } catch (error) {
      console.error('Error creating ZIP:', error)
      showStatus(`❌ Error creating ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }

  } else if (e.data.status === 'error') {
    const errorMessage = e.data.message || 'Unknown error occurred in worker.';
    console.error('Worker Error:', errorMessage);
    showStatus(`❌ Worker Error: ${errorMessage}`, 'error');
  }
};

if (backToToolsBtn) {
  backToToolsBtn.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL
  })
}

convertBtn.addEventListener('click', convertPDFsToJSON)

showStatus('Select PDF files to get started', 'info')
initializeGlobalShortcuts()
