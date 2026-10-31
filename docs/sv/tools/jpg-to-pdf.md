---
title: JPG till PDF
description: Konvertera en eller flera JPG-, JPEG- och JPEG 2000-bilder till en enda PDF-fil direkt i webbläsaren.
---

# JPG till PDF

Gör om JPG-bilder till en ren PDF. Ladda upp en fil eller flera JPG-filer på en gång. Varje bild blir en helsida i det färdiga dokumentet.

## Format som stöds

| Format    | Filändelser     |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina JPG-filer. Flera filer kan väljas samtidigt.
2. Granska de uppladdade filerna. Använd papperskorgsikonen för att ta bort enskilda filer, eller klicka på **Lägg till fler filer** för att lägga till i listan.
3. Välj en **PDF-kvalitet**.
4. Klicka på **Konvertera till PDF**. Verktyget komprimerar bilderna enligt din kvalitetsinställning, konverterar dem med PyMuPDF-motorn och laddar ned `from_jpgs.pdf`.

## Alternativ

**PDF-kvalitet** justerar den komprimering som används på varje bild innan den bäddas in i PDF-filen:

- **Hög kvalitet**: bevarar maximal detaljrikedom. Använd för fotografi eller tryck.
- **Medelhög kvalitet** (standard): en bra balans mellan tydlighet och filstorlek.
- **Låg kvalitet**: kraftig komprimering för minsta möjliga resultat.

## Användningsområden

- Konvertera skannade dokument som sparats som JPG till en enda PDF för inlämning
- Paketera produktbilder i en katalog åt kunder
- Göra om medicinska bilder eller satellitbilder i JPEG 2000 till en portabel PDF
- Skapa ett utskrivbart fotoalbum av kameraexporter

## Tips

- JPEG 2000-filer (`.jp2`, `.jpx`) stöds fullt ut, inte bara vanlig JPEG. Det är användbart för medicinsk bilddiagnostik och geospatiala data.
- Om dina JPG-filer kommer från en mobilkamera ger Medelhög kvalitet vanligtvis en fil som är 40-60 % mindre än Hög utan synlig skillnad på skärmen.

## Relaterade verktyg

- [Bilder till PDF](./image-to-pdf)
- [PNG till PDF](./png-to-pdf)
- [WebP till PDF](./webp-to-pdf)
