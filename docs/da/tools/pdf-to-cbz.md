---
title: PDF til CBZ
description: Konvertér en PDF til en CBZ-fil (Comic Book Archive) til tegneserielæsere som Komga, Kavita, CDisplayEx og Calibre.
---

# PDF til CBZ

Konverterer en PDF til en CBZ-fil (Comic Book ZIP), standardformatet til digitale tegneserier og manga. Hver PDF-side bliver til et billede i arkivet. Værktøjet genererer metadata i tre formater for maksimal kompatibilitet: ComicInfo.xml, metadata.opf og ComicBookInfo JSON.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipområdet eller trække en fil hen på det.
2. Vælg billedformat, kvalitet, skala og valgfri metadata.
3. Klik på **Konvertér** for at generere CBZ-filen.
4. `.cbz`-filen downloades automatisk.

## Indstillinger

| Indstilling     | Værdier         | Standard | Beskrivelse                                                                              |
| --------------- | --------------- | -------- | ---------------------------------------------------------------------------------------- |
| Billedformat    | JPEG, PNG, WebP | JPEG     | JPEG til farvetegneserier, PNG til tabsfri sort-hvid manga, WebP til bedst komprimering. |
| Kvalitet        | 50–100%         | 85%      | Styrer JPEG/WebP-komprimering. Skjult for PNG (altid tabsfri).                           |
| Skala           | 1.0x–4.0x       | 2.0x     | Højere skala giver skarpere billeder til skærme med høj opløsning.                       |
| Gråtoner        | Til/Fra         | Fra      | Konverterer sider til gråtoner. Reducerer filstørrelsen for sort-hvidt indhold.          |
| Manga-tilstand  | Til/Fra         | Fra      | Sætter læseretningen til højre mod venstre i metadata.                                   |
| Medtag metadata | Til/Fra         | Til      | Indlejrer ComicInfo.xml, metadata.opf og ComicBookInfo JSON.                             |

## Metadatafelter

Når metadata er aktiveret, kan du udfylde:

- **Titel**: Registreres automatisk fra PDF'ens filnavn.
- **Serie**: Seriens navn (f.eks. "Naruto").
- **Nummer (#)**: Udgavenummer i serien.
- **Bind (Vol.)**: Bindnummer.
- **Forfatter(e)**: Navn på forfatter eller skaber.
- **Forlag**: Udgivende virksomhed.
- **Tags / Genre**: Kommaseparerede tags (f.eks. "Action, Eventyr").
- **Udgivelsesår**: Udgivelsesår (1900–2100).
- **Vurdering**: Fællesskabets vurdering fra 0 til 5.

## Metadatakompatibilitet

Værktøjet skriver metadata i tre formater, så alle læsere kan finde dem:

| Format             | Placering         | Understøttes af                             |
| ------------------ | ----------------- | ------------------------------------------- |
| ComicInfo.xml      | Fil i ZIP-filen   | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Fil i ZIP-filen   | Calibre                                     |
| ComicBookInfo JSON | ZIP-kommentarfelt | Calibre (reserve)                           |

## Outputformat

- `filename.cbz`: Et ZIP-arkiv med nummererede sidebilleder og metadatafiler.

Sidebillederne navngives med nuludfyldte tal (`01.jpg`, `02.jpg` osv.), så læserne viser dem i den rigtige rækkefølge.

## Anvendelser

- Konvertere manga- eller tegneserie-PDF'er til brug i tegneserielæsere.
- Bygge et digitalt tegneseriebibliotek i Komga, Kavita eller Calibre.
- Konvertere scannede tegneserier til et læservenligt format.
- Dele tegneserier i et format, der bevarer læseretning og metadata.

## Tips

- Brug **JPEG** til farvetegneserier og **PNG** til sort-hvid manga. PNG komprimerer sort-hvidt indhold meget effektivt.
- Aktivér **Gråtoner** til manga for at reducere filstørrelsen betydeligt.
- Udfyld felterne **Serie** og **Nummer**, så biblioteksadministratorer (Komga, Calibre) kan organisere din samling automatisk.
- **WebP** giver den bedste komprimering, men ældre tegneserielæsere understøtter det måske ikke.

## Relaterede værktøjer

- [PDF til JPG](./pdf-to-jpg)
- [PDF til PNG](./pdf-to-png)
- [PDF til TIFF](./pdf-to-tiff)
- [Udtræk billeder](./extract-images)
