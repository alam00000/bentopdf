---
title: HEIC til PDF
description: Konvertér HEIC- og HEIF-billeder fra iPhones og iPads til PDF-format direkte i din browser.
---

# HEIC til PDF

Konvertér HEIC/HEIF-billeder til PDF. HEIC har været standardfotoformatet på iPhones og iPads siden iOS 11. Med dette værktøj kan du omdanne disse fotos til PDF'er uden at installere desktopsoftware eller uploade filer til en server.

## Understøttede formater

| Format | Filtypenavne |
| :----- | :----------- |
| HEIC   | `.heic`      |
| HEIF   | `.heif`      |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine HEIC/HEIF-filer.
2. Gennemgå fillisten, og fjern uønskede filer.
3. Klik på **Konvertér til PDF**. Resultatet downloades som `from_heic.pdf`.

Hver HEIC-fil afkodes med biblioteket heic2any, som konverterer den til PNG i 92 % kvalitet. PNG-billedet indlejres derefter i PDF'en med pdf-lib, med ét billede pr. side i fuld opløsning.

## Indstillinger

Dette værktøj har ingen yderligere indstillinger. HEIC-billeder konverteres i høj kvalitet (0,92) til PNG, før de indlejres.

## Anvendelsesområder

- Oprettelse af en PDF af iPhone-fotos til at vedhæfte en forsikringsanmeldelse eller rapport
- Konvertering af HEIC-fotos til en boligannonce til ét udskrivbart dokument
- Omdannelse af iPad-skærmbilleder (HEIF-format) til en delbar PDF
- Batchkonvertering af feriebilleder til en rejsedagbog

## Tips

- HEIC-afkodning sker udelukkende i browseren med WebAssembly. Den første konvertering kan tage et øjeblik, mens afkoderen indlæses.
- Hvis du skal blande HEIC med andre billedformater (JPG, PNG osv.), kan du bruge værktøjet [Billeder til PDF](./image-to-pdf), som håndterer HEIC sammen med alle andre formater.
- HEIC-filer fra iPhones indeholder ofte EXIF-data, herunder GPS-koordinater. PDF-outputtet medtager ikke disse metadata.

## Relaterede værktøjer

- [Billeder til PDF](./image-to-pdf)
- [JPG til PDF](./jpg-to-pdf)
- [PNG til PDF](./png-to-pdf)
