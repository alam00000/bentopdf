---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Gratis, open-source PDF-tools'
  tagline: Verwerk PDF's volledig in je browser. Geen uploads. Geen servers. Complete privacy.
  actions:
    - theme: brand
      text: Aan de slag
      link: /nl/getting-started
    - theme: alt
      text: Tools bekijken
      link: /nl/tools/
    - theme: alt
      text: Zelf hosten
      link: /nl/self-hosting/
    - theme: alt
      text: Commerciële licentie
      link: /nl/licensing

features:
  - icon: 🔒
    title: 100% privé
    details: Je bestanden verlaten je apparaat nooit. Alle verwerking gebeurt lokaal in je browser met WebAssembly.
  - icon: ⚡
    title: Snel en gratis
    details: Geen aanmelding, geen limieten, geen watermerken. Verwerk onbeperkt PDF's, voor altijd gratis.
  - icon: 🛠️
    title: 50+ tools
    details: Converteren, bewerken, samenvoegen, splitsen, comprimeren, ondertekenen, OCR en meer. Alles wat je nodig hebt op één plek.

  - icon: 🌐
    title: Zelf te hosten
    details: Implementeer op je eigen infrastructuur. Docker, Vercel, Netlify, AWS of volledig air-gapped omgevingen met zelfgehoste OCR-workers, taaldata en tekstlaaglettertypen.
---

## Offline OCR

Als je BentoPDF zelf host in een air-gapped of offline omgeving, heeft OCR meer nodig dan de Tesseract-worker en traineddata-bestanden. Voor doorzoekbare PDF-uitvoer moeten ook de OCR-tekstlaaglettertypen intern worden aangeboden.
Zie [Zelf hosten](/nl/self-hosting/) voor de volledige installatie, inclusief `VITE_OCR_FONT_BASE_URL`, de meegeleverde map `ocr-fonts/` en de bijgewerkte air-gap-werkwijze.
