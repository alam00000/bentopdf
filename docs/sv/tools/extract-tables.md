---
title: Extrahera PDF-tabeller
description: Identifiera och extrahera tabeller från PDF-dokument. Exportera som CSV, JSON eller Markdown med tabell för tabell.
---

# Extrahera PDF-tabeller

Identifierar alla tabeller i en PDF och låter dig exportera dem i valfritt format: CSV, JSON eller Markdown. Varje tabell extraheras enskilt med metadata om sida och position. Drivs av PyMuPDF:s tabelldetekteringsmotor.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Välj önskat **exportformat**: CSV, JSON eller Markdown.
3. Klicka på **Extrahera** för att starta bearbetningen.
4. Om en tabell hittas laddas den ner som en enskild fil. Flera tabeller ger ett ZIP-arkiv med en fil per tabell.

## Alternativ

- **Exportformat**: välj mellan:
  - **CSV**: kommaseparerade värden med korrekt citering för fält som innehåller kommatecken, citattecken eller radbrytningar. Lämpligt för kalkylblad och databaser.
  - **JSON**: struktur med matris av matriser, formaterad med 2 blanksteg indrag. Lämpligt för programmatisk användning.
  - **Markdown**: tabellformat avgränsat med lodräta streck, återgivet av PyMuPDF. Lämpligt för dokumentation och README-filer.

## Utdataformat

- **En tabell**: `filename_table.csv` (eller `.json` / `.md`)
- **Flera tabeller**: `filename_tables.zip` med filer som heter `table_1_page3.csv`, `table_2_page5.csv` osv.

## Användningsfall

- Extrahera vissa tabeller från långa PDF-rapporter utan att hämta ut hela dokumentets data.
- Få tabeller i Markdown-format för att klistra in direkt i GitHub-ärenden, wikis eller dokumentation.
- Hämta ut strukturerad JSON-data från PDF-tabeller för API-integrationer eller skript.
- Jämföra tabeller mellan olika PDF-versioner genom att exportera båda till CSV och jämföra skillnaderna.

## Tips

- Det här verktyget ger dig kontroll per tabell. Om du bara vill ha alla tabeller samlade i en enda CSV, använd [PDF till CSV](./pdf-to-csv). För en hel Excel-arbetsbok, använd [PDF till Excel](./pdf-to-excel).
- Tabeller som sträcker sig över flera sidor kan identifieras som separata tabeller per sida. Du kan behöva sätta ihop dem manuellt.
- Om inga tabeller upptäcks kan PDF-filen vara en skannad bild. Kör den genom OCR först för att lägga till ett textlager.

## Relaterade verktyg

- [PDF till CSV](./pdf-to-csv)
- [PDF till Excel](./pdf-to-excel)
- [PDF till text](./pdf-to-text)
