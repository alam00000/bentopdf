---
title: Linearizovať PDF
description: Optimalizujte súbory PDF na rýchle zobrazenie na webe s postupným načítaním. Známe aj ako optimalizácia „Fast Web View“.
---

# Linearizovať PDF

Linearizácia preusporiada PDF tak, aby sa prvá strana zobrazila ešte pred stiahnutím celého súboru. Adobe to nazýva „Fast Web View“. Ak hostujete PDF na webe alebo ich poskytujete cez dokumentový portál, linearizácia výrazne zrýchli ich otváranie.

## Ako to funguje

1. Nahrajte jeden alebo viac súborov PDF.
2. Kliknite na **Linearizovať PDF**.
3. Stiahnite výsledky ako archív ZIP so všetkými linearizovanými súbormi.

Nie je čo nastavovať. Nástroj používa príznak `--linearize` z QPDF, ktorý preusporiada vnútornú štruktúru PDF bez zmeny vizuálneho obsahu.

## Čo linearizácia robí

- Preusporiada objekty PDF tak, aby dáta prvej strany boli na začiatku súboru
- Pridá linearizačný slovník a tabuľky nápovedy, aby prehliadače vedeli, kde nájsť každú stranu
- Umožní požiadavky na rozsah bajtov: prehliadač môže načítať iba prvú stranu bez sťahovania celého súboru
- Upraví tabuľku krížových odkazov pre efektívny náhodný prístup

## Funkcie

- Hromadné spracovanie viacerých PDF v jednej operácii
- Výstup zachová všetok obsah, písma, obrázky a interaktívne prvky
- Používa QPDF (WebAssembly) na spoľahlivú linearizáciu v súlade so štandardmi
- Výsledky sa zabalia do ZIP na jednoduché stiahnutie

## Príklady použitia

- Hostovanie PDF správ na webe, kde používatelia očakávajú okamžité zobrazenie strany
- Vkladanie PDF do webových aplikácií s prehliadačmi v prehliadači
- Publikovanie PDF katalógov alebo príručiek otváraných cez pomalé mobilné pripojenie
- Príprava dokumentov pre siete na doručovanie obsahu (CDN), ktoré podporujú poskytovanie rozsahov bajtov

## Tipy

- Linearizujte až po všetkých ostatných úpravách. Každá ďalšia zmena (spájanie, pridávanie strán) linearizáciu poruší.
- Skombinujte s nástrojom Komprimovať PDF pre čo najmenšie a najrýchlejšie sa načítavajúce PDF.
- Linearizácia mierne zväčší súbor (zvyčajne o menej ako 1 %).

## Súvisiace nástroje

- [Komprimovať PDF](./compress-pdf): zmenšite súbor pred linearizáciou
- [Opraviť PDF](./repair-pdf): opravte štrukturálne problémy, ktoré bránia linearizácii
- [Odstrániť metadáta](./remove-metadata): odstráňte metadáta pred zverejnením online
