---
title: Rimuovi metadati
description: Elimina tutti i metadati nascosti dai file PDF, tra cui autore, titolo, data di creazione, produttore, dati XMP e ID del documento.
---

# Rimuovi metadati

Ogni PDF contiene metadati che possono rivelare chi lo ha creato, quale software è stato usato, quando è stato modificato l'ultima volta e altro ancora. Questo strumento li elimina tutti: il dizionario info, i flussi di metadati XMP, gli ID del documento e i dati specifici delle applicazioni, lasciando un documento pulito, senza alcuna traccia della sua origine.

## Come funziona

1. Carica un file PDF.
2. Fai clic su **Rimuovi metadati**.
3. Scarica il file ripulito.

Nessuna opzione da configurare. Lo strumento è accurato per scelta: cancella tutto.

## Cosa viene rimosso

- **Campi del dizionario info**: Titolo, Autore, Oggetto, Parole chiave, Creatore, Produttore, data di creazione, data di modifica
- **Flusso di metadati XMP**: il blocco di metadati basato su XML memorizzato nel catalogo del documento
- **ID del documento**: identificatori univoci nel trailer del PDF che possono servire a tracciare un documento tra sistemi diversi
- **PieceInfo**: metadati specifici delle applicazioni aggiunti da programmi come Illustrator o InDesign

## Cosa resta

- Tutto il contenuto visibile delle pagine (testo, immagini, grafica)
- Campi modulo e annotazioni
- Segnalibri e collegamenti
- La struttura del documento stesso

## Casi d'uso

- Rimuovere il tuo nome e la tua organizzazione da un documento prima di pubblicarlo in forma anonima
- Eliminare i timestamp di creazione che rivelano quando è stato preparato un documento
- Ripulire le stringhe del produttore che identificano il software PDF che usi
- Preparare documenti per invii normativi che richiedono PDF privi di metadati
- Rimuovere le tracce della cronologia delle modifiche prima di condividere un documento all'esterno

## Suggerimenti

- Usa prima lo strumento Visualizza Metadati per vedere esattamente quali metadati contiene il tuo PDF prima di eliminarli.
- Se devi rimuovere i metadati _e_ anche JavaScript, annotazioni e file incorporati, usa Sanitizza PDF per una pulizia più completa.
- La rimozione dei metadati è permanente. Conserva l'originale se potresti aver bisogno di quei dati in futuro.

## Strumenti correlati

- [Sanitizza PDF](./sanitize-pdf): rimuovi i metadati insieme a script, allegati e altro
- [Cripta PDF](./protect-pdf): proteggi con una password il PDF ripulito
- [Comprimi PDF](./compress-pdf): rimuovere i metadati può ridurre leggermente la dimensione del file, comprimi per risparmiare di più
