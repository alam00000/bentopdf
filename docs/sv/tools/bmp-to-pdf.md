---
title: BMP till PDF
description: Konvertera BMP-bitmappsbilder till PDF direkt i webbläsaren, utan uppladdning till någon server.
---

# BMP till PDF

Konvertera Windows Bitmap-filer (BMP) till PDF. BMP är ett okomprimerat bildformat som fortfarande förekommer i äldre system, medicinsk bildbehandling och industriella skannrar. Det här verktyget konverterar dem till PDF utan att du behöver installera något.

## Format som stöds

| Format | Filändelser |
| :----- | :---------- |
| BMP    | `.bmp`      |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina BMP-filer.
2. Granska fillistan. Lägg till fler filer eller ta bort oönskade.
3. Klicka på **Konvertera till PDF**. Resultatet laddas ner som `from_bmps.pdf`.

Varje BMP ritas på en canvas, exporteras som PNG och bäddas sedan in i PDF-filen med pdf-lib. Sidstorleken motsvarar den ursprungliga bildens mått.

## Alternativ

Det här verktyget har inga extra kvalitetsinställningar. Bilderna bäddas in i sin ursprungliga upplösning som förlustfri PNG i PDF-filen.

## Användningsområden

- Konvertera äldre skannade dokument som lagrats som BMP till arkiverbara PDF-filer
- Göra om BMP-skärmbilder från äldre Windows-program till delbara dokument
- Bearbeta utdata från medicinska eller industriella skannrar som använder BMP som standard
- Migrera gamla bildarkiv till ett mer portabelt format

## Tips

- BMP-filer är okomprimerade och därför ofta stora. Den resulterande PDF-filen blir betydligt mindre eftersom bilderna kodas om internt som PNG.
- Om du har BMP-filer tillsammans med andra bildformat kan du använda verktyget [Bilder till PDF](./image-to-pdf) för att konvertera allt i en enda batch.

## Relaterade verktyg

- [Bilder till PDF](./image-to-pdf)
- [PNG till PDF](./png-to-pdf)
- [TIFF till PDF](./tiff-to-pdf)
