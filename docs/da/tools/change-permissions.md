---
title: Skift tilladelser
description: Angiv eller ændr PDF-brugstilladelser for udskrivning, kopiering, redigering og annotering. Bruger 256-bit AES-kryptering.
---

# Skift tilladelser

Finjustér, hvad modtagerne kan gøre med din PDF. I modsætning til almindelig kryptering, der blot låser filen bag en adgangskode, lader dette værktøj dig selektivt tillade eller afvise udskrivning, kopiering, redigering, annotering, formularudfyldning, dokumentsammensætning og sideudtrækning, alt sammen håndhævet via 256-bit AES-kryptering.

## Sådan fungerer det

1. Upload en PDF-fil.
2. Hvis PDF'en allerede er krypteret, skal du indtaste den **nuværende adgangskode**.
3. Angiv en **ny brugeradgangskode** (kræves for at åbne) og/eller en **ny ejeradgangskode** (styrer tilladelser).
4. Slå de enkelte tilladelser til eller fra med afkrydsningsfelterne.
5. Klik på **Skift tilladelser**.
6. Download den opdaterede PDF.

Hvis du lader begge felter til nye adgangskoder stå tomme, dekrypterer værktøjet PDF'en helt og fjerner al kryptering og alle begrænsninger.

## Tilladelseskontroller

| Tilladelse                       | Hvad den styrer                                        |
| -------------------------------- | ------------------------------------------------------ |
| **Tillad udskrivning**           | Om dokumentet kan udskrives                            |
| **Tillad kopiering**             | Om tekst og billeder kan markeres og kopieres          |
| **Tillad ændring**               | Om dokumentets indhold kan redigeres                   |
| **Tillad annotering**            | Om kommentarer, fremhævninger og stempler kan tilføjes |
| **Tillad formularudfyldning**    | Om interaktive formularfelter kan udfyldes             |
| **Tillad dokumentsammensætning** | Om sider kan indsættes, slettes eller roteres          |
| **Tillad sideudtrækning**        | Om enkelte sider kan udtrækkes                         |

Alle tilladelser kræver en ejeradgangskode for at blive håndhævet. Uden en ejeradgangskode ignoreres tilladelsesflagene af de fleste PDF-læsere.

## Sådan fungerer tilladelser i PDF

PDF-tilladelser er en del af krypteringsspecifikationen. De gemmes som bitflag i krypteringsordbogen og håndhæves af kompatible PDF-læsere. Den vigtige forskel:

- **Brugeradgangskode**: Kræves for overhovedet at åbne filen.
- **Ejeradgangskode**: Kræves for at ændre tilladelser eller fjerne begrænsninger. Uden den styrer tilladelsesflagene, hvilke handlinger brugeren kan udføre.

Hvis du kun angiver en ejeradgangskode (ingen brugeradgangskode), kan alle åbne filen, men de er begrænset til de tilladte handlinger. Hvis du angiver begge, kræver filen en adgangskode for at åbnes og er begrænset efter godkendelse.

## Anvendelser

- Distribuér en rapport, der kan ses og udskrives, men ikke redigeres eller kopieres
- Del en kontraktskabelon, som modtagerne kan udfylde, men ikke ændre
- Udgiv et PDF-katalog, hvor kopiering af billeder er deaktiveret
- Tillad annotering af et udkast til gennemgang, mens strukturelle ændringer forhindres

## Tips

- For at det virker, skal du altid angive en ejeradgangskode. Tilladelser uden ejeradgangskode kan ikke håndhæves.
- Nogle tredjeparts PDF-værktøjer ignorerer tilladelsesflag. For stærkere beskyttelse kan du overveje at rasterisere PDF'en eller bruge DRM.
- Brug dette værktøj til at opgradere gamle RC4-krypterede PDF'er til AES-256.

## Relaterede værktøjer

- [Kryptér PDF](./protect-pdf): enkel adgangskodebeskyttelse uden detaljerede tilladelser
- [Dekryptér PDF](./unlock-pdf): fjern kryptering helt
- [Fjern begrænsninger](./remove-restrictions): fjern alle begrænsninger, når du har ejeradgangskoden
