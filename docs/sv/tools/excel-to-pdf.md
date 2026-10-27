---
title: Excel till PDF
description: Konvertera Excel-kalkylblad (XLS, XLSX), ODS- och CSV-filer till PDF med bevarad formatering.
---

# Excel till PDF

Konvertera kalkylbladsfiler till PDF. Verktyget hanterar moderna Excel-filer, det äldre XLS-formatet, OpenDocument-kalkylblad och till och med CSV, allt återgivet genom en webbläsarbaserad LibreOffice-motor som bevarar cellformatering, formler (som beräknade värden), diagram och layouter med flera blad.

## Format som stöds

| Format                  | Filändelser |
| :---------------------- | :---------- |
| Excel (modernt)         | `.xlsx`     |
| Excel (äldre)           | `.xls`      |
| OpenDocument-kalkylblad | `.ods`      |
| CSV                     | `.csv`      |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina kalkylbladsfiler.
2. Granska fillistan. Lägg till fler filer eller ta bort oönskade.
3. Klicka på **Konvertera till PDF**. LibreOffice-motorn startas vid första användningen och bearbetar sedan varje fil.
4. En enskild fil laddas ner direkt som en PDF. Flera filer levereras som `excel-converted.zip`.

## Alternativ

Det här verktyget har ingen ytterligare konfiguration. LibreOffice-motorn bestämmer sidlayout, skalning och utskriftsområde utifrån kalkylbladets inbyggda inställningar.

## Utdata

| Antal indata | Utdata                                                             |
| :----------- | :----------------------------------------------------------------- |
| 1 fil        | Enskild PDF-nedladdning (originalfilnamnet med filändelsen `.pdf`) |
| 2+ filer     | ZIP-arkiv (`excel-converted.zip`) med en PDF per fil               |

## Användningsfall

- Konvertera finansiella rapporter eller budgetar från Excel till PDF för distribution
- Skapa utskriftsklara PDF-filer från kalkylblad med lager eller produktkataloger
- Dela dataanalysresultat med intressenter som inte har Excel installerat
- Arkivera kvartalsrapporter i ett format som inte kan redigeras
- Konvertera ODS-filer från LibreOffice Calc till PDF

## Tips

- Diagram som är inbäddade i kalkylbladet återges i PDF-filen. Kontrollera att de ser rätt ut i källfilen innan du konverterar.
- Om ditt kalkylblad har flera blad ingår alla blad i PDF-utdatan.
- För enkel CSV-data utan formatering ger verktyget [CSV till PDF](./csv-to-pdf) en lättare konvertering. Använd Excel till PDF när du behöver bevara formatering, diagram eller flera blad.

## Relaterade verktyg

- [CSV till PDF](./csv-to-pdf)
- [Word till PDF](./word-to-pdf)
- [PowerPoint till PDF](./powerpoint-to-pdf)
