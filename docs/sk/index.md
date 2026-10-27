---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Bezplatné open-source PDF nástroje'
  tagline: Spracujte PDF úplne vo svojom prehliadači. Bez nahrávania. Bez serverov. Úplné súkromie.
  actions:
    - theme: brand
      text: Začať
      link: /sk/getting-started
    - theme: alt
      text: Zobraziť nástroje
      link: /sk/tools/
    - theme: alt
      text: Vlastný hosting
      link: /sk/self-hosting/
    - theme: alt
      text: Komerčná licencia
      link: /sk/licensing

features:
  - icon: 🔒
    title: 100% súkromné
    details: Vaše súbory nikdy neopustia vaše zariadenie. Všetko spracovanie prebieha lokálne vo vašom prehliadači pomocou WebAssembly.
  - icon: ⚡
    title: Rýchle a zadarmo
    details: Bez registrácií, bez limitov, bez vodoznakov. Spracujte neobmedzený počet PDF zadarmo, navždy.
  - icon: 🛠️
    title: Viac ako 50 nástrojov
    details: Konvertujte, upravujte, zlučujte, rozdeľujte, komprimujte, podpisujte, použite OCR a ďalšie. Všetko, čo potrebujete, na jednom mieste.

  - icon: 🌐
    title: Možnosť vlastného hostingu
    details: Nasaďte na vlastnej infraštruktúre. Docker, Vercel, Netlify, AWS alebo úplne izolované (air-gapped) prostredia s vlastnými OCR workermi, jazykovými dátami a písmami textovej vrstvy.
---

## Offline OCR

Ak hostujete BentoPDF vo vlastnom izolovanom (air-gapped) alebo offline prostredí, OCR potrebuje viac než worker Tesseract a súbory traineddata. Výstup vo forme PDF s možnosťou vyhľadávania vyžaduje aj to, aby boli písma textovej vrstvy OCR poskytované interne.
Úplný postup, vrátane `VITE_OCR_FONT_BASE_URL`, priloženého adresára `ocr-fonts/` a aktualizovaného postupu pre air-gap, nájdete v časti [Vlastný hosting](/sk/self-hosting/).
