---
title: Tabellen extraheren
description: Detecteer en extraheer tabellen uit PDF-documenten. Exporteer als CSV, JSON of Markdown, per tabel.
---

# Tabellen extraheren

Detecteert alle tabellen in een PDF en laat je ze exporteren in het formaat van je keuze: CSV, JSON of Markdown. Elke tabel wordt afzonderlijk geëxtraheerd met metadata over pagina en positie. Mogelijk gemaakt door de tabeldetectie-engine van PyMuPDF.

## Zo werkt het

1. Upload een PDF door op het uploadvak te klikken of een bestand erheen te slepen.
2. Kies je gewenste **exportformaat**: CSV, JSON of Markdown.
3. Klik op **Extraheren** om de verwerking te starten.
4. Als er één tabel is gevonden, wordt die als enkel bestand gedownload. Bij meerdere tabellen krijg je een ZIP-archief met één bestand per tabel.

## Opties

- **Exportformaat**: kies tussen:
  - **CSV**: door komma's gescheiden waarden, met correcte aanhalingstekens voor velden met komma's, aanhalingstekens of regeleinden. Geschikt voor spreadsheets en databases.
  - **JSON**: structuur van arrays in arrays, opgemaakt met inspringing van 2 spaties. Geschikt voor verwerking door programma's.
  - **Markdown**: tabelformaat met verticale streepjes, weergegeven door PyMuPDF. Geschikt voor documentatie en README-bestanden.

## Uitvoerformaat

- **Eén tabel**: `filename_table.csv` (of `.json` / `.md`)
- **Meerdere tabellen**: `filename_tables.zip` met bestanden met namen als `table_1_page3.csv`, `table_2_page5.csv`, enzovoort.

## Toepassingen

- Specifieke tabellen uit lange PDF-rapporten extraheren zonder de gegevens van het hele document op te halen.
- Tabellen in Markdown-formaat ophalen om direct in GitHub-issues, wiki's of documentatie te plakken.
- Gestructureerde JSON-gegevens uit PDF-tabellen halen voor API-integraties of scripts.
- Tabellen in verschillende PDF-versies vergelijken door beide naar CSV te exporteren en de verschillen te bekijken.

## Tips

- Met deze tool heb je controle per tabel. Als je alle tabellen gewoon in één CSV wilt hebben, gebruik dan [PDF naar CSV](./pdf-to-csv). Voor een volledige Excel-werkmap gebruik je [PDF naar Excel](./pdf-to-excel).
- Tabellen die over meerdere pagina's lopen, worden mogelijk per pagina als aparte tabel gedetecteerd. Je moet ze dan misschien handmatig samenvoegen.
- Als er geen tabellen worden gedetecteerd, is de PDF mogelijk een gescande afbeelding. Voer er eerst OCR op uit om een tekstlaag toe te voegen.

## Gerelateerde tools

- [PDF naar CSV](./pdf-to-csv)
- [PDF naar Excel](./pdf-to-excel)
- [PDF naar tekst](./pdf-to-text)
