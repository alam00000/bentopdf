---
title: PDF in scala di grigi
description: Converti un PDF a colori in una versione in scala di grigi (bianco e nero). Produce un nuovo PDF con tutti i colori rimossi da ogni pagina.
---

# PDF in scala di grigi

Converte un PDF a colori in una versione in scala di grigi. Ogni pagina viene renderizzata, desaturata e reincorporata come immagine JPEG in un nuovo PDF. L'output mantiene le dimensioni originali delle pagine.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file.
2. Clicca su **Converti** per elaborare il file.
3. Viene scaricato un nuovo `greyscale.pdf` con tutte le pagine convertite in bianco e nero.

Dietro le quinte, ogni pagina viene renderizzata a scala 2x, i dati dei pixel passano attraverso un filtro in scala di grigi, poi vengono ricodificati come JPEG al 90% di qualità e inseriti in un nuovo documento PDF.

## Opzioni

Questo strumento non ha opzioni configurabili. La conversione in scala di grigi usa una formula di luminanza standard e la qualità JPEG è fissata al 90%.

## Formato di output

- Un unico file `greyscale.pdf` contenente tutte le pagine come immagini JPEG in scala di grigi.

## Casi d'uso

- Preparare documenti per la stampa in bianco e nero e risparmiare sui costi dell'inchiostro a colori.
- Rispettare i requisiti di invio di pratiche legali o governative che richiedono la scala di grigi.
- Ridurre le dimensioni dei PDF molto colorati (le immagini JPEG in scala di grigi sono più piccole di quelle a colori).
- Creare uno stile visivo coerente in documenti con pagine miste a colori e in bianco e nero.

## Suggerimenti

- Poiché ogni pagina viene rasterizzata e reincorporata come JPEG, l'output è basato su immagini. Il testo del PDF originale non sarà più selezionabile né ricercabile. Se in seguito ti serve testo ricercabile, passa l'output nello strumento OCR.
- Per un controllo maggiore sulle regolazioni del colore (luminosità, contrasto, saturazione), guarda lo strumento Regola colori o il nodo Scala di grigi nel [Costruttore di workflow PDF](./pdf-workflow).

## Strumenti correlati

- [PDF in JPG](./pdf-to-jpg)
- [PDF in PNG](./pdf-to-png)
- [Costruttore di workflow PDF](./pdf-workflow)
