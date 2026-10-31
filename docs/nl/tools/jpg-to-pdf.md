---
title: JPG naar PDF
description: Zet een of meer JPG-, JPEG- en JPEG 2000-afbeeldingen om naar één PDF-bestand, rechtstreeks in je browser.
---

# JPG naar PDF

Maak van JPG-afbeeldingen een nette PDF. Upload één bestand of meerdere JPG's tegelijk. Elke afbeelding wordt een pagina op volledige grootte in het uitvoerdocument.

## Ondersteunde formaten

| Formaat   | Extensies       |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Zo werkt het

1. Klik op het uploadgebied of sleep je JPG-bestanden erheen. Je kunt meerdere bestanden selecteren.
2. Bekijk de geüploade bestanden. Gebruik het prullenbakpictogram om bestanden te verwijderen, of klik op **Meer bestanden toevoegen** om de lijst aan te vullen.
3. Kies een **PDF-kwaliteit**.
4. Klik op **Converteren naar PDF**. De tool comprimeert de afbeeldingen volgens je kwaliteitsinstelling, zet ze om met de PyMuPDF-engine en downloadt `from_jpgs.pdf`.

## Opties

**PDF-kwaliteit** bepaalt de compressie die op elke afbeelding wordt toegepast voordat die in de PDF wordt ingesloten:

- **Hoge kwaliteit**: behoudt maximaal detail. Gebruik dit voor fotografie of drukwerk.
- **Gemiddelde kwaliteit** (standaard): een goede balans tussen scherpte en bestandsgrootte.
- **Lage kwaliteit**: sterke compressie voor de kleinste uitvoer.

## Toepassingen

- Gescande documenten die als JPG zijn opgeslagen omzetten naar één PDF voor indiening
- Productfoto's bundelen in een catalogus voor klanten
- Medische of satellietbeelden in JPEG 2000 omzetten naar een draagbare PDF
- Een afdrukbaar fotoalbum maken van camera-exports

## Tips

- JPEG 2000-bestanden (`.jp2`, `.jpx`) worden volledig ondersteund, niet alleen standaard JPEG. Dat is handig voor medische beeldvorming en geodata.
- Als je JPG's van een telefooncamera komen, levert Gemiddelde kwaliteit meestal een bestand op dat 40-60% kleiner is dan Hoge kwaliteit, zonder zichtbaar verschil op het scherm.

## Gerelateerde tools

- [Afbeeldingen naar PDF](./image-to-pdf)
- [PNG naar PDF](./png-to-pdf)
- [WebP naar PDF](./webp-to-pdf)
