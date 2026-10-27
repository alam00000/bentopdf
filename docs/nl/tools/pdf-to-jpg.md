---
title: PDF naar JPG
description: Zet PDF-pagina's om naar JPG-afbeeldingen met instelbare kwaliteit. PDF's van één pagina worden direct gedownload, PDF's met meerdere pagina's als ZIP.
---

# PDF naar JPG

Zet elke pagina van een PDF om in een JPG-afbeelding. Documenten van één pagina worden gedownload als los `.jpg`-bestand. PDF's met meerdere pagina's leveren een ZIP-archief op met één JPG per pagina.

## Hoe het werkt

1. Upload een PDF door op het neerzetgebied te klikken of een bestand erheen te slepen. De tool toont de bestandsnaam, de bestandsgrootte en het aantal pagina's.
2. Pas de schuifregelaar **Kwaliteit** aan om de JPG-compressie te bepalen.
3. Klik op **Converteren** om de verwerking te starten.
4. Het resultaat wordt automatisch gedownload: een enkele JPG voor PDF's van één pagina, of een ZIP-bestand voor documenten met meerdere pagina's.

## Opties

- **Kwaliteit**: een schuifregelaar van 0% tot 100% (standaard 90%). Hogere waarden geven scherpere afbeeldingen met grotere bestanden. Lagere waarden comprimeren sterker.

Pagina's worden intern op schaal 2x weergegeven, dus de uitvoerresolutie is het dubbele van de PDF-paginaafmetingen. Een standaard pagina van Letter-formaat levert een afbeelding op van ongeveer 1.224 x 1.584 pixels.

## Uitvoerformaat

- **Eén pagina**: `filename.jpg`
- **Meerdere pagina's**: `filename_jpgs.zip` met `page_1.jpg`, `page_2.jpg`, enz.

## Toepassingen

- Voorbeeldminiaturen genereren voor een documentbeheersysteem.
- Een pagina uit een rapport delen in een chat of e-mail die geen PDF ondersteunt.
- Afbeeldingen maken van diagrammen of illustraties uit PDF's.
- Gescande documenten archiveren als afzonderlijke afbeeldingen.

## Tips

- Gebruik voor verliesvrije uitvoer liever [PDF naar PNG](./pdf-to-png).
- Een kwaliteitsinstelling van 80-90% biedt een goede balans tussen bestandsgrootte en beeldkwaliteit.
- Als je per pagina een specifiek formaat nodig hebt, bekijk dan de [PDF-workflowbouwer](./pdf-workflow), die een uitvoerknooppunt PDF naar afbeeldingen heeft.

## Gerelateerde tools

- [PDF naar PNG](./pdf-to-png)
- [PDF naar WebP](./pdf-to-webp)
- [PDF naar BMP](./pdf-to-bmp)
- [PDF naar TIFF](./pdf-to-tiff)
