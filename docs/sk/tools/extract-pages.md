---
title: Extrahovať strany
description: Uložte konkrétny rozsah strán z PDF ako nový dokument.
---

# Extrahovať strany

Vytiahnite skupinu strán z PDF a uložte ich ako nový súbor. Pomocou syntaxe rozsahov presne určte, ktoré strany chcete, a nástroj vytvorí čisté PDF obsahujúce iba tieto strany.

## Ako to funguje

1. Nahrajte súbor PDF. Nástroj zobrazí názov súboru, veľkosť a celkový počet strán.
2. Zadajte strany, ktoré chcete extrahovať, pomocou syntaxe rozsahov (napr. `1-5`, `3, 7, 10-12`).
3. Voliteľne zvoľte stiahnutie každého rozsahu ako samostatného PDF v archíve ZIP.
4. Kliknite na tlačidlo spracovania. Extrahované strany sa stiahnu ako nové PDF (alebo ZIP).

## Funkcie

- Flexibilná syntax rozsahov strán: jednotlivé strany, rozsahy alebo kombinácie oddelené čiarkou
- Po nahraní zobrazí celkový počet strán pre ľahkú orientáciu
- Možnosť výstupu ako jedného spojeného PDF alebo samostatných súborov v ZIP
- Zachováva pôvodný obsah a formátovanie strán

## Prípady použitia

- Vytiahnutie manažérskeho zhrnutia (prvých pár strán) z rozsiahlej správy
- Extrakcia jednej kapitoly z PDF učebnice
- Uloženie konkrétnych strán z balíka formulárov ako samostatných dokumentov
- Vytvorenie ukážkového dokumentu z vybraných strán väčšieho súboru

## Tipy

- Strany sa číslujú od 1. Pre prvú stranu použite `1`, nie `0`.
- Ak chcete strany odstrániť namiesto extrahovania, použite [Odstrániť strany](./delete-pages), čo je opačná operácia.
- Ak potrebujete vizuálny výber strán s náhľadmi, použite [Rozdeliť PDF](./split-pdf) v režime vizuálneho výberu.

## Súvisiace nástroje

- [Rozdeliť PDF](./split-pdf)
- [Odstrániť strany](./delete-pages)
- [Spojiť PDF](./merge-pdf)
