---
title: HEIC in PDF
description: Converti le immagini HEIC e HEIF di iPhone e iPad in PDF direttamente nel browser.
---

# HEIC in PDF

Converti le immagini HEIC/HEIF in PDF. HEIC è il formato foto predefinito di iPhone e iPad da iOS 11. Questo strumento ti permette di trasformare quelle foto in PDF senza installare software desktop né caricare file su un server.

## Formati supportati

| Formato | Estensioni |
| :------ | :--------- |
| HEIC    | `.heic`    |
| HEIF    | `.heif`    |

## Come funziona

1. Clicca sull'area di caricamento o trascina i tuoi file HEIC/HEIF.
2. Controlla l'elenco dei file e rimuovi quelli che non ti servono.
3. Clicca su **Converti in PDF**. Il risultato viene scaricato come `from_heic.pdf`.

Ogni file HEIC viene decodificato con la libreria heic2any, che lo converte in PNG con qualità al 92%. Il PNG viene poi incorporato nel PDF con pdf-lib, con ogni immagine su una pagina a sé alla risoluzione piena.

## Opzioni

Questo strumento non offre impostazioni aggiuntive. Le immagini HEIC vengono convertite in PNG ad alta qualità (0,92) prima dell'incorporamento.

## Casi d'uso

- Creare un PDF dalle foto dell'iPhone da allegare a una richiesta di risarcimento assicurativo o a una relazione
- Convertire le foto HEIC per un annuncio immobiliare in un unico documento stampabile
- Trasformare gli screenshot dell'iPad (formato HEIF) in un PDF condivisibile
- Convertire in blocco le foto delle vacanze per un diario di viaggio

## Suggerimenti

- La decodifica HEIC avviene interamente nel browser con WebAssembly. La prima conversione può richiedere un momento mentre il decodificatore si carica.
- Se devi mescolare HEIC con altri formati di immagine (JPG, PNG, ecc.), usa lo strumento [Immagini in PDF](./image-to-pdf), che gestisce HEIC insieme a tutti gli altri formati.
- I file HEIC degli iPhone contengono spesso dati EXIF, comprese le coordinate GPS. Il PDF risultante non conserva questi metadati.

## Strumenti correlati

- [Immagini in PDF](./image-to-pdf)
- [JPG in PDF](./jpg-to-pdf)
- [PNG in PDF](./png-to-pdf)
