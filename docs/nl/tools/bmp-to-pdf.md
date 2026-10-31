---
title: BMP naar PDF
description: Zet BMP-bitmapafbeeldingen direct in je browser om naar PDF, zonder upload naar een server.
---

# BMP naar PDF

Zet Windows Bitmap-bestanden (BMP) om naar PDF. BMP is een ongecomprimeerd afbeeldingsformaat dat nog voorkomt in oudere systemen, medische beeldvorming en industriële scanners. Deze tool zet ze om naar PDF zonder dat je iets hoeft te installeren.

## Ondersteunde formaten

| Formaat | Extensies |
| :------ | :-------- |
| BMP     | `.bmp`    |

## Hoe het werkt

1. Klik op het uploadgebied of sleep je BMP-bestanden erheen.
2. Bekijk de bestandslijst. Voeg meer bestanden toe of verwijder ongewenste bestanden.
3. Klik op **Converteren naar PDF**. De uitvoer wordt gedownload als `from_bmps.pdf`.

Elke BMP wordt op een canvas getekend, als PNG geëxporteerd en vervolgens met pdf-lib in de PDF ingesloten. Het paginaformaat komt overeen met de originele afbeeldingsafmetingen.

## Opties

Deze tool biedt geen extra kwaliteitsinstellingen. Afbeeldingen worden op hun originele resolutie ingesloten als verliesvrije PNG in de PDF.

## Toepassingen

- Oude gescande documenten die als BMP zijn opgeslagen omzetten naar archiefwaardige PDF's
- BMP-schermafbeeldingen uit oudere Windows-toepassingen omzetten naar deelbare documenten
- Uitvoer van medische of industriële scanners verwerken die standaard BMP gebruikt
- Oude afbeeldingsarchieven migreren naar een beter overdraagbaar formaat

## Tips

- BMP-bestanden zijn ongecomprimeerd en daardoor vaak groot. De resulterende PDF is aanzienlijk kleiner omdat de afbeeldingen intern opnieuw als PNG worden gecodeerd.
- Heb je BMP-bestanden naast andere afbeeldingsformaten, gebruik dan de tool [Afbeeldingen naar PDF](./image-to-pdf) om alles in één keer te converteren.

## Gerelateerde tools

- [Afbeeldingen naar PDF](./image-to-pdf)
- [PNG naar PDF](./png-to-pdf)
- [TIFF naar PDF](./tiff-to-pdf)
