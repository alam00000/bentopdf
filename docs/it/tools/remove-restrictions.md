---
title: Rimuovi restrizioni
description: Rimuovi la protezione con password, le restrizioni di stampa, i blocchi di modifica e i limiti di copia dai file PDF.
---

# Rimuovi restrizioni

I PDF possono avere due tipi di password: una password utente (necessaria per aprire il file) e una password proprietario (controlla cosa puoi farci). Questo strumento elimina entrambe, insieme a tutte le restrizioni associate: blocchi di stampa, modifica, copia e annotazione.

## Come funziona

1. Carica un file PDF.
2. Se il PDF ha una password proprietario, inseriscila nel campo **Password proprietario**. Lascialo vuoto se il PDF ha solo restrizioni d'uso senza password.
3. Fai clic su **Rimuovi Restrizioni**.
4. Scarica il PDF senza restrizioni.

Lo strumento usa i flag `--decrypt` e `--remove-restrictions` di QPDF per produrre una copia pulita e senza restrizioni.

## Cosa viene rimosso

- Protezione con password (sia utente che proprietario)
- Restrizioni di stampa
- Restrizioni di modifica
- Restrizioni di copia di testo e immagini
- Restrizioni di annotazione e commento
- Tutte le altre limitazioni di sicurezza codificate nel PDF

## Casi d'uso

- Sbloccare un PDF di tua proprietà di cui hai impostato la password anni fa
- Rimuovere le restrizioni di stampa da un documento a cui hai legittimamente accesso
- Abilitare il copia e incolla su materiali di consultazione per prendere appunti
- Preparare PDF per strumenti di accessibilità che non gestiscono i documenti con restrizioni

## Suggerimenti

- Se ne è impostata una, devi conoscere la password proprietario. Questo strumento non decifra né forza le password.
- Se vuoi mantenere il file criptato ma cambiare alcuni permessi, usa invece lo strumento Modifica permessi.
- Il file di output non ha alcuna crittografia: chiunque lo riceva può aprirlo liberamente.

## Strumenti correlati

- [Decrittografa PDF](./unlock-pdf): sblocca un PDF quando conosci la password utente
- [Cripta PDF](./protect-pdf): applica di nuovo la crittografia con nuove impostazioni
- [Modifica permessi](./change-permissions): modifica in modo selettivo le azioni consentite
