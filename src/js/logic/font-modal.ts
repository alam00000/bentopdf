import { parseFont, getDisplayName, generateFontSourceUrl, hasValidFontExtension } from '../utils/font-utils.js'

// Font modal elements
const addFontModal = document.getElementById('addFontModal') as HTMLDivElement
const addFontClose = document.getElementById('addFontClose') as HTMLButtonElement
const addFontCancel = document.getElementById('addFontCancel') as HTMLButtonElement
const addFontSubmit = document.getElementById('addFontSubmit') as HTMLButtonElement
const fontModalError = document.getElementById('fontModalError') as HTMLDivElement
const fontModalErrorTitle = document.getElementById('fontModalErrorTitle') as HTMLElement
const fontModalErrorMessage = document.getElementById('fontModalErrorMessage') as HTMLElement

// Tab elements
const googleFontTab = document.getElementById('googleFontTab') as HTMLDivElement
const fontUrlTab = document.getElementById('fontUrlTab') as HTMLDivElement
const uploadFontTab = document.getElementById('uploadFontTab') as HTMLDivElement

// Tab buttons
const tabGoogleFont = document.getElementById('tabGoogleFont') as HTMLButtonElement
const tabFontUrl = document.getElementById('tabFontUrl') as HTMLButtonElement
const tabUploadFont = document.getElementById('tabUploadFont') as HTMLButtonElement

// Form inputs
const googleFontName = document.getElementById('googleFontName') as HTMLInputElement
const fontUrl = document.getElementById('fontUrl') as HTMLInputElement
const fontUrlName = document.getElementById('fontUrlName') as HTMLInputElement
const uploadFontName = document.getElementById('uploadFontName') as HTMLInputElement
const fontFileInput = document.getElementById('fontFileInput') as HTMLInputElement
const uploadedFileName = document.getElementById('uploadedFileName') as HTMLElement

// Error message templates
const ERROR_MESSAGES = {
    // Input validation errors
    googleFontRequired: () => ({
        title: 'Input Required',
        message: 'Please enter a Google Font name.'
    }),
    urlAndNameRequired: () => ({
        title: 'Input Required',
        message: 'Please enter both font URL and font name.'
    }),
    fileAndNameRequired: () => ({
        title: 'Input Required',
        message: 'Please select a font file and enter a font name.'
    }),
    invalidUrl: () => ({
        title: 'Invalid URL',
        message: 'Please enter a valid URL (e.g., https://example.com/font.woff2)'
    }),
    googleCssUrl: () => ({
        title: 'Invalid Font URL',
        message: 'This appears to be a Google Fonts CSS URL, not a direct font file URL. Please use the "Google Font" tab instead, or find a direct font file URL.'
    }),

    // Google Font errors
    googleFontDownloadFailed: (fontName: string, familyName: string) => ({
        title: 'Font Download Failed',
        message: [
            `Unable to download "${fontName}"`,
            '',
            'The font could not be found in the fontsource CDN.',
            '',
            'Possible solutions:',
            '• Try a different font name (e.g., "Roboto", "Open Sans")',
            '• Use the "Font URL" tab with a direct font file link',
            '• Use the "Upload" tab to upload a font file',
            `• Check if "${familyName}" exists on fonts.google.com`
        ].join('\n')
    }),
    googleFontTimeout: (fontName: string) => ({
        title: 'Font Download Error',
        message: [
            `Failed to download "${fontName}"`,
            '',
            'Request timed out after 10 seconds.',
            '',
            'This could mean:',
            '• The server is very slow or unresponsive',
            '• The file is extremely large',
            '• Network connectivity issues',
            '',
            'Please try again or use a different font source.'
        ].join('\n')
    }),
    googleFontNetworkError: (fontName: string) => ({
        title: 'Font Download Error',
        message: [
            `Failed to download "${fontName}"`,
            '',
            'Network error occurred. This might be due to:',
            '• Internet connection issues',
            '• Firewall blocking font downloads',
            '• CDN services temporarily unavailable',
            '',
            'Try again or use the "Upload" tab instead.'
        ].join('\n')
    }),
    googleFontGenericError: (fontName: string, errorMsg: string) => ({
        title: 'Font Download Error',
        message: [
            `Failed to download "${fontName}"`,
            '',
            errorMsg,
            '',
            'Please verify the font name exists on Google Fonts and try again.'
        ].join('\n')
    }),

    // Font URL errors
    fontUrlTimeout: () => ({
        title: 'Font URL Error',
        message: [
            'Failed to download font from URL',
            '',
            'Request timed out after 10 seconds.',
            '',
            'This could mean:',
            '• The server is very slow or unresponsive',
            '• The file is extremely large',
            '• Network connectivity issues',
            '',
            'Please try again or use a different font source.'
        ].join('\n')
    }),
    fontUrlNetworkError: () => ({
        title: 'Font URL Error',
        message: [
            'Failed to download font from URL',
            '',
            'Network Error: Cannot reach the server.',
            '',
            'This could be due to:',
            '• Invalid or malformed URL',
            '• Server is down or doesn\'t exist',
            '• Internet connectivity issues',
            '• DNS resolution problems',
            '',
            'Please check the URL and try again.'
        ].join('\n')
    }),
    fontUrlCors: () => ({
        title: 'Font URL Error',
        message: [
            'Failed to download font from URL',
            '',
            'CORS Error: The server doesn\'t allow cross-origin access.',
            '',
            'This happens when the font server doesn\'t include proper CORS headers.',
            '',
            'Solutions:',
            '• Use the "Upload" tab to manually upload the font file',
            '• Try a CDN URL (e.g., jsDelivr, unpkg) that allows cross-origin access',
            '• Use the "Google Font" tab for Google Fonts',
            '• Download the font file and upload it manually'
        ].join('\n')
    }),
    fontUrlNotFound: () => ({
        title: 'Font URL Error',
        message: [
            'Failed to download font from URL',
            '',
            'File Not Found (404)',
            '',
            'The font file doesn\'t exist at this URL.',
            '',
            'Please check:',
            '• The URL is correct and complete',
            '• The file extension (.ttf, .woff2, etc.) is included',
            '• The server is accessible'
        ].join('\n')
    }),
    fontUrlAccessDenied: () => ({
        title: 'Font URL Error',
        message: [
            'Failed to download font from URL',
            '',
            'Access Denied (403)',
            '',
            'The server is blocking access to this font file.',
            '',
            'Please try:',
            '• A different font source',
            '• Using the "Upload" tab instead'
        ].join('\n')
    }),
    fontUrlGenericError: (errorMsg: string) => ({
        title: 'Font URL Error',
        message: [
            'Failed to download font from URL',
            '',
            errorMsg,
            '',
            'Please check the URL and try again.'
        ].join('\n')
    }),

    // Content validation errors
    htmlPage: () => ({
        title: 'Invalid Font File',
        message: 'This URL returns an HTML page, not a font file. Please check the URL and try again.'
    }),
    cssFile: () => ({
        title: 'Invalid Font File',
        message: 'This URL returns CSS, not a font file. Please use a direct link to a font file (.ttf, .woff2, etc.)'
    }),
    jsonFile: () => ({
        title: 'Invalid Font File',
        message: 'This URL returns JSON data, not a font file. Please use a direct link to a font file.'
    }),
    invalidFontFile: (hostname: string, contentType: string) => ({
        title: 'Invalid Font File',
        message: `This URL from "${hostname}" doesn't appear to be a font file.\n\nValid font files should:\n• End with .ttf, .otf, .woff, .woff2, or .eot\n• Have proper font MIME types\n\nReceived content-type: ${contentType || 'none'}`
    }),
    emptyFile: () => ({
        title: 'Invalid Font File',
        message: 'Downloaded file is empty'
    }),
    fileTooSmall: () => ({
        title: 'Invalid Font File',
        message: 'Downloaded file is too small to be a font'
    }),

    // Generic error
    unexpectedError: () => ({
        title: 'Unexpected Error',
        message: 'An error occurred while adding the font. Please try again.'
    })
} as const

// State variables
let currentActiveTab = 'google'
let selectedFontFile: File | null = null
let onFontAdded: ((fontName: string, fontBuffer: ArrayBuffer) => void) | null = null

/**
 * Initialize the font modal functionality
 */
export function initializeFontModal(onFontAddedCallback?: (fontName: string, fontBuffer: ArrayBuffer) => void): void {
    onFontAdded = onFontAddedCallback || null

    // Set up event listeners
    setupEventListeners()

    // Initialize default tab
    switchTab('google')
}

/**
 * Show the font modal
 */
export function showFontModal(): void {
    if (!addFontModal) return
    addFontModal.classList.remove('hidden')
}

/**
 * Hide the font modal
 */
export function hideFontModal(): void {
    if (!addFontModal) return
    addFontModal.classList.add('hidden')
    resetModalInputs()
}

/**
 * Show error message within the font modal
 */
function showFontModalError(title: string, message: string): void {
    if (!fontModalError || !fontModalErrorTitle || !fontModalErrorMessage) return

    fontModalErrorTitle.textContent = title
    fontModalErrorMessage.textContent = message
    fontModalError.classList.remove('hidden')

    // Scroll error into view
    fontModalError.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

/**
 * Hide error message within the font modal
 */
function hideFontModalError(): void {
    if (!fontModalError) return
    fontModalError.classList.add('hidden')
}

/**
 * Reset all modal inputs and state
 */
function resetModalInputs(): void {
    googleFontName.value = ''
    fontUrl.value = ''
    fontUrlName.value = ''
    uploadFontName.value = ''
    fontFileInput.value = ''
    selectedFontFile = null
    uploadedFileName.classList.add('hidden')
    uploadedFileName.textContent = ''
    hideFontModalError()

    // Reset button state
    if (addFontSubmit) {
        addFontSubmit.disabled = false
        addFontSubmit.textContent = 'Add Font'
        addFontSubmit.style.backgroundColor = ''
        addFontSubmit.style.borderColor = ''
        addFontSubmit.style.cursor = ''
        addFontSubmit.style.opacity = ''
    }
}

/**
 * Switch between modal tabs
 */
function switchTab(tab: string): void {
    currentActiveTab = tab

    // Clear any existing errors when switching tabs
    hideFontModalError()

    // Update tab buttons
    const tabs = [tabGoogleFont, tabFontUrl, tabUploadFont]
    const tabContents = [googleFontTab, fontUrlTab, uploadFontTab]

    tabs.forEach(t => {
        t.classList.remove('text-indigo-400', 'border-indigo-400', 'active')
        t.classList.add('text-gray-400', 'border-transparent')
    })

    tabContents.forEach(content => {
        content.classList.add('hidden')
    })

    // Activate current tab
    switch (tab) {
        case 'google':
            tabGoogleFont.classList.add('text-indigo-400', 'border-indigo-400', 'active')
            tabGoogleFont.classList.remove('text-gray-400', 'border-transparent')
            googleFontTab.classList.remove('hidden')
            break
        case 'url':
            tabFontUrl.classList.add('text-indigo-400', 'border-indigo-400', 'active')
            tabFontUrl.classList.remove('text-gray-400', 'border-transparent')
            fontUrlTab.classList.remove('hidden')
            break
        case 'upload':
            tabUploadFont.classList.add('text-indigo-400', 'border-indigo-400', 'active')
            tabUploadFont.classList.remove('text-gray-400', 'border-transparent')
            uploadFontTab.classList.remove('hidden')
            break
    }
}

/**
 * Handle font submission
 */
async function handleFontSubmit(): Promise<void> {
    try {
        addFontSubmit.disabled = true
        addFontSubmit.textContent = 'Adding...'
        addFontSubmit.style.cursor = 'not-allowed'
        addFontSubmit.style.opacity = '0.7'

        let fontBuffer: ArrayBuffer | null = null
        let fontName = ''

        switch (currentActiveTab) {
            case 'google':
                const inputFontName = googleFontName.value.trim()

                if (!inputFontName) {
                    const error = ERROR_MESSAGES.googleFontRequired()

                    showFontModalError(error.title, error.message)

                    return
                }

                try {
                    // Parse the font name with smart weight detection
                    const parsedFont = parseFont(inputFontName)
                    fontName = getDisplayName(parsedFont)

                    try {
                        const fontSourceUrl = generateFontSourceUrl(parsedFont)
                        const response = await fetch(fontSourceUrl)

                        if (response.ok) {
                            fontBuffer = await response.arrayBuffer()
                        }
                    } catch (error) {
                        // Font download failed
                    }

                    if (!fontBuffer) {
                        const error = ERROR_MESSAGES.googleFontDownloadFailed(inputFontName, parsedFont.family)
                        showFontModalError(error.title, error.message)
                        return
                    }

                } catch (error) {
                    let errorMsg

                    if (error.name === 'AbortError' || error.message.includes('aborted')) {
                        errorMsg = ERROR_MESSAGES.googleFontTimeout(inputFontName)
                    } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                        errorMsg = ERROR_MESSAGES.googleFontNetworkError(inputFontName)
                    } else if (error.message.includes('timeout')) {
                        errorMsg = ERROR_MESSAGES.googleFontTimeout(inputFontName)
                    } else {
                        errorMsg = ERROR_MESSAGES.googleFontGenericError(inputFontName, error.message)
                    }

                    showFontModalError(errorMsg.title, errorMsg.message)
                    return
                }
                break

            case 'url':
                const url = fontUrl.value.trim()

                fontName = fontUrlName.value.trim()

                if (!url || !fontName) {
                    const error = ERROR_MESSAGES.urlAndNameRequired()
                    showFontModalError(error.title, error.message)
                    return
                }

                // Validate URL format before making network request
                try {
                    new URL(url)
                } catch {
                    const error = ERROR_MESSAGES.invalidUrl()
                    showFontModalError(error.title, error.message)
                    return
                }

                // Check if user accidentally pasted a Google Fonts CSS URL BEFORE making request
                if (url.includes('fonts.googleapis.com') && url.includes('css')) {
                    const error = ERROR_MESSAGES.googleCssUrl()
                    showFontModalError(error.title, error.message)
                    return
                }

                try {
                    // Handle direct font file URL only with timeout
                    const controller = new AbortController()
                    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

                    const response = await fetch(url, {
                        signal: controller.signal
                    })

                    clearTimeout(timeoutId)

                    if (!response.ok) {
                        throw new Error(`Failed to fetch font file (${response.status})`)
                    }

                    // Validate that it's actually a font file
                    const contentType = response.headers.get('content-type') || ''
                    const hasValidExtension = hasValidFontExtension(url)
                    const hasValidContentType = contentType.includes('font/') ||
                                               contentType.includes('application/font') ||
                                               contentType.includes('application/x-font')

                    // Check for common non-font content types first
                    if (contentType.includes('text/html')) {
                        const error = ERROR_MESSAGES.htmlPage()
                        throw new Error(error.message)
                    }

                    if (contentType.includes('text/css')) {
                        const error = ERROR_MESSAGES.cssFile()
                        throw new Error(error.message)
                    }

                    if (contentType.includes('application/json')) {
                        const error = ERROR_MESSAGES.jsonFile()
                        throw new Error(error.message)
                    }

                    // Require either valid extension OR valid content type
                    if (!hasValidExtension && !hasValidContentType) {
                        const urlHost = new URL(url).hostname
                        const error = ERROR_MESSAGES.invalidFontFile(urlHost, contentType)
                        throw new Error(error.message)
                    }

                    fontBuffer = await response.arrayBuffer()

                    // Validate buffer size
                    if (fontBuffer.byteLength === 0) {
                        const error = ERROR_MESSAGES.emptyFile()
                        throw new Error(error.message)
                    }

                    if (fontBuffer.byteLength < 1000) {
                        const error = ERROR_MESSAGES.fileTooSmall()
                        throw new Error(error.message)
                    }

                } catch (error) {
                    let errorMsg

                    if (error.name === 'AbortError' || error.message.includes('aborted')) {
                        errorMsg = ERROR_MESSAGES.fontUrlTimeout()
                    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                        errorMsg = ERROR_MESSAGES.fontUrlNetworkError()
                    } else if (error.message.includes('CORS')) {
                        errorMsg = ERROR_MESSAGES.fontUrlCors()
                    } else if (error.message.includes('404')) {
                        errorMsg = ERROR_MESSAGES.fontUrlNotFound()
                    } else if (error.message.includes('403')) {
                        errorMsg = ERROR_MESSAGES.fontUrlAccessDenied()
                    } else {
                        errorMsg = ERROR_MESSAGES.fontUrlGenericError(error.message)
                    }

                    showFontModalError(errorMsg.title, errorMsg.message)
                    return
                }
                break

            case 'upload':
                fontName = uploadFontName.value.trim()

                if (!selectedFontFile || !fontName) {
                    const error = ERROR_MESSAGES.fileAndNameRequired()
                    showFontModalError(error.title, error.message)
                    return
                }

                fontBuffer = await selectedFontFile.arrayBuffer()
                break
        }

        // If we got here, font was successfully downloaded/loaded
        if (fontBuffer && fontName) {
            // Show success state on button (keep it disabled to prevent double-clicks)
            addFontSubmit.disabled = true
            addFontSubmit.textContent = '✓ Added!'
            addFontSubmit.style.backgroundColor = '#16a34a' // green-600
            addFontSubmit.style.borderColor = '#16a34a'
            addFontSubmit.style.cursor = 'default'
            addFontSubmit.style.opacity = '1'

            // Call the callback to add the font to the form creator
            if (onFontAdded) onFontAdded(fontName, fontBuffer)

            // Hide modal after a short delay to show success state
            setTimeout(() => {
                hideFontModal()
            }, 800)

            // Don't reset button state here - let the success state show
            return
        }

    } catch (error) {
        console.error('Error adding font:', error)
        const errorMsg = ERROR_MESSAGES.unexpectedError()
        showFontModalError(errorMsg.title, errorMsg.message)
    } finally {
        // Only reset button state if we didn't succeed
        if (addFontSubmit.textContent !== '✓ Added!') {
            addFontSubmit.disabled = false
            addFontSubmit.textContent = 'Add Font'
        }
    }
}

/**
 * Set up all event listeners for the font modal
 */
function setupEventListeners(): void {
    // Tab switching
    if (tabGoogleFont) {
        tabGoogleFont.addEventListener('click', () => switchTab('google'))
    }

    if (tabFontUrl) {
        tabFontUrl.addEventListener('click', () => switchTab('url'))
    }

    if (tabUploadFont) {
        tabUploadFont.addEventListener('click', () => switchTab('upload'))
    }

    // File upload handling
    if (fontFileInput) {
        fontFileInput.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]

            if (!file) return

            selectedFontFile = file
            uploadedFileName.textContent = `Selected: ${file.name}`
            uploadedFileName.classList.remove('hidden')

            // Auto-populate font name from filename
            if (!uploadFontName.value) {
                const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
                uploadFontName.value = baseName.split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')
            }

            // Clear error when file is selected
            hideFontModalError()
        })
    }

    // Clear errors when users start typing in input fields
    if (googleFontName) {
        googleFontName.addEventListener('input', hideFontModalError)
    }

    if (fontUrl) {
        fontUrl.addEventListener('input', hideFontModalError)
    }

    if (fontUrlName) {
        fontUrlName.addEventListener('input', hideFontModalError)
    }

    if (uploadFontName) {
        uploadFontName.addEventListener('input', hideFontModalError)
    }

    // Modal event listeners
    if (addFontClose) {
        addFontClose.addEventListener('click', hideFontModal)
    }

    if (addFontCancel) {
        addFontCancel.addEventListener('click', hideFontModal)
    }

    if (addFontSubmit) {
        addFontSubmit.addEventListener('click', handleFontSubmit)
    }
}

