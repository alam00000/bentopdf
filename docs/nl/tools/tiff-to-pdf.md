---
title: TIFF naar PDF
description: Zet TIFF-afbeeldingen met een of meer pagina's om naar PDF in je browser, met volledige ondersteuning voor pagina's.
---

# TIFF naar PDF

Zet TIFF-bestanden om naar PDF, ook TIFF's met meerdere pagina's. Elke pagina (of "IFD") in een TIFF-bestand wordt een aparte pagina in de uitvoer-PDF. Dit is vooral handig voor gescande documenten, faxen en medische beelden die vaak als TIFF met meerdere pagina's worden opgeslagen.

## Ondersteunde formaten

| Formaat | Extensies       |
| :------ | :-------------- |
| TIFF    | `.tiff`, `.tif` |

## Hoe het werkt

1. Klik op het uploadgebied of sleep je TIFF-bestanden erheen.
2. Bekijk de bestandslijst en beheer die naar wens.
3. Klik op **Converteren naar PDF**. Het resultaat wordt gedownload als `from_tiff.pdf`.

De tool decodeert elk TIFF-bestand met een JavaScript-TIFF-decoder en haalt de ruwe RGBA-pixelgegevens van elke pagina op. Elke pagina wordt op een canvas weergegeven, als PNG geëxporteerd en in de PDF ingesloten. De paginaafmetingen komen overeen met de oorspronkelijke TIFF-pagina's.

## Opties

Deze tool biedt geen extra kwaliteitsinstellingen. Afbeeldingen worden ingesloten op hun oorspronkelijke resolutie.

## Toepassingen

- Faxdocumenten met meerdere pagina's (TIFF-F) omzetten naar een draagbaarder PDF-formaat
- Gescande documentarchieven die als TIFF zijn opgeslagen omzetten in doorzoekbare PDF's (combineer daarna met de OCR-tool)
- Medische beeldbestanden verwerken (pathologiepreparaten, radiologie-exports) die TIFF gebruiken
- GIS- of satellietbeelden in TIFF omzetten in deelbare documenten

## Tips

- TIFF's met meerdere pagina's worden volledig ondersteund. Een TIFF van 10 pagina's levert een PDF van 10 pagina's op. Je hoeft de TIFF niet eerst te splitsen.
- Zeer grote TIFF-bestanden (honderden megabytes) kunnen langer duren omdat het hele bestand in het browsergeheugen moet worden gedecodeerd.
- Als je OCR op de resulterende PDF nodig hebt, voer je die na de conversie door de tool [PDF OCR](./ocr-pdf).

## Gerelateerde tools

- [Afbeelding naar PDF](./image-to-pdf)
- [BMP naar PDF](./bmp-to-pdf)
- [JPG naar PDF](./jpg-to-pdf)
