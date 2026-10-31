---
title: PDF in CBZ
description: Converti un PDF in un file CBZ (Comic Book Archive) per lettori di fumetti come Komga, Kavita, CDisplayEx e Calibre.
---

# PDF in CBZ

Converte un PDF in un file CBZ (Comic Book ZIP), il formato standard per fumetti e manga digitali. Ogni pagina del PDF diventa un'immagine all'interno dell'archivio. Lo strumento genera i metadati in tre formati per la massima compatibilità: ComicInfo.xml, metadata.opf e ComicBookInfo JSON.

## Come funziona

1. Carica un PDF cliccando sull'area di rilascio o trascinandovi sopra un file.
2. Scegli formato immagine, qualità, scala ed eventuali metadati.
3. Clicca su **Converti** per generare il file CBZ.
4. Il file `.cbz` viene scaricato automaticamente.

## Opzioni

| Opzione          | Valori          | Predefinito | Descrizione                                                                                                 |
| ---------------- | --------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| Formato immagine | JPEG, PNG, WebP | JPEG        | JPEG per fumetti a colori, PNG per manga in bianco e nero senza perdita, WebP per la migliore compressione. |
| Qualità          | 50–100%         | 85%         | Controlla la compressione JPEG/WebP. Nascosta per PNG (sempre senza perdita).                               |
| Scala            | 1.0x–4.0x       | 2.0x        | Una scala maggiore produce immagini più nitide per schermi ad alta risoluzione.                             |
| Scala di grigi   | Sì/No           | No          | Converte le pagine in scala di grigi. Riduce le dimensioni del file per i contenuti in bianco e nero.       |
| Modalità manga   | Sì/No           | No          | Imposta nei metadati la direzione di lettura da destra a sinistra.                                          |
| Includi metadati | Sì/No           | Sì          | Incorpora ComicInfo.xml, metadata.opf e ComicBookInfo JSON.                                                 |

## Campi dei metadati

Quando i metadati sono attivi, puoi compilare:

- **Titolo**: rilevato automaticamente dal nome del file PDF.
- **Serie**: il nome della serie (ad es. "Naruto").
- **Numero (#)**: numero dell'albo all'interno della serie.
- **Volume (Vol.)**: numero del volume.
- **Autore/i**: nome dello scrittore o del creatore.
- **Editore**: casa editrice.
- **Tag / Genere**: tag separati da virgole (ad es. "Azione, Avventura").
- **Anno di pubblicazione**: anno di pubblicazione (1900–2100).
- **Valutazione**: valutazione della community da 0 a 5.

## Compatibilità dei metadati

Lo strumento scrive i metadati in tre formati, così ogni lettore può trovarli:

| Formato            | Posizione                  | Supportato da                               |
| ------------------ | -------------------------- | ------------------------------------------- |
| ComicInfo.xml      | File all'interno dello ZIP | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | File all'interno dello ZIP | Calibre                                     |
| ComicBookInfo JSON | Campo commento dello ZIP   | Calibre (alternativa)                       |

## Formato di output

- `filename.cbz`: un archivio ZIP contenente le immagini delle pagine numerate e i file dei metadati.

Le immagini delle pagine sono nominate con numeri riempiti con zeri (`01.jpg`, `02.jpg`, ecc.) in modo che i lettori le mostrino nell'ordine corretto.

## Casi d'uso

- Convertire PDF di manga o fumetti da usare con i lettori di fumetti.
- Creare una libreria di fumetti digitali in Komga, Kavita o Calibre.
- Convertire fumetti scansionati in un formato adatto ai lettori.
- Condividere fumetti in un formato che conserva direzione di lettura e metadati.

## Suggerimenti

- Usa **JPEG** per i fumetti a colori e **PNG** per i manga in bianco e nero: PNG comprime in modo molto efficiente i contenuti in bianco e nero.
- Attiva **Scala di grigi** per i manga per ridurre in modo significativo le dimensioni del file.
- Compila i campi **Serie** e **Numero** così i gestori di librerie (Komga, Calibre) possono organizzare automaticamente la tua collezione.
- **WebP** offre la migliore compressione, ma i lettori di fumetti più vecchi potrebbero non supportarlo.

## Strumenti correlati

- [PDF in JPG](./pdf-to-jpg)
- [PDF in PNG](./pdf-to-png)
- [PDF in TIFF](./pdf-to-tiff)
- [Estrai immagini](./extract-images)
