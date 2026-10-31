---
title: Fascicola scansione fronte/retro
description: Riordina i PDF scansionati in fronte/retro che contengono le pagine anteriori e posteriori in blocchi separati, mettendole nell'ordine corretto.
---

# Fascicola scansione fronte/retro

Fascicola Fronte/Retro è pensato per i flussi di scansione con alimentatore automatico (ADF) in cui un PDF contiene due blocchi di pagine:

- prima tutti i fronti
- poi tutti i retro

Invece di dividere e riassemblare a mano, questo strumento intercala i due blocchi nel naturale ordine di lettura: fronte1, retro1, fronte2, retro2 e così via.

## Come funziona

1. Carica un singolo PDF creato dalla scansione di una pila fronte/retro.
2. Imposta il punto di divisione in cui termina il blocco dei fronti.
3. Scegli come gestire il blocco dei retro:
   - **Inverti il blocco dei retri** (comune quando la pila viene capovolta prima di scansionare i retro)
   - **Mantieni il blocco dei retri così com'è**
4. Fai clic su **Fascicola PDF** per scaricare il risultato riordinato.

## Opzioni

- **Rileva divisione automaticamente (metà)**: imposta il punto di divisione a `ceil(totalPages / 2)`.
- **Avviso pagine dispari**: avvisa quando il totale delle pagine è dispari (spesso indica una scansione non corrispondente).
- **Conferma blocchi non uniformi**: chiede conferma quando le dimensioni dei blocchi fronte/retro differiscono.
- **Esportazione raggruppata**: divide l'output fascicolato in PDF separati in base al numero di pagine del documento originale e li scarica come ZIP.

## Comportamento dell'output

- **Predefinito**: un solo PDF in uscita (un PDF in ingresso, un PDF in uscita).
- **Modalità raggruppata**: l'output viene suddiviso in base al valore di pagine per documento; se vengono prodotti più blocchi, vengono scaricati come un unico ZIP, altrimenti viene scaricato un singolo PDF.

Se le dimensioni dei blocchi sono diverse, le pagine in coppia vengono fascicolate per prime e le pagine rimaste senza coppia vengono aggiunte in fondo.

## Casi d'uso comuni

- Ripristinare l'ordine dopo aver scansionato una pila di moduli fronte/retro in due passate.
- Ricostruire i fascicoli fronte/retro da scanner d'ufficio che restituiscono prima tutti i fronti e poi tutti i retro.
- Post-elaborare le scansioni d'archivio prima di dividerle in file per documento.

## Suggerimenti

- La maggior parte dei lotti fronte/retro dovrebbe avere un numero totale di pagine pari.
- Se i retro risultano invertiti, passa da **Inverti il blocco dei retri** a **Mantieni il blocco dei retri così com'è** o viceversa.
- Per originali di 2 pagine (fronte+retro), usa l'esportazione raggruppata con `2` pagine per documento.

## Strumenti correlati

- [Alterna e Riordina Pagine](./alternate-merge)
- [Dividi PDF](./split-pdf)
- [Unisci PDF](./merge-pdf)
- [Duplica e Organizza](./organize-pdf)
