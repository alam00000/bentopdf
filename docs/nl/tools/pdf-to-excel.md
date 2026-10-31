---
title: PDF naar Excel
description: Haal tabellen uit PDF-documenten naar een Excel-spreadsheet. Elke tabel krijgt een eigen werkblad met paginaverwijzing.
---

# PDF naar Excel

Haalt tabellen uit een PDF en slaat ze op als Excel-spreadsheet (`.xlsx`). Elke gedetecteerde tabel komt op een eigen werkblad, met het tabelnummer en de bronpagina als label. Gebruikt PyMuPDF voor tabeldetectie en de SheetJS-bibliotheek voor het maken van Excel-bestanden.

## Hoe het werkt

1. Upload een PDF door op het neerzetgebied te klikken of een bestand erheen te slepen.
2. Klik op **Converteren** om de tabelextractie te starten.
3. De tool scant elke pagina op tabellen en bouwt daarna een Excel-werkmap.
4. Een `.xlsx`-bestand met één blad per tabel wordt gedownload.

## Opties

Deze tool heeft geen instelbare opties. Alle gedetecteerde tabellen worden automatisch geëxtraheerd.

## Uitvoerformaat

- Eén `filename.xlsx`-bestand.
- **Eén tabel**: een enkel werkblad met de naam "Table".
- **Meerdere tabellen**: werkbladen met de namen "Table 1 (Page 3)", "Table 2 (Page 5)", enz. Bladnamen worden afgekapt tot 31 tekens (de limiet van Excel).

## Toepassingen

- PDF-financiële rapporten omzetten naar bewerkbare spreadsheets voor verdere analyse.
- Voorraad- of ordertabellen uit PDF's van leveranciers halen.
- Gestructureerde gegevens uit PDF-formulieren of catalogi naar Excel halen om te sorteren en te filteren.
- Tabelgegevens uit PDF's archiveren in een formaat waarmee niet-technische collega's kunnen werken.

## Tips

- Als de tool "Geen tabellen gevonden" meldt, gebruikt de PDF waarschijnlijk een vrije tekstindeling in plaats van gestructureerde tabellen. Probeer [PDF naar tekst](./pdf-to-text) om in plaats daarvan de ruwe inhoud te pakken.
- Voor een eenvoudiger plat formaat gebruik je [PDF naar CSV](./pdf-to-csv). Voor downloads per tabel in meerdere formaten gebruik je [PDF-tabellen extraheren](./extract-tables).
- Bekijk de bladnamen om te zien van welke pagina elke tabel afkomstig is.

## Gerelateerde tools

- [PDF naar CSV](./pdf-to-csv)
- [PDF-tabellen extraheren](./extract-tables)
- [PDF naar tekst](./pdf-to-text)
