---
title: RTF naar PDF
description: Zet Rich Text Format-bestanden (RTF) om naar PDF in je browser met een engine op basis van LibreOffice.
---

# RTF naar PDF

Zet Rich Text Format-documenten om naar PDF. RTF is een platformonafhankelijk documentformaat dat vrijwel elke tekstverwerker ondersteunt. Deze tool gebruikt een LibreOffice-engine in de browser om RTF-bestanden met behoud van opmaak weer te geven: vet, cursief, tabellen en ingesloten afbeeldingen komen allemaal mee in de PDF.

## Ondersteunde formaten

| Formaat | Extensies | MIME-types                    |
| :------ | :-------- | :---------------------------- |
| RTF     | `.rtf`    | `text/rtf`, `application/rtf` |

## Hoe het werkt

1. Klik op het uploadgebied of sleep een of meer RTF-bestanden erheen.
2. Bekijk de bestandslijst. Voeg meer bestanden toe of verwijder ze naar wens.
3. Klik op **Converteren naar PDF**. De LibreOffice-engine wordt bij het eerste gebruik geïnitialiseerd en verwerkt daarna elk bestand.
4. Eén bestand wordt direct als PDF gedownload. Meerdere bestanden worden geleverd als `rtf-converted.zip`.

## Opties

Deze tool heeft geen extra instellingen. De conversie behoudt de oorspronkelijke RTF-opmaak.

## Uitvoer

| Aantal bestanden | Uitvoer                                                   |
| :--------------- | :-------------------------------------------------------- |
| 1 bestand        | Eén PDF-download (bijvoorbeeld `letter.pdf`)              |
| 2+ bestanden     | ZIP-archief (`rtf-converted.zip`) met één PDF per bestand |

## Toepassingen

- Oude RTF-documenten van oudere tekstverwerkers omzetten naar moderne PDF's
- RTF-e-mailsjablonen omzetten naar PDF-voorbeelden
- RTF-uitvoer van juridische of medische softwaresystemen verwerken
- RTF-bestanden uit een documentbeheersysteem in bulk naar PDF converteren voor archivering

## Tips

- De LibreOffice-engine wordt eenmaal geladen en gecachet. De eerste conversie in een sessie duurt een paar seconden langer, de volgende zijn sneller.
- RTF-bestanden met ingesloten OLE-objecten worden mogelijk niet alle perfect weergegeven. Platte tekst, afbeeldingen en standaardopmaak worden betrouwbaar geconverteerd.
- Als je RTF-bestanden met Microsoft Word zijn gemaakt, kun je ze ook direct converteren met de tool [Word naar PDF](./word-to-pdf), die RTF naast DOC en DOCX accepteert.

## Gerelateerde tools

- [Word naar PDF](./word-to-pdf)
- [ODT naar PDF](./odt-to-pdf)
- [Tekst naar PDF](./txt-to-pdf)
