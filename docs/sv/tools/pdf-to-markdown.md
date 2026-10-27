---
title: PDF till Markdown
description: Konvertera PDF-dokument till Markdown-format med valfri bildextrahering. Stöder batchkonvertering av flera filer.
---

# PDF till Markdown

Konverterar PDF-filer till Markdown-format (`.md`) och bevarar rubriker, stycken, listor och enkel formatering. Kan även extrahera och inkludera inbäddade bilder. Stöder konvertering av enskilda filer och batchkonvertering. Drivs av PyMuPDF.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer genom att klicka på släppytan eller dra filer dit.
2. Slå vid behov på **Inkludera bilder** för att bädda in extraherade bilder i Markdown-utdata.
3. Klicka på **Konvertera** för att starta bearbetningen.
4. En enskild fil laddas ner som `filename.md`. Flera filer ger en `markdown-files.zip`.

## Alternativ

- **Inkludera bilder**: när det är markerat extraheras inbäddade bilder från PDF-filen och refereras i Markdown-utdata. När det inte är markerat konverteras bara textinnehållet.

## Utdataformat

- **En fil**: `filename.md`
- **Flera filer**: `markdown-files.zip` med en `.md` per PDF.

## Användningsområden

- Konvertera PDF-dokumentation till Markdown för en statisk webbplatsgenerator som VitePress, Hugo eller Jekyll.
- Göra PDF-forskningsartiklar till redigerbar Markdown för anteckningsappar som Obsidian.
- Migrera äldre PDF-kunskapsbaser till ett Git-vänligt textformat.
- Extrahera strukturerat innehåll från PDF-e-böcker för omformatering.

## Tips

- Alternativet Inkludera bilder är användbart när PDF-filen innehåller diagram eller figurer som är avgörande för innehållet. Stäng av det för textbaserade dokument så blir utdata renare.
- Komplexa layouter med sidofält, fotnoter eller text i flera kolumner kan ge ofullständig Markdown. Granska och justera utdata vid behov.
- För rå text utan formatering, använd [PDF till text](./pdf-to-text) i stället.

## Relaterade verktyg

- [PDF till text](./pdf-to-text)
- [PDF till Word](./pdf-to-word)
- [Förbered PDF för AI](./prepare-pdf-for-ai)
