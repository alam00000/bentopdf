---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Outils PDF gratuits et open source'
  tagline: Traitez vos PDF entièrement dans votre navigateur. Aucun envoi. Aucun serveur. Confidentialité totale.
  actions:
    - theme: brand
      text: Commencer
      link: /fr/getting-started
    - theme: alt
      text: Voir les outils
      link: /fr/tools/
    - theme: alt
      text: Auto-héberger
      link: /fr/self-hosting/
    - theme: alt
      text: Licence commerciale
      link: /fr/licensing

features:
  - icon: 🔒
    title: 100 % privé
    details: Vos fichiers ne quittent jamais votre appareil. Tout le traitement se fait en local dans votre navigateur grâce à WebAssembly.
  - icon: ⚡
    title: Rapide et gratuit
    details: Sans inscription, sans limites, sans filigranes. Traitez autant de PDF que vous voulez, gratuitement, pour toujours.
  - icon: 🛠️
    title: Plus de 50 outils
    details: Convertissez, modifiez, fusionnez, divisez, compressez, signez, appliquez l'OCR et bien plus. Tout ce dont vous avez besoin au même endroit.

  - icon: 🌐
    title: Auto-hébergeable
    details: Déployez sur votre propre infrastructure. Docker, Vercel, Netlify, AWS, ou environnements totalement isolés du réseau avec workers OCR, données de langue et polices de couche de texte auto-hébergés.
---

## OCR hors ligne

Si vous auto-hébergez BentoPDF dans un environnement isolé du réseau ou hors ligne, l'OCR nécessite plus que le worker Tesseract et les fichiers traineddata. La production de PDF avec texte recherchable exige aussi que les polices de la couche de texte OCR soient servies en interne.
Consultez [Auto-hébergement](/fr/self-hosting/) pour la configuration complète, y compris `VITE_OCR_FONT_BASE_URL`, le dossier `ocr-fonts/` fourni et le workflow isolé mis à jour.
