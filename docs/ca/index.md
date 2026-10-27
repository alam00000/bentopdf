---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Eines PDF gratuïtes i de codi obert'
  tagline: Processa PDF íntegrament al navegador. Sense càrregues. Sense servidors. Privadesa total.
  actions:
    - theme: brand
      text: Comença
      link: /ca/getting-started
    - theme: alt
      text: Veure les eines
      link: /ca/tools/
    - theme: alt
      text: Autoallotjament
      link: /ca/self-hosting/
    - theme: alt
      text: Llicència comercial
      link: /ca/licensing

features:
  - icon: 🔒
    title: 100 % privat
    details: Els fitxers no surten mai del dispositiu. Tot el processament es fa en local al navegador amb WebAssembly.
  - icon: ⚡
    title: Ràpid i gratuït
    details: Sense registres, sense límits, sense marques d'aigua. Processa PDF il·limitats de franc, per sempre.
  - icon: 🛠️
    title: Més de 50 eines
    details: Converteix, edita, fusiona, divideix, comprimeix, signa, aplica OCR i més. Tot el que necessites en un sol lloc.

  - icon: 🌐
    title: Autoallotjable
    details: Desplega'l a la teva pròpia infraestructura. Docker, Vercel, Netlify, AWS o entorns totalment aïllats de la xarxa amb workers d'OCR, dades d'idioma i fonts de capa de text autoallotjats.
---

## OCR sense connexió

Si autoallotges BentoPDF en un entorn aïllat de la xarxa o sense connexió, l'OCR necessita més que el worker de Tesseract i els fitxers traineddata. Per generar PDF amb text cercable, també cal servir internament les fonts de la capa de text d'OCR.
Consulta [Autoallotjament](/ca/self-hosting/) per a la configuració completa, incloent-hi `VITE_OCR_FONT_BASE_URL`, el directori `ocr-fonts/` inclòs i el flux de treball aïllat actualitzat.
