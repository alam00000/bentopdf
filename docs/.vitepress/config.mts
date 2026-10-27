import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { nav, sidebar } from './navigation.mjs'
import { DESCRIPTION, FOOTER_MESSAGE } from './i18n/theme-labels.mjs'
import { completeDocsLanguages } from '../../scripts/docs-languages.mjs'

const SITE_URL = 'https://www.bentopdf.com'

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const labelsDir = path.join(docsDir, '.vitepress', 'i18n')

const LANGUAGE_NAMES: Record<string, string> = {
    ar: 'العربية',
    be: 'Беларуская',
    ca: 'Català',
    da: 'Dansk',
    de: 'Deutsch',
    es: 'Español',
    fa: 'فارسی',
    fr: 'Français',
    id: 'Bahasa Indonesia',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    nl: 'Nederlands',
    pl: 'Polski',
    pt: 'Português',
    ru: 'Русский',
    sk: 'Slovenčina',
    sv: 'Svenska',
    tr: 'Türkçe',
    uk: 'Українська',
    vi: 'Tiếng Việt',
    zh: '简体中文',
    'zh-TW': '繁體中文'
}

const RTL_LANGUAGES = new Set(['ar', 'fa'])
const ENGLISH_ONLY_DOCS = new Set(['licensing'])

const { enabled, incomplete } = completeDocsLanguages(
    docsDir,
    Object.keys(LANGUAGE_NAMES),
    process.env.DOCS_LANGUAGES
)
for (const { lang, missing, total } of incomplete) {
    console.warn(`[docs] Skipping "${lang}": ${missing} of ${total} pages are not translated yet`)
}
const excluded = Object.keys(LANGUAGE_NAMES)
    .filter((lang) => !enabled.includes(lang))
    .map((lang) => `${lang}/**`)

type Labels = Record<string, string>

function readLabels(lang: string): Labels {
    const file = path.join(labelsDir, `${lang}.json`)
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
}

function localizedLink(link: string | undefined, lang: string) {
    return link && link.startsWith('/') ? `/${lang}${link}` : link
}

type LocalizableItem = {
    text?: string
    link?: string
    items?: LocalizableItem[]
}

function localizeItems<T extends LocalizableItem>(
    items: T[],
    lang: string,
    translate: (text: string) => string
): T[] {
    return items.map((item) => ({
        ...item,
        ...(item.text ? { text: translate(item.text) } : {}),
        ...(item.link ? { link: localizedLink(item.link, lang) } : {}),
        ...(item.items ? { items: localizeItems(item.items, lang, translate) } : {})
    }))
}

function localeThemeConfig(lang: string): DefaultTheme.Config {
    const labels = readLabels(lang)
    const translate = (text: string) => labels[text] || text
    return {
        nav: localizeItems(nav, lang, translate),
        sidebar: Object.fromEntries(
            Object.entries(sidebar).map(([base, items]) => [
                `/${lang}${base}`,
                localizeItems(items as DefaultTheme.SidebarItem[], lang, translate)
            ])
        ),
        footer: {
            message: translate(FOOTER_MESSAGE),
            copyright: 'Copyright © 2026 BentoPDF'
        },
        outline: { label: translate('On this page') },
        docFooter: {
            prev: translate('Previous page'),
            next: translate('Next page')
        },
        returnToTopLabel: translate('Return to top'),
        sidebarMenuLabel: translate('Menu'),
        darkModeSwitchLabel: translate('Appearance'),
        lightModeSwitchTitle: translate('Switch to light theme'),
        darkModeSwitchTitle: translate('Switch to dark theme'),
        skipToContentLabel: translate('Skip to content'),
        langMenuLabel: translate('Change language')
    }
}

function localeSearch(lang: string) {
    const labels = readLabels(lang)
    const translate = (text: string) => labels[text] || text
    return {
        translations: {
            button: {
                buttonText: translate('Search'),
                buttonAriaLabel: translate('Search')
            },
            modal: {
                displayDetails: translate('Display detailed list'),
                resetButtonTitle: translate('Reset search'),
                backButtonTitle: translate('Close search'),
                noResultsText: translate('No results for'),
                footer: {
                    selectText: translate('to select'),
                    navigateText: translate('to navigate'),
                    closeText: translate('to close')
                }
            }
        }
    }
}

const locales = Object.fromEntries(
    enabled.map((lang) => {
        const labels = readLabels(lang)
        return [
            lang,
            {
                label: LANGUAGE_NAMES[lang],
                lang,
                dir: RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr',
                link: `/${lang}/`,
                title: 'BentoPDF Docs',
                description: labels[DESCRIPTION] || DESCRIPTION,
                themeConfig: localeThemeConfig(lang)
            }
        ]
    })
)

function pageUrl(lang: string, pagePath: string) {
    const prefix = lang === 'en' ? '' : `/${lang}`
    const suffix = pagePath === 'index' ? '' : `/${pagePath.replace(/\/index$/, '')}`
    return `${SITE_URL}/docs${prefix}${suffix}`
}

export default defineConfig({
    title: "BentoPDF Docs",
    description: DESCRIPTION,
    base: '/docs/',
    cleanUrls: true,
    metaChunk: true,
    srcExclude: excluded,

    locales: {
        root: { label: 'English', lang: 'en-US' },
        ...locales
    },

    transformPageData(pageData) {
        const relPath = pageData.relativePath.replace(/\.md$/, '')
        const pageLang = enabled.find((lang) => relPath.startsWith(`${lang}/`))
        const pagePath = pageLang ? relPath.slice(pageLang.length + 1) : relPath
        const englishOnly = ENGLISH_ONLY_DOCS.has(pagePath)
        const canonicalPath = englishOnly ? pagePath : relPath
        const slug = canonicalPath === 'index' ? '' : canonicalPath.replace(/\/index$/, '')
        const canonicalUrl = slug ? `${SITE_URL}/docs/${slug}` : `${SITE_URL}/docs`
        pageData.frontmatter.head ??= []
        pageData.frontmatter.head.push(['link', { rel: 'canonical', href: canonicalUrl }])
        if (enabled.length === 0 || englishOnly) return
        for (const lang of ['en', ...enabled]) {
            const source = lang === 'en' ? pagePath : `${lang}/${pagePath}`
            if (!fs.existsSync(path.join(docsDir, `${source}.md`))) continue
            pageData.frontmatter.head.push([
                'link',
                { rel: 'alternate', hreflang: lang, href: pageUrl(lang, pagePath) }
            ])
        }
        pageData.frontmatter.head.push([
            'link',
            { rel: 'alternate', hreflang: 'x-default', href: pageUrl('en', pagePath) }
        ])
    },

    themeConfig: {
        logo: '/images/favicon-no-bg.svg',

        nav,

        sidebar,

        socialLinks: [
            { icon: 'github', link: 'https://github.com/alam00000/bentopdf' },
            { icon: 'discord', link: 'https://discord.gg/Bgq3Ay3f2w' }
        ],

        footer: {
            message: FOOTER_MESSAGE,
            copyright: 'Copyright © 2026 BentoPDF'
        },

        search: {
            provider: 'local',
            options: {
                locales: Object.fromEntries(
                    enabled.map((lang) => [lang, localeSearch(lang)])
                )
            }
        }
    }
})
