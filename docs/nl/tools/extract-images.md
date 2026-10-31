---
title: Afbeeldingen extraheren
description: Haal alle ingesloten afbeeldingen uit PDF-bestanden. Bekijk ze in een raster en download ze afzonderlijk of als ZIP-archief.
---

# Afbeeldingen extraheren

Haalt alle ingesloten afbeeldingen uit een of meer PDF-bestanden. De geëxtraheerde afbeeldingen worden getoond in een voorbeeldraster, waar je ze afzonderlijk kunt downloaden of alles in één keer als ZIP kunt ophalen. Mogelijk gemaakt door PyMuPDF.

## Zo werkt het

1. Upload een of meer PDF's door op het uploadvak te klikken of bestanden erheen te slepen. Voeg zo nodig meer bestanden toe of verwijder afzonderlijke bestanden.
2. Klik op **Extraheren** om de verwerking te starten.
3. De tool doorzoekt elke pagina van elke geüploade PDF en extraheert de ingesloten afbeeldingen.
4. De geëxtraheerde afbeeldingen verschijnen in een raster met miniaturen. Elke afbeelding heeft een downloadknop.
5. Klik op **Alles downloaden** om alles als ZIP-archief op te slaan.

## Opties

Deze tool heeft geen instelbare opties. Alle ingesloten afbeeldingen worden geëxtraheerd in hun oorspronkelijke formaat (meestal PNG, JPEG of het formaat dat is gebruikt toen de afbeelding in de PDF werd ingesloten).

## Uitvoerformaat

- Afbeeldingen worden in een voorbeeldraster getoond onder de namen `image_1.png`, `image_2.jpg`, enzovoort.
- **Alles downloaden** levert `extracted-images.zip` met alle afbeeldingen.
- Afzonderlijke afbeeldingen kun je een voor een downloaden uit het raster.

## Toepassingen

- Foto's of afbeeldingen uit een PDF terughalen om in een ander project te hergebruiken.
- Productafbeeldingen uit een catalogus-PDF extraheren voor een webwinkelvermelding.
- Diagrammen uit technische documentatie halen voor gebruik in presentaties.
- Controleren welke afbeeldingen in een document zijn ingesloten voordat je het deelt.

## Tips

- De tool extraheert afbeeldingen precies zoals ze in de PDF zijn opgeslagen. Pagina's worden niet opnieuw als afbeelding weergegeven. Gebruik daarvoor [PDF naar PNG](./pdf-to-png) of [PDF naar JPG](./pdf-to-jpg).
- Als de tool "Geen afbeeldingen gevonden" meldt, gebruikt de PDF mogelijk vectorafbeeldingen in plaats van ingesloten rasterafbeeldingen, of is het een gescand document waarbij de hele pagina één grote afbeelding is.
- Verwerking in bulk werkt voor meerdere PDF's. Alle afbeeldingen uit alle bestanden worden gecombineerd in één raster en één ZIP.

## Gerelateerde tools

- [PDF naar PNG](./pdf-to-png)
- [PDF naar JPG](./pdf-to-jpg)
- [PDF-workflowbouwer](./pdf-workflow)
