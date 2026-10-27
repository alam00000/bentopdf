---
title: Visualizza metadati
description: Ispeziona tutte le proprietà dei metadati di un PDF, comprese informazioni del documento, dati XMP e dettagli strutturali.
---

# Visualizza metadati

Esamina le proprietà nascoste incorporate in un file PDF. Lo strumento mostra le informazioni del documento (titolo, autore, date), i metadati XMP, le dimensioni delle pagine e altri dati strutturali in un formato leggibile.

## Come funziona

1. Carica un file PDF.
2. Lo strumento analizza subito il file e mostra tutti i metadati disponibili in sezioni organizzate.
3. Consulta il dizionario delle informazioni del documento, l'albero dei metadati XMP e le proprietà strutturali.
4. Non serve alcuna fase di elaborazione: i metadati vengono mostrati appena il file è caricato.

## Funzionalità

- Mostra i campi standard delle informazioni del documento: Titolo, Autore, Oggetto, Parole chiave, Creatore, Produttore
- Mostra le date di creazione e modifica in un formato leggibile
- Analizza e visualizza l'intero albero dei metadati XMP con namespace annidati
- Converte il formato data PDF (`D:20240101120000Z`) in date leggibili
- Organizzato in sezioni comprimibili per una navigazione più semplice

## Sezioni dei metadati

| Sezione                    | Contenuto                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| **Informazioni documento** | Titolo, Autore, Oggetto, Parole chiave, Creatore, Produttore, Data di creazione, Data di modifica |
| **Metadati XMP**           | Albero completo dei metadati in formato XML con namespace Dublin Core, XAP, PDF e personalizzati  |
| **Proprietà documento**    | Numero di pagine, versione PDF, dimensione del file, stato della crittografia                     |

## Casi d'uso

- Controllare chi ha creato un PDF e quando è stato modificato l'ultima volta
- Verificare che i metadati siano impostati correttamente prima di pubblicare un documento
- Controllare la privacy dei PDF verificando quali informazioni personali sono incorporate
- Indagare sul software usato per creare o modificare un PDF (tramite il campo Produttore)
- Rivedere i metadati XMP per la conformità nella gestione delle risorse digitali

## Suggerimenti

- Le stringhe di data PDF che iniziano con `D:` vengono convertite automaticamente nel formato del tuo fuso orario locale.
- Se i campi dei metadati appaiono vuoti, significa semplicemente che chi ha creato il PDF non li ha impostati. Non tutti i PDF contengono metadati ricchi.
- Per modificare i metadati dopo averli ispezionati, usa [Modifica Metadati](./edit-metadata). Per rimuoverli del tutto, usa Rimuovi metadati.

## Strumenti correlati

- [Modifica Metadati](./edit-metadata)
- [Livelli OCG del PDF](./pdf-layers)
- [Confronta PDF](./compare-pdfs)
