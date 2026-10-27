---
title: PDF in JPG
description: Converti le pagine PDF in immagini JPG con qualità regolabile. I PDF di una pagina vengono scaricati direttamente, quelli multipagina come ZIP.
---

# PDF in JPG

Converte ogni pagina di un PDF in un'immagine JPG. I documenti di una sola pagina vengono scaricati come singolo file `.jpg`. I PDF multipagina producono un archivio ZIP con un JPG per pagina.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file. Lo strumento mostra il nome del file, la dimensione e il numero di pagine.
2. Regola il cursore **Qualità** per controllare la compressione JPG.
3. Clicca su **Converti** per avviare l'elaborazione.
4. Il risultato viene scaricato automaticamente: un singolo JPG per i PDF di una pagina, oppure un file ZIP per i documenti multipagina.

## Opzioni

- **Qualità**: un cursore da 0% a 100% (predefinito 90%). Valori più alti producono immagini più nitide con file più grandi. Valori più bassi comprimono in modo più aggressivo.

Le pagine vengono renderizzate internamente a scala 2x, quindi la risoluzione di output è il doppio delle dimensioni della pagina PDF. Una pagina standard in formato Letter produce un'immagine di circa 1.224 x 1.584 pixel.

## Formato di output

- **Pagina singola**: `filename.jpg`
- **Più pagine**: `filename_jpgs.zip` contenente `page_1.jpg`, `page_2.jpg`, ecc.

## Casi d'uso

- Generare miniature di anteprima per un sistema di gestione documentale.
- Condividere una pagina di un report in una chat o in un'email che non supporta i PDF.
- Creare risorse grafiche da diagrammi o illustrazioni in PDF.
- Archiviare documenti scansionati come singole immagini.

## Suggerimenti

- Per un output senza perdita, usa invece [PDF in PNG](./pdf-to-png).
- Un valore di qualità tra 80 e 90% offre un buon equilibrio tra dimensione del file e fedeltà visiva.
- Se ti serve un formato specifico per ogni pagina, valuta il [Costruttore di workflow PDF](./pdf-workflow), che ha un nodo di output PDF in immagini.

## Strumenti correlati

- [PDF in PNG](./pdf-to-png)
- [PDF in WebP](./pdf-to-webp)
- [PDF in BMP](./pdf-to-bmp)
- [PDF in TIFF](./pdf-to-tiff)
