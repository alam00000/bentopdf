---
title: SVG in PDF
description: Converti la grafica vettoriale SVG in PDF con controllo della qualità, interamente nel tuo browser.
---

# SVG in PDF

Converti i file Scalable Vector Graphics (SVG) in PDF. Lo strumento rasterizza ogni SVG con il motore di rendering del browser, poi incorpora il risultato alla sua risoluzione nativa. È utile per trasformare icone vettoriali, diagrammi e illustrazioni in documenti portabili.

## Formati supportati

| Formato | Estensioni |
| :------ | :--------- |
| SVG     | `.svg`     |

## Come funziona

1. Fai clic sull'area di caricamento o trascina uno o più file SVG.
2. Controlla e gestisci l'elenco dei file.
3. Scegli un livello di **Qualità PDF**.
4. Fai clic su **Converti in PDF**. Il risultato viene scaricato come `from_svgs.pdf`.

Ogni SVG viene letto come testo, disegnato su un canvas con la sua larghezza e altezza intrinseche (800x600 se non sono specificate dimensioni) ed esportato come PNG. Quel PNG viene poi incorporato nel PDF con pdf-lib. Le aree trasparenti vengono riempite con uno sfondo bianco.

## Opzioni

**Qualità PDF** controlla la compressione dopo la rasterizzazione:

- **Qualità alta**: il più vicino possibile al rendering originale.
- **Qualità media** (predefinita): buon equilibrio.
- **Qualità bassa**: file più piccolo, con una certa perdita di dettaglio.

## Casi d'uso

- Convertire diagrammi di architettura o ingegneria da SVG a un PDF pronto per la stampa
- Raccogliere set di icone in un PDF di riferimento per un design system
- Trasformare visualizzazioni di dati (D3.js, esportazioni di librerie di grafici) in PDF pronti per i report
- Creare versioni stampabili di infografiche basate su SVG

## Suggerimenti

- I file SVG senza attributi `width` e `height` espliciti vengono elaborati a 800x600 pixel. Per risultati migliori, imposta le dimensioni nel sorgente SVG prima della conversione.
- Gli SVG complessi con riferimenti a font esterni o immagini collegate potrebbero non essere elaborati perfettamente. Incorpora tutte le risorse nell'SVG per un output affidabile.
- Poiché l'SVG viene rasterizzato, il PDF conterrà un'immagine bitmap anziché tracciati vettoriali. Per un vero output PDF vettoriale serve uno strumento vettoriale dedicato.

## Strumenti correlati

- [Immagini in PDF](./image-to-pdf)
- [PNG in PDF](./png-to-pdf)
- [BMP in PDF](./bmp-to-pdf)
