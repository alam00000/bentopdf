---
title: Modifica segnalibri
description: Aggiungi, modifica, importa, esporta ed elimina i segnalibri dei PDF con un editor visuale e supporto CSV/JSON.
---

# Modifica segnalibri

L'editor di segnalibri ti dà il pieno controllo sui segnalibri di navigazione del PDF (detti anche struttura o outline). Puoi aggiungere nuovi segnalibri, modificare quelli esistenti, riorganizzare la gerarchia e importare o esportare i dati dei segnalibri in formato CSV e JSON.

## Come funziona

1. Carica il tuo PDF facendo clic o trascinando un file nell'area di rilascio.
2. Facoltativamente, seleziona **Estrai automaticamente segnalibri esistenti** per importare l'albero dei segnalibri attuale del documento.
3. L'editor si apre con una vista divisa: il visualizzatore PDF a sinistra, il pannello dei segnalibri a destra.
4. Digita il titolo di un segnalibro e fai clic su **Aggiungi alla pagina** per crearne uno che punta alla pagina corrente.
5. Usa i pulsanti della barra degli strumenti per riordinare, formattare o eliminare i segnalibri.
6. Fai clic su **Salva PDF con segnalibri** per scaricare il file aggiornato.

## Funzionalità

- Visualizzatore PDF con navigazione tra le pagine, controlli dello zoom e campo per andare a una pagina
- Aggiungi segnalibri a qualsiasi pagina con un solo clic
- Fai clic direttamente sul PDF per impostare una destinazione precisa del segnalibro (modalità selezione)
- Gerarchia di segnalibri annidati con riordinamento tramite trascinamento
- Operazioni in blocco: seleziona più segnalibri per cambiarne colore e stile o eliminarli in una volta
- Ricerca dei segnalibri per trovare rapidamente le voci in alberi grandi
- Annulla e ripeti per tutte le modifiche
- Importa segnalibri da file CSV (titolo, pagina, livello) o JSON
- Esporta i segnalibri in CSV o JSON per modificarli all'esterno
- Stile dei segnalibri: colore (rosso, blu, verde, giallo, viola) e stile del carattere (grassetto, corsivo, grassetto corsivo)
- Navigazione rapida: scorri le pagine con i tasti Pag su/giù

## Opzioni

- **Estrai automaticamente segnalibri esistenti**: se selezionata, lo strumento legge e mostra i segnalibri attuali del PDF al caricamento.
- **Modalità batch**: attivala per selezionare più segnalibri e applicare in blocco colore, stile o eliminazione.
- **Espandi tutto / Comprimi tutto**: mostra o nascondi rapidamente i segnalibri figli annidati.

## Casi d'uso

- Aggiungere un indice a un manuale o a un libro di testo privo di segnalibri
- Ristrutturare i segnalibri in un documento scansionato dopo l'elaborazione OCR
- Esportare i segnalibri in CSV, modificarli in un foglio di calcolo e reimportarli
- Ripulire segnalibri generati automaticamente con riferimenti di pagina errati
- Aggiungere segnalibri colorati per evidenziare le sezioni importanti in una memoria legale

## Suggerimenti

- Usa l'importazione CSV per creare segnalibri in massa. Il formato è semplice: `title,page,level`, dove il livello 1 è il livello principale.
- La modalità selezione ti permette di fare clic su un punto esatto della pagina PDF per impostare la destinazione del segnalibro, in modo più preciso rispetto al solo numero di pagina.
- Esporta i segnalibri prima di apportare modifiche importanti, così avrai un backup.

## Strumenti correlati

- [Indice](./table-of-contents)
- [Editor PDF](./edit-pdf)
- [Aggiungi etichette di pagina](./add-page-labels)
