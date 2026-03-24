import { defineConfig } from 'vitepress'

export default defineConfig({
    title: "BentoPDF Docs",
    description: "Documentation for BentoPDF - The free, open-source, privacy-first PDF toolkit",
    base: '/docs/',

    themeConfig: {
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
                },
                {
                    text: 'Edit & Annotate',
                    collapsed: false,
                    items: [
                        { text: 'PDF Editor', link: '/tools/edit-pdf' },
                        { text: 'Edit Bookmarks', link: '/tools/bookmark' },
                        { text: 'Table of Contents', link: '/tools/table-of-contents' },
                        { text: 'Page Numbers', link: '/tools/page-numbers' },
                        { text: 'Add Page Labels', link: '/tools/add-page-labels' },
                        { text: 'Bates Numbering', link: '/tools/bates-numbering' },
                        { text: 'Add Watermark', link: '/tools/add-watermark' },
                        { text: 'Header & Footer', link: '/tools/header-footer' },
                        { text: 'Invert Colors', link: '/tools/invert-colors' },
                        { text: 'Scanner Effect', link: '/tools/scanner-effect' },
                        { text: 'Adjust Colors', link: '/tools/adjust-colors' },
                        { text: 'Background Color', link: '/tools/background-color' },
                        { text: 'Change Text Color', link: '/tools/text-color' },
                        { text: 'Sign PDF', link: '/tools/sign-pdf' },
                        { text: 'Add Stamps', link: '/tools/add-stamps' },
                        { text: 'Remove Annotations', link: '/tools/remove-annotations' },
                        { text: 'Crop PDF', link: '/tools/crop-pdf' },
                        { text: 'PDF Form Filler', link: '/tools/form-filler' },
                        { text: 'Create PDF Form', link: '/tools/form-creator' },
                        { text: 'Remove Blank Pages', link: '/tools/remove-blank-pages' }
                    ]
                },
                {
                    text: 'Convert to PDF',
                    collapsed: true,
                    items: [
                        { text: 'Images to PDF', link: '/tools/image-to-pdf' },
                        { text: 'JPG to PDF', link: '/tools/jpg-to-pdf' },
                        { text: 'PNG to PDF', link: '/tools/png-to-pdf' },
                        { text: 'WebP to PDF', link: '/tools/webp-to-pdf' },
                        { text: 'SVG to PDF', link: '/tools/svg-to-pdf' },
                        { text: 'BMP to PDF', link: '/tools/bmp-to-pdf' },
                        { text: 'HEIC to PDF', link: '/tools/heic-to-pdf' },
                        { text: 'TIFF to PDF', link: '/tools/tiff-to-pdf' },
                        { text: 'Text to PDF', link: '/tools/txt-to-pdf' },
                        { text: 'Markdown to PDF', link: '/tools/markdown-to-pdf' },
                        { text: 'JSON to PDF', link: '/tools/json-to-pdf' },
                        { text: 'ODT to PDF', link: '/tools/odt-to-pdf' },
                        { text: 'CSV to PDF', link: '/tools/csv-to-pdf' },
                        { text: 'RTF to PDF', link: '/tools/rtf-to-pdf' },
                        { text: 'Word to PDF', link: '/tools/word-to-pdf' },
                        { text: 'Excel to PDF', link: '/tools/excel-to-pdf' },
                        { text: 'PowerPoint to PDF', link: '/tools/powerpoint-to-pdf' },
                        { text: 'XPS to PDF', link: '/tools/xps-to-pdf' },
                        { text: 'MOBI to PDF', link: '/tools/mobi-to-pdf' },
                        { text: 'EPUB to PDF', link: '/tools/epub-to-pdf' },
                        { text: 'FB2 to PDF', link: '/tools/fb2-to-pdf' },
                        { text: 'CBZ to PDF', link: '/tools/cbz-to-pdf' },
                        { text: 'WPD to PDF', link: '/tools/wpd-to-pdf' },
                        { text: 'WPS to PDF', link: '/tools/wps-to-pdf' },
                        { text: 'XML to PDF', link: '/tools/xml-to-pdf' },
                        { text: 'ODG to PDF', link: '/tools/odg-to-pdf' },
                        { text: 'ODS to PDF', link: '/tools/ods-to-pdf' },
                        { text: 'ODP to PDF', link: '/tools/odp-to-pdf' },
                        { text: 'PUB to PDF', link: '/tools/pub-to-pdf' },
                        { text: 'VSD to PDF', link: '/tools/vsd-to-pdf' },
                        { text: 'PSD to PDF', link: '/tools/psd-to-pdf' },
                        { text: 'Email to PDF', link: '/tools/email-to-pdf' }
                    ]
                },
                {
                    text: 'Convert from PDF',
                    collapsed: true,
                    items: [
                        { text: 'PDF to JPG', link: '/tools/pdf-to-jpg' },
                        { text: 'PDF to PNG', link: '/tools/pdf-to-png' },
                        { text: 'PDF to WebP', link: '/tools/pdf-to-webp' },
                        { text: 'PDF to BMP', link: '/tools/pdf-to-bmp' },
                        { text: 'PDF to TIFF', link: '/tools/pdf-to-tiff' },
                        { text: 'PDF to CBZ', link: '/tools/pdf-to-cbz' },
                        { text: 'PDF to SVG', link: '/tools/pdf-to-svg' },
                        { text: 'PDF to CSV', link: '/tools/pdf-to-csv' },
                        { text: 'PDF to Excel', link: '/tools/pdf-to-excel' },
                        { text: 'PDF to Greyscale', link: '/tools/pdf-to-greyscale' },
                        { text: 'PDF to JSON', link: '/tools/pdf-to-json' },
                        { text: 'PDF to Word', link: '/tools/pdf-to-docx' },
                        { text: 'Extract Images', link: '/tools/extract-images' },
                        { text: 'PDF to Markdown', link: '/tools/pdf-to-markdown' },
                        { text: 'Prepare PDF for AI', link: '/tools/prepare-pdf-for-ai' },
                        { text: 'PDF to Text', link: '/tools/pdf-to-text' },
                        { text: 'Extract Tables', link: '/tools/extract-tables' }
                    ]
                },
                {
                    text: 'Organize & Manage',
                    collapsed: true,
                    items: [
                        { text: 'PDF Workflow Builder', link: '/tools/pdf-workflow' },
                        { text: 'PDF Multi Tool', link: '/tools/pdf-multi-tool' },
                        { text: 'OCR PDF', link: '/tools/ocr-pdf' },
                        { text: 'Merge PDF', link: '/tools/merge-pdf' },
                        { text: 'Alternate & Mix Pages', link: '/tools/alternate-merge' },
                        { text: 'Organize & Duplicate', link: '/tools/organize-pdf' },
                        { text: 'Add Attachments', link: '/tools/add-attachments' },
                        { text: 'Extract Attachments', link: '/tools/extract-attachments' },
                        { text: 'Edit Attachments', link: '/tools/edit-attachments' },
                        { text: 'PDF OCG', link: '/tools/pdf-layers' },
                        { text: 'Split PDF', link: '/tools/split-pdf' },
                        { text: 'Divide Pages', link: '/tools/divide-pages' },
                        { text: 'Extract Pages', link: '/tools/extract-pages' },
                        { text: 'Delete Pages', link: '/tools/delete-pages' },
                        { text: 'Add Blank Page', link: '/tools/add-blank-page' },
                        { text: 'Reverse Pages', link: '/tools/reverse-pages' },
                        { text: 'Rotate PDF', link: '/tools/rotate-pdf' },
                        { text: 'Rotate by Custom Degrees', link: '/tools/rotate-custom' },
                        { text: 'N-Up PDF', link: '/tools/n-up-pdf' },
                        { text: 'PDF Booklet', link: '/tools/pdf-booklet' },
                        { text: 'Combine to Single Page', link: '/tools/combine-single-page' },
                        { text: 'View Metadata', link: '/tools/view-metadata' },
                        { text: 'Edit Metadata', link: '/tools/edit-metadata' },
                        { text: 'PDFs to ZIP', link: '/tools/pdf-to-zip' },
                        { text: 'Compare PDFs', link: '/tools/compare-pdfs' },
                        { text: 'Posterize PDF', link: '/tools/posterize-pdf' }
                    ]
                },
                {
                    text: 'Optimize & Repair',
                    collapsed: true,
                    items: [
                        { text: 'Compress PDF', link: '/tools/compress-pdf' },
                        { text: 'PDF to PDF/A', link: '/tools/pdf-to-pdfa' },
                        { text: 'Fix Page Size', link: '/tools/fix-page-size' },
                        { text: 'Linearize PDF', link: '/tools/linearize-pdf' },
                        { text: 'Page Dimensions', link: '/tools/page-dimensions' },
                        { text: 'Remove Restrictions', link: '/tools/remove-restrictions' },
                        { text: 'Repair PDF', link: '/tools/repair-pdf' },
                        { text: 'Rasterize PDF', link: '/tools/rasterize-pdf' },
                        { text: 'Deskew PDF', link: '/tools/deskew-pdf' },
                        { text: 'Font to Outline', link: '/tools/font-to-outline' }
                    ]
                },
                {
                    text: 'Secure PDF',
                    collapsed: true,
                    items: [
                        { text: 'Encrypt PDF', link: '/tools/encrypt-pdf' },
                        { text: 'Sanitize PDF', link: '/tools/sanitize-pdf' },
                        { text: 'Decrypt PDF', link: '/tools/decrypt-pdf' },
                        { text: 'Flatten PDF', link: '/tools/flatten-pdf' },
                        { text: 'Remove Metadata', link: '/tools/remove-metadata' },
                        { text: 'Change Permissions', link: '/tools/change-permissions' },
                        { text: 'Digital Signature', link: '/tools/digital-sign-pdf' },
                        { text: 'Validate Signature', link: '/tools/validate-signature-pdf' }
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
