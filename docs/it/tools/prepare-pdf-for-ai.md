---
title: Prepara PDF per IA
description: Estrai il contenuto dei PDF in JSON strutturato, ottimizzato per LLM e pipeline di IA come LlamaIndex. Supporta l'elaborazione in batch.
---

# Prepara PDF per IA

Estrae il contenuto dei file PDF e lo struttura in JSON ottimizzato per l'importazione in modelli linguistici di grandi dimensioni (LLM) e framework di IA come LlamaIndex. Il contenuto di ogni pagina viene estratto e organizzato in un formato strutturato, pronto per pipeline RAG, chatbot o sistemi di ricerca semantica.

## Come funziona

1. Carica uno o più PDF facendo clic sull'area di rilascio o trascinandovi i file.
2. Fai clic su **Estrai** per avviare l'elaborazione.
3. Un singolo file viene scaricato come `filename_llm.json`. Più file producono un archivio `pdf-for-ai.zip`.

Lo strumento usa l'integrazione LlamaIndex di PyMuPDF per estrarre il contenuto a livello di pagina insieme ai metadati, producendo un output che può essere caricato direttamente nei framework di IA.

## Opzioni

Questo strumento non ha opzioni configurabili. Tutte le pagine vengono estratte con testo completo e metadati.

## Formato di output

- **File singolo**: `filename_llm.json`
- **File multipli**: `pdf-for-ai.zip` con un `_llm.json` per ogni PDF di input.

L'output JSON segue lo schema dei documenti di LlamaIndex, con il testo di ogni pagina e i campi dei metadati.

## Casi d'uso

- Preparare documenti PDF per pipeline di retrieval-augmented generation (RAG).
- Creare una base di conoscenza consultabile da archivi PDF per un chatbot di IA.
- Fornire report PDF a flussi di analisi basati su LLM.
- Pre-elaborare articoli scientifici per sistemi di ricerca semantica e di domande e risposte.
- Creare dati di addestramento strutturati da raccolte di documenti PDF.

## Suggerimenti

- Per l'estrazione di solo testo, senza formattazione specifica per l'IA, usa [PDF in Testo](./pdf-to-text).
- Per un output Markdown che conservi titoli e struttura, usa [PDF in Markdown](./pdf-to-markdown).
- I PDF scansionati producono un output vuoto o minimo. Passali prima dall'OCR per aggiungere un livello di testo prima dell'estrazione.

## Strumenti correlati

- [PDF in Testo](./pdf-to-text)
- [PDF in Markdown](./pdf-to-markdown)
- [PDF in JSON](./pdf-to-json)
