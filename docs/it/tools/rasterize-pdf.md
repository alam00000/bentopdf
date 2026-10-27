---
title: Rasterizza PDF
description: Converti le pagine PDF in un PDF basato su immagini. Appiattisci tutti i livelli, rimuovi il testo selezionabile e controlla DPI e formato immagine.
---

# Rasterizza PDF

La rasterizzazione converte ogni pagina di un PDF in un'immagine e riassembla queste immagini in un PDF. Il risultato appare identico all'originale ma non contiene testo selezionabile, elementi interattivi né livelli modificabili. È di fatto una fotocopia di alta qualità.

## Come funziona

1. Carica uno o più file PDF.
2. Imposta i **DPI** (risoluzione) dell'output rasterizzato.
3. Scegli un **Formato immagine**: PNG per una qualità senza perdita o JPEG per file più piccoli.
4. Se vuoi, seleziona **Converti in scala di grigi**.
5. Fai clic su **Rasterizza PDF**. Più file vengono scaricati in un archivio ZIP.

## Opzioni

| Impostazione         | Valori                                  | Predefinito |
| -------------------- | --------------------------------------- | ----------- |
| **DPI**              | 72, 150, 200, 300, 600                  | 150         |
| **Formato immagine** | PNG (senza perdita), JPEG (più leggero) | PNG         |
| **Scala di grigi**   | Sì/No                                   | No          |

## Indicazioni sui DPI

- **72**: solo visualizzazione a schermo, dimensione file minima
- **150**: buon equilibrio per l'uso generale
- **200**: testo più nitido, dimensione file moderata
- **300**: output di qualità per la stampa
- **600**: archiviazione di alta qualità o stampa professionale

## Casi d'uso

- Impedire l'estrazione del testo da documenti riservati prima di condividerli
- Eliminare i problemi di dipendenza dai font convertendo il testo in pixel
- Creare una versione "piatta" di un PDF con livelli o trasparenze complessi che appare diversa nei vari visualizzatori
- Preparare un PDF per un sistema che accetta solo input basato su immagini
- Eliminare i contenuti nascosti (come le modifiche tracciate o i dati dei moduli) riducendo il PDF a sole immagini

## Suggerimenti

- 150 DPI in PNG è un'ottima impostazione predefinita. Aumenta solo se ti serve un output per la stampa o devi ingrandire dettagli sottili.
- JPEG produce file sensibilmente più piccoli ma introduce artefatti di compressione sui bordi nitidi del testo.
- La rasterizzazione è irreversibile: conserva il PDF originale se potresti aver bisogno del testo modificabile in futuro.

## Strumenti correlati

- [Comprimi PDF](./compress-pdf): riduci la dimensione del PDF rasterizzato
- [Raddrizza PDF](./deskew-pdf): raddrizza le pagine prima di rasterizzare documenti scansionati
- [Font in Contorni](./font-to-outline): converti i font in tracciati vettoriali se vuoi mantenere la scalabilità
- [Appiattisci PDF](./flatten-pdf): appiattisci i moduli senza convertire in immagini
