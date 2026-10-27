---
title: PowerPoint naar PDF
description: Zet PowerPoint-presentaties (PPT, PPTX) en ODP-bestanden om naar PDF met behoud van de opmaak van de dia's.
---

# PowerPoint naar PDF

Zet presentatiebestanden om naar PDF. Elke dia wordt een pagina in het uitvoerdocument, met tekst, afbeeldingen, vormen en overgangen weergegeven via een LibreOffice-engine in de browser. Ondersteunt zowel moderne als oudere PowerPoint-formaten, plus het OpenDocument Presentation-formaat.

## Ondersteunde formaten

| Formaat                   | Extensies |
| :------------------------ | :-------- |
| PowerPoint (modern)       | `.pptx`   |
| PowerPoint (ouder)        | `.ppt`    |
| OpenDocument Presentation | `.odp`    |

## Hoe het werkt

1. Klik op het uploadgebied of sleep je presentatiebestanden erheen.
2. Bekijk de bestandslijst. Voeg meer bestanden toe of verwijder ze naar wens.
3. Klik op **Converteren naar PDF**. De LibreOffice-engine wordt bij het eerste gebruik geladen en converteert daarna elk bestand.
4. Eén bestand wordt direct als PDF gedownload. Meerdere bestanden worden samengevoegd in `powerpoint-converted.zip`.

## Opties

Deze tool heeft geen extra instellingen. Dia's worden weergegeven op hun oorspronkelijke afmetingen.

## Uitvoer

| Aantal bestanden | Uitvoer                                                             |
| :--------------- | :------------------------------------------------------------------ |
| 1 bestand        | Eén PDF-download (oorspronkelijke bestandsnaam met extensie `.pdf`) |
| 2+ bestanden     | ZIP-archief (`powerpoint-converted.zip`) met één PDF per bestand    |

## Toepassingen

- Een presentatie naar PDF omzetten voordat je die deelt met een publiek dat mogelijk geen PowerPoint heeft
- Een afdrukbare handout van een diaserie maken voor een congres of workshop
- Presentaties archiveren in een formaat dat op elk apparaat identiek wordt weergegeven
- Een bibliotheek ODP-presentaties van LibreOffice Impress in bulk naar PDF converteren
- Een PDF-versie van een pitchdeck maken als e-mailbijlage

## Tips

- Diaanimaties en overgangen worden niet in de PDF weergegeven. Elke dia wordt vastgelegd als statische pagina.
- Ingesloten video's verschijnen niet in de uitvoer. Vervang ze indien nodig door een schermafbeelding of tijdelijke afbeelding.
- Spreekopmerkingen worden niet meegenomen in de standaard PDF-export. Heb je ze nodig, exporteer dan eerst vanuit de eigen weergave "Notities afdrukken" van PowerPoint.
- De LibreOffice-engine wordt na het eerste laden gecachet, dus een tweede presentatie in dezelfde sessie wordt veel sneller geconverteerd.

## Gerelateerde tools

- [Word naar PDF](./word-to-pdf)
- [Excel naar PDF](./excel-to-pdf)
- [Afbeelding naar PDF](./image-to-pdf)
