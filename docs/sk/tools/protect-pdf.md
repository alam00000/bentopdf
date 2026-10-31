---
title: Chrániť PDF heslom
description: Chráňte súbory PDF heslom pomocou 256-bitového šifrovania AES. Nastavte heslo používateľa a vlastníka s nastaviteľnými obmedzeniami používania.
---

# Chrániť PDF heslom

Zamknite svoje PDF heslom, aby ho mohli otvoriť len oprávnení ľudia. BentoPDF používa 256-bitové šifrovanie AES (rovnaký štandard, aký používajú banky a štátne inštitúcie), ktoré sa celé aplikuje vo vašom prehliadači pomocou QPDF.

## Ako to funguje

1. Nahrajte súbor PDF.
2. Zadajte **Heslo používateľa** (povinné). Toto heslo budú ľudia potrebovať na otvorenie súboru.
3. Voliteľne zadajte **Heslo vlastníka**. Ak je nastavené, PDF získa obmedzenia používania, ktoré zabránia tlači, úpravám, kopírovaniu a pridávaniu anotácií.
4. Kliknite na **Zašifrovať PDF**.
5. Stiahnite zašifrovaný súbor.

## Typy hesiel

### Heslo používateľa (povinné)

Heslo používateľa zadávajú príjemcovia na otvorenie PDF. Bez neho je dokument úplne neprístupný. Každé zašifrované PDF ho musí mať.

### Heslo vlastníka (voliteľné)

Heslo vlastníka určuje, čo môže oprávnený používateľ robiť po otvorení súboru. Keď nastavíte odlišné heslo vlastníka, BentoPDF automaticky použije najprísnejšiu sadu obmedzení:

- Úpravy zakázané
- Extrakcia/kopírovanie zakázané
- Tlač zakázaná
- Anotácie zakázané
- Vypĺňanie formulárov zakázané
- Zostavovanie dokumentu zakázané

Ak heslo vlastníka necháte prázdne, PDF sa zašifruje (na otvorenie stále vyžaduje heslo používateľa), ale po otvorení nemá žiadne obmedzenia používania.

## Podrobnosti o šifrovaní

- **Algoritmus**: AES-256 (256-bitový Advanced Encryption Standard)
- **Dĺžka kľúča**: 256 bitov
- **Štandard**: šifrovanie PDF 2.0 (implementácia QPDF)

AES-256 sa so súčasnou technológiou nedá prakticky prelomiť hrubou silou. Bezpečnosť vášho zašifrovaného PDF závisí úplne od sily vášho hesla.

## Prípady použitia

- Ochrana dôverných finančných správ pred ich odoslaním e-mailom
- Zabezpečenie právnych dokumentov zdieľaných s protistranou
- Pridanie hesla k zdravotným záznamom alebo osobným údajom
- Distribúcia plateného obsahu (e-knihy, správy) s riadením prístupu
- Dodržiavanie zásad ochrany údajov, ktoré vyžadujú šifrovanie uložených dát

## Tipy

- Používajte silné, jedinečné heslo. Ideálna je prístupová fráza s 12 a viac znakmi, malými aj veľkými písmenami, číslami a symbolmi.
- Heslo zdieľajte iným kanálom (telefón, SMS), nikdy nie v rovnakom e-maile ako PDF.
- Ak potrebujete len obmedziť akcie (bez tlače, bez kopírovania) bez vyžadovania hesla na otvorenie, použite namiesto toho nástroj Zmeniť oprávnenia.

## Súvisiace nástroje

- [Dešifrovať PDF](./unlock-pdf): odstránenie šifrovania, keď poznáte heslo
- [Zmeniť oprávnenia](./change-permissions): úprava konkrétnych obmedzení používania
- [Odstrániť obmedzenia](./remove-restrictions): odstránenie všetkého zabezpečenia z PDF
- [Vyčistiť PDF](./sanitize-pdf): odstránenie skrytého obsahu pred šifrovaním
