---
title: CBZ till PDF
description: Konvertera CBZ- och CBR-serietidningsarkiv till PDF i webbläsaren. Gratis, privat, ingen uppladdning behövs.
---

# CBZ till PDF

Förvandla serietidningsarkiv till PDF-filer. CBZ och CBR är standardformaten för digitala serier. De är bara ZIP- eller RAR-arkiv fyllda med bilder. Det här verktyget extraherar varje sida, bevarar läsordningen och skapar en ren PDF där varje bild blir en sida i full storlek.

## Format som stöds

| Format | Filändelse | Anmärkningar                                                  |
| :----- | :--------- | :------------------------------------------------------------ |
| CBZ    | `.cbz`     | ZIP-baserat serietidningsarkiv (bearbetas lokalt med pdf-lib) |
| CBR    | `.cbr`     | RAR-baserat serietidningsarkiv (bearbetas via PyMuPDF-motorn) |

CBZ-konverteraren känner igen bilder i formaten JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC och JXL i arkivet. Format som inte är standard konverteras automatiskt till PNG före inbäddning.

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina CBZ- eller CBR-filer. Du kan blanda båda formaten i samma batch.
2. Granska de listade filerna. Ta bort de du inte behöver, eller klicka på **Lägg till fler filer** för att lägga till fler.
3. Klicka på **Konvertera till PDF**. För CBZ-filer packar verktyget upp arkivet, sorterar bildfilerna efter namn i naturlig ordning, identifierar varje bilds faktiska format och bäddar in dem i en PDF med pdf-lib. CBR-filer går i stället via PyMuPDF-motorn.
4. En enskild fil laddas ner som en PDF. Flera filer ger ett ZIP-arkiv med namnet `comic-converted.zip`.

## Alternativ

Ingen konfiguration krävs. Varje bild blir en sida med samma mått som originalet, så dubbelsidor förblir breda och enkelsidor förblir smala.

## Användningsfall

- Läsa serier på en surfplatta eller i en mobilapp som stöder PDF men inte CBZ/CBR
- Skriva ut vissa sidor från en digital serie
- Arkivera en seriesamling i ett format som alla filvisare kan öppna
- Dela en serie med någon som inte har en särskild serieläsare

## Tips

- Bilderna i arkivet sorteras i naturlig ordning (så `page2.jpg` kommer före `page10.jpg`). Namnge filerna med enhetlig numrering för rätt sidordning.
- Konverteraren identifierar bildformat utifrån deras binära signaturer, inte filändelser. En PNG som av misstag fått namnet `.jpg` bäddas ändå in korrekt.
- CBZ-filer bearbetas helt i webbläsaren utan att PyMuPDF-motorn läses in, så de konverteras snabbare än CBR-filer.

## Relaterade verktyg

- [EPUB till PDF](./epub-to-pdf)
- [MOBI till PDF](./mobi-to-pdf)
- [Bilder till PDF](./image-to-pdf)
