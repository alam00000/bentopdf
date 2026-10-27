---
title: CSV do PDF
description: Prevádzajte tabuľkové súbory CSV na formátované tabuľky PDF priamo v prehliadači.
---

# CSV do PDF

Premeňte súbory CSV na čisté, formátované dokumenty PDF. Každý CSV sa analyzuje a vykreslí ako tabuľka vo výstupnom PDF. Hodí sa to, keď potrebujete vytlačiť alebo zdieľať tabuľkové údaje bez toho, aby príjemca potreboval tabuľkový procesor.

## Podporované formáty

| Formát | Prípony |
| :----- | :------ |
| CSV    | `.csv`  |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite jeden či viac súborov CSV.
2. Skontrolujte zoznam súborov. Pridajte ďalšie alebo odstráňte nepotrebné.
3. Kliknite na **Previesť do PDF**. Indikátor priebehu zobrazuje stav prevodu.
4. Jeden súbor sa stiahne priamo ako PDF. Viac súborov sa zabalí do `csv-converted.zip`.

## Možnosti

Tento nástroj nemá žiadne ďalšie nastavenia. CSV sa automaticky analyzuje a naformátuje ako tabuľka.

## Výstup

| Počet vstupov | Výstup                                                        |
| :------------ | :------------------------------------------------------------ |
| 1 súbor       | Stiahnutie jedného PDF (napr. `data.pdf`)                     |
| 2+ súborov    | Archív ZIP (`csv-converted.zip`) s jedným PDF pre každý súbor |

## Prípady použitia

- Prevod exportovaných databázových správ na tlačiteľné tabuľky PDF
- Zdieľanie finančných údajov alebo inventárnych zoznamov s ľuďmi, ktorí nemajú Excel
- Vytváranie PDF verzií logovacích súborov CSV pre dokumentáciu súladu
- Tlač adresárov, hodnotiacich hárkov alebo akýchkoľvek tabuľkových údajov uložených ako CSV

## Tipy

- Pre najlepšie výsledky používajte v CSV štandardné čiarky ako oddeľovače. Nástroj dodržiava bežné konvencie analýzy CSV.
- Ak má váš CSV veľa stĺpcov, tabuľka sa môže zúžiť, aby sa zmestila na šírku strany. Zvážte rozdelenie širokých dát do viacerých súborov.
- Pre súbory Excel (`.xls`, `.xlsx`) použite nástroj [Excel do PDF](./excel-to-pdf), ktorý zachová formátovanie tabuliek a viac hárkov.

## Súvisiace nástroje

- [Excel do PDF](./excel-to-pdf)
- [Text do PDF](./txt-to-pdf)
- [JSON do PDF](./json-to-pdf)
