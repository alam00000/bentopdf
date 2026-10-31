---
title: Numerazione Bates
description: Applica numeri Bates a uno o più PDF con modelli personalizzabili, riempimento, font e posizionamento.
---

# Numerazione Bates

La numerazione Bates applica identificatori sequenziali a ogni pagina dei tuoi PDF. È il metodo standard per etichettare i documenti nei procedimenti legali, negli audit e nei flussi di conformità. Questo strumento supporta più file e modelli personalizzabili, e produce PDF numerati singolarmente oppure un unico archivio ZIP.

## Come funziona

1. Carica uno o più file PDF. Puoi trascinare più file contemporaneamente.
2. Scegli un preset di stile o crea un modello personalizzato.
3. Configura posizione, font, dimensione, colore e numeri iniziali.
4. Fai clic su **Applica Numeri Bates** per elaborare.
5. Un singolo file viene scaricato direttamente. Più file vengono scaricati come archivio ZIP.

## Opzioni

- **Preset di stile**: scegli tra i formati integrati:
  - Esibito + Caso + Bates + Pagina (ad es. "Exhibit 1 Case XYZ 000001 Page 1")
  - Esibito + Caso + Bates (senza numero di pagina)
  - Caso + Bates
  - Solo numero Bates (ad es. "000001")
  - Personalizzato (scrivi il tuo modello)
- **Personalizza stile**: una stringa modello che usa i segnaposto: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Riempimento Bates**: numero di cifre (da 3 a 6) per i numeri Bates con zeri iniziali. Visibile solo in modalità personalizzata.
- **Posizione**: intestazione o piè di pagina, a sinistra, al centro o a destra.
- **Il Bates inizia da**: il primo numero Bates. Il valore predefinito è 1. La numerazione prosegue tra i file.
- **Il contatore file inizia da**: il numero iniziale per il segnaposto `[FILE]`.
- **Font**: Helvetica, Times New Roman o Courier.
- **Dimensione del font**: dimensione del testo applicato.
- **Colore**: selettore di colori per il testo del numero Bates.

## Funzionalità

- Anteprima in tempo reale che mostra come appariranno i numeri Bates in tutti i file caricati
- Supporto di più file con numerazione continua tra i documenti
- Riordino dei file con trascinamento per controllare la sequenza di numerazione
- Sei opzioni di posizione (intestazione/piè di pagina, sinistra/centro/destra)
- Calcolo adattivo dei margini che rispetta i diversi formati di pagina
- Output ZIP per lotti di più file
- Segnaposto nei modelli per la massima flessibilità

## Casi d'uso

- Applicare numeri di esibito sequenziali ai documenti di discovery per le cause legali
- Numerare pacchetti di prove di audit che comprendono decine di file
- Applicare numeri di riferimento normativi alla documentazione di conformità
- Etichettare gli allegati di una domanda di brevetto con identificatori specifici del caso

## Suggerimenti

- Trascina i file nell'elenco per riordinarli prima dell'elaborazione. La sequenza di numerazione Bates segue questo ordine.
- Usa il segnaposto `[FILENAME]` per includere il nome del file originale nel timbro, così è più facile risalire dalle pagine ai documenti di origine.
- Il riquadro di anteprima si aggiorna in tempo reale mentre cambi le impostazioni, così puoi verificare il formato prima di elaborare.

## Strumenti correlati

- [Numeri di Pagina](./page-numbers)
- [Aggiungi Etichette di Pagina](./add-page-labels)
- [Intestazione e Piè di Pagina](./header-footer)
