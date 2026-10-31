---
title: PDF til BMP
description: Konvertér PDF-sider til ukomprimerede BMP-billeder. Nyttigt til ældre systemer og udskriftsarbejdsgange, der kræver bitmap som input.
---

# PDF til BMP

Konverterer hver side i en PDF til et BMP-billede (bitmap). BMP er et ukomprimeret format, så outputtet er pixelperfekt uden kvalitetstab, men filerne er store.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipområdet eller trække en fil hen på det.
2. Klik på **Konvertér** for at behandle filen.
3. En enkelt `.bmp`-fil eller et ZIP-arkiv downloades automatisk.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Siderne gengives i en fast skala på 2x, hvilket giver billeder på cirka dobbelt så store som PDF'ens oprindelige sidemål.

## Outputformat

- **Enkelt side**: `filename.bmp`
- **Flere sider**: `filename_bmps.zip` med `page_1.bmp`, `page_2.bmp` osv.

## Anvendelser

- Sende PDF-sider ind i ældre systemer eller hardware, der kun accepterer BMP som input.
- Forberede ukomprimerede billeder til bestemte udskriftsarbejdsgange.
- Bruge bitmap-output som input til billedbehandlingsværktøjer, der kræver rå pixeldata.

## Tips

- BMP-filer er meget store, fordi de gemmer rå pixeldata uden komprimering. Til de fleste formål giver [PDF til PNG](./pdf-to-png) tabsfri kvalitet med langt mindre filer.
- Hvis dit målsystem accepterer PNG eller TIFF, bør du foretrække de formater for at spare diskplads.

## Relaterede værktøjer

- [PDF til PNG](./pdf-to-png)
- [PDF til TIFF](./pdf-to-tiff)
- [PDF til JPG](./pdf-to-jpg)
