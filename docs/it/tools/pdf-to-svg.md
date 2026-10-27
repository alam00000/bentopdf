---
title: PDF in SVG
description: Converti le pagine PDF in grafica vettoriale SVG scalabile. Mantiene testo e forme come tracciati vettoriali per una scalabilità infinita.
---

# PDF in SVG

Converte ogni pagina di un PDF in un file SVG (Scalable Vector Graphics). A differenza dei formati raster, SVG conserva tracciati vettoriali, testo e forme, quindi l'output si adatta a qualsiasi dimensione senza pixelazione. Usa PyMuPDF.

## Come funziona

1. Carica uno o più PDF cliccando sull'area di rilascio o trascinandovi sopra i file. Puoi aggiungere più file e gestirli singolarmente.
2. Clicca su **Converti** per elaborare tutti i file caricati.
3. Le conversioni di un solo file con una sola pagina vengono scaricate come `.svg` singolo. Tutto il resto viene scaricato come archivio ZIP.

## Opzioni

Questo strumento non ha opzioni configurabili. Ogni pagina viene convertita in SVG con l'esportazione vettoriale nativa di PyMuPDF.

## Formato di output

- **Un file, una pagina**: `filename.svg`
- **Un file, più pagine**: `filename_svg.zip` contenente `page_1.svg`, `page_2.svg`, ecc.
- **Più file**: `pdf_to_svg.zip` con i file organizzati per nome del documento di origine.

## Casi d'uso

- Estrarre diagrammi vettoriali, grafici o illustrazioni da report PDF da usare in pagine web.
- Modificare il contenuto delle pagine PDF in un editor vettoriale come Inkscape o Illustrator.
- Incorporare anteprime di pagina scalabili in applicazioni web responsive.
- Estrarre loghi o grafica da brochure PDF mantenendo i bordi nitidi.

## Suggerimenti

- SVG funziona al meglio con i PDF che contengono contenuto vettoriale. I documenti scansionati o i PDF ricchi di immagini producono file SVG grandi con dati raster incorporati.
- Per un output raster di PDF ricchi di immagini, usa invece [PDF in PNG](./pdf-to-png) o [PDF in JPG](./pdf-to-jpg).
- Questo strumento supporta la conversione in blocco: carica più PDF insieme per convertirli tutti in una sola esecuzione.

## Strumenti correlati

- [PDF in PNG](./pdf-to-png)
- [PDF in JPG](./pdf-to-jpg)
- [PDF in Markdown](./pdf-to-markdown)
