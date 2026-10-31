---
title: CBZ naar PDF
description: Zet CBZ- en CBR-stripboekarchieven om naar PDF in je browser. Gratis, privé, zonder upload.
---

# CBZ naar PDF

Zet stripboekarchieven om naar PDF's. CBZ en CBR zijn de standaardformaten voor digitale strips: het zijn gewoon ZIP- of RAR-archieven vol afbeeldingen. Deze tool haalt elke pagina eruit, behoudt de leesvolgorde en maakt een nette PDF waarin elke afbeelding een pagina op volledige grootte wordt.

## Ondersteunde formaten

| Formaat | Extensie | Opmerkingen                                                    |
| :------ | :------- | :------------------------------------------------------------- |
| CBZ     | `.cbz`   | Op ZIP gebaseerd striparchief (lokaal verwerkt met pdf-lib)    |
| CBR     | `.cbr`   | Op RAR gebaseerd striparchief (verwerkt via de PyMuPDF-engine) |

De CBZ-converter herkent JPEG-, PNG-, GIF-, BMP-, WebP-, AVIF-, TIFF-, HEIC- en JXL-afbeeldingen in het archief. Niet-standaardformaten worden vóór het insluiten automatisch naar PNG geconverteerd.

## Zo werkt het

1. Klik op het uploadvak of sleep je CBZ- of CBR-bestanden erheen. Je kunt beide formaten in één reeks combineren.
2. Bekijk de lijst met bestanden. Verwijder wat je niet nodig hebt, of klik op **Meer bestanden toevoegen** om er meer toe te voegen.
3. Klik op **Converteren naar PDF**. Bij CBZ-bestanden pakt de tool het archief uit, sorteert de afbeeldingen op naam in natuurlijke volgorde, detecteert het werkelijke formaat van elke afbeelding en sluit ze met pdf-lib in een PDF in. CBR-bestanden gaan in plaats daarvan via de PyMuPDF-engine.
4. Eén bestand wordt als PDF gedownload. Bij meerdere bestanden krijg je een ZIP-archief met de naam `comic-converted.zip`.

## Opties

Er is geen configuratie nodig. Elke afbeelding wordt een pagina met dezelfde afmetingen als het origineel, zodat dubbele pagina's breed blijven en enkele pagina's smal.

## Toepassingen

- Strips lezen op een tablet of in een telefoon-app die wel PDF maar geen CBZ/CBR ondersteunt
- Specifieke pagina's van een digitale strip afdrukken
- Een stripcollectie archiveren in een formaat dat elke bestandsviewer kan openen
- Een strip delen met iemand die geen speciale stripreader heeft

## Tips

- Afbeeldingen in het archief worden in natuurlijke volgorde gesorteerd (dus `page2.jpg` komt vóór `page10.jpg`). Geef je bestanden een consistente nummering voor de juiste paginavolgorde.
- De converter herkent afbeeldingsformaten aan hun binaire handtekening, niet aan de bestandsextensie. Een PNG die per ongeluk `.jpg` heet, wordt toch correct ingesloten.
- CBZ-bestanden worden volledig in de browser verwerkt zonder de PyMuPDF-engine te laden, dus ze worden sneller geconverteerd dan CBR-bestanden.

## Gerelateerde tools

- [EPUB naar PDF](./epub-to-pdf)
- [MOBI naar PDF](./mobi-to-pdf)
- [Afbeelding naar PDF](./image-to-pdf)
