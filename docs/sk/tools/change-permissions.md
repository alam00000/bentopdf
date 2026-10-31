---
title: Zmeniť oprávnenia
description: Nastavte alebo upravte oprávnenia PDF na tlač, kopírovanie, úpravy a anotácie. Používa 256-bitové šifrovanie AES.
---

# Zmeniť oprávnenia

Presne určte, čo môžu príjemcovia s vaším PDF robiť. Na rozdiel od základného šifrovania, ktoré súbor len zamkne heslom, vám tento nástroj umožní selektívne povoliť alebo zakázať tlač, kopírovanie, úpravy, anotácie, vypĺňanie formulárov, zostavovanie dokumentu a extrakciu strán, pričom všetko je vynútené 256-bitovým šifrovaním AES.

## Ako to funguje

1. Nahrajte súbor PDF.
2. Ak je PDF už zašifrované, zadajte **Aktuálne heslo**.
3. Nastavte **Nové heslo používateľa** (potrebné na otvorenie) a/alebo **Nové heslo vlastníka** (riadi oprávnenia).
4. Jednotlivé oprávnenia zapnite alebo vypnite pomocou začiarkavacích políčok.
5. Kliknite na **Zmeniť oprávnenia**.
6. Stiahnite upravené PDF.

Ak obe polia pre nové heslá necháte prázdne, nástroj PDF úplne dešifruje a odstráni všetko šifrovanie a obmedzenia.

## Ovládanie oprávnení

| Oprávnenie                         | Čo riadi                                               |
| ---------------------------------- | ------------------------------------------------------ |
| **Povoliť tlač**                   | Či je možné dokument vytlačiť                          |
| **Povoliť kopírovanie**            | Či je možné vyberať a kopírovať text a obrázky         |
| **Povoliť úpravy**                 | Či je možné upravovať obsah dokumentu                  |
| **Povoliť anotácie**               | Či je možné pridávať komentáre, zvýraznenia a pečiatky |
| **Povoliť vypĺňanie formulárov**   | Či je možné vypĺňať interaktívne polia formulára       |
| **Povoliť zostavovanie dokumentu** | Či je možné vkladať, odstraňovať alebo otáčať strany   |
| **Povoliť extrakciu strán**        | Či je možné extrahovať jednotlivé strany               |

Na vynútenie všetkých oprávnení je potrebné heslo vlastníka. Bez hesla vlastníka väčšina čítačiek PDF príznaky oprávnení ignoruje.

## Ako fungujú oprávnenia v PDF

Oprávnenia PDF sú súčasťou špecifikácie šifrovania. Ukladajú sa ako bitové príznaky v šifrovacom slovníku a vynucujú ich čítačky PDF, ktoré dodržiavajú štandard. Kľúčový rozdiel:

- **Heslo používateľa**: potrebné na samotné otvorenie súboru.
- **Heslo vlastníka**: potrebné na zmenu oprávnení alebo odstránenie obmedzení. Bez neho príznaky oprávnení určujú, aké operácie môže používateľ vykonávať.

Ak nastavíte iba heslo vlastníka (bez hesla používateľa), súbor môže otvoriť ktokoľvek, no je obmedzený na povolené operácie. Ak nastavíte obe, súbor na otvorenie vyžaduje heslo a po overení je obmedzený.

## Prípady použitia

- Distribúcia správy, ktorú je možné zobraziť a vytlačiť, ale nie upravovať či kopírovať
- Zdieľanie šablóny zmluvy, ktorú môžu príjemcovia vyplniť, ale nie upraviť
- Zverejnenie PDF katalógu so zakázaným kopírovaním obrázkov
- Povolenie anotácií v koncepte na pripomienkovanie pri zabránení štrukturálnym zmenám

## Tipy

- Aby boli oprávnenia účinné, vždy nastavte heslo vlastníka. Oprávnenia bez hesla vlastníka sa nedajú vynútiť.
- Niektoré nástroje PDF tretích strán príznaky oprávnení ignorujú. Pre silnejšiu ochranu zvážte rastrovanie PDF alebo použitie DRM.
- Týmto nástrojom môžete aktualizovať staré PDF šifrované RC4 na AES-256.

## Súvisiace nástroje

- [Zašifrovať PDF](./protect-pdf): jednoduchá ochrana heslom bez podrobných oprávnení
- [Dešifrovať PDF](./unlock-pdf): úplné odstránenie šifrovania
- [Odstrániť obmedzenia](./remove-restrictions): odstránenie všetkých obmedzení, keď máte heslo vlastníka
