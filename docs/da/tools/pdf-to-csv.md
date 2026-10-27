---
title: PDF til CSV
description: Udtræk tabeller fra PDF-dokumenter, og eksportér dem som én CSV-fil. Håndterer PDF-filer med flere sider med automatisk tabelgenkendelse.
---

# PDF til CSV

Udtrækker tabeller fra en PDF og eksporterer dem som en CSV-fil. Værktøjet scanner hver side efter tabeldata med PyMuPDF's tabelgenkendelsesmotor og skriver derefter alle fundne rækker til ét kommasepareret output.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipområdet eller trække en fil hen på det.
2. Klik på **Konvertér** for at starte tabeludtrækningen.
3. Værktøjet scanner hver side og finder automatisk tabeller.
4. En `.csv`-fil downloades med alle de udtrukne tabeldata.

Tabeller fra forskellige sider adskilles af tomme rækker i outputtet. Celler med kommaer, anførselstegn eller linjeskift escapes korrekt efter RFC 4180.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Alle tabeller i dokumentet udtrækkes og kombineres i én CSV.

## Outputformat

- En enkelt `filename.csv`-fil med alle fundne tabeller.

## Anvendelser

- Hente økonomiske data fra PDF-kontoudtog eller fakturaer ind i et regneark.
- Udtrække priser fra leverandørtilbud til sammenligning.
- Konvertere tabulære forskningsdata fra PDF-artikler til et format, der egner sig til analyseværktøjer.
- Migrere data fra ældre PDF-rapporter til databaser.

## Tips

- Hvis der ikke findes nogen tabeller, viser værktøjet meddelelsen "Ingen tabeller fundet". Det betyder typisk, at PDF'en bruger et tekstlayout, der ligner en tabel, men ikke er struktureret som en egentlig tabel.
- Til mere kontrol over de enkelte tabeller kan du bruge [Udtræk PDF-tabeller](./extract-tables), hvor du kan vælge mellem CSV, JSON og Markdown som outputformat.
- Hvis du har brug for dataene i Excel-format med separate ark for hver tabel, kan du bruge [PDF til Excel](./pdf-to-excel).

## Relaterede værktøjer

- [PDF til Excel](./pdf-to-excel)
- [Udtræk PDF-tabeller](./extract-tables)
- [PDF til tekst](./pdf-to-text)
