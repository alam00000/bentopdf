---
title: Striedavo spojiť a zmiešať strany
description: Spojte PDF prekladaním strán z jednotlivých súborov v striedavom poradí so zachovaním záložiek.
---

# Striedavo spojiť a zmiešať strany

Prekladajte strany z viacerých PDF súborov tak, aby sa strany jednotlivých dokumentov striedali. Po tomto nástroji siahnete, keď by bežné spojenie súbory len pripojilo za seba, ale vy potrebujete stranu 1 zo súboru A, potom stranu 1 zo súboru B, potom stranu 2 zo súboru A a tak ďalej.

## Ako to funguje

1. Nahrajte aspoň dva PDF súbory do oblasti na nahrávanie.
2. Nástroj zobrazí každý súbor s počtom strán a veľkosťou.
3. Potiahnutím za úchyty zmeňte poradie, v ktorom sa strany súborov striedajú.
4. Kliknutím na **Zmiešať strany** vytvoríte prekladaný výstup.
5. Výsledok sa stiahne ako `alternated-mixed.pdf`.

## Funkcie

- Prekladá strany z ľubovoľného počtu PDF (minimálne dvoch)
- Zmena poradia súborov pretiahnutím určuje prioritu prekladania
- Zachováva záložky zo zdrojových dokumentov
- Zobrazuje počet strán a veľkosť každého nahraného súboru
- Spracúva sa v samostatnom web workeri, takže rozhranie zostáva svižné

## Prípady použitia

- Opätovné zostavenie obojstranných skenov, kde boli nepárne a párne strany skenované zvlášť
- Spojenie zadaní s kľúčom odpovedí, aby po každej otázke nasledovala jej odpoveď
- Spojenie dvojjazyčných dokumentov strana po strane (napr. angličtina na jednej strane, preklad na ďalšej)
- Prekladanie predných a zadných skenov z jednostranného skenera

## Tipy

- Ak majú zdrojové PDF rôzny počet strán, strany kratšieho dokumentu sa minú skôr a zvyšné strany dlhšieho dokumentu sa zobrazia na konci.
- Na poradí súborov záleží: prvý súbor v zozname poskytne prvú stranu výstupu. V prípade potreby poradie zmeňte pretiahnutím.

## Súvisiace nástroje

- [Spojiť PDF](./merge-pdf)
- [Usporiadať a duplikovať](./organize-pdf)
- [Rozdeliť PDF](./split-pdf)
