---
title: Testo in PDF
description: Converti file di testo semplice o testo digitato in PDF con font, colori e formati di pagina personalizzati.
---

# Testo in PDF

Converti il testo semplice in un PDF formattato. Puoi caricare file `.txt` oppure digitare direttamente nell'editor di testo integrato. Lo strumento supporta più font, colori del testo personalizzati e un'ampia gamma di formati di pagina, da A0 fino ad A10, oltre a US Letter, Legal e Tabloid.

## Formati supportati

| Input                  | Estensioni                   |
| :--------------------- | :--------------------------- |
| File di testo semplice | `.txt`                       |
| Inserimento diretto    | Digita o incolla nell'editor |

## Come funziona

1. Scegli la modalità di input con l'interruttore in alto: **Carica file** o **Digita testo**.
2. Se carichi file, trascinali oppure fai clic per selezionare uno o più file `.txt`. Se digiti, inserisci il testo direttamente nell'area di testo.
3. Configura le opzioni di formattazione: famiglia di caratteri, dimensione del carattere, colore del testo e formato di pagina.
4. Fai clic su **Crea PDF**. L'output viene scaricato come `text_to_pdf.pdf`.

Quando carichi più file, i loro contenuti vengono concatenati con righe vuote in mezzo.

## Opzioni

| Opzione                   | Valori                                                                   | Predefinito    |
| :------------------------ | :----------------------------------------------------------------------- | :------------- |
| **Famiglia di caratteri** | Helvetica (sans-serif), Tiro (serif), Courier (monospace), Times (serif) | Helvetica      |
| **Dimensione carattere**  | 6 - 72 pt                                                                | 12             |
| **Colore del testo**      | Qualsiasi colore tramite il selettore                                    | Nero (#000000) |
| **Formato di pagina**     | ISO A0-A10, B0-B10, C0-C10, US Letter, Legal, Tabloid, Ledger, 11x17     | A4             |

Le lingue RTL (arabo, ebraico, persiano, urdu) vengono rilevate automaticamente. Quando viene trovato testo RTL, la direzione e l'allineamento del testo cambiano di conseguenza.

## Casi d'uso

- Convertire frammenti di codice o file di log in un PDF stampabile con il font Courier
- Creare al volo un PDF da appunti di una riunione digitati sul momento
- Formattare un manoscritto in testo semplice con un font e un formato di pagina specifici per l'invio
- Produrre una versione PDF di un README o di un changelog per la distribuzione offline

## Suggerimenti

- Usa la modalità **Digita testo** quando vuoi convertire rapidamente il contenuto degli appunti senza salvarlo prima in un file.
- Courier (monospace) è la scelta migliore per codice, log o qualsiasi contenuto in cui conta l'allineamento delle colonne.
- I margini della pagina sono fissi a 72 punti (1 pollice) su tutti i lati.

## Strumenti correlati

- [Markdown in PDF](./markdown-to-pdf)
- [CSV in PDF](./csv-to-pdf)
- [Word in PDF](./word-to-pdf)
