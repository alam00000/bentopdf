---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Strumenti PDF gratuiti e open source'
  tagline: Elabora i PDF interamente nel tuo browser. Nessun caricamento. Nessun server. Privacy totale.
  actions:
    - theme: brand
      text: Inizia
      link: /it/getting-started
    - theme: alt
      text: Vedi gli strumenti
      link: /it/tools/
    - theme: alt
      text: Self-hosting
      link: /it/self-hosting/
    - theme: alt
      text: Licenza commerciale
      link: /it/licensing

features:
  - icon: 🔒
    title: 100% privato
    details: I tuoi file non lasciano mai il dispositivo. Tutta l'elaborazione avviene in locale nel browser grazie a WebAssembly.
  - icon: ⚡
    title: Veloce e gratuito
    details: Nessuna registrazione, nessun limite, nessuna filigrana. Elabora PDF senza limiti, gratis e per sempre.
  - icon: 🛠️
    title: Oltre 50 strumenti
    details: Converti, modifica, unisci, dividi, comprimi, firma, OCR e altro. Tutto ciò che ti serve in un unico posto.

  - icon: 🌐
    title: Installabile sul tuo server
    details: Distribuiscilo sulla tua infrastruttura. Docker, Vercel, Netlify, AWS o ambienti completamente air-gapped con worker OCR, dati linguistici e font del livello di testo ospitati da te.
---

## OCR offline

Se ospiti BentoPDF in un ambiente air-gapped o offline, l'OCR richiede più del worker Tesseract e dei file traineddata. Per ottenere PDF ricercabili, anche i font del livello di testo OCR devono essere serviti internamente.
Consulta [Self-hosting](/it/self-hosting/) per la configurazione completa, inclusi `VITE_OCR_FONT_BASE_URL`, la cartella inclusa `ocr-fonts/` e il flusso di lavoro air-gap aggiornato.
