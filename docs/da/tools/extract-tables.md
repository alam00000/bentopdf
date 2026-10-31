---
title: Udtræk PDF-tabeller
description: Registrer og udtræk tabeller fra PDF-dokumenter. Eksportér som CSV, JSON eller Markdown med granularitet pr. tabel.
---

# Udtræk PDF-tabeller

Registrerer alle tabeller i en PDF og lader dig eksportere dem i det format, du vælger: CSV, JSON eller Markdown. Hver tabel udtrækkes individuelt med metadata om side og position. Drevet af PyMuPDF's tabelregistreringsmotor.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipzonen eller trække en fil hen på den.
2. Vælg dit foretrukne **eksportformat**: CSV, JSON eller Markdown.
3. Klik på **Udtræk** for at starte behandlingen.
4. Hvis der findes én tabel, downloades den som en enkelt fil. Flere tabeller giver et ZIP-arkiv med én fil pr. tabel.

## Indstillinger

- **Eksportformat**: vælg mellem:
  - **CSV**: kommaseparerede værdier med korrekt citering af felter, der indeholder kommaer, anførselstegn eller linjeskift. Velegnet til regneark og databaser.
  - **JSON**: struktur med array af arrays, pænt formateret med indrykning på 2 mellemrum. Velegnet til programmatisk brug.
  - **Markdown**: tabelformat med lodrette streger, gengivet af PyMuPDF. Velegnet til dokumentation og README-filer.

## Outputformat

- **Enkelt tabel**: `filename_table.csv` (eller `.json` / `.md`)
- **Flere tabeller**: `filename_tables.zip` med filer ved navn `table_1_page3.csv`, `table_2_page5.csv` osv.

## Anvendelser

- Udtræk bestemte tabeller fra lange PDF-rapporter uden at hente hele dokumentets data.
- Få tabeller i Markdown-format til at indsætte direkte i GitHub-issues, wikier eller dokumentation.
- Træk struktureret JSON-data ud af PDF-tabeller til API-integrationer eller scripts.
- Sammenlign tabeller på tværs af forskellige PDF-versioner ved at eksportere begge til CSV og lave en diff.

## Tips

- Dette værktøj giver kontrol pr. tabel. Hvis du bare vil have alle tabeller samlet i én CSV, kan du bruge [PDF til CSV](./pdf-to-csv). Til en fuld Excel-projektmappe kan du bruge [PDF til Excel](./pdf-to-excel).
- Tabeller, der strækker sig over flere sider, kan blive registreret som separate tabeller pr. side. Du skal muligvis sætte dem sammen manuelt.
- Hvis der ikke registreres tabeller, kan PDF'en være et skannet billede. Kør den gennem OCR først for at tilføje et tekstlag.

## Relaterede værktøjer

- [PDF til CSV](./pdf-to-csv)
- [PDF til Excel](./pdf-to-excel)
- [PDF til tekst](./pdf-to-text)
