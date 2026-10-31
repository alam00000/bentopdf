---
title: Excel in PDF
description: Converti fogli di calcolo Excel (XLS, XLSX), ODS e file CSV in PDF preservando la formattazione.
---

# Excel in PDF

Converti i file di fogli di calcolo in PDF. Lo strumento gestisce i file Excel moderni, il vecchio formato XLS, i fogli di calcolo OpenDocument e persino i CSV, il tutto reso tramite un motore LibreOffice nel browser che preserva la formattazione delle celle, le formule (come valori calcolati), i grafici e i layout a più fogli.

## Formati supportati

| Formato                  | Estensioni |
| :----------------------- | :--------- |
| Excel (moderno)          | `.xlsx`    |
| Excel (legacy)           | `.xls`     |
| OpenDocument Spreadsheet | `.ods`     |
| CSV                      | `.csv`     |

## Come funziona

1. Fai clic sull'area di caricamento o trascina i tuoi file di fogli di calcolo.
2. Controlla l'elenco dei file. Aggiungine altri o rimuovi quelli indesiderati.
3. Fai clic su **Converti in PDF**. Il motore LibreOffice si inizializza al primo utilizzo, poi elabora ogni file.
4. Un singolo file viene scaricato direttamente come PDF. Più file vengono consegnati come `excel-converted.zip`.

## Opzioni

Questo strumento non ha configurazioni aggiuntive. Il motore LibreOffice determina layout di pagina, scala e area di stampa in base alle impostazioni integrate del foglio di calcolo.

## Output

| Numero di input | Output                                                                 |
| :-------------- | :--------------------------------------------------------------------- |
| 1 file          | Download di un singolo PDF (nome file originale con estensione `.pdf`) |
| 2+ file         | Archivio ZIP (`excel-converted.zip`) con un PDF per ogni file          |

## Casi d'uso

- Convertire report finanziari o budget da Excel a PDF per la distribuzione
- Creare PDF pronti per la stampa da fogli di calcolo di inventario o cataloghi prodotti
- Condividere i risultati di analisi dei dati con persone che non hanno Excel installato
- Archiviare i report trimestrali in un formato non modificabile
- Convertire in PDF i file ODS di LibreOffice Calc

## Suggerimenti

- I grafici incorporati nel foglio di calcolo vengono resi nel PDF. Assicurati che siano corretti nel file di origine prima di convertire.
- Se il foglio di calcolo ha più fogli, tutti i fogli sono inclusi nel PDF di output.
- Per semplici dati CSV senza formattazione, lo strumento [CSV in PDF](./csv-to-pdf) offre una conversione più leggera. Usa Excel in PDF quando ti serve preservare formattazione, grafici o più fogli.

## Strumenti correlati

- [CSV in PDF](./csv-to-pdf)
- [Word in PDF](./word-to-pdf)
- [PowerPoint in PDF](./powerpoint-to-pdf)
