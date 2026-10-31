---
title: PDF till TIFF
description: Konvertera PDF-sidor till TIFF-bilder, vanligt i tryck-, fax- och arkivflöden. Faller tillbaka på PNG om kodningen misslyckas.
---

# PDF till TIFF

Konverterar varje sida i en PDF till en TIFF-bild. TIFF är standardformatet för tryckproduktion, faxsystem och dokumentarkivering. Verktyget använder PackBits-komprimering för TIFF-kodningen och faller tillbaka på PNG om en sida inte kan kodas.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Klicka på **Konvertera** för att bearbeta filen.
3. En enskild TIFF-fil eller ett ZIP-arkiv laddas ner automatiskt.

## Alternativ

Verktyget har inga inställbara alternativ. Sidor renderas i fast 2x-skala.

## Utdataformat

- **En sida**: `filename.tiff`
- **Flera sidor**: `filename_tiffs.zip` med `page_1.tiff`, `page_2.tiff` osv.

Om TIFF-kodningen misslyckas för en viss sida (på grund av komprimeringsproblem) sparas den sidan som en `.png`-fil i stället. ZIP-filen innehåller då en blandning av TIFF- och PNG-filer.

## Användningsområden

- Lämna in dokument till myndigheter eller juridiska system som kräver TIFF-format.
- Förbereda sidor för faxöverföring via digitala faxtjänster.
- Arkivera skannade dokument i ett brett stött förlustfritt format.
- Mata in sidor i dokumenthanteringssystem för företag.

## Tips

- TIFF-filer är stora. Om du bara behöver förlustfri kvalitet för webben eller skärmen är [PDF till PNG](./pdf-to-png) ett bättre val.
- Kontrollera ZIP-filens innehåll om vissa sidor behövde PNG-reserven, eftersom du kanske vill konvertera dem separat.

## Relaterade verktyg

- [PDF till PNG](./pdf-to-png)
- [PDF till BMP](./pdf-to-bmp)
- [PDF till JPG](./pdf-to-jpg)
