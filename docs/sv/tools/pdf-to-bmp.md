---
title: PDF till BMP
description: Konvertera PDF-sidor till okomprimerade BMP-bilder. Användbart för äldre system och utskriftsflöden som kräver bitmapp som indata.
---

# PDF till BMP

Konverterar varje sida i en PDF till en BMP-bild (bitmapp). BMP är ett okomprimerat format, så utdata är pixelperfekt utan kvalitetsförlust, men filerna blir stora.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Klicka på **Konvertera** för att bearbeta filen.
3. En enskild `.bmp`-fil eller ett ZIP-arkiv laddas ner automatiskt.

## Alternativ

Verktyget har inga inställbara alternativ. Sidor renderas i fast 2x-skala, vilket ger bilder med ungefär dubbla PDF-sidans ursprungliga mått.

## Utdataformat

- **En sida**: `filename.bmp`
- **Flera sidor**: `filename_bmps.zip` med `page_1.bmp`, `page_2.bmp` osv.

## Användningsområden

- Mata in PDF-sidor i äldre system eller hårdvara som bara tar emot BMP.
- Förbereda okomprimerade bilder för vissa utskriftsflöden.
- Använda bitmappsutdata som indata till bildbehandlingsverktyg som kräver råa pixeldata.

## Tips

- BMP-filer blir mycket stora eftersom de lagrar råa pixeldata utan komprimering. För de flesta ändamål ger [PDF till PNG](./pdf-to-png) förlustfri kvalitet med mycket mindre filer.
- Om ditt målsystem accepterar PNG eller TIFF, välj hellre de formaten för att spara diskutrymme.

## Relaterade verktyg

- [PDF till PNG](./pdf-to-png)
- [PDF till TIFF](./pdf-to-tiff)
- [PDF till JPG](./pdf-to-jpg)
