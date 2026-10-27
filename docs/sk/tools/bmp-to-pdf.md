---
title: BMP do PDF
description: Konvertujte bitmapové obrázky BMP do formátu PDF priamo v prehliadači, bez nahrávania na akýkoľvek server.
---

# BMP do PDF

Konvertujte súbory Windows Bitmap (BMP) do PDF. BMP je nekomprimovaný obrazový formát, ktorý sa stále vyskytuje v starších systémoch, medicínskom zobrazovaní a priemyselných skeneroch. Tento nástroj ich prevedie do PDF bez nutnosti čokoľvek inštalovať.

## Podporované formáty

| Formát | Prípony |
| :----- | :------ |
| BMP    | `.bmp`  |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite svoje BMP súbory.
2. Skontrolujte zoznam súborov. Pridajte ďalšie súbory alebo odstráňte nechcené.
3. Kliknite na **Konvertovať do PDF**. Výstup sa stiahne ako `from_bmps.pdf`.

Každý BMP sa vykreslí na plátno, exportuje ako PNG a potom sa pomocou pdf-lib vloží do PDF. Veľkosť strany zodpovedá pôvodným rozmerom obrázka.

## Možnosti

Tento nástroj neponúka ďalšie nastavenia kvality. Obrázky sa do PDF vkladajú v pôvodnom rozlíšení ako bezstratové PNG.

## Prípady použitia

- Konverzia starších naskenovaných dokumentov uložených ako BMP do archívnych PDF
- Premena BMP snímok obrazovky zo starších aplikácií Windows na zdieľateľné dokumenty
- Spracovanie výstupu medicínskych alebo priemyselných skenerov, ktoré predvolene ukladajú BMP
- Migrácia starých archívov obrázkov do prenosnejšieho formátu

## Tipy

- Súbory BMP sú nekomprimované, preto bývajú veľké. Výsledné PDF bude výrazne menšie, keďže obrázky sa interne znova zakódujú ako PNG.
- Ak máte BMP súbory spolu s inými obrazovými formátmi, použite nástroj [Obrázky do PDF](./image-to-pdf) a konvertujte všetko v jednej dávke.

## Súvisiace nástroje

- [Obrázky do PDF](./image-to-pdf)
- [PNG do PDF](./png-to-pdf)
- [TIFF do PDF](./tiff-to-pdf)
