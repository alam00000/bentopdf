---
title: JPG in PDF
description: Converti una o più immagini JPG, JPEG e JPEG 2000 in un unico file PDF direttamente nel browser.
---

# JPG in PDF

Trasforma le immagini JPG in un PDF pulito. Carica un file o più JPG insieme: ogni immagine diventa una pagina a dimensione piena nel documento finale.

## Formati supportati

| Formato   | Estensioni      |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Come funziona

1. Clicca sull'area di caricamento o trascina i tuoi file JPG. La selezione multipla è supportata.
2. Controlla i file caricati. Usa l'icona del cestino per rimuovere singoli file, oppure clicca su **Aggiungi altri file** per aggiungerne all'elenco.
3. Seleziona un livello di **Qualità PDF**.
4. Clicca su **Converti in PDF**. Lo strumento comprime le immagini in base all'impostazione di qualità, le converte con il motore PyMuPDF e scarica `from_jpgs.pdf`.

## Opzioni

**Qualità PDF** regola la compressione applicata a ogni immagine prima che venga incorporata nel PDF:

- **Alta qualità**: conserva il massimo dettaglio. Da usare per fotografia o stampa.
- **Qualità media** (predefinita): un buon equilibrio tra nitidezza e dimensione del file.
- **Bassa qualità**: compressione aggressiva per il file più piccolo.

## Casi d'uso

- Convertire documenti scansionati salvati come JPG in un unico PDF da inviare
- Raccogliere foto di prodotto in un catalogo per i clienti
- Trasformare immagini mediche o satellitari JPEG 2000 in un PDF portabile
- Creare un album fotografico stampabile dalle esportazioni della fotocamera

## Suggerimenti

- I file JPEG 2000 (`.jp2`, `.jpx`) sono pienamente supportati, non solo il JPEG standard. È utile per l'imaging medico e i dati geospaziali.
- Se i tuoi JPG provengono dalla fotocamera di un telefono, la qualità Media di solito produce un file più piccolo del 40-60% rispetto ad Alta, senza differenze visibili a schermo.

## Strumenti correlati

- [Immagini in PDF](./image-to-pdf)
- [PNG in PDF](./png-to-pdf)
- [WebP in PDF](./webp-to-pdf)
