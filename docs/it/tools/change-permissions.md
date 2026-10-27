---
title: Modifica permessi
description: Imposta o modifica i permessi di utilizzo del PDF per stampa, copia, modifica e annotazione. Usa la crittografia AES a 256 bit.
---

# Modifica permessi

Definisci con precisione cosa possono fare i destinatari con il tuo PDF. A differenza della semplice crittografia che si limita a bloccare il file con una password, questo strumento ti permette di consentire o negare selettivamente stampa, copia, modifica, annotazione, compilazione dei moduli, assemblaggio del documento ed estrazione delle pagine, il tutto applicato tramite crittografia AES a 256 bit.

## Come funziona

1. Carica un file PDF.
2. Se il PDF è già crittografato, inserisci la **Password attuale**.
3. Imposta una **Nuova password utente** (necessaria per aprire il file) e/o una **Nuova password proprietario** (controlla i permessi).
4. Attiva o disattiva i singoli permessi con le caselle di controllo.
5. Fai clic su **Modifica permessi**.
6. Scarica il PDF aggiornato.

Se lasci vuoti entrambi i campi delle nuove password, lo strumento decrittografa completamente il PDF, rimuovendo ogni crittografia e restrizione.

## Controlli dei permessi

| Permesso                                  | Cosa controlla                                               |
| ----------------------------------------- | ------------------------------------------------------------ |
| **Consenti la stampa**                    | Se il documento può essere stampato                          |
| **Consenti la copia del testo**           | Se testo e immagini possono essere selezionati e copiati     |
| **Consenti la modifica**                  | Se il contenuto del documento può essere modificato          |
| **Consenti le annotazioni**               | Se possono essere aggiunti commenti, evidenziazioni e timbri |
| **Consenti la compilazione dei moduli**   | Se i campi modulo interattivi possono essere compilati       |
| **Consenti l'assemblaggio del documento** | Se le pagine possono essere inserite, eliminate o ruotate    |
| **Consenti l'estrazione di pagine**       | Se le singole pagine possono essere estratte                 |

Tutti i permessi richiedono una password del proprietario per essere applicati. Senza una password del proprietario, i flag dei permessi vengono ignorati dalla maggior parte dei lettori PDF.

## Come funzionano i permessi nel PDF

I permessi del PDF fanno parte della specifica di crittografia. Sono memorizzati come flag di bit nel dizionario di crittografia e applicati dai lettori PDF conformi. La distinzione fondamentale:

- **Password utente**: necessaria per aprire il file.
- **Password del proprietario**: necessaria per cambiare i permessi o rimuovere le restrizioni. Senza di essa, i flag dei permessi controllano quali operazioni può eseguire l'utente.

Se imposti solo una password del proprietario (senza password utente), chiunque può aprire il file ma è limitato alle operazioni consentite. Se le imposti entrambe, il file richiede una password per essere aperto ed è limitato dopo l'autenticazione.

## Casi d'uso

- Distribuire un report che può essere visualizzato e stampato ma non modificato né copiato
- Condividere un modello di contratto che i destinatari possono compilare ma non modificare
- Pubblicare un catalogo PDF in cui la copia delle immagini è disabilitata
- Consentire le annotazioni su una bozza in revisione impedendo modifiche strutturali

## Suggerimenti

- Per essere efficace, imposta sempre una password del proprietario. I permessi senza password del proprietario non possono essere fatti rispettare.
- Alcuni strumenti PDF di terze parti ignorano i flag dei permessi. Per una protezione più forte, valuta di rasterizzare il PDF o di usare il DRM.
- Usa questo strumento per aggiornare i vecchi PDF crittografati con RC4 ad AES-256.

## Strumenti correlati

- [Proteggi PDF](./protect-pdf): protezione semplice con password, senza permessi granulari
- [Sblocca PDF](./unlock-pdf): rimuove completamente la crittografia
- [Rimuovi Restrizioni](./remove-restrictions): elimina tutte le restrizioni quando hai la password del proprietario
