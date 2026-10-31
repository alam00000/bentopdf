---
title: PDF in WebP
description: Converti le pagine PDF in immagini WebP con qualità regolabile. File più piccoli del JPG a parità di qualità visiva.
---

# PDF in WebP

Converte ogni pagina di un PDF in un'immagine WebP. WebP produce in genere file più piccoli del 25-35% rispetto al JPG a parità di qualità percepita, il che lo rende una scelta valida per l'uso sul web.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file.
2. Regola il cursore **Qualità**.
3. Clicca su **Converti** per elaborare il file.
4. Un singolo file `.webp` o un archivio ZIP viene scaricato automaticamente.

## Opzioni

- **Qualità**: un cursore da 0% a 100% (predefinito 85%). Controlla il livello di compressione con perdita. Valori più alti conservano più dettagli.

Le pagine vengono renderizzate internamente a scala 2x, producendo immagini di circa il doppio delle dimensioni native del PDF.

## Formato di output

- **Pagina singola**: `filename.webp`
- **Più pagine**: `filename_webps.zip` contenente `page_1.webp`, `page_2.webp`, ecc.

## Casi d'uso

- Preparare anteprime di pagina per siti web in cui la banda conta.
- Generare versioni di immagine leggere di volantini o brochure per i social media.
- Convertire in blocco documenti multipagina in un insieme di immagini ottimizzate per il web.

## Suggerimenti

- WebP è supportato da tutti i browser moderni. Per la compatibilità con i sistemi più vecchi, ripiega su [PDF in JPG](./pdf-to-jpg).
- Una qualità dell'80-85% di solito è indistinguibile dall'originale a schermo, mantenendo piccole le dimensioni dei file.

## Strumenti correlati

- [PDF in JPG](./pdf-to-jpg)
- [PDF in PNG](./pdf-to-png)
- [PDF in BMP](./pdf-to-bmp)
