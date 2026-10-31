---
title: Ripara PDF
description: Recupera i dati da file PDF corrotti o danneggiati con il motore di riparazione di QPDF. Supporta l'elaborazione in batch.
---

# Ripara PDF

Quando un PDF non si apre, mostra contenuti illeggibili o genera errori nel tuo visualizzatore, questo strumento tenta di ricostruirne la struttura interna. Usa il motore di riparazione di QPDF, in grado di recuperare i dati da molti tipi di corruzione: tabelle di riferimenti incrociati danneggiate, stream troncati, riferimenti a oggetti non validi e altro ancora.

## Come funziona

1. Carica uno o più file PDF danneggiati.
2. Fai clic su **Ripara PDF**.
3. Un singolo file riparato viene scaricato direttamente. Più file producono un archivio ZIP.

Lo strumento fa passare ogni file da QPDF con il flag `--decrypt`, che costringe QPDF a leggere e riscrivere l'intera struttura del PDF, correggendo lungo il percorso i problemi recuperabili.

## Funzionalità

- Riparazione in batch di più PDF in una sola operazione
- Rilevamento automatico dei file recuperabili e di quelli irrecuperabili
- Report di successo/errore per ogni file quando ne elabori più di uno
- Usa QPDF (WebAssembly), una libreria di trasformazione PDF collaudata

## Cosa può correggere

- Tabelle di riferimenti incrociati danneggiate o mancanti
- Finali di file troncati da download incompleti
- Numerazione degli oggetti e lunghezze degli stream non valide
- Piccole incoerenze strutturali dovute a generatori PDF difettosi
- Artefatti di crittografia dovuti a tentativi di decrittografia falliti

## Cosa non può correggere

- File gravemente troncati in cui manca la maggior parte dei dati
- PDF criptati con una password che non hai
- File che in realtà non sono PDF (estensione sbagliata)
- Corruzione delle immagini all'interno del PDF (la struttura viene corretta, ma i dati dei pixel non vengono rigenerati)

## Casi d'uso

- Recuperare un PDF da un download via email non riuscito
- Aprire file prodotti da generatori PDF datati o non standard
- Correggere PDF che funzionano in un visualizzatore ma non in un altro
- Preparare documenti d'archivio danneggiati per la conservazione a lungo termine

## Suggerimenti

- Se la riparazione fallisce, prova prima ad aprire il file in un browser: i browser hanno una propria logica di recupero e potrebbero mostrare abbastanza contenuto da poterlo salvare di nuovo.
- Per i PDF criptati che non si riescono a riparare, prova prima Decrittografa PDF, poi ripara l'output decrittografato.

## Strumenti correlati

- [Comprimi PDF](./compress-pdf): pulisci ulteriormente la struttura del PDF riparato
- [Linearizza PDF](./linearize-pdf): ottimizza il file riparato per la distribuzione sul web
- [Appiattisci PDF](./flatten-pdf): appiattisci i moduli che potrebbero essere stati danneggiati
