---
title: PDF in BMP
description: Converti le pagine PDF in immagini BMP non compresse. Utile per sistemi legacy e flussi di stampa che richiedono input bitmap.
---

# PDF in BMP

Converte ogni pagina di un PDF in un'immagine BMP (Bitmap). BMP è un formato non compresso, quindi l'output è perfetto al pixel e senza perdita di qualità, ma i file sono pesanti.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file.
2. Clicca su **Converti** per elaborare il file.
3. Un singolo file `.bmp` o un archivio ZIP viene scaricato automaticamente.

## Opzioni

Questo strumento non ha opzioni configurabili. Le pagine vengono renderizzate a una scala fissa di 2x, producendo immagini di circa il doppio delle dimensioni native della pagina PDF.

## Formato di output

- **Pagina singola**: `filename.bmp`
- **Più pagine**: `filename_bmps.zip` contenente `page_1.bmp`, `page_2.bmp`, ecc.

## Casi d'uso

- Passare le pagine PDF a sistemi legacy o hardware che accettano solo input BMP.
- Preparare immagini non compresse per specifici flussi di stampa.
- Usare l'output bitmap come input per strumenti di elaborazione delle immagini che richiedono dati pixel grezzi.

## Suggerimenti

- I file BMP sono molto grandi perché memorizzano dati pixel grezzi senza compressione. Per la maggior parte degli usi, [PDF in PNG](./pdf-to-png) offre una qualità senza perdita con file molto più piccoli.
- Se il sistema di destinazione accetta PNG o TIFF, preferisci questi formati per risparmiare spazio su disco.

## Strumenti correlati

- [PDF in PNG](./pdf-to-png)
- [PDF in TIFF](./pdf-to-tiff)
- [PDF in JPG](./pdf-to-jpg)
