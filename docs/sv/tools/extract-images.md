---
title: Extrahera bilder
description: Extrahera alla inbäddade bilder från PDF-filer. Förhandsgranska dem i ett rutnät och ladda ner dem enskilt eller som ett ZIP-arkiv.
---

# Extrahera bilder

Hämtar ut alla inbäddade bilder från en eller flera PDF-filer. Extraherade bilder visas i ett förhandsgranskningsrutnät där du kan ladda ner dem enskilt, eller ta allt på en gång som en ZIP. Drivs av PyMuPDF.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer genom att klicka på släppytan eller dra filer dit. Lägg till fler filer eller ta bort enskilda efter behov.
2. Klicka på **Extrahera** för att starta bearbetningen.
3. Verktyget söker igenom varje sida i varje uppladdad PDF och hittar och extraherar inbäddade bilder.
4. Extraherade bilder visas i ett rutnät med miniatyrer. Varje bild har en nedladdningsknapp.
5. Klicka på **Ladda ner alla** för att spara allt som ett ZIP-arkiv.

## Alternativ

Det här verktyget har inga konfigurerbara alternativ. Alla inbäddade bilder extraheras i sitt ursprungliga format (vanligtvis PNG, JPEG eller vilket format som användes när bilden bäddades in i PDF-filen).

## Utdataformat

- Bilder visas i ett förhandsgranskningsrutnät med namnen `image_1.png`, `image_2.jpg` osv.
- **Ladda ner alla** ger `extracted-images.zip` med alla bilder.
- Enskilda bilder kan laddas ner en i taget från rutnätet.

## Användningsfall

- Återskapa foton eller grafik från en PDF för återanvändning i ett annat projekt.
- Extrahera produktbilder från en katalog-PDF för en e-handelsannons.
- Hämta ut diagram från teknisk dokumentation för användning i presentationer.
- Granska vilka bilder som är inbäddade i ett dokument innan det delas.

## Tips

- Verktyget extraherar bilder precis som de lagras i PDF-filen. Det återger inte sidor som bilder. För det, använd [PDF till PNG](./pdf-to-png) eller [PDF till JPG](./pdf-to-jpg).
- Om verktyget rapporterar "Inga bilder hittades" kan PDF-filen använda vektorgrafik i stället för inbäddade rasterbilder, eller så kan det vara ett skannat dokument där hela sidan är en enda stor bild.
- Batchbearbetning fungerar över flera PDF-filer. Alla bilder från alla filer kombineras i ett enda rutnät och en enda ZIP.

## Relaterade verktyg

- [PDF till PNG](./pdf-to-png)
- [PDF till JPG](./pdf-to-jpg)
- [PDF-arbetsflödesbyggare](./pdf-workflow)
