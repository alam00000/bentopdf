---
title: Dimensioni pagina
description: Analizza dimensioni, orientamento, proporzioni e rotazione delle pagine PDF. Rileva i documenti con pagine di formati diversi ed esporta i dati in CSV.
---

# Dimensioni pagina

Uno strumento diagnostico che legge ogni pagina del tuo PDF e ne riporta le dimensioni esatte, l'orientamento, il nome del formato standard, le proporzioni, l'area e la rotazione. Utile per individuare pagine di formati diversi prima della stampa o per documentare le proprietà di un PDF ricevuto.

## Come funziona

1. Carica un file PDF. L'analisi parte automaticamente: non c'è nessun pulsante da premere.
2. Un riquadro di riepilogo mostra il totale delle pagine, il numero di formati di pagina unici e se il documento contiene formati misti.
3. Consulta la tabella completa dei risultati con i dettagli di ogni pagina.
4. Cambia l'unità di misura tra punti, pollici, millimetri o pixel.
5. Clicca su **Esporta in CSV** per salvare i dati.

## Campi riportati

| Colonna          | Descrizione                                               |
| ---------------- | --------------------------------------------------------- |
| N. pagina        | Numero progressivo della pagina                           |
| Dimensioni       | Larghezza x Altezza nell'unità selezionata                |
| Formato standard | Nome corrispondente (A4, Letter, ecc.) o "Personalizzato" |
| Orientamento     | Verticale o Orizzontale                                   |
| Proporzioni      | Rapporto larghezza/altezza in formato decimale            |
| Area             | Area della pagina nell'unità selezionata al quadrato      |
| Rotazione        | Rotazione della pagina in gradi                           |

## Funzionalità

- Rilevamento automatico dei formati di carta standard (A3, A4, A5, Letter, Legal, Tabloid e altri)
- Avviso per documenti con formati misti, con il dettaglio dei formati presenti e di quante pagine usano ciascuno
- Conversione tra punti, pollici, millimetri e pixel (a 96 PPI)
- Esportazione in CSV da usare in fogli di calcolo o sistemi di documentazione

## Casi d'uso

- Verificare che tutte le pagine siano A4 prima di inviare un documento a una tipografia
- Capire perché un PDF unito viene stampato con margini inattesi su alcune pagine
- Documentare il layout delle pagine di un grande archivio PDF per i record di metadati
- Individuare le pagine ruotate che richiedono una correzione

## Suggerimenti

- Se il riepilogo mostra "Formati misti", usa lo strumento Correggi Dimensione Pagina per uniformare prima di stampare.
- Il campo della rotazione aiuta a individuare le pagine che si vedono correttamente ma hanno un attributo di rotazione diverso da zero, cosa che può causare problemi in alcuni flussi di lavoro.

## Strumenti correlati

- [Correggi Dimensione Pagina](./fix-page-size): uniforma le pagine dopo aver individuato i formati misti
- [Comprimi PDF](./compress-pdf): ottimizza il PDF dopo aver corretto i problemi delle pagine
- [Ruota PDF](./rotate-pdf): correggi le pagine ruotate
