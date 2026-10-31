---
title: PDF in JSON
description: Converti i file PDF in formato JSON strutturato con CPDF. Esporta la struttura interna del PDF come dati JSON leggibili da macchina.
---

# PDF in JSON

Converte uno o più file PDF in formato JSON. Lo strumento usa CPDF (Coherent PDF) per serializzare la struttura interna di ogni PDF in una rappresentazione JSON leggibile da macchina. L'output viene sempre consegnato come archivio ZIP.

## Come funziona

1. Seleziona uno o più file PDF con il selettore di file.
2. Clicca su **Converti** per avviare l'elaborazione. La conversione gira in un web worker in background.
3. Viene scaricato un archivio ZIP contenente un file JSON per ogni PDF in ingresso.

La barra di stato mostra l'avanzamento delle fasi di conversione e di creazione dello ZIP.

## Opzioni

Questo strumento non ha opzioni configurabili. Ogni PDF viene convertito nella sua rappresentazione JSON completa.

## Formato di output

- Un file `pdfs-to-json.zip` contenente `filename.json` per ogni PDF in ingresso.

L'output JSON rappresenta la struttura interna degli oggetti del PDF, inclusi alberi delle pagine, riferimenti ai font, metadati e flussi di contenuto.

## Casi d'uso

- Ispezionare la struttura interna di un PDF per il debug o la convalida.
- Estrarre in modo programmatico metadati strutturati e proprietà delle pagine.
- Passare i dati sulla struttura del PDF a pipeline di elaborazione personalizzate.
- Verificare la conformità dei documenti PDF analizzando i loro alberi di oggetti.

## Suggerimenti

- Questo strumento produce la struttura grezza degli oggetti del PDF, non il testo estratto. Se ti serve il testo delle pagine in formato JSON, usa invece [Prepara PDF per IA](./prepare-pdf-for-ai).
- Per l'estrazione del solo testo, [PDF in Testo](./pdf-to-text) è più diretto.
- I PDF grandi con strutture complesse producono file JSON molto grandi.

## Strumenti correlati

- [PDF in Testo](./pdf-to-text)
- [Prepara PDF per IA](./prepare-pdf-for-ai)
- [Estrai tabelle PDF](./extract-tables)
