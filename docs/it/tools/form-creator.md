---
title: Crea modulo PDF
description: Crea moduli PDF compilabili con campi di testo, caselle di controllo, menu a tendina, pulsanti di opzione e altro, con il trascinamento.
---

# Crea modulo PDF

Progetta moduli PDF compilabili professionali da zero o aggiungendo campi a un PDF esistente. L'editor visuale ti permette di trascinare gli elementi del modulo (campi di testo, caselle di controllo, menu a tendina, pulsanti di opzione, campi firma e altro) direttamente sulle anteprime delle pagine. Configura le proprietà dei campi, imposta regole di visibilità condizionale ed esporta un modulo PDF completamente interattivo.

## Come funziona

1. Carica un PDF esistente **oppure** clicca su **Crea PDF vuoto** per iniziare da zero.
2. Se crei un PDF vuoto, seleziona un formato di pagina (Letter, A4, A5, Legal, Tabloid, A3 o dimensioni personalizzate).
3. Si apre l'editor del modulo con una barra degli strumenti dei tipi di campo e un'area di anteprima della pagina.
4. Seleziona un tipo di campo dalla barra degli strumenti, poi clicca sulla pagina per posizionarlo.
5. Trascina i campi per riposizionarli. Usa le maniglie di ridimensionamento per regolare le dimensioni.
6. Clicca su un campo per aprire il pannello delle proprietà, dove puoi impostare nome del campo, valore predefinito, dimensione del carattere, allineamento e altro.
7. Naviga tra le pagine con i controlli di pagina.
8. Clicca su **Salva** per scaricare il PDF compilabile finito.

## Funzionalità

- Posizionamento dei campi con trascinamento e maniglie visive per il ridimensionamento
- Tipi di campo: input di testo, testo su più righe, casella di controllo, menu a tendina, pulsante di opzione, firma, data, numero e codice a barre
- Pannello delle proprietà per configurare nome, etichetta, valore predefinito, dimensione del carattere, colore, allineamento e validazione di ogni campo
- Azioni sui campi e regole di visibilità condizionale (mostra/nascondi campi in base ai valori di altri campi)
- Navigazione tra le pagine per moduli su più pagine
- Estrazione dei campi esistenti: rileva e importa automaticamente i campi dei moduli dai PDF caricati
- Supporto sia per PDF caricati sia per pagine vuote come tela del modulo
- Diversi formati di pagina predefiniti più dimensioni personalizzate
- Generazione di codici a barre con bwip-js
- Gestione dei gruppi di pulsanti di opzione

## Opzioni

**Formati di pagina predefiniti (per PDF vuoti):**

- Letter (8.5" x 11")
- A4 (210mm x 297mm)
- A5 (148mm x 210mm)
- Legal (8.5" x 14")
- Tabloid (11" x 17")
- A3 (297mm x 420mm)
- Personalizzato (specifica larghezza e altezza)

**Proprietà dei campi (variano in base al tipo di campo):**

- Nome, etichetta e testo segnaposto
- Valore predefinito
- Famiglia, dimensione e colore del carattere
- Allineamento del testo (sinistra, centro, destra)
- Interruttore campo obbligatorio
- Interruttore sola lettura
- Lunghezza massima per i campi di testo
- Elenco di opzioni per menu a tendina e pulsanti di opzione
- Azioni di visibilità condizionale

## Casi d'uso

- Creare moduli di inserimento dei dipendenti con campi di testo per i dati personali e caselle di controllo per l'accettazione delle policy
- Creare questionari di accoglienza clienti con menu a tendina per la scelta del servizio
- Progettare moduli d'ordine con campi calcolati e identificatori a codice a barre
- Creare checklist di ispezione con pulsanti di opzione per le valutazioni superato/non superato
- Creare moduli di sondaggio con domande di approfondimento condizionali che compaiono in base alle risposte

## Suggerimenti

- Se carichi un PDF esistente, lo strumento tenta di estrarre i campi del modulo già presenti, così puoi modificarli o aggiungerne altri.
- Usa la funzione dei gruppi di pulsanti di opzione per creare selezioni mutuamente esclusive. I campi dello stesso gruppo condividono un nome di gruppo.
- Testa il tuo modulo scaricandolo e aprendolo nel [Compilatore Moduli PDF](./form-filler) per verificare il comportamento dei campi.

## Strumenti correlati

- [Compilatore Moduli PDF](./form-filler)
- [Firma PDF](./sign-pdf)
- [Editor PDF](./edit-pdf)
