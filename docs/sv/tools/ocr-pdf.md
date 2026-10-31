---
title: OCR PDF
description: Gör skannade PDF-filer sökbara och kopierbara med Tesseract OCR, med stöd för flera språk och teckenfiltrering.
---

# OCR PDF

Gör skannade dokument till sökbara, kopierbara PDF-filer. Verktyget använder Tesseract OCR för att känna igen text i bilder och lägger ett osynligt textlager ovanpå de ursprungliga sidorna, så att det visuella utseendet bevaras medan innehållet blir fullt sökbart.

## Så fungerar det

1. Ladda upp en skannad eller bildbaserad PDF-fil.
2. Välj ett eller flera språk som förekommer i dokumentet i den sökbara språklistan.
3. Justera eventuellt avancerade inställningar (upplösning, binarisering, vitlista).
4. Klicka på **Starta OCR** och följ förloppet i förloppsindikatorn i realtid.
5. När det är klart granskar du den extraherade texten och laddar sedan ned den sökbara PDF-filen eller en vanlig `.txt`-fil.

## Funktioner

- OCR på flera språk med en sökbar språkväljare
- Osynligt textlager bevarar dokumentets ursprungliga utseende
- Förloppsindikator och loggutdata i realtid under bearbetningen
- Ladda ned resultaten som en sökbar PDF eller en vanlig textfil
- Kopiera extraherad text direkt till urklipp
- Tre upplösningsnivåer för att balansera hastighet mot noggrannhet

## Alternativ

| Inställning                           | Värden                                                                                               | Standard | Syfte                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| **Upplösning**                        | Standard (192 DPI), Hög (288 DPI), Ultra (384 DPI)                                                   | Hög      | Högre upplösning ger bättre noggrannhet på liten text men tar längre tid               |
| **Binarisera bild**                   | På / Av                                                                                              | Av       | Förbättrar kontrasten för rena skanningar genom att konvertera till svartvitt          |
| **Förinställning för teckenvitlista** | Ingen, Alfanumerisk, Siffror + valuta, Endast bokstäver, Endast siffror, Faktura, Formulär, Anpassad | Ingen    | Begränsar igenkända tecken för att förbättra noggrannheten för specifika dokumenttyper |
| **Teckenvitlista**                    | Fri text                                                                                             | Tom      | Manuell teckenuppsättning när förinställningen är Anpassad                             |

## Användningsområden

- Göra skannade avtal och fakturor sökbara så att du kan använda Ctrl+F i dem
- Extrahera text från fotograferade dokument eller gamla pappersregister
- Bearbeta kvitton med förinställningen Faktura för att korrekt fånga belopp och datum
- Skapa tillgängliga PDF-filer från skanningar som bara består av bilder för att uppfylla efterlevnadskrav
- Batchextrahera textinnehåll från skannade böcker eller manualer

## Tips

- Välj flera språk om ditt dokument innehåller blandat språk (t.ex. engelska rubriker med japansk brödtext).
- Använd alternativet binarisera för dokument med bleknad text eller låg kontrast, det kan förbättra igenkänningen avsevärt.
- Vitlistorna Faktura och Formulär minskar kraftigt antalet falska träffar i strukturerade dokument genom att ignorera irrelevanta teckenformer.

## Relaterade verktyg

- [Extrahera PDF-tabeller](./extract-tables)
- [Sammanfoga PDF](./merge-pdf)
- [Komprimera PDF](./compress-pdf)
