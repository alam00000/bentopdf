---
title: PDF till PNG
description: Konvertera PDF-sidor till förlustfria PNG-bilder med justerbar skala. Idealiskt för högkvalitativa skärmbilder och genomskinliga bakgrunder.
---

# PDF till PNG

Konverterar varje sida i en PDF till en PNG-bild. PNG använder förlustfri komprimering, så utdata bevarar varje detalj på originalsidan. PDF-filer med en sida laddas ner som en `.png`-fil, filer med flera sidor ger en ZIP.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Ställ in reglaget **Skala** för att styra utdataupplösningen.
3. Klicka på **Konvertera** för att starta bearbetningen.
4. En enskild PNG eller ett ZIP-arkiv laddas ner automatiskt.

## Alternativ

- **Skala**: från 1.0x till 3.0x (standard 2.0x). Vid 2.0x renderas en vanlig sida i Letter-storlek till ungefär 1 224 x 1 584 pixlar. Högre skalvärden ger större och skarpare bilder på bekostnad av filstorlek och bearbetningstid.

## Utdataformat

- **En sida**: `filename.png`
- **Flera sidor**: `filename_pngs.zip` med `page_1.png`, `page_2.png` osv.

## Användningsområden

- Ta högkvalitativa skärmbilder av PDF-sidor till presentationer.
- Extrahera diagram eller illustrationer som behöver skarpa kanter och inga komprimeringsartefakter.
- Förbereda resurser för webbdesign från PDF-skisser.
- Skapa förlustfria sidbilder för OCR-förbehandling.

## Tips

- PNG-filer är betydligt större än JPG. Om filstorleken är viktigare än perfekt kvalitet, använd [PDF till JPG](./pdf-to-jpg) eller [PDF till WebP](./pdf-to-webp).
- Vid skala 1.0x motsvarar utdata PDF-filens ursprungliga upplösning. Höj till 3.0x för exporter i utskriftskvalitet.

## Relaterade verktyg

- [PDF till JPG](./pdf-to-jpg)
- [PDF till WebP](./pdf-to-webp)
- [PDF till SVG](./pdf-to-svg)
