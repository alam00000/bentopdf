---
title: PDF till WebP
description: Konvertera PDF-sidor till WebP-bilder med justerbar kvalitet. Mindre filer än JPG vid jämförbar visuell kvalitet.
---

# PDF till WebP

Konverterar varje sida i en PDF till en WebP-bild. WebP ger vanligtvis filer som är 25-35 % mindre än JPG vid samma upplevda kvalitet, vilket gör det till ett starkt val för webben.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Justera reglaget **Kvalitet**.
3. Klicka på **Konvertera** för att bearbeta filen.
4. En enskild `.webp`-fil eller ett ZIP-arkiv laddas ner automatiskt.

## Alternativ

- **Kvalitet**: ett reglage från 0 % till 100 % (standard 85 %). Styr nivån på den förlustbringande komprimeringen. Högre värden behåller fler detaljer.

Sidor renderas internt i 2x-skala, vilket ger bilder med ungefär dubbla PDF-filens ursprungliga mått.

## Utdataformat

- **En sida**: `filename.webp`
- **Flera sidor**: `filename_webps.zip` med `page_1.webp`, `page_2.webp` osv.

## Användningsområden

- Förbereda sidförhandsvisningar för webbplatser där bandbredd spelar roll.
- Skapa lätta bildversioner av flygblad eller broschyrer för sociala medier.
- Batchkonvertera dokument med flera sidor till en webboptimerad bilduppsättning.

## Tips

- WebP stöds i alla moderna webbläsare. För äldre kompatibilitet, använd [PDF till JPG](./pdf-to-jpg) som reserv.
- En kvalitet på 80-85 % går oftast inte att skilja från originalet på skärmen men håller nere filstorleken.

## Relaterade verktyg

- [PDF till JPG](./pdf-to-jpg)
- [PDF till PNG](./pdf-to-png)
- [PDF till BMP](./pdf-to-bmp)
