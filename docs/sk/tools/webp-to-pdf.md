---
title: WebP do PDF
description: Prevádzajte obrázky WebP do formátu PDF priamo v prehliadači s nastaviteľnou kvalitou kompresie.
---

# WebP do PDF

Prevádzajte obrazový formát WebP od Googlu do PDF. Hodí sa to najmä vtedy, keď ste si z webu stiahli obrázky vo formáte WebP a potrebujete ich v univerzálnejšom formáte na tlač alebo zdieľanie.

## Podporované formáty

| Formát | Prípony |
| :----- | :------ |
| WebP   | `.webp` |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite súbory WebP.
2. Skontrolujte zoznam súborov a odstráňte tie, ktoré nepotrebujete.
3. Vyberte úroveň **Kvalita PDF**.
4. Kliknite na **Previesť do PDF**. Výstup sa stiahne ako `from_webps.pdf`.

Interne sa každý obrázok WebP dekóduje cez canvas API prehliadača a potom sa vloží do PDF pomocou pdf-lib. Prevod tak funguje v každom prehliadači, ktorý podporuje dekódovanie WebP (všetky moderné prehliadače).

## Možnosti

**Kvalita PDF** určuje kompresiu pri vkladaní obrázkov:

- **Vysoká kvalita** -- zachová najviac detailov.
- **Stredná kvalita** (predvolená) -- vyvážený výstup.
- **Nízka kvalita** -- najmenšia veľkosť súboru.

## Prípady použitia

- Prevod obrázkov stiahnutých z webu vo formáte WebP do PDF na tlač
- Zabalenie snímok obrazovky WebP z Chrome alebo Edge do dokumentácie
- Vytvorenie PDF portfólia z obrázkov exportovaných z dizajnérskych nástrojov, ktoré predvolene používajú WebP
- Archivácia obrázkov WebP v univerzálnejšie čitateľnom formáte

## Tipy

- WebP sa pred vložením do PDF interne dekóduje do PNG, takže bezstratové obrázky WebP si pri nastavení Vysoká zachovajú kvalitu.
- Ak máte mix WebP a iných obrazových formátov, použite radšej nástroj [Obrázky do PDF](./image-to-pdf) -- prijme všetko naraz.

## Súvisiace nástroje

- [Obrázky do PDF](./image-to-pdf)
- [PNG do PDF](./png-to-pdf)
- [JPG do PDF](./jpg-to-pdf)
