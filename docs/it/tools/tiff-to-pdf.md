---
title: TIFF in PDF
description: Converti immagini TIFF singole e multipagina in formato PDF nel tuo browser, con supporto completo delle pagine.
---

# TIFF in PDF

Converti i file TIFF in PDF, inclusi i TIFF multipagina. Ogni pagina (o "IFD") di un file TIFF diventa una pagina separata nel PDF di output. È particolarmente utile per documenti scansionati, fax e immagini mediche, che sono spesso archiviati come TIFF multipagina.

## Formati supportati

| Formato | Estensioni      |
| :------ | :-------------- |
| TIFF    | `.tiff`, `.tif` |

## Come funziona

1. Fai clic sull'area di caricamento o trascina i tuoi file TIFF.
2. Controlla l'elenco dei file e gestiscilo come preferisci.
3. Fai clic su **Converti in PDF**. Il risultato viene scaricato come `from_tiff.pdf`.

Lo strumento decodifica ogni file TIFF con un decodificatore TIFF in JavaScript, estraendo i dati grezzi dei pixel RGBA di ogni pagina. Ogni pagina viene disegnata su un canvas, esportata come PNG e incorporata nel PDF. Le dimensioni delle pagine corrispondono a quelle delle pagine TIFF originali.

## Opzioni

Questo strumento non offre impostazioni di qualità aggiuntive. Le immagini vengono incorporate alla loro risoluzione nativa.

## Casi d'uso

- Convertire documenti fax multipagina (TIFF-F) in un formato PDF più portabile
- Trasformare archivi di documenti scansionati, conservati come TIFF, in PDF ricercabili (combinando poi lo strumento OCR)
- Elaborare file di imaging medico (vetrini di patologia, esportazioni di radiologia) in formato TIFF
- Convertire immagini TIFF GIS o satellitari in documenti condivisibili

## Suggerimenti

- I TIFF multipagina sono pienamente supportati. Un TIFF di 10 pagine produce un PDF di 10 pagine. Non serve dividere prima il TIFF.
- I file TIFF molto grandi (centinaia di megabyte) possono richiedere più tempo, perché l'intero file deve essere decodificato nella memoria del browser.
- Se ti serve l'OCR sul PDF risultante, passalo dallo strumento [OCR PDF](./ocr-pdf) dopo la conversione.

## Strumenti correlati

- [Immagini in PDF](./image-to-pdf)
- [BMP in PDF](./bmp-to-pdf)
- [JPG in PDF](./jpg-to-pdf)
