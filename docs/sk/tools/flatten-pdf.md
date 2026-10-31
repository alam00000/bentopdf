---
title: Sploštiť PDF
description: Zlúčte interaktívne formuláre a anotácie do statického obsahu. Polia formulára už nebude možné upravovať a anotácie sa vpália do strany.
---

# Sploštiť PDF

Zlúčenie vrstiev vloží interaktívne prvky (polia formulára, rozbaľovacie zoznamy, zaškrtávacie políčka, anotácie, zvýraznenia, poznámky) priamo do obsahu strany. Vzhľad zostane rovnaký, no nič už nebude možné upravovať ani extrahovať. Je to ekvivalent vytlačenia vyplneného formulára a jeho opätovného naskenovania, len s dokonalou kvalitou.

## Ako to funguje

1. Nahrajte jeden alebo viac súborov PDF.
2. Kliknite na **Zlúčiť vrstvy PDF**.
3. Jeden súbor sa stiahne priamo. Viac súborov vytvorí archív ZIP.

Nástroj používa pdf-lib na zlúčenie polí formulára (cez `form.flatten()`) a samostatný nástroj na vpálenie anotácií do obsahu strany. Obe operácie prebehnú v jednom kroku.

## Čo sa zlúči

- **Polia formulára**: Textové polia, zaškrtávacie políčka, prepínače, rozbaľovacie zoznamy, podpisové polia
- **Anotácie**: Komentáre, zvýraznenia, preškrtnutia, podčiarknutia, poznámky, pečiatky, kresby
- **Interaktívne prvky**: Tlačidlá, spúšťače akcií

## Čo zostane nezmenené

- Textový obsah (zostane označiteľný a vyhľadávateľný)
- Obrázky a grafika
- Rozloženie a rozmery strán
- Záložky a obsah
- Hypertextové odkazy (pokiaľ nie sú založené na anotáciách)

## Príklady použitia

- Uzamknutie vyplneného formulára, aby príjemcovia nemohli meniť odoslané odpovede
- Príprava PDF na archiváciu, keď interaktívne prvky nie sú potrebné
- Oprava problémov so zobrazením, keď sa anotácie v rôznych prehliadačoch vykresľujú inak
- Zabezpečenie, aby podpísaný dokument nebolo možné po podpise upraviť
- Zmenšenie súboru odstránením definícií polí formulára a objektov anotácií

## Tipy

- Vrstvy zlúčte až po dokončení všetkých úprav. Zlúčenie sa nedá vrátiť.
- Ak potrebujete zlúčiť vrstvy a zároveň odstrániť metadáta, JavaScript a prílohy, použite radšej nástroj Vyčistiť PDF, ktorý zlúčenie ponúka ako jednu z možností.
- Niektoré PDF hlásia „formulár sa nenašiel“. Je to normálne, ak dokument obsahuje iba anotácie a žiadne polia formulára.

## Súvisiace nástroje

- [Vyčistiť PDF](./sanitize-pdf): zlúčenie formulárov plus odstránenie metadát, skriptov a ďalšieho
- [Rastrovať PDF](./rasterize-pdf): prevod na obrázkové PDF pre maximálne zlúčenie
- [Písma do kriviek](./font-to-outline): prevod písiem na vektorové cesty
- [Zašifrovať PDF](./protect-pdf): uzamknite zlúčené PDF heslom
