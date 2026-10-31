---
title: CSV in PDF
description: Converti i file di foglio di calcolo CSV in tabelle PDF formattate direttamente nel tuo browser.
---

# CSV in PDF

Trasforma i file CSV in documenti PDF puliti e formattati. Ogni CSV viene analizzato e reso come tabella nel PDF di output. È utile quando devi stampare o condividere dati tabellari senza richiedere al destinatario un software per fogli di calcolo.

## Formati supportati

| Formato | Estensioni |
| :------ | :--------- |
| CSV     | `.csv`     |

## Come funziona

1. Fai clic sull'area di caricamento o trascina uno o più file CSV.
2. Controlla l'elenco dei file. Aggiungine altri o rimuovi quelli indesiderati.
3. Fai clic su **Converti in PDF**. Un indicatore di avanzamento mostra lo stato della conversione.
4. Un singolo file viene scaricato direttamente come PDF. Più file vengono raccolti in `csv-converted.zip`.

## Opzioni

Questo strumento non ha configurazioni aggiuntive. Il CSV viene analizzato e formattato automaticamente come tabella.

## Output

| Numero di input | Output                                                      |
| :-------------- | :---------------------------------------------------------- |
| 1 file          | Download di un singolo PDF (ad es. `data.pdf`)              |
| 2+ file         | Archivio ZIP (`csv-converted.zip`) con un PDF per ogni file |

## Casi d'uso

- Convertire i report esportati da database in tabelle PDF stampabili
- Condividere dati finanziari o elenchi di inventario con chi non ha Excel
- Creare versioni PDF dei file di log CSV per la documentazione di conformità
- Stampare elenchi di indirizzi, registri dei voti o qualsiasi dato tabellare salvato come CSV

## Suggerimenti

- Per risultati ottimali, assicurati che il CSV usi i delimitatori standard a virgola. Lo strumento segue le convenzioni comuni di analisi dei CSV.
- Se il CSV ha molte colonne, la tabella potrebbe essere compressa per adattarsi alla larghezza della pagina. Valuta di dividere i set di dati molto larghi in più file.
- Per i file Excel (`.xls`, `.xlsx`), usa lo strumento [Excel in PDF](./excel-to-pdf), che preserva la formattazione del foglio di calcolo e i fogli multipli.

## Strumenti correlati

- [Excel in PDF](./excel-to-pdf)
- [Testo in PDF](./txt-to-pdf)
- [JSON in PDF](./json-to-pdf)
