---
title: EPUB till PDF
description: Konvertera EPUB-e-böcker till PDF i webbläsaren. Gratis, ingen uppladdning krävs, konvertering med integriteten främst.
---

# EPUB till PDF

Konvertera EPUB-e-böcker till PDF-filer utan att lämna webbläsaren. EPUB är den öppna standarden för digitala böcker, men ibland behöver du en PDF med fast layout för utskrift, kommentarer eller delning med personer som inte har en e-boksläsare.

## Format som stöds

| Format | Filändelse | Anmärkningar             |
| :----- | :--------- | :----------------------- |
| EPUB   | `.epub`    | EPUB 2- och EPUB 3-filer |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina EPUB-filer. Flera filer kan väljas samtidigt.
2. Granska de uppladdade filerna. Ta bort oönskade poster med papperskorgsikonen, eller klicka på **Lägg till fler filer** för att utöka batchen.
3. Klicka på **Konvertera till PDF**. PyMuPDF-motorn återger EPUB-innehållet (text, bilder och formatering) som sidindelad PDF-utdata.
4. En enskild EPUB laddas ner direkt som en PDF. Flera filer paketeras i ett ZIP-arkiv med namnet `epub-converted.zip`.

## Alternativ

Konverteringen körs med rimliga standardvärden och kräver ingen konfiguration. Texten flödar om till standardmått för sidor, och inbäddade typsnitt och bilder förs över till PDF-filen.

## Användningsfall

- Skriva ut en DRM-fri e-bok för läsning bort från skärmar
- Skicka in ett EPUB-manus som en PDF med fast layout för granskning
- Arkivera digitala böcker i ett format som alla operativsystem kan öppna direkt
- Dela ett kapitel med en kollega som inte har en EPUB-läsare
- Konvertera teknisk dokumentation som distribueras som EPUB till PDF-filer som går att kommentera

## Tips

- EPUB 3-funktioner som inbäddat ljud och video förs inte över till PDF, men all text, alla bilder och tabeller konverteras rent.
- För bästa resultat med kraftigt formaterade EPUB-filer, kontrollera de första sidorna i utdatan för att bekräfta att layouten är trogen.

## Relaterade verktyg

- [MOBI till PDF](./mobi-to-pdf)
- [FB2 till PDF](./fb2-to-pdf)
- [CBZ till PDF](./cbz-to-pdf)
