---
title: Excel til PDF
description: Konvertér Excel-regneark (XLS, XLSX), ODS- og CSV-filer til PDF med bevaret formatering.
---

# Excel til PDF

Konvertér regnearksfiler til PDF. Værktøjet håndterer moderne Excel-filer, det gamle XLS-format, OpenDocument-regneark og endda CSV, alt sammen gengivet via en browserbaseret LibreOffice-motor, der bevarer cellers formatering, formler (som beregnede værdier), diagrammer og layout med flere ark.

## Understøttede formater

| Format                | Filtypenavne |
| :-------------------- | :----------- |
| Excel (moderne)       | `.xlsx`      |
| Excel (ældre)         | `.xls`       |
| OpenDocument-regneark | `.ods`       |
| CSV                   | `.csv`       |

## Sådan fungerer det

1. Klik på uploadområdet eller træk og slip dine regnearksfiler.
2. Gennemgå fillisten. Tilføj flere filer eller fjern uønskede.
3. Klik på **Konvertér til PDF**. LibreOffice-motoren initialiseres ved første brug og behandler derefter hver fil.
4. En enkelt fil downloades direkte som PDF. Flere filer leveres som `excel-converted.zip`.

## Indstillinger

Dette værktøj har ingen yderligere konfiguration. LibreOffice-motoren bestemmer sidelayout, skalering og udskriftsområde ud fra regnearkets indbyggede indstillinger.

## Output

| Antal input | Output                                                                 |
| :---------- | :--------------------------------------------------------------------- |
| 1 fil       | Download af en enkelt PDF (oprindeligt filnavn med filendelsen `.pdf`) |
| 2+ filer    | ZIP-arkiv (`excel-converted.zip`) med én PDF pr. fil                   |

## Anvendelser

- Konvertér økonomirapporter eller budgetter fra Excel til PDF til distribution
- Opret udskriftsklare PDF'er ud fra lager- eller produktkatalogregneark
- Del dataanalyseresultater med interessenter, der ikke har Excel installeret
- Arkivér kvartalsrapporter i et format, der ikke kan redigeres
- Konvertér ODS-filer fra LibreOffice Calc til PDF

## Tips

- Diagrammer indlejret i regnearket gengives i PDF'en. Sørg for, at de ser rigtige ud i kildefilen, før du konverterer.
- Hvis dit regneark har flere ark, er alle ark med i PDF-outputtet.
- Til simple CSV-data uden formatering giver værktøjet [CSV til PDF](./csv-to-pdf) en lettere konvertering. Brug Excel til PDF, når du har brug for bevaret formatering, diagrammer eller flere ark.

## Relaterede værktøjer

- [CSV til PDF](./csv-to-pdf)
- [Word til PDF](./word-to-pdf)
- [PowerPoint til PDF](./powerpoint-to-pdf)
