---
title: Comprimi PDF
description: Riduci le dimensioni dei PDF fino al 90% con il motore Hyper Compress. Supporta dimensioni di destinazione, elaborazione in blocco e impostazioni di qualità personalizzate.
---

# Comprimi PDF

Riduci i tuoi file PDF senza rovinarli. Comprimi PDF è basato su [Hyper Compress](https://www.bentopdf.com/hyper-compress), il motore di compressione di BentoPDF. Ricomprime le immagini, crea sottoinsiemi e unisce i font ed elimina il peso inutile, come le miniature incorporate e i dati privati delle applicazioni. Il PDF resta pienamente funzionante: il testo rimane selezionabile, i link e i campi modulo continuano a funzionare.

Hyper Compress è compilato in WebAssembly e viene distribuito con BentoPDF, quindi la compressione funziona offline e nelle installazioni isolate dalla rete (air-gapped), senza alcuna configurazione aggiuntiva.

## Come funziona

1. Carica uno o più PDF facendo clic sull'area di rilascio o trascinando i file.
2. Scegli un **Livello di compressione**: Basso, Medio, Alto o Senza perdita.
3. Facoltativamente, inserisci una **Dimensione file di destinazione**, oppure espandi **Impostazioni personalizzate** per un controllo più preciso, inclusa l'opzione **Converti in scala di grigi**.
4. Fai clic su **Comprimi PDF**. Con più file, ottieni un unico download ZIP.

## Documenti particolari

- **I PDF firmati digitalmente** vengono restituiti invariati, perché qualsiasi modifica invaliderebbe la firma. Attiva **Ignora la protezione dei contenuti** in Impostazioni personalizzate per rimuovere le firme e comprimerli; la firma visibile resta sulla pagina, ma il file non è più firmato.
- **I file PDF/A** perdono l'etichetta PDF/A dopo la compressione, così il file non dichiara mai una conformità che non rispetta più. Attiva **Mantieni PDF/A** in Impostazioni personalizzate per mantenere invece la conformità del file.
- **I PDF protetti da password** mostrano un campo password nella scheda del file. Inserisci lì la password e Hyper Compress apre il file da solo, senza un passaggio di sblocco separato. Con due o più file bloccati, un unico campo condiviso sblocca tutti i file che usano la stessa password. La copia compressa non ha password; usa [Proteggi PDF](./protect-pdf) per aggiungerne di nuovo una.
- **Le scansioni senza livello di testo** possono ridursi ulteriormente con **Rasterizza le pagine in immagini** in Impostazioni personalizzate, che sostituisce ogni pagina con un'unica immagine ottimizzata. Viene saltata per qualsiasi documento con testo selezionabile, comprese le scansioni con OCR, a meno che **Ignora la protezione dei contenuti** non sia attivo. In tal caso anche le pagine di testo diventano immagini, quindi il testo non è più selezionabile e i link smettono di funzionare.

## Livelli di compressione

| Livello           | Qualità immagine | Risoluzione max | Ideale per                          |
| ----------------- | ---------------- | --------------- | ----------------------------------- |
| **Basso**         | 80               | 200 DPI         | Preservare la qualità visiva        |
| **Medio**         | 50               | 150 DPI         | Documenti di uso quotidiano         |
| **Alto**          | 20               | 72 DPI          | Allegati email, caricamenti sul web |
| **Senza perdita** | Immagini intatte | Invariata       | Copie d'archivio                    |

Alto rimuove anche l'incorporamento dei 14 font PDF standard, oltre a quelli simili come Arial quando è sicuro farlo.

## Dimensione di destinazione

Inserisci una dimensione in KB o MB e Hyper Compress cerca la migliore qualità d'immagine che rientri comunque nel limite, partendo dal livello che hai scelto. Se il documento non può diventare così piccolo, ottieni la versione più piccola possibile e un messaggio che lo segnala. Le pagine dedicate, come [Comprimi PDF a 1MB](https://www.bentopdf.com/compress-pdf-to-1mb), si aprono con la dimensione di destinazione già compilata.

## Impostazioni personalizzate

Espandi il pannello Impostazioni personalizzate per regolare direttamente Hyper Compress. Scegliere un livello di compressione ripristina questi valori a quelli del livello, e modificarne uno qualsiasi porta il livello su Personalizzato.

- **Ignora la protezione dei contenuti**: per impostazione predefinita Hyper Compress lascia intatti i PDF firmati e non rasterizza le pagine che contengono testo. Attivandola, aggira entrambi i controlli. Resta attiva quando cambi livello.

- **Immagini**: qualità dell'immagine, risoluzione massima, ricampionamento forzato, riduzione dei colori, ritaglio delle aree invisibili delle immagini, rimozione delle immagini alternative, semplificazione dei profili colore, JPEG 2000 e modalità lossless
- **Font**: creazione di sottoinsiemi, unione dei duplicati e rimozione dell'incorporamento dei font standard e di quelli simili
- **Contenuto**: appiattimento di annotazioni, campi modulo o link
- **Pulizia**: rimozione di miniature, dati delle applicazioni, article thread, informazioni di acquisizione web, albero della struttura o output intent
- **Rasterizza**: sostituzione delle pagine con immagini, per scansioni solo immagine; viene saltata quando il documento ha testo selezionabile
- **Output**: Mantieni PDF/A e compressione Brotli per i lettori PDF 2.0 che la supportano

## Casi d'uso

- Portare un report da 50 MB sotto il limite degli allegati email
- Far rientrare una scansione nel rigido limite di caricamento di un portale con una dimensione di destinazione
- Ottimizzare i PDF di marketing per download più rapidi dal sito web
- Archiviare grandi insiemi di documenti quando i costi di archiviazione contano
- Ridurre il consumo di dati mobili condividendo PDF tramite app di messaggistica

## Suggerimenti

- Inizia con Medio. Se il risultato è ancora troppo grande, imposta una dimensione di destinazione o passa ad Alto.
- Per una scansione senza livello di testo, attiva Rasterizza le pagine in immagini in Impostazioni personalizzate.
- Converti in scala di grigi, in Impostazioni personalizzate, può ridurre le dimensioni dei documenti ricchi di colore.

## Strumenti correlati

- [Linearizza PDF](./linearize-pdf): ottimizza il PDF compresso per una visualizzazione web veloce
- [Rasterizza PDF](./rasterize-pdf): converte le pagine in immagini a un DPI specifico, comprese le pagine con testo
- [Ripara PDF](./repair-pdf): ripara un PDF danneggiato da una compressione eseguita altrove
- [Rimuovi Metadati](./remove-metadata): elimina i dati nascosti per la privacy
