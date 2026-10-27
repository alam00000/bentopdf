---
title: Firma Digitale
description: Aggiungi firme digitali crittografiche ai PDF usando certificati X.509. Supporta i formati PKCS#12 e PEM con opzioni di firma visibile.
---

# Firma Digitale

Una firma digitale è una prova crittografica che una persona specifica ha firmato un documento e che il documento non è stato alterato da allora. A differenza di una firma disegnata (che è solo un'immagine), una firma digitale usa certificati X.509 e gli standard PKCS#7 per garantire autenticità e integrità verificabili.

BentoPDF applica le firme digitali interamente nel tuo browser. La tua chiave privata non lascia mai il tuo dispositivo.

## Come funziona

1. Carica un file PDF.
2. Carica il file del tuo certificato (.pfx, .p12 o .pem).
3. Inserisci la password del certificato per sbloccarlo. Lo strumento mostra il soggetto, l'emittente e il periodo di validità del certificato.
4. Facoltativamente, configura i metadati della firma (motivo, luogo, contatti).
5. Facoltativamente, attiva una **firma visibile** con personalizzazione di posizione, dimensioni, immagine e testo.
6. Fai clic su **Firma PDF**.

## Formati di certificato supportati

| Formato     | Estensioni | Descrizione                                                                                                                        |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12 | Pacchetto standard del settore che contiene la chiave privata e la catena di certificati. È il formato più comune.                 |
| **PEM**     | .pem       | Formato testuale. Deve contenere sia il certificato sia la chiave privata in un unico file. Supporta chiavi private crittografate. |

## Opzioni della firma visibile

Quando è attiva, sulla pagina PDF viene reso un blocco di firma visibile:

- **Posizione**: coordinate X/Y e larghezza/altezza in punti
- **Pagina**: prima pagina, ultima pagina, tutte le pagine o un numero di pagina specifico
- **Immagine**: carica un'immagine PNG, JPG o WebP (la tua firma autografa, il sigillo aziendale, ecc.)
- **Testo**: testo personalizzato con colore e dimensione del carattere configurabili. Se non vengono forniti né immagine né testo, lo strumento genera automaticamente il testo dal nome comune del certificato e dalla data corrente.

## Metadati della firma

- **Motivo**: perché il documento è stato firmato (ad es. "Approvato", "Rivisto")
- **Luogo**: dove è avvenuta la firma (ad es. "New York, NY")
- **Contatti**: come raggiungere il firmatario (ad es. indirizzo email)

## Nota sulla connessione a Internet

La firma può richiedere una connessione a Internet. La libreria di firma recupera la catena di certificati dagli URL incorporati nell'estensione Authority Information Access (AIA) del tuo certificato. Se quei server non sono raggiungibili, la firma fallirà per i certificati che richiedono la validazione della catena.

## Casi d'uso

- Firmare contratti, proposte e accordi con firme digitali giuridicamente vincolanti
- Certificare documenti ufficiali in flussi di lavoro che richiedono l'autenticazione basata su PKI
- Firmare fatture PDF per la conformità normativa (molti paesi dell'UE richiedono e-fatture firmate digitalmente)
- Aggiungere l'approvazione organizzativa a disegni tecnici o documenti di qualità

## Suggerimenti

- I certificati autofirmati vanno bene per i test, ma mostreranno avvisi in Adobe Reader. Per i documenti di produzione usa un certificato di un'autorità di certificazione attendibile.
- La firma visibile è puramente grafica. La firma crittografica viene incorporata indipendentemente dal fatto che il blocco visibile sia attivo.
- Verifica il PDF firmato con lo strumento Convalida Firma per confermare che la firma sia integra.

## Strumenti correlati

- [Convalida Firma](./validate-signature-pdf): verifica le firme digitali nei PDF firmati
- [Appiattisci PDF](./flatten-pdf): appiattisci i moduli prima della firma per impedire modifiche
- [Proteggi PDF](./protect-pdf): aggiungi la protezione con password sopra la firma digitale
- [Rimuovi Metadati](./remove-metadata): elimina i metadati prima di firmare
