---
title: Fjern begrænsninger
description: Fjern adgangskodebeskyttelse, udskrivningsbegrænsninger, redigeringslåse og kopieringsgrænser fra PDF-filer.
---

# Fjern begrænsninger

PDF'er kan have to typer adgangskoder: en brugeradgangskode (kræves for at åbne filen) og en ejeradgangskode (styrer, hvad du kan gøre med den). Dette værktøj fjerner begge samt alle tilhørende begrænsninger: udskrivning, redigering, kopiering og annotationslåse.

## Sådan fungerer det

1. Upload en PDF-fil.
2. Hvis PDF'en har en ejeradgangskode, så skriv den i feltet **Ejeradgangskode**. Lad feltet stå tomt, hvis PDF'en kun har brugsbegrænsninger uden adgangskode.
3. Klik på **Fjern begrænsninger**.
4. Download den ubegrænsede PDF.

Værktøjet bruger QPDF's flag `--decrypt` og `--remove-restrictions` til at lave en ren, ubegrænset kopi.

## Hvad der fjernes

- Adgangskodebeskyttelse (både bruger- og ejeradgangskoder)
- Udskrivningsbegrænsninger
- Redigeringsbegrænsninger
- Begrænsninger for kopiering af tekst og billeder
- Begrænsninger for annotering og kommentarer
- Alle andre sikkerhedsbegrænsninger, der er kodet i PDF'en

## Anvendelsesmuligheder

- Låse en PDF op, som du ejer, men hvis adgangskode du satte for år tilbage
- Fjerne udskrivningsbegrænsninger fra et dokument, du har legitim adgang til
- Aktivere kopiér-og-indsæt i opslagsmateriale til notetagning
- Forberede PDF'er til hjælpemidler, der ikke kan håndtere begrænsede dokumenter

## Tips

- Du skal kende ejeradgangskoden, hvis der er sat en. Dette værktøj knækker eller brute-force'r ikke adgangskoder.
- Hvis du vil beholde filen krypteret, men ændre bestemte tilladelser, så brug værktøjet Skift tilladelser i stedet.
- Den resulterende fil har ingen kryptering. Alle, der modtager den, kan åbne den frit.

## Relaterede værktøjer

- [Dekryptér PDF](./unlock-pdf): lås en PDF op, når du kender brugeradgangskoden
- [Kryptér PDF](./protect-pdf): anvend kryptering igen med nye indstillinger
- [Skift tilladelser](./change-permissions): ændr selektivt, hvilke handlinger der er tilladt
