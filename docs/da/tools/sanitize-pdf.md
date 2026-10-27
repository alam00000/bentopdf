---
title: Rens PDF
description: Fjern skjult og potentielt farligt indhold fra PDF'er, herunder metadata, JavaScript, indlejrede filer, annotationer og lag.
---

# Rens PDF

PDF'er kan indeholde langt mere, end du ser på skærmen. Skjult metadata, indlejret JavaScript, filvedhæftninger, formulardata og laginformation kan lække følsomme data eller udgøre sikkerhedsrisici. Rensning fjerner det hele, så du står tilbage med et rent dokument, der er sikkert at dele offentligt.

## Sådan fungerer det

1. Upload en PDF-fil.
2. Vælg på tjeklisten, hvilke elementer der skal fjernes.
3. Klik på **Rens PDF**.
4. Download den rensede fil.

## Rensningsindstillinger

Alle indstillinger er aktiveret som standard. Fjern markeringen ved dem, du vil bevare.

| Indstilling                | Hvad den fjerner                                                           |
| -------------------------- | -------------------------------------------------------------------------- |
| **Flad formularer ud**     | Gør interaktive formularfelter til statisk indhold                         |
| **Fjern metadata**         | Fjerner forfatter, titel, oprettelsesdato, softwareoplysninger og XMP-data |
| **Fjern annotationer**     | Sletter kommentarer, fremhævninger, klæbenoter og markeringer              |
| **Fjern JavaScript**       | Fjerner indlejrede scripts, der kan køre ved åbning                        |
| **Fjern indlejrede filer** | Fjerner filvedhæftninger, der er indlejret i PDF'en                        |
| **Fjern lag (OCG)**        | Flader valgfrie indholdsgrupper ud til ét lag                              |
| **Fjern links**            | Fjerner hyperlinks og URL-referencer                                       |
| **Fjern strukturtræ**      | Fjerner dokumentstrukturen, der bruges til tilgængelighedsmærkning         |
| **Fjern MarkInfo**         | Fjerner oplysninger om markeret indhold                                    |
| **Fjern skrifttyper**      | Fjerner indlejrede skrifttypedata (brug med forsigtighed)                  |

## Anvendelsesmuligheder

- Forberede en PDF til offentlig udgivelse ved at fjerne intern metadata (forfatternavne, softwareversioner, redigeringshistorik)
- Fjerne JavaScript fra en PDF fra en upålidelig kilde, før du åbner den
- Rydde op i en PDF, før den sendes til en kunde, som ikke skal se indlejrede kommentarer eller formularfeltnavne
- Fjerne skjulte lag fra en arkitekttegning, før den endelige version deles
- Overholde krav om dataminimering i databeskyttelsesreglerne

## Tips

- Lad "Fjern skrifttyper" stå umarkeret, medmindre du er sikker på, at PDF'en stadig vises korrekt. Fjernelse af skrifttyper kan gøre tekst usynlig i nogle læsere.
- Hvis du kun skal fjerne metadata, er det dedikerede værktøj Fjern metadata hurtigere og mere fokuseret.
- Rensning kan ikke fortrydes. Behold din originale fil.

## Relaterede værktøjer

- [Fjern metadata](./remove-metadata): fjern kun metadata uden at røre andet indhold
- [Fladgør PDF](./flatten-pdf): flad specifikt formularer og annotationer ud
- [Kryptér PDF](./protect-pdf): tilføj adgangskodebeskyttelse efter rensning
- [Rasterisér PDF](./rasterize-pdf): den drastiske løsning: konvertér til billeder for at fjerne alt skjult indhold
