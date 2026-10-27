---
title: PDF till Word
description: Konvertera PDF-filer till redigerbara Word-dokument (DOCX). Stöder batchkonvertering av flera PDF-filer samtidigt.
---

# PDF till Word

Konverterar PDF-filer till redigerbara Word-dokument (`.docx`). Verktyget använder PyMuPDF för att återskapa dokumentets innehåll och bevarar text, enkel formatering och layout. Stöder konvertering av enskilda filer och batchkonvertering.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer genom att klicka på släppytan eller dra filer dit. Du kan lägga till fler filer eller ta bort enskilda från listan.
2. Klicka på **Konvertera** för att starta bearbetningen.
3. En enskild fil laddas ner som `filename.docx`. Flera filer paketeras i `converted-documents.zip`.

## Alternativ

Verktyget har inga inställbara alternativ. Varje PDF konverteras till DOCX med PyMuPDF:s inbyggda konverteringsmotor.

## Utdataformat

- **En fil**: `filename.docx`
- **Flera filer**: `converted-documents.zip` med en `.docx` per PDF.

## Användningsområden

- Redigera text i en PDF som du har fått och behöver ändra.
- Konvertera arkiverade PDF-rapporter till ett format som kollegor kan redigera i Microsoft Word eller Google Docs.
- Hämta innehåll från PDF-avtal eller offerter till Word för ändringsspårning.
- Migrera äldre PDF-dokumentation till ett redigerbart format.

## Tips

- Komplexa layouter med text i flera kolumner, inbäddade formulär eller mycket grafik kanske inte konverteras perfekt. Granska utdata och justera formateringen i din ordbehandlare.
- Skannade PDF-filer (endast bild) ger tomma eller minimala DOCX-filer. Kör dem genom OCR först för att lägga till ett textlager.
- Batchläget är effektivt för att konvertera hela mappar med PDF-filer: ladda upp dem alla på en gång.

## Relaterade verktyg

- [PDF till text](./pdf-to-text)
- [PDF till Markdown](./pdf-to-markdown)
- [PDF-arbetsflödesbyggare](./pdf-workflow)
