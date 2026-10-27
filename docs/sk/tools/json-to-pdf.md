---
title: JSON do PDF
description: Zrekonštruujte súbory PDF z formátu JSON od BentoPDF. Preveďte exporty JSON späť na pôvodné dokumenty PDF.
---

# JSON do PDF

Zrekonštruujte dokumenty PDF zo súborov JSON, ktoré predtým vytvoril nástroj BentoPDF **PDF do JSON**. Ide o nástroj na spätnú konverziu: vezme štruktúrovanú reprezentáciu PDF v JSON a znovu zostaví pôvodný dokument.

::: warning
Tento nástroj prijíma iba súbory JSON vytvorené konvertorom PDF do JSON od BentoPDF. Bežné súbory JSON z API, databáz alebo iných nástrojov nie sú podporované.
:::

## Podporované formáty

| Vstup   | Popis                                                     |
| :------ | :-------------------------------------------------------- |
| `.json` | Súbory JSON exportované nástrojom PDF do JSON od BentoPDF |

## Ako to funguje

1. Kliknite na oblasť na nahrávanie alebo sem pretiahnite jeden či viac súborov JSON.
2. Zoznam súborov zobrazí každý vybraný súbor s jeho veľkosťou.
3. Kliknite na **Konvertovať do PDF**. Nástroj spracuje všetky súbory pomocou Web Workera a enginu CPDF.
4. Výstup sa stiahne ako `jsons-to-pdf.zip` s jedným PDF pre každý vstupný súbor JSON.

Konverzia beží vo Web Workeri na pozadí, takže rozhranie reaguje aj pri veľkých súboroch.

## Možnosti

Tento nástroj nemá žiadne nastavenia. Výstupné PDF úplne určuje štruktúra JSON.

## Výstup

Pri konverzii viacerých súborov JSON dostanete výsledky v archíve ZIP. Každé PDF je pomenované podľa zdrojového súboru JSON (napr. z `report.json` vznikne `report.pdf`).

## Príklady použitia

- Obnova PDF zo zálohy alebo archivačného procesu založeného na JSON
- Prevod PDF do JSON na kontrolu a potom späť do PDF
- Opätovné zostavenie dokumentov po programových úpravách štruktúry JSON
- Overenie, že export PDF do JSON zachytil všetok obsah dokumentu, spätným prevodom

## Tipy

- Ak potrebujete previesť ľubovoľné dáta JSON (napríklad odpovede API alebo konfiguračné súbory) na formátované PDF, lepšie poslúži nástroj [Text do PDF](./txt-to-pdf). Vložte JSON ako text a vykreslí sa so správnym formátovaním.
- Na fungovanie tohto nástroja musí byť dostupný engine CPDF vo WebAssembly. Inštancie na vlastnom serveri musia mať nakonfigurované súbory CPDF WASM.

## Súvisiace nástroje

- [Text do PDF](./txt-to-pdf)
- [Markdown do PDF](./markdown-to-pdf)
- [CSV do PDF](./csv-to-pdf)
