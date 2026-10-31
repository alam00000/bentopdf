---
title: PDF in TIFF
description: Converti le pagine PDF in immagini TIFF, comunemente usate nei flussi di stampa, fax e archiviazione. Ripiega su PNG se la codifica fallisce.
---

# PDF in TIFF

Converte ogni pagina di un PDF in un'immagine TIFF. TIFF è il formato standard per la produzione di stampa, i sistemi fax e l'archiviazione documentale. Lo strumento usa la compressione PackBits per la codifica TIFF e ripiega su PNG se una pagina non riesce a essere codificata.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file.
2. Clicca su **Converti** per elaborare il file.
3. Un singolo file TIFF o un archivio ZIP viene scaricato automaticamente.

## Opzioni

Questo strumento non ha opzioni configurabili. Le pagine vengono renderizzate a una scala fissa di 2x.

## Formato di output

- **Pagina singola**: `filename.tiff`
- **Più pagine**: `filename_tiffs.zip` contenente `page_1.tiff`, `page_2.tiff`, ecc.

Se la codifica TIFF fallisce per una pagina specifica (per problemi di compressione), quella pagina viene salvata come file `.png`. In tal caso lo ZIP conterrà un mix di file TIFF e PNG.

## Casi d'uso

- Inviare documenti a enti governativi o sistemi legali che richiedono il formato TIFF.
- Preparare pagine per la trasmissione fax tramite servizi di fax digitali.
- Archiviare documenti scansionati in un formato senza perdita ampiamente supportato.
- Passare pagine a sistemi aziendali di gestione documentale.

## Suggerimenti

- I file TIFF sono grandi. Se ti serve la qualità senza perdita solo per uso web o a schermo, [PDF in PNG](./pdf-to-png) è una scelta migliore.
- Controlla il contenuto dello ZIP se alcune pagine hanno richiesto il ripiego su PNG: potresti volerle convertire separatamente.

## Strumenti correlati

- [PDF in PNG](./pdf-to-png)
- [PDF in BMP](./pdf-to-bmp)
- [PDF in JPG](./pdf-to-jpg)
