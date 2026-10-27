---
title: PDF till CBZ
description: Konvertera en PDF till en CBZ-fil (Comic Book Archive) för serieläsare som Komga, Kavita, CDisplayEx och Calibre.
---

# PDF till CBZ

Konverterar en PDF till en CBZ-fil (Comic Book ZIP), standardformatet för digitala serier och manga. Varje PDF-sida blir en bild i arkivet. Verktyget skapar metadata i tre format för maximal kompatibilitet: ComicInfo.xml, metadata.opf och ComicBookInfo JSON.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Välj bildformat, kvalitet, skala och valfri metadata.
3. Klicka på **Konvertera** för att skapa CBZ-filen.
4. Filen `.cbz` laddas ner automatiskt.

## Alternativ

| Alternativ         | Värden          | Standard | Beskrivning                                                                         |
| ------------------ | --------------- | -------- | ----------------------------------------------------------------------------------- |
| Bildformat         | JPEG, PNG, WebP | JPEG     | JPEG för färgserier, PNG för förlustfri svartvit manga, WebP för bäst komprimering. |
| Kvalitet           | 50–100%         | 85%      | Styr JPEG/WebP-komprimeringen. Dold för PNG (alltid förlustfri).                    |
| Skala              | 1.0x–4.0x       | 2.0x     | Högre skala ger skarpare bilder för skärmar med hög upplösning.                     |
| Gråskala           | På/Av           | Av       | Konverterar sidor till gråskala. Minskar filstorleken för svartvitt innehåll.       |
| Mangaläge          | På/Av           | Av       | Anger läsriktning från höger till vänster i metadata.                               |
| Inkludera metadata | På/Av           | På       | Bäddar in ComicInfo.xml, metadata.opf och ComicBookInfo JSON.                       |

## Metadatafält

När metadata är aktiverat kan du fylla i:

- **Titel**: Identifieras automatiskt från PDF-filens namn.
- **Serie**: Seriens namn (t.ex. "Naruto").
- **Nummer (#)**: Utgåvans nummer i serien.
- **Volym (Vol.)**: Volymnummer.
- **Författare**: Manusförfattarens eller skaparens namn.
- **Förlag**: Förlaget.
- **Taggar / Genre**: Kommaseparerade taggar (t.ex. "Action, Äventyr").
- **Utgivningsår**: Utgivningsår (1900–2100).
- **Betyg**: Communityns betyg från 0 till 5.

## Metadatakompatibilitet

Verktyget skriver metadata i tre format så att varje läsare kan hitta den:

| Format             | Plats              | Stöds av                                    |
| ------------------ | ------------------ | ------------------------------------------- |
| ComicInfo.xml      | Fil i ZIP-arkivet  | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Fil i ZIP-arkivet  | Calibre                                     |
| ComicBookInfo JSON | ZIP-kommentarsfält | Calibre (reserv)                            |

## Utdataformat

- `filename.cbz`: Ett ZIP-arkiv med numrerade sidbilder och metadatafiler.

Sidbilderna namnges med nollutfyllda nummer (`01.jpg`, `02.jpg` osv.) så att läsare visar dem i rätt ordning.

## Användningsområden

- Konvertera manga- eller serie-PDF:er för användning i serieläsare.
- Bygga ett digitalt serie-bibliotek i Komga, Kavita eller Calibre.
- Konvertera inskannade serietidningar till ett läsarvänligt format.
- Dela serier i ett format som bevarar läsriktning och metadata.

## Tips

- Använd **JPEG** för färgserier och **PNG** för svartvit manga, eftersom PNG komprimerar svartvitt innehåll mycket effektivt.
- Aktivera **Gråskala** för manga för att minska filstorleken avsevärt.
- Fyll i fälten **Serie** och **Nummer** så att biblioteksverktyg (Komga, Calibre) kan organisera din samling automatiskt.
- **WebP** ger bäst komprimering, men äldre serieläsare kanske inte stöder det.

## Relaterade verktyg

- [PDF till JPG](./pdf-to-jpg)
- [PDF till PNG](./pdf-to-png)
- [PDF till TIFF](./pdf-to-tiff)
- [Extrahera bilder](./extract-images)
