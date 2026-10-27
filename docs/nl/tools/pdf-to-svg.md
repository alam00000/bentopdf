---
title: PDF naar SVG
description: Zet PDF-pagina's om naar schaalbare SVG-vectorafbeeldingen. Behoudt tekst en vormen als vectorpaden voor oneindig schalen.
---

# PDF naar SVG

Zet elke pagina van een PDF om in een SVG-bestand (Scalable Vector Graphics). In tegenstelling tot rasterformaten behoudt SVG vectorpaden, tekst en vormen, zodat de uitvoer op elke grootte kan worden geschaald zonder pixelvorming. Gebruikt PyMuPDF.

## Hoe het werkt

1. Upload een of meer PDF's door op het neerzetgebied te klikken of bestanden erheen te slepen. Je kunt meerdere bestanden toevoegen en ze afzonderlijk beheren.
2. Klik op **Converteren** om alle geüploade bestanden te verwerken.
3. Conversies van één bestand met één pagina worden gedownload als los `.svg`-bestand. Al het andere wordt gedownload als ZIP-archief.

## Opties

Deze tool heeft geen instelbare opties. Elke pagina wordt naar SVG omgezet met de eigen vectorexport van PyMuPDF.

## Uitvoerformaat

- **Eén bestand, één pagina**: `filename.svg`
- **Eén bestand, meerdere pagina's**: `filename_svg.zip` met `page_1.svg`, `page_2.svg`, enz.
- **Meerdere bestanden**: `pdf_to_svg.zip` met bestanden geordend op de naam van het brondocument.

## Toepassingen

- Vectordiagrammen, grafieken of illustraties uit PDF-rapporten halen voor gebruik op webpagina's.
- De inhoud van PDF-pagina's bewerken in een vectoreditor zoals Inkscape of Illustrator.
- Schaalbare paginavoorbeelden insluiten in responsieve webapplicaties.
- Logo's of afbeeldingen uit PDF-brochures halen met behoud van scherpe randen.

## Tips

- SVG werkt het best met PDF's die vectorinhoud bevatten. Gescande documenten of PDF's met veel afbeeldingen geven grote SVG-bestanden met ingebedde rastergegevens.
- Gebruik voor rasteruitvoer van PDF's met veel afbeeldingen liever [PDF naar PNG](./pdf-to-png) of [PDF naar JPG](./pdf-to-jpg).
- Deze tool ondersteunt gebundelde conversie: upload meerdere PDF's tegelijk om ze allemaal in één keer om te zetten.

## Gerelateerde tools

- [PDF naar PNG](./pdf-to-png)
- [PDF naar JPG](./pdf-to-jpg)
- [PDF naar Markdown](./pdf-to-markdown)
