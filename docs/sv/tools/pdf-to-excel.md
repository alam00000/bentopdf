---
title: PDF till Excel
description: Extrahera tabeller från PDF-dokument till ett Excel-kalkylblad. Varje tabell får ett eget kalkylblad med sidhänvisning.
---

# PDF till Excel

Extraherar tabeller från en PDF och sparar dem som ett Excel-kalkylblad (`.xlsx`). Varje identifierad tabell placeras på ett eget blad, märkt med tabellnummer och källsida. Drivs av PyMuPDF för tabellidentifiering och biblioteket SheetJS för att skapa Excel-filen.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Klicka på **Konvertera** för att starta tabellextraheringen.
3. Verktyget söker igenom varje sida efter tabeller och bygger sedan en Excel-arbetsbok.
4. En `.xlsx`-fil laddas ner med ett blad per tabell.

## Alternativ

Verktyget har inga inställbara alternativ. Alla identifierade tabeller extraheras automatiskt.

## Utdataformat

- En enda `filename.xlsx`-fil.
- **En tabell**: ett enda blad med namnet "Table".
- **Flera tabeller**: blad med namnen "Table 1 (Page 3)", "Table 2 (Page 5)" osv. Bladnamn kortas till 31 tecken (Excels gräns).

## Användningsområden

- Konvertera ekonomiska PDF-rapporter till redigerbara kalkylblad för vidare analys.
- Extrahera lager- eller beställningstabeller från leverantörers PDF-filer.
- Hämta strukturerade data från PDF-formulär eller kataloger till Excel för sortering och filtrering.
- Arkivera tabelldata från PDF i ett format som kollegor utan teknisk bakgrund kan arbeta med.

## Tips

- Om verktyget rapporterar "Inga tabeller hittades" använder PDF-filen sannolikt en fri textlayout i stället för strukturerade tabeller. Prova [PDF till text](./pdf-to-text) för att hämta det råa innehållet.
- För ett enklare platt format, använd [PDF till CSV](./pdf-to-csv). För nedladdning per tabell i flera format, använd [Extrahera PDF-tabeller](./extract-tables).
- Titta på bladnamnen för att se vilken sida varje tabell kommer från.

## Relaterade verktyg

- [PDF till CSV](./pdf-to-csv)
- [Extrahera PDF-tabeller](./extract-tables)
- [PDF till text](./pdf-to-text)
