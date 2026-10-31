---
title: Costruttore di workflow PDF
description: Crea visivamente pipeline di elaborazione PDF personalizzate collegando nodi su una tela. Concatena operazioni come unione, compressione, filigrana ed esportazione.
---

# Costruttore di workflow PDF

Il Costruttore di workflow ti permette di concatenare più operazioni PDF in un'unica pipeline automatizzata. Invece di eseguire gli strumenti uno alla volta, colleghi un grafo visivo di nodi (input, elaborazione, output) ed esegui tutto con un clic. I tuoi file non lasciano mai il browser.

## Come funziona

L'interfaccia è divisa in tre pannelli: una **casella dei nodi** a sinistra, la **tela** al centro e un **pannello delle impostazioni** a destra che compare quando selezioni un nodo.

1. **Aggiungi nodi** cliccandoli nella barra laterale sinistra, oppure trascinandoli direttamente sulla tela. Usa la barra di ricerca in cima alla casella dei nodi per filtrare per nome.
2. **Collega i nodi** trascinando da un socket di output (in basso in un nodo) a un socket di input (in alto in un altro nodo). Le connessioni scorrono dall'alto verso il basso.
3. **Configura le impostazioni** cliccando un nodo per aprire il suo pannello delle impostazioni a destra. Ogni tipo di nodo ha le proprie opzioni (intervalli di pagine, cursori di qualità, password, ecc.).
4. **Esegui il workflow** cliccando sul pulsante **Esegui** nella barra degli strumenti. Il motore esegue i nodi in ordine topologico, elaborandoli uno dopo l'altro. Una barra di stato in basso mostra l'avanzamento.
5. **Scarica i risultati**: il nodo Download finale salva il PDF risultante (o uno ZIP se vengono prodotti più file).

## Categorie di nodi

I nodi sono organizzati in sei categorie, ciascuna con un colore sulla tela:

- **Input** (blu): Input PDF, Immagine di input, Word/Excel/PowerPoint in PDF e oltre 15 altri convertitori di formato che portano i file nella pipeline.
- **Modifica e annotazione** (indaco): Ritaglia, Scala di grigi, Inverti colori, Filigrana, Numeri di pagina, Intestazione e piè di pagina, Effetto scanner, Regola colori, Colore di sfondo, Rimuovi pagine vuote, Rimuovi annotazioni.
- **Organizza e gestisci** (viola): Unisci, Dividi, Estrai pagine, Ruota, Elimina pagine, Inverti, Aggiungi pagina vuota, Dividi pagine, N-Up, Correggi dimensione pagina, Combina in una sola pagina, Opuscolo, Posterizza, Modifica metadati, Indice, OCR.
- **Ottimizza e ripara** (ambra): Comprimi, Rasterizza, Linearizza, Raddrizza, PDF in PDF/A, Font in contorni, Ripara.
- **Proteggi PDF** (rosa): Cripta, Decripta, Sanifica, Appiattisci, Firma digitale, Oscura.
- **Output** (verde acqua): Download (rileva automaticamente PDF singolo o ZIP), PDF in immagini, PDF in testo, PDF in DOCX, PDF in XLSX, PDF in CSV, PDF in SVG, PDF in Markdown, Estrai immagini.

## Salvare e caricare i workflow

La barra degli strumenti offre quattro opzioni di persistenza:

- **Salva**: memorizza il workflow corrente come modello con nome nella memoria locale del browser. Puoi salvare più modelli.
- **Carica**: apre una finestra con l'elenco di tutti i modelli salvati. Clicca su Carica per ripristinarne uno, oppure elimina i modelli che non ti servono più.
- **Esporta**: scarica il workflow come file `.json` per condividerlo o farne un backup.
- **Importa**: carica un file di workflow `.json` dal disco, ripristinando tutti i nodi, le posizioni e le connessioni.

I modelli persistono tra le sessioni nella memoria locale. I file JSON esportati sono portabili tra browser e computer.

## Modello di esecuzione

Il motore costruisce un grafo di dipendenze dalle tue connessioni ed esegue i nodi in ordine topologico. Se un nodo fallisce, l'esecuzione si interrompe e il nodo in errore viene segnato in rosso. Alcune regole da ricordare:

- Ogni workflow richiede almeno un nodo **Input** e un nodo **Output**.
- Il motore rileva le dipendenze circolari e blocca l'esecuzione con un errore.
- Il nodo **Cripta** deve essere l'ultimo passo di elaborazione prima del nodo di output. Collocarlo prima genera un avviso di convalida, perché i nodi a valle non possono operare su dati cifrati.
- I PDF protetti da password chiedono una password durante l'esecuzione.
- Sono supportati input con più PDF: il nodo Unisci può combinarli, oppure i nodi di elaborazione in blocco elaboreranno ogni PDF singolarmente.

## Tipi di socket

Le connessioni usano socket tipizzati per evitare collegamenti non validi:

- **PDF** (indaco): un singolo documento PDF.
- **MultiPDF** (ambra): più documenti PDF raggruppati insieme.
- **Image** (verde): un blob di immagine.

## Opzioni

Ogni nodo ha una propria configurazione accessibile dal pannello delle impostazioni a destra. Gli schemi comuni includono:

- **Intervalli di pagine** nei nodi Dividi, Estrai pagine, Elimina pagine
- **Cursori di qualità** nei nodi di output per la conversione in immagini
- **Campi password** nei nodi Cripta e Decripta
- **Campi di testo** per Filigrana, Intestazione e piè di pagina, Modifica metadati
- **Angoli di rotazione** nel nodo Ruota
- **Livello di compressione** nel nodo Comprimi
- **Selezione della lingua OCR** nel nodo OCR

## Casi d'uso

- **Pipeline di elaborazione fatture**: Input PDF -> OCR -> Estrai tabelle -> Download come CSV.
- **Standardizzazione dei report**: Word in PDF -> Correggi dimensione pagina -> Aggiungi numeri di pagina -> Filigrana -> Comprimi -> Download.
- **Preparazione all'archiviazione**: Input PDF -> Ripara -> Appiattisci -> Sanifica -> PDF in PDF/A -> Download.
- **Estrazione di immagini in blocco**: Input PDF (più file) -> Estrai immagini -> Download ZIP.
- **Opuscoli pronti per la stampa**: Input PDF -> Opuscolo -> Ritaglia -> Comprimi -> Download.
- **Distribuzione sicura**: Input PDF -> Oscura -> Rimuovi annotazioni -> Cripta -> Download.

## Suggerimenti

- Usa **Canc** o **Backspace** per rimuovere dalla tela il nodo selezionato.
- Clicca sul pulsante **X** nella barra di stato di un nodo per eliminarlo direttamente.
- Sposta la tela cliccando e trascinando in uno spazio vuoto. Il cursore diventa una mano mentre trascini.
- Su dispositivi mobili, usa il pulsante **+** nella barra degli strumenti per mostrare o nascondere la casella dei nodi.
- Se il tuo workflow produce più file di output, il nodo Download li raccoglie automaticamente in uno ZIP.
- Inizia in modo semplice: crea e prova una pipeline di due nodi prima di aggiungere complessità.

## Strumenti correlati

- [PDF in Testo](./pdf-to-text)
- [PDF in Excel](./pdf-to-excel)
- [Estrai immagini](./extract-images)
- [PDF in Markdown](./pdf-to-markdown)
