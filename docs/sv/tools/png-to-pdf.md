---
title: PNG till PDF
description: Konvertera en eller flera PNG-bilder till ett PDF-dokument med justerbar kvalitet, helt i webbläsaren.
---

# PNG till PDF

Konvertera PNG-bilder till PDF med full upplösning bevarad. Varje PNG blir en egen sida, anpassad efter originalbildens mått. Transparens hanteras automatiskt.

## Format som stöds

| Format | Filändelser |
| :----- | :---------- |
| PNG    | `.png`      |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp PNG-filer. Du kan välja flera samtidigt.
2. Hantera fillistan: ta bort oönskade filer eller lägg till fler.
3. Välj en nivå för **PDF-kvalitet** i rullgardinsmenyn.
4. Klicka på **Konvertera till PDF**. Utdata laddas ner som `from_jpgs.pdf`.

Verktyget använder pdf-lib för att bädda in varje bild direkt. Om en PNG inte kan bäddas in på ursprungligt sätt (t.ex. på grund av en ovanlig färgprofil) faller verktyget tillbaka på att rendera om den via en canvas som JPEG.

## Alternativ

**PDF-kvalitet** styr komprimeringen som tillämpas före inbäddning:

- **Hög kvalitet**: minimal komprimering, största filstorlek.
- **Medelhög kvalitet** (standard): bra balans mellan storlek och tydlighet.
- **Låg kvalitet**: maximal komprimering, minsta utdata.

## Användningsområden

- Konvertera skärmbilder till en PDF med flera sidor för felrapporter eller dokumentation
- Paketera exporter från UI-design i en enda fil för granskning
- Göra diagramexporter (draw.io, Excalidraw) till en delbar PDF
- Sätta ihop en uppsättning diagrambilder till en rapport

## Tips

- PNG-filer med transparens får vit bakgrund i PDF-filen. Om du behöver en annan bakgrund, redigera bilderna i förväg.
- För skärmbilder och diagram med skarpa kanter och text undviker Hög kvalitet JPEG-komprimeringsartefakter. Medelhög eller Låg kan konvertera till JPEG internt.

## Relaterade verktyg

- [Bilder till PDF](./image-to-pdf)
- [JPG till PDF](./jpg-to-pdf)
- [SVG till PDF](./svg-to-pdf)
