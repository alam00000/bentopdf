---
title: WebP till PDF
description: Konvertera WebP-bilder till PDF direkt i webbläsaren med justerbar komprimeringskvalitet.
---

# WebP till PDF

Konvertera Googles bildformat WebP till PDF. Det är särskilt användbart när du har laddat ner bilder från webben i WebP-format och behöver dem i ett mer allmänt accepterat format för utskrift eller delning.

## Format som stöds

| Format | Filändelser |
| :----- | :---------- |
| WebP   | `.webp`     |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina WebP-filer.
2. Gå igenom fillistan och ta bort filer du inte behöver.
3. Välj en nivå för **PDF-kvalitet**.
4. Klicka på **Konvertera till PDF**. Resultatet laddas ner som `from_webps.pdf`.

Internt avkodas varje WebP-bild via webbläsarens canvas-API och bäddas sedan in i PDF:en med pdf-lib. Det betyder att konverteringen fungerar i alla webbläsare som stöder WebP-avkodning (alla moderna webbläsare gör det).

## Alternativ

**PDF-kvalitet** styr komprimeringen när bilder bäddas in:

- **Hög kvalitet**: bevarar mest detaljer.
- **Medelhög kvalitet** (standard): balanserad utdata.
- **Låg kvalitet**: minsta filstorlek.

## Användningsområden

- Konvertera WebP-bilder som laddats ner från webben till en utskrivbar PDF
- Samla WebP-skärmdumpar från Chrome eller Edge i dokumentation
- Skapa en PDF-portfölj av bilder exporterade från designverktyg som använder WebP som standard
- Arkivera WebP-bilder i ett mer allmänt läsbart format

## Tips

- WebP avkodas internt till PNG innan det bäddas in i PDF:en, så förlustfria WebP-bilder behåller sin kvalitet med inställningen Hög.
- Om du har en blandning av WebP och andra bildformat, använd verktyget [Bilder till PDF](./image-to-pdf) i stället, eftersom det accepterar allt på en gång.

## Relaterade verktyg

- [Bilder till PDF](./image-to-pdf)
- [PNG till PDF](./png-to-pdf)
- [JPG till PDF](./jpg-to-pdf)
