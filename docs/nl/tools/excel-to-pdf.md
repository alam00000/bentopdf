---
title: Excel naar PDF
description: Zet Excel-spreadsheets (XLS, XLSX), ODS- en CSV-bestanden om naar PDF met behoud van de opmaak.
---

# Excel naar PDF

Zet spreadsheetbestanden om naar PDF. De tool verwerkt moderne Excel-bestanden, het oudere XLS-formaat, OpenDocument-spreadsheets en zelfs CSV. Alles wordt weergegeven door een LibreOffice-engine in de browser, die celopmaak, formules (als berekende waarden), grafieken en indelingen met meerdere bladen behoudt.

## Ondersteunde formaten

| Formaat                  | Extensies |
| :----------------------- | :-------- |
| Excel (modern)           | `.xlsx`   |
| Excel (verouderd)        | `.xls`    |
| OpenDocument-spreadsheet | `.ods`    |
| CSV                      | `.csv`    |

## Zo werkt het

1. Klik op het uploadvak of sleep je spreadsheetbestanden erheen.
2. Bekijk de bestandslijst. Voeg meer bestanden toe of verwijder ongewenste bestanden.
3. Klik op **Converteren naar PDF**. De LibreOffice-engine wordt bij het eerste gebruik gestart en verwerkt daarna elk bestand.
4. Eén bestand wordt direct als PDF gedownload. Meerdere bestanden worden geleverd als `excel-converted.zip`.

## Opties

Deze tool heeft geen extra configuratie. De LibreOffice-engine bepaalt de paginaindeling, schaling en het afdrukbereik op basis van de ingebouwde instellingen van de spreadsheet.

## Uitvoer

| Aantal invoerbestanden | Uitvoer                                                             |
| :--------------------- | :------------------------------------------------------------------ |
| 1 bestand              | Eén PDF-download (oorspronkelijke bestandsnaam met extensie `.pdf`) |
| 2+ bestanden           | ZIP-archief (`excel-converted.zip`) met één PDF per bestand         |

## Toepassingen

- Financiële rapporten of begrotingen uit Excel omzetten naar PDF voor verspreiding
- Drukklare PDF's maken van voorraad- of productcatalogusspreadsheets
- Resultaten van data-analyse delen met belanghebbenden die geen Excel hebben geïnstalleerd
- Kwartaalrapporten archiveren in een niet-bewerkbaar formaat
- ODS-bestanden uit LibreOffice Calc omzetten naar PDF

## Tips

- Grafieken in de spreadsheet worden weergegeven in de PDF. Controleer of ze in het bronbestand goed zijn voordat je converteert.
- Als je spreadsheet meerdere bladen heeft, worden alle bladen opgenomen in de PDF-uitvoer.
- Voor eenvoudige CSV-gegevens zonder opmaak biedt de tool [CSV naar PDF](./csv-to-pdf) een lichtere conversie. Gebruik Excel naar PDF wanneer je opmaak, grafieken of meerdere bladen wilt behouden.

## Gerelateerde tools

- [CSV naar PDF](./csv-to-pdf)
- [Word naar PDF](./word-to-pdf)
- [PowerPoint naar PDF](./powerpoint-to-pdf)
