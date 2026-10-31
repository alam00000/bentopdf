---
title: PDF in Excel
description: Estrai le tabelle dai documenti PDF in un foglio di calcolo Excel. Ogni tabella ha il suo foglio di lavoro con i riferimenti alla pagina.
---

# PDF in Excel

Estrae le tabelle da un PDF e le salva come foglio di calcolo Excel (`.xlsx`). Ogni tabella rilevata viene collocata in un foglio di lavoro dedicato, con il numero della tabella e la pagina di origine. Usa PyMuPDF per il rilevamento delle tabelle e la libreria SheetJS per generare il file Excel.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file.
2. Clicca su **Converti** per avviare l'estrazione delle tabelle.
3. Lo strumento analizza ogni pagina alla ricerca di tabelle, poi costruisce una cartella di lavoro Excel.
4. Viene scaricato un file `.xlsx` con un foglio per ogni tabella.

## Opzioni

Questo strumento non ha opzioni configurabili. Tutte le tabelle rilevate vengono estratte automaticamente.

## Formato di output

- Un unico file `filename.xlsx`.
- **Una tabella**: un solo foglio di lavoro chiamato "Table".
- **Più tabelle**: fogli di lavoro chiamati "Table 1 (Page 3)", "Table 2 (Page 5)", ecc. I nomi dei fogli vengono troncati a 31 caratteri (il limite di Excel).

## Casi d'uso

- Convertire report finanziari in PDF in fogli di calcolo modificabili per ulteriori analisi.
- Estrarre tabelle di inventario o ordini dai PDF dei fornitori.
- Portare in Excel dati strutturati di moduli o cataloghi PDF per ordinarli e filtrarli.
- Archiviare dati tabulari di PDF in un formato con cui possono lavorare anche i colleghi non tecnici.

## Suggerimenti

- Se lo strumento segnala "Nessuna tabella trovata", il PDF probabilmente usa un layout di testo libero invece di tabelle strutturate. Prova [PDF in Testo](./pdf-to-text) per ottenere invece il contenuto grezzo.
- Per un formato piatto più semplice, usa [PDF in CSV](./pdf-to-csv). Per scaricare ogni tabella in più formati, usa [Estrai tabelle PDF](./extract-tables).
- Controlla i nomi dei fogli per capire da quale pagina proviene ogni tabella.

## Strumenti correlati

- [PDF in CSV](./pdf-to-csv)
- [Estrai tabelle PDF](./extract-tables)
- [PDF in Testo](./pdf-to-text)
