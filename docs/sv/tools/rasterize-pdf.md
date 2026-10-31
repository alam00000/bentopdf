---
title: Rasterisera PDF
description: Konvertera PDF-sidor till bildbaserad PDF. Platta till alla lager, ta bort markerbar text och styr DPI och bildformat.
---

# Rasterisera PDF

Rasterisering omvandlar varje sida i en PDF till en bild och sätter ihop bilderna till en PDF igen. Resultatet ser likadant ut som originalet men innehåller ingen markerbar text, inga interaktiva element och inga redigerbara lager. Det är i praktiken en fotokopia av hög kvalitet.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer.
2. Ange **DPI** (upplösning) för den rasteriserade utdatan.
3. Välj ett **bildformat**: PNG för förlustfri kvalitet eller JPEG för mindre filer.
4. Markera eventuellt **Konvertera till gråskala**.
5. Klicka på **Rasterisera PDF**. Flera filer laddas ned som ZIP.

## Alternativ

| Inställning    | Värden                          | Standard |
| -------------- | ------------------------------- | -------- |
| **DPI**        | 72, 150, 200, 300, 600          | 150      |
| **Bildformat** | PNG (förlustfri), JPEG (mindre) | PNG      |
| **Gråskala**   | På/Av                           | Av       |

## DPI-riktlinjer

- **72**: Endast visning på skärm, minsta filstorlek
- **150**: Bra balans för allmänt bruk
- **200**: Skarpare text, måttlig filstorlek
- **300**: Utdata i tryckkvalitet
- **600**: Högkvalitativ arkivering eller professionell utskrift

## Användningsområden

- Förhindra textextraktion från konfidentiella dokument innan de delas
- Eliminera typsnittsberoenden genom att omvandla text till pixlar
- Skapa en "platt" version av en PDF med komplexa lager eller transparens som renderas olika i olika läsare
- Förbereda en PDF för ett system som bara accepterar bildbaserad indata
- Ta bort dolt innehåll (som spårade ändringar eller formulärdata) genom att reducera PDF-filen till rena bilder

## Tips

- 150 DPI med PNG är en bra standard. Gå bara högre om du behöver utskrift eller vill zooma in på fina detaljer.
- JPEG ger märkbart mindre filer men introducerar kompressionsartefakter på skarpa textkanter.
- Rasterisering går inte att ångra, så behåll originalet om du kan behöva redigerbar text senare.

## Relaterade verktyg

- [Komprimera PDF](./compress-pdf): minska den rasteriserade PDF-filens storlek
- [Räta upp PDF](./deskew-pdf): räta upp sidor innan du rasteriserar skannade dokument
- [Typsnitt till konturer](./font-to-outline): omvandla typsnitt till vektorbanor om du vill behålla skalbarheten
- [Platta till PDF](./flatten-pdf): platta till formulär utan att konvertera till bilder
