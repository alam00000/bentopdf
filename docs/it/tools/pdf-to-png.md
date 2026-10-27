---
title: PDF in PNG
description: Converti le pagine PDF in immagini PNG senza perdita con scala regolabile. Ideale per schermate di alta qualità e sfondi trasparenti.
---

# PDF in PNG

Converte ogni pagina di un PDF in un'immagine PNG. PNG usa una compressione senza perdita, quindi l'output conserva ogni dettaglio della pagina originale. I PDF di una pagina vengono scaricati come file `.png`; i PDF multipagina producono uno ZIP.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file.
2. Imposta il cursore **Scala** per controllare la risoluzione di output.
3. Clicca su **Converti** per avviare l'elaborazione.
4. Un singolo PNG o un archivio ZIP viene scaricato automaticamente.

## Opzioni

- **Scala**: da 1.0x a 3.0x (predefinito 2.0x). A 2.0x, una pagina standard in formato Letter viene renderizzata a circa 1.224 x 1.584 pixel. Valori di scala più alti producono immagini più grandi e nitide, a scapito di dimensione del file e tempo di elaborazione.

## Formato di output

- **Pagina singola**: `filename.png`
- **Più pagine**: `filename_pngs.zip` contenente `page_1.png`, `page_2.png`, ecc.

## Casi d'uso

- Catturare schermate ad alta fedeltà delle pagine PDF per le presentazioni.
- Estrarre grafici o diagrammi che richiedono bordi nitidi e nessun artefatto di compressione.
- Preparare risorse per il web design a partire da mockup in PDF.
- Creare immagini di pagina senza perdita per la pre-elaborazione OCR.

## Suggerimenti

- I file PNG sono molto più grandi dei JPG. Se la dimensione del file conta più della qualità perfetta, usa [PDF in JPG](./pdf-to-jpg) o [PDF in WebP](./pdf-to-webp).
- A scala 1.0x l'output corrisponde alla risoluzione nativa del PDF. Porta a 3.0x per esportazioni di qualità da stampa.

## Strumenti correlati

- [PDF in JPG](./pdf-to-jpg)
- [PDF in WebP](./pdf-to-webp)
- [PDF in SVG](./pdf-to-svg)
