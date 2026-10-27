---
title: WebP naar PDF
description: Zet WebP-afbeeldingen rechtstreeks in je browser om naar PDF, met instelbare compressiekwaliteit.
---

# WebP naar PDF

Zet het WebP-afbeeldingsformaat van Google om naar PDF. Dit is vooral handig als je afbeeldingen van het web hebt gedownload die in WebP staan en je ze in een breder geaccepteerd formaat nodig hebt om af te drukken of te delen.

## Ondersteunde formaten

| Formaat | Extensies |
| :------ | :-------- |
| WebP    | `.webp`   |

## Hoe het werkt

1. Klik op het uploadgebied of sleep je WebP-bestanden erheen.
2. Bekijk de bestandslijst en verwijder bestanden die je niet nodig hebt.
3. Kies een niveau voor **PDF-kwaliteit**.
4. Klik op **Converteren naar PDF**. De uitvoer wordt gedownload als `from_webps.pdf`.

Intern wordt elke WebP-afbeelding gedecodeerd via de canvas-API van de browser en daarna met pdf-lib in de PDF ingebed. Dit betekent dat de conversie werkt in elke browser die WebP-decodering ondersteunt (alle moderne browsers doen dat).

## Opties

**PDF-kwaliteit** bepaalt de compressie bij het inbedden van afbeeldingen:

- **Hoge kwaliteit**: behoudt de meeste details.
- **Gemiddelde kwaliteit** (standaard): gebalanceerde uitvoer.
- **Lage kwaliteit**: kleinste bestandsgrootte.

## Toepassingen

- Van het web gedownloade afbeeldingen die als WebP zijn opgeslagen omzetten naar een afdrukbare PDF
- WebP-schermafbeeldingen uit Chrome of Edge bundelen in documentatie
- Een PDF-portfolio maken van afbeeldingen die door ontwerptools standaard als WebP zijn geëxporteerd
- WebP-afbeeldingen archiveren in een breder leesbaar formaat

## Tips

- WebP wordt intern naar PNG gedecodeerd voordat het in de PDF wordt ingebed, dus lossless WebP-afbeeldingen behouden hun kwaliteit bij de instelling Hoog.
- Heb je een mix van WebP en andere afbeeldingsformaten, gebruik dan de tool [Afbeelding naar PDF](./image-to-pdf): die accepteert alles in één keer.

## Gerelateerde tools

- [Afbeelding naar PDF](./image-to-pdf)
- [PNG naar PDF](./png-to-pdf)
- [JPG naar PDF](./jpg-to-pdf)
