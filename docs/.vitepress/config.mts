import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "BentoPDF Docs",
    description: "Documentation for BentoPDF - The free, open-source, privacy-first PDF toolkit",
    base: '/docs/',

    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/images/favicon-no-bg.svg',

        nav: [
            { text: 'Home', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Tools', link: '/tools/' },
            { text: 'Self-Hosting', link: '/self-hosting/' },
            { text: 'Contributing', link: '/contributing' },
            { text: 'Commercial License', link: '/licensing' }
        ],

        sidebar: {
            '/tools/': [
                {
                    text: 'Tools Reference',
                    items: [
                        { text: 'Overview', link: '/tools/' }
                    ]
                }
            ],
            '/self-hosting/': [
                {
                    text: 'Self-Hosting Guide',
                    items: [
                        { text: 'Overview', link: '/self-hosting/' },
                        { text: 'Docker', link: '/self-hosting/docker' },
                        { text: 'Vercel', link: '/self-hosting/vercel' },
                        { text: 'Netlify', link: '/self-hosting/netlify' },
                        { text: 'Cloudflare Pages', link: '/self-hosting/cloudflare' },
                        { text: 'AWS S3 + CloudFront', link: '/self-hosting/aws' },
                        { text: 'Hostinger', link: '/self-hosting/hostinger' },
                        { text: 'Nginx', link: '/self-hosting/nginx' },
                        { text: 'Apache', link: '/self-hosting/apache' }
                    ]
                }
            ],
            '/': [
                {
                    text: 'Guide',
                    items: [
                        { text: 'Getting Started', link: '/getting-started' },
                        { text: 'Tools Reference', link: '/tools/' },
                        { text: 'Self-Hosting', link: '/self-hosting/' },
                        { text: 'Contributing', link: '/contributing' },
                        { text: 'Commercial License', link: '/licensing' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/alam00000/bentopdf' },
            { icon: 'discord', link: 'https://discord.gg/Bgq3Ay3f2w' }
        ],

        footer: {
            message: 'Dual-licensed under AGPL-3.0 and Commercial License.',
            copyright: 'Copyright © 2026 BentoPDF'
        },

        search: {
            provider: 'local'
        }
    }
})
