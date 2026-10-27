---
title: HEIC naar PDF
description: Zet HEIC- en HEIF-afbeeldingen van iPhones en iPads om naar PDF, rechtstreeks in je browser.
---

# HEIC naar PDF

Zet HEIC/HEIF-afbeeldingen om naar PDF. HEIC is sinds iOS 11 het standaard fotoformaat op iPhones en iPads. Met deze tool maak je van die foto's PDF's zonder desktopsoftware te installeren of bestanden naar een server te uploaden.

## Ondersteunde formaten

| Formaat | Extensies |
| :------ | :-------- |
| HEIC    | `.heic`   |
| HEIF    | `.heif`   |

## Zo werkt het

1. Klik op het uploadgebied of sleep je HEIC/HEIF-bestanden erheen.
2. Bekijk de bestandslijst en verwijder ongewenste bestanden.
3. Klik op **Converteren naar PDF**. Het resultaat wordt gedownload als `from_heic.pdf`.

Elk HEIC-bestand wordt gedecodeerd met de bibliotheek heic2any, die het met 92% kwaliteit omzet naar PNG. De PNG wordt daarna met pdf-lib in de PDF ingesloten, met elke afbeelding op een eigen pagina op volledige resolutie.

## Opties

Deze tool heeft geen extra instellingen. HEIC-afbeeldingen worden met hoge kwaliteit (0.92) naar PNG omgezet voordat ze worden ingesloten.

## Toepassingen

- Een PDF maken van iPhone-foto's om bij te voegen aan een verzekeringsclaim of rapport
- HEIC-foto's voor een woningadvertentie omzetten naar één afdrukbaar document
- iPad-schermafbeeldingen (HEIF-formaat) omzetten naar een deelbare PDF
- Vakantiefoto's voor een reisdagboek in één keer omzetten

## Tips

- HEIC-decodering gebeurt volledig in de browser met WebAssembly. De eerste conversie kan even duren terwijl de decoder wordt geladen.
- Wil je HEIC combineren met andere afbeeldingsformaten (JPG, PNG, enz.), gebruik dan de tool [Afbeeldingen naar PDF](./image-to-pdf), die HEIC naast alle andere formaten aankan.
- HEIC-bestanden van iPhones bevatten vaak EXIF-gegevens, waaronder GPS-coördinaten. De PDF-uitvoer neemt deze metadata niet over.

## Gerelateerde tools

- [Afbeeldingen naar PDF](./image-to-pdf)
- [JPG naar PDF](./jpg-to-pdf)
- [PNG naar PDF](./png-to-pdf)
