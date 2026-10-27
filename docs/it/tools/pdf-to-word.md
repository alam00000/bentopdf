---
title: PDF in Word
description: Converti i file PDF in documenti Word (DOCX) modificabili. Supporta la conversione in blocco di più PDF contemporaneamente.
---

# PDF in Word

Converte i file PDF in documenti Word (`.docx`) modificabili. Lo strumento usa PyMuPDF per ricostruire il contenuto del documento, mantenendo testo, formattazione di base e layout. Supporta la conversione di singoli file e in blocco.

## Come funziona

1. Carica uno o più PDF cliccando sull'area di rilascio o trascinandovi sopra i file. Puoi aggiungere altri file o rimuovere singoli file dall'elenco.
2. Clicca su **Converti** per avviare l'elaborazione.
3. Un singolo file viene scaricato come `filename.docx`. Più file vengono raccolti in `converted-documents.zip`.

## Opzioni

Questo strumento non ha opzioni configurabili. Ogni PDF viene convertito in DOCX con il motore di conversione integrato di PyMuPDF.

## Formato di output

- **File singolo**: `filename.docx`
- **Più file**: `converted-documents.zip` contenente un `.docx` per ogni PDF in ingresso.

## Casi d'uso

- Modificare il testo di un PDF ricevuto che devi correggere.
- Convertire report PDF archiviati in un formato che i colleghi possono modificare in Microsoft Word o Google Docs.
- Portare in Word il contenuto di contratti o proposte in PDF per le revisioni.
- Migrare vecchia documentazione PDF in un formato modificabile.

## Suggerimenti

- I layout complessi con testo su più colonne, moduli incorporati o molta grafica potrebbero non essere convertiti perfettamente. Controlla l'output e correggi la formattazione nel tuo elaboratore di testi.
- I PDF scansionati (solo immagine) producono file DOCX vuoti o quasi. Passali prima attraverso l'OCR per aggiungere un livello di testo.
- La modalità in blocco è efficiente per convertire intere cartelle di PDF: caricali tutti insieme.

## Strumenti correlati

- [PDF in Testo](./pdf-to-text)
- [PDF in Markdown](./pdf-to-markdown)
- [Costruttore di workflow PDF](./pdf-workflow)
