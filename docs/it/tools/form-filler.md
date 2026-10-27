---
title: Compilatore moduli PDF
description: Compila moduli PDF, inclusi i moduli XFA, direttamente nel browser con un visualizzatore integrato.
---

# Compilatore moduli PDF

Apri un PDF con campi di modulo e compilalo direttamente in un visualizzatore integrato. Lo strumento supporta sia i campi AcroForm standard sia i moduli XFA (XML Forms Architecture) legacy. Una volta completato il modulo, scarica la versione compilata con un solo clic.

## Come funziona

1. Carica un PDF che contiene campi di modulo.
2. Il documento si apre in un visualizzatore PDF integrato che mostra i campi del modulo come input interattivi.
3. Clicca su campi di testo, caselle di controllo, menu a tendina e pulsanti di opzione per compilarli.
4. Clicca su **Salva e scarica il modulo compilato** per ottenere il PDF completato.

## Funzionalità

- Visualizzatore PDF.js integrato con piena interazione con i campi del modulo
- Supporto per i campi AcroForm standard (input di testo, caselle di controllo, menu a tendina, pulsanti di opzione)
- Supporto dei moduli XFA per i moduli legacy basati su XML
- Dimensionamento automatico del visualizzatore in base alle dimensioni della pagina
- Visualizzazione del file con nome e dimensione

## Opzioni

Non ci sono opzioni di configurazione aggiuntive. Carica il modulo, compilalo e scaricalo.

## Casi d'uso

- Compilare moduli fiscali, richieste assicurative o pratiche burocratiche
- Compilare moduli di candidatura ricevuti come allegati PDF
- Completare moduli di inserimento fornitori o questionari per fornitori
- Approvare checklist di conformità con campi a casella di controllo
- Compilare moduli di accettazione medica prima di un appuntamento

## Suggerimenti

- I moduli XFA sono un formato legacy supportato solo da alcuni visualizzatori PDF. Se apri un PDF XFA in Chrome o nella maggior parte degli altri strumenti e vedi pagine vuote, significa che quei visualizzatori non supportano XFA. Il Compilatore Moduli di BentoPDF e Firefox gestiscono correttamente XFA.
- Per i PDF senza campi di modulo esistenti, usa lo strumento [Crea Modulo PDF](./form-creator) per aggiungere prima i campi, poi compilali qui.
- Il visualizzatore adatta automaticamente le proprie dimensioni a quelle della pagina del PDF.

## Strumenti correlati

- [Crea Modulo PDF](./form-creator)
- [Firma PDF](./sign-pdf)
- [Editor PDF](./edit-pdf)
