---
title: BMP til PDF
description: Konvertér BMP-bitmapbilleder til PDF direkte i din browser, uden upload til nogen server.
---

# BMP til PDF

Konvertér Windows Bitmap-filer (BMP) til PDF. BMP er et ukomprimeret billedformat, der stadig findes i ældre systemer, medicinsk billeddannelse og industrielle scannere. Dette værktøj konverterer dem til PDF uden at du skal installere noget.

## Understøttede formater

| Format | Filtypenavne |
| :----- | :----------- |
| BMP    | `.bmp`       |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine BMP-filer.
2. Gennemgå fillisten. Tilføj flere filer, eller fjern uønskede.
3. Klik på **Konvertér til PDF**. Outputtet downloades som `from_bmps.pdf`.

Hver BMP tegnes på et canvas, eksporteres som PNG og indlejres derefter i PDF'en med pdf-lib. Sidestørrelsen svarer til det oprindelige billedes mål.

## Indstillinger

Dette værktøj har ingen ekstra kvalitetsindstillinger. Billederne indlejres i deres oprindelige opløsning som tabsfri PNG i PDF'en.

## Anvendelsesområder

- Konvertere ældre scannede dokumenter gemt som BMP til arkiv-PDF'er
- Gøre BMP-skærmbilleder fra ældre Windows-programmer til dokumenter, der kan deles
- Behandle output fra medicinske eller industrielle scannere, der som standard bruger BMP
- Migrere gamle billedarkiver til et mere flytbart format

## Tips

- BMP-filer er ukomprimerede og derfor ofte store. Den resulterende PDF bliver betydeligt mindre, fordi billederne internt omkodes til PNG.
- Hvis du har BMP-filer sammen med andre billedformater, kan du bruge værktøjet [Billeder til PDF](./image-to-pdf) til at konvertere alt i én batch.

## Relaterede værktøjer

- [Billeder til PDF](./image-to-pdf)
- [PNG til PDF](./png-to-pdf)
- [TIFF til PDF](./tiff-to-pdf)
