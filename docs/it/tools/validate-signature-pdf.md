---
title: Verifica firma PDF
description: Verifica le firme digitali nei file PDF. Controlla validità del certificato, identità del firmatario, integrità del documento e stato della catena di fiducia.
---

# Verifica firma PDF

Carica un PDF firmato e questo strumento estrae ogni firma digitale, identifica il firmatario, controlla la validità del certificato e indica se il documento è stato modificato dopo la firma. Puoi anche fornire un certificato attendibile per verificare la catena della firma.

## Come funziona

1. Carica un file PDF firmato. La verifica parte automaticamente.
2. Lo strumento mostra un riepilogo: numero di firme trovate e quante sono valide.
3. Ogni firma ha una scheda dettagliata con nome del firmatario, emittente, date e stato.
4. Se vuoi, carica un **certificato attendibile** (.pem, .crt, .cer, .der) per verificare la firma rispetto a una specifica radice di fiducia. La nuova verifica parte automaticamente.

## Cosa viene controllato

### Analisi della firma

Lo strumento estrae gli oggetti firma PKCS#7 dal PDF, decodifica la struttura ASN.1 e ricava il certificato X.509 del firmatario insieme all'eventuale catena di certificati incorporata nella firma.

### Validità del certificato

- **Scadenza**: il certificato è attualmente entro il suo periodo di validità?
- **Rilevamento di autofirma**: il certificato è emesso da sé stesso?
- **Catena di fiducia**: quando viene fornito un certificato attendibile, il certificato del firmatario risale fino a esso?

### Verifica crittografica

- Lo strumento ricostruisce i byte coperti dal `/ByteRange` della firma, ne calcola l'hash con l'algoritmo dichiarato dal firmatario e confronta il risultato con l'attributo `messageDigest` all'interno della firma.
- Poi serializza di nuovo gli attributi firmati come DER SET e verifica la firma rispetto alla chiave pubblica del certificato del firmatario.
- **Una firma è segnalata come valida solo se tutti questi controlli vanno a buon fine.** Se i byte del PDF sono stati modificati dopo la firma, o la firma incorporata non corrisponde alla chiave del firmatario, lo stato mostra "Non valida: verifica crittografica non riuscita" con il motivo specifico.

#### Algoritmi di firma supportati

| Algoritmo               | Percorso di verifica                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, con fallback su Web Crypto                                      |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                             |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` dopo la conversione della firma da DER a IEEE P1363 |

Se una firma usa un algoritmo non presente in questo elenco (ad esempio Ed25519, SM2 o RSA con un OID di digest insolito), la scheda mostra in giallo **"Non verificata: algoritmo di firma non supportato"**, insieme all'OID o al motivo specifico. Si tratta di una distinzione volutamente a tre stati:

- **Valida**: firma verificata crittograficamente rispetto alla chiave pubblica del firmatario.
- **Non valida**: la verifica è stata eseguita e ha dato esito negativo (byte modificati, chiave non corrispondente).
- **Non verificata**: lo strumento non ha potuto eseguire la verifica per questo algoritmo. I metadati del certificato vengono comunque mostrati, ma considera la firma come "sconosciuta" e verificala con Adobe Acrobat o `openssl cms -verify`.

### Algoritmi di digest non sicuri

- Le firme che usano **MD5 o SHA-1** sono rifiutate come non valide e contrassegnate con lo stato "Digest non sicuro". Entrambi gli algoritmi hanno attacchi di collisione noti, quindi una firma su un hash SHA-1 o MD5 non offre alcuna garanzia di integrità.
- SHA-224, SHA-256, SHA-384 e SHA-512 sono tutti accettati.

### Copertura del documento

- **Copertura completa**: la firma copre l'intero file PDF, quindi nessun byte è stato aggiunto o modificato dopo la firma.
- **Copertura parziale**: la firma copre solo una parte del file. Può indicare modifiche successive alla firma (non necessariamente dolose: i salvataggi incrementali producono una copertura parziale).

## Dettagli della firma

Ogni scheda di firma mostra:

- **Firmato da**: nome comune, organizzazione ed email dal certificato del firmatario
- **Emittente**: l'autorità di certificazione che ha emesso il certificato del firmatario
- **Firmato il**: il timestamp incorporato nella firma
- **Valido dal / Valido fino al**: il periodo di validità del certificato
- **Motivo**: perché il documento è stato firmato (se indicato)
- **Luogo**: dove è stato firmato (se indicato)
- **Stato della copertura**: completa o parziale
- **Badge di fiducia**: Attendibile oppure Non nella catena di fiducia (solo quando viene fornito un certificato personalizzato)

### Dettagli tecnici

Espandi la sezione dei dettagli tecnici per vedere:

- Numero di serie del certificato del firmatario
- Algoritmo di digest (SHA-256, SHA-512, ecc.)
- Algoritmo di firma (RSA con SHA-256, ECDSA con SHA-256, ecc.)
- Messaggi di errore per le firme non valide

## Casi d'uso

- Verificare un contratto firmato digitalmente prima di controfirmarlo
- Controllare i documenti firmati per confermare che non siano stati manomessi
- Verificare se un certificato è scaduto dopo la firma del documento
- Convalidare le firme rispetto al certificato radice della tua organizzazione
- Ispezionare i dettagli di firma di documenti governativi o legali

## Suggerimenti

- Un certificato autofirmato non significa che la firma non sia valida: significa che l'identità del firmatario non può essere verificata tramite una terza parte attendibile. È comune per i documenti interni.
- La copertura parziale non indica sempre una manomissione. Molti flussi di lavoro PDF aggiungono aggiornamenti incrementali (come una seconda firma) che creano una copertura parziale.
- Carica il certificato radice o intermedio della tua organizzazione come certificato attendibile per ottenere la verifica della catena di fiducia.

## Strumenti correlati

- [Firma digitale](./digital-sign-pdf): firma i PDF con il tuo certificato
- [Appiattisci PDF](./flatten-pdf): appiattisci un PDF prima di firmarlo per impedire modifiche successive alla firma
- [Rimuovi metadati](./remove-metadata): ripulisci un PDF prima di applicare una firma
