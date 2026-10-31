---
title: Proteggi PDF
description: Proteggi i file PDF con una password usando la crittografia AES a 256 bit. Imposta password utente e proprietario con restrizioni d'uso configurabili.
---

# Proteggi PDF

Blocca il tuo PDF con una password, così solo le persone autorizzate potranno aprirlo. BentoPDF usa la crittografia AES a 256 bit, lo stesso standard usato da banche e agenzie governative, applicata interamente nel tuo browser tramite QPDF.

## Come funziona

1. Carica un file PDF.
2. Inserisci una **Password utente** (obbligatoria). È la password che serve per aprire il file.
3. Se vuoi, inserisci una **Password proprietario**. Se impostata, il PDF ottiene restrizioni d'uso che impediscono di stampare, modificare, copiare e annotare.
4. Fai clic su **Cripta PDF**.
5. Scarica il file criptato.

## Tipi di password

### Password utente (obbligatoria)

La password utente è quella che i destinatari digitano per aprire il PDF. Senza di essa il documento è completamente inaccessibile. Ogni PDF criptato deve averne una.

### Password proprietario (facoltativa)

La password proprietario controlla cosa può fare un utente autorizzato dopo aver aperto il file. Quando imposti una password proprietario distinta, BentoPDF applica automaticamente il set di restrizioni più severo:

- Modifica disabilitata
- Estrazione/copia disabilitata
- Stampa disabilitata
- Annotazione disabilitata
- Compilazione dei moduli disabilitata
- Assemblaggio del documento disabilitato

Se lasci vuota la password proprietario, il PDF viene criptato (per aprirlo serve comunque la password utente) ma, una volta aperto, non ha restrizioni d'uso.

## Dettagli sulla crittografia

- **Algoritmo**: AES-256 (Advanced Encryption Standard a 256 bit)
- **Lunghezza della chiave**: 256 bit
- **Standard**: crittografia PDF 2.0 (implementazione QPDF)

Con la tecnologia attuale, AES-256 non è violabile con un attacco a forza bruta. La sicurezza del tuo PDF criptato dipende interamente dalla robustezza della password.

## Casi d'uso

- Proteggere report finanziari riservati prima di inviarli per email
- Mettere al sicuro documenti legali condivisi con la controparte
- Aggiungere una password a cartelle cliniche o a dati personali identificabili
- Distribuire contenuti a pagamento (e-book, report) con controllo degli accessi
- Rispettare le policy di protezione dei dati che richiedono la crittografia dei dati archiviati

## Suggerimenti

- Usa una password forte e univoca. Una passphrase di almeno 12 caratteri con maiuscole, minuscole, numeri e simboli è l'ideale.
- Condividi la password attraverso un canale separato (telefono, messaggio di testo), mai nella stessa email del PDF.
- Se ti serve solo limitare alcune azioni (niente stampa, niente copia) senza richiedere una password per aprire il file, usa invece lo strumento Modifica permessi.

## Strumenti correlati

- [Decrittografa PDF](./unlock-pdf): rimuovi la crittografia quando conosci la password
- [Modifica permessi](./change-permissions): modifica restrizioni d'uso specifiche
- [Rimuovi Restrizioni](./remove-restrictions): elimina ogni protezione da un PDF
- [Sanitizza PDF](./sanitize-pdf): rimuovi i contenuti nascosti prima di criptare
