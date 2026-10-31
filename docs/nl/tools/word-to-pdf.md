---
title: Word naar PDF
description: Zet Word-documenten (DOC, DOCX), ODT- en RTF-bestanden in je browser om naar PDF met behoud van de volledige opmaak.
---

# Word naar PDF

Zet Microsoft Word-documenten en compatibele formaten om naar PDF. De tool gebruikt een LibreOffice-engine in de browser die DOC-, DOCX-, ODT- en RTF-bestanden verwerkt en opmaak, tabellen, afbeeldingen, kopteksten, voetteksten en stijlen in de uitvoer behoudt.

## Ondersteunde formaten

| Formaat           | Extensies |
| :---------------- | :-------- |
| Word (modern)     | `.docx`   |
| Word (verouderd)  | `.doc`    |
| OpenDocument Text | `.odt`    |
| Rich Text Format  | `.rtf`    |

## Hoe het werkt

1. Klik op het uploadgebied of sleep je Word-documenten erheen. Je kunt meerdere bestanden tegelijk selecteren.
2. Bekijk en beheer de bestandslijst.
3. Klik op **Converteren naar PDF**. De LibreOffice-engine wordt bij het eerste gebruik geladen (een voortgangsindicator toont de status van de initialisatie), daarna wordt elk bestand omgezet.
4. Een enkel bestand wordt direct als PDF gedownload. Meerdere bestanden worden samengebundeld in `word-converted.zip`.

## Opties

Deze tool heeft geen extra instellingen. De LibreOffice-engine maakt de uitvoer met het standaard PDF-exportprofiel.

## Uitvoer

| Aantal bestanden | Uitvoer                                                                |
| :--------------- | :--------------------------------------------------------------------- |
| 1 bestand        | Enkele PDF-download (oorspronkelijke bestandsnaam met extensie `.pdf`) |
| 2+ bestanden     | ZIP-archief (`word-converted.zip`) met één PDF per bestand             |

## Toepassingen

- Een cv of sollicitatiebrief van DOCX naar PDF omzetten voordat je solliciteert
- Een reeks contracten of offertes in één keer naar PDF omzetten voor oplevering aan een klant
- Oude `.doc`-bestanden omzetten naar moderne PDF's voor archivering op de lange termijn
- Gezamenlijke documenten uit Google Docs (geëxporteerd als DOCX) naar PDF omzetten
- Drukklare PDF's maken van Word-sjablonen die bij geautomatiseerde documentgeneratie worden gebruikt

## Tips

- De LibreOffice-engine wordt eenmaal per sessie gedownload en in de cache bewaard. Verwacht een paar seconden laadtijd bij de eerste conversie, daarna gaat het veel sneller.
- Complexe opmaak (macro's, ActiveX-besturingselementen, geavanceerde SmartArt) wordt mogelijk niet perfect omgezet. Standaard documentelementen (tekst, tabellen, afbeeldingen, kopteksten, voetnoten) worden betrouwbaar omgezet.
- Omdat deze tool ook ODT en RTF accepteert, kun je hem gebruiken als alles-in-één converter voor alle tekstverwerkingsformaten.

## Gerelateerde tools

- [ODT naar PDF](./odt-to-pdf)
- [RTF naar PDF](./rtf-to-pdf)
- [Excel naar PDF](./excel-to-pdf)
- [PowerPoint naar PDF](./powerpoint-to-pdf)
