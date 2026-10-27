---
title: Alterna e mescola pagine
description: Unisci i PDF alternando le pagine di ciascun file, con conservazione dei segnalibri.
---

# Alterna e mescola pagine

Alterna le pagine di più file PDF in modo che si susseguano tra un documento e l'altro. È lo strumento giusto quando un'unione standard accoderebbe semplicemente i file uno dopo l'altro, ma a te serve la pagina 1 del File A, poi la pagina 1 del File B, poi la pagina 2 del File A, e così via.

## Come funziona

1. Carica almeno due file PDF usando l'area di rilascio.
2. Lo strumento mostra ogni file con il numero di pagine e la dimensione.
3. Trascina le maniglie per riordinare quale file fornisce per primo le pagine nella sequenza di alternanza.
4. Fai clic su **Mescola pagine** per produrre l'output alternato.
5. Il risultato viene scaricato come `alternated-mixed.pdf`.

## Funzionalità

- Alterna le pagine di un numero qualsiasi di PDF (minimo due)
- Riordino dei file con trascinamento per controllare la priorità di alternanza
- Conserva i segnalibri dei documenti di origine
- Mostra il numero di pagine e la dimensione di ogni file caricato
- Elaborazione tramite un web worker dedicato per un'interfaccia reattiva

## Casi d'uso

- Ricomporre scansioni fronte/retro in cui le pagine dispari e pari sono state scansionate separatamente
- Combinare fogli di domande con le chiavi di risposta, in modo che ogni domanda sia seguita dalla sua risposta
- Unire documenti bilingue pagina per pagina (ad es. inglese su un lato, traduzione sul successivo)
- Alternare le scansioni di fronte e retro ottenute da uno scanner a facciata singola

## Suggerimenti

- Se i PDF di origine hanno un numero di pagine diverso, le pagine del documento più corto finiranno per prime e le pagine rimanenti del documento più lungo appariranno alla fine.
- L'ordine dei file conta: il primo file dell'elenco fornisce la prima pagina dell'output. Trascina per riordinare se necessario.

## Strumenti correlati

- [Unisci PDF](./merge-pdf)
- [Duplica e Organizza](./organize-pdf)
- [Dividi PDF](./split-pdf)
