---
title: PDF till SVG
description: Konvertera PDF-sidor till skalbar SVG-vektorgrafik. Bevarar text och former som vektorbanor för oändlig skalning.
---

# PDF till SVG

Konverterar varje sida i en PDF till en SVG-fil (Scalable Vector Graphics). Till skillnad från rasterformat bevarar SVG vektorbanor, text och former så att utdata kan skalas till vilken storlek som helst utan pixlighet. Drivs av PyMuPDF.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer genom att klicka på släppytan eller dra filer dit. Du kan lägga till flera filer och hantera dem var för sig.
2. Klicka på **Konvertera** för att bearbeta alla uppladdade filer.
3. Konverteringar av en enskild fil med en sida laddas ner som en fristående `.svg`. Allt annat laddas ner som ett ZIP-arkiv.

## Alternativ

Verktyget har inga inställbara alternativ. Varje sida konverteras till SVG med PyMuPDF:s inbyggda vektorexport.

## Utdataformat

- **En fil, en sida**: `filename.svg`
- **En fil, flera sidor**: `filename_svg.zip` med `page_1.svg`, `page_2.svg` osv.
- **Flera filer**: `pdf_to_svg.zip` med filer ordnade efter källdokumentets namn.

## Användningsområden

- Extrahera vektordiagram, grafer eller illustrationer från PDF-rapporter för användning på webbsidor.
- Redigera PDF-sidors innehåll i en vektorredigerare som Inkscape eller Illustrator.
- Bädda in skalbara sidförhandsvisningar i responsiva webbapplikationer.
- Extrahera logotyper eller grafik från PDF-broschyrer med bevarade skarpa kanter.

## Tips

- SVG fungerar bäst med PDF-filer som innehåller vektorinnehåll. Skannade dokument eller bildtunga PDF-filer ger stora SVG-filer med inbäddade rasterdata.
- För rasterutdata från bildtunga PDF-filer, använd [PDF till PNG](./pdf-to-png) eller [PDF till JPG](./pdf-to-jpg) i stället.
- Verktyget stöder batchkonvertering: ladda upp flera PDF-filer samtidigt för att konvertera dem alla i en körning.

## Relaterade verktyg

- [PDF till PNG](./pdf-to-png)
- [PDF till JPG](./pdf-to-jpg)
- [PDF till Markdown](./pdf-to-markdown)
