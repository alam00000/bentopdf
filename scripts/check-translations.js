#!/usr/bin/env node

/**
 * Translation Checker for BentoPDF
 * 
 * This script compares translation files across languages and reports:
 * - Missing keys (keys present in English but absent in other languages)
 * - Extra keys (keys present in other languages but not in English)
 * - Untranslated keys (keys with the same value as English)
 * 
 * Usage:
 *   node scripts/check-translations.js
 *   node scripts/check-translations.js --verbose
 *   node scripts/check-translations.js --lang=de
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../public/locales');
const REFERENCE_LANG = 'en';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
};

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const specificLang = args.find(arg => arg.startsWith('--lang='))?.split('=')[1];

/**
 * Flatten nested JSON object into dot notation
 * { a: { b: 'value' } } => { 'a.b': 'value' }
 */
function flattenObject(obj, prefix = '') {
    const flattened = {};

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(flattened, flattenObject(value, newKey));
        } else {
            flattened[newKey] = value;
        }
    }

    return flattened;
}

/**
 * Load and parse a translation file
 */
function loadTranslation(lang) {
    const filePath = path.join(LOCALES_DIR, lang, 'common.json');

    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`${colors.red}✗ Error parsing ${lang}/common.json:${colors.reset}`, error.message);
        return null;
    }
}

/**
 * Get all available languages
 */
function getAvailableLanguages() {
    if (!fs.existsSync(LOCALES_DIR)) {
        console.error(`${colors.red}✗ Locales directory not found: ${LOCALES_DIR}${colors.reset}`);
        process.exit(1);
    }

    return fs.readdirSync(LOCALES_DIR)
        .filter(item => {
            const itemPath = path.join(LOCALES_DIR, item);
            return fs.statSync(itemPath).isDirectory();
        })
        .filter(lang => {
            // Only include if common.json exists
            return fs.existsSync(path.join(LOCALES_DIR, lang, 'common.json'));
        });
}

/**
 * Compare two sets of keys and report differences
 */
function compareKeys(refKeys, targetKeys, refLang, targetLang, refFlat, targetFlat) {
    const missing = refKeys.filter(key => !targetKeys.includes(key));
    const extra = targetKeys.filter(key => !refKeys.includes(key));
    const untranslated = refKeys.filter(key =>
        targetKeys.includes(key) && refFlat[key] === targetFlat[key] && typeof refFlat[key] === 'string'
    );

    return { missing, extra, untranslated };
}

/**
 * Print section header
 */
function printHeader(text) {
    console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}${text}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Print section
 */
function printSection(title, items, color = colors.yellow) {
    if (items.length === 0) return;

    console.log(`${color}${title} (${items.length}):${colors.reset}`);
    items.forEach(item => {
        console.log(`  ${colors.dim}•${colors.reset} ${item}`);
    });
    console.log();
}

/**
 * Main function
 */
function main() {
    console.log(`${colors.blue}🌍 BentoPDF Translation Checker${colors.reset}\n`);

    const languages = getAvailableLanguages();

    if (languages.length === 0) {
        console.error(`${colors.red}✗ No translation files found in ${LOCALES_DIR}${colors.reset}`);
        process.exit(1);
    }

    // Load reference language (English)
    const refTranslation = loadTranslation(REFERENCE_LANG);
    if (!refTranslation) {
        console.error(`${colors.red}✗ Reference language (${REFERENCE_LANG}) not found${colors.reset}`);
        process.exit(1);
    }

    const refFlat = flattenObject(refTranslation);
    const refKeys = Object.keys(refFlat);

    console.log(`${colors.green}✓ Reference language (${REFERENCE_LANG}): ${refKeys.length} keys${colors.reset}`);
    console.log(`${colors.dim}  Available languages: ${languages.join(', ')}${colors.reset}\n`);

    // Filter languages to check
    const langsToCheck = specificLang
        ? languages.filter(lang => lang === specificLang)
        : languages.filter(lang => lang !== REFERENCE_LANG);

    if (langsToCheck.length === 0) {
        console.log(`${colors.yellow}⚠ No languages to check${colors.reset}`);
        process.exit(0);
    }

    let hasIssues = false;

    // Check each language
    for (const lang of langsToCheck) {
        printHeader(`Checking: ${lang.toUpperCase()}`);

        const translation = loadTranslation(lang);
        if (!translation) {
            hasIssues = true;
            continue;
        }

        const targetFlat = flattenObject(translation);
        const targetKeys = Object.keys(targetFlat);

        const { missing, extra, untranslated } = compareKeys(
            refKeys,
            targetKeys,
            REFERENCE_LANG,
            lang,
            refFlat,
            targetFlat
        );

        // Summary
        console.log(`${colors.dim}Total keys: ${targetKeys.length} / ${refKeys.length}${colors.reset}\n`);

        // Missing keys
        if (missing.length > 0) {
            hasIssues = true;
            printSection(`Missing Keys`, missing, colors.red);
        }

        // Extra keys
        if (extra.length > 0) {
            hasIssues = true;
            printSection(`Extra Keys (not in English)`, extra, colors.yellow);
        }

        // Untranslated keys (same as English)
        if (verbose && untranslated.length > 0) {
            printSection(`Possibly Untranslated (same as English)`, untranslated, colors.cyan);
        } else if (untranslated.length > 0) {
            console.log(`${colors.cyan}Possibly Untranslated: ${untranslated.length}${colors.reset}`);
            console.log(`${colors.dim}   (use --verbose to see details)${colors.reset}\n`);
        }

        // All good
        if (missing.length === 0 && extra.length === 0) {
            console.log(`${colors.green} No missing or extra keys!${colors.reset}\n`);
        }
    }

    // Final summary
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

    if (!hasIssues) {
        console.log(`${colors.green} All translations are in sync!${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.yellow} Issues found. Please review the output above.${colors.reset}\n`);
        process.exit(1);
    }
}

main();
