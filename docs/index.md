---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Free, Open-Source PDF Tools'
  tagline: Process PDFs entirely in your browser. No uploads. No servers. Complete privacy.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View Tools
      link: /tools/
    - theme: alt
      text: Self-Host
      link: /self-hosting/
    - theme: alt
      text: Commercial License
      link: /licensing

features:
  - icon: 🔒
    title: 100% Private
    details: Your files never leave your device. All processing happens locally in your browser using WebAssembly.
  - icon: ⚡
    title: Fast & Free
    details: No sign-ups, no limits, no watermarks. Process unlimited PDFs for free, forever.
  - icon: 🛠️
    title: 50+ Tools
    details: Convert, edit, merge, split, compress, sign, OCR, and more. Everything you need in one place.

  - icon: 🌐
    title: Self-Hostable
    details: Deploy on your own infrastructure. Docker, Vercel, Netlify, AWS, or fully air-gapped environments with self-hosted OCR workers, language data, and text-layer fonts.
---

## Offline OCR

If you self-host BentoPDF in an air-gapped or offline environment, OCR needs more than the Tesseract worker and traineddata files. Searchable PDF output also needs the OCR text-layer fonts to be served internally.
See [Self-Hosting](/self-hosting/) for the full setup, including `VITE_OCR_FONT_BASE_URL`, the bundled `ocr-fonts/` directory, and the updated air-gap workflow.
