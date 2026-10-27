---
title: PDF do JPG
description: Prevádzajte strany PDF na obrázky JPG s nastaviteľnou kvalitou. Jednostranové PDF sa stiahnu priamo, viacstranové sa exportujú ako ZIP.
---

# PDF do JPG

Prevedie každú stranu PDF na obrázok JPG. Jednostranové dokumenty sa stiahnu ako samostatný súbor `.jpg`. Viacstranové PDF vytvoria archív ZIP s jedným JPG na každú stranu.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej. Nástroj zobrazí názov súboru, jeho veľkosť a počet strán.
2. Posuvníkom **Kvalita** nastavte kompresiu JPG.
3. Kliknutím na **Previesť** spustíte spracovanie.
4. Výsledok sa stiahne automaticky: jeden JPG pri jednostranovom PDF alebo súbor ZIP pri viacstranových dokumentoch.

## Možnosti

- **Kvalita**: posuvník od 0 % do 100 % (predvolene 90 %). Vyššie hodnoty vytvárajú ostrejšie obrázky s väčšími súbormi. Nižšie hodnoty komprimujú agresívnejšie.

Strany sa interne vykresľujú v mierke 2x, takže výstupné rozlíšenie je dvojnásobkom rozmerov strany PDF. Štandardná strana veľkosti Letter vytvorí obrázok s rozmermi približne 1 224 x 1 584 pixelov.

## Výstupný formát

- **Jedna strana**: `filename.jpg`
- **Viac strán**: `filename_jpgs.zip` obsahujúci `page_1.jpg`, `page_2.jpg` atď.

## Prípady použitia

- Generovanie miniatúr náhľadov pre systém správy dokumentov.
- Zdieľanie strany zo správy v chate alebo e-maile, ktoré nepodporujú PDF.
- Tvorba obrazových podkladov z diagramov alebo ilustrácií v PDF.
- Archivácia naskenovaných dokumentov ako jednotlivých obrázkov.

## Tipy

- Pre bezstratový výstup použite radšej [PDF do PNG](./pdf-to-png).
- Nastavenie kvality 80-90 % predstavuje dobrú rovnováhu medzi veľkosťou súboru a vizuálnou vernosťou.
- Ak potrebujete konkrétny formát pre každú stranu, zvážte [Tvorca pracovných postupov (Workflow) PDF](./pdf-workflow), ktorý má výstupný uzol PDF do obrázkov.

## Súvisiace nástroje

- [PDF do PNG](./pdf-to-png)
- [PDF do WebP](./pdf-to-webp)
- [PDF do BMP](./pdf-to-bmp)
- [PDF do TIFF](./pdf-to-tiff)
