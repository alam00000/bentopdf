---
title: Font in contorni
description: Converti tutti i font del PDF in contorni vettoriali per una resa coerente su ogni dispositivo. Elimina i problemi di dipendenza dai font.
---

# Font in contorni

Convertire i font in contorni trasforma ogni carattere di testo da glifo basato su font a tracciato vettoriale. Il PDF non dipende più da alcun font installato: si visualizza in modo identico su ogni dispositivo, ogni sistema operativo e ogni stampante. È un passaggio standard nei flussi di prestampa.

## Come funziona

1. Carica uno o più file PDF.
2. Clicca su **Converti in Contorni**.
3. Ghostscript converte tutto il testo in tracciati vettoriali.
4. Scarica il risultato. Più file producono un archivio ZIP.

Non ci sono impostazioni da configurare. Lo strumento usa Ghostscript (WebAssembly) per convertire tutti i riferimenti ai font in tracciati a contorno in un unico passaggio.

## Cosa cambia

- I caratteri di testo diventano curve vettoriali (tracciati bezier)
- L'incorporamento dei font non è più necessario: il PDF è autosufficiente a livello di glifo
- La dimensione del file può aumentare perché i tracciati vettoriali sono in genere più grandi dei riferimenti ai font
- L'aspetto visivo viene preservato esattamente

## Cosa perdi

- Selezione e copia-incolla del testo
- Ricercabilità del testo (Ctrl+F smette di funzionare)
- La possibilità di modificare il contenuto testuale
- Accessibilità per i lettori di schermo

## Casi d'uso

- Inviare PDF a una tipografia che richiede font convertiti in contorni
- Condividere documenti che usano font personalizzati o con licenza con persone che non hanno quei font
- Evitare la sostituzione dei font che cambia l'aspetto del documento su altri sistemi
- Preparare PDF per flussi di incisione laser o taglio CNC che richiedono input vettoriale
- Garantire che un PDF ricco di loghi si visualizzi correttamente su tutte le piattaforme

## Suggerimenti

- Conserva il PDF originale. La conversione in contorni è irreversibile: non puoi riconvertire i tracciati in testo modificabile.
- Se hai bisogno che il testo resti ricercabile, valuta invece lo strumento Rasterizza PDF seguito dall'OCR.
- I PDF con contorni tendono a essere più grandi. Esegui Comprimi PDF in seguito se la dimensione conta.

## Strumenti correlati

- [Appiattisci PDF](./flatten-pdf): appiattisci moduli e annotazioni senza toccare i font
- [Rasterizza PDF](./rasterize-pdf): converti in un PDF basato su immagini invece che in contorni vettoriali
- [Comprimi PDF](./compress-pdf): riduci la dimensione del file dopo la conversione in contorni
- [PDF in PDF/A](./pdf-to-pdfa): converti per l'archiviazione dopo aver garantito l'indipendenza dai font
