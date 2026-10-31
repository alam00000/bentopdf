---
title: BMP in PDF
description: Converti le immagini bitmap BMP in formato PDF direttamente nel tuo browser, senza caricare nulla su alcun server.
---

# BMP in PDF

Converti i file Windows Bitmap (BMP) in PDF. BMP è un formato immagine non compresso ancora presente nei sistemi legacy, nell'imaging medico e negli scanner industriali. Questo strumento li converte in PDF senza bisogno di installare nulla.

## Formati supportati

| Formato | Estensioni |
| :------ | :--------- |
| BMP     | `.bmp`     |

## Come funziona

1. Fai clic sull'area di caricamento oppure trascina i tuoi file BMP.
2. Controlla l'elenco dei file. Aggiungi altri file o rimuovi quelli che non vuoi.
3. Fai clic su **Converti in PDF**. L'output viene scaricato come `from_bmps.pdf`.

Ogni BMP viene disegnato su un canvas, esportato come PNG e poi incorporato nel PDF tramite pdf-lib. Le dimensioni della pagina corrispondono a quelle dell'immagine originale.

## Opzioni

Questo strumento non offre impostazioni di qualità aggiuntive. Le immagini vengono incorporate alla loro risoluzione originale come PNG senza perdita all'interno del PDF.

## Casi d'uso

- Convertire documenti scansionati legacy salvati come BMP in PDF per l'archiviazione
- Trasformare screenshot BMP di vecchie applicazioni Windows in documenti condivisibili
- Elaborare l'output di scanner medicali o industriali che usano BMP per impostazione predefinita
- Migrare vecchi archivi di immagini verso un formato più portabile

## Suggerimenti

- I file BMP non sono compressi, quindi tendono a essere grandi. Il PDF risultante sarà molto più piccolo, perché internamente le immagini vengono ricodificate come PNG.
- Se hai file BMP insieme ad altri formati di immagine, usa lo strumento [Immagini in PDF](./image-to-pdf) per convertire tutto in un unico lotto.

## Strumenti correlati

- [Immagini in PDF](./image-to-pdf)
- [PNG in PDF](./png-to-pdf)
- [TIFF in PDF](./tiff-to-pdf)
