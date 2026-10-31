---
title: Fjern metadata
description: Fjern al skjult metadata fra PDF-filer, herunder forfatter, titel, oprettelsesdato, producent, XMP-data og dokument-id'er.
---

# Fjern metadata

Enhver PDF indeholder metadata, der kan afsløre, hvem der har oprettet den, hvilken software der blev brugt, hvornår den sidst blev ændret, og meget mere. Dette værktøj fjerner det hele: info-ordbogen, XMP-metadatastrømme, dokument-id'er og programspecifikke data, så du står tilbage med et rent dokument uden spor af oprindelsen.

## Sådan fungerer det

1. Upload en PDF-fil.
2. Klik på **Fjern metadata**.
3. Download den rensede fil.

Ingen indstillinger at konfigurere. Værktøjet er grundigt af design: det rydder alt.

## Hvad der fjernes

- **Felter i info-ordbogen**: Titel, Forfatter, Emne, Nøgleord, Opretter, Producent, oprettelsesdato, ændringsdato
- **XMP-metadatastrøm**: Den XML-baserede metadatablok i dokumentkataloget
- **Dokument-id'er**: Unikke identifikatorer i PDF-trailer, som kan bruges til at spore et dokument på tværs af systemer
- **PieceInfo**: Programspecifik metadata tilføjet af programmer som Illustrator eller InDesign

## Hvad der bevares

- Alt synligt sideindhold (tekst, billeder, grafik)
- Formularfelter og annotationer
- Bogmærker og links
- Selve dokumentstrukturen

## Anvendelsesmuligheder

- Fjerne dit navn og din organisation fra et dokument, før det udgives anonymt
- Fjerne oprettelsestidsstempler, der afslører, hvornår et dokument blev udarbejdet
- Rydde producentstrenge, der afslører din PDF-softwarestak
- Forberede dokumenter til myndighedsindberetninger, der kræver PDF'er uden metadata
- Fjerne spor af redigeringshistorik, før et dokument deles eksternt

## Tips

- Brug først værktøjet Vis metadata til at se præcis, hvilken metadata din PDF indeholder, før du fjerner den.
- Hvis du skal fjerne metadata _og_ JavaScript, annotationer og indlejrede filer, så brug Rens PDF til en grundigere rensning.
- Fjernelse af metadata er permanent. Behold din original, hvis du senere kan få brug for dataene.

## Relaterede værktøjer

- [Rens PDF](./sanitize-pdf): fjern metadata samt scripts, vedhæftninger og mere
- [Kryptér PDF](./protect-pdf): beskyt den rensede PDF med en adgangskode
- [Komprimer PDF](./compress-pdf): fjernelse af metadata kan reducere filstørrelsen en smule, komprimer for større besparelser
