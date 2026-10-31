---
title: PDF till JPG
description: Konvertera PDF-sidor till JPG-bilder med justerbar kvalitet. PDF-filer med en sida laddas ner direkt, filer med flera sidor exporteras som ZIP.
---

# PDF till JPG

Konverterar varje sida i en PDF till en JPG-bild. Dokument med en sida laddas ner som en fristående `.jpg`-fil. PDF-filer med flera sidor ger ett ZIP-arkiv med en JPG per sida.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit. Verktyget visar filnamn, filstorlek och antal sidor.
2. Justera reglaget **Kvalitet** för att styra JPG-komprimeringen.
3. Klicka på **Konvertera** för att starta bearbetningen.
4. Resultatet laddas ner automatiskt: en enda JPG för PDF-filer med en sida eller en ZIP-fil för dokument med flera sidor.

## Alternativ

- **Kvalitet**: ett reglage från 0 % till 100 % (standard 90 %). Högre värden ger skarpare bilder med större filer. Lägre värden komprimerar hårdare.

Sidor renderas internt i 2x-skala, så utdataupplösningen är dubbelt så stor som PDF-sidans mått. En vanlig sida i Letter-storlek ger en bild på ungefär 1 224 x 1 584 pixlar.

## Utdataformat

- **En sida**: `filename.jpg`
- **Flera sidor**: `filename_jpgs.zip` med `page_1.jpg`, `page_2.jpg` osv.

## Användningsområden

- Skapa förhandsminiatyrer för ett dokumenthanteringssystem.
- Dela en sida från en rapport i en chatt eller ett e-postprogram som inte stöder PDF.
- Skapa bildresurser från PDF-diagram eller illustrationer.
- Arkivera skannade dokument som enskilda bilder.

## Tips

- För förlustfri utdata, använd [PDF till PNG](./pdf-to-png) i stället.
- En kvalitetsinställning på 80-90 % ger en bra balans mellan filstorlek och visuell återgivning.
- Om du behöver ett visst format per sida kan du använda [PDF-arbetsflödesbyggare](./pdf-workflow), som har en utdatanod för PDF till bilder.

## Relaterade verktyg

- [PDF till PNG](./pdf-to-png)
- [PDF till WebP](./pdf-to-webp)
- [PDF till BMP](./pdf-to-bmp)
- [PDF till TIFF](./pdf-to-tiff)
