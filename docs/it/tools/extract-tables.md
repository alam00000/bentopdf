---
title: Estrai Tabelle
description: Rileva ed estrai le tabelle dai documenti PDF. Esporta in CSV, JSON o Markdown con granularità per singola tabella.
---

# Estrai Tabelle

Rileva tutte le tabelle in un PDF e ti permette di esportarle nel formato che preferisci: CSV, JSON o Markdown. Ogni tabella viene estratta singolarmente con metadati di pagina e posizione. Basato sul motore di rilevamento delle tabelle di PyMuPDF.

## Come funziona

1. Carica un PDF facendo clic sull'area di rilascio o trascinandoci sopra un file.
2. Seleziona il **formato di esportazione** preferito: CSV, JSON o Markdown.
3. Fai clic su **Estrai tabelle** per avviare l'elaborazione.
4. Se viene trovata una sola tabella, viene scaricata come singolo file. Più tabelle producono un archivio ZIP con un file per tabella.

## Opzioni

- **Formato di esportazione**: scegli tra:
  - **CSV**: valori separati da virgole con le corrette virgolette per i campi che contengono virgole, virgolette o a capo. Adatto a fogli di calcolo e database.
  - **JSON**: struttura ad array di array, formattata con indentazione di 2 spazi. Adatto all'uso programmatico.
  - **Markdown**: formato di tabella delimitato da barre verticali, generato da PyMuPDF. Adatto a documentazione e file README.

## Formato di output

- **Tabella singola**: `filename_table.csv` (oppure `.json` / `.md`)
- **Più tabelle**: `filename_tables.zip` con file chiamati `table_1_page3.csv`, `table_2_page5.csv`, ecc.

## Casi d'uso

- Estrarre tabelle specifiche da report PDF lunghi senza prelevare i dati dell'intero documento.
- Ottenere le tabelle in formato Markdown da incollare direttamente in issue di GitHub, wiki o documentazione.
- Ricavare dati JSON strutturati dalle tabelle PDF per integrazioni API o script.
- Confrontare le tabelle di versioni PDF diverse esportando entrambe in CSV e confrontandole con un diff.

## Suggerimenti

- Questo strumento offre il controllo per singola tabella. Se vuoi tutte le tabelle in un unico CSV, usa [PDF in CSV](./pdf-to-csv). Per una cartella di lavoro Excel completa, usa [PDF in Excel](./pdf-to-excel).
- Le tabelle che si estendono su più pagine potrebbero essere rilevate come tabelle separate per ogni pagina. Potrebbe essere necessario concatenarle manualmente.
- Se non vengono rilevate tabelle, il PDF potrebbe essere un'immagine scansionata. Esegui prima l'OCR per aggiungere un livello di testo.

## Strumenti correlati

- [PDF in CSV](./pdf-to-csv)
- [PDF in Excel](./pdf-to-excel)
- [PDF in Testo](./pdf-to-text)
