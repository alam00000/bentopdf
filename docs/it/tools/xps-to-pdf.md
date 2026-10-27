---
title: XPS in PDF
description: Converti i documenti XPS e OXPS in PDF nel browser. Nessun caricamento, nessuna registrazione, completamente privato.
---

# XPS in PDF

Converti i documenti Microsoft XPS e OXPS in normali file PDF. XPS (XML Paper Specification) era la risposta di Microsoft al PDF, ma il suo supporto è diminuito su tutte le piattaforme. Questo strumento rende di nuovo questi documenti leggibili da chiunque.

## Formati supportati

| Formato | Estensione | Note                                          |
| :------ | :--------- | :-------------------------------------------- |
| XPS     | `.xps`     | Formato XPS originale di Microsoft            |
| OXPS    | `.oxps`    | Open XPS, la variante dello standard ECMA-388 |

## Come funziona

1. Fai clic sull'area di caricamento o trascina i tuoi file XPS/OXPS. Puoi selezionare più file contemporaneamente.
2. Controlla l'elenco dei file. Rimuovi i singoli file con l'icona del cestino, oppure fai clic su **Aggiungi altri file** per accodare altri documenti.
3. Fai clic su **Converti in PDF**. Il motore PyMuPDF elabora ogni documento localmente nel tuo browser.
4. Un singolo file viene scaricato direttamente come PDF. Più file vengono raccolti in un archivio ZIP chiamato `xps-converted.zip`.

## Opzioni

Questo strumento esegue una conversione diretta del formato, senza configurazione aggiuntiva. L'output conserva dimensioni di pagina, grafica vettoriale, font e immagini originali della sorgente XPS.

## Casi d'uso

- Aprire file XPS ricevuti da vecchi sistemi Windows che usavano il driver di stampa XPS come predefinito
- Convertire documenti OXPS di Windows 10/11 per condividerli con utenti macOS o Linux
- Archiviare vecchi file XPS in un formato supportato più ampiamente
- Rendere accessibili a destinatari esterni documenti governativi o aziendali basati su XPS

## Suggerimenti

- Le estensioni `.xps` e `.oxps` vengono gestite entrambe automaticamente: puoi mescolarle nello stesso batch.
- Se il file XPS originale è stato creato con un driver di stampa ad alta risoluzione, il PDF risultante mantiene quella qualità. Non avviene alcun ricampionamento.

## Strumenti correlati

- [Word in PDF](./word-to-pdf)
- [XML in PDF](./xml-to-pdf)
