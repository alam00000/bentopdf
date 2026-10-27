---
title: Livelli PDF (OCG)
description: Visualizza, attiva o disattiva, aggiungi ed elimina i livelli Optional Content Group (OCG) in un documento PDF.
---

# Livelli PDF (OCG)

Gestisci gli Optional Content Group (OCG), comunemente chiamati "livelli", all'interno di un PDF. Puoi attivare o disattivare la visibilità dei livelli, aggiungere nuovi livelli (anche livelli figli annidati), eliminare livelli e salvare il PDF modificato.

## Come funziona

1. Carica un file PDF.
2. Clicca sul pulsante di elaborazione per caricare il documento con il motore PyMuPDF.
3. Lo strumento mostra tutti i livelli esistenti con il loro stato di visibilità, lo stato di blocco e la gerarchia di annidamento.
4. Usa le caselle di controllo per mostrare o nascondere i livelli. I livelli bloccati non possono essere attivati o disattivati.
5. Aggiungi nuovi livelli di primo livello digitando un nome e cliccando sul pulsante di aggiunta, oppure aggiungi livelli figli sotto un livello padre esistente.
6. Elimina i livelli che non ti servono più.
7. Clicca su **Salva** per scaricare il PDF modificato con le modifiche ai livelli applicate.

## Funzionalità

- Mostra la gerarchia dei livelli con la giusta rientranza per i livelli annidati
- Attiva o disattiva la visibilità dei livelli
- L'indicatore di livello bloccato evita modifiche accidentali
- Aggiungi livelli di primo livello o figli con nomi personalizzati
- Elimina i singoli livelli
- Salva tutte le modifiche in un nuovo file PDF

## Casi d'uso

- Attivare o disattivare la visibilità dei livelli di annotazione in disegni architettonici o tecnici
- Aggiungere nuovi livelli di annotazione a un documento di progettazione a più livelli
- Rimuovere i livelli obsoleti da un modello prima di distribuirlo
- Controllare quali livelli esistono in un PDF complesso ricevuto da terzi

## Suggerimenti

- Se il PDF non ha livelli, lo strumento mostra uno stato vuoto con l'invito ad aggiungerne uno. Non tutti i PDF usano i livelli OCG: sono più comuni nelle esportazioni CAD e nei file di progettazione.
- I livelli figli sono visivamente rientrati sotto il loro padre. Puoi annidare i livelli a qualsiasi profondità.
- I livelli bloccati sono mostrati con un'icona di lucchetto e le loro caselle di controllo sono disabilitate. Questi blocchi sono impostati dal creatore del PDF.

## Strumenti correlati

- [Visualizza Metadati](./view-metadata)
- [Modifica Metadati](./edit-metadata)
- [Duplica e Organizza](./organize-pdf)
