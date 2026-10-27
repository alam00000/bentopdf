---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Gratis PDF-værktøjer med åben kildekode'
  tagline: Behandl PDF'er helt i din browser. Ingen uploads. Ingen servere. Fuldt privatliv.
  actions:
    - theme: brand
      text: Kom i gang
      link: /da/getting-started
    - theme: alt
      text: Se værktøjer
      link: /da/tools/
    - theme: alt
      text: Selvhost
      link: /da/self-hosting/
    - theme: alt
      text: Kommerciel licens
      link: /da/licensing

features:
  - icon: 🔒
    title: 100% privat
    details: Dine filer forlader aldrig din enhed. Al behandling sker lokalt i din browser ved hjælp af WebAssembly.
  - icon: ⚡
    title: Hurtig og gratis
    details: Ingen tilmeldinger, ingen grænser, ingen vandmærker. Behandl ubegrænset mange PDF'er gratis, for altid.
  - icon: 🛠️
    title: 50+ værktøjer
    details: Konverter, rediger, flet, opdel, komprimer, underskriv, OCR og mere. Alt hvad du har brug for samlet ét sted.

  - icon: 🌐
    title: Kan selvhostes
    details: Installer på din egen infrastruktur. Docker, Vercel, Netlify, AWS eller helt air-gapped miljøer med selvhostede OCR-workers, sprogdata og tekstlagsskrifttyper.
---

## OCR offline

Hvis du selvhoster BentoPDF i et air-gapped eller offline miljø, kræver OCR mere end Tesseract-workeren og traineddata-filerne. Søgbar PDF-output kræver også, at OCR-tekstlagets skrifttyper serveres internt.
Se [Selvhosting](/da/self-hosting/) for den fulde opsætning, herunder `VITE_OCR_FONT_BASE_URL`, den medfølgende mappe `ocr-fonts/` og den opdaterede air-gap-arbejdsgang.
