---
title: Sanitizza PDF
description: Rimuovi dai PDF i contenuti nascosti e potenzialmente pericolosi, tra cui metadati, JavaScript, file incorporati, annotazioni e livelli.
---

# Sanitizza PDF

I PDF possono contenere molto più di ciò che vedi sullo schermo. Metadati nascosti, JavaScript incorporato, allegati, dati dei moduli e informazioni sui livelli possono far trapelare dati sensibili o rappresentare rischi per la sicurezza. La sanitizzazione elimina tutto questo e ti lascia un documento pulito, sicuro da condividere pubblicamente.

## Come funziona

1. Carica un file PDF.
2. Seleziona dall'elenco gli elementi da rimuovere.
3. Fai clic su **Sanitizza PDF**.
4. Scarica il file ripulito.

## Opzioni di sanitizzazione

Tutte le opzioni sono attive per impostazione predefinita. Deseleziona quelle che vuoi conservare.

| Opzione                            | Cosa rimuove                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| **Appiattisci moduli**             | Converte i campi modulo interattivi in contenuto statico                        |
| **Rimuovi metadati**               | Elimina autore, titolo, data di creazione, informazioni sul software e dati XMP |
| **Rimuovi annotazioni**            | Elimina commenti, evidenziazioni, note adesive e markup                         |
| **Rimuovi JavaScript**             | Elimina gli script incorporati che potrebbero essere eseguiti all'apertura      |
| **Rimuovi file incorporati**       | Elimina gli allegati incorporati nel PDF                                        |
| **Rimuovi livelli (OCG)**          | Appiattisce i gruppi di contenuto opzionale in un unico livello                 |
| **Rimuovi collegamenti**           | Elimina i collegamenti ipertestuali e i riferimenti a URL                       |
| **Rimuovi albero della struttura** | Rimuove la struttura del documento usata per i tag di accessibilità             |
| **Rimuovi MarkInfo**               | Elimina le informazioni sul contenuto contrassegnato                            |
| **Rimuovi font**                   | Rimuove i dati dei font incorporati (da usare con cautela)                      |

## Casi d'uso

- Preparare un PDF per la pubblicazione eliminando i metadati interni (nomi degli autori, versioni del software, cronologia delle modifiche)
- Rimuovere JavaScript da un PDF ricevuto da una fonte non attendibile prima di aprirlo
- Ripulire un PDF prima di inviarlo a un cliente che non deve vedere commenti incorporati o nomi dei campi modulo
- Eliminare i livelli nascosti da un disegno architettonico prima di condividere la versione finale
- Rispettare i requisiti di minimizzazione dei dati previsti dalle normative sulla privacy

## Suggerimenti

- Lascia deselezionato "Rimuovi font" a meno che tu non sia certo che il PDF verrà comunque visualizzato correttamente. Rimuovere i font può rendere il testo invisibile in alcuni visualizzatori.
- Se ti serve solo eliminare i metadati, lo strumento dedicato Rimuovi metadati è più rapido e mirato.
- La sanitizzazione è irreversibile. Conserva il file originale.

## Strumenti correlati

- [Rimuovi metadati](./remove-metadata): elimina solo i metadati senza toccare il resto del contenuto
- [Appiattisci PDF](./flatten-pdf): appiattisci in particolare moduli e annotazioni
- [Cripta PDF](./protect-pdf): aggiungi la protezione con password dopo la sanitizzazione
- [Rasterizza PDF](./rasterize-pdf): l'opzione drastica, converte in immagini per eliminare ogni contenuto nascosto
