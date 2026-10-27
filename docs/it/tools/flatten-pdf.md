---
title: Appiattisci PDF
description: Appiattisci moduli interattivi e annotazioni in contenuto statico. Rende i campi dei moduli non modificabili e fonde le annotazioni nella pagina.
---

# Appiattisci PDF

L'appiattimento fonde gli elementi interattivi (campi dei moduli, menu a tendina, caselle di controllo, annotazioni, evidenziazioni, note adesive) direttamente nel contenuto della pagina. L'aspetto visivo resta lo stesso, ma nulla è più modificabile o estraibile. È l'equivalente PDF di stampare un modulo compilato e scansionarlo di nuovo, con la differenza che la qualità resta perfetta.

## Come funziona

1. Carica uno o più file PDF.
2. Clicca su **Appiattisci PDF**.
3. Un singolo file viene scaricato direttamente. Più file producono un archivio ZIP.

Lo strumento usa pdf-lib per appiattire i campi dei moduli (tramite `form.flatten()`) e un apposito appiattitore di annotazioni per fondere le annotazioni nel flusso della pagina. Entrambe le operazioni avvengono in un unico passaggio.

## Cosa viene appiattito

- **Campi dei moduli**: campi di testo, caselle di controllo, pulsanti di opzione, menu a tendina, campi firma
- **Annotazioni**: commenti, evidenziazioni, testo barrato, sottolineato, note adesive, timbri, annotazioni a mano libera
- **Elementi interattivi**: pulsanti, azioni attivabili

## Cosa resta invariato

- Il contenuto testuale (resta selezionabile e ricercabile)
- Immagini e grafica
- Layout e dimensioni delle pagine
- Segnalibri e indice
- Collegamenti ipertestuali (a meno che non siano basati su annotazioni)

## Casi d'uso

- Bloccare un modulo compilato in modo che i destinatari non possano modificare le risposte inviate
- Preparare un PDF per l'archiviazione dove gli elementi interattivi non servono
- Risolvere problemi di visualizzazione causati da annotazioni rese in modo diverso dai vari lettori
- Garantire che un documento firmato non possa essere modificato dopo l'applicazione della firma
- Ridurre la dimensione del file eliminando le definizioni dei campi e gli oggetti annotazione

## Suggerimenti

- Appiattisci dopo aver completato tutte le modifiche. Non c'è modo di annullare l'appiattimento di un PDF.
- Se devi appiattire e anche rimuovere metadati, JavaScript e allegati, usa invece lo strumento Sanitizza PDF, che include l'appiattimento tra le sue opzioni.
- Alcuni PDF segnalano "nessun modulo trovato": è normale se il documento ha solo annotazioni e nessun campo di modulo.

## Strumenti correlati

- [Sanitizza PDF](./sanitize-pdf): appiattisci i moduli e rimuovi metadati, script e altro
- [Rasterizza PDF](./rasterize-pdf): converti in un PDF basato su immagini per il massimo appiattimento
- [Font in Contorni](./font-to-outline): appiattisci i font in tracciati vettoriali
- [Cripta PDF](./protect-pdf): proteggi con password il PDF appiattito
