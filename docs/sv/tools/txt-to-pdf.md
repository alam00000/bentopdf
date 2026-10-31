---
title: Text till PDF
description: Konvertera vanliga textfiler eller skriven text till PDF med egna typsnitt, färger och sidstorlekar.
---

# Text till PDF

Konvertera ren text till en formaterad PDF. Du kan ladda upp `.txt`-filer eller skriva direkt i den inbyggda textredigeraren. Verktyget stöder flera typsnitt, egna textfärger och ett brett urval av sidstorlekar, från A0 ned till A10, plus US Letter, Legal och Tabloid.

## Format som stöds

| Indata               | Filändelser                          |
| :------------------- | :----------------------------------- |
| Vanliga textfiler    | `.txt`                               |
| Direkt textinmatning | Skriv eller klistra in i redigeraren |

## Så fungerar det

1. Välj indataläge med växeln högst upp: **Ladda upp filer** eller **Skriv text**.
2. Om du laddar upp, dra och släpp eller klicka för att välja en eller flera `.txt`-filer. Om du skriver, ange texten direkt i textrutan.
3. Konfigurera formateringsalternativen: typsnittsfamilj, teckenstorlek, textfärg och sidstorlek.
4. Klicka på **Skapa PDF**. Resultatet laddas ned som `text_to_pdf.pdf`.

När du laddar upp flera filer sammanfogas deras innehåll med tomma rader emellan.

## Alternativ

| Alternativ          | Värden                                                                   | Standard        |
| :------------------ | :----------------------------------------------------------------------- | :-------------- |
| **Typsnittsfamilj** | Helvetica (sans-serif), Tiro (serif), Courier (monospace), Times (serif) | Helvetica       |
| **Teckenstorlek**   | 6 -- 72 pt                                                               | 12              |
| **Textfärg**        | Valfri färg via färgväljare                                              | Svart (#000000) |
| **Sidstorlek**      | ISO A0--A10, B0--B10, C0--C10, US Letter, Legal, Tabloid, Ledger, 11x17  | A4              |

Språk med höger-till-vänster-skrift (arabiska, hebreiska, persiska, urdu) identifieras automatiskt. När RTL-text hittas växlar textriktning och justering i enlighet med det.

## Användningsområden

- Konvertera kodsnuttar eller loggfiler till en utskrivbar PDF med typsnittet Courier
- Skapa snabbt en PDF av mötesanteckningar som skrivits på stället
- Formatera ett manuskript i ren text med ett visst typsnitt och en viss sidstorlek för inlämning
- Skapa en PDF-version av en README eller changelog för offlinedistribution

## Tips

- Använd läget **Skriv text** när du snabbt vill konvertera innehåll från urklipp utan att först spara det som en fil.
- Courier (monospace) är det bästa typsnittet för kod, loggar eller annat innehåll där kolumnjustering spelar roll.
- Sidmarginalerna är fasta på 72 punkter (1 tum) på alla sidor.

## Relaterade verktyg

- [Markdown till PDF](./markdown-to-pdf)
- [CSV till PDF](./csv-to-pdf)
- [Word till PDF](./word-to-pdf)
