---
title: PDF till text
description: Extrahera ren text från PDF-filer. Stöder batchextrahering av flera PDF-filer med TXT-filer som utdata.
---

# PDF till text

Extraherar allt textinnehåll från PDF-filer och sparar det som rena `.txt`-filer. Stöder batchbearbetning: ladda upp flera PDF-filer och få varje fils text extraherad i en och samma åtgärd. Drivs av PyMuPDF.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer genom att klicka på släppytan eller dra filer dit. Hantera fillistan med knapparna Lägg till fler och Rensa.
2. Klicka på **Extrahera** för att starta bearbetningen.
3. En enskild fil laddas ner som `filename.txt`. Flera filer ger ett `pdf-to-text.zip`-arkiv.

## Alternativ

Verktyget har inga inställbara alternativ. Allt textinnehåll extraheras från varje sida i läsordning.

## Utdataformat

- **En fil**: `filename.txt`
- **Flera filer**: `pdf-to-text.zip` med en `.txt` per PDF.

## Användningsområden

- Extrahera brödtext från PDF-rapporter för indexering av fulltextsökning.
- Konvertera PDF-e-böcker eller artiklar till ren text för läsning på e-ink-enheter.
- Hämta text från avtal eller juridiska dokument för nyckelordsanalys.
- Ta bort formatering från PDF-filer för att få ren text till databehandlingsskript.
- Förbereda textkorpusar från PDF-arkiv för språkteknologi.

## Tips

- Skannade PDF-filer (endast bild) ger tomma textfiler eftersom det inte finns något textlager att extrahera. Kör skannade dokument genom OCR först.
- Utdata bevarar läsordningen så som PyMuPDF tolkar den, vilket oftast följer vänster till höger och uppifrån och ned. Layouter med flera kolumner kan ge text som blandas ihop.
- För strukturerad utdata med rubriker och formatering, prova [PDF till Markdown](./pdf-to-markdown). För AI-färdig strukturerad JSON, använd [Förbered PDF för AI](./prepare-pdf-for-ai).

## Relaterade verktyg

- [PDF till Markdown](./pdf-to-markdown)
- [Förbered PDF för AI](./prepare-pdf-for-ai)
- [PDF till Word](./pdf-to-word)
