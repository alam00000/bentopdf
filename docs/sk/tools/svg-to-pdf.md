---
title: SVG do PDF
description: Preveďte vektorovú grafiku SVG do PDF s ovládaním kvality, celé vo vašom prehliadači.
---

# SVG do PDF

Preveďte súbory Scalable Vector Graphics (SVG) do PDF. Nástroj rastruje každé SVG pomocou vykresľovacieho enginu prehliadača a výsledok vloží v jeho pôvodnom rozlíšení. Užitočné na premenu vektorových ikon, diagramov a ilustrácií na prenosné dokumenty.

## Podporované formáty

| Formát | Prípony |
| :----- | :------ |
| SVG    | `.svg`  |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite jeden či viac súborov SVG.
2. Skontrolujte a spravujte zoznam súborov.
3. Vyberte úroveň **Kvalita PDF**.
4. Kliknite na **Previesť do PDF**. Výsledok sa stiahne ako `from_svgs.pdf`.

Každé SVG sa načíta ako text, vykreslí sa na plátno v jeho vlastnej šírke a výške (predvolene 800x600, ak nie sú zadané rozmery) a exportuje sa ako PNG. Toto PNG sa potom vloží do PDF pomocou pdf-lib. Priehľadné oblasti sa vyplnia bielym pozadím.

## Možnosti

**Kvalita PDF** určuje kompresiu po rastrovaní:

- **Vysoká kvalita**: najbližšie k pôvodnému vykresleniu.
- **Stredná kvalita** (predvolené): dobrá rovnováha.
- **Nízka kvalita**: najmenší súbor, určitá strata detailov.

## Prípady použitia

- Prevod architektonických alebo technických diagramov zo SVG do PDF pripraveného na tlač
- Zabalenie sád ikon do referenčného PDF pre dizajnový systém
- Premena vizualizácií dát (D3.js, exporty z knižníc grafov) na PDF pripravené do správ
- Vytvorenie tlačiteľných verzií infografík založených na SVG

## Tipy

- Súbory SVG bez explicitných atribútov `width` a `height` sa vykreslia v rozmere 800x600 pixelov. Pre najlepšie výsledky nastavte rozmery v zdrojovom SVG pred prevodom.
- Zložité SVG s odkazmi na externé písma alebo prepojenými obrázkami sa nemusia vykresliť dokonale. Pre spoľahlivý výstup vložte všetky zdroje priamo do SVG.
- Keďže sa SVG rastruje, PDF bude obsahovať bitmapový obrázok namiesto vektorových ciest. Na skutočný vektorový výstup PDF je potrebný špecializovaný vektorový nástroj.

## Súvisiace nástroje

- [Obrázky do PDF](./image-to-pdf)
- [PNG do PDF](./png-to-pdf)
- [BMP do PDF](./bmp-to-pdf)
