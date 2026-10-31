---
title: PDF OCG
description: Vis, skift, tilføj og slet OCG-lag (Optional Content Group) i et PDF-dokument.
---

# PDF OCG-lag

Administrér de valgfrie indholdsgrupper (OCG), som ofte kaldes "lag", i en PDF. Du kan skifte lags synlighed, tilføje nye lag (også indlejrede underlag), slette lag og gemme den ændrede PDF.

## Sådan fungerer det

1. Upload en PDF-fil.
2. Klik på procesknappen for at indlæse dokumentet med PyMuPDF-motoren.
3. Værktøjet viser alle eksisterende lag med deres synlighedstilstand, låsestatus og indlejringshierarki.
4. Slå afkrydsningsfelter til eller fra for at vise eller skjule lag. Låste lag kan ikke skiftes.
5. Tilføj nye lag på øverste niveau ved at skrive et navn og klikke på tilføjknappen, eller tilføj underlag under et eksisterende overordnet lag.
6. Slet lag, du ikke længere har brug for.
7. Klik på **Gem** for at downloade den ændrede PDF med dine lagændringer anvendt.

## Funktioner

- Viser lagets hierarki med korrekt indrykning for indlejrede lag
- Slå lags synlighed til eller fra
- Indikator for låste lag forhindrer utilsigtede ændringer
- Tilføj lag på øverste niveau eller underlag med brugerdefinerede navne
- Slet enkelte lag
- Gemmer alle ændringer i en ny PDF-fil

## Anvendelser

- Skifte synligheden af markeringslag i arkitekt- eller ingeniørtegninger
- Tilføje nye annotationslag til et designdokument med flere lag
- Fjerne forældede lag fra en skabelon, før den distribueres
- Undersøge, hvilke lag der findes i en kompleks PDF modtaget fra en tredjepart

## Tips

- Hvis PDF'en ikke har nogen lag, viser værktøjet en tom tilstand med en opfordring til at tilføje et. Ikke alle PDF-filer bruger OCG-lag. De er mest almindelige i CAD-eksporter og designfiler.
- Underlag er visuelt indrykket under deres overordnede lag. Du kan indlejre lag i vilkårlig dybde.
- Låste lag vises med et låseikon, og deres afkrydsningsfelter er deaktiverede. Disse låse er sat af PDF'ens skaber.

## Relaterede værktøjer

- [Vis metadata](./view-metadata)
- [Redigér metadata](./edit-metadata)
- [Duplikér og organisér](./organize-pdf)
