---
title: Raddrizza PDF
description: Raddrizza automaticamente le pagine inclinate dei PDF scansionati con il rilevamento dell'inclinazione di OpenCV. Soglia e DPI regolabili.
---

# Raddrizza PDF

I documenti scansionati raramente sono perfettamente dritti. Anche una leggera inclinazione rende l'OCR meno accurato e la stampa poco curata. Questo strumento usa gli algoritmi di elaborazione delle immagini di OpenCV per rilevare l'angolo di inclinazione di ogni pagina e ruotarla fino a riportarla in piano.

## Come funziona

1. Carica uno o più PDF scansionati.
2. Imposta la **Soglia di inclinazione**: le pagine con un'inclinazione rilevata inferiore a questo valore restano invariate.
3. Scegli una **Qualità di elaborazione (DPI)**: un DPI più alto migliora la precisione del rilevamento ma richiede più tempo.
4. Fai clic su **Raddrizza PDF**.
5. Al termine dell'elaborazione, un pannello dei risultati mostra l'angolo rilevato per ogni pagina e se è stata corretta.

## Opzioni

| Impostazione                      | Valori                   | Predefinito |
| --------------------------------- | ------------------------ | ----------- |
| **Soglia di inclinazione**        | 0.1, 0.5, 1.0, 2.0 gradi | 0.5         |
| **Qualità di elaborazione (DPI)** | 100, 150, 200, 300       | 150         |

## Come funziona il rilevamento dell'inclinazione

Lo strumento rende ogni pagina come immagine al DPI selezionato, poi usa OpenCV per rilevare gli angoli delle linee dominanti nel contenuto. Se l'inclinazione rilevata supera la soglia, la pagina viene ruotata dell'angolo inverso per raddrizzarla. Le pagine sotto la soglia passano invariate.

## Casi d'uso

- Ripulire contratti o documenti legali scansionati in blocco
- Preparare ricevute o fatture scansionate per l'elaborazione OCR
- Raddrizzare le pagine di uno scanner piano con posizionamento della carta irregolare
- Migliorare la qualità visiva di materiali d'archivio digitalizzati

## Suggerimenti

- Abbassa la soglia a 0.1 gradi se ti serve un allineamento perfetto al pixel per l'OCR.
- 150 DPI è veloce e preciso per la maggior parte dei documenti. Usa 300 DPI per testo molto piccolo o pagine con dettagli fini.
- Il raddrizzamento funziona meglio sui documenti con linee di testo orizzontali nitide. Può avere difficoltà con pagine composte soprattutto da immagini o con elementi di design diagonali.

## Strumenti correlati

- [Rasterizza PDF](./rasterize-pdf): converte il risultato raddrizzato in un PDF piatto basato su immagini
- [Comprimi PDF](./compress-pdf): riduce le dimensioni del file dopo il raddrizzamento
- [Ripara PDF](./repair-pdf): risolve problemi strutturali nei PDF scansionati
