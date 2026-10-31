---
title: HEIC till PDF
description: Konvertera HEIC- och HEIF-bilder från iPhone och iPad till PDF direkt i webbläsaren.
---

# HEIC till PDF

Konvertera HEIC/HEIF-bilder till PDF. HEIC har varit standardformatet för foton på iPhone och iPad sedan iOS 11. Med det här verktyget kan du göra om dessa foton till PDF-filer utan att installera någon skrivbordsprogramvara eller ladda upp filer till en server.

## Format som stöds

| Format | Filändelser |
| :----- | :---------- |
| HEIC   | `.heic`     |
| HEIF   | `.heif`     |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina HEIC/HEIF-filer.
2. Granska fillistan och ta bort oönskade filer.
3. Klicka på **Konvertera till PDF**. Resultatet laddas ned som `from_heic.pdf`.

Varje HEIC-fil avkodas med biblioteket heic2any, som konverterar den till PNG med 92 % kvalitet. PNG-filen bäddas sedan in i PDF-filen med pdf-lib, med varje bild på en egen sida i full upplösning.

## Alternativ

Det här verktyget har inga ytterligare inställningar. HEIC-bilder konverteras med hög kvalitet (0,92) till PNG innan de bäddas in.

## Användningsområden

- Skapa en PDF av iPhone-foton att bifoga till ett försäkringsärende eller en rapport
- Konvertera HEIC-foton till en bostadsannons och samla dem i ett enda utskrivbart dokument
- Göra om skärmbilder från iPad (HEIF-format) till en delbar PDF
- Batchkonvertera semesterbilder till en resedagbok

## Tips

- HEIC-avkodningen sker helt i webbläsaren med WebAssembly. Den första konverteringen kan ta en stund medan avkodaren laddas.
- Om du behöver blanda HEIC med andra bildformat (JPG, PNG osv.), använd verktyget [Bilder till PDF](./image-to-pdf), som hanterar HEIC tillsammans med alla andra format.
- HEIC-filer från iPhone innehåller ofta EXIF-data, inklusive GPS-koordinater. PDF-resultatet för inte vidare dessa metadata.

## Relaterade verktyg

- [Bilder till PDF](./image-to-pdf)
- [JPG till PDF](./jpg-to-pdf)
- [PNG till PDF](./png-to-pdf)
