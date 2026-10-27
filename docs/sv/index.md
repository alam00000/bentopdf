---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Gratis PDF-verktyg med öppen källkod'
  tagline: Bearbeta PDF-filer helt i din webbläsare. Inga uppladdningar. Inga servrar. Fullständig integritet.
  actions:
    - theme: brand
      text: Kom igång
      link: /sv/getting-started
    - theme: alt
      text: Visa verktyg
      link: /sv/tools/
    - theme: alt
      text: Självhosta
      link: /sv/self-hosting/
    - theme: alt
      text: Kommersiell licens
      link: /sv/licensing

features:
  - icon: 🔒
    title: 100% privat
    details: Dina filer lämnar aldrig din enhet. All bearbetning sker lokalt i din webbläsare med WebAssembly.
  - icon: ⚡
    title: Snabbt och gratis
    details: Ingen registrering, inga begränsningar, inga vattenstämplar. Bearbeta obegränsat med PDF-filer gratis, för alltid.
  - icon: 🛠️
    title: Över 50 verktyg
    details: Konvertera, redigera, slå ihop, dela, komprimera, signera, OCR och mer. Allt du behöver på ett ställe.

  - icon: 🌐
    title: Kan självhostas
    details: Driftsätt på din egen infrastruktur. Docker, Vercel, Netlify, AWS eller helt luftgappade miljöer med självhostade OCR-workers, språkdata och typsnitt för textlager.
---

## Offline-OCR

Om du självhostar BentoPDF i en luftgappad eller offline-miljö behöver OCR mer än Tesseract-workern och traineddata-filerna. För att få sökbara PDF-filer måste även OCR-textlagrets typsnitt serveras internt.
Se [Självhosting](/sv/self-hosting/) för hela uppsättningen, inklusive `VITE_OCR_FONT_BASE_URL`, den medföljande katalogen `ocr-fonts/` och det uppdaterade arbetsflödet för luftgappade miljöer.
