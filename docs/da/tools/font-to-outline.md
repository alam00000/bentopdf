---
title: Skrifttype til kontur
description: Konvertér alle skrifttyper i en PDF til vektorkonturer for ensartet gengivelse på tværs af enheder. Eliminerer problemer med skrifttypeafhængighed.
---

# Skrifttype til kontur

Når skrifttyper konverteres til konturer, omdannes hvert tekstbogstav fra en skrifttypebaseret glyf til en vektorsti. PDF'en afhænger ikke længere af installerede skrifttyper og gengives ens på alle enheder, alle operativsystemer og alle printere. Det er et standardtrin i prepress-arbejdsgange.

## Sådan fungerer det

1. Upload en eller flere PDF-filer.
2. Klik på **Konvertér til konturer**.
3. Ghostscript konverterer al tekst til vektorstier.
4. Download resultatet. Flere filer giver et ZIP-arkiv.

Der er ingen indstillinger at konfigurere. Værktøjet bruger Ghostscript (WebAssembly) til at konvertere alle skrifttypereferencer til konturstier i ét gennemløb.

## Hvad der ændres

- Tekstbogstaver bliver til vektorkurver (bézier-stier)
- Indlejring af skrifttyper er ikke længere nødvendig, da PDF'en er selvstændig på glyfniveau
- Filstørrelsen kan stige, fordi vektorstier typisk er større end skrifttypereferencer
- Det visuelle udseende bevares nøjagtigt

## Hvad du mister

- Markering og kopiering af tekst
- Søgbarhed i teksten (Ctrl+F holder op med at virke)
- Muligheden for at redigere tekstindholdet
- Tilgængelighed for skærmlæsere

## Anvendelsesområder

- Afsendelse af PDF'er til et trykkeri, der kræver skrifttyper i konturer
- Deling af dokumenter med brugerdefinerede eller licenserede skrifttyper med personer, der ikke har disse skrifttyper
- Forebyggelse af skrifttypeudskiftning, der ændrer dit dokuments udseende på andre systemer
- Klargøring af PDF'er til lasergravering eller CNC-skæring, der kræver vektorinput
- Sikring af, at en logotung PDF vises korrekt på alle platforme

## Tips

- Behold din oprindelige PDF. Konvertering til konturer kan ikke fortrydes, og stier kan ikke konverteres tilbage til redigerbar tekst.
- Hvis teksten skal forblive søgbar, kan du i stedet overveje værktøjet Rasterisér PDF efterfulgt af OCR.
- PDF'er med konturer er ofte større. Kør Komprimer PDF bagefter, hvis filstørrelsen er vigtig.

## Relaterede værktøjer

- [Fladgør PDF](./flatten-pdf): flad formularer ud og annotationer uden at røre skrifttyper
- [Rasterisér PDF](./rasterize-pdf): konvertér til billedbaseret PDF i stedet for vektorkonturer
- [Komprimer PDF](./compress-pdf): reducer filstørrelsen efter konvertering til konturer
- [PDF til PDF/A](./pdf-to-pdfa): konvertér til arkivering, når skrifttypeuafhængighed er sikret
