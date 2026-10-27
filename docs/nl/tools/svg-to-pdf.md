---
title: SVG naar PDF
description: Zet SVG-vectorafbeeldingen om naar PDF met kwaliteitsinstelling, volledig in je browser.
---

# SVG naar PDF

Zet Scalable Vector Graphics-bestanden (SVG) om naar PDF. De tool rastert elke SVG via de renderengine van de browser en sluit het resultaat in op de oorspronkelijke resolutie. Handig om vectorpictogrammen, diagrammen en illustraties om te zetten in draagbare documenten.

## Ondersteunde formaten

| Formaat | Extensies |
| :------ | :-------- |
| SVG     | `.svg`    |

## Hoe het werkt

1. Klik op het uploadgebied of sleep een of meer SVG-bestanden erheen.
2. Bekijk en beheer de bestandslijst.
3. Kies een niveau voor **PDF-kwaliteit**.
4. Klik op **Converteren naar PDF**. Het resultaat wordt gedownload als `from_svgs.pdf`.

Elke SVG wordt als tekst gelezen, op een canvas weergegeven met de eigen breedte en hoogte (standaard 800x600 als er geen afmetingen zijn opgegeven) en geëxporteerd als PNG. Die PNG wordt vervolgens met pdf-lib in de PDF ingesloten. Transparante gebieden worden met een witte achtergrond gevuld.

## Opties

**PDF-kwaliteit** bepaalt de compressie na het rasteren:

- **Hoge kwaliteit**: het dichtst bij de oorspronkelijke weergave.
- **Gemiddelde kwaliteit** (standaard): goede balans.
- **Lage kwaliteit**: kleinste bestand, enig detailverlies.

## Toepassingen

- Architectuur- of technische diagrammen van SVG omzetten naar een drukklare PDF
- Pictogramsets bundelen in een naslag-PDF voor een designsysteem
- Datavisualisaties (D3.js, exports van grafiekbibliotheken) omzetten in rapportklare PDF's
- Afdrukbare versies maken van infographics op basis van SVG

## Tips

- SVG-bestanden zonder expliciete attributen `width` en `height` worden weergegeven op 800x600 pixels. Stel voor het beste resultaat de afmetingen in de SVG-bron in voordat je converteert.
- Complexe SVG's met verwijzingen naar externe lettertypen of gekoppelde afbeeldingen worden mogelijk niet perfect weergegeven. Sluit alle assets in de SVG zelf in voor betrouwbare uitvoer.
- Omdat de SVG wordt gerasterd, bevat de PDF een bitmapafbeelding in plaats van vectorpaden. Voor echte vector-PDF-uitvoer is een speciale vectortool nodig.

## Gerelateerde tools

- [Afbeelding naar PDF](./image-to-pdf)
- [PNG naar PDF](./png-to-pdf)
- [BMP naar PDF](./bmp-to-pdf)
