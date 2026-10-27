---
title: JSON till PDF
description: Återskapa PDF-filer från BentoPDF:s JSON-format. Konvertera JSON-exporter tillbaka till sina ursprungliga PDF-dokument.
---

# JSON till PDF

Återskapa PDF-dokument från JSON-filer som tidigare skapats med BentoPDF:s verktyg **PDF till JSON**. Det här är ett verktyg för tur-och-retur-konvertering: det tar den strukturerade JSON-representationen av en PDF och bygger upp det ursprungliga dokumentet igen.

::: warning
Det här verktyget accepterar bara JSON-filer som skapats av BentoPDF:s PDF till JSON-konverterare. Vanliga JSON-filer från API:er, databaser eller andra verktyg stöds inte.
:::

## Format som stöds

| Indata  | Beskrivning                                                |
| :------ | :--------------------------------------------------------- |
| `.json` | JSON-filer exporterade av BentoPDF:s verktyg PDF till JSON |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp en eller flera JSON-filer.
2. Fillistan visar varje vald fil med dess storlek.
3. Klicka på **Konvertera till PDF**. Verktyget bearbetar alla filer med en Web Worker och CPDF-motorn.
4. Resultatet laddas ned som `jsons-to-pdf.zip` med en PDF per JSON-fil.

Konverteringen körs i en Web Worker i bakgrunden, så att gränssnittet förblir responsivt även med stora filer.

## Alternativ

Det här verktyget har inga konfigurerbara alternativ. JSON-strukturen bestämmer helt den resulterande PDF-filen.

## Resultat

När flera JSON-filer konverteras levereras resultaten som ett ZIP-arkiv. Varje PDF får namn efter sin JSON-källfil (t.ex. blir `report.json` till `report.pdf`).

## Användningsområden

- Återställa PDF-filer från en JSON-baserad säkerhetskopia eller arkiveringskedja
- Skicka en PDF genom JSON för inspektion och sedan tillbaka till PDF
- Bygga om dokument efter programmatiska ändringar i JSON-strukturen
- Verifiera att en PDF till JSON-export fångade allt dokumentinnehåll genom att konvertera tillbaka det

## Tips

- Om du behöver konvertera godtycklig JSON-data (som API-svar eller konfigurationsfiler) till en formaterad PDF passar verktyget [Text till PDF](./txt-to-pdf) bättre. Klistra in JSON som text så renderas den med korrekt formatering.
- WebAssembly-motorn CPDF måste vara tillgänglig för att det här verktyget ska fungera. Självhostade instanser behöver ha CPDF WASM-filerna konfigurerade.

## Relaterade verktyg

- [Text till PDF](./txt-to-pdf)
- [Markdown till PDF](./markdown-to-pdf)
- [CSV till PDF](./csv-to-pdf)
