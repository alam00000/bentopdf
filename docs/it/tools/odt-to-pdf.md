---
title: ODT in PDF
description: Converti i file OpenDocument Text (ODT) in PDF nel browser con un motore basato su LibreOffice.
---

# ODT in PDF

Converti i file OpenDocument Text in PDF. ODT è il formato nativo di LibreOffice Writer, Apache OpenOffice e di altri elaboratori di testo open source. Questo strumento usa un motore LibreOffice che gira nel browser per ottenere conversioni accurate, che mantengono formattazione, tabelle, immagini e stili.

## Formati supportati

| Formato           | Estensioni |
| :---------------- | :--------- |
| OpenDocument Text | `.odt`     |

## Come funziona

1. Clicca sull'area di caricamento o trascina uno o più file ODT.
2. Controlla l'elenco dei file. Aggiungi altri file o rimuovi quelli indesiderati.
3. Clicca su **Converti in PDF**. Il motore LibreOffice si inizializza (un indicatore di avanzamento mostra lo stato del caricamento), poi ogni file viene convertito.
4. Un singolo file viene scaricato direttamente come PDF. Più file vengono raccolti in `odt-converted.zip`.

## Opzioni

Questo strumento non ha configurazioni aggiuntive. La conversione mantiene la formattazione del documento originale il più fedelmente possibile.

## Output

| Numero di file | Output                                                      |
| :------------- | :---------------------------------------------------------- |
| 1 file         | Download di un singolo PDF (ad es. `document.pdf`)          |
| 2 o più file   | Archivio ZIP (`odt-converted.zip`) con un PDF per ogni file |

## Casi d'uso

- Convertire documenti di LibreOffice Writer in PDF da condividere con chi usa Microsoft Office
- Produrre PDF pronti per la stampa da articoli accademici scritti in formato OpenDocument
- Convertire in blocco una cartella di modelli ODT in PDF da distribuire
- Generare PDF da file ODT creati da sistemi automatici di generazione di documenti

## Suggerimenti

- Il motore LibreOffice si carica al primo utilizzo e viene memorizzato nella cache per le conversioni successive. Il primo caricamento richiede alcuni secondi, poi le conversioni sono veloci.
- I documenti complessi con oggetti OLE incorporati o font insoliti possono apparire in modo leggermente diverso rispetto a LibreOffice desktop. Prova con un campione prima di convertire in blocco.
- Per i documenti Word (`.doc`, `.docx`), usa invece lo strumento [Word in PDF](./word-to-pdf), che usa lo stesso motore LibreOffice ma accetta direttamente i formati Microsoft.

## Strumenti correlati

- [Word in PDF](./word-to-pdf)
- [RTF in PDF](./rtf-to-pdf)
- [Testo in PDF](./txt-to-pdf)
