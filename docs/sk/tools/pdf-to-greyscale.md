---
title: PDF do odtieňov sivej
description: Preveďte farebné PDF na verziu v odtieňoch sivej (čiernobielu). Vytvorí nové PDF s odstránenou farbou zo všetkých strán.
---

# PDF do odtieňov sivej

Prevedie farebné PDF na verziu v odtieňoch sivej. Každá strana sa vykreslí, odfarbí a znova vloží ako obrázok JPEG do nového PDF. Výstup zachováva pôvodné rozmery strán.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej.
2. Kliknutím na **Previesť** súbor spracujete.
3. Stiahne sa nový `greyscale.pdf` so všetkými stranami prevedenými na čiernobiele.

Interne sa každá strana vykreslí v mierke 2x, pixelové dáta prejdú filtrom odtieňov sivej, potom sa znova zakódujú ako JPEG s kvalitou 90 % a vložia do nového dokumentu PDF.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Prevod do odtieňov sivej používa štandardný vzorec jasu a kvalita JPEG je pevne nastavená na 90 %.

## Výstupný formát

- Jeden súbor `greyscale.pdf` so všetkými stranami ako obrázkami JPEG v odtieňoch sivej.

## Prípady použitia

- Príprava dokumentov na čiernobielu tlač kvôli úspore nákladov na farebný atrament.
- Splnenie požiadaviek na podania na súdy alebo úrady, ktoré vyžadujú odtiene sivej.
- Zmenšenie veľkosti PDF s množstvom farieb (obrázky JPEG v odtieňoch sivej sú menšie ako farebné).
- Jednotný vizuálny štýl dokumentov s kombináciou farebných a čiernobielych strán.

## Tipy

- Keďže sa každá strana rastruje a znova vkladá ako JPEG, výstup je založený na obrázkoch. Text z pôvodného PDF už nebude možné označiť ani vyhľadávať. Ak potom potrebujete vyhľadávateľný text, spracujte výstup nástrojom OCR.
- Pre väčšiu kontrolu nad úpravou farieb (jas, kontrast, sýtosť) sa pozrite na nástroj Úprava farieb alebo uzol Odtiene sivej v nástroji [Tvorca pracovných postupov (Workflow) PDF](./pdf-workflow).

## Súvisiace nástroje

- [PDF do JPG](./pdf-to-jpg)
- [PDF do PNG](./pdf-to-png)
- [Tvorca pracovných postupov (Workflow) PDF](./pdf-workflow)
