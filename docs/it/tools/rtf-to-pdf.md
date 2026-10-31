---
title: RTF in PDF
description: Converti i file Rich Text Format (RTF) in PDF nel tuo browser con un motore basato su LibreOffice.
---

# RTF in PDF

Converti i documenti Rich Text Format in PDF. RTF è un formato di documento multipiattaforma supportato praticamente da ogni elaboratore di testi. Questo strumento usa un motore LibreOffice nel browser per elaborare i file RTF mantenendo la formattazione: grassetto, corsivo, tabelle e immagini incorporate vengono tutti riportati nel PDF.

## Formati supportati

| Formato | Estensioni | Tipi MIME                     |
| :------ | :--------- | :---------------------------- |
| RTF     | `.rtf`     | `text/rtf`, `application/rtf` |

## Come funziona

1. Fai clic sull'area di caricamento o trascina uno o più file RTF.
2. Controlla l'elenco dei file. Aggiungine altri o rimuovi quelli che non servono.
3. Fai clic su **Converti in PDF**. Il motore LibreOffice si avvia al primo utilizzo, poi elabora ogni file.
4. Un singolo file viene scaricato direttamente come PDF. Più file vengono consegnati come `rtf-converted.zip`.

## Opzioni

Questo strumento non ha impostazioni aggiuntive. La conversione conserva la formattazione RTF originale.

## Output

| Numero di file | Output                                                 |
| :------------- | :----------------------------------------------------- |
| 1 file         | Download di un singolo PDF (ad es. `letter.pdf`)       |
| 2+ file        | Archivio ZIP (`rtf-converted.zip`) con un PDF per file |

## Casi d'uso

- Convertire in PDF moderni i documenti RTF di vecchi elaboratori di testi
- Trasformare modelli di email RTF in anteprime PDF
- Elaborare l'output RTF di sistemi software legali o medici
- Convertire in blocco file RTF di un sistema di gestione documentale in PDF per l'archiviazione

## Suggerimenti

- Il motore LibreOffice viene caricato una sola volta e messo in cache. La prima conversione di una sessione richiede qualche secondo in più, le successive sono più veloci.
- I file RTF con oggetti OLE incorporati potrebbero non mostrare perfettamente tutti gli oggetti. Testo semplice, immagini e formattazione standard vengono convertiti in modo affidabile.
- Se i tuoi file RTF sono stati creati con Microsoft Word, puoi convertirli direttamente anche con lo strumento [Word in PDF](./word-to-pdf), che accetta RTF oltre a DOC e DOCX.

## Strumenti correlati

- [Word in PDF](./word-to-pdf)
- [ODT in PDF](./odt-to-pdf)
- [Testo in PDF](./txt-to-pdf)
