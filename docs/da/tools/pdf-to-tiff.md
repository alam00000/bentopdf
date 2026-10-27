---
title: PDF til TIFF
description: Konvertér PDF-sider til TIFF-billeder, som ofte bruges i udskrivning, fax og arkivering. Falder tilbage til PNG, hvis kodningen mislykkes.
---

# PDF til TIFF

Konverterer hver side i en PDF til et TIFF-billede. TIFF er standardformatet til trykproduktion, faxsystemer og dokumentarkivering. Værktøjet bruger PackBits-komprimering til TIFF-kodning og falder tilbage til PNG, hvis en side ikke kan kodes.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipområdet eller trække en fil hen på det.
2. Klik på **Konvertér** for at behandle filen.
3. En enkelt TIFF-fil eller et ZIP-arkiv downloades automatisk.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Siderne gengives i en fast skala på 2x.

## Outputformat

- **Enkelt side**: `filename.tiff`
- **Flere sider**: `filename_tiffs.zip` med `page_1.tiff`, `page_2.tiff` osv.

Hvis TIFF-kodningen mislykkes for en bestemt side (på grund af komprimeringsproblemer), gemmes den side som en `.png`-fil i stedet. ZIP-filen indeholder i så fald en blanding af TIFF- og PNG-filer.

## Anvendelser

- Indsende dokumenter til offentlige myndigheder eller juridiske systemer, der kræver TIFF-format.
- Forberede sider til faxtransmission via digitale faxtjenester.
- Arkivere scannede dokumenter i et bredt understøttet tabsfrit format.
- Sende sider ind i dokumenthåndteringssystemer i virksomheder.

## Tips

- TIFF-filer er store. Hvis du kun har brug for tabsfri kvalitet til web eller skærm, er [PDF til PNG](./pdf-to-png) et bedre valg.
- Tjek ZIP-indholdet, hvis nogle sider krævede PNG-reserven. Du vil måske konvertere dem separat.

## Relaterede værktøjer

- [PDF til PNG](./pdf-to-png)
- [PDF til BMP](./pdf-to-bmp)
- [PDF til JPG](./pdf-to-jpg)
