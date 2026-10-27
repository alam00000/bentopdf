---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Kostenlose Open-Source-PDF-Werkzeuge'
  tagline: Verarbeiten Sie PDFs komplett in Ihrem Browser. Keine Uploads. Keine Server. Vollständige Privatsphäre.
  actions:
    - theme: brand
      text: Loslegen
      link: /de/getting-started
    - theme: alt
      text: Werkzeuge ansehen
      link: /de/tools/
    - theme: alt
      text: Selbst hosten
      link: /de/self-hosting/
    - theme: alt
      text: Kommerzielle Lizenz
      link: /de/licensing

features:
  - icon: 🔒
    title: 100% privat
    details: Ihre Dateien verlassen nie Ihr Gerät. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser mit WebAssembly.
  - icon: ⚡
    title: Schnell & kostenlos
    details: Keine Anmeldung, keine Limits, keine Wasserzeichen. Verarbeiten Sie unbegrenzt viele PDFs, für immer kostenlos.
  - icon: 🛠️
    title: 50+ Werkzeuge
    details: Konvertieren, bearbeiten, zusammenführen, teilen, komprimieren, signieren, OCR und mehr. Alles, was Sie brauchen, an einem Ort.

  - icon: 🌐
    title: Selbst hostbar
    details: Betreiben Sie es auf Ihrer eigenen Infrastruktur. Docker, Vercel, Netlify, AWS oder vollständig abgeschottete Umgebungen mit selbst gehosteten OCR-Workern, Sprachdaten und Textebenen-Schriften.
---

## Offline-OCR

Wenn Sie BentoPDF in einer abgeschotteten oder Offline-Umgebung selbst hosten, braucht OCR mehr als den Tesseract-Worker und die traineddata-Dateien. Für durchsuchbare PDF-Ausgaben müssen außerdem die OCR-Textebenen-Schriften intern bereitgestellt werden.
Die vollständige Einrichtung, einschließlich `VITE_OCR_FONT_BASE_URL`, des mitgelieferten Verzeichnisses `ocr-fonts/` und des aktualisierten Air-Gap-Workflows, finden Sie unter [Self-Hosting](/de/self-hosting/).
