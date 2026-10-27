---
title: Alternér og miks sider
description: Flet PDF'er ved at flette sider fra hver fil ind i skiftevis rækkefølge, med bevarelse af bogmærker.
---

# Alternér og miks sider

Flet sider fra flere PDF-filer, så siderne skifter mellem dokumenterne. Dette er værktøjet, du skal bruge, når en almindelig sammenfletning blot sætter filerne efter hinanden, men du har brug for side 1 fra fil A, derefter side 1 fra fil B, derefter side 2 fra fil A og så videre.

## Sådan fungerer det

1. Upload mindst to PDF-filer i dropzonen.
2. Værktøjet viser hver fil med sideantal og filstørrelse.
3. Træk i grebshåndtagene for at ændre, hvilken fils sider der kommer først i rækkefølgen.
4. Klik på **Miks sider** for at lave det sammenflettede output.
5. Resultatet downloades som `alternated-mixed.pdf`.

## Funktioner

- Fletter sider på tværs af et vilkårligt antal PDF'er (minimum to)
- Omarrangering af filer med træk og slip for at styre sammenfletningens prioritet
- Bevarer bogmærker fra kildedokumenterne
- Viser sideantal og filstørrelse for hver uploadet fil
- Behandler i en dedikeret web worker, så brugerfladen forbliver responsiv

## Anvendelsesområder

- Samle dobbeltsidede scanninger igen, hvor ulige og lige sider er scannet hver for sig
- Kombinere opgaveark med facitlister, så hvert spørgsmål efterfølges af sit svar
- Flette tosprogede dokumenter side for side (f.eks. engelsk på den ene side og oversættelsen på den næste)
- Flette for- og bagsider fra en scanner, der kun scanner enkeltsidet

## Tips

- Hvis dine kilde-PDF'er har forskelligt sideantal, løber det korteste dokument tør for sider først, og de resterende sider fra det længste dokument kommer til sidst.
- Filrækkefølgen har betydning: Den første fil på listen bidrager med outputtets første side. Træk for at omarrangere, hvis det er nødvendigt.

## Relaterede værktøjer

- [Flet PDF](./merge-pdf)
- [Organisér og dupliker](./organize-pdf)
- [Opdel PDF](./split-pdf)
