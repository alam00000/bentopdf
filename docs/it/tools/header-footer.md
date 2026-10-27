---
title: Intestazione e piè di pagina
description: Aggiungi testo personalizzabile di intestazione e piè di pagina alle pagine PDF con variabili dinamiche per i numeri di pagina.
---

# Intestazione e piè di pagina

Aggiungi testo in sei posizioni delle pagine del tuo PDF: intestazione a sinistra, al centro e a destra, piè di pagina a sinistra, al centro e a destra. Lo strumento supporta variabili dinamiche per il numero di pagina e il totale delle pagine, così puoi creare modelli come "Pagina 3 di 10" che si aggiornano automaticamente per ogni pagina.

## Come funziona

1. Carica il tuo file PDF.
2. Compare il pannello delle opzioni con i controlli di formattazione e sei campi di testo.
3. Inserisci il testo desiderato in una qualsiasi posizione di intestazione o piè di pagina.
4. Usa i segnaposto `{page}` e `{total}` per la numerazione dinamica.
5. Regola dimensione e colore del carattere e, se vuoi, limita l'operazione a un intervallo di pagine.
6. Clicca su **Aggiungi Intestazione e Piè di Pagina** per elaborare e scaricare.

## Opzioni

- **Intervallo di pagine**: limita facoltativamente le pagine che ricevono intestazioni e piè di pagina. Lascia vuoto per applicarlo a tutte le pagine. Formato: "1-3, 5" (intervalli separati da virgole).
- **Dimensione del carattere**: tra 6 e 24 punti. Il valore predefinito è 10.
- **Colore del carattere**: scegli qualsiasi colore con il selettore di colore.
- **Intestazione sinistra / centro / destra**: campi di testo per la parte alta di ogni pagina.
- **Piè di pagina sinistra / centro / destra**: campi di testo per la parte bassa di ogni pagina.

## Funzionalità

- Sei posizioni di testo indipendenti per pagina
- Variabile dinamica `{page}` che inserisce il numero della pagina corrente
- Variabile dinamica `{total}` che inserisce il numero totale di pagine
- Filtro per intervallo di pagine per scegliere pagine specifiche
- Dimensione e colore del carattere personalizzabili
- Font Helvetica per un risultato pulito e professionale

## Casi d'uso

- Aggiungere "Pagina {page} di {total}" al centro del piè di pagina di una relazione
- Inserire il nome dell'azienda nell'intestazione a sinistra e la data del documento nell'intestazione a destra
- Aggiungere avvisi di riservatezza al piè di pagina dei documenti legali
- Applicare i numeri di revisione del documento a specifici intervalli di pagine

## Suggerimenti

- Combina `{page}` e `{total}` in un unico campo per formati come "Pagina {page} di {total}" o "{page}/{total}".
- Puoi lasciare vuota la maggior parte dei campi e compilare solo le posizioni che ti servono. I campi vuoti vengono semplicemente ignorati.
- Per intestazioni più complesse con immagini o loghi, valuta lo strumento [Aggiungi Filigrana](./add-watermark) posizionato nella parte alta della pagina.

## Strumenti correlati

- [Numeri di Pagina](./page-numbers)
- [Aggiungi Filigrana](./add-watermark)
- [Numerazione Bates](./bates-numbering)
