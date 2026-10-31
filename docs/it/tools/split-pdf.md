---
title: Dividi PDF
description: Dividi un PDF in file più piccoli per intervallo di pagine, selezione visiva, segnalibri, pagine pari/dispari o intervalli fissi.
---

# Dividi PDF

Suddividi un PDF in documenti più piccoli con una delle sei modalità di divisione. Dai semplici intervalli di pagine alla divisione basata sui segnalibri, questo strumento copre ogni scenario per dividere un documento.

## Come funziona

1. Carica un singolo file PDF.
2. Scegli una modalità di divisione dal menu a discesa.
3. Configura le opzioni specifiche della modalità (intervalli di pagine, selezioni e così via).
4. Fai clic sul pulsante di elaborazione.
5. Il risultato viene scaricato come singolo PDF o come archivio ZIP, a seconda della modalità e delle impostazioni.

## Modalità di divisione

| Modalità             | Descrizione                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Intervallo**       | Inserisci intervalli di pagine come `1-3, 5, 8-10`. Più intervalli producono PDF separati in uno ZIP. Un singolo intervallo produce un solo PDF. |
| **Selezione visiva** | Sfoglia le miniature delle pagine e fai clic per selezionare quelle che vuoi. Le pagine selezionate vengono estratte in un nuovo PDF.            |
| **Pari / Dispari**   | Estrae solo le pagine con numero pari o dispari.                                                                                                 |
| **Tutte le pagine**  | Divide ogni pagina in un file PDF a sé, scaricato come ZIP.                                                                                      |
| **Segnalibri**       | Divide ai confini dei segnalibri. Scegli il livello dei segnalibri per controllare dove avvengono le divisioni.                                  |
| **Ogni N pagine**    | Divide in blocchi di N pagine ciascuno (ad es. ogni 5 pagine). L'ultimo blocco può avere meno pagine.                                            |

## Funzionalità

- Sei modalità di divisione distinte che coprono praticamente ogni caso d'uso
- Selettore visivo delle pagine con miniature caricate in modo differito
- Divisione basata sui segnalibri con filtro per livello
- Opzione di output ZIP per le modalità Intervallo e Selezione visiva
- Gestisce intervalli di pagine con sintassi mista (`1-3, 5, 8-10`)
- Avviso quando la divisione per N pagine produce blocchi non uniformi

## Casi d'uso

- Estrarre un capitolo o una sezione specifica da un documento di grandi dimensioni
- Separare le pagine pari e dispari per i flussi di stampa fronte/retro
- Suddividere il PDF di un libro in file dei singoli capitoli ai confini dei segnalibri
- Isolare pagine specifiche (come la pagina delle firme) da un contratto
- Dividere un report compilato in file per sezione da distribuire

## Suggerimenti

- Più intervalli di pagine separati da virgole (ad es. `1-5, 10-15, 20-25`) producono PDF separati, uno per intervallo, raccolti in uno ZIP.
- La modalità di divisione per segnalibri richiede che il PDF contenga effettivamente dei segnalibri. Se non ne vengono trovati, riceverai un messaggio di errore.
- La casella "Scarica come ZIP" nelle modalità Intervallo e Selezione visiva ti permette di ottenere un PDF per ogni pagina anziché un file combinato.

## Strumenti correlati

- [Unisci PDF](./merge-pdf)
- [Estrai Pagine](./extract-pages)
- [Elimina Pagine](./delete-pages)
- [Strumento PDF multifunzione](./pdf-multi-tool)
