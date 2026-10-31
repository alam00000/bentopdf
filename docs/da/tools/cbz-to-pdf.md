---
title: CBZ til PDF
description: Konvertér CBZ- og CBR-tegneseriearkiver til PDF i din browser. Gratis, privat, ingen upload nødvendig.
---

# CBZ til PDF

Gør tegneseriearkiver om til PDF'er. CBZ og CBR er standardformaterne til digitale tegneserier. De er blot ZIP- eller RAR-arkiver fyldt med billeder. Værktøjet udpakker hver side, bevarer læserækkefølgen og laver en ren PDF, hvor hvert billede bliver til en side i fuld størrelse.

## Understøttede formater

| Format | Filtypenavn | Noter                                                       |
| :----- | :---------- | :---------------------------------------------------------- |
| CBZ    | `.cbz`      | ZIP-baseret tegneseriearkiv (behandles lokalt med pdf-lib)  |
| CBR    | `.cbr`      | RAR-baseret tegneseriearkiv (behandles via PyMuPDF-motoren) |

CBZ-konverteren genkender JPEG-, PNG-, GIF-, BMP-, WebP-, AVIF-, TIFF-, HEIC- og JXL-billeder i arkivet. Ikke-standardformater konverteres automatisk til PNG, før de indlejres.

## Sådan fungerer det

1. Klik på uploadområdet eller træk og slip dine CBZ- eller CBR-filer. Du kan blande begge formater i en enkelt batch.
2. Gennemgå de viste filer. Fjern dem, du ikke har brug for, eller klik på **Tilføj flere filer** for at tilføje flere.
3. Klik på **Konvertér til PDF**. For CBZ-filer pakker værktøjet arkivet ud, sorterer billedfilerne efter navn i naturlig rækkefølge, registrerer hvert billedes faktiske format og indlejrer dem i en PDF med pdf-lib. CBR-filer sendes i stedet gennem PyMuPDF-motoren.
4. En enkelt fil downloades som en PDF. Flere filer giver et ZIP-arkiv ved navn `comic-converted.zip`.

## Indstillinger

Ingen konfiguration er nødvendig. Hvert billede bliver til en side med samme størrelse som originalen, så dobbeltsider forbliver brede, og enkeltsider forbliver smalle.

## Anvendelser

- Læs tegneserier på en tablet eller i en mobilapp, der understøtter PDF, men ikke CBZ/CBR
- Udskriv bestemte sider fra en digital tegneserie
- Arkivér en tegneseriesamling i et format, som enhver filfremviser kan åbne
- Del en tegneserie med en person, der ikke har en dedikeret tegneserielæser

## Tips

- Billeder i arkivet sorteres i naturlig rækkefølge (så `page2.jpg` kommer før `page10.jpg`). Giv dine filer ensartet nummerering for at få den rigtige siderækkefølge.
- Konverteren registrerer billedformater ud fra deres binære signaturer, ikke filendelser. En PNG, der ved en fejl hedder `.jpg`, indlejres stadig korrekt.
- CBZ-filer behandles helt i browseren uden at indlæse PyMuPDF-motoren, så de konverteres hurtigere end CBR-filer.

## Relaterede værktøjer

- [EPUB til PDF](./epub-to-pdf)
- [MOBI til PDF](./mobi-to-pdf)
- [Billeder til PDF](./image-to-pdf)
