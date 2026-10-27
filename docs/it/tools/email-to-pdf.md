---
title: Email in PDF
description: Converti i file email EML e MSG in PDF nel tuo browser. Preserva intestazioni, corpo ed elenco degli allegati.
---

# Email in PDF

Converti le email salvate in PDF puliti e stampabili. Lo strumento analizza i file EML e MSG, estrae il messaggio completo (intestazioni, corpo e metadati degli allegati) e rende tutto in un PDF strutturato. Utile per la raccolta di prove legali, l'archiviazione o semplicemente per stampare un'email importante.

## Formati supportati

| Formato | Estensione | Note                                                                            |
| :------ | :--------- | :------------------------------------------------------------------------------ |
| EML     | `.eml`     | Formato email MIME standard (esportato dalla maggior parte dei client di posta) |
| MSG     | `.msg`     | Formato proprietario di Microsoft Outlook                                       |

## Come funziona

1. Fai clic sull'area di caricamento o trascina i tuoi file EML o MSG. Puoi mescolare entrambi i formati in un unico lotto.
2. Controlla l'elenco dei file. Rimuovi le voci indesiderate con l'icona del cestino, oppure fai clic su **Aggiungi altri file** per includere altre email.
3. Configura le opzioni di conversione (vedi sotto).
4. Fai clic su **Converti in PDF**. Lo strumento analizza ogni email, rende il contenuto come HTML formattato e lo converte in PDF tramite il motore PyMuPDF.
5. Una singola email viene scaricata direttamente come PDF. Più email vengono raccolte in `emails-converted.zip`.

## Opzioni

| Opzione                                              | Predefinito | Descrizione                                                                                              |
| :--------------------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------- |
| **Formato pagina**                                   | A4          | Scegli tra le dimensioni di pagina A4, Letter o Legal.                                                   |
| **Includi i destinatari CC e CCN nell'intestazione** | Attivo      | Se attiva, gli elenchi dei destinatari CC e CCN compaiono nella sezione intestazione dell'email nel PDF. |
| **Includi l'elenco degli allegati dell'email**       | Attivo      | Se attiva, nel PDF compare l'elenco degli allegati dell'email (con nomi dei file e dimensioni).          |

## Casi d'uso

- Archiviare in PDF la corrispondenza aziendale importante per conformità o audit
- Stampare conversazioni email per procedimenti legali o richieste di produzione di documenti
- Creare una registrazione permanente di conferme d'ordine, ricevute o contratti ricevuti via email
- Fare il backup dei file MSG di Outlook in un formato che non richiede Outlook per essere letto
- Documentare le interazioni con l'assistenza clienti a partire da file EML esportati

## Suggerimenti

- Sono supportati sia i file EML (usati da Thunderbird, Apple Mail e dalla maggior parte dei client di posta) sia i file MSG di Outlook. Esporta le email dal tuo client e trascinale direttamente nello strumento.
- Le email in formato HTML mantengono lo stile nel PDF. Le email in testo semplice vengono rese con una formattazione pulita e leggibile.
- L'elenco degli allegati mostra nomi e dimensioni dei file ma non incorpora i file allegati veri e propri nel PDF.

## Strumenti correlati

- [XML in PDF](./xml-to-pdf)
- [XPS in PDF](./xps-to-pdf)
