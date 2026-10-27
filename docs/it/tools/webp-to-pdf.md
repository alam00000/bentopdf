---
title: WebP in PDF
description: Converti le immagini WebP in PDF direttamente nel browser con qualità di compressione regolabile.
---

# WebP in PDF

Converti il formato immagine WebP di Google in PDF. È particolarmente utile quando hai scaricato dal web immagini in formato WebP e ti servono in un formato più universale per stamparle o condividerle.

## Formati supportati

| Formato | Estensioni |
| :------ | :--------- |
| WebP    | `.webp`    |

## Come funziona

1. Fai clic sull'area di caricamento o trascina i tuoi file WebP.
2. Controlla l'elenco dei file e rimuovi quelli che non ti servono.
3. Seleziona un livello di **Qualità PDF**.
4. Fai clic su **Converti in PDF**. L'output viene scaricato come `from_webps.pdf`.

Internamente, ogni immagine WebP viene decodificata tramite l'API canvas del browser e poi incorporata nel PDF con pdf-lib. Questo significa che la conversione funziona su qualsiasi browser che supporti la decodifica WebP (tutti i browser moderni lo fanno).

## Opzioni

**Qualità PDF** controlla la compressione durante l'inserimento delle immagini:

- **Alta qualità**: conserva il massimo dettaglio.
- **Qualità media** (predefinita): output bilanciato.
- **Bassa qualità**: dimensione del file più piccola.

## Casi d'uso

- Convertire in un PDF stampabile le immagini scaricate dal web e salvate come WebP
- Raccogliere in una documentazione gli screenshot WebP di Chrome o Edge
- Creare un portfolio PDF da immagini esportate da strumenti di design che usano WebP per impostazione predefinita
- Archiviare le immagini WebP in un formato leggibile più universalmente

## Suggerimenti

- WebP viene decodificato internamente in PNG prima dell'inserimento nel PDF, quindi le immagini WebP lossless mantengono la loro qualità con l'impostazione Alta.
- Se hai un mix di WebP e altri formati di immagine, usa invece lo strumento [Immagini in PDF](./image-to-pdf): accetta tutto in un colpo solo.

## Strumenti correlati

- [Immagini in PDF](./image-to-pdf)
- [PNG in PDF](./png-to-pdf)
- [JPG in PDF](./jpg-to-pdf)
