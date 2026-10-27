---
title: PDF naar CSV
description: Haal tabellen uit PDF-documenten en exporteer ze als één CSV-bestand. Verwerkt PDF's met meerdere pagina's met automatische tabeldetectie.
---

# PDF naar CSV

Haalt tabellen uit een PDF en exporteert ze als CSV-bestand. De tool doorzoekt elke pagina op tabelgegevens met de tabeldetectie-engine van PyMuPDF en schrijft alle gevonden rijen naar één door komma's gescheiden uitvoer.

## Hoe het werkt

1. Upload een PDF door op het neerzetgebied te klikken of een bestand erheen te slepen.
2. Klik op **Converteren** om de tabelextractie te starten.
3. De tool scant elke pagina en herkent tabellen automatisch.
4. Een `.csv`-bestand met alle geëxtraheerde tabelgegevens wordt gedownload.

Tabellen van verschillende pagina's worden in de uitvoer gescheiden door lege rijen. Cellen met komma's, aanhalingstekens of regeleinden worden correct ge-escaped volgens RFC 4180.

## Opties

Deze tool heeft geen instelbare opties. Alle tabellen in het document worden geëxtraheerd en gecombineerd in één CSV.

## Uitvoerformaat

- Eén `filename.csv`-bestand met alle gedetecteerde tabellen.

## Toepassingen

- Financiële gegevens uit PDF-bankafschriften of facturen in een spreadsheet halen.
- Prijstabellen uit offertes van leveranciers extraheren om te vergelijken.
- Tabelgegevens uit PDF-onderzoeksartikelen omzetten naar een formaat dat geschikt is voor analysetools.
- Gegevens uit oude PDF-rapporten migreren naar databases.

## Tips

- Als er geen tabellen worden gevonden, toont de tool de melding "Geen tabellen gevonden". Meestal betekent dit dat de PDF een tekstindeling gebruikt die op een tabel lijkt maar niet als echte tabel is opgebouwd.
- Voor meer controle over afzonderlijke tabellen gebruik je [PDF-tabellen extraheren](./extract-tables), waarmee je kunt kiezen tussen CSV, JSON en Markdown als uitvoerformaat.
- Als je de gegevens in Excel-formaat wilt, met aparte bladen per tabel, gebruik dan [PDF naar Excel](./pdf-to-excel).

## Gerelateerde tools

- [PDF naar Excel](./pdf-to-excel)
- [PDF-tabellen extraheren](./extract-tables)
- [PDF naar tekst](./pdf-to-text)
