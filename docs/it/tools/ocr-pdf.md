---
title: OCR PDF
description: Rendi ricercabili e copiabili i PDF scansionati con Tesseract OCR, con supporto multilingue e filtro dei caratteri.
---

# OCR PDF

Trasforma i documenti scansionati in PDF ricercabili e copiabili. Lo strumento usa Tesseract OCR per riconoscere il testo nelle immagini e sovrappone un livello di testo invisibile alle pagine originali, preservandone l'aspetto visivo e rendendo il contenuto completamente ricercabile.

## Come funziona

1. Carica un PDF scansionato o basato su immagini.
2. Seleziona una o più lingue presenti nel documento dall'elenco delle lingue con ricerca.
3. Facoltativamente, regola le impostazioni avanzate (risoluzione, binarizzazione, whitelist).
4. Clicca su **Avvia OCR** e segui l'avanzamento nella barra di progresso in tempo reale.
5. Al termine, controlla il testo estratto, poi scarica il PDF ricercabile o un semplice file `.txt`.

## Funzionalità

- OCR multilingue con selettore di lingua ricercabile
- Il livello di testo invisibile preserva l'aspetto originale del documento
- Barra di progresso e log in tempo reale durante l'elaborazione
- Scarica i risultati come PDF ricercabile o file di testo semplice
- Copia il testo estratto direttamente negli appunti
- Tre livelli di risoluzione per bilanciare velocità e precisione

## Opzioni

| Impostazione                       | Valori                                                                                             | Predefinito | Scopo                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| **Risoluzione**                    | Standard (192 DPI), Alta (288 DPI), Ultra (384 DPI)                                                | Alta        | Una risoluzione maggiore migliora la precisione sul testo piccolo ma richiede più tempo     |
| **Binarizza immagine**             | Sì / No                                                                                            | No          | Migliora il contrasto per scansioni pulite convertendo in bianco e nero                     |
| **Preset whitelist dei caratteri** | Nessuno, Alfanumerico, Numeri + Valuta, Solo lettere, Solo numeri, Fattura, Moduli, Personalizzato | Nessuno     | Limita i caratteri riconosciuti per migliorare la precisione su tipi di documento specifici |
| **Whitelist dei caratteri**        | Testo libero                                                                                       | Vuoto       | Insieme di caratteri manuale quando il preset è impostato su Personalizzato                 |

## Casi d'uso

- Rendere ricercabili contratti e fatture scansionati, così puoi usare Ctrl+F al loro interno
- Estrarre il testo da documenti fotografati o vecchie carte
- Elaborare ricevute con il preset Fattura per catturare con precisione importi e date
- Creare PDF accessibili da scansioni di sole immagini per requisiti di conformità
- Estrarre in blocco il contenuto testuale da libri o manuali scansionati

## Suggerimenti

- Seleziona più lingue se il documento contiene testo in lingue miste (ad es. intestazioni in inglese con testo in giapponese).
- Usa l'opzione di binarizzazione per documenti con testo sbiadito o a basso contrasto: può migliorare in modo significativo la precisione del riconoscimento.
- I preset di whitelist Fattura e Moduli riducono drasticamente i falsi positivi sui documenti strutturati ignorando le forme di caratteri irrilevanti.

## Strumenti correlati

- [Estrai tabelle PDF](./extract-tables)
- [Unisci PDF](./merge-pdf)
- [Comprimi PDF](./compress-pdf)
