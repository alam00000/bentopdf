---
title: PDF in Testo
description: Estrai il testo semplice dai file PDF. Supporta l'estrazione in blocco di più PDF con output in file TXT.
---

# PDF in Testo

Estrae tutto il contenuto testuale dai file PDF e lo salva come semplici file `.txt`. Supporta l'elaborazione in blocco: carica più PDF e ottieni il testo di ciascuno in una sola operazione. Usa PyMuPDF.

## Come funziona

1. Carica uno o più PDF cliccando sull'area di rilascio o trascinandovi sopra i file. Gestisci l'elenco dei file con i pulsanti Aggiungi altri e Cancella.
2. Clicca su **Estrai** per avviare l'elaborazione.
3. Un singolo file viene scaricato come `filename.txt`. Più file producono un archivio `pdf-to-text.zip`.

## Opzioni

Questo strumento non ha opzioni configurabili. Tutto il testo viene estratto da ogni pagina nell'ordine di lettura.

## Formato di output

- **File singolo**: `filename.txt`
- **Più file**: `pdf-to-text.zip` contenente un `.txt` per ogni PDF in ingresso.

## Casi d'uso

- Estrarre il testo principale dai report PDF per l'indicizzazione della ricerca full-text.
- Convertire ebook o articoli PDF in testo semplice da leggere su dispositivi e-ink.
- Ricavare il testo da contratti o documenti legali per l'analisi delle parole chiave.
- Eliminare la formattazione dai PDF per ottenere testo pulito per script di elaborazione dati.
- Preparare un corpus di testo da archivi PDF per l'elaborazione del linguaggio naturale.

## Suggerimenti

- I PDF scansionati (solo immagine) producono file di testo vuoti perché non c'è alcun livello di testo da estrarre. Passa prima i documenti scansionati attraverso l'OCR.
- L'output mantiene l'ordine di lettura interpretato da PyMuPDF, che in genere procede da sinistra a destra e dall'alto in basso. I layout a più colonne possono produrre testo intercalato.
- Per un output strutturato con titoli e formattazione, prova [PDF in Markdown](./pdf-to-markdown). Per JSON strutturato pronto per l'IA, usa [Prepara PDF per IA](./prepare-pdf-for-ai).

## Strumenti correlati

- [PDF in Markdown](./pdf-to-markdown)
- [Prepara PDF per IA](./prepare-pdf-for-ai)
- [PDF in Word](./pdf-to-word)
