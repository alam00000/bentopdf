---
title: PDF do SVG
description: Prevádzajte strany PDF na škálovateľnú vektorovú grafiku SVG. Zachováva text a tvary ako vektorové cesty pre neobmedzené zväčšovanie.
---

# PDF do SVG

Prevedie každú stranu PDF na súbor SVG (Scalable Vector Graphics). Na rozdiel od rastrových formátov SVG zachováva vektorové cesty, text a tvary, takže výstup sa dá zväčšiť na ľubovoľnú veľkosť bez pixelovania. Využíva PyMuPDF.

## Ako to funguje

1. Nahrajte jedno alebo viac PDF kliknutím na oblasť nahrávania alebo presunutím súborov do nej. Môžete pridať viac súborov a spravovať ich jednotlivo.
2. Kliknutím na **Previesť** spracujete všetky nahrané súbory.
3. Prevody jedného súboru s jednou stranou sa stiahnu ako samostatný `.svg`. Všetko ostatné sa stiahne ako archív ZIP.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Každá strana sa prevedie do SVG natívnym vektorovým exportom PyMuPDF.

## Výstupný formát

- **Jeden súbor, jedna strana**: `filename.svg`
- **Jeden súbor, viac strán**: `filename_svg.zip` obsahujúci `page_1.svg`, `page_2.svg` atď.
- **Viac súborov**: `pdf_to_svg.zip` so súbormi usporiadanými podľa názvu zdrojového dokumentu.

## Prípady použitia

- Extrakcia vektorových diagramov, grafov alebo ilustrácií zo správ v PDF na použitie na webových stránkach.
- Úprava obsahu strán PDF vo vektorovom editore ako Inkscape alebo Illustrator.
- Vkladanie škálovateľných náhľadov strán do responzívnych webových aplikácií.
- Extrakcia log alebo grafiky z brožúr v PDF so zachovaním ostrých hrán.

## Tipy

- SVG funguje najlepšie s PDF, ktoré obsahujú vektorový obsah. Naskenované dokumenty alebo PDF s množstvom obrázkov vytvoria veľké súbory SVG s vloženými rastrovými dátami.
- Pre rastrový výstup z PDF s množstvom obrázkov použite radšej [PDF do PNG](./pdf-to-png) alebo [PDF do JPG](./pdf-to-jpg).
- Tento nástroj podporuje hromadný prevod: nahrajte viac PDF naraz a preveďte ich všetky v jednom behu.

## Súvisiace nástroje

- [PDF do PNG](./pdf-to-png)
- [PDF do JPG](./pdf-to-jpg)
- [PDF do Markdownu](./pdf-to-markdown)
