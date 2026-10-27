---
title: ODT naar PDF
description: Zet OpenDocument Text-bestanden (ODT) in je browser om naar PDF met een engine op basis van LibreOffice.
---

# ODT naar PDF

Zet OpenDocument Text-bestanden om naar PDF. ODT is het eigen formaat van LibreOffice Writer, Apache OpenOffice en andere open-source tekstverwerkers. Deze tool gebruikt een LibreOffice-engine in de browser voor nauwkeurige conversies die opmaak, tabellen, afbeeldingen en stijlen behouden.

## Ondersteunde formaten

| Formaat           | Extensies |
| :---------------- | :-------- |
| OpenDocument Text | `.odt`    |

## Hoe het werkt

1. Klik op het uploadgebied of sleep een of meer ODT-bestanden erheen.
2. Controleer de bestandslijst. Voeg meer bestanden toe of verwijder ongewenste bestanden.
3. Klik op **Converteren naar PDF**. De LibreOffice-engine wordt geïnitialiseerd (een voortgangsindicator toont de laadstatus), waarna elk bestand wordt geconverteerd.
4. Een enkel bestand wordt direct als PDF gedownload. Meerdere bestanden worden gebundeld in `odt-converted.zip`.

## Opties

Deze tool heeft geen extra configuratie. De conversie behoudt de opmaak van het oorspronkelijke document zo goed mogelijk.

## Uitvoer

| Aantal invoerbestanden | Uitvoer                                                   |
| :--------------------- | :-------------------------------------------------------- |
| 1 bestand              | Eén PDF-download (bijv. `document.pdf`)                   |
| 2+ bestanden           | ZIP-archief (`odt-converted.zip`) met één PDF per bestand |

## Toepassingen

- LibreOffice Writer-documenten omzetten naar PDF om te delen met Microsoft Office-gebruikers
- Afdrukklare PDF's maken van wetenschappelijke artikelen in OpenDocument-formaat
- Een map met ODT-sjablonen in één keer omzetten naar PDF's voor distributie
- PDF's genereren uit ODT-bestanden die door geautomatiseerde documentsystemen zijn gemaakt

## Tips

- De LibreOffice-engine wordt bij het eerste gebruik geladen en bewaard voor volgende conversies. Het eerste laden duurt enkele seconden, daarna gaan conversies snel.
- Complexe documenten met ingebedde OLE-objecten of ongebruikelijke lettertypen kunnen iets anders worden weergegeven dan in LibreOffice op de desktop. Test met een voorbeeld voordat je een hele reeks converteert.
- Gebruik voor Word-documenten (`.doc`, `.docx`) liever de tool [Word naar PDF](./word-to-pdf), die ook de LibreOffice-engine gebruikt maar Microsoft-formaten rechtstreeks accepteert.

## Gerelateerde tools

- [Word naar PDF](./word-to-pdf)
- [RTF naar PDF](./rtf-to-pdf)
- [Tekst naar PDF](./txt-to-pdf)
