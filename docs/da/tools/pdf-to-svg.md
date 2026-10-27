---
title: PDF til SVG
description: Konvertér PDF-sider til skalerbar SVG-vektorgrafik. Bevarer tekst og former som vektorstier, så de kan skaleres uendeligt.
---

# PDF til SVG

Konverterer hver side i en PDF til en SVG-fil (Scalable Vector Graphics). I modsætning til rasterformater bevarer SVG vektorstier, tekst og former, så outputtet kan skaleres til enhver størrelse uden pixelering. Drevet af PyMuPDF.

## Sådan fungerer det

1. Upload en eller flere PDF-filer ved at klikke på slipområdet eller trække filer hen på det. Du kan tilføje flere filer og administrere dem enkeltvis.
2. Klik på **Konvertér** for at behandle alle uploadede filer.
3. Konverteringer af én fil med én side downloades som en selvstændig `.svg`. Alt andet downloades som et ZIP-arkiv.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Hver side konverteres til SVG med PyMuPDF's indbyggede vektoreksport.

## Outputformat

- **Én fil, én side**: `filename.svg`
- **Én fil, flere sider**: `filename_svg.zip` med `page_1.svg`, `page_2.svg` osv.
- **Flere filer**: `pdf_to_svg.zip` med filer organiseret efter kildedokumentets navn.

## Anvendelser

- Udtrække vektordiagrammer, grafer eller illustrationer fra PDF-rapporter til brug på websider.
- Redigere PDF-sidens indhold i en vektoreditor som Inkscape eller Illustrator.
- Indlejre skalerbare sideforhåndsvisninger i responsive webapplikationer.
- Udtrække logoer eller grafik fra PDF-brochurer og bevare skarpe kanter.

## Tips

- SVG fungerer bedst med PDF-filer, der indeholder vektorindhold. Scannede dokumenter eller billedtunge PDF-filer giver store SVG-filer med indlejrede rasterdata.
- Til rasteroutput af billedtunge PDF-filer kan du i stedet bruge [PDF til PNG](./pdf-to-png) eller [PDF til JPG](./pdf-to-jpg).
- Dette værktøj understøtter batchkonvertering: upload flere PDF-filer på én gang for at konvertere dem alle i én kørsel.

## Relaterede værktøjer

- [PDF til PNG](./pdf-to-png)
- [PDF til JPG](./pdf-to-jpg)
- [PDF til Markdown](./pdf-to-markdown)
