---
title: Lineariser PDF
description: Optimér PDF-filer til hurtig visning på nettet med progressiv indlæsning. Også kendt som "Fast Web View"-optimering.
---

# Lineariser PDF

Linearisering omstrukturerer en PDF, så den første side kan vises, før hele filen er downloadet. Adobe kalder det "Fast Web View". Hvis du hoster PDF'er på et websted eller leverer dem via en dokumentportal, gør linearisering dem mærkbart hurtigere at åbne.

## Sådan fungerer det

1. Upload en eller flere PDF-filer.
2. Klik på **Lineariser PDF(er)**.
3. Download resultaterne som et ZIP-arkiv med alle de lineariserede filer.

Der er ingen indstillinger at konfigurere. Værktøjet bruger QPDF's `--linearize`-flag, som omarrangerer PDF'ens interne struktur uden at ændre det visuelle indhold.

## Hvad linearisering gør

- Omordner PDF-objekter, så den første sides data ligger i begyndelsen af filen
- Tilføjer en lineariseringsordbog og hint-tabeller, så læsere ved, hvor hver side findes
- Muliggør byte-range-forespørgsler: en browser kan hente blot den første side uden at downloade hele filen
- Rydder op i krydsreferencetabellen for effektiv tilfældig adgang

## Funktioner

- Batchbehandling af flere PDF'er i én handling
- Outputtet bevarer alt indhold, alle skrifttyper, billeder og interaktive elementer
- Bruger QPDF (WebAssembly) til pålidelig, standardkompatibel linearisering
- Resultaterne pakkes i en ZIP-fil for nem download

## Anvendelsesområder

- Hosting af PDF-rapporter på et websted, hvor brugerne forventer øjeblikkelig sidevisning
- Indlejring af PDF'er i webapplikationer med viewere i browseren
- Udgivelse af PDF-kataloger eller manualer, der tilgås over langsomme mobilforbindelser
- Klargøring af dokumenter til content delivery networks (CDN'er), der understøtter byte-range-levering

## Tips

- Lineariser, når alle andre redigeringer er færdige. Enhver efterfølgende ændring (sammenfletning, tilføjelse af sider) ødelægger lineariseringen.
- Kombinér med Komprimer PDF for de mindste og hurtigst indlæste PDF'er.
- Linearisering tilføjer en lille ekstra mængde til filstørrelsen (typisk under 1 %).

## Relaterede værktøjer

- [Komprimer PDF](./compress-pdf): reducer filstørrelsen før linearisering
- [Reparér PDF](./repair-pdf): ret strukturelle problemer, der forhindrer linearisering
- [Fjern metadata](./remove-metadata): fjern metadata før udgivelse online
