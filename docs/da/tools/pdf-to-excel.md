---
title: PDF til Excel
description: Udtræk tabeller fra PDF-dokumenter til et Excel-regneark. Hver tabel får sit eget regneark med sidehenvisninger.
---

# PDF til Excel

Udtrækker tabeller fra en PDF og gemmer dem som et Excel-regneark (`.xlsx`). Hver fundet tabel placeres på sit eget ark, mærket med tabelnummer og kildeside. Drevet af PyMuPDF til tabelgenkendelse og SheetJS-biblioteket til Excel-generering.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipområdet eller trække en fil hen på det.
2. Klik på **Konvertér** for at starte tabeludtrækningen.
3. Værktøjet scanner hver side efter tabeller og bygger derefter en Excel-projektmappe.
4. En `.xlsx`-fil downloades med ét ark pr. tabel.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Alle fundne tabeller udtrækkes automatisk.

## Outputformat

- En enkelt `filename.xlsx`-fil.
- **Én tabel**: ét ark med navnet "Table".
- **Flere tabeller**: ark med navnene "Table 1 (Page 3)", "Table 2 (Page 5)" osv. Arknavne afkortes til 31 tegn (Excels grænse).

## Anvendelser

- Konvertere økonomiske PDF-rapporter til redigerbare regneark til videre analyse.
- Udtrække lager- eller ordretabeller fra leverandørers PDF-filer.
- Hente strukturerede data fra PDF-formularer eller kataloger ind i Excel til sortering og filtrering.
- Arkivere tabulære PDF-data i et format, som ikke-tekniske kolleger kan arbejde med.

## Tips

- Hvis værktøjet melder "Ingen tabeller fundet", bruger PDF'en sandsynligvis et frit tekstlayout i stedet for strukturerede tabeller. Prøv [PDF til tekst](./pdf-to-text) for at hente det rå indhold i stedet.
- Til et enklere fladt format kan du bruge [PDF til CSV](./pdf-to-csv). Til downloads pr. tabel i flere formater kan du bruge [Udtræk PDF-tabeller](./extract-tables).
- Se på arknavnene for at finde ud af, hvilken side hver tabel kom fra.

## Relaterede værktøjer

- [PDF til CSV](./pdf-to-csv)
- [Udtræk PDF-tabeller](./extract-tables)
- [PDF til tekst](./pdf-to-text)
