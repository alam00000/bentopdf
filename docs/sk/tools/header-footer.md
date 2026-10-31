---
title: Hlavička a pätička
description: Pridajte na strany PDF prispôsobiteľný text hlavičky a pätičky s dynamickými premennými čísla strany.
---

# Hlavička a pätička

Pridajte text na šesť pozícií na stranách PDF: hlavička vľavo, na stred a vpravo, pätička vľavo, na stred a vpravo. Nástroj podporuje dynamické premenné pre číslo strany a celkový počet strán, takže môžete vytvoriť šablóny ako „Strana 3 z 10“, ktoré sa na každej strane automaticky aktualizujú.

## Ako to funguje

1. Nahrajte súbor PDF.
2. Zobrazí sa panel možností s ovládacími prvkami formátovania a šiestimi textovými poľami.
3. Zadajte požadovaný text do ktorejkoľvek pozície hlavičky alebo pätičky.
4. Na dynamické číslovanie strán použite zástupné symboly `{page}` a `{total}`.
5. Upravte veľkosť a farbu písma a voliteľne obmedzte rozsah strán.
6. Kliknite na **Pridať hlavičku a pätičku**, čím súbor spracujete a stiahnete.

## Možnosti

- **Rozsah strán**: Voliteľne obmedzte, ktoré strany dostanú hlavičky a pätičky. Ak pole necháte prázdne, použije sa na všetky strany. Formát: „1-3, 5“ (rozsahy oddelené čiarkou).
- **Veľkosť písma**: Od 6 do 24 bodov. Predvolene 10.
- **Farba písma**: Vyberte ľubovoľnú farbu pomocou výberu farby.
- **Hlavička vľavo / na stred / vpravo**: Textové polia pre hornú časť každej strany.
- **Pätička vľavo / na stred / vpravo**: Textové polia pre dolnú časť každej strany.

## Funkcie

- Šesť nezávislých textových pozícií na stranu
- Dynamická premenná `{page}`, ktorá vloží aktuálne číslo strany
- Dynamická premenná `{total}`, ktorá vloží celkový počet strán
- Filtrovanie rozsahu strán na cielenie konkrétnych strán
- Prispôsobiteľná veľkosť a farba písma
- Písmo Helvetica pre čistý a profesionálny výsledok

## Príklady použitia

- Pridanie „Strana {page} z {total}“ do stredu pätičky správy
- Umiestnenie názvu firmy do hlavičky vľavo a dátumu dokumentu do hlavičky vpravo
- Pridanie upozornení o dôvernosti do pätičky právnych dokumentov
- Označenie čísel revízií dokumentu na konkrétnych rozsahoch strán

## Tipy

- Skombinujte `{page}` a `{total}` v jednom poli pre formáty ako „Strana {page} z {total}“ alebo „{page}/{total}“.
- Väčšinu polí môžete nechať prázdnych a vyplniť iba potrebné pozície. Prázdne polia sa jednoducho preskočia.
- Pre zložitejšie hlavičky s obrázkami alebo logami zvážte nástroj [Pridať vodoznak](./add-watermark) umiestnený v hornej časti strany.

## Súvisiace nástroje

- [Čísla strán](./page-numbers)
- [Pridať vodoznak](./add-watermark)
- [Batesovo číslovanie](./bates-numbering)
