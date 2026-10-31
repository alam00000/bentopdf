---
title: PDF til tekst
description: Udtræk almindeligt tekstindhold fra PDF-filer. Understøtter batchudtrækning fra flere PDF-filer med output som TXT-filer.
---

# PDF til tekst

Udtrækker alt tekstindhold fra PDF-filer og gemmer det som almindelige `.txt`-filer. Understøtter batchbehandling: upload flere PDF-filer, og få hver enkelts tekst udtrukket i én operation. Drevet af PyMuPDF.

## Sådan fungerer det

1. Upload en eller flere PDF-filer ved at klikke på slipområdet eller trække filer hen på det. Administrér din filliste med knapperne Tilføj flere og Ryd.
2. Klik på **Udtræk** for at starte behandlingen.
3. En enkelt fil downloades som `filename.txt`. Flere filer giver et `pdf-to-text.zip`-arkiv.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Alt tekstindhold udtrækkes fra hver side i læserækkefølge.

## Outputformat

- **Enkelt fil**: `filename.txt`
- **Flere filer**: `pdf-to-text.zip` med én `.txt` pr. input-PDF.

## Anvendelser

- Udtrække brødtekst fra PDF-rapporter til fuldtekstsøgningsindeksering.
- Konvertere PDF-e-bøger eller artikler til almindelig tekst til læsning på e-ink-enheder.
- Hente tekst fra kontrakter eller juridiske dokumenter til søgeordsanalyse.
- Fjerne formatering fra PDF-filer for at få ren tekst til databehandlingsscripts.
- Forberede et tekstkorpus fra PDF-arkiver til naturlig sprogbehandling.

## Tips

- Scannede PDF-filer (kun billeder) giver tomme tekstfiler, fordi der ikke er noget tekstlag at udtrække. Kør scannede dokumenter gennem OCR først.
- Outputtet bevarer den læserækkefølge, som PyMuPDF fortolker, og den følger generelt venstre mod højre og top mod bund. Layouts med flere kolonner kan give blandet tekst.
- Til struktureret output med overskrifter og formatering kan du prøve [PDF til Markdown](./pdf-to-markdown). Til AI-klar struktureret JSON kan du bruge [Forbered PDF til AI](./prepare-pdf-for-ai).

## Relaterede værktøjer

- [PDF til Markdown](./pdf-to-markdown)
- [Forbered PDF til AI](./prepare-pdf-for-ai)
- [PDF til Word](./pdf-to-word)
