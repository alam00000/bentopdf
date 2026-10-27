---
title: Excel do PDF
description: Prevádzajte tabuľky Excel (XLS, XLSX), ODS a súbory CSV do PDF so zachovaním formátovania.
---

# Excel do PDF

Prevádzajte tabuľkové súbory do PDF. Nástroj zvládne moderné súbory Excel, starší formát XLS, tabuľky OpenDocument a dokonca aj CSV, pričom všetko sa vykresľuje cez engine LibreOffice v prehliadači, ktorý zachováva formátovanie buniek, vzorce (ako vypočítané hodnoty), grafy a rozloženia s viacerými hárkami.

## Podporované formáty

| Formát               | Prípony |
| :------------------- | :------ |
| Excel (moderný)      | `.xlsx` |
| Excel (starší)       | `.xls`  |
| Tabuľka OpenDocument | `.ods`  |
| CSV                  | `.csv`  |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite tabuľkové súbory.
2. Skontrolujte zoznam súborov. Pridajte ďalšie alebo odstráňte nepotrebné.
3. Kliknite na **Previesť do PDF**. Engine LibreOffice sa pri prvom použití inicializuje a potom spracuje každý súbor.
4. Jeden súbor sa stiahne priamo ako PDF. Viac súborov dostanete ako `excel-converted.zip`.

## Možnosti

Tento nástroj nemá žiadne ďalšie nastavenia. Engine LibreOffice určí rozloženie strany, mierku a oblasť tlače podľa vstavaných nastavení tabuľky.

## Výstup

| Počet vstupov | Výstup                                                          |
| :------------ | :-------------------------------------------------------------- |
| 1 súbor       | Stiahnutie jedného PDF (pôvodný názov súboru s príponou `.pdf`) |
| 2+ súborov    | Archív ZIP (`excel-converted.zip`) s jedným PDF pre každý súbor |

## Prípady použitia

- Prevod finančných správ alebo rozpočtov z Excelu do PDF na distribúciu
- Vytváranie PDF pripravených na tlač z tabuliek inventára alebo produktových katalógov
- Zdieľanie výsledkov analýzy dát so zainteresovanými stranami, ktoré nemajú nainštalovaný Excel
- Archivácia štvrťročných správ v needitovateľnom formáte
- Prevod súborov ODS z LibreOffice Calc do PDF

## Tipy

- Grafy vložené v tabuľke sa vykreslia v PDF. Pred prevodom sa uistite, že v zdrojovom súbore vyzerajú správne.
- Ak má tabuľka viac hárkov, do výstupného PDF sa zahrnú všetky.
- Pre jednoduché údaje CSV bez formátovania ponúka nástroj [CSV do PDF](./csv-to-pdf) odľahčenejší prevod. Excel do PDF použite, keď potrebujete zachovať formátovanie, grafy alebo viac hárkov.

## Súvisiace nástroje

- [CSV do PDF](./csv-to-pdf)
- [Word do PDF](./word-to-pdf)
- [PowerPoint do PDF](./powerpoint-to-pdf)
