---
title: TIFF do PDF
description: Preveďte jednostranové aj viacstranové obrázky TIFF do formátu PDF vo svojom prehliadači s plnou podporou strán.
---

# TIFF do PDF

Preveďte súbory TIFF do PDF vrátane viacstranových TIFF. Každá strana (alebo „IFD“) v súbore TIFF sa stane samostatnou stranou výsledného PDF. Je to užitočné najmä pri naskenovaných dokumentoch, faxoch a medicínskych snímkach, ktoré sa bežne ukladajú ako viacstranové TIFF.

## Podporované formáty

| Formát | Prípony         |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite súbory TIFF.
2. Skontrolujte zoznam súborov a podľa potreby ho upravte.
3. Kliknite na **Previesť do PDF**. Výsledok sa stiahne ako `from_tiff.pdf`.

Nástroj dekóduje každý súbor TIFF pomocou dekodéra TIFF v JavaScripte a extrahuje surové pixelové dáta RGBA každej strany. Každá strana sa vykreslí na plátno, exportuje ako PNG a vloží do PDF. Rozmery strán zodpovedajú pôvodným stranám TIFF.

## Možnosti

Tento nástroj neposkytuje žiadne ďalšie nastavenia kvality. Obrázky sa vkladajú v pôvodnom rozlíšení.

## Prípady použitia

- Prevod viacstranových faxových dokumentov (TIFF-F) do prenosnejšieho formátu PDF
- Premena archívov naskenovaných dokumentov uložených ako TIFF na prehľadávateľné PDF (následne v kombinácii s nástrojom OCR)
- Spracovanie medicínskych obrazových súborov (patologické preparáty, rádiologické exporty), ktoré používajú TIFF
- Prevod súborov TIFF so snímkami GIS alebo satelitnými snímkami na zdieľateľné dokumenty

## Tipy

- Viacstranové TIFF sú plne podporované. Z 10-stranového TIFF vznikne 10-stranové PDF. TIFF nemusíte najprv rozdeľovať.
- Spracovanie veľmi veľkých súborov TIFF (stovky megabajtov) môže trvať dlhšie, pretože celý súbor sa musí dekódovať v pamäti prehliadača.
- Ak potrebujete na výslednom PDF OCR, po prevode ho spracujte nástrojom [Rozpoznávanie textu (OCR) PDF](./ocr-pdf).

## Súvisiace nástroje

- [Obrázky do PDF](./image-to-pdf)
- [BMP do PDF](./bmp-to-pdf)
- [JPG do PDF](./jpg-to-pdf)
