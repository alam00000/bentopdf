---
title: XML in PDF
description: Converti i file XML in documenti PDF strutturati nel browser. Gratis, privato, nessuna elaborazione sul server.
---

# XML in PDF

Converti i file di dati XML in documenti PDF leggibili e strutturati. L'XML grezzo è potente ma difficile da leggere per le persone. Questo strumento analizza l'albero XML, individua le strutture di dati ripetute e le trasforma in tabelle e sezioni formattate in un PDF A4 orizzontale.

## Formati supportati

| Formato | Estensione | Note                           |
| :------ | :--------- | :----------------------------- |
| XML     | `.xml`     | Qualsiasi documento XML valido |

## Come funziona

1. Fai clic sull'area di caricamento o trascina i tuoi file XML. Puoi elaborare più file in un unico batch.
2. Controlla l'elenco dei file. Rimuovi i file indesiderati con l'icona del cestino, oppure fai clic su **Aggiungi altri file** per includerne altri.
3. Fai clic su **Converti in PDF**. Lo strumento analizza la struttura XML con il DOMParser integrato nel browser, esamina la gerarchia dei dati e la trasforma in un PDF usando jsPDF con formattazione auto-table.
4. Un singolo file viene scaricato come PDF. Più conversioni vengono raccolte in `xml-to-pdf.zip`.

## Opzioni

Non è richiesta alcuna configurazione manuale. Il convertitore rileva automaticamente la struttura XML e sceglie layout di tabella adatti. L'output usa l'orientamento A4 orizzontale per ospitare insiemi di dati ampi.

## Casi d'uso

- Trasformare esportazioni di dati XML da database o API in report stampabili
- Creare riepiloghi leggibili da file di configurazione XML
- Convertire fatture o registri di transazioni in formato XML in PDF da conservare
- Rendere leggibili in forma di documento sitemap XML o feed RSS

## Suggerimenti

- L'XML deve essere ben formato. Se il parser incontra errori di sintassi, la conversione non riesce e mostra un messaggio d'errore descrittivo che indica il problema.
- Le strutture XML con annidamento profondo vengono appiattite in tabelle. Per ottenere i risultati migliori, i dati dovrebbero avere elementi fratelli ripetuti con elementi figli coerenti.
- Durante la conversione compaiono aggiornamenti di avanzamento che mostrano ogni fase: lettura, analisi, esame e rendering.

## Strumenti correlati

- [FB2 in PDF](./fb2-to-pdf)
- [XPS in PDF](./xps-to-pdf)
- [Email in PDF](./email-to-pdf)
