---
title: TIFF til PDF
description: Konvertér enkelt- og flersidede TIFF-billeder til PDF i din browser med fuld sideunderstøttelse.
---

# TIFF til PDF

Konvertér TIFF-filer til PDF, herunder flersidede TIFF'er. Hver side (eller "IFD") i en TIFF-fil bliver til en separat side i den resulterende PDF. Det er især nyttigt til scannede dokumenter, faxer og medicinske billeder, som ofte gemmes som flersidede TIFF'er.

## Understøttede formater

| Format | Filendelser     |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine TIFF-filer.
2. Gennemgå fillisten, og administrér den efter behov.
3. Klik på **Konvertér til PDF**. Resultatet downloades som `from_tiff.pdf`.

Værktøjet afkoder hver TIFF-fil med en JavaScript-TIFF-dekoder og udtrækker de rå RGBA-pixeldata for hver side. Hver side gengives på et lærred, eksporteres som PNG og indlejres i PDF'en. Sidemålene svarer til de oprindelige TIFF-sider.

## Indstillinger

Dette værktøj har ingen yderligere kvalitetsindstillinger. Billeder indlejres i deres oprindelige opløsning.

## Anvendelsesmuligheder

- Konvertere flersidede faxdokumenter (TIFF-F) til et mere flytbart PDF-format
- Gøre scannede dokumentarkiver gemt som TIFF til søgbare PDF'er (kombinér bagefter med OCR-værktøjet)
- Behandle medicinske billedfiler (patologisnit, radiologieksport), der bruger TIFF
- Konvertere GIS- eller satellitbilleder i TIFF til delbare dokumenter

## Tips

- Flersidede TIFF'er understøttes fuldt ud. En TIFF på 10 sider giver en PDF på 10 sider. Du behøver ikke opdele TIFF'en først.
- Meget store TIFF-filer (hundredvis af megabyte) kan tage længere tid at behandle, da hele filen skal afkodes i browserens hukommelse.
- Hvis du har brug for OCR på den resulterende PDF, så kør den gennem værktøjet [OCR PDF](./ocr-pdf) efter konverteringen.

## Relaterede værktøjer

- [Billeder til PDF](./image-to-pdf)
- [BMP til PDF](./bmp-to-pdf)
- [JPG til PDF](./jpg-to-pdf)
