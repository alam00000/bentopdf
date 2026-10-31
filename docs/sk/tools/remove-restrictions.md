---
title: Odstrániť obmedzenia
description: Odstráňte zo súborov PDF ochranu heslom, obmedzenia tlače, zámky úprav a obmedzenia kopírovania.
---

# Odstrániť obmedzenia

PDF môžu mať dva typy hesiel: heslo používateľa (potrebné na otvorenie súboru) a heslo vlastníka (určuje, čo s ním môžete robiť). Tento nástroj odstráni obe spolu so všetkými súvisiacimi obmedzeniami: zámkami tlače, úprav, kopírovania a anotácií.

## Ako to funguje

1. Nahrajte súbor PDF.
2. Ak má PDF heslo vlastníka, zadajte ho do poľa **Heslo vlastníka**. Ak má PDF len obmedzenia používania bez hesla, nechajte ho prázdne.
3. Kliknite na **Odstrániť obmedzenia**.
4. Stiahnite PDF bez obmedzení.

Nástroj používa prepínače QPDF `--decrypt` a `--remove-restrictions` na vytvorenie čistej kópie bez obmedzení.

## Čo sa odstráni

- Ochrana heslom (heslo používateľa aj vlastníka)
- Obmedzenia tlače
- Obmedzenia úprav
- Obmedzenia kopírovania textu a obrázkov
- Obmedzenia anotácií a komentovania
- Všetky ostatné bezpečnostné obmedzenia zakódované v PDF

## Prípady použitia

- Odomknutie PDF, ktoré vlastníte, ale heslo ste nastavili pred rokmi
- Odstránenie obmedzení tlače z dokumentu, ku ktorému máte oprávnený prístup
- Povolenie kopírovania a vkladania z referenčných materiálov na robenie poznámok
- Príprava PDF pre nástroje prístupnosti, ktoré nevedia pracovať s obmedzenými dokumentmi

## Tipy

- Ak je nastavené heslo vlastníka, musíte ho poznať. Tento nástroj heslá neprelamuje ani neskúša hrubou silou.
- Ak potrebujete súbor ponechať zašifrovaný, ale zmeniť konkrétne oprávnenia, použite namiesto toho nástroj Zmeniť oprávnenia.
- Výstupný súbor nemá žiadne šifrovanie: ktokoľvek, kto ho dostane, ho môže voľne otvoriť.

## Súvisiace nástroje

- [Dešifrovať PDF](./unlock-pdf): odomknutie PDF, keď poznáte heslo používateľa
- [Zašifrovať PDF](./protect-pdf): opätovné použitie šifrovania s novými nastaveniami
- [Zmeniť oprávnenia](./change-permissions): selektívna úprava povolených akcií
