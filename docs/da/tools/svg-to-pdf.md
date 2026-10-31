---
title: SVG til PDF
description: Konvertér SVG-vektorgrafik til PDF med kvalitetsstyring, helt i din browser.
---

# SVG til PDF

Konvertér Scalable Vector Graphics-filer (SVG) til PDF. Værktøjet rasteriserer hver SVG gennem browserens gengivelsesmotor og indlejrer derefter resultatet i dets oprindelige opløsning. Nyttigt til at gøre vektorikoner, diagrammer og illustrationer til flytbare dokumenter.

## Understøttede formater

| Format | Filendelser |
| :----- | :---------- |
| SVG    | `.svg`      |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip en eller flere SVG-filer.
2. Gennemgå og administrér fillisten.
3. Vælg et **PDF-kvalitet**-niveau.
4. Klik på **Konvertér til PDF**. Resultatet downloades som `from_svgs.pdf`.

Hver SVG læses som tekst, gengives på et lærred i sin egen bredde og højde (standard 800x600, hvis der ikke er angivet mål) og eksporteres som PNG. Den PNG indlejres derefter i PDF'en med pdf-lib. Gennemsigtige områder udfyldes med hvid baggrund.

## Indstillinger

**PDF-kvalitet** styrer komprimeringen efter rasterisering:

- **Høj kvalitet**: tættest på den oprindelige gengivelse.
- **Medium kvalitet** (standard): god balance.
- **Lav kvalitet**: mindste fil, noget detaljetab.

## Anvendelsesmuligheder

- Konvertere arkitekt- eller ingeniørdiagrammer fra SVG til en udskriftsklar PDF
- Samle ikonsæt i en referencerapport-PDF til et designsystem
- Gøre datavisualiseringer (D3.js, eksport fra diagrambiblioteker) til rapportklare PDF'er
- Lave udskrivbare versioner af SVG-baserede infografikker

## Tips

- SVG-filer uden eksplicitte attributter `width` og `height` gengives i 800x600 pixels. For det bedste resultat bør du angive mål i SVG-kilden, før du konverterer.
- Komplekse SVG'er med eksterne skrifttypereferencer eller linkede billeder gengives muligvis ikke perfekt. Indlejr alle ressourcer i SVG'en for pålideligt resultat.
- Da SVG'en rasteriseres, indeholder PDF'en et bitmapbillede frem for vektorstier. Til ægte vektor-PDF-output kræves et dedikeret vektorværktøj.

## Relaterede værktøjer

- [Billeder til PDF](./image-to-pdf)
- [PNG til PDF](./png-to-pdf)
- [BMP til PDF](./bmp-to-pdf)
