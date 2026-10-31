---
title: PDF till CSV
description: Extrahera tabeller från PDF-dokument och exportera dem som en enda CSV-fil. Hanterar PDF-filer med flera sidor med automatisk tabellidentifiering.
---

# PDF till CSV

Extraherar tabeller från en PDF och exporterar dem som en CSV-fil. Verktyget söker igenom varje sida efter tabelldata med PyMuPDF:s tabellidentifiering och skriver alla hittade rader i en enda kommaseparerad utdatafil.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Klicka på **Konvertera** för att starta tabellextraheringen.
3. Verktyget söker igenom varje sida och identifierar tabeller automatiskt.
4. En `.csv`-fil laddas ner med alla extraherade tabelldata.

Tabeller från olika sidor skiljs åt med tomma rader i utdata. Celler som innehåller kommatecken, citattecken eller radbrytningar escapas korrekt enligt RFC 4180.

## Alternativ

Verktyget har inga inställbara alternativ. Alla tabeller som hittas i dokumentet extraheras och kombineras i en enda CSV.

## Utdataformat

- En enda `filename.csv`-fil med alla identifierade tabeller.

## Användningsområden

- Hämta ekonomiska data från PDF-kontoutdrag eller fakturor till ett kalkylblad.
- Extrahera pristabeller från leverantörsoffert för jämförelse.
- Konvertera tabelldata från PDF-artiklar till ett format som passar analysverktyg.
- Migrera data från äldre PDF-rapporter till databaser.

## Tips

- Om inga tabeller hittas visar verktyget meddelandet "Inga tabeller hittades". Det beror oftast på att PDF-filen har en textlayout som ser ut som en tabell men inte är uppbyggd som en riktig tabell.
- För mer kontroll över enskilda tabeller, använd [Extrahera PDF-tabeller](./extract-tables), där du kan välja mellan CSV, JSON och Markdown som utdataformat.
- Om du behöver data i Excel-format med separata blad för varje tabell, använd [PDF till Excel](./pdf-to-excel).

## Relaterade verktyg

- [PDF till Excel](./pdf-to-excel)
- [Extrahera PDF-tabeller](./extract-tables)
- [PDF till text](./pdf-to-text)
