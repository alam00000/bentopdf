---
title: PNG in PDF
description: Converti una o più immagini PNG in un documento PDF con qualità regolabile, interamente nel tuo browser.
---

# PNG in PDF

Converti le immagini PNG in PDF mantenendo la loro piena risoluzione. Ogni PNG diventa una pagina a sé, delle stesse dimensioni dell'immagine originale. La trasparenza viene gestita automaticamente.

## Formati supportati

| Formato | Estensioni |
| :------ | :--------- |
| PNG     | `.png`     |

## Come funziona

1. Clicca sull'area di caricamento o trascina i file PNG. Puoi selezionarne più di uno alla volta.
2. Gestisci l'elenco dei file: rimuovi quelli indesiderati o aggiungine altri.
3. Scegli un livello di **Qualità PDF** dal menu a tendina.
4. Clicca su **Converti in PDF**. L'output viene scaricato come `from_jpgs.pdf`.

Lo strumento usa pdf-lib per incorporare direttamente ogni immagine. Se un PNG non può essere incorporato in modo nativo (ad es. per un profilo colore insolito), ripiega sul ridisegno tramite canvas come JPEG.

## Opzioni

**Qualità PDF** controlla la compressione applicata prima dell'incorporamento:

- **Alta qualità**: compressione minima, dimensione del file maggiore.
- **Media qualità** (predefinita): buon equilibrio tra dimensione e nitidezza.
- **Bassa qualità**: compressione massima, output più piccolo.

## Casi d'uso

- Convertire schermate in un PDF multipagina per segnalazioni di bug o documentazione
- Impacchettare le esportazioni di design dell'interfaccia in un unico file da rivedere
- Trasformare le esportazioni di diagrammi (draw.io, Excalidraw) in un PDF condivisibile
- Assemblare un insieme di immagini di grafici in un report

## Suggerimenti

- I file PNG con trasparenza ottengono uno sfondo bianco nel PDF. Se ti serve uno sfondo diverso, modifica prima le immagini.
- Per schermate e diagrammi con bordi netti e testo, l'alta qualità evita gli artefatti di compressione JPEG. La qualità media o bassa può convertire internamente in JPEG.

## Strumenti correlati

- [Immagini in PDF](./image-to-pdf)
- [JPG in PDF](./jpg-to-pdf)
- [SVG in PDF](./svg-to-pdf)
