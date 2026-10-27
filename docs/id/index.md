---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Alat PDF Gratis dan Sumber Terbuka'
  tagline: Proses PDF sepenuhnya di browser Anda. Tanpa unggahan. Tanpa server. Privasi penuh.
  actions:
    - theme: brand
      text: Mulai
      link: /id/getting-started
    - theme: alt
      text: Lihat Alat
      link: /id/tools/
    - theme: alt
      text: Hosting Mandiri
      link: /id/self-hosting/
    - theme: alt
      text: Lisensi Komersial
      link: /id/licensing

features:
  - icon: 🔒
    title: 100% Privat
    details: File Anda tidak pernah meninggalkan perangkat Anda. Semua pemrosesan terjadi secara lokal di browser Anda menggunakan WebAssembly.
  - icon: ⚡
    title: Cepat & Gratis
    details: Tanpa pendaftaran, tanpa batas, tanpa watermark. Proses PDF tanpa batas secara gratis, selamanya.
  - icon: 🛠️
    title: 50+ Alat
    details: Konversi, edit, gabung, pisah, kompres, tanda tangan, OCR, dan lainnya. Semua yang Anda butuhkan di satu tempat.

  - icon: 🌐
    title: Dapat Dihosting Sendiri
    details: Terapkan di infrastruktur Anda sendiri. Docker, Vercel, Netlify, AWS, atau lingkungan air-gapped sepenuhnya dengan worker OCR, data bahasa, dan font lapisan teks yang dihosting sendiri.
---

## OCR Offline

Jika Anda menghosting BentoPDF sendiri di lingkungan air-gapped atau offline, OCR membutuhkan lebih dari sekadar worker Tesseract dan file traineddata. Hasil PDF yang dapat dicari juga mengharuskan font lapisan teks OCR disajikan secara internal.
Lihat [Hosting Mandiri](/id/self-hosting/) untuk penyiapan lengkap, termasuk `VITE_OCR_FONT_BASE_URL`, direktori `ocr-fonts/` bawaan, dan alur kerja air-gap terbaru.
