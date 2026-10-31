---
title: Usporiadať obojstranné skenovanie
description: Preusporiadajte PDF z obojstranného skenovania, ktoré obsahujú predné a zadné strany v samostatných blokoch, do správneho poradia predná/zadná.
---

# Usporiadať obojstranné skenovanie

Usporiadať obojstranné skenovanie je určené pre skenovanie cez ADF, pri ktorom jedno PDF obsahuje dva bloky strán:

- najprv všetky predné strany
- potom všetky zadné strany

Namiesto ručného rozdeľovania a skladania tento nástroj prekladá oba bloky do prirodzeného poradia čítania: predná1, zadná1, predná2, zadná2 atď.

## Ako to funguje

1. Nahrajte jedno PDF vytvorené obojstranným skenovaním stohu.
2. Nastavte bod rozdelenia, kde končí blok predných strán.
3. Vyberte spracovanie bloku zadných strán:
   - **Obrátiť blok zadných strán** (bežné, keď sa stoh pred skenovaním zadných strán otočí)
   - **Ponechať blok zadných strán bez zmeny**
4. Kliknite na **Usporiadať PDF** a stiahnite preusporiadaný výsledok.

## Možnosti

- **Automaticky určiť rozdelenie (polovica)**: nastaví bod rozdelenia na `ceil(totalPages / 2)`.
- **Upozornenie na nepárny počet strán**: upozorní, keď je celkový počet strán nepárny (často ide o chybu skenovania).
- **Potvrdenie nerovnakých blokov**: vyžiada potvrdenie, keď sa veľkosti predného a zadného bloku líšia.
- **Zoskupený export**: rozdelí usporiadaný výstup na samostatné PDF podľa počtu strán pôvodného dokumentu a stiahne ich ako ZIP.

## Správanie výstupu

- **Predvolené**: jedno výstupné PDF (jedno vstupné PDF dnu, jedno výstupné PDF von).
- **Zoskupený režim**: výstup sa delí podľa zadaného počtu strán na dokument; ak vznikne viac častí, stiahnu sa ako jeden ZIP, inak sa stiahne jedno PDF.

Ak sú bloky nerovnako veľké, najprv sa usporiadajú spárované strany a zostávajúce nespárované strany sa pripoja na koniec.

## Bežné prípady použitia

- Obnovenie poradia po naskenovaní kopy obojstranných formulárov v dvoch prechodoch.
- Zostavenie predných a zadných strán z kancelárskych skenerov, ktoré vytvoria najprv všetky predné a potom všetky zadné strany.
- Dodatočné spracovanie archívnych skenov pred rozdelením na súbory podľa dokumentov.

## Tipy

- Väčšina obojstranných dávok by mala mať párny celkový počet strán.
- Ak zadné strany vo výstupe vyzerajú obrátene, prepnite medzi **Obrátiť blok zadných strán** a **Ponechať blok zadných strán bez zmeny**.
- Pri dvojstranových origináloch (predná + zadná) použite zoskupený export s `2` stranami na dokument.

## Súvisiace nástroje

- [Striedavo spojiť a zmiešať strany](./alternate-merge)
- [Rozdeliť PDF](./split-pdf)
- [Spojiť PDF](./merge-pdf)
- [Usporiadať a duplikovať](./organize-pdf)
