---
title: PDF in PDF/A
description: Converti i PDF standard in formato PDF/A per l'archiviazione a lungo termine. Supporta i livelli di conformità PDF/A-1b, PDF/A-2b e PDF/A-3b.
---

# PDF in PDF/A

PDF/A è un sottoinsieme del PDF standardizzato ISO, pensato per la conservazione digitale a lungo termine. Questo strumento converte i tuoi PDF standard in documenti conformi a PDF/A usando Ghostscript direttamente nel tuo browser.

## Come funziona

1. Carica uno o più file PDF.
2. Seleziona una **Versione PDF/A** dal menu a tendina.
3. Se vuoi, attiva **Appiattisci PDF prima** per i file complessi che falliscono con la conversione normale.
4. Clicca su **Converti in PDF/A**. Più file producono un archivio ZIP.

## Versioni PDF/A

| Versione     | Restrizioni                                         | Ideale per                                                  |
| ------------ | --------------------------------------------------- | ----------------------------------------------------------- |
| **PDF/A-1b** | La più rigida. Nessuna trasparenza, nessun livello. | Massima compatibilità con i vecchi sistemi di archiviazione |
| **PDF/A-2b** | Consente trasparenza e JPEG2000.                    | Archiviazione generica (consigliata)                        |
| **PDF/A-3b** | Consente allegati incorporati di qualsiasi formato. | Archiviare documenti con i relativi file di dati di origine |

PDF/A-2b è selezionata per impostazione predefinita e soddisfa la grande maggioranza delle esigenze di archiviazione.

## Opzione di appiattimento preliminare

Alcuni PDF contengono elementi che impediscono una conversione pulita in PDF/A: codifiche di font insolite, complesse pile di trasparenze o strutture interne danneggiate. Attivando **Appiattisci PDF prima**, il PDF viene rasterizzato a 300 DPI prima della conversione: questo garantisce la conformità al prezzo di rendere il testo non selezionabile. Usala come soluzione di riserva quando la conversione standard produce errori.

L'appiattimento preliminare richiede il motore PyMuPDF WASM.

## Casi d'uso

- Rispettare i requisiti di archiviazione governativi o legali (molte giurisdizioni impongono PDF/A per gli atti giudiziari)
- Inviare documenti a archivi istituzionali o biblioteche digitali
- Conservare documenti aziendali il cui software originale potrebbe non esistere più tra dieci anni
- Preparare fatture per gli standard di fatturazione elettronica che richiedono PDF/A-3b con allegati XML

## Suggerimenti

- Prova prima la conversione senza appiattimento preliminare. Attivalo solo se ottieni un errore.
- PDF/A incorpora tutti i font, quindi i file di output sono spesso più grandi degli originali.
- Convalida l'output con un validatore PDF/A dedicato se il tuo flusso di lavoro richiede una conformità rigorosa.

## Strumenti correlati

- [Comprimi PDF](./compress-pdf): riduci le dimensioni del file dopo la conversione
- [Appiattisci PDF](./flatten-pdf): appiattisci i moduli prima di convertire in PDF/A
- [Rimuovi metadati](./remove-metadata): elimina i metadati prima di archiviare
