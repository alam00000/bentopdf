---
title: PDF in CSV
description: Estrai le tabelle dai documenti PDF ed esportale in un unico file CSV. Gestisce i PDF multipagina con rilevamento automatico delle tabelle.
---

# PDF in CSV

Estrae le tabelle da un PDF e le esporta come file CSV. Lo strumento analizza ogni pagina alla ricerca di dati tabulari con il motore di rilevamento delle tabelle di PyMuPDF, poi scrive tutte le righe trovate in un unico output separato da virgole.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file.
2. Clicca su **Converti** per avviare l'estrazione delle tabelle.
3. Lo strumento analizza ogni pagina e identifica automaticamente le tabelle.
4. Viene scaricato un file `.csv` con tutti i dati delle tabelle estratte.

Le tabelle di pagine diverse sono separate da righe vuote nell'output. Le celle che contengono virgole, virgolette o ritorni a capo vengono correttamente protette secondo la RFC 4180.

## Opzioni

Questo strumento non ha opzioni configurabili. Tutte le tabelle trovate nel documento vengono estratte e combinate in un unico CSV.

## Formato di output

- Un unico file `filename.csv` contenente tutte le tabelle rilevate.

## Casi d'uso

- Portare in un foglio di calcolo i dati finanziari di estratti conto o fatture in PDF.
- Estrarre le tabelle dei prezzi dai preventivi dei fornitori per confrontarli.
- Convertire dati di ricerca tabulari da articoli in PDF in un formato adatto agli strumenti di analisi.
- Migrare in database i dati di vecchi report in PDF.

## Suggerimenti

- Se non vengono trovate tabelle, lo strumento mostra il messaggio "Nessuna tabella trovata". Di solito significa che il PDF usa un layout di testo che sembra tabulare ma non è strutturato come una vera tabella.
- Per un controllo maggiore sulle singole tabelle, usa [Estrai tabelle PDF](./extract-tables), che permette di scegliere tra i formati di output CSV, JSON e Markdown.
- Se ti servono i dati in formato Excel con fogli separati per ogni tabella, usa [PDF in Excel](./pdf-to-excel).

## Strumenti correlati

- [PDF in Excel](./pdf-to-excel)
- [Estrai tabelle PDF](./extract-tables)
- [PDF in Testo](./pdf-to-text)
