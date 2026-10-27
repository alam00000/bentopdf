---
title: CSV till PDF
description: Konvertera CSV-kalkylbladsfiler till formaterade PDF-tabeller direkt i webbläsaren.
---

# CSV till PDF

Förvandla CSV-filer till rena, formaterade PDF-dokument. Varje CSV-fil tolkas och återges som en tabell i PDF-utdata. Det är användbart när du behöver skriva ut eller dela tabelldata utan att mottagaren behöver ha kalkylprogram.

## Format som stöds

| Format | Filändelser |
| :----- | :---------- |
| CSV    | `.csv`      |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp en eller flera CSV-filer.
2. Granska fillistan. Lägg till fler filer eller ta bort oönskade.
3. Klicka på **Konvertera till PDF**. En förloppsindikator visar konverteringens status.
4. En enskild fil laddas ner direkt som en PDF. Flera filer paketeras i `csv-converted.zip`.

## Alternativ

Det här verktyget har ingen ytterligare konfiguration. CSV-filen tolkas och formateras automatiskt som en tabell.

## Utdata

| Antal indata | Utdata                                             |
| :----------- | :------------------------------------------------- |
| 1 fil        | Enskild PDF-nedladdning (t.ex. `data.pdf`)         |
| 2+ filer     | ZIP-arkiv (`csv-converted.zip`) med en PDF per fil |

## Användningsfall

- Konvertera exporterade databasrapporter till utskrivbara PDF-tabeller
- Dela finansiella data eller lagerlistor med personer som inte har Excel
- Skapa PDF-versioner av CSV-loggfiler för efterlevnadsdokumentation
- Skriva ut adresslistor, betygsblad eller andra tabelldata som lagras som CSV

## Tips

- För bästa resultat bör din CSV använda vanliga kommatecken som avgränsare. Verktyget följer vanliga konventioner för CSV-tolkning.
- Om din CSV har många kolumner kan tabellen komprimeras för att passa sidbredden. Överväg att dela upp breda datamängder i flera filer.
- För Excel-filer (`.xls`, `.xlsx`), använd verktyget [Excel till PDF](./excel-to-pdf), som bevarar kalkylbladsformatering och flera blad.

## Relaterade verktyg

- [Excel till PDF](./excel-to-pdf)
- [Text till PDF](./txt-to-pdf)
- [JSON till PDF](./json-to-pdf)
