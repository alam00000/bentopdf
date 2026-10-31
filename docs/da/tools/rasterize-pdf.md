---
title: Rasterisér PDF
description: Konvertér PDF-sider til billedbaseret PDF. Flad alle lag ud, fjern markérbar tekst, og styr DPI og billedformat.
---

# Rasterisér PDF

Rasterisering konverterer hver side i en PDF til et billede og samler billederne til en PDF igen. Resultatet ser ud som originalen, men indeholder ingen markérbar tekst, ingen interaktive elementer og ingen redigerbare lag. Det er i praksis en fotokopi i høj kvalitet.

## Sådan fungerer det

1. Upload en eller flere PDF-filer.
2. Vælg **DPI** (opløsning) for det rasteriserede resultat.
3. Vælg et **billedformat**: PNG for tabsfri kvalitet eller JPEG for mindre filer.
4. Markér eventuelt **Konvertér til gråtoner**.
5. Klik på **Rasterisér PDF**. Flere filer downloades som ZIP.

## Indstillinger

| Indstilling      | Værdier                      | Standard |
| ---------------- | ---------------------------- | -------- |
| **DPI**          | 72, 150, 200, 300, 600       | 150      |
| **Billedformat** | PNG (tabsfri), JPEG (mindre) | PNG      |
| **Gråtoner**     | Til/Fra                      | Fra      |

## DPI-retningslinjer

- **72**: kun visning på skærm, mindste filstørrelse
- **150**: god balance til almindelig brug
- **200**: skarpere tekst, moderat filstørrelse
- **300**: udskriftskvalitet
- **600**: arkivering i høj kvalitet eller professionel udskrivning

## Anvendelsesmuligheder

- Forhindre tekstudtrækning fra fortrolige dokumenter, før de deles
- Eliminere problemer med skrifttypeafhængighed ved at konvertere tekst til pixels
- Lave en "flad" version af en PDF med komplekse lag eller gennemsigtighed, der gengives forskelligt i forskellige læsere
- Forberede en PDF til et system, der kun accepterer billedbaseret input
- Fjerne skjult indhold (som sporede ændringer eller formulardata) ved at reducere PDF'en til rene billeder

## Tips

- 150 DPI med PNG er en solid standard. Gå kun højere, hvis du skal bruge udskrift eller zoome ind på fine detaljer.
- JPEG giver mærkbart mindre filer, men indfører kompressionsartefakter på skarpe tekstkanter.
- Rasterisering kan ikke fortrydes. Behold din originale PDF, hvis du senere kan få brug for redigerbar tekst.

## Relaterede værktøjer

- [Komprimer PDF](./compress-pdf): reducer den rasteriserede PDF's filstørrelse
- [Ret skæve sider](./deskew-pdf): ret siderne ud, før du rasteriserer scannede dokumenter
- [Skrifttype til kontur](./font-to-outline): konvertér skrifttyper til vektorstier, hvis du vil bevare skalerbarheden
- [Fladgør PDF](./flatten-pdf): flad formularer ud uden at konvertere til billeder
