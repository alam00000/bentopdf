---
title: Linearizza PDF
description: Ottimizza i file PDF per una visualizzazione web rapida con caricamento progressivo. Noto anche come ottimizzazione "Fast Web View".
---

# Linearizza PDF

La linearizzazione ristruttura un PDF in modo che la prima pagina possa essere mostrata prima che l'intero file sia stato scaricato. Adobe la chiama "Fast Web View". Se ospiti PDF su un sito web o li servi tramite un portale documentale, la linearizzazione li fa aprire in modo molto più rapido.

## Come funziona

1. Carica uno o più file PDF.
2. Clicca su **Linearizza PDF**.
3. Scarica i risultati come archivio ZIP contenente tutti i file linearizzati.

Non ci sono impostazioni da configurare. Lo strumento usa il flag `--linearize` di QPDF, che riorganizza la struttura interna del PDF senza alterarne il contenuto visivo.

## Cosa fa la linearizzazione

- Riordina gli oggetti del PDF in modo che i dati della prima pagina compaiano all'inizio del file
- Aggiunge un dizionario di linearizzazione e tabelle di suggerimento, così i visualizzatori sanno dove trovare ogni pagina
- Abilita le richieste byte-range: un browser può scaricare solo la prima pagina senza scaricare l'intero file
- Ripulisce la tabella dei riferimenti incrociati per un accesso casuale efficiente

## Funzionalità

- Elaborazione in blocco di più PDF in una sola operazione
- Il risultato conserva tutti i contenuti, i font, le immagini e gli elementi interattivi
- Usa QPDF (WebAssembly) per una linearizzazione affidabile e conforme agli standard
- I risultati vengono raggruppati in un file ZIP per un download comodo

## Casi d'uso

- Ospitare report PDF su un sito web dove gli utenti si aspettano la visualizzazione immediata delle pagine
- Incorporare PDF in applicazioni web con visualizzatori nel browser
- Pubblicare cataloghi o manuali PDF consultati su connessioni mobili lente
- Preparare documenti per le reti di distribuzione dei contenuti (CDN) che supportano il servizio byte-range

## Suggerimenti

- Linearizza dopo aver completato tutte le altre modifiche. Qualsiasi modifica successiva (unione, aggiunta di pagine) interrompe la linearizzazione.
- Combinala con Comprimi PDF per ottenere PDF il più piccoli e veloci da caricare possibile.
- La linearizzazione aggiunge un piccolo sovraccarico alla dimensione del file (in genere meno dell'1%).

## Strumenti correlati

- [Comprimi PDF](./compress-pdf): riduci la dimensione del file prima di linearizzare
- [Ripara PDF](./repair-pdf): correggi i problemi strutturali che impediscono la linearizzazione
- [Rimuovi Metadati](./remove-metadata): elimina i metadati prima di pubblicare online
