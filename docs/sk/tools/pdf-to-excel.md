---
title: PDF do Excelu
description: Extrahujte tabuľky z dokumentov PDF do tabuľky Excel. Každá tabuľka dostane vlastný hárok s odkazom na stranu.
---

# PDF do Excelu

Extrahuje tabuľky z PDF a uloží ich ako tabuľku Excel (`.xlsx`). Každá rozpoznaná tabuľka sa umiestni na vlastný hárok označený číslom tabuľky a zdrojovou stranou. Rozpoznávanie tabuliek zabezpečuje PyMuPDF a generovanie Excelu knižnica SheetJS.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej.
2. Kliknutím na **Previesť** spustíte extrakciu tabuliek.
3. Nástroj prehľadá každú stranu, či obsahuje tabuľky, a potom vytvorí zošit Excel.
4. Stiahne sa súbor `.xlsx` s jedným hárkom na tabuľku.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Všetky rozpoznané tabuľky sa extrahujú automaticky.

## Výstupný formát

- Jeden súbor `filename.xlsx`.
- **Jedna tabuľka**: jeden hárok s názvom „Table“.
- **Viac tabuliek**: hárky s názvami „Table 1 (Page 3)“, „Table 2 (Page 5)“ atď. Názvy hárkov sa skracujú na 31 znakov (limit Excelu).

## Prípady použitia

- Prevod finančných správ v PDF na upraviteľné tabuľky na ďalšiu analýzu.
- Extrakcia tabuliek zásob alebo objednávok z PDF od dodávateľov.
- Prenos štruktúrovaných údajov z PDF formulárov alebo katalógov do Excelu na triedenie a filtrovanie.
- Archivácia tabuľkových údajov z PDF vo formáte, s ktorým zvládnu pracovať aj netechnickí kolegovia.

## Tipy

- Ak nástroj hlási „Nenašli sa žiadne tabuľky“, PDF pravdepodobne používa voľne plynúci text namiesto štruktúrovaných tabuliek. Skúste radšej [PDF do Textu](./pdf-to-text) a získajte surový obsah.
- Pre jednoduchší plochý formát použite [PDF do CSV](./pdf-to-csv). Na sťahovanie jednotlivých tabuliek vo viacerých formátoch použite [Extrahovať PDF tabuľky](./extract-tables).
- Podľa názvov hárkov zistíte, z ktorej strany pochádza každá tabuľka.

## Súvisiace nástroje

- [PDF do CSV](./pdf-to-csv)
- [Extrahovať PDF tabuľky](./extract-tables)
- [PDF do Textu](./pdf-to-text)
