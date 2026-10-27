---
title: Batesovo číslovanie
description: Pridajte Batesove čísla do jedného alebo viacerých PDF s prispôsobiteľnými šablónami, doplnením nulami, písmami a umiestnením.
---

# Batesovo číslovanie

Batesovo číslovanie pridá na každú stranu PDF postupné identifikátory. Je to štandardný spôsob označovania dokumentov v súdnych konaniach, auditoch a procesoch súladu s predpismi. Tento nástroj podporuje viac súborov, prispôsobiteľné šablóny a vytvára jednotlivo očíslované PDF alebo jeden archív ZIP.

## Ako to funguje

1. Nahrajte jeden alebo viac PDF súborov. Môžete pretiahnuť viac súborov naraz.
2. Vyberte predvolený štýl alebo vytvorte vlastnú šablónu.
3. Nastavte pozíciu, písmo, veľkosť, farbu a počiatočné čísla.
4. Kliknutím na **Použiť Batesove čísla** spustíte spracovanie.
5. Jeden súbor sa stiahne priamo. Viac súborov sa stiahne ako archív ZIP.

## Možnosti

- **Predvolený štýl**: Vyberte si zo vstavaných formátov:
  - Exhibit + Case + Bates + Page (napr. „Exhibit 1 Case XYZ 000001 Page 1“)
  - Exhibit + Case + Bates (bez čísla strany)
  - Case + Bates
  - Iba Batesovo číslo (napr. „000001“)
  - Vlastný (napíšte si vlastnú šablónu)
- **Prispôsobiť štýl**: Reťazec šablóny so zástupnými symbolmi: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Doplnenie Batesovho čísla**: Počet číslic (3 až 6) pre Batesove čísla doplnené nulami. Viditeľné len vo vlastnom režime.
- **Pozícia**: Hlavička alebo päta, vľavo, v strede alebo vpravo.
- **Batesovo číslo začína od**: Prvé Batesovo číslo. Predvolene 1. Číslovanie pokračuje naprieč súbormi.
- **Počítadlo súborov začína od**: Počiatočné číslo pre zástupný symbol `[FILE]`.
- **Písmo**: Helvetica, Times New Roman alebo Courier.
- **Veľkosť písma**: Veľkosť pridaného textu.
- **Farba**: Výber farby textu Batesovho čísla.

## Funkcie

- Živý náhľad, ako budú Batesove čísla vyzerať vo všetkých nahraných súboroch
- Podpora viacerých súborov s priebežným číslovaním naprieč dokumentmi
- Zmena poradia súborov pretiahnutím určuje poradie číslovania
- Šesť možností umiestnenia (hlavička/päta, vľavo/v strede/vpravo)
- Prispôsobivý výpočet okrajov, ktorý rešpektuje rôzne veľkosti strán
- Výstup ZIP pre dávky viacerých súborov
- Zástupné symboly v šablóne pre maximálnu flexibilitu

## Prípady použitia

- Označenie dokumentov v dokazovaní pre súdny spor postupnými číslami príloh
- Číslovanie balíkov audítorských dôkazov, ktoré zahŕňajú desiatky súborov
- Pridanie regulačných referenčných čísel do dokumentácie súladu s predpismi
- Označenie príloh patentovej prihlášky identifikátormi konkrétneho prípadu

## Tipy

- Pred spracovaním zmeňte poradie súborov pretiahnutím v zozname. Batesovo číslovanie sa riadi týmto poradím.
- Zástupný symbol `[FILENAME]` vloží do pečiatky pôvodný názov súboru, čo pomáha dohľadať zdrojový dokument strán.
- Náhľad sa pri zmene nastavení aktualizuje v reálnom čase, takže formát môžete overiť pred spracovaním.

## Súvisiace nástroje

- [Čísla strán](./page-numbers)
- [Pridať označenia strán](./add-page-labels)
- [Hlavička a pätička](./header-footer)
