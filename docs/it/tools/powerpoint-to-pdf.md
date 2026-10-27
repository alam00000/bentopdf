---
title: PowerPoint in PDF
description: Converti presentazioni PowerPoint (PPT, PPTX) e file ODP in PDF mantenendo la formattazione delle diapositive.
---

# PowerPoint in PDF

Converti file di presentazione in PDF. Ogni diapositiva diventa una pagina del documento di output, con testo, immagini, forme e transizioni elaborati da un motore LibreOffice che gira nel browser. Supporta i formati PowerPoint moderni e legacy, oltre al formato OpenDocument Presentation.

## Formati supportati

| Formato                   | Estensioni |
| :------------------------ | :--------- |
| PowerPoint (moderno)      | `.pptx`    |
| PowerPoint (legacy)       | `.ppt`     |
| OpenDocument Presentation | `.odp`     |

## Come funziona

1. Fai clic sull'area di caricamento o trascina i file delle presentazioni.
2. Controlla l'elenco dei file. Aggiungine altri o rimuovi quelli che non servono.
3. Fai clic su **Converti in PDF**. Il motore LibreOffice si carica al primo utilizzo, poi converte ogni file.
4. Un singolo file viene scaricato direttamente come PDF. Più file vengono raccolti in `powerpoint-converted.zip`.

## Opzioni

Questo strumento non ha impostazioni aggiuntive. Le diapositive vengono elaborate nelle loro dimensioni originali.

## Output

| Numero di file | Output                                                                 |
| :------------- | :--------------------------------------------------------------------- |
| 1 file         | Download di un singolo PDF (nome file originale con estensione `.pdf`) |
| 2+ file        | Archivio ZIP (`powerpoint-converted.zip`) con un PDF per file          |

## Casi d'uso

- Convertire una presentazione in PDF prima di condividerla con un pubblico che potrebbe non avere PowerPoint
- Creare una versione stampabile di una presentazione come dispensa per una conferenza o un workshop
- Archiviare le presentazioni in un formato che appare identico su ogni dispositivo
- Convertire in blocco una raccolta di presentazioni ODP di LibreOffice Impress in PDF
- Produrre una versione PDF di una presentazione commerciale da allegare a un'email

## Suggerimenti

- Animazioni e transizioni delle diapositive non sono rappresentate nel PDF. Ogni diapositiva viene acquisita come pagina statica.
- I video incorporati non compaiono nell'output. Se serve, sostituiscili con uno screenshot o un'immagine segnaposto.
- Le note del relatore non sono incluse nell'esportazione PDF predefinita. Se ti servono, esporta prima dalla vista "Stampa note" di PowerPoint.
- Il motore LibreOffice resta in cache dopo il primo caricamento, quindi convertire una seconda presentazione nella stessa sessione è molto più veloce.

## Strumenti correlati

- [Word in PDF](./word-to-pdf)
- [Excel in PDF](./excel-to-pdf)
- [Immagini in PDF](./image-to-pdf)
