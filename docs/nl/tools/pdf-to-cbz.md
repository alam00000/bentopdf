---
title: PDF naar CBZ
description: Zet een PDF om naar een CBZ-bestand (Comic Book Archive) voor stripreaders zoals Komga, Kavita, CDisplayEx en Calibre.
---

# PDF naar CBZ

Zet een PDF om naar een CBZ-bestand (Comic Book ZIP), het standaardformaat voor digitale strips en manga. Elke PDF-pagina wordt een afbeelding in het archief. De tool genereert metadata in drie formaten voor maximale compatibiliteit: ComicInfo.xml, metadata.opf en ComicBookInfo JSON.

## Hoe het werkt

1. Upload een PDF door op het neerzetgebied te klikken of een bestand erheen te slepen.
2. Kies afbeeldingsformaat, kwaliteit, schaal en optionele metadata.
3. Klik op **Converteren** om het CBZ-bestand te genereren.
4. Het `.cbz`-bestand wordt automatisch gedownload.

## Opties

| Optie              | Waarden         | Standaard | Beschrijving                                                                                   |
| ------------------ | --------------- | --------- | ---------------------------------------------------------------------------------------------- |
| Afbeeldingsformaat | JPEG, PNG, WebP | JPEG      | JPEG voor kleurenstrips, PNG voor verliesvrije zwart-wit manga, WebP voor de beste compressie. |
| Kwaliteit          | 50–100%         | 85%       | Bepaalt de JPEG/WebP-compressie. Verborgen voor PNG (altijd verliesvrij).                      |
| Schaal             | 1.0x–4.0x       | 2.0x      | Een hogere schaal geeft scherpere afbeeldingen voor schermen met hoge resolutie.               |
| Grijswaarden       | Aan/Uit         | Uit       | Zet pagina's om naar grijswaarden. Verkleint het bestand bij zwart-wit inhoud.                 |
| Manga-modus        | Aan/Uit         | Uit       | Stelt in de metadata de leesrichting van rechts naar links in.                                 |
| Metadata opnemen   | Aan/Uit         | Aan       | Sluit ComicInfo.xml, metadata.opf en ComicBookInfo JSON in.                                    |

## Metadatavelden

Als metadata is ingeschakeld, kun je invullen:

- **Titel**: automatisch herkend uit de PDF-bestandsnaam.
- **Serie**: de naam van de serie (bijv. "Naruto").
- **Nummer (#)**: deelnummer binnen de serie.
- **Volume (Vol.)**: volumenummer.
- **Auteur(s)**: naam van de schrijver of maker.
- **Uitgever**: uitgeverij.
- **Labels / Genre**: tags gescheiden door komma's (bijv. "Actie, Avontuur").
- **Publicatiejaar**: jaar van publicatie (1900–2100).
- **Beoordeling**: beoordeling door de community van 0 tot 5.

## Metadatacompatibiliteit

De tool schrijft metadata in drie formaten zodat elke reader ze kan vinden:

| Formaat            | Locatie             | Ondersteund door                            |
| ------------------ | ------------------- | ------------------------------------------- |
| ComicInfo.xml      | Bestand in de ZIP   | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Bestand in de ZIP   | Calibre                                     |
| ComicBookInfo JSON | ZIP-opmerkingenveld | Calibre (terugvaloptie)                     |

## Uitvoerformaat

- `filename.cbz`: een ZIP-archief met genummerde pagina-afbeeldingen en metadatabestanden.

Pagina-afbeeldingen krijgen namen met nullen aangevuld (`01.jpg`, `02.jpg`, enz.) zodat readers ze in de juiste volgorde tonen.

## Toepassingen

- Manga- of strip-PDF's omzetten voor gebruik met stripreaders.
- Een digitale stripbibliotheek opbouwen in Komga, Kavita of Calibre.
- Gescande stripboeken omzetten naar een formaat dat prettig leest in een reader.
- Strips delen in een formaat dat leesrichting en metadata behoudt.

## Tips

- Gebruik **JPEG** voor kleurenstrips en **PNG** voor zwart-wit manga: PNG comprimeert zwart-wit inhoud heel efficiënt.
- Schakel **Grijswaarden** in voor manga om de bestandsgrootte aanzienlijk te verkleinen.
- Vul de velden **Serie** en **Nummer** in zodat bibliotheekbeheerders (Komga, Calibre) je verzameling automatisch kunnen ordenen.
- **WebP** biedt de beste compressie, maar oudere stripreaders ondersteunen het mogelijk niet.

## Gerelateerde tools

- [PDF naar JPG](./pdf-to-jpg)
- [PDF naar PNG](./pdf-to-png)
- [PDF naar TIFF](./pdf-to-tiff)
- [Afbeeldingen extraheren](./extract-images)
