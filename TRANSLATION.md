# 🌍 Translation Guide for BentoPDF

This guide will help you add new languages or improve existing translations for BentoPDF.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Adding a New Language](#adding-a-new-language)
- [Translation File Structure](#translation-file-structure)
- [Where Translations Are Used](#where-translations-are-used)
- [Testing Your Translations](#testing-your-translations)
- [Translation Guidelines](#translation-guidelines)
- [Common Issues](#common-issues)

---

## Overview

BentoPDF uses **i18next** for internationalization (i18n). Currently supported languages:

- **English** (`en`) - Default
- **German** (`de`)
- **Vietnamese** (`vi`)

The app automatically detects the language from the URL path:
- `/en/` → English
- `/de/` → German
- `/vi/` → Vietnamese

---

## Quick Start

**To improve existing translations:**

1. Navigate to `public/locales/{language}/common.json`
2. Find the key you want to update
3. Change the translation value
4. Save and test

**To add a new language (e.g., Spanish):**

1. Copy `public/locales/en/common.json` to `public/locales/es/common.json`
2. Translate all values in `es/common.json`
3. Add Spanish to `supportedLanguages` in `src/js/i18n/i18n.ts`
4. Add Spanish name to `languageNames` in `src/js/i18n/i18n.ts`
5. Test thoroughly

---

## Adding a New Language

Let's add **French** as an example:

### Step 1: Create Translation File

```bash
# Create the directory
mkdir -p public/locales/fr

# Copy the English template
cp public/locales/en/common.json public/locales/fr/common.json
```

### Step 2: Translate the JSON File

Open `public/locales/fr/common.json` and translate all the values:

```json
{
  "nav": {
    "home": "Accueil",
    "about": "À propos",
    "contact": "Contact",
    "allTools": "Tous les outils"
  },
  "hero": {
    "title": "Votre boîte à outils PDF gratuite et sécurisée",
    "subtitle": "Fusionnez, divisez, compressez et modifiez des PDF directement dans votre navigateur."
  }
  // ... continue translating all keys
}
```

⚠️ **Important**: Only translate the **values**, NOT the keys!

✅ **Correct:**
```json
"home": "Accueil"
```

❌ **Wrong:**
```json
"accueil": "Accueil"
```

### Step 3: Register the Language

Edit `src/js/i18n/i18n.ts`:

```typescript
// Add 'fr' to supported languages
export const supportedLanguages = ['en', 'de', 'fr'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

// Add French display name
export const languageNames: Record<SupportedLanguage, string> = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',  // ← Add this
};
```

### Step 4: Test Your Translation

```bash
# Start the dev server
npm run dev

# Visit the French version
# http://localhost:5173/fr/
```

---

## Translation File Structure

The `common.json` file is organized into logical sections:

```json
{
  "nav": {
    // Navigation menu items
  },
  "hero": {
    // Homepage hero section
  },
  "features": {
    // Features section
  },
  "tools": {
    // Tool names and descriptions
  },
  "upload": {
    // File upload UI
  },
  "settings": {
    // Settings modal and keyboard shortcuts
  },
  "faq": {
    // FAQ section
  },
  "footer": {
    // Footer links and text
  },
  "compliance": {
    // Security compliance information
  },
  "testimonials": {
    // User testimonials
  },
  "support": {
    // Support section
  },
  "alert": {
    // Alert and error messages
  }
}
```

### Key Naming Convention

- Use **camelCase** for keys: `"deletePage"` not `"delete_page"`
- Use **nested objects** for organization: `"nav.home"` is represented as:
  ```json
  {
    "nav": {
      "home": "Home"
    }
  }
  ```
- Be descriptive: `"shortcutsWarning"` is better than `"warning1"`

---

## Where Translations Are Used

### 1. HTML Templates (`data-i18n` attribute)

```html
<!-- Translation key: nav.home -->
<a href="/" data-i18n="nav.home">Home</a>
```

The `data-i18n` attribute tells i18next which translation to use.

### 2. Tool Definitions

Tool names and descriptions are defined in `src/js/config/tools.ts` and use a special namespace:

```typescript
{
  name: 'Merge PDF',  // Used for shortcuts only
  subtitle: 'Combine multiple PDFs into one file.',
}
```

In translations:
```json
{
  "tools": {
    "mergePdf": {
      "name": "PDF zusammenführen",
      "subtitle": "Mehrere PDFs in eine Datei kombinieren."
    }
  }
}
```

### 3. Dynamic JavaScript (`t()` function)

For translations that need to be applied dynamically:

```typescript
import { t } from './i18n/i18n';

const message = t('alert.error');
console.log(message); // "Error" or "Fehler" depending on language
```

### 4. Placeholders

For input placeholders:

```html
<input 
  type="text" 
  placeholder="Search for a tool..." 
  data-i18n-placeholder="tools.searchPlaceholder"
/>
```

In `common.json`:
```json
{
  "tools": {
    "searchPlaceholder": "Nach einem Tool suchen..."
  }
}
```

---

## Testing Your Translations

### Manual Testing

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Visit each language:**
   - English: `http://localhost:5173/en/`
   - German: `http://localhost:5173/de/`
   - Vietnamese: `http://localhost:5173/vi/`
   - Your new language: `http://localhost:5173/fr/`

3. **Check these pages:**
   - Homepage (`/`)
   - About page (`/about.html`)
   - Contact page (`/contact.html`)
   - FAQ page (`/faq.html`)
   - Tool pages (e.g., `/merge-pdf.html`)

4. **Test these interactions:**
   - Click the language switcher in the footer
   - Navigate between pages
   - Open the settings modal (click gear icon next to search)
   - Try a tool to see upload messages

### Automated Checks

Check for missing translations:

```bash
# This will show any missing keys
node scripts/check-translations.js
```

*(If this script doesn't exist, you may need to create it or manually compare JSON files)*

### Browser Testing

Test in different browsers:
- Chrome/Edge
- Firefox
- Safari

---

## Translation Guidelines

### 1. Keep the Tone Consistent

BentoPDF is **friendly, clear, and professional**. Match this tone in your translations.

✅ **Good:**
```json
"hero.title": "Ihr kostenloses und sicheres PDF-Toolkit"
```

❌ **Too formal:**
```json
"hero.title": "Ihr gebührenfreies und gesichertes Werkzeug für PDF-Dokumente"
```

### 2. Preserve Formatting

Some strings contain HTML or special characters:

```json
{
  "faq.analytics.answer": "We care about your privacy. BentoPDF does not track personal information. We use <a href=\"https://simpleanalytics.com\" class=\"text-indigo-400 hover:underline\" target=\"_blank\" rel=\"noopener noreferrer\">Simple Analytics</a> solely to see anonymous visit counts."
}
```

When translating, **keep the HTML tags intact**:

```json
{
  "faq.analytics.answer": "Wir schätzen Ihre Privatsphäre. BentoPDF verfolgt keine persönlichen Informationen. Wir verwenden <a href=\"https://simpleanalytics.com\" class=\"text-indigo-400 hover:underline\" target=\"_blank\" rel=\"noopener noreferrer\">Simple Analytics</a> ausschließlich, um anonyme Besucherzahlen zu sehen."
}
```

### 3. Handle Plurals and Gender

If your language has complex plural rules or gender distinctions, consult the [i18next pluralization guide](https://www.i18next.com/translation-function/plurals).

Example:
```json
{
  "pages": "page",
  "pages_plural": "pages"
}
```

### 4. Don't Translate Brand Names or Legal Terms

Keep these as-is:
- BentoPDF
- PDF
- GitHub
- Discord
- Chrome, Firefox, Safari, etc.
- Terms and Conditions
- Privacy Policy
- Licensing

### 5. Technical Terms

For technical terms, use commonly accepted translations in your language:
- "Merge" → "Fusionner" (French), "Zusammenführen" (German)
- "Split" → "Diviser" (French), "Teilen" (German)
- "Compress" → "Compresser" (French), "Komprimieren" (German)

If unsure, check how other PDF tools translate these terms in your language.

### 6. String Length

Some UI elements have limited space. Try to keep translations **similar in length** to the English version.

If a translation is much longer, test it visually to ensure it doesn't break the layout.

---

## Common Issues

### Issue: Translations Not Showing Up

**Solution:**
1. Clear your browser cache
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Check browser console for errors
4. Verify the JSON file is valid (no syntax errors)

### Issue: Some Text Still in English

**Possible causes:**
1. Missing translation key in your language file
2. Missing `data-i18n` attribute in HTML
3. Hardcoded text in JavaScript

**Solution:**
- Compare your language file with `en/common.json` to find missing keys
- Search the codebase for hardcoded strings

### Issue: JSON Syntax Error

**Symptoms:**
```
SyntaxError: Unexpected token } in JSON at position 1234
```

**Solution:**
- Use a JSON validator: https://jsonlint.com/
- Common mistakes:
  - Trailing comma after last item
  - Missing or extra quotes
  - Unescaped quotes inside strings (use `\"`)

### Issue: Language Switcher Not Showing New Language

**Solution:**
Make sure you added the language to both arrays in `i18n.ts`:
```typescript
export const supportedLanguages = ['en', 'de', 'fr']; // ← Add here
export const languageNames = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Français', // ← And here
};
```

---

## File Checklist

When adding a new language, make sure these files are updated:

- [ ] `public/locales/{lang}/common.json` - Main translation file
- [ ] `src/js/i18n/i18n.ts` - Add to `supportedLanguages` and `languageNames`
- [ ] Test all pages: homepage, about, contact, FAQ, tool pages
- [ ] Test settings modal and shortcuts
- [ ] Test language switcher in footer
- [ ] Verify URL routing works (`/{lang}/`)

---

## Getting Help

If you have questions or need help:

1. Check existing translations in `public/locales/de/common.json` for reference
2. Open an issue on [GitHub](https://github.com/alam00000/bentopdf/issues)
3. Join our [Discord server](https://discord.gg/Bgq3Ay3f2w)

---

## Contributing Your Translation

Once you've completed a translation:

1. **Test thoroughly** (see [Testing Your Translations](#testing-your-translations))
2. **Fork the repository** on GitHub
3. **Create a new branch**: `git checkout -b add-french-translation`
4. **Commit your changes**: `git commit -m "Add French translation"`
5. **Push to your fork**: `git push origin add-french-translation`
6. **Open a Pull Request** with:
   - Description of the language added
   - Screenshots showing the translation in action
   - Confirmation that you've tested all pages

Thank you for contributing to BentoPDF! 🎉

---

## Translation Progress

Current translation coverage:

| Language | Code | Status | Maintainer |
|----------|------|--------|------------|
| English  | `en` | ✅ Complete | Core team |
| German   | `de` | 🚧 In Progress | Core team |
| Vietnamese | `vi` | ✅ Complete | Community |
| Your Language | `??` | 🚧 In Progress | You? |

---

**Last Updated**: December 2025
