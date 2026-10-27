---
title: Aggiungi etichette di pagina
description: Aggiungi etichette di pagina PDF con numeri romani, prefissi alfabetici, numerazione personalizzata e più regole per documento.
---

# Aggiungi etichette di pagina

Le etichette di pagina controllano come vengono mostrati i numeri di pagina nei visualizzatori PDF (il numero nella barra degli strumenti, non quello stampato sulla pagina). Questo strumento ti permette di assegnare schemi di etichettatura diversi a intervalli di pagine diversi: numeri romani per le pagine iniziali, numeri decimali per il corpo del testo, appendici con lettere e altro ancora.

## Come funziona

1. Carica il tuo file PDF.
2. Compare il pannello delle opzioni con una regola di etichetta predefinita.
3. Configura ogni regola con un intervallo di pagine, uno stile, un prefisso facoltativo e un valore iniziale.
4. Fai clic su **Aggiungi regola** per creare regole aggiuntive per sezioni diverse.
5. Fai clic su **Aggiungi Etichette di Pagina** per applicare tutte le regole e scaricare il risultato.

## Opzioni

Ogni regola di etichetta ha queste impostazioni:

- **Intervallo di pagine**: le pagine a cui si applica la regola. Lascia vuoto per tutte le pagine. Supporta intervalli come `1-4`, `7`, `odd` o `1-9,30-40`.
- **Stile etichetta**: Arabo decimale, Romano minuscolo (i, ii, iii), Romano maiuscolo (I, II, III), Lettere minuscole (a, b, c), Lettere maiuscole (A, B, C) o Nessuna etichetta (solo prefisso).
- **Prefisso etichetta**: testo facoltativo anteposto a ogni etichetta, ad esempio "A-" per creare etichette come A-1, A-2, A-3.
- **Valore iniziale**: il numero da cui iniziare il conteggio. Il valore predefinito è 1. Imposta 0 per una numerazione che parte da zero.
- **Continua la numerazione tra intervalli non contigui**: attivalo quando una regola riguarda pagine non contigue (come `1-9,30-40` o `odd`) e vuoi che la numerazione prosegua in sequenza.
- **Rimuovi le etichette di pagina esistenti**: selezionato per impostazione predefinita. Cancella le etichette precedenti prima di applicare le nuove regole.

## Funzionalità

- Più regole di etichetta per documento, per schemi di numerazione complessi
- Sei stili di etichetta che coprono tutti i sistemi di numerazione standard
- Supporto di prefissi personalizzati per l'etichettatura per sezioni
- Supporto di intervalli non contigui con numerazione progressiva
- Possibilità di mantenere o rimuovere le etichette esistenti

## Casi d'uso

- Impostare etichette con numeri romani (i, ii, iii) per la prefazione di un libro e numeri decimali per il testo principale
- Etichettare le pagine delle appendici con prefissi alfabetici come "A-1", "A-2", "B-1", "B-2"
- Correggere le etichette di pagina in un documento scansionato in cui i numeri di pagina fisici non corrispondono all'ordine delle pagine del PDF
- Aggiungere una numerazione che parte da zero per documenti tecnici

## Suggerimenti

- Le etichette di pagina sono metadati che i visualizzatori PDF mostrano nella barra di navigazione. Non vengono stampate sulla pagina. Per numeri visibili, usa [Numeri di Pagina](./page-numbers).
- Questo strumento richiede che CoherentPDF (CPDF) sia configurato nelle tue Impostazioni WASM. Se non è configurato, ti verrà chiesto di farlo.

## Strumenti correlati

- [Numeri di Pagina](./page-numbers)
- [Numerazione Bates](./bates-numbering)
- [Modifica Segnalibri](./bookmark)
