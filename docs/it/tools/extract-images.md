---
title: Estrai immagini
description: Estrai tutte le immagini incorporate dai file PDF. Visualizzale in anteprima in una griglia e scaricale singolarmente o come archivio ZIP.
---

# Estrai immagini

Estrae ogni immagine incorporata da uno o più file PDF. Le immagini estratte vengono mostrate in una griglia di anteprima dove puoi scaricarle singolarmente oppure prenderle tutte insieme in un ZIP. Basato su PyMuPDF.

## Come funziona

1. Carica uno o più PDF facendo clic sull'area di rilascio o trascinandoci sopra i file. Aggiungi altri file o rimuovi quelli singoli secondo necessità.
2. Fai clic su **Estrai immagini** per avviare l'elaborazione.
3. Lo strumento analizza ogni pagina di ogni PDF caricato, trovando ed estraendo le immagini incorporate.
4. Le immagini estratte appaiono in una griglia con le miniature. Ogni immagine ha un pulsante di download.
5. Fai clic su **Scarica tutto** per salvare tutto come archivio ZIP.

## Opzioni

Questo strumento non ha opzioni configurabili. Tutte le immagini incorporate vengono estratte nel loro formato originale (in genere PNG, JPEG o qualunque formato fosse usato quando l'immagine è stata incorporata nel PDF).

## Formato di output

- Le immagini nella griglia di anteprima hanno nomi come `image_1.png`, `image_2.jpg`, ecc.
- **Scarica tutto** produce `extracted-images.zip` con tutte le immagini.
- Le singole immagini possono essere scaricate una alla volta dalla griglia.

## Casi d'uso

- Recuperare foto o grafiche da un PDF per riutilizzarle in un altro progetto.
- Estrarre le immagini dei prodotti da un catalogo PDF per un annuncio di e-commerce.
- Prendere diagrammi dalla documentazione tecnica da usare nelle presentazioni.
- Verificare quali immagini sono incorporate in un documento prima di condividerlo.

## Suggerimenti

- Lo strumento estrae le immagini esattamente come sono memorizzate nel PDF. Non esegue il rendering delle pagine come immagini: per quello usa [PDF in PNG](./pdf-to-png) o [PDF in JPG](./pdf-to-jpg).
- Se lo strumento segnala "Nessuna immagine trovata", il PDF potrebbe usare grafica vettoriale anziché immagini raster incorporate, oppure potrebbe essere un documento scansionato in cui l'intera pagina è una grande immagine.
- L'elaborazione in blocco funziona su più PDF. Tutte le immagini di tutti i file vengono riunite in un'unica griglia e in un unico ZIP.

## Strumenti correlati

- [PDF in PNG](./pdf-to-png)
- [PDF in JPG](./pdf-to-jpg)
- [Workflow Builder PDF](./pdf-workflow)
