# Translation System Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Core Components](#core-components)
5. [How Translation Works](#how-translation-works)
6. [Adding New Languages](#adding-new-languages)
7. [Creating Translatable Elements](#creating-translatable-elements)
8. [Working with Translation Keys](#working-with-translation-keys)
9. [Dynamic Translations in JavaScript](#dynamic-translations-in-javascript)
10. [Translation Key Structure and Organization](#translation-key-structure-and-organization)
11. [Language Switcher Component](#language-switcher-component)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## Overview

BentoPDF uses **i18next** as its internationalization (i18n) library, combined with **i18next-browser-languagedetector** for automatic language detection. The system is designed to provide seamless multilingual support with client-side processing, ensuring translations are loaded instantly without server requests.

### Key Features
- Client-side translation processing
- Automatic language detection from browser/localStorage
- Support for HTML content translation
- Dynamic content translation via JavaScript
- Persistent language selection across sessions
- Zero network overhead after initial page load

### Currently Supported Languages
- **English (en)** - Default/Fallback language
- **Norwegian Bokmål (nb)** - Norwegian translation

---

## Architecture

The translation system follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    HTML Pages                           │
│  (index.html, about.html, etc.)                         │
│  - data-i18n attributes                                 │
│  - data-i18n-html attributes                            │
│  - data-i18n-placeholder attributes                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              i18n/index.ts                              │
│  - Initializes i18next                                  │
│  - Provides translation functions                       │
│  - Updates DOM elements with translations               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├──────────────────┬──────────────────────┐
                 ▼                  ▼                      ▼
┌──────────────────────┐  ┌──────────────────┐  ┌────────────────┐
│  Translation Files   │  │  Language        │  │  Main App      │
│  (JSON)              │  │  Switcher        │  │  (main.ts)     │
│  - en/translation    │  │  Component       │  │  - Tool        │
│  - nb/translation    │  │  - Desktop UI    │  │    Rendering   │
└──────────────────────┘  │  - Mobile UI     │  │  - Dynamic     │
                          └──────────────────┘  │    Content     │
                                                 └────────────────┘
```

---

## File Structure

```
src/
├── locales/                          # Translation files directory
│   ├── en/                           # English translations
│   │   └── translation.json          # English translation key-value pairs
│   └── nb/                           # Norwegian translations
│       └── translation.json          # Norwegian translation key-value pairs
│
├── js/
│   ├── i18n/
│   │   └── index.ts                  # i18n core configuration and utilities
│   │
│   ├── components/
│   │   └── languageSwitcher.ts       # Language switcher UI component
│   │
│   ├── main.ts                       # Application entry point
│   ├── ui.ts                         # UI utilities (includes translation helpers)
│   └── handlers/
│       └── toolSelectionHandler.ts   # Tool interface handler with translation support
│
└── types/
    └── globals.d.ts                  # TypeScript type definitions
```

---

## Core Components

### 1. i18n Configuration (`src/js/i18n/index.ts`)

This is the heart of the translation system. It initializes i18next with the necessary configuration.

```typescript
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../../locales/en/translation.json';
import nbTranslation from '../../locales/nb/translation.json';

export const initI18n = async () => {
  await i18next
    .use(LanguageDetector)
    .init({
      debug: false,                    // Set to true for debugging
      fallbackLng: 'en',               // Default language if detection fails
      supportedLngs: ['en', 'nb'],     // Supported language codes
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      resources: {
        en: { translation: enTranslation },
        nb: { translation: nbTranslation },
      },
      interpolation: {
        escapeValue: false,             // React/Vue handle escaping
      },
    });

  return i18next;
};
```

**Key Configuration Options:**

- `debug`: Enable console logging for translation lookups
- `fallbackLng`: Language to use when requested translation is missing
- `supportedLngs`: Array of language codes the app supports
- `detection.order`: Priority order for language detection (localStorage → browser settings → HTML lang attribute)
- `detection.caches`: Where to persist language selection
- `resources`: Translation file imports organized by language

### 2. Translation Functions

The module exports several functions for working with translations:

```typescript
// Change the current language
export const changeLanguage = async (lng: string) => {
  await i18next.changeLanguage(lng);
  updatePageTranslations();
};

// Get translation for a key
export const t = (key: string, options?: any) => {
  return i18next.t(key, options);
};

// Get current language code
export const getCurrentLanguage = () => {
  return i18next.language || 'en';
};

// Update all page elements with current language
export const updatePageTranslations = () => {
  // Updates elements with data-i18n attributes
  // Updates elements with data-i18n-html attributes
  // Updates placeholders, aria-labels, and title
};
```

### 3. Language Switcher Component (`src/js/components/languageSwitcher.ts`)

The language switcher provides UI elements for users to change languages. It includes both desktop and mobile versions.

**Component Features:**
- Desktop dropdown menu with globe icon
- Mobile button layout
- Automatic current language display
- Callback support for language change events
- Automatic icon rendering with Lucide

**Configuration:**
```typescript
const languages: LanguageOption[] = [
  { code: 'en', label: 'English', displayCode: 'EN' },
  { code: 'nb', label: 'Norsk', displayCode: 'NB' }
];
```

---

## How Translation Works

### 1. Initialization Flow

```
Page Load
    │
    ▼
main.ts: initI18n()
    │
    ▼
i18next initializes with:
  - Language detection (localStorage → browser → fallback)
  - Translation file loading
  - Configuration setup
    │
    ▼
updatePageTranslations()
    │
    ▼
DOM elements updated with translations
    │
    ▼
initializeLanguageSwitcher()
    │
    ▼
Language switcher injected into navigation
    │
    ▼
Application ready
```

### 2. Translation Resolution

When a translation key is requested:

```
1. Check if key exists in current language (e.g., 'nb')
   └─> Found: Return translation
   └─> Not found: Continue to step 2

2. Check if key exists in fallback language ('en')
   └─> Found: Return fallback translation
   └─> Not found: Return the key itself (for debugging)
```

### 3. DOM Update Mechanism

The `updatePageTranslations()` function scans the DOM for special attributes:

```typescript
// Text content (innerText)
document.querySelectorAll('[data-i18n]').forEach((element) => {
  const key = element.getAttribute('data-i18n');
  if (key) {
    const translation = i18next.t(key);
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      (element as HTMLInputElement).placeholder = translation;
    } else {
      element.textContent = translation;
    }
  }
});

// HTML content (innerHTML)
document.querySelectorAll('[data-i18n-html]').forEach((element) => {
  const key = element.getAttribute('data-i18n-html');
  if (key) {
    element.innerHTML = i18next.t(key);
  }
});

// Placeholder attributes
document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
  const key = element.getAttribute('data-i18n-placeholder');
  if (key) {
    (element as HTMLInputElement).placeholder = i18next.t(key);
  }
});

// Aria-label attributes
document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
  const key = element.getAttribute('data-i18n-aria-label');
  if (key) {
    element.setAttribute('aria-label', i18next.t(key));
  }
});

// Document title
const titleKey = document.documentElement.getAttribute('data-i18n-title');
if (titleKey) {
  document.title = i18next.t(titleKey);
}
```

---

## Adding New Languages

Follow these steps to add support for a new language (example: German - 'de'):

### Step 1: Create Translation File

1. Create a new directory in `src/locales/` with the language code:
```
src/locales/de/
```

2. Copy the English translation file as a template:
```bash
# PowerShell
Copy-Item "src\locales\en\translation.json" "src\locales\de\translation.json"
```

3. Translate all values in `de/translation.json` (keep keys unchanged):
```json
{
  "nav": {
    "home": "Startseite",
    "about": "Über uns",
    "contact": "Kontakt",
    "allTools": "Alle Werkzeuge"
  },
  "hero": {
    "title": "Das <span class='marker-slanted'> PDF-Toolkit </span> für Datenschutz<span class='text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500'>.</span>",
    "subtitle": "Schnell, sicher und für immer kostenlos."
  }
}
```

### Step 2: Import and Register Translation

Update `src/js/i18n/index.ts`:

```typescript
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../../locales/en/translation.json';
import nbTranslation from '../../locales/nb/translation.json';
import deTranslation from '../../locales/de/translation.json'; // Add import

export const initI18n = async () => {
  await i18next
    .use(LanguageDetector)
    .init({
      debug: false,
      fallbackLng: 'en',
      supportedLngs: ['en', 'nb', 'de'], // Add 'de' here
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      resources: {
        en: { translation: enTranslation },
        nb: { translation: nbTranslation },
        de: { translation: deTranslation }, // Add German resources
      },
      interpolation: {
        escapeValue: false,
      },
    });

  return i18next;
};
```

### Step 3: Add Language to Switcher

Update `src/js/components/languageSwitcher.ts`:

```typescript
const languages: LanguageOption[] = [
  { code: 'en', label: 'English', displayCode: 'EN' },
  { code: 'nb', label: 'Norsk', displayCode: 'NB' },
  { code: 'de', label: 'Deutsch', displayCode: 'DE' } // Add German
];
```

### Step 4: Test the Implementation

1. Build the project:
```bash
npm run build
```

2. Start the development server:
```bash
npm run dev
```

3. Open the application and verify:
   - German appears in the language switcher
   - Switching to German displays translated content
   - Language preference persists after page reload
   - Fallback to English works for missing translations

---

## Creating Translatable Elements

### HTML Elements with `data-i18n`

Use `data-i18n` for plain text content:

```html
<!-- Navigation links -->
<a href="index.html" class="nav-link" data-i18n="nav.home">Home</a>
<a href="about.html" class="nav-link" data-i18n="nav.about">About</a>

<!-- Headings -->
<h1 data-i18n="hero.subtitle">Fast, Secure and Forever Free.</h1>

<!-- Buttons -->
<button data-i18n="hero.cta">Start Using - Forever Free</button>

<!-- Paragraphs -->
<p data-i18n="features.noSignup.description">
  Start instantly, no accounts or emails.
</p>
```

**Important:** The text inside the element is the fallback/default but will be replaced by the translation.

### HTML Elements with `data-i18n-html`

Use `data-i18n-html` when the translation contains HTML markup:

```html
<!-- Hero title with styled spans -->
<h1 data-i18n-html="hero.title">
  The <span class='marker-slanted'> PDF Toolkit </span> built for privacy.
</h1>

<!-- Content with links -->
<p data-i18n-html="faq.q8.answer">
  We use Simple Analytics...
</p>
```

**Translation file:**
```json
{
  "hero": {
    "title": "The <span class='marker-slanted'> PDF Toolkit </span> built for privacy<span class='text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500'>.</span>"
  },
  "faq": {
    "q8": {
      "answer": "We use <a href='https://simpleanalytics.com' class='text-indigo-400 hover:underline'>Simple Analytics</a>..."
    }
  }
}
```

### Input Placeholders with `data-i18n-placeholder`

Use `data-i18n-placeholder` for input/textarea placeholder text:

```html
<input 
  type="text" 
  data-i18n-placeholder="tools.searchPlaceholder"
  placeholder="Search for a tool..."
  class="w-full px-4 py-2"
/>
```

**Translation file:**
```json
{
  "tools": {
    "searchPlaceholder": "Search for a tool (e.g., 'split', 'organize'...)"
  }
}
```

### Aria Labels with `data-i18n-aria-label`

Use `data-i18n-aria-label` for accessibility attributes:

```html
<button 
  id="mobile-menu-button"
  aria-label="Open main menu"
  data-i18n-aria-label="nav.openMenu"
>
  <!-- Button content -->
</button>
```

**Translation file:**
```json
{
  "nav": {
    "openMenu": "Open main menu"
  }
}
```

### Document Title

Set the page title dynamically:

```html
<!DOCTYPE html>
<html lang="en" data-i18n-title="pageTitle">
<head>
  <title>BentoPDF - The PDF Toolkit</title>
</head>
```

**Translation file:**
```json
{
  "pageTitle": "BentoPDF - The PDF Toolkit"
}
```

---

## Working with Translation Keys

### Key Naming Conventions

Translation keys use dot notation to organize content hierarchically:

```json
{
  "section": {
    "subsection": {
      "element": "Translation value"
    }
  }
}
```

**Examples:**

```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "features": {
    "noSignup": {
      "title": "No Signup",
      "description": "Start instantly, no accounts or emails."
    }
  },
  "toolNames": {
    "merge": "Merge PDF",
    "split": "Split PDF"
  }
}
```

### Key Organization Strategy

Organize keys by:

1. **Page/Section**: Group by where they appear
   - `nav.*` - Navigation items
   - `hero.*` - Hero section
   - `features.*` - Features section
   - `footer.*` - Footer content

2. **Component Type**: Group by UI component
   - `toolNames.*` - Tool display names
   - `toolSubtitles.*` - Tool descriptions
   - `modals.*` - Modal dialog text
   - `alerts.*` - Alert messages

3. **Functionality**: Group by purpose
   - `fileUpload.*` - File upload interface
   - `toolInterfaces.*` - Tool-specific UI

**Best Practices:**

- Use descriptive names: `hero.subtitle` instead of `text1`
- Be consistent: Use the same structure across all languages
- Avoid deep nesting: Maximum 3-4 levels
- Use camelCase for multi-word keys: `noSignup` not `no-signup`
- Group related items: All tool names under `toolNames.*`

### Special Characters in Keys

Keys should:
- Contain only alphanumeric characters
- Use camelCase for readability
- Avoid spaces, hyphens, or special characters in key names

**Good:**
```json
{
  "features": {
    "noSignup": "No Signup",
    "lightningFast": "Lightning Fast"
  }
}
```

**Bad:**
```json
{
  "features": {
    "no-signup": "No Signup",
    "Lightning Fast": "Lightning Fast"
  }
}
```

---

## Dynamic Translations in JavaScript

### Importing Translation Function

Import the `t` function from the i18n module:

```typescript
import { t } from './i18n/index.js';
```

### Basic Translation

Translate a simple key:

```typescript
const message = t('modals.processing');
// Returns: "Processing..."

const toolName = t('toolNames.merge');
// Returns: "Merge PDF"
```

### Checking Translation Availability

Check if a translation differs from the key (meaning it exists):

```typescript
const categoryKey = `categories.${category.name.toLowerCase()}`;
const translatedCategory = t(categoryKey);

// Use translation if available, otherwise use original text
const displayName = typeof translatedCategory === 'string' && 
                    translatedCategory !== categoryKey 
                    ? translatedCategory 
                    : category.name;
```

### Using Translations in UI Components

Example from `main.ts` - rendering tool cards with translations:

```typescript
import { t } from './i18n/index.js';

categories.forEach((category) => {
  // Translate category name
  const categoryKey = `categories.${category.name.toLowerCase().replace(/\s+/g, '')}`;
  const translatedCategory = t(categoryKey);
  title.textContent = typeof translatedCategory === 'string' && 
                      translatedCategory !== categoryKey 
                      ? translatedCategory 
                      : category.name;

  category.tools.forEach((tool) => {
    // Translate tool name
    const toolNameKey = `toolNames.${tool.id.replace(/-/g, '')}`;
    const translatedName = t(toolNameKey);
    toolName.textContent = typeof translatedName === 'string' && 
                           translatedName !== toolNameKey 
                           ? translatedName 
                           : tool.name;

    // Translate tool subtitle
    const toolSubtitleKey = `toolSubtitles.${tool.id.replace(/-/g, '')}`;
    const translatedSubtitle = t(toolSubtitleKey);
    toolSubtitle.textContent = typeof translatedSubtitle === 'string' && 
                               translatedSubtitle !== toolSubtitleKey 
                               ? translatedSubtitle 
                               : tool.subtitle;
  });
});
```

### Translating Alert Messages

Example from `ui.ts` - showing alerts with translation support:

```typescript
import { t } from './i18n/index.js';

export const showAlert = (title: any, message: any) => {
  // Check if title and message are translation keys
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

// Usage
showAlert('alerts.error', 'alerts.failedRenderPreviews');
// Or with direct text
showAlert('Error', 'Something went wrong');
```

### Dynamic Content After Page Load

When adding elements dynamically, call `updatePageTranslations()`:

```typescript
import { updatePageTranslations } from './i18n/index.js';

// Add new element to DOM
const element = document.createElement('div');
element.setAttribute('data-i18n', 'newContent.title');
element.textContent = 'Default Title';
document.body.appendChild(element);

// Update translations for the new element
updatePageTranslations();
```

### Tool Interface Translations

When switching to a tool interface, translations are automatically applied:

```typescript
export function setupToolInterface(toolId: any) {
  state.activeTool = toolId;
  dom.toolContent.innerHTML = toolTemplates[toolId]();
  updatePageTranslations(); // Apply translations to tool template
  createIcons({ icons });
  switchView('tool');
  // ... rest of setup
}
```

---

## Translation Key Structure and Organization

### Overview of Translation File Structure

The translation files (`src/locales/{lang}/translation.json`) are organized into logical sections to make managing translations easier. Understanding this structure is crucial for adding new features and maintaining consistency.

### Main Translation Sections

#### 1. Navigation and UI Elements (`nav`, `common`)

Basic UI elements and navigation items:

```json
{
  "nav": {
    "home": "Home",
    "tools": "Tools",
    "about": "About"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "save": "Save"
  }
}
```

**Usage in HTML:**
```html
<a href="/" data-i18n="nav.home">Home</a>
<button data-i18n="common.cancel">Cancel</button>
```

#### 2. File Upload Component (`fileUpload`)

Reusable file upload interface elements:

```json
{
  "fileUpload": {
    "clickToSelect": "Click to select a file",
    "orDragDrop": "or drag and drop",
    "singlePdf": "A single PDF file",
    "pdfsOrImages": "PDFs or Images",
    "filesNeverLeave": "Your files never leave your device.",
    "addMoreFiles": "Add More Files",
    "clearAll": "Clear All"
  }
}
```

**Usage in UI templates:**
```typescript
// In ui.ts file upload controls
<button id="add-more-btn" ...>
    <span data-i18n="fileUpload.addMoreFiles">Add More Files</span>
</button>
<button id="clear-files-btn" ...>
    <span data-i18n="fileUpload.clearAll">Clear All</span>
</button>
```

#### 3. Tool Interfaces (`toolInterfaces`)

Each tool has its own nested object with all UI elements:

```json
{
  "toolInterfaces": {
    "compress": {
      "heading": "Compress PDF",
      "description": "Reduce file size by choosing the compression method...",
      "compressionLevelLabel": "Compression Level",
      "compressionAlgorithmLabel": "Compression Algorithm",
      "algorithmVector": "Vector (For Text Heavy PDF)",
      "algorithmPhoton": "Photon (For Complex Images & Drawings)",
      "algorithmNote": "Choose 'Vector' for text based PDFs...",
      "levelBalanced": "Balanced (Recommended)",
      "levelHighQuality": "High Quality (Larger file)",
      "levelSmallSize": "Smallest Size (Lower quality)",
      "levelExtreme": "Extreme (Very low quality)",
      "processBtn": "Compress PDF"
    }
  }
}
```

**Usage in tool templates:**
```typescript
'compress': () => `
  <h2 data-i18n="toolInterfaces.compress.heading">Compress PDF</h2>
  <p data-i18n="toolInterfaces.compress.description">Reduce file size...</p>
  
  <label data-i18n="toolInterfaces.compress.compressionLevelLabel">
    Compression Level
  </label>
  <select id="compression-level">
    <option value="balanced" data-i18n="toolInterfaces.compress.levelBalanced">
      Balanced (Recommended)
    </option>
    <option value="high-quality" data-i18n="toolInterfaces.compress.levelHighQuality">
      High Quality (Larger file)
    </option>
  </select>
  
  <button data-i18n="toolInterfaces.compress.processBtn">Compress PDF</button>
`,
```

#### 4. Alert Messages (`alerts`)

System alerts and error messages displayed to users:

```json
{
  "alerts": {
    "error": "Error",
    "success": "Success",
    "warning": "Warning",
    "info": "Information",
    "uploadPdfFirst": "Please upload a PDF file first",
    "invalidFileType": "Invalid file type. Please upload a PDF.",
    "processingError": "An error occurred while processing your file",
    "downloadReady": "Your file is ready to download"
  }
}
```

**Usage in JavaScript:**
```typescript
import { t } from './i18n/index.js';
import { showAlert } from './ui.js';

// Using translation keys
showAlert(t('alerts.error'), t('alerts.uploadPdfFirst'));

// Or pass keys directly (if showAlert handles translation)
showAlert('alerts.error', 'alerts.uploadPdfFirst');
```

#### 5. HTML Page Content (`heroSection`, `aboutPage`, `faqPage`, etc.)

Complete page content for static HTML pages:

```json
{
  "heroSection": {
    "title": "Free Online PDF Tools",
    "subtitle": "Edit, convert, and optimize your PDFs...",
    "uploadBtn": "Get Started"
  },
  "aboutPage": {
    "title": "About BentoPDF",
    "mission": {
      "heading": "Our Mission",
      "text": "To provide free, privacy-focused PDF tools..."
    }
  },
  "faqPage": {
    "title": "Frequently Asked Questions",
    "q1": {
      "question": "Is BentoPDF really free?",
      "answer": "Yes! All our tools are completely free..."
    }
  }
}
```

**Usage in HTML pages:**
```html
<!-- index.html -->
<h1 data-i18n="heroSection.title">Free Online PDF Tools</h1>
<p data-i18n="heroSection.subtitle">Edit, convert, and optimize...</p>

<!-- about.html -->
<h1 data-i18n="aboutPage.title">About BentoPDF</h1>
<h2 data-i18n="aboutPage.mission.heading">Our Mission</h2>
<p data-i18n="aboutPage.mission.text">To provide free...</p>

<!-- faq.html -->
<h3 data-i18n="faqPage.q1.question">Is BentoPDF really free?</h3>
<p data-i18n="faqPage.q1.answer">Yes! All our tools...</p>
```

### Best Practices for Tool Interface Translation Keys

When creating a new tool interface, follow this consistent pattern:

```json
{
  "toolInterfaces": {
    "yourToolId": {
      // Main heading and description
      "heading": "Tool Name",
      "description": "Brief description of what the tool does",
      
      // Form labels
      "optionNameLabel": "Option Name",
      "anotherOptionLabel": "Another Option",
      
      // Select/dropdown options
      "optionValue1": "First Option",
      "optionValue2": "Second Option",
      
      // Help text and notes
      "helpText": "Additional instructions or information",
      "noteText": "Important note about the feature",
      
      // Button labels
      "processBtn": "Process & Download",
      "previewBtn": "Preview",
      "resetBtn": "Reset",
      
      // Status messages (if needed)
      "processingMsg": "Processing your file...",
      "completeMsg": "Processing complete!"
    }
  }
}
```

### Adding Translations for a New Tool - Complete Example

Let's walk through adding translations for a hypothetical "PDF Splitter" tool:

**Step 1: Add English translations**

```json
// src/locales/en/translation.json
{
  "toolInterfaces": {
    "pdfSplitter": {
      "heading": "Split PDF",
      "description": "Extract pages from a PDF using various methods.",
      "splitModeLabel": "Split Mode",
      "modeByPages": "Split by Page Range",
      "modeBySize": "Split by File Size",
      "modeEveryN": "Extract Every N Pages",
      "pageRangeLabel": "Page Range",
      "pageRangePlaceholder": "e.g., 1-5, 8, 10-15",
      "pageRangeHelp": "Enter page numbers separated by commas. Use hyphens for ranges.",
      "processBtn": "Split PDF"
    }
  }
}
```

**Step 2: Add Norwegian translations**

```json
// src/locales/nb/translation.json
{
  "toolInterfaces": {
    "pdfSplitter": {
      "heading": "Del PDF",
      "description": "Trekk ut sider fra en PDF ved hjelp av forskjellige metoder.",
      "splitModeLabel": "Delingsmodus",
      "modeByPages": "Del etter sideområde",
      "modeBySize": "Del etter filstørrelse",
      "modeEveryN": "Trekk ut hver N side",
      "pageRangeLabel": "Sideområde",
      "pageRangePlaceholder": "f.eks., 1-5, 8, 10-15",
      "pageRangeHelp": "Angi sidenumre adskilt med komma. Bruk bindestreker for områder.",
      "processBtn": "Del PDF"
    }
  }
}
```

**Step 3: Create tool template with translation attributes**

```typescript
// In ui.ts
export const toolTemplates: ToolTemplates = {
  'pdf-splitter': () => `
    <h2 class="text-2xl font-bold text-white mb-4" 
        data-i18n="toolInterfaces.pdfSplitter.heading">
      Split PDF
    </h2>
    
    <p class="mb-6 text-gray-400" 
       data-i18n="toolInterfaces.pdfSplitter.description">
      Extract pages from a PDF using various methods.
    </p>
    
    ${createFileInputHTML()}
    
    <div id="split-options" class="hidden mt-6 space-y-6">
      <div>
        <label for="split-mode" 
               class="block mb-2 text-sm font-medium text-gray-300" 
               data-i18n="toolInterfaces.pdfSplitter.splitModeLabel">
          Split Mode
        </label>
        
        <select id="split-mode" class="w-full bg-gray-700 border...">
          <option value="by-pages" 
                  data-i18n="toolInterfaces.pdfSplitter.modeByPages">
            Split by Page Range
          </option>
          <option value="by-size" 
                  data-i18n="toolInterfaces.pdfSplitter.modeBySize">
            Split by File Size
          </option>
          <option value="every-n" 
                  data-i18n="toolInterfaces.pdfSplitter.modeEveryN">
            Extract Every N Pages
          </option>
        </select>
      </div>
      
      <div id="page-range-section">
        <label for="page-range" 
               class="block mb-2 text-sm font-medium text-gray-300" 
               data-i18n="toolInterfaces.pdfSplitter.pageRangeLabel">
          Page Range
        </label>
        
        <input type="text" 
               id="page-range" 
               class="w-full bg-gray-700..." 
               data-i18n-placeholder="toolInterfaces.pdfSplitter.pageRangePlaceholder">
        
        <p class="mt-2 text-xs text-gray-400" 
           data-i18n="toolInterfaces.pdfSplitter.pageRangeHelp">
          Enter page numbers separated by commas. Use hyphens for ranges.
        </p>
      </div>
      
      <button id="process-btn" 
              class="btn-gradient w-full mt-4" 
              disabled 
              data-i18n="toolInterfaces.pdfSplitter.processBtn">
        Split PDF
      </button>
    </div>
  `,
  // ... other tools
};
```

### Common Translation Patterns

#### Pattern 1: Headings and Descriptions

Every tool should have these two keys:
```json
{
  "toolInterfaces": {
    "toolId": {
      "heading": "Tool Name",
      "description": "What the tool does"
    }
  }
}
```

#### Pattern 2: Form Controls

Labels, placeholders, and help text:
```json
{
  "fieldNameLabel": "Field Name",
  "fieldNamePlaceholder": "Enter value here...",
  "fieldNameHelp": "Additional instructions"
}
```

Applied to HTML:
```html
<label data-i18n="toolInterfaces.toolId.fieldNameLabel">Field Name</label>
<input data-i18n-placeholder="toolInterfaces.toolId.fieldNamePlaceholder">
<p data-i18n="toolInterfaces.toolId.fieldNameHelp">Additional instructions</p>
```

#### Pattern 3: Select/Dropdown Options

Each option gets its own translation key:
```json
{
  "optionLabel": "Label for the dropdown",
  "option1": "First Option",
  "option2": "Second Option",
  "option3": "Third Option"
}
```

Applied to HTML:
```html
<label data-i18n="toolInterfaces.toolId.optionLabel">Select an option</label>
<select>
  <option value="1" data-i18n="toolInterfaces.toolId.option1">First Option</option>
  <option value="2" data-i18n="toolInterfaces.toolId.option2">Second Option</option>
  <option value="3" data-i18n="toolInterfaces.toolId.option3">Third Option</option>
</select>
```

#### Pattern 4: Buttons

All buttons should have translation keys:
```json
{
  "processBtn": "Process & Download",
  "previewBtn": "Preview Changes",
  "cancelBtn": "Cancel",
  "resetBtn": "Reset to Default"
}
```

Applied to HTML:
```html
<button data-i18n="toolInterfaces.toolId.processBtn">Process & Download</button>
<button data-i18n="toolInterfaces.toolId.previewBtn">Preview Changes</button>
```

#### Pattern 5: Alert and Error Messages

Use the `alerts` section for reusable messages:
```json
{
  "alerts": {
    "uploadPdfFirst": "Please upload a PDF file first",
    "processingError": "An error occurred while processing",
    "invalidInput": "Please provide valid input"
  }
}
```

Used in JavaScript:
```typescript
import { t, showAlert } from './utils.js';

if (!pdfFile) {
  showAlert(t('alerts.error'), t('alerts.uploadPdfFirst'));
  return;
}
```

### HTML Content Translation Guidelines

For static HTML pages (about.html, faq.html, etc.):

1. **Organize by page and section:**
```json
{
  "aboutPage": {
    "title": "About Us",
    "intro": {
      "heading": "Introduction",
      "text": "Welcome to our platform..."
    },
    "features": {
      "heading": "Key Features",
      "feature1": "First feature description",
      "feature2": "Second feature description"
    }
  }
}
```

2. **Use data-i18n for simple text:**
```html
<h1 data-i18n="aboutPage.title">About Us</h1>
<h2 data-i18n="aboutPage.intro.heading">Introduction</h2>
<p data-i18n="aboutPage.intro.text">Welcome to our platform...</p>
```

3. **Use data-i18n-html for HTML content:**
```json
{
  "aboutPage": {
    "richContent": "This text has <strong>bold</strong> and <em>italic</em> formatting."
  }
}
```

```html
<p data-i18n-html="aboutPage.richContent">
  This text has <strong>bold</strong> and <em>italic</em> formatting.
</p>
```

### Testing Your Translations

After adding translations, verify they work:

1. **Check both language files have the same keys:**
```bash
# Run a comparison script
node scripts/compare-translations.js
```

2. **Test in the browser:**
- Load the tool/page
- Switch between languages using the language switcher
- Verify all text changes appropriately
- Check that no translation keys are displayed (like "toolInterfaces.toolId.heading")

3. **Check for common issues:**
- Missing `data-i18n` attributes on HTML elements
- Typos in translation keys
- Keys exist in one language but not the other
- HTML entities not properly escaped in JSON

### Quick Reference: Translation Checklist for New Tools

- [ ] Add `heading` key
- [ ] Add `description` key
- [ ] Add keys for all labels (`*Label`)
- [ ] Add keys for all placeholders (`*Placeholder`)
- [ ] Add keys for all help text (`*Help` or `*Note`)
- [ ] Add keys for all dropdown/select options
- [ ] Add keys for all buttons (`*Btn`)
- [ ] Add `data-i18n` attributes to all headings
- [ ] Add `data-i18n` attributes to all paragraphs
- [ ] Add `data-i18n` attributes to all labels
- [ ] Add `data-i18n-placeholder` to all inputs
- [ ] Add `data-i18n` attributes to all help text
- [ ] Add `data-i18n` attributes to all select options
- [ ] Add `data-i18n` attributes to all buttons
- [ ] Add translations to BOTH en and nb files
- [ ] Test language switching works correctly
- [ ] Verify no keys are displayed instead of text

---

## Language Switcher Component

### Component Architecture

The language switcher consists of three main parts:

1. **Desktop Switcher** - Dropdown menu in the main navigation
2. **Mobile Switcher** - Button layout in mobile menu
3. **Core Logic** - Language change handlers and callbacks

### Initialization

Initialize the switcher in your main application file:

```typescript
import { initializeLanguageSwitcher, onLanguageChange } from './components/languageSwitcher.js';

// Initialize both desktop and mobile switchers
initializeLanguageSwitcher();

// Register callback for language changes
onLanguageChange(() => {
  renderTools(); // Re-render dynamic content
  createIcons({ icons }); // Re-render icons
});
```

### Desktop Switcher

Injected into the desktop navigation:

```typescript
injectDesktopLanguageSwitcher('.hidden.md\\:flex.items-center.space-x-8');
```

**HTML Structure Generated:**
```html
<div class="relative language-selector">
  <button id="language-button" class="...">
    <i data-lucide="globe" class="w-4 h-4"></i>
    <span id="current-language">EN</span>
    <i data-lucide="chevron-down" class="w-4 h-4"></i>
  </button>
  <div id="language-dropdown" class="hidden ...">
    <div class="py-1" role="menu">
      <button class="language-option ..." data-lang="en">English</button>
      <button class="language-option ..." data-lang="nb">Norsk</button>
    </div>
  </div>
</div>
```

### Mobile Switcher

Injected into the mobile menu:

```typescript
injectMobileLanguageSwitcher('#mobile-menu .px-2');
```

**HTML Structure Generated:**
```html
<div class="pt-4 pb-2 border-t border-gray-700">
  <div class="flex items-center justify-center space-x-4">
    <button class="language-option ..." data-lang="en">
      <i data-lucide="globe" class="w-4 h-4"></i>
      <span>English</span>
    </button>
    <button class="language-option ..." data-lang="nb">
      <i data-lucide="globe" class="w-4 h-4"></i>
      <span>Norsk</span>
    </button>
  </div>
</div>
```

### Language Change Callback

Register a callback to execute custom logic when language changes:

```typescript
onLanguageChange(async (lang: string) => {
  console.log(`Language changed to: ${lang}`);
  
  // Re-render dynamic content
  renderTools();
  
  // Re-create icons
  createIcons({ icons });
  
  // Update any custom components
  updateCustomComponents();
});
```

### Customizing the Switcher

Add a new language to the switcher:

```typescript
const languages: LanguageOption[] = [
  { code: 'en', label: 'English', displayCode: 'EN' },
  { code: 'nb', label: 'Norsk', displayCode: 'NB' },
  { code: 'de', label: 'Deutsch', displayCode: 'DE' },
  { code: 'fr', label: 'Français', displayCode: 'FR' }
];
```

### Custom Injection Points

Inject the switcher into custom locations:

```typescript
// Desktop switcher in custom navigation
injectDesktopLanguageSwitcher('.my-custom-nav .menu-container');

// Mobile switcher in custom menu
injectMobileLanguageSwitcher('.mobile-drawer .menu-items');
```

---

## Best Practices

### 1. Translation File Management

**Keep Keys Consistent**
- Never change translation keys; only update values
- If you must change a key, update it in ALL language files simultaneously

**Maintain Alphabetical Order**
- Organize top-level keys alphabetically for easier maintenance
- Group related items together under parent keys

**Use Clear, Descriptive Keys**
```json
// Good
{
  "features": {
    "noSignup": {
      "title": "No Signup",
      "description": "Start instantly..."
    }
  }
}

// Bad
{
  "f": {
    "ns": {
      "t": "No Signup",
      "d": "Start instantly..."
    }
  }
}
```

### 2. Text Length Considerations

Different languages have different text lengths:

| Language | Expansion Factor |
|----------|------------------|
| English  | 1.0 (baseline)   |
| German   | 1.3x             |
| French   | 1.2x             |
| Norwegian| 1.1x             |
| Spanish  | 1.2x             |

**UI Design Tips:**
- Design with 30-40% extra space for text expansion
- Test with the longest language
- Use CSS `overflow` properties appropriately
- Avoid fixed widths for text containers

### 3. HTML in Translations

Use `data-i18n-html` sparingly and only when necessary:

```json
// Necessary - contains HTML markup
{
  "hero": {
    "title": "The <span class='marker-slanted'>PDF Toolkit</span>"
  }
}

// Unnecessary - plain text is sufficient
{
  "nav": {
    "home": "<span>Home</span>"  // Bad - use data-i18n instead
  }
}
```

### 4. Pluralization

i18next supports pluralization. Use suffixes `_one`, `_other`:

```json
{
  "file": "{{count}} file",
  "file_one": "{{count}} file",
  "file_other": "{{count}} files"
}
```

Usage:
```typescript
t('file', { count: 1 });  // "1 file"
t('file', { count: 5 });  // "5 files"
```

### 5. Interpolation

Use variables in translations:

```json
{
  "welcome": "Welcome, {{name}}!",
  "fileSize": "File size: {{size}} MB"
}
```

Usage:
```typescript
t('welcome', { name: 'John' });           // "Welcome, John!"
t('fileSize', { size: '2.5' });           // "File size: 2.5 MB"
```

### 6. Context-Specific Translations

When the same word has different meanings in different contexts:

```json
{
  "general": {
    "close": "Close"
  },
  "proximity": {
    "close": "Near"
  }
}
```

### 7. Accessibility

Always translate accessibility attributes:

```html
<button 
  aria-label="Close dialog"
  data-i18n-aria-label="dialogs.close"
>
  <i data-lucide="x"></i>
</button>
```

### 8. Testing Translations

Create a test page to verify all translations:

```typescript
// Test all translation keys are defined
const keys = [
  'nav.home',
  'nav.about',
  'hero.title',
  'features.noSignup.title'
];

keys.forEach(key => {
  const translation = t(key);
  if (translation === key) {
    console.error(`Missing translation: ${key}`);
  }
});
```

### 9. Performance Optimization

- Load only necessary translation files
- Consider lazy-loading for large translation sets
- Cache translations in localStorage (i18next does this automatically)

### 10. Version Control

- Commit translation files separately from code changes
- Use clear commit messages: "Add French translations for hero section"
- Review translation changes carefully in pull requests

---

## Troubleshooting

### Translation Not Showing

**Problem:** Element displays key instead of translated text

**Solutions:**

1. **Verify key exists in translation file:**
```json
// Check src/locales/en/translation.json
{
  "nav": {
    "home": "Home"  // Make sure this exists
  }
}
```

2. **Check attribute syntax:**
```html
<!-- Correct -->
<a data-i18n="nav.home">Home</a>

<!-- Wrong - missing quotes -->
<a data-i18n=nav.home>Home</a>

<!-- Wrong - wrong attribute name -->
<a data-translate="nav.home">Home</a>
```

3. **Verify updatePageTranslations() is called:**
```typescript
// After adding dynamic content
updatePageTranslations();
```

4. **Check browser console for errors:**
```javascript
// Enable debug mode in i18n/index.ts
debug: true,
```

### Language Not Changing

**Problem:** Clicking language switcher doesn't change language

**Solutions:**

1. **Verify language is registered:**
```typescript
// In i18n/index.ts
supportedLngs: ['en', 'nb'],  // Check your language is here
```

2. **Check language code matches:**
```typescript
// In languageSwitcher.ts
{ code: 'nb', label: 'Norsk', displayCode: 'NB' }
// 'code' must match supportedLngs array
```

3. **Clear localStorage:**
```javascript
// In browser console
localStorage.removeItem('i18nextLng');
location.reload();
```

### Placeholder Not Translating

**Problem:** Input placeholder not showing translated text

**Solution:**

Use `data-i18n-placeholder` instead of `data-i18n`:

```html
<!-- Correct -->
<input 
  type="text" 
  data-i18n-placeholder="tools.searchPlaceholder"
  placeholder="Search..."
/>

<!-- Wrong -->
<input 
  type="text" 
  data-i18n="tools.searchPlaceholder"
  placeholder="Search..."
/>
```

### HTML Not Rendering

**Problem:** HTML tags display as text

**Solution:**

Use `data-i18n-html` instead of `data-i18n`:

```html
<!-- Correct -->
<h1 data-i18n-html="hero.title">
  The <span class='marker'>Toolkit</span>
</h1>

<!-- Wrong - will show HTML tags as text -->
<h1 data-i18n="hero.title">
  The <span class='marker'>Toolkit</span>
</h1>
```

### New Language Not Appearing

**Problem:** Added language but it doesn't show in switcher

**Checklist:**

1. Translation file created: `src/locales/de/translation.json` ✓
2. Import added to `i18n/index.ts` ✓
3. Language added to `supportedLngs` array ✓
4. Language added to resources object ✓
5. Language added to switcher languages array ✓
6. Project rebuilt: `npm run build` ✓

### Icons Not Showing After Language Change

**Problem:** Lucide icons disappear after switching language

**Solution:**

Re-render icons after language change:

```typescript
import { createIcons, icons } from 'lucide';

onLanguageChange(() => {
  updatePageTranslations();
  createIcons({ icons });  // Re-render icons
});
```

### Dynamic Content Not Translating

**Problem:** JavaScript-generated content not translated

**Solution:**

Call `updatePageTranslations()` after adding elements:

```typescript
// Add element
const newElement = document.createElement('div');
newElement.setAttribute('data-i18n', 'myKey');
newElement.textContent = 'Fallback Text';
document.body.appendChild(newElement);

// Update translations
updatePageTranslations();
```

### Translation File Syntax Error

**Problem:** Translations not loading, console shows JSON error

**Solutions:**

1. **Validate JSON syntax:**
   - Use a JSON validator (https://jsonlint.com)
   - Check for missing commas
   - Check for trailing commas (not allowed in JSON)
   - Ensure all strings use double quotes

2. **Common JSON errors:**
```json
// Wrong - trailing comma
{
  "nav": {
    "home": "Home",  // Remove this comma
  }
}

// Wrong - single quotes
{
  'nav': {
    'home': 'Home'
  }
}

// Correct
{
  "nav": {
    "home": "Home"
  }
}
```

### Missing Translation Falls Back to English

**Problem:** Some translations show in English despite language being changed

**Expected Behavior:** This is correct! When a translation key doesn't exist in the current language, i18next falls back to the fallback language (English).

**Solution:**

Add the missing key to the current language's translation file.

### Debugging Translations

Enable debug mode to see translation lookups:

```typescript
// In i18n/index.ts
export const initI18n = async () => {
  await i18next
    .use(LanguageDetector)
    .init({
      debug: true,  // Enable this
      // ... rest of config
    });
};
```

Console output will show:
- Language detection results
- Translation key lookups
- Missing translations
- Fallback usage

---

## Summary

The BentoPDF translation system provides a robust, scalable solution for multilingual support:

1. **Easy to extend**: Add new languages by creating translation files and updating configuration
2. **Developer-friendly**: Simple API with `t()` function and data attributes
3. **User-friendly**: Automatic language detection and persistent preferences
4. **Performance-optimized**: Client-side processing with no server overhead
5. **Well-organized**: Clear file structure and naming conventions

By following this guide, you can:
- Add new languages to the application
- Create properly translatable UI elements
- Work with translation keys effectively
- Implement dynamic translations in JavaScript
- Customize the language switcher
- Troubleshoot common translation issues

For questions or issues, refer to the troubleshooting section or consult the i18next documentation at https://www.i18next.com.
