---
title: PDF do CSV
description: Extrahujte tabuľky z dokumentov PDF a exportujte ich do jedného súboru CSV. Zvláda viacstranové PDF s automatickým rozpoznávaním tabuliek.
---

# PDF do CSV

Extrahuje tabuľky z PDF a exportuje ich ako súbor CSV. Nástroj pomocou enginu na rozpoznávanie tabuliek z PyMuPDF prehľadá každú stranu a všetky nájdené riadky zapíše do jedného výstupu oddeleného čiarkami.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej.
2. Kliknutím na **Previesť** spustíte extrakciu tabuliek.
3. Nástroj prehľadá každú stranu a automaticky rozpozná tabuľky.
4. Stiahne sa súbor `.csv` so všetkými extrahovanými údajmi tabuliek.

Tabuľky z rôznych strán sú vo výstupe oddelené prázdnymi riadkami. Bunky obsahujúce čiarky, úvodzovky alebo zalomenia riadkov sú správne escapované podľa RFC 4180.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Všetky tabuľky nájdené v dokumente sa extrahujú a spoja do jedného CSV.

## Výstupný formát

- Jeden súbor `filename.csv` so všetkými rozpoznanými tabuľkami.

## Prípady použitia

- Prenos finančných údajov z bankových výpisov alebo faktúr v PDF do tabuľky.
- Extrakcia cenníkových tabuliek z ponúk dodávateľov na porovnanie.
- Prevod tabuľkových výskumných údajov z odborných PDF do formátu vhodného pre analytické nástroje.
- Migrácia údajov zo starších správ v PDF do databáz.

## Tipy

- Ak sa nenájdu žiadne tabuľky, nástroj zobrazí správu „Nenašli sa žiadne tabuľky“. Zvyčajne to znamená, že PDF používa rozloženie textu, ktoré vyzerá ako tabuľka, no nie je štruktúrované ako skutočná tabuľka.
- Pre väčšiu kontrolu nad jednotlivými tabuľkami použite [Extrahovať PDF tabuľky](./extract-tables), kde si môžete vybrať výstup CSV, JSON alebo Markdown.
- Ak potrebujete údaje vo formáte Excel so samostatným hárkom pre každú tabuľku, použite [PDF do Excelu](./pdf-to-excel).

## Súvisiace nástroje

- [PDF do Excelu](./pdf-to-excel)
- [Extrahovať PDF tabuľky](./extract-tables)
- [PDF do Textu](./pdf-to-text)
