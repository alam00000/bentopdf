---
title: JSON in PDF
description: Ricostruisci i file PDF dal formato JSON di BentoPDF. Riconverti le esportazioni JSON nei documenti PDF originali.
---

# JSON in PDF

Ricostruisci documenti PDF a partire da file JSON creati in precedenza con lo strumento **PDF in JSON** di BentoPDF. È uno strumento di conversione di andata e ritorno: prende la rappresentazione strutturata in JSON di un PDF e ricostruisce il documento originale.

::: warning
Questo strumento accetta solo file JSON prodotti dal convertitore PDF in JSON di BentoPDF. I file JSON standard provenienti da API, database o altri strumenti non sono supportati.
:::

## Formati supportati

| Input   | Descrizione                                                 |
| :------ | :---------------------------------------------------------- |
| `.json` | File JSON esportati dallo strumento PDF in JSON di BentoPDF |

## Come funziona

1. Clicca sull'area di caricamento o trascina uno o più file JSON.
2. L'elenco dei file mostra ogni file selezionato con la sua dimensione.
3. Clicca su **Converti in PDF**. Lo strumento elabora tutti i file con un Web Worker e il motore CPDF.
4. Il risultato viene scaricato come `jsons-to-pdf.zip`, contenente un PDF per ogni file JSON in ingresso.

La conversione viene eseguita in un Web Worker in background, quindi l'interfaccia resta reattiva anche con file di grandi dimensioni.

## Opzioni

Questo strumento non ha opzioni configurabili. La struttura del JSON determina interamente il PDF risultante.

## Output

Quando converti più file JSON, i risultati vengono consegnati come archivio ZIP. Ogni PDF prende il nome del file JSON di origine (ad es. `report.json` diventa `report.pdf`).

## Casi d'uso

- Ripristinare PDF da un backup o da una pipeline di archiviazione basati su JSON
- Far passare un PDF attraverso il JSON per ispezionarlo e poi riconvertirlo in PDF
- Ricostruire documenti dopo modifiche programmatiche alla struttura JSON
- Verificare che un'esportazione da PDF a JSON abbia catturato tutto il contenuto del documento riconvertendola

## Suggerimenti

- Se devi convertire dati JSON arbitrari (come risposte di API o file di configurazione) in un PDF formattato, lo strumento [Testo in PDF](./txt-to-pdf) è più adatto. Incolla il JSON come testo e verrà reso con una formattazione adeguata.
- Il motore WebAssembly CPDF deve essere disponibile perché questo strumento funzioni. Le istanze self-hosted richiedono la configurazione dei file WASM di CPDF.

## Strumenti correlati

- [Testo in PDF](./txt-to-pdf)
- [Markdown in PDF](./markdown-to-pdf)
- [CSV in PDF](./csv-to-pdf)
