---
title: TIFF till PDF
description: Konvertera enkel- och flersidiga TIFF-bilder till PDF i webbläsaren med fullt sidstöd.
---

# TIFF till PDF

Konvertera TIFF-filer till PDF, inklusive flersidiga TIFF-filer. Varje sida (eller "IFD") i en TIFF-fil blir en separat sida i PDF-filen. Det är särskilt användbart för skannade dokument, fax och medicinska bilder som ofta lagras som flersidiga TIFF-filer.

## Format som stöds

| Format | Filändelser     |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina TIFF-filer.
2. Granska fillistan och hantera den vid behov.
3. Klicka på **Konvertera till PDF**. Resultatet laddas ned som `from_tiff.pdf`.

Verktyget avkodar varje TIFF-fil med en JavaScript-baserad TIFF-avkodare och extraherar varje sidas råa RGBA-pixeldata. Varje sida renderas på en canvas, exporteras som PNG och bäddas in i PDF-filen. Sidmåtten matchar de ursprungliga TIFF-sidorna.

## Alternativ

Det här verktyget har inga extra kvalitetsinställningar. Bilder bäddas in i sin ursprungliga upplösning.

## Användningsområden

- Konvertera flersidiga faxdokument (TIFF-F) till ett mer portabelt PDF-format
- Göra skannade dokumentarkiv som lagrats som TIFF till sökbara PDF-filer (kombinera med OCR-verktyget efteråt)
- Bearbeta medicinska bildfiler (patologibilder, röntgenexporter) som använder TIFF
- Konvertera TIFF-filer med GIS- eller satellitbilder till delbara dokument

## Tips

- Flersidiga TIFF-filer stöds fullt ut. En TIFF med 10 sidor ger en PDF med 10 sidor. Du behöver inte dela TIFF-filen först.
- Mycket stora TIFF-filer (hundratals megabyte) kan ta längre tid att bearbeta eftersom hela filen måste avkodas i webbläsarens minne.
- Om du behöver OCR på den resulterande PDF-filen, kör den genom verktyget [OCR PDF](./ocr-pdf) efter konverteringen.

## Relaterade verktyg

- [Bilder till PDF](./image-to-pdf)
- [BMP till PDF](./bmp-to-pdf)
- [JPG till PDF](./jpg-to-pdf)
