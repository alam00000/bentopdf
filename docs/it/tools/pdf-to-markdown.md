---
title: PDF in Markdown
description: Converti i documenti PDF in formato Markdown con estrazione opzionale delle immagini. Supporta la conversione in blocco di più file.
---

# PDF in Markdown

Converte i file PDF in formato Markdown (`.md`), mantenendo titoli, paragrafi, elenchi e formattazione di base. Può estrarre e includere le immagini incorporate. Supporta la conversione di singoli file e in blocco. Usa PyMuPDF.

## Come funziona

1. Carica uno o più PDF cliccando sull'area di rilascio o trascinandovi sopra i file.
2. Se vuoi, attiva **Includi immagini** per incorporare le immagini estratte nell'output Markdown.
3. Clicca su **Converti** per avviare l'elaborazione.
4. Un singolo file viene scaricato come `filename.md`. Più file producono un `markdown-files.zip`.

## Opzioni

- **Includi immagini**: se selezionata, le immagini incorporate nel PDF vengono estratte e referenziate nell'output Markdown. Se deselezionata, viene convertito solo il contenuto testuale.

## Formato di output

- **File singolo**: `filename.md`
- **Più file**: `markdown-files.zip` contenente un `.md` per ogni PDF in ingresso.

## Casi d'uso

- Convertire la documentazione PDF in Markdown per un generatore di siti statici come VitePress, Hugo o Jekyll.
- Trasformare articoli di ricerca in PDF in Markdown modificabile per app di appunti come Obsidian.
- Migrare vecchie basi di conoscenza in PDF in un formato di testo adatto a Git.
- Estrarre contenuti strutturati da ebook in PDF per riformattarli.

## Suggerimenti

- L'opzione Includi immagini è utile quando il PDF contiene diagrammi o figure essenziali per il contenuto. Disattivala per i documenti ricchi di testo, per mantenere l'output pulito.
- I layout complessi con barre laterali, note a piè di pagina o testo su più colonne possono produrre un Markdown imperfetto. Controlla e correggi l'output se necessario.
- Per il testo grezzo senza alcuna formattazione, usa invece [PDF in Testo](./pdf-to-text).

## Strumenti correlati

- [PDF in Testo](./pdf-to-text)
- [PDF in Word](./pdf-to-word)
- [Prepara PDF per IA](./prepare-pdf-for-ai)
