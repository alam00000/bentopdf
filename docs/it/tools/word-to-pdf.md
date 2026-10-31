---
title: Word in PDF
description: Converti documenti Word (DOC, DOCX), ODT e RTF in PDF nel browser, conservando tutta la formattazione.
---

# Word in PDF

Converti i documenti Microsoft Word e i formati compatibili in PDF. Lo strumento usa un motore LibreOffice nel browser che gestisce file DOC, DOCX, ODT e RTF, mantenendo nell'output formattazione, tabelle, immagini, intestazioni, piè di pagina e stili.

## Formati supportati

| Formato           | Estensioni |
| :---------------- | :--------- |
| Word (moderno)    | `.docx`    |
| Word (legacy)     | `.doc`     |
| OpenDocument Text | `.odt`     |
| Rich Text Format  | `.rtf`     |

## Come funziona

1. Fai clic sull'area di caricamento o trascina i tuoi documenti Word. Puoi selezionare più file contemporaneamente.
2. Controlla e gestisci l'elenco dei file.
3. Fai clic su **Converti in PDF**. Il motore LibreOffice si carica al primo utilizzo (un indicatore di avanzamento mostra lo stato dell'inizializzazione), poi ogni file viene convertito.
4. Un singolo file viene scaricato direttamente come PDF. Più file vengono raccolti in `word-converted.zip`.

## Opzioni

Questo strumento non ha impostazioni aggiuntive. Il motore LibreOffice genera l'output con il suo profilo di esportazione PDF predefinito.

## Output

| Numero di input | Output                                                            |
| :-------------- | :---------------------------------------------------------------- |
| 1 file          | Download di un singolo PDF (nome originale con estensione `.pdf`) |
| 2+ file         | Archivio ZIP (`word-converted.zip`) con un PDF per ogni file      |

## Casi d'uso

- Convertire un curriculum o una lettera di presentazione da DOCX a PDF prima di inviare una candidatura
- Convertire in batch una serie di contratti o proposte in PDF per la consegna a un cliente
- Trasformare vecchi file `.doc` in PDF moderni per l'archiviazione a lungo termine
- Convertire in PDF documenti collaborativi di Google Docs (esportati come DOCX)
- Produrre PDF pronti per la stampa da modelli Word usati per la generazione automatica di documenti

## Suggerimenti

- Il motore LibreOffice viene scaricato una volta per sessione e memorizzato nella cache. Aspettati qualche secondo di caricamento alla prima conversione, mentre le successive sono molto più rapide.
- La formattazione complessa (macro, controlli ActiveX, SmartArt avanzati) potrebbe non essere convertita perfettamente. Gli elementi standard di un documento (testo, tabelle, immagini, intestazioni, note a piè di pagina) vengono convertiti in modo affidabile.
- Poiché questo strumento accetta anche ODT e RTF, puoi usarlo come convertitore unico per tutti i formati di elaborazione testi.

## Strumenti correlati

- [ODT in PDF](./odt-to-pdf)
- [RTF in PDF](./rtf-to-pdf)
- [Excel in PDF](./excel-to-pdf)
- [PowerPoint in PDF](./powerpoint-to-pdf)
