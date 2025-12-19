import { PDFDocument, StandardFonts, rgb, TextAlignment, PDFName, PDFString, PageSizes, PDFBool, PDFDict, PDFArray, PDFRadioGroup } from 'pdf-lib'
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js'
import { downloadFile, hexToRgb, getPDFDocument } from '../utils/helpers.js'
import { createIcons, icons } from 'lucide'
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

import { FormField, PageData } from '../types/index.js'


let fields: FormField[] = []
let selectedField: FormField | null = null
let fieldCounter = 0
let existingFieldNames: Set<string> = new Set()
let existingRadioGroups: Set<string> = new Set()
let draggedElement: HTMLElement | null = null
let offsetX = 0
let offsetY = 0

let pages: PageData[] = []
let currentPageIndex = 0
let uploadedPdfDoc: PDFDocument | null = null
let uploadedPdfjsDoc: any = null
let pageSize: { width: number; height: number } = { width: 612, height: 792 }
let currentScale = 1.333
let pdfViewerOffset = { x: 0, y: 0 }
let pdfViewerScale = 1.333

let resizing = false
let resizeField: FormField | null = null
let resizePos: string | null = null
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let startLeft = 0
let startTop = 0

let selectedToolType: string | null = null

const canvas = document.getElementById('pdfCanvas') as HTMLDivElement
const propertiesPanel = document.getElementById('propertiesPanel') as HTMLDivElement
const fieldCountDisplay = document.getElementById('fieldCount') as HTMLSpanElement
const uploadArea = document.getElementById('upload-area') as HTMLDivElement
const toolContainer = document.getElementById('tool-container') as HTMLDivElement
const dropZone = document.getElementById('dropZone') as HTMLDivElement
const pdfFileInput = document.getElementById('pdfFileInput') as HTMLInputElement
const blankPdfBtn = document.getElementById('blankPdfBtn') as HTMLButtonElement
const pdfUploadInput = document.getElementById('pdfUploadInput') as HTMLInputElement
const pageSizeSelector = document.getElementById('pageSizeSelector') as HTMLDivElement
const pageSizeSelect = document.getElementById('pageSizeSelect') as HTMLSelectElement
const customDimensionsInput = document.getElementById('customDimensionsInput') as HTMLDivElement
const customWidth = document.getElementById('customWidth') as HTMLInputElement
const customHeight = document.getElementById('customHeight') as HTMLInputElement
const confirmBlankBtn = document.getElementById('confirmBlankBtn') as HTMLButtonElement
const pageIndicator = document.getElementById('pageIndicator') as HTMLSpanElement
const prevPageBtn = document.getElementById('prevPageBtn') as HTMLButtonElement
const nextPageBtn = document.getElementById('nextPageBtn') as HTMLButtonElement
const addPageBtn = document.getElementById('addPageBtn') as HTMLButtonElement
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement
const backToToolsBtn = document.getElementById('back-to-tools') as HTMLButtonElement | null
const gotoPageInput = document.getElementById('gotoPageInput') as HTMLInputElement
const gotoPageBtn = document.getElementById('gotoPageBtn') as HTMLButtonElement

const gridVInput = document.getElementById('gridVInput') as HTMLInputElement
const gridHInput = document.getElementById('gridHInput') as HTMLInputElement
const toggleGridBtn = document.getElementById('toggleGridBtn') as HTMLButtonElement
const enableGridCheckbox = document.getElementById('enableGridCheckbox') as HTMLInputElement
let gridV = 2
let gridH = 2
let gridAlwaysVisible = false
let gridEnabled = true

if (gridVInput && gridHInput) {
    gridVInput.value = '2'
    gridHInput.value = '2'

    const updateGrid = () => {
        let v = parseInt(gridVInput.value) || 2
        let h = parseInt(gridHInput.value) || 2

        if (v < 2) { v = 2; gridVInput.value = '2' }
        if (h < 2) { h = 2; gridHInput.value = '2' }
        if (v > 14) { v = 14; gridVInput.value = '14' }
        if (h > 14) { h = 14; gridHInput.value = '14' }

        gridV = v
        gridH = h

        if (gridAlwaysVisible && gridEnabled) {
            renderGrid()
        }
    }

    gridVInput.addEventListener('input', updateGrid)
    gridHInput.addEventListener('input', updateGrid)
}

if (enableGridCheckbox) {
    enableGridCheckbox.addEventListener('change', (e) => {
        gridEnabled = (e.target as HTMLInputElement).checked

        if (!gridEnabled) {
            removeGrid()
            if (gridVInput) gridVInput.disabled = true
            if (gridHInput) gridHInput.disabled = true
            if (toggleGridBtn) toggleGridBtn.disabled = true
        } else {
            if (gridVInput) gridVInput.disabled = false
            if (gridHInput) gridHInput.disabled = false
            if (toggleGridBtn) toggleGridBtn.disabled = false
            if (gridAlwaysVisible) renderGrid()
        }
    })
}

if (toggleGridBtn) {
    toggleGridBtn.addEventListener('click', () => {
        gridAlwaysVisible = !gridAlwaysVisible

        if (gridAlwaysVisible) {
            toggleGridBtn.classList.add('bg-indigo-600')
            toggleGridBtn.classList.remove('bg-gray-600')
            if (gridEnabled) renderGrid()
        } else {
            toggleGridBtn.classList.remove('bg-indigo-600')
            toggleGridBtn.classList.add('bg-gray-600')
            removeGrid()
        }
    })
}

function renderGrid() {
    const existingGrid = document.getElementById('pdfGrid')
    if (existingGrid) existingGrid.remove()

    const gridContainer = document.createElement('div')
    gridContainer.id = 'pdfGrid'
    gridContainer.className = 'absolute inset-0 pointer-events-none'
    gridContainer.style.zIndex = '1'

    if (gridV > 0) {
        const stepX = canvas.offsetWidth / gridV
        for (let i = 0; i <= gridV; i++) {
            const line = document.createElement('div')
            line.className = 'absolute top-0 bottom-0 border-l-2 border-indigo-500 opacity-60'
            line.style.left = (i * stepX) + 'px'
            gridContainer.appendChild(line)
        }
    }

    if (gridH > 0) {
        const stepY = canvas.offsetHeight / gridH
        for (let i = 0; i <= gridH; i++) {
            const line = document.createElement('div')
            line.className = 'absolute left-0 right-0 border-t-2 border-indigo-500 opacity-60'
            line.style.top = (i * stepY) + 'px'
            gridContainer.appendChild(line)
        }
    }

    canvas.insertBefore(gridContainer, canvas.firstChild)
}

function removeGrid() {
    const existingGrid = document.getElementById('pdfGrid')
    if (existingGrid) existingGrid.remove()
}

if (gotoPageBtn && gotoPageInput) {
    gotoPageBtn.addEventListener('click', () => {
        const pageNum = parseInt(gotoPageInput.value)
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pages.length) {
            currentPageIndex = pageNum - 1
            renderCanvas()
            updatePageNavigation()
        } else {
            alert(`Please enter a valid page number between 1 and ${pages.length}`)
        }
    })

    gotoPageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            gotoPageBtn.click()
        }
    })
}

// Tool item interactions
const toolItems = document.querySelectorAll('.tool-item')
toolItems.forEach(item => {
    // Drag from toolbar
    item.addEventListener('dragstart', (e) => {
        if (e instanceof DragEvent && e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'copy'
            const type = (item as HTMLElement).dataset.type || 'text'
            e.dataTransfer.setData('text/plain', type)
            if (gridEnabled) renderGrid()
        }
    })

    item.addEventListener('dragend', () => {
        if (!gridAlwaysVisible && gridEnabled) removeGrid()
    })
    item.addEventListener('click', () => {
        const type = (item as HTMLElement).dataset.type || 'text'

        // Toggle selection
        if (selectedToolType === type) {
            // Deselect
            selectedToolType = null
            item.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-600')
            canvas.style.cursor = 'default'
        } else {
            // Deselect previous tool
            if (selectedToolType) {
                toolItems.forEach(t => t.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-600'))
            }
            // Select new tool
            selectedToolType = type
            item.classList.add('ring-2', 'ring-indigo-400', 'bg-indigo-600')
            canvas.style.cursor = 'crosshair'
        }
    })

    // Touch events for mobile drag
    let touchStartX = 0
    let touchStartY = 0
    let isTouchDragging = false

    item.addEventListener('touchstart', (e) => {
        const touch = e.touches[0]
        touchStartX = touch.clientX
        touchStartY = touch.clientY
        isTouchDragging = false
    })

    item.addEventListener('touchmove', (e) => {
        e.preventDefault() // Prevent scrolling while dragging
        const touch = e.touches[0]
        const moveX = Math.abs(touch.clientX - touchStartX)
        const moveY = Math.abs(touch.clientY - touchStartY)

        // If moved more than 10px, it's a drag not a click
        if (moveX > 10 || moveY > 10) {
            isTouchDragging = true
        }
    })

    item.addEventListener('touchend', (e) => {
        e.preventDefault()
        if (!isTouchDragging) {
            // It was a tap, treat as click
            (item as HTMLElement).click()
            return
        }

        // It was a drag, place field at touch end position
        const touch = e.changedTouches[0]
        const canvasRect = canvas.getBoundingClientRect()

        // Check if touch ended on canvas
        if (touch.clientX >= canvasRect.left && touch.clientX <= canvasRect.right &&
            touch.clientY >= canvasRect.top && touch.clientY <= canvasRect.bottom) {
            const x = touch.clientX - canvasRect.left - 75
            const y = touch.clientY - canvasRect.top - 15
            const type = (item as HTMLElement).dataset.type || 'text'
            createField(type as any, x, y)
        }
    })
})

// Canvas drop zone
canvas.addEventListener('dragover', (e) => {
    e.preventDefault()
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
    }
})

canvas.addEventListener('drop', (e) => {
    e.preventDefault()
    if (!gridAlwaysVisible) removeGrid()
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - 75
    const y = e.clientY - rect.top - 15
    const type = e.dataTransfer?.getData('text/plain') || 'text'
    createField(type as any, x, y)
})

canvas.addEventListener('click', (e) => {
    if (selectedToolType) {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left - 75
        const y = e.clientY - rect.top - 15
        createField(selectedToolType as any, x, y)

        toolItems.forEach(item => item.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-600'))
        selectedToolType = null
        canvas.style.cursor = 'default'
        return
    }

    // Existing deselect behavior (only if no tool is selected)
    if (e.target === canvas) {
        deselectAll()
    }
})

function createField(type: FormField['type'], x: number, y: number): void {
    fieldCounter++
    const field: FormField = {
        id: `field_${fieldCounter}`,
        type: type,
        x: Math.max(0, Math.min(x, 816 - 150)),
        y: Math.max(0, Math.min(y, 1056 - 30)),
        width: type === 'checkbox' || type === 'radio' ? 30 : 150,
        height: type === 'checkbox' || type === 'radio' ? 30 : 30,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)}_${fieldCounter}`,
        defaultValue: '',
        fontSize: 12,
        alignment: 'left',
        textColor: '#000000',
        required: false,
        readOnly: false,
        tooltip: '',
        combCells: 0,
        maxLength: 0,
        options: type === 'dropdown' || type === 'optionlist' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
        checked: type === 'radio' || type === 'checkbox' ? false : undefined,
        exportValue: type === 'radio' || type === 'checkbox' ? 'Yes' : undefined,
        groupName: type === 'radio' ? 'RadioGroup1' : undefined,
        label: type === 'button' ? 'Button' : (type === 'image' ? 'Click to Upload Image' : undefined),
        action: type === 'button' ? 'none' : undefined,
        jsScript: type === 'button' ? 'app.alert("Hello World!");' : undefined,
        visibilityAction: type === 'button' ? 'toggle' : undefined,
        dateFormat: type === 'date' ? 'mm/dd/yyyy' : undefined,
        pageIndex: currentPageIndex,
        multiline: type === 'text' ? false : undefined,
        borderColor: '#000000',
        hideBorder: false
    }

    fields.push(field)
    renderField(field)
    updateFieldCount()
}

// Render field on canvas
function renderField(field: FormField): void {
    const fieldWrapper = document.createElement('div')
    fieldWrapper.id = field.id
    fieldWrapper.className = 'absolute cursor-move group' // Added group for hover effects
    fieldWrapper.style.left = field.x + 'px'
    fieldWrapper.style.top = field.y + 'px'
    fieldWrapper.style.width = field.width + 'px'
    fieldWrapper.style.overflow = 'visible'
    fieldWrapper.style.zIndex = '10' // Ensure fields are above grid and PDF

    // Create label - hidden by default, shown on group hover or selection
    const label = document.createElement('div')
    label.className = 'field-label absolute left-0 w-full text-xs font-semibold pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity'
    label.style.bottom = '100%'
    label.style.marginBottom = '4px'
    label.style.color = '#374151'
    label.style.fontSize = '11px'
    label.style.lineHeight = '1'
    label.style.whiteSpace = 'nowrap'
    label.style.overflow = 'hidden'
    label.style.textOverflow = 'ellipsis'
    label.textContent = field.name

    // Create input container - light border by default, dashed on hover
    const fieldContainer = document.createElement('div')
    fieldContainer.className =
        'field-container relative border-2 border-indigo-200 group-hover:border-dashed group-hover:border-indigo-300 bg-indigo-50/30 rounded transition-all'
    fieldContainer.style.width = '100%'
    fieldContainer.style.height = field.height + 'px'

    // Create content based on type
    const contentEl = document.createElement('div')
    contentEl.className = 'field-content w-full h-full flex items-center justify-center overflow-hidden'

    if (field.type === 'text') {
        contentEl.className = 'field-text w-full h-full flex items-center px-2 text-sm overflow-hidden'
        contentEl.style.fontSize = field.fontSize + 'px'
        contentEl.style.textAlign = field.alignment
        contentEl.style.justifyContent = field.alignment === 'left' ? 'flex-start' : field.alignment === 'right' ? 'flex-end' : 'center'
        contentEl.style.color = field.textColor
        contentEl.style.whiteSpace = field.multiline ? 'pre-wrap' : 'nowrap'
        contentEl.style.textOverflow = 'ellipsis'
        contentEl.style.alignItems = field.multiline ? 'flex-start' : 'center'
        contentEl.textContent = field.defaultValue

        // Apply combing visual if enabled
        if (field.combCells > 0) {
            contentEl.style.backgroundImage = `repeating-linear-gradient(90deg, transparent, transparent calc((100% / ${field.combCells}) - 1px), #e5e7eb calc((100% / ${field.combCells}) - 1px), #e5e7eb calc(100% / ${field.combCells}))`
            contentEl.style.fontFamily = 'monospace'
            contentEl.style.letterSpacing = `calc(${field.width / field.combCells}px - 1ch)`
            contentEl.style.paddingLeft = `calc((${field.width / field.combCells}px - 1ch) / 2)`
            contentEl.style.overflow = 'hidden'
            contentEl.style.textAlign = 'left'
            contentEl.style.justifyContent = 'flex-start'
        }
    } else if (field.type === 'checkbox') {
        contentEl.innerHTML = field.checked ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full p-1"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''
    } else if (field.type === 'radio') {
        fieldContainer.classList.add('rounded-full') // Make container round for radio
        contentEl.innerHTML = field.checked ? '<div class="w-3/4 h-3/4 bg-black rounded-full"></div>' : ''
    } else if (field.type === 'dropdown') {
        contentEl.className = 'w-full h-full flex items-center px-2 text-sm text-black'
        contentEl.style.backgroundColor = '#e6f0ff' // Light blue background like Firefox

        // Show selected option or first option or placeholder
        let displayText = 'Select...'
        if (field.defaultValue && field.options && field.options.includes(field.defaultValue)) {
            displayText = field.defaultValue
        } else if (field.options && field.options.length > 0) {
            displayText = field.options[0]
        }
        contentEl.textContent = displayText

        const arrow = document.createElement('div')
        arrow.className = 'absolute right-1 top-1/2 -translate-y-1/2'
        arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m6 9 6 6 6-6"/></svg>'
        fieldContainer.appendChild(arrow)

    } else if (field.type === 'optionlist') {
        contentEl.className = 'w-full h-full flex flex-col text-sm bg-white overflow-hidden border border-gray-300'
        // Render options as a list
        if (field.options && field.options.length > 0) {
            field.options.forEach((opt, index) => {
                const optEl = document.createElement('div')
                optEl.className = 'px-1 w-full truncate'
                optEl.textContent = opt

                // Highlight selected option (defaultValue) or first one if no selection
                const isSelected = field.defaultValue ? field.defaultValue === opt : index === 0

                if (isSelected) {
                    optEl.className += ' bg-blue-600 text-white'
                } else {
                    optEl.className += ' text-black'
                }
                contentEl.appendChild(optEl)
            })
        } else {
            // Empty state
            const optEl = document.createElement('div')
            optEl.className = 'px-1 w-full text-black italic'
            optEl.textContent = 'Item 1'
            contentEl.appendChild(optEl)
        }

    } else if (field.type === 'button') {
        contentEl.className = 'field-content w-full h-full flex items-center justify-center bg-gray-200 text-sm font-semibold'
        contentEl.style.color = field.textColor || '#000000'
        contentEl.textContent = field.label || 'Button'
    } else if (field.type === 'signature') {
        contentEl.className = 'w-full h-full flex items-center justify-center bg-gray-50 text-gray-400'
        contentEl.innerHTML = '<div class="flex flex-col items-center"><i data-lucide="pen-tool" class="w-6 h-6 mb-1"></i><span class="text-[10px]">Sign Here</span></div>'
        setTimeout(() => (window as any).lucide?.createIcons(), 0)
    } else if (field.type === 'date') {
        contentEl.className = 'w-full h-full flex items-center justify-center bg-white text-gray-600 border border-gray-300'
        contentEl.innerHTML = `<div class="flex items-center gap-2 px-2"><i data-lucide="calendar" class="w-4 h-4"></i><span class="text-sm date-format-text">${field.dateFormat || 'mm/dd/yyyy'}</span></div>`
        setTimeout(() => (window as any).lucide?.createIcons(), 0)
    } else if (field.type === 'image') {
        contentEl.className = 'w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 border border-gray-300'
        contentEl.innerHTML = `<div class="flex flex-col items-center text-center p-1"><i data-lucide="image" class="w-6 h-6 mb-1"></i><span class="text-[10px] leading-tight">${field.label || 'Click to Upload Image'}</span></div>`
        setTimeout(() => (window as any).lucide?.createIcons(), 0)
    }

    fieldContainer.appendChild(contentEl)
    fieldWrapper.appendChild(label)
    fieldWrapper.appendChild(fieldContainer)

    // Click to select
    fieldWrapper.addEventListener('click', (e) => {
        e.stopPropagation()
        selectField(field)
    })

    // Drag to move
    fieldWrapper.addEventListener('mousedown', (e) => {
        // Don't start drag if clicking on a resize handle
        if ((e.target as HTMLElement).classList.contains('resize-handle')) {
            return
        }
        draggedElement = fieldWrapper
        const rect = canvas.getBoundingClientRect()
        offsetX = e.clientX - rect.left - field.x
        offsetY = e.clientY - rect.top - field.y
        selectField(field)
        if (gridEnabled) renderGrid()
        e.preventDefault()
    })

    // Touch events for moving fields
    let touchMoveStarted = false
    fieldWrapper.addEventListener('touchstart', (e) => {
        if ((e.target as HTMLElement).classList.contains('resize-handle')) {
            return
        }
        touchMoveStarted = false
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        offsetX = touch.clientX - rect.left - field.x
        offsetY = touch.clientY - rect.top - field.y
        selectField(field)
    }, { passive: true })

    fieldWrapper.addEventListener('touchmove', (e) => {
        e.preventDefault()
        touchMoveStarted = true
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        let newX = touch.clientX - rect.left - offsetX
        let newY = touch.clientY - rect.top - offsetY

        newX = Math.max(0, Math.min(newX, rect.width - fieldWrapper.offsetWidth))
        newY = Math.max(0, Math.min(newY, rect.height - fieldWrapper.offsetHeight))

        fieldWrapper.style.left = newX + 'px'
        fieldWrapper.style.top = newY + 'px'

        field.x = newX
        field.y = newY
    })

    fieldWrapper.addEventListener('touchend', () => {
        touchMoveStarted = false
    })

    // Add resize handles to the container - hidden by default
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']
    handles.forEach((pos) => {
        const handle = document.createElement('div')
        handle.className = `absolute w-2.5 h-2.5 bg-white border border-indigo-600 z-10 cursor-${pos}-resize resize-handle hidden` // Added hidden class
        const positions: Record<string, string> = {
            nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
            ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
            sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
            se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
            n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
            s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
            e: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
            w: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
        }
        handle.className += ` ${positions[pos]}`
        handle.dataset.position = pos

        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation()
            startResize(e, field, pos)
        })

        // Touch events for resize handles
        handle.addEventListener('touchstart', (e) => {
            e.stopPropagation()
            e.preventDefault()
            const touch = e.touches[0]
            // Create a synthetic mouse event for startResize
            const syntheticEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => { }
            } as MouseEvent
            startResize(syntheticEvent, field, pos)
        })

        fieldContainer.appendChild(handle)
    })

    canvas.appendChild(fieldWrapper)
}

function startResize(e: MouseEvent, field: FormField, pos: string): void {
    resizing = true
    resizeField = field
    resizePos = pos
    startX = e.clientX
    startY = e.clientY
    startWidth = field.width
    startHeight = field.height
    startLeft = field.x
    startTop = field.y
    e.preventDefault()
}

// Mouse move for dragging and resizing
document.addEventListener('mousemove', (e) => {
    if (draggedElement && !resizing) {
        const rect = canvas.getBoundingClientRect()
        let newX = e.clientX - rect.left - offsetX
        let newY = e.clientY - rect.top - offsetY

        newX = Math.max(0, Math.min(newX, rect.width - draggedElement.offsetWidth))
        newY = Math.max(0, Math.min(newY, rect.height - draggedElement.offsetHeight))

        draggedElement.style.left = newX + 'px'
        draggedElement.style.top = newY + 'px'

        const field = fields.find((f) => f.id === draggedElement!.id)
        if (field) {
            field.x = newX
            field.y = newY
        }
    } else if (resizing && resizeField) {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        const fieldWrapper = document.getElementById(resizeField.id)

        if (resizePos!.includes('e')) {
            resizeField.width = Math.max(50, startWidth + dx)
        }
        if (resizePos!.includes('w')) {
            const newWidth = Math.max(50, startWidth - dx)
            const widthDiff = startWidth - newWidth
            resizeField.width = newWidth
            resizeField.x = startLeft + widthDiff
        }
        if (resizePos!.includes('s')) {
            resizeField.height = Math.max(20, startHeight + dy)
        }
        if (resizePos!.includes('n')) {
            const newHeight = Math.max(20, startHeight - dy)
            const heightDiff = startHeight - newHeight
            resizeField.height = newHeight
            resizeField.y = startTop + heightDiff
        }

        if (fieldWrapper) {
            const container = fieldWrapper.querySelector('.field-container') as HTMLElement
            fieldWrapper.style.width = resizeField.width + 'px'
            fieldWrapper.style.left = resizeField.x + 'px'
            fieldWrapper.style.top = resizeField.y + 'px'
            if (container) {
                container.style.height = resizeField.height + 'px'
            }
            // Update combing visuals on resize
            if (resizeField.combCells > 0) {
                const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                if (textEl) {
                    textEl.style.letterSpacing = `calc(${resizeField.width / resizeField.combCells}px - 1ch)`
                    textEl.style.paddingLeft = `calc((${resizeField.width / resizeField.combCells}px - 1ch) / 2)`
                }
            }
        }
    }
})

document.addEventListener('mouseup', () => {
    draggedElement = null
    resizing = false
    resizeField = null
    if (!gridAlwaysVisible) removeGrid()
})

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0]
    if (resizing && resizeField) {
        const dx = touch.clientX - startX
        const dy = touch.clientY - startY
        const fieldWrapper = document.getElementById(resizeField.id)

        if (resizePos!.includes('e')) {
            resizeField.width = Math.max(50, startWidth + dx)
        }
        if (resizePos!.includes('w')) {
            const newWidth = Math.max(50, startWidth - dx)
            const widthDiff = startWidth - newWidth
            resizeField.width = newWidth
            resizeField.x = startLeft + widthDiff
        }
        if (resizePos!.includes('s')) {
            resizeField.height = Math.max(20, startHeight + dy)
        }
        if (resizePos!.includes('n')) {
            const newHeight = Math.max(20, startHeight - dy)
            const heightDiff = startHeight - newHeight
            resizeField.height = newHeight
            resizeField.y = startTop + heightDiff
        }

        if (fieldWrapper) {
            const container = fieldWrapper.querySelector('.field-container') as HTMLElement
            fieldWrapper.style.width = resizeField.width + 'px'
            fieldWrapper.style.left = resizeField.x + 'px'
            fieldWrapper.style.top = resizeField.y + 'px'
            if (container) {
                container.style.height = resizeField.height + 'px'
            }
            if (resizeField.combCells > 0) {
                const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                if (textEl) {
                    textEl.style.letterSpacing = `calc(${resizeField.width / resizeField.combCells}px - 1ch)`
                    textEl.style.paddingLeft = `calc((${resizeField.width / resizeField.combCells}px - 1ch) / 2)`
                }
            }
        }
    }
}, { passive: false })

document.addEventListener('touchend', () => {
    resizing = false
    resizeField = null
})



// Select field
function selectField(field: FormField): void {
    deselectAll()
    selectedField = field
    const fieldWrapper = document.getElementById(field.id)
    if (fieldWrapper) {
        const container = fieldWrapper.querySelector('.field-container') as HTMLElement
        const label = fieldWrapper.querySelector('.field-label') as HTMLElement
        const handles = fieldWrapper.querySelectorAll('.resize-handle')

        if (container) {
            // Remove hover classes and add selected classes
            container.classList.remove('border-indigo-200', 'group-hover:border-dashed', 'group-hover:border-indigo-300')
            container.classList.add('border-dashed', 'border-indigo-500', 'bg-indigo-50')
        }

        if (label) {
            label.classList.remove('opacity-0', 'group-hover:opacity-100')
            label.classList.add('opacity-100')
        }

        handles.forEach(handle => {
            handle.classList.remove('hidden')
        })
    }
    showProperties(field)
}

// Deselect all
function deselectAll(): void {
    if (selectedField) {
        const fieldWrapper = document.getElementById(selectedField.id)
        if (fieldWrapper) {
            const container = fieldWrapper.querySelector('.field-container') as HTMLElement
            const label = fieldWrapper.querySelector('.field-label') as HTMLElement
            const handles = fieldWrapper.querySelectorAll('.resize-handle')

            if (container) {
                // Revert to default/hover state
                container.classList.remove('border-dashed', 'border-indigo-500', 'bg-indigo-50')
                container.classList.add('border-indigo-200', 'group-hover:border-dashed', 'group-hover:border-indigo-300')
            }

            if (label) {
                label.classList.remove('opacity-100')
                label.classList.add('opacity-0', 'group-hover:opacity-100')
            }

            handles.forEach(handle => {
                handle.classList.add('hidden')
            })
        }
        selectedField = null
    }
    hideProperties()
}

// Show properties panel
function showProperties(field: FormField): void {
    let specificProps = ''

    if (field.type === 'text') {
        specificProps = `
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Value</label>
            <input type="text" id="propValue" value="${field.defaultValue}" ${field.combCells > 0 ? `maxlength="${field.combCells}"` : field.maxLength > 0 ? `maxlength="${field.maxLength}"` : ''} class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Max Length (0 for unlimited)</label>
            <input type="number" id="propMaxLength" value="${field.maxLength}" min="0" ${field.combCells > 0 ? 'disabled' : ''} class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50">
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Divide into boxes (0 to disable)</label>
            <input type="number" id="propComb" value="${field.combCells}" min="0" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Font Size</label>
            <input type="number" id="propFontSize" value="${field.fontSize}" min="8" max="72" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Text Color</label>
            <input type="color" id="propTextColor" value="${field.textColor}" class="w-full border border-gray-500 rounded px-2 py-1 h-10">
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Alignment</label>
            <select id="propAlignment" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
            <option value="left" ${field.alignment === 'left' ? 'selected' : ''}>Left</option>
            <option value="center" ${field.alignment === 'center' ? 'selected' : ''}>Center</option>
            <option value="right" ${field.alignment === 'right' ? 'selected' : ''}>Right</option>
            </select>
        </div>
        <div class="flex items-center justify-between bg-gray-600 p-2 rounded mt-2">
            <label for="propMultiline" class="text-xs font-semibold text-gray-300">Multi-line</label>
            <button id="propMultilineBtn" class="w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${field.multiline ? 'bg-indigo-600' : 'bg-gray-500'} relative">
                <span class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${field.multiline ? 'translate-x-6' : 'translate-x-0'}"></span>
            </button>
        </div>
        `
    } else if (field.type === 'checkbox') {
        specificProps = `
        <div class="flex items-center justify-between bg-gray-600 p-2 rounded">
            <label for="propChecked" class="text-xs font-semibold text-gray-300">Checked State</label>
            <button id="propCheckedBtn" class="w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${field.checked ? 'bg-indigo-600' : 'bg-gray-500'} relative">
                <span class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${field.checked ? 'translate-x-6' : 'translate-x-0'}"></span>
            </button>
        </div>
        `
    } else if (field.type === 'radio') {
        specificProps = `
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Group Name (Must be same for group)</label>
            <input type="text" id="propGroupName" value="${field.groupName}" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Export Value</label>
            <input type="text" id="propExportValue" value="${field.exportValue}" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="flex items-center justify-between bg-gray-600 p-2 rounded mt-2">
            <label for="propChecked" class="text-xs font-semibold text-gray-300">Checked State</label>
            <button id="propCheckedBtn" class="w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${field.checked ? 'bg-indigo-600' : 'bg-gray-500'} relative">
                <span class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${field.checked ? 'translate-x-6' : 'translate-x-0'}"></span>
            </button>
        </div>
        `
    } else if (field.type === 'dropdown' || field.type === 'optionlist') {
        specificProps = `
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Options (One per line or comma separated)</label>
            <textarea id="propOptions" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500 h-24">${field.options?.join('\n')}</textarea>
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Selected Option</label>
            <select id="propSelectedOption" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">None</option>
                ${field.options?.map(opt => `<option value="${opt}" ${field.defaultValue === opt ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
        </div>
        <div class="text-xs text-gray-400 italic mt-2">
            To actually fill or change the options, use our PDF Form Filler tool.
        </div>
        `
    } else if (field.type === 'button') {
        specificProps = `
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Label</label>
            <input type="text" id="propLabel" value="${field.label}" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Action</label>
            <select id="propAction" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="none" ${field.action === 'none' ? 'selected' : ''}>None</option>
                <option value="reset" ${field.action === 'reset' ? 'selected' : ''}>Reset Form</option>
                <option value="print" ${field.action === 'print' ? 'selected' : ''}>Print Form</option>
                <option value="url" ${field.action === 'url' ? 'selected' : ''}>Open URL</option>
                <option value="js" ${field.action === 'js' ? 'selected' : ''}>Run Javascript</option>
                <option value="showHide" ${field.action === 'showHide' ? 'selected' : ''}>Show/Hide Field</option>
            </select>
        </div>
        <div id="propUrlContainer" class="${field.action === 'url' ? '' : 'hidden'}">
            <label class="block text-xs font-semibold text-gray-300 mb-1">URL</label>
            <input type="text" id="propActionUrl" value="${field.actionUrl || ''}" placeholder="https://example.com" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div id="propJsContainer" class="${field.action === 'js' ? '' : 'hidden'}">
            <label class="block text-xs font-semibold text-gray-300 mb-1">Javascript Code</label>
            <textarea id="propJsScript" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500 h-24 font-mono">${field.jsScript || ''}</textarea>
        </div>
        <div id="propShowHideContainer" class="${field.action === 'showHide' ? '' : 'hidden'}">
            <div class="mb-2">
                <label class="block text-xs font-semibold text-gray-300 mb-1">Target Field</label>
                <select id="propTargetField" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select a field...</option>
                    ${fields.filter(f => f.id !== field.id).map(f => `<option value="${f.name}" ${field.targetFieldName === f.name ? 'selected' : ''}>${f.name} (${f.type})</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1">Visibility</label>
                <select id="propVisibilityAction" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="show" ${field.visibilityAction === 'show' ? 'selected' : ''}>Show</option>
                    <option value="hide" ${field.visibilityAction === 'hide' ? 'selected' : ''}>Hide</option>
                    <option value="toggle" ${field.visibilityAction === 'toggle' ? 'selected' : ''}>Toggle</option>
                </select>
            </div>
        </div>
        `
    } else if (field.type === 'signature') {
        specificProps = `
        <div class="text-xs text-gray-400 italic mb-2">
            Signature fields are AcroForm signature fields and would only be visible in an advanced PDF viewer.
        </div>
        `
    } else if (field.type === 'date') {
        const formats = ['mm/dd/yyyy', 'dd/mm/yyyy', 'mm/yy', 'dd/mm/yy', 'yyyy/mm/dd', 'mmm d, yyyy', 'd-mmm-yy', 'yy-mm-dd']
        specificProps = `
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Date Format</label>
            <select id="propDateFormat" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                ${formats.map(f => `<option value="${f}" ${field.dateFormat === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
        </div>
        <div class="text-xs text-gray-400 italic mt-2">
            The selected format will be enforced when the user types or picks a date.
        </div>
        <div class="bg-blue-900/30 border border-blue-700/50 rounded p-2 mt-2">
            <p class="text-xs text-blue-200 flex gap-2">
                <i data-lucide="info" class="w-4 h-4 flex-shrink-0"></i>
                <span><strong>Browser Note:</strong> Firefox and Chrome may show their native date picker format during selection. The correct format will apply when you finish entering the date. This is normal browser behavior and not an issue.</span>
            </p>
        </div>
        `
    } else if (field.type === 'image') {
        specificProps = `
        <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Label / Prompt</label>
            <input type="text" id="propLabel" value="${field.label}" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="text-xs text-gray-400 italic mt-2">
            Clicking this field in the PDF will open a file picker to upload an image.
        </div>
        `
    }

    propertiesPanel.innerHTML = `
    <div class="space-y-3">
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Field Name ${field.type === 'radio' ? '(Group Name)' : ''}</label>
        <input type="text" id="propName" value="${field.name}" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        <div id="nameError" class="hidden text-red-400 text-xs mt-1"></div>
      </div>
      ${field.type === 'radio' && (existingRadioGroups.size > 0 || fields.some(f => f.type === 'radio' && f.id !== field.id)) ? `
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Existing Radio Groups</label>
        <select id="existingGroups" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">-- Select existing group --</option>
          ${Array.from(existingRadioGroups).map(name => `<option value="${name}">${name}</option>`).join('')}
          ${Array.from(new Set(fields.filter(f => f.type === 'radio' && f.id !== field.id).map(f => f.name))).map(name => !existingRadioGroups.has(name) ? `<option value="${name}">${name}</option>` : '').join('')}
        </select>
        <p class="text-xs text-gray-400 mt-1">Select to add this button to an existing group</p>
      </div>
      ` : ''}
      ${specificProps}
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Tooltip / Help Text</label>
        <input type="text" id="propTooltip" value="${field.tooltip}" placeholder="Description for screen readers" class="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500">
      </div>
      <div class="flex items-center">
        <input type="checkbox" id="propRequired" ${field.required ? 'checked' : ''} class="mr-2">
        <label for="propRequired" class="text-xs font-semibold text-gray-300">Required</label>
      </div>
      <div class="flex items-center">
        <input type="checkbox" id="propReadOnly" ${field.readOnly ? 'checked' : ''} class="mr-2">
        <label for="propReadOnly" class="text-xs font-semibold text-gray-300">Read Only</label>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Border Color</label>
        <input type="color" id="propBorderColor" value="${field.borderColor || '#000000'}" class="w-full border border-gray-500 rounded px-2 py-1 h-10">
      </div>
      <div class="flex items-center">
        <input type="checkbox" id="propHideBorder" ${field.hideBorder ? 'checked' : ''} class="mr-2">
        <label for="propHideBorder" class="text-xs font-semibold text-gray-300">Hide Border</label>
      </div>
      <button id="deleteBtn" class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition text-sm font-semibold">
        Delete Field
      </button>
    </div>
  `

    // Common listeners
    const propName = document.getElementById('propName') as HTMLInputElement
    const nameError = document.getElementById('nameError') as HTMLDivElement
    const propTooltip = document.getElementById('propTooltip') as HTMLInputElement
    const propRequired = document.getElementById('propRequired') as HTMLInputElement
    const propReadOnly = document.getElementById('propReadOnly') as HTMLInputElement
    const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement

    const validateName = (newName: string): boolean => {
        if (!newName) {
            nameError.textContent = 'Field name cannot be empty'
            nameError.classList.remove('hidden')
            propName.classList.add('border-red-500')
            return false
        }

        if (field.type === 'radio') {
            nameError.classList.add('hidden')
            propName.classList.remove('border-red-500')
            return true
        }

        const isDuplicateInFields = fields.some(f => f.id !== field.id && f.name === newName)
        const isDuplicateInPdf = existingFieldNames.has(newName)

        if (isDuplicateInFields || isDuplicateInPdf) {
            nameError.textContent = `Field name "${newName}" already exists in this ${isDuplicateInPdf ? 'PDF' : 'form'}. Please try using a unique name.`
            nameError.classList.remove('hidden')
            propName.classList.add('border-red-500')
            return false
        }

        nameError.classList.add('hidden')
        propName.classList.remove('border-red-500')
        return true
    }

    propName.addEventListener('input', (e) => {
        const newName = (e.target as HTMLInputElement).value.trim()
        validateName(newName)
    })

    propName.addEventListener('change', (e) => {
        const newName = (e.target as HTMLInputElement).value.trim()

        if (!validateName(newName)) {
            (e.target as HTMLInputElement).value = field.name
            return
        }

        field.name = newName
        const fieldWrapper = document.getElementById(field.id)
        if (fieldWrapper) {
            const label = fieldWrapper.querySelector('.field-label') as HTMLElement
            if (label) label.textContent = field.name
        }
    })

    propTooltip.addEventListener('input', (e) => {
        field.tooltip = (e.target as HTMLInputElement).value
    })

    if (field.type === 'radio') {
        const existingGroupsSelect = document.getElementById('existingGroups') as HTMLSelectElement
        if (existingGroupsSelect) {
            existingGroupsSelect.addEventListener('change', (e) => {
                const selectedGroup = (e.target as HTMLSelectElement).value
                if (selectedGroup) {
                    propName.value = selectedGroup
                    field.name = selectedGroup
                    validateName(selectedGroup)

                    // Update field label
                    const fieldWrapper = document.getElementById(field.id)
                    if (fieldWrapper) {
                        const label = fieldWrapper.querySelector('.field-label') as HTMLElement
                        if (label) label.textContent = field.name
                    }
                }
            })
        }
    }

    propRequired.addEventListener('change', (e) => {
        field.required = (e.target as HTMLInputElement).checked
    })

    propReadOnly.addEventListener('change', (e) => {
        field.readOnly = (e.target as HTMLInputElement).checked
    })

    const propBorderColor = document.getElementById('propBorderColor') as HTMLInputElement
    const propHideBorder = document.getElementById('propHideBorder') as HTMLInputElement

    propBorderColor.addEventListener('input', (e) => {
        field.borderColor = (e.target as HTMLInputElement).value
    })

    propHideBorder.addEventListener('change', (e) => {
        field.hideBorder = (e.target as HTMLInputElement).checked
    })

    deleteBtn.addEventListener('click', () => {
        deleteField(field)
    })

    // Specific listeners
    if (field.type === 'text') {
        const propValue = document.getElementById('propValue') as HTMLInputElement
        const propMaxLength = document.getElementById('propMaxLength') as HTMLInputElement
        const propComb = document.getElementById('propComb') as HTMLInputElement
        const propFontSize = document.getElementById('propFontSize') as HTMLInputElement
        const propTextColor = document.getElementById('propTextColor') as HTMLInputElement
        const propAlignment = document.getElementById('propAlignment') as HTMLSelectElement

        propValue.addEventListener('input', (e) => {
            field.defaultValue = (e.target as HTMLInputElement).value
            const fieldWrapper = document.getElementById(field.id)
            if (fieldWrapper) {
                const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                if (textEl) textEl.textContent = field.defaultValue
            }
        })

        propMaxLength.addEventListener('input', (e) => {
            const val = parseInt((e.target as HTMLInputElement).value)
            field.maxLength = isNaN(val) ? 0 : Math.max(0, val)
            if (field.maxLength > 0) {
                propValue.maxLength = field.maxLength
                if (field.defaultValue.length > field.maxLength) {
                    field.defaultValue = field.defaultValue.substring(0, field.maxLength)
                    propValue.value = field.defaultValue
                    const fieldWrapper = document.getElementById(field.id)
                    if (fieldWrapper) {
                        const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                        if (textEl) textEl.textContent = field.defaultValue
                    }
                }
            } else {
                propValue.removeAttribute('maxLength')
            }
        })

        propComb.addEventListener('input', (e) => {
            const val = parseInt((e.target as HTMLInputElement).value)
            field.combCells = isNaN(val) ? 0 : Math.max(0, val)

            if (field.combCells > 0) {
                propValue.maxLength = field.combCells
                propMaxLength.value = field.combCells.toString()
                propMaxLength.disabled = true
                field.maxLength = field.combCells

                if (field.defaultValue.length > field.combCells) {
                    field.defaultValue = field.defaultValue.substring(0, field.combCells)
                    propValue.value = field.defaultValue
                }
            } else {
                propMaxLength.disabled = false
                propValue.removeAttribute('maxLength')
                if (field.maxLength > 0) {
                    propValue.maxLength = field.maxLength
                }
            }

            // Re-render field visual only, NOT the properties panel
            const fieldWrapper = document.getElementById(field.id)
            if (fieldWrapper) {
                // Update text content
                const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                if (textEl) {
                    textEl.textContent = field.defaultValue
                    if (field.combCells > 0) {
                        textEl.style.backgroundImage = `repeating-linear-gradient(90deg, transparent, transparent calc((100% / ${field.combCells}) - 1px), #e5e7eb calc((100% / ${field.combCells}) - 1px), #e5e7eb calc(100% / ${field.combCells}))`
                        textEl.style.fontFamily = 'monospace'
                        textEl.style.letterSpacing = `calc(${field.width / field.combCells}px - 1ch)`
                        textEl.style.paddingLeft = `calc((${field.width / field.combCells}px - 1ch) / 2)`
                        textEl.style.overflow = 'hidden'
                        textEl.style.textAlign = 'left'
                        textEl.style.justifyContent = 'flex-start'
                    } else {
                        textEl.style.backgroundImage = 'none'
                        textEl.style.fontFamily = 'inherit'
                        textEl.style.letterSpacing = 'normal'
                        textEl.style.textAlign = field.alignment
                        textEl.style.justifyContent = field.alignment === 'left' ? 'flex-start' : field.alignment === 'right' ? 'flex-end' : 'center'
                    }
                }
            }
        })

        propFontSize.addEventListener('input', (e) => {
            field.fontSize = parseInt((e.target as HTMLInputElement).value)
            const fieldWrapper = document.getElementById(field.id)
            if (fieldWrapper) {
                const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                if (textEl) textEl.style.fontSize = field.fontSize + 'px'
            }
        })

        propTextColor.addEventListener('input', (e) => {
            field.textColor = (e.target as HTMLInputElement).value
            const fieldWrapper = document.getElementById(field.id)
            if (fieldWrapper) {
                const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                if (textEl) textEl.style.color = field.textColor
            }
        })

        propAlignment.addEventListener('change', (e) => {
            field.alignment = (e.target as HTMLSelectElement).value as 'left' | 'center' | 'right'
            const fieldWrapper = document.getElementById(field.id)
            if (fieldWrapper) {
                const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                if (textEl) {
                    textEl.style.textAlign = field.alignment
                    textEl.style.justifyContent = field.alignment === 'left' ? 'flex-start' : field.alignment === 'right' ? 'flex-end' : 'center'
                }
            }
        })

        const propMultilineBtn = document.getElementById('propMultilineBtn') as HTMLButtonElement
        if (propMultilineBtn) {
            propMultilineBtn.addEventListener('click', () => {
                field.multiline = !field.multiline

                // Update Toggle Button UI
                const span = propMultilineBtn.querySelector('span')
                if (field.multiline) {
                    propMultilineBtn.classList.remove('bg-gray-500')
                    propMultilineBtn.classList.add('bg-indigo-600')
                    span?.classList.remove('translate-x-0')
                    span?.classList.add('translate-x-6')
                } else {
                    propMultilineBtn.classList.remove('bg-indigo-600')
                    propMultilineBtn.classList.add('bg-gray-500')
                    span?.classList.remove('translate-x-6')
                    span?.classList.add('translate-x-0')
                }

                // Update Canvas UI
                const fieldWrapper = document.getElementById(field.id)
                if (fieldWrapper) {
                    const textEl = fieldWrapper.querySelector('.field-text') as HTMLElement
                    if (textEl) {
                        if (field.multiline) {
                            textEl.style.whiteSpace = 'pre-wrap'
                            textEl.style.alignItems = 'flex-start'
                            textEl.style.overflow = 'hidden'
                        } else {
                            textEl.style.whiteSpace = 'nowrap'
                            textEl.style.alignItems = 'center'
                            textEl.style.overflow = 'hidden'
                        }
                    }
                }
            })
        }
    } else if (field.type === 'checkbox' || field.type === 'radio') {
        const propCheckedBtn = document.getElementById('propCheckedBtn') as HTMLButtonElement

        propCheckedBtn.addEventListener('click', () => {
            field.checked = !field.checked

            // Update Toggle Button UI
            const span = propCheckedBtn.querySelector('span')
            if (field.checked) {
                propCheckedBtn.classList.remove('bg-gray-500')
                propCheckedBtn.classList.add('bg-indigo-600')
                span?.classList.remove('translate-x-0')
                span?.classList.add('translate-x-6')
            } else {
                propCheckedBtn.classList.remove('bg-indigo-600')
                propCheckedBtn.classList.add('bg-gray-500')
                span?.classList.remove('translate-x-6')
                span?.classList.add('translate-x-0')
            }

            // Update Canvas UI
            const fieldWrapper = document.getElementById(field.id)
            if (fieldWrapper) {
                const contentEl = fieldWrapper.querySelector('.field-content') as HTMLElement
                if (contentEl) {
                    if (field.type === 'checkbox') {
                        contentEl.innerHTML = field.checked ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full p-1"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''
                    } else {
                        contentEl.innerHTML = field.checked ? '<div class="w-3/4 h-3/4 bg-black rounded-full"></div>' : ''
                    }
                }
            }
        })

        if (field.type === 'radio') {
            const propGroupName = document.getElementById('propGroupName') as HTMLInputElement
            const propExportValue = document.getElementById('propExportValue') as HTMLInputElement

            propGroupName.addEventListener('input', (e) => {
                field.groupName = (e.target as HTMLInputElement).value
            })
            propExportValue.addEventListener('input', (e) => {
                field.exportValue = (e.target as HTMLInputElement).value
            })
        }
    } else if (field.type === 'dropdown' || field.type === 'optionlist') {
        const propOptions = document.getElementById('propOptions') as HTMLTextAreaElement
        propOptions.addEventListener('input', (e) => {
            // We split by newline OR comma for the actual options array
            const val = (e.target as HTMLTextAreaElement).value
            field.options = val.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0)

            const propSelectedOption = document.getElementById('propSelectedOption') as HTMLSelectElement
            if (propSelectedOption) {
                const currentVal = field.defaultValue
                propSelectedOption.innerHTML = '<option value="">None</option>' +
                    field.options?.map(opt => `<option value="${opt}" ${currentVal === opt ? 'selected' : ''}>${opt}</option>`).join('')

                if (currentVal && field.options && !field.options.includes(currentVal)) {
                    field.defaultValue = ''
                    propSelectedOption.value = ''
                }
            }

            renderField(field)
        })

        const propSelectedOption = document.getElementById('propSelectedOption') as HTMLSelectElement
        propSelectedOption.addEventListener('change', (e) => {
            field.defaultValue = (e.target as HTMLSelectElement).value

            // Update visual on canvas
            renderField(field)
        })
    } else if (field.type === 'button') {
        const propLabel = document.getElementById('propLabel') as HTMLInputElement
        propLabel.addEventListener('input', (e) => {
            field.label = (e.target as HTMLInputElement).value
            const fieldWrapper = document.getElementById(field.id)
            if (fieldWrapper) {
                const contentEl = fieldWrapper.querySelector('.field-content') as HTMLElement
                if (contentEl) contentEl.textContent = field.label || 'Button'
            }
        })

        const propAction = document.getElementById('propAction') as HTMLSelectElement
        const propUrlContainer = document.getElementById('propUrlContainer') as HTMLDivElement
        const propJsContainer = document.getElementById('propJsContainer') as HTMLDivElement
        const propShowHideContainer = document.getElementById('propShowHideContainer') as HTMLDivElement

        propAction.addEventListener('change', (e) => {
            field.action = (e.target as HTMLSelectElement).value as any

            // Show/hide containers
            propUrlContainer.classList.add('hidden')
            propJsContainer.classList.add('hidden')
            propShowHideContainer.classList.add('hidden')

            if (field.action === 'url') {
                propUrlContainer.classList.remove('hidden')
            } else if (field.action === 'js') {
                propJsContainer.classList.remove('hidden')
            } else if (field.action === 'showHide') {
                propShowHideContainer.classList.remove('hidden')
            }
        })

        const propActionUrl = document.getElementById('propActionUrl') as HTMLInputElement
        propActionUrl.addEventListener('input', (e) => {
            field.actionUrl = (e.target as HTMLInputElement).value
        })

        const propJsScript = document.getElementById('propJsScript') as HTMLTextAreaElement
        if (propJsScript) {
            propJsScript.addEventListener('input', (e) => {
                field.jsScript = (e.target as HTMLTextAreaElement).value
            })
        }

        const propTargetField = document.getElementById('propTargetField') as HTMLSelectElement
        if (propTargetField) {
            propTargetField.addEventListener('change', (e) => {
                field.targetFieldName = (e.target as HTMLSelectElement).value
            })
        }

        const propVisibilityAction = document.getElementById('propVisibilityAction') as HTMLSelectElement
        if (propVisibilityAction) {
            propVisibilityAction.addEventListener('change', (e) => {
                field.visibilityAction = (e.target as HTMLSelectElement).value as any
            })
        }
    } else if (field.type === 'signature') {
        // No specific listeners for signature fields yet
    } else if (field.type === 'date') {
        const propDateFormat = document.getElementById('propDateFormat') as HTMLSelectElement
        if (propDateFormat) {
            propDateFormat.addEventListener('change', (e) => {
                field.dateFormat = (e.target as HTMLSelectElement).value
                // Update canvas preview
                const fieldWrapper = document.getElementById(field.id)
                if (fieldWrapper) {
                    const textSpan = fieldWrapper.querySelector('.date-format-text') as HTMLElement
                    if (textSpan) {
                        textSpan.textContent = field.dateFormat
                    }
                }
                // Re-initialize lucide icons in the properties panel
                setTimeout(() => (window as any).lucide?.createIcons(), 0)
            })
        }
    } else if (field.type === 'image') {
        const propLabel = document.getElementById('propLabel') as HTMLInputElement
        propLabel.addEventListener('input', (e) => {
            field.label = (e.target as HTMLInputElement).value
            renderField(field)
        })
    }
}

// Hide properties panel
function hideProperties(): void {
    propertiesPanel.innerHTML = '<p class="text-gray-500 text-sm">Select a field to edit properties</p>'
}

// Delete field
function deleteField(field: FormField): void {
    const fieldEl = document.getElementById(field.id)
    if (fieldEl) {
        fieldEl.remove()
    }
    fields = fields.filter((f) => f.id !== field.id)
    deselectAll()
    updateFieldCount()
}

// Delete key handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedField) {
        deleteField(selectedField)
    } else if (e.key === 'Escape' && selectedToolType) {
        // Cancel tool selection
        toolItems.forEach(item => item.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-600'))
        selectedToolType = null
        canvas.style.cursor = 'default'
    }
})

// Update field count
function updateFieldCount(): void {
    fieldCountDisplay.textContent = fields.length.toString()
}

// Download PDF
downloadBtn.addEventListener('click', async () => {
    // Check for duplicate field names before generating PDF
    const nameCount = new Map<string, number>()
    const duplicates: string[] = []
    const conflictsWithPdf: string[] = []

    fields.forEach(field => {
        const count = nameCount.get(field.name) || 0
        nameCount.set(field.name, count + 1)

        if (existingFieldNames.has(field.name)) {
            if (field.type === 'radio' && existingRadioGroups.has(field.name)) {
            } else {
                conflictsWithPdf.push(field.name)
            }
        }
    })

    nameCount.forEach((count, name) => {
        if (count > 1) {
            const fieldsWithName = fields.filter(f => f.name === name)
            const allRadio = fieldsWithName.every(f => f.type === 'radio')

            if (!allRadio) {
                duplicates.push(name)
            }
        }
    })

    if (conflictsWithPdf.length > 0) {
        const conflictList = [...new Set(conflictsWithPdf)].map(name => `"${name}"`).join(', ')
        showModal(
            'Field Name Conflict',
            `The following field names already exist in the uploaded PDF: ${conflictList}. Please rename these fields before downloading.`,
            'error'
        )
        return
    }

    if (duplicates.length > 0) {
        const duplicateList = duplicates.map(name => `"${name}"`).join(', ')
        showModal(
            'Duplicate Field Names',
            `The following field names are used more than once: ${duplicateList}. Please rename these fields to use unique names before downloading.`,
            'error'
        )
        return
    }

    if (fields.length === 0) {
        alert('Please add at least one field before downloading.')
        return
    }

    if (pages.length === 0) {
        alert('No pages found. Please create a blank PDF or upload one.')
        return
    }

    try {
        let pdfDoc: PDFDocument

        if (uploadedPdfDoc) {
            pdfDoc = uploadedPdfDoc
        } else {
            pdfDoc = await PDFDocument.create()

            for (const pageData of pages) {
                pdfDoc.addPage([pageData.width, pageData.height])
            }
        }

        const form = pdfDoc.getForm()

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        // Set document metadata for accessibility
        pdfDoc.setTitle('Fillable Form')
        pdfDoc.setAuthor('BentoPDF')
        pdfDoc.setLanguage('en-US')

        const radioGroups = new Map<string, any>() // Track created radio groups

        for (const field of fields) {
            const pageData = pages[field.pageIndex]
            if (!pageData) continue

            const pdfPage = pdfDoc.getPage(field.pageIndex)
            const { height: pageHeight } = pdfPage.getSize()

            const scaleX = 1 / pdfViewerScale
            const scaleY = 1 / pdfViewerScale

            const adjustedX = field.x - pdfViewerOffset.x
            const adjustedY = field.y - pdfViewerOffset.y

            const x = adjustedX * scaleX
            const y = pageHeight - (adjustedY * scaleY) - (field.height * scaleY)
            const width = field.width * scaleX
            const height = field.height * scaleY

            console.log(`Field "${field.name}":`, {
                screenPos: { x: field.x, y: field.y },
                adjustedPos: { x: adjustedX, y: adjustedY },
                pdfPos: { x, y, width, height },
                metrics: { offset: pdfViewerOffset, scale: pdfViewerScale }
            })

            if (field.type === 'text') {
                const textField = form.createTextField(field.name)
                const rgbColor = hexToRgb(field.textColor)
                const borderRgb = hexToRgb(field.borderColor || '#000000')

                textField.addToPage(pdfPage, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    borderWidth: field.hideBorder ? 0 : 1,
                    borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
                    backgroundColor: rgb(1, 1, 1),
                    textColor: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                })

                textField.setText(field.defaultValue)
                textField.setFontSize(field.fontSize)

                // Set alignment
                if (field.alignment === 'center') {
                    textField.setAlignment(TextAlignment.Center)
                } else if (field.alignment === 'right') {
                    textField.setAlignment(TextAlignment.Right)
                } else {
                    textField.setAlignment(TextAlignment.Left)
                }

                // Handle combing
                if (field.combCells > 0) {
                    textField.setMaxLength(field.combCells)
                    textField.enableCombing()
                } else if (field.maxLength > 0) {
                    textField.setMaxLength(field.maxLength)
                }

                // Disable multiline to prevent RTL issues (unless explicitly enabled)
                if (!field.multiline) {
                    textField.disableMultiline()
                } else {
                    textField.enableMultiline()
                }

                // Common properties
                if (field.required) textField.enableRequired()
                if (field.readOnly) textField.enableReadOnly()
                if (field.tooltip) {
                    textField.acroField.getWidgets().forEach(widget => {
                        widget.dict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                    })
                }

            } else if (field.type === 'checkbox') {
                const checkBox = form.createCheckBox(field.name)
                const borderRgb = hexToRgb(field.borderColor || '#000000')
                checkBox.addToPage(pdfPage, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    borderWidth: field.hideBorder ? 0 : 1,
                    borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
                    backgroundColor: rgb(1, 1, 1),
                })
                if (field.checked) checkBox.check()
                if (field.required) checkBox.enableRequired()
                if (field.readOnly) checkBox.enableReadOnly()
                if (field.tooltip) {
                    checkBox.acroField.getWidgets().forEach(widget => {
                        widget.dict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                    })
                }

            } else if (field.type === 'radio') {
                const groupName = field.name
                let radioGroup

                if (radioGroups.has(groupName)) {
                    radioGroup = radioGroups.get(groupName)
                } else {
                    const existingField = form.getFieldMaybe(groupName)

                    if (existingField) {
                        radioGroup = existingField
                        radioGroups.set(groupName, radioGroup)
                        console.log(`Using existing radio group from PDF: ${groupName}`)
                    } else {
                        radioGroup = form.createRadioGroup(groupName)
                        radioGroups.set(groupName, radioGroup)
                        console.log(`Created new radio group: ${groupName}`)
                    }
                }

                const borderRgb = hexToRgb(field.borderColor || '#000000')
                radioGroup.addOptionToPage(field.exportValue || 'Yes', pdfPage as any, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    borderWidth: field.hideBorder ? 0 : 1,
                    borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
                    backgroundColor: rgb(1, 1, 1),
                })
                if (field.checked) radioGroup.select(field.exportValue || 'Yes')
                if (field.required) radioGroup.enableRequired()
                if (field.readOnly) radioGroup.enableReadOnly()
                if (field.tooltip) {
                    radioGroup.acroField.getWidgets().forEach((widget: any) => {
                        widget.dict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                    })
                }

            } else if (field.type === 'dropdown') {
                const dropdown = form.createDropdown(field.name)
                const borderRgb = hexToRgb(field.borderColor || '#000000')
                dropdown.addToPage(pdfPage, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    borderWidth: field.hideBorder ? 0 : 1,
                    borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
                    backgroundColor: rgb(1, 1, 1), // Light blue not supported in standard PDF appearance easily without streams
                })
                if (field.options) dropdown.setOptions(field.options)
                if (field.defaultValue && field.options?.includes(field.defaultValue)) dropdown.select(field.defaultValue)
                else if (field.options && field.options.length > 0) dropdown.select(field.options[0])

                const rgbColor = hexToRgb(field.textColor)
                dropdown.acroField.setFontSize(field.fontSize)
                dropdown.acroField.setDefaultAppearance(
                    `0 0 0 rg /Helv ${field.fontSize} Tf`
                )

                if (field.required) dropdown.enableRequired()
                if (field.readOnly) dropdown.enableReadOnly()
                if (field.tooltip) {
                    dropdown.acroField.getWidgets().forEach(widget => {
                        widget.dict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                    })
                }

            } else if (field.type === 'optionlist') {
                const optionList = form.createOptionList(field.name)
                const borderRgb = hexToRgb(field.borderColor || '#000000')
                optionList.addToPage(pdfPage, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    borderWidth: field.hideBorder ? 0 : 1,
                    borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
                    backgroundColor: rgb(1, 1, 1),
                })
                if (field.options) optionList.setOptions(field.options)
                if (field.defaultValue && field.options?.includes(field.defaultValue)) optionList.select(field.defaultValue)
                else if (field.options && field.options.length > 0) optionList.select(field.options[0])

                const rgbColor = hexToRgb(field.textColor)
                optionList.acroField.setFontSize(field.fontSize)
                optionList.acroField.setDefaultAppearance(
                    `0 0 0 rg /Helv ${field.fontSize} Tf`
                )

                if (field.required) optionList.enableRequired()
                if (field.readOnly) optionList.enableReadOnly()
                if (field.tooltip) {
                    optionList.acroField.getWidgets().forEach(widget => {
                        widget.dict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                    })
                }

            } else if (field.type === 'button') {
                const button = form.createButton(field.name)
                const borderRgb = hexToRgb(field.borderColor || '#000000')
                button.addToPage(field.label || 'Button', pdfPage, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    borderWidth: field.hideBorder ? 0 : 1,
                    borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
                    backgroundColor: rgb(0.8, 0.8, 0.8), // Light gray
                })

                // Add Action
                if (field.action && field.action !== 'none') {
                    const widgets = button.acroField.getWidgets()

                    widgets.forEach(widget => {
                        let actionDict: any

                        if (field.action === 'reset') {
                            actionDict = pdfDoc.context.obj({
                                Type: 'Action',
                                S: 'ResetForm'
                            })
                        } else if (field.action === 'print') {
                            // Print action using JavaScript
                            actionDict = pdfDoc.context.obj({
                                Type: 'Action',
                                S: 'JavaScript',
                                JS: 'print();'
                            })
                        } else if (field.action === 'url' && field.actionUrl) {
                            // Validate URL
                            let url = field.actionUrl.trim()
                            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                url = 'https://' + url
                            }

                            // Encode URL to handle special characters (RFC3986)
                            try {
                                url = encodeURI(url)
                            } catch (e) {
                                console.warn('Failed to encode URL:', e)
                            }

                            actionDict = pdfDoc.context.obj({
                                Type: 'Action',
                                S: 'URI',
                                URI: PDFString.of(url)
                            })
                        } else if (field.action === 'js' && field.jsScript) {
                            actionDict = pdfDoc.context.obj({
                                Type: 'Action',
                                S: 'JavaScript',
                                JS: field.jsScript
                            })
                        } else if (field.action === 'showHide' && field.targetFieldName) {
                            const target = field.targetFieldName
                            let script = ''

                            if (field.visibilityAction === 'show') {
                                script = `var f = this.getField("${target}"); if(f) f.display = display.visible;`
                            } else if (field.visibilityAction === 'hide') {
                                script = `var f = this.getField("${target}"); if(f) f.display = display.hidden;`
                            } else {
                                // Toggle
                                script = `var f = this.getField("${target}"); if(f) f.display = (f.display === display.visible) ? display.hidden : display.visible;`
                            }

                            actionDict = pdfDoc.context.obj({
                                Type: 'Action',
                                S: 'JavaScript',
                                JS: script
                            })
                        }

                        if (actionDict) {
                            widget.dict.set(PDFName.of('A'), actionDict)
                        }
                    })
                }

                if (field.tooltip) {
                    button.acroField.getWidgets().forEach(widget => {
                        widget.dict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                    })
                }
            } else if (field.type === 'date') {
                const dateField = form.createTextField(field.name)
                dateField.addToPage(pdfPage, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    borderWidth: 1,
                    borderColor: rgb(0, 0, 0),
                    backgroundColor: rgb(1, 1, 1),
                })

                // Add Date Format and Keystroke Actions to the FIELD (not widget)
                const dateFormat = field.dateFormat || 'mm/dd/yyyy'

                const formatAction = pdfDoc.context.obj({
                    Type: 'Action',
                    S: 'JavaScript',
                    JS: PDFString.of(`AFDate_FormatEx("${dateFormat}");`)
                })

                const keystrokeAction = pdfDoc.context.obj({
                    Type: 'Action',
                    S: 'JavaScript',
                    JS: PDFString.of(`AFDate_KeystrokeEx("${dateFormat}");`)
                })

                // Attach AA (Additional Actions) to the field dictionary
                const additionalActions = pdfDoc.context.obj({
                    F: formatAction,
                    K: keystrokeAction
                })
                dateField.acroField.dict.set(PDFName.of('AA'), additionalActions)

                if (field.required) dateField.enableRequired()
                if (field.readOnly) dateField.enableReadOnly()
                if (field.tooltip) {
                    dateField.acroField.getWidgets().forEach(widget => {
                        widget.dict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                    })
                }
            } else if (field.type === 'image') {
                const imageBtn = form.createButton(field.name)
                imageBtn.addToPage(field.label || 'Click to Upload Image', pdfPage, {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    borderWidth: 1,
                    borderColor: rgb(0, 0, 0),
                    backgroundColor: rgb(0.9, 0.9, 0.9),
                })

                // Add Import Icon Action
                const widgets = imageBtn.acroField.getWidgets()
                widgets.forEach(widget => {
                    const actionDict = pdfDoc.context.obj({
                        Type: 'Action',
                        S: 'JavaScript',
                        JS: 'event.target.buttonImportIcon();'
                    })
                    widget.dict.set(PDFName.of('A'), actionDict)

                    // Set Appearance Characteristics (MK) -> Text Position (TP) = 1 (Icon Only)
                    // This ensures the image replaces the text when uploaded
                    // IF (Icon Fit) -> SW: A (Always Scale), S: A (Anamorphic/Fill)
                    const mkDict = pdfDoc.context.obj({
                        TP: 1,
                        BG: [0.9, 0.9, 0.9], // Background color (Light Gray)
                        BC: [0, 0, 0],       // Border color (Black)
                        IF: {
                            SW: PDFName.of('A'),
                            S: PDFName.of('A'),
                            FB: true
                        }
                    })
                    widget.dict.set(PDFName.of('MK'), mkDict)
                })

                if (field.tooltip) {
                    imageBtn.acroField.getWidgets().forEach(widget => {
                        widget.dict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                    })
                }
            } else if (field.type === 'signature') {
                const context = pdfDoc.context

                // Create the signature field dictionary with FT = Sig
                const sigDict = context.obj({
                    FT: PDFName.of('Sig'),
                    T: PDFString.of(field.name),
                    Kids: [],
                }) as PDFDict
                const sigRef = context.register(sigDict)

                // Create the widget annotation for the signature field
                const widgetDict = context.obj({
                    Type: PDFName.of('Annot'),
                    Subtype: PDFName.of('Widget'),
                    Rect: [x, y, x + width, y + height],
                    F: 4, // Print flag
                    P: pdfPage.ref,
                    Parent: sigRef,
                }) as PDFDict

                // Add border and background appearance
                const borderStyle = context.obj({
                    W: 1, // Border width
                    S: PDFName.of('S'), // Solid border
                }) as PDFDict
                widgetDict.set(PDFName.of('BS'), borderStyle)
                widgetDict.set(PDFName.of('BC'), context.obj([0, 0, 0])) // Border color (black)
                widgetDict.set(PDFName.of('BG'), context.obj([0.95, 0.95, 0.95])) // Background color

                const widgetRef = context.register(widgetDict)

                const kidsArray = sigDict.get(PDFName.of('Kids')) as PDFArray
                kidsArray.push(widgetRef)

                pdfPage.node.addAnnot(widgetRef)

                const acroForm = form.acroForm
                acroForm.addField(sigRef)

                // Add tooltip if specified
                if (field.tooltip) {
                    widgetDict.set(PDFName.of('TU'), PDFString.of(field.tooltip))
                }
            }
        }

        form.updateFieldAppearances(helveticaFont)

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
        downloadFile(blob, 'fillable-form.pdf')
        showModal('Success', 'Your PDF has been downloaded successfully.', 'info', () => {
            resetToInitial()
        }, 'Okay')
    } catch (error) {
        console.error('Error generating PDF:', error)
        const errorMessage = (error as Error).message

        // Check if it's a duplicate field name error
        if (errorMessage.includes('A field already exists with the specified name')) {
            // Extract the field name from the error message
            const match = errorMessage.match(/A field already exists with the specified name: "(.+?)"/)
            const fieldName = match ? match[1] : 'unknown'

            if (existingRadioGroups.has(fieldName)) {
                console.log(`Adding to existing radio group: ${fieldName}`)
            } else {
                showModal('Duplicate Field Name', `A field named "${fieldName}" already exists. Please rename this field to use a unique name before downloading.`, 'error')
            }
        } else {
            showModal('Error', 'Error generating PDF: ' + errorMessage, 'error')
        }
    }
})

// Back to tools button
const backToToolsBtns = document.querySelectorAll('[id^="back-to-tools"]') as NodeListOf<HTMLButtonElement>
backToToolsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        window.location.href = import.meta.env.BASE_URL
    })
})

function getPageDimensions(size: string): { width: number; height: number } {
    let dimensions: [number, number]
    switch (size) {
        case 'letter':
            dimensions = PageSizes.Letter
            break
        case 'a4':
            dimensions = PageSizes.A4
            break
        case 'a5':
            dimensions = PageSizes.A5
            break
        case 'legal':
            dimensions = PageSizes.Legal
            break
        case 'tabloid':
            dimensions = PageSizes.Tabloid
            break
        case 'a3':
            dimensions = PageSizes.A3
            break
        case 'custom':
            // Get custom dimensions from inputs
            const width = parseInt(customWidth.value) || 612
            const height = parseInt(customHeight.value) || 792
            return { width, height }
        default:
            dimensions = PageSizes.Letter
    }
    return { width: dimensions[0], height: dimensions[1] }
}

// Reset to initial state
function resetToInitial(): void {
    fields = []
    pages = []
    currentPageIndex = 0
    uploadedPdfDoc = null
    selectedField = null

    canvas.innerHTML = ''

    propertiesPanel.innerHTML = '<p class="text-gray-500 text-sm">Select a field to edit properties</p>'

    updateFieldCount()

    // Show upload area and hide tool container
    uploadArea.classList.remove('hidden')
    toolContainer.classList.add('hidden')
    pageSizeSelector.classList.add('hidden')
    setTimeout(() => createIcons({ icons }), 100)
}

function createBlankPage(): void {
    pages.push({
        index: pages.length,
        width: pageSize.width,
        height: pageSize.height
    })
    updatePageNavigation()
}

function switchToPage(pageIndex: number): void {
    if (pageIndex < 0 || pageIndex >= pages.length) return

    currentPageIndex = pageIndex
    renderCanvas()
    updatePageNavigation()

    // Deselect any selected field when switching pages
    deselectAll()
}

// Render the canvas for the current page
async function renderCanvas(): Promise<void> {
    const currentPage = pages[currentPageIndex]
    if (!currentPage) return

    // Fixed scale for better visibility
    let scale = 1.333

    currentScale = scale

    // Use actual PDF page dimensions (not scaled)
    const canvasWidth = currentPage.width * scale
    const canvasHeight = currentPage.height * scale

    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`

    canvas.innerHTML = ''

    if (uploadedPdfDoc) {
        try {
            const arrayBuffer = await uploadedPdfDoc.save()
            const blob = new Blob([arrayBuffer.buffer as ArrayBuffer], { type: 'application/pdf' })
            const blobUrl = URL.createObjectURL(blob)

            const iframe = document.createElement('iframe')
            iframe.src = `${import.meta.env.BASE_URL}pdfjs-viewer/viewer.html?file=${encodeURIComponent(blobUrl)}#page=${currentPageIndex + 1}&toolbar=0`
            iframe.style.width = '100%'
            iframe.style.height = `${canvasHeight}px`
            iframe.style.border = 'none'
            iframe.style.position = 'absolute'
            iframe.style.top = '0'
            iframe.style.left = '0'
            iframe.style.pointerEvents = 'none'
            iframe.style.opacity = '0.8'

            iframe.onload = () => {
                try {
                    const viewerWindow = iframe.contentWindow as any
                    if (viewerWindow && viewerWindow.PDFViewerApplication) {
                        const app = viewerWindow.PDFViewerApplication

                        const style = viewerWindow.document.createElement('style')
                        style.textContent = `
                            * {
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            html, body {
                                margin: 0 !important;
                                padding: 0 !important;
                                background-color: transparent !important;
                                overflow: hidden !important;
                            }
                            #toolbarContainer {
                                display: none !important;
                            }
                            #mainContainer {
                                top: 0 !important;
                                position: absolute !important;
                                left: 0 !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            #outerContainer {
                                background-color: transparent !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            #viewerContainer {
                                top: 0 !important;
                                background-color: transparent !important;
                                overflow: hidden !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            .toolbar {
                                display: none !important;
                            }
                            .pdfViewer {
                                padding: 0 !important;
                                margin: 0 !important;
                            }
                            .page {
                                margin: 0 !important;
                                padding: 0 !important;
                                border: none !important;
                                box-shadow: none !important;
                            }
                        `
                        viewerWindow.document.head.appendChild(style)

                        const checkRender = setInterval(() => {
                            if (app.pdfViewer && app.pdfViewer.pagesCount > 0) {
                                clearInterval(checkRender)

                                const pageContainer = viewerWindow.document.querySelector('.page')
                                if (pageContainer) {
                                    const initialRect = pageContainer.getBoundingClientRect()

                                    const offsetX = -initialRect.left
                                    const offsetY = -initialRect.top
                                    pageContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`

                                    setTimeout(() => {
                                        const rect = pageContainer.getBoundingClientRect()
                                        const style = viewerWindow.getComputedStyle(pageContainer)

                                        const borderLeft = parseFloat(style.borderLeftWidth) || 0
                                        const borderTop = parseFloat(style.borderTopWidth) || 0
                                        const borderRight = parseFloat(style.borderRightWidth) || 0

                                        pdfViewerOffset = {
                                            x: rect.left + borderLeft,
                                            y: rect.top + borderTop
                                        }

                                        const contentWidth = rect.width - borderLeft - borderRight
                                        pdfViewerScale = contentWidth / currentPage.width

                                        console.log('📏 Calibrated Metrics (force positioned):', {
                                            initialPosition: { left: initialRect.left, top: initialRect.top },
                                            appliedTransform: { x: offsetX, y: offsetY },
                                            finalRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
                                            computedBorders: { left: borderLeft, top: borderTop, right: borderRight },
                                            finalOffset: pdfViewerOffset,
                                            finalScale: pdfViewerScale,
                                            pdfDimensions: { width: currentPage.width, height: currentPage.height }
                                        })
                                    }, 50)
                                }
                            }
                        }, 100)
                    }
                } catch (e) {
                    console.error('Error accessing iframe content:', e)
                }
            }

            canvas.appendChild(iframe)

            console.log('Canvas dimensions:', { width: canvasWidth, height: canvasHeight, scale: currentScale })
            console.log('PDF page dimensions:', { width: currentPage.width, height: currentPage.height })
        } catch (error) {
            console.error('Error rendering PDF:', error)
        }
    }

    fields.filter(f => f.pageIndex === currentPageIndex).forEach(field => {
        renderField(field)
    })
}

function updatePageNavigation(): void {
    pageIndicator.textContent = `Page ${currentPageIndex + 1} of ${pages.length}`
    prevPageBtn.disabled = currentPageIndex === 0
    nextPageBtn.disabled = currentPageIndex === pages.length - 1
}

// Drag and drop handlers for upload area
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.classList.add('border-indigo-500', 'bg-gray-600')
})

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-indigo-500', 'bg-gray-600')
})

dropZone.addEventListener('drop', (e) => {
    e.preventDefault()
    dropZone.classList.remove('border-indigo-500', 'bg-gray-600')
    const files = e.dataTransfer?.files
    if (files && files.length > 0 && files[0].type === 'application/pdf') {
        handlePdfUpload(files[0])
    }
})

pdfFileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
        handlePdfUpload(file)
    }
})

blankPdfBtn.addEventListener('click', () => {
    pageSizeSelector.classList.remove('hidden')
})

pageSizeSelect.addEventListener('change', () => {
    if (pageSizeSelect.value === 'custom') {
        customDimensionsInput.classList.remove('hidden')
    } else {
        customDimensionsInput.classList.add('hidden')
    }
})

confirmBlankBtn.addEventListener('click', () => {
    const selectedSize = pageSizeSelect.value
    pageSize = getPageDimensions(selectedSize)

    createBlankPage()
    switchToPage(0)

    // Hide upload area and show tool container
    uploadArea.classList.add('hidden')
    toolContainer.classList.remove('hidden')
    setTimeout(() => createIcons({ icons }), 100)
})

async function handlePdfUpload(file: File) {
    try {
        const arrayBuffer = await file.arrayBuffer()
        uploadedPdfDoc = await PDFDocument.load(arrayBuffer)

        // Check for existing fields and update counter
        existingFieldNames.clear()
        try {
            const form = uploadedPdfDoc.getForm()
            const pdfFields = form.getFields()

            // console.log('📋 Found', pdfFields.length, 'existing fields in uploaded PDF')

            pdfFields.forEach(field => {
                const name = field.getName()
                existingFieldNames.add(name) // Track all existing field names

                if (field instanceof PDFRadioGroup) {
                    existingRadioGroups.add(name)
                }

                // console.log('  Field:', name, '| Type:', field.constructor.name)

                const match = name.match(/([a-zA-Z]+)_(\d+)/)
                if (match) {
                    const num = parseInt(match[2])
                    if (!isNaN(num) && num > fieldCounter) {
                        fieldCounter = num
                        console.log('    → Updated field counter to:', fieldCounter)
                    }
                }
            })

            // TODO@ALAM: DEBUGGER 
            // console.log('Field counter after upload:', fieldCounter)
            // console.log('Existing field names:', Array.from(existingFieldNames))
        } catch (e) {
            console.log('No form fields found or error reading fields:', e)
        }

        uploadedPdfjsDoc = await getPDFDocument({ data: arrayBuffer }).promise

        const pageCount = uploadedPdfDoc.getPageCount()
        pages = []

        for (let i = 0; i < pageCount; i++) {
            const page = uploadedPdfDoc.getPage(i)
            const { width, height } = page.getSize()

            pages.push({
                index: i,
                width,
                height,
                pdfPageData: undefined
            })
        }

        currentPageIndex = 0
        renderCanvas()
        updatePageNavigation()

        // Hide upload area and show tool container
        uploadArea.classList.add('hidden')
        toolContainer.classList.remove('hidden')

        // Init icons
        setTimeout(() => createIcons({ icons }), 100)
    } catch (error) {
        console.error('Error loading PDF:', error)
        showModal('Error', 'Error loading PDF file. Please try again with a valid PDF.', 'error')
    }
}

// Page navigation
prevPageBtn.addEventListener('click', () => {
    if (currentPageIndex > 0) {
        switchToPage(currentPageIndex - 1)
    }
})

nextPageBtn.addEventListener('click', () => {
    if (currentPageIndex < pages.length - 1) {
        switchToPage(currentPageIndex + 1)
    }
})

addPageBtn.addEventListener('click', () => {
    createBlankPage()
    switchToPage(pages.length - 1)
})

resetBtn.addEventListener('click', () => {
    if (fields.length > 0 || pages.length > 0) {
        if (confirm('Are you sure you want to reset? All your work will be lost.')) {
            resetToInitial()
        }
    } else {
        resetToInitial()
    }
})

// Custom Modal Logic
const errorModal = document.getElementById('errorModal')
const errorModalTitle = document.getElementById('errorModalTitle')
const errorModalMessage = document.getElementById('errorModalMessage')
const errorModalClose = document.getElementById('errorModalClose')

let modalCloseCallback: (() => void) | null = null

function showModal(title: string, message: string, type: 'error' | 'warning' | 'info' = 'error', onClose?: () => void, buttonText: string = 'Close') {
    if (!errorModal || !errorModalTitle || !errorModalMessage || !errorModalClose) return

    errorModalTitle.textContent = title
    errorModalMessage.textContent = message
    errorModalClose.textContent = buttonText

    modalCloseCallback = onClose || null
    errorModal.classList.remove('hidden')
}

if (errorModalClose) {
    errorModalClose.addEventListener('click', () => {
        errorModal?.classList.add('hidden')
        if (modalCloseCallback) {
            modalCloseCallback()
            modalCloseCallback = null
        }
    })
}

// Close modal on backdrop click
if (errorModal) {
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) {
            errorModal.classList.add('hidden')
            if (modalCloseCallback) {
                modalCloseCallback()
                modalCloseCallback = null
            }
        }
    })
}

initializeGlobalShortcuts()
