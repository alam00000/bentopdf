---
title: CBZ in PDF
description: Converti gli archivi di fumetti CBZ e CBR in PDF nel tuo browser. Gratuito, privato, senza caricamenti.
---

# CBZ in PDF

Trasforma gli archivi di fumetti in PDF. CBZ e CBR sono i formati standard per i fumetti digitali: sono semplici archivi ZIP o RAR pieni di immagini. Questo strumento estrae ogni pagina, mantiene l'ordine di lettura e produce un PDF pulito in cui ogni immagine diventa una pagina a dimensione intera.

## Formati supportati

| Formato | Estensione | Note                                                                    |
| :------ | :--------- | :---------------------------------------------------------------------- |
| CBZ     | `.cbz`     | Archivio di fumetti basato su ZIP (elaborato in locale con pdf-lib)     |
| CBR     | `.cbr`     | Archivio di fumetti basato su RAR (elaborato tramite il motore PyMuPDF) |

Il convertitore CBZ riconosce le immagini JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC e JXL contenute nell'archivio. I formati non standard vengono convertiti automaticamente in PNG prima di essere incorporati.

## Come funziona

1. Fai clic sull'area di caricamento o trascina i tuoi file CBZ o CBR. Puoi mescolare entrambi i formati in un unico lotto.
2. Controlla i file elencati. Rimuovi quelli che non ti servono oppure fai clic su **Aggiungi altri file** per aggiungerne altri.
3. Fai clic su **Converti in PDF**. Per i file CBZ, lo strumento decomprime l'archivio, ordina le immagini per nome in ordine naturale, rileva il formato reale di ogni immagine e le incorpora in un PDF con pdf-lib. I file CBR passano invece dal motore PyMuPDF.
4. Un singolo file viene scaricato come PDF. Più file producono un archivio ZIP chiamato `comic-converted.zip`.

## Opzioni

Non serve alcuna configurazione. Ogni immagine diventa una pagina con le stesse dimensioni dell'originale, quindi le doppie pagine restano larghe e le pagine singole restano strette.

## Casi d'uso

- Leggere i fumetti su un tablet o su un'app per smartphone che supporta il PDF ma non CBZ/CBR
- Stampare pagine specifiche da un fumetto digitale
- Archiviare una collezione di fumetti in un formato che qualsiasi visualizzatore di file può aprire
- Condividere un fumetto con chi non ha un lettore di fumetti dedicato

## Suggerimenti

- Le immagini all'interno dell'archivio sono ordinate in ordine naturale (quindi `page2.jpg` viene prima di `page10.jpg`). Assegna ai file una numerazione coerente per ottenere la sequenza di pagine corretta.
- Il convertitore rileva i formati delle immagini dalle firme binarie, non dalle estensioni dei file. Un PNG chiamato per errore `.jpg` verrà comunque incorporato correttamente.
- I file CBZ vengono elaborati interamente nel browser senza caricare il motore PyMuPDF, quindi si convertono più velocemente dei file CBR.

## Strumenti correlati

- [EPUB in PDF](./epub-to-pdf)
- [MOBI in PDF](./mobi-to-pdf)
- [Immagini in PDF](./image-to-pdf)
