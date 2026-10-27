---
title: PNG naar PDF
description: Zet een of meer PNG-afbeeldingen om naar een PDF-document met instelbare kwaliteit, volledig in je browser.
---

# PNG naar PDF

Zet PNG-afbeeldingen om naar PDF met behoud van hun volledige resolutie. Elke PNG wordt een eigen pagina, afgestemd op de afmetingen van de oorspronkelijke afbeelding. Transparantie wordt automatisch afgehandeld.

## Ondersteunde formaten

| Formaat | Extensies |
| :------ | :-------- |
| PNG     | `.png`    |

## Hoe het werkt

1. Klik op het uploadgebied of sleep PNG-bestanden erheen. Je kunt er meerdere tegelijk selecteren.
2. Beheer de bestandslijst: verwijder ongewenste bestanden of voeg er meer toe.
3. Kies een niveau voor **PDF-kwaliteit** in de keuzelijst.
4. Klik op **Converteren naar PDF**. De uitvoer wordt gedownload als `from_jpgs.pdf`.

De tool gebruikt pdf-lib om elke afbeelding rechtstreeks in te sluiten. Als een PNG niet native kan worden ingesloten (bijv. door een ongebruikelijk kleurprofiel), valt de tool terug op opnieuw weergeven via een canvas als JPEG.

## Opties

**PDF-kwaliteit** bepaalt de compressie die vóór het insluiten wordt toegepast:

- **Hoge kwaliteit**: minimale compressie, grootste bestand.
- **Gemiddelde kwaliteit** (standaard): goede balans tussen grootte en helderheid.
- **Lage kwaliteit**: maximale compressie, kleinste uitvoer.

## Toepassingen

- Schermafbeeldingen omzetten naar een PDF met meerdere pagina's voor bugrapporten of documentatie
- UI-ontwerpexports verpakken in één bestand ter beoordeling
- Diagramexports (draw.io, Excalidraw) omzetten naar een deelbare PDF
- Een reeks grafiekafbeeldingen samenvoegen tot een rapport

## Tips

- PNG-bestanden met transparantie krijgen een witte achtergrond in de PDF. Als je een andere achtergrond nodig hebt, bewerk de afbeeldingen dan vooraf.
- Bij schermafbeeldingen en diagrammen met scherpe randen en tekst voorkomt Hoge kwaliteit JPEG-compressieartefacten. Gemiddeld of Laag kan intern naar JPEG omzetten.

## Gerelateerde tools

- [Afbeelding naar PDF](./image-to-pdf)
- [JPG naar PDF](./jpg-to-pdf)
- [SVG naar PDF](./svg-to-pdf)
