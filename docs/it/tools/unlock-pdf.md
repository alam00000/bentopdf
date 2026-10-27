---
title: Sblocca PDF
description: Rimuovi la protezione con password dai PDF crittografati. Supporta la decrittografia in batch con un'unica password per più file.
---

# Sblocca PDF

Se conosci la password di un PDF crittografato, questo strumento rimuove completamente la crittografia e produce una copia sbloccata che chiunque può aprire senza credenziali. Supporta la decrittografia in batch quando più PDF condividono la stessa password.

## Come funziona

1. Carica uno o più file PDF crittografati.
2. Inserisci la **password** usata per proteggere i file.
3. Fai clic su **Decrittografa PDF**.
4. Un singolo file viene scaricato direttamente. Più file producono un archivio ZIP con tutti i PDF sbloccati.

## Funzionalità

- Decrittografia di singoli file e in batch
- Gestisce sia le password utente sia quelle del proprietario
- Produce un output completamente non crittografato, senza restrizioni residue
- Segnalazione chiara degli errori per password errate o file danneggiati
- Monitoraggio di successo/errore per ogni file in modalità batch

## Differenze rispetto a Rimuovi Restrizioni

**Decrittografa PDF** richiede la password e rimuove tutta la crittografia. **Rimuovi Restrizioni** agisce sulle restrizioni d'uso (stampa, copia, modifica) e potrebbe non richiedere una password se è stata impostata solo una password del proprietario. Usa Decrittografa quando il PDF non si apre affatto senza password.

## Casi d'uso

- Sbloccare in modo permanente PDF che avevi crittografato in precedenza quando la password non serve più
- Rimuovere la crittografia da un gruppo di documenti archiviati per un accesso più semplice nel lungo periodo
- Preparare PDF protetti da password per un sistema di gestione documentale che non supporta i file crittografati
- Sbloccare i PDF prima di unirli ad altri documenti (molti strumenti di unione non riescono a elaborare input crittografati)

## Suggerimenti

- Il campo password si applica a tutti i file caricati. Se i tuoi PDF hanno password diverse, elaborali in batch separati.
- Se ricevi l'errore "Password errata", controlla di non aver inserito spazi finali e che il blocco maiuscole non sia attivo.
- Dopo la decrittografia, l'output non ha alcuna protezione. Ricrittografa con Cripta PDF se vuoi applicare una nuova password.

## Strumenti correlati

- [Cripta PDF](./protect-pdf): applica di nuovo la crittografia con una nuova password
- [Rimuovi Restrizioni](./remove-restrictions): rimuovi le restrizioni d'uso senza decrittografare del tutto
- [Modifica permessi](./change-permissions): modifica permessi specifici di un PDF crittografato
