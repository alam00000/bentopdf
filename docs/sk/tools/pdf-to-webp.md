---
title: PDF do WebP
description: Prevádzajte strany PDF na obrázky WebP s nastaviteľnou kvalitou. Menšie súbory ako JPG pri porovnateľnej vizuálnej kvalite.
---

# PDF do WebP

Prevedie každú stranu PDF na obrázok WebP. WebP zvyčajne vytvára súbory o 25-35 % menšie ako JPG pri rovnakej vnímanej kvalite, čo z neho robí silnú voľbu pre web.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej.
2. Nastavte posuvník **Kvalita**.
3. Kliknutím na **Previesť** súbor spracujete.
4. Automaticky sa stiahne jeden súbor `.webp` alebo archív ZIP.

## Možnosti

- **Kvalita**: posuvník od 0 % do 100 % (predvolene 85 %). Riadi úroveň stratovej kompresie. Vyššie hodnoty zachovajú viac detailov.

Strany sa interne vykresľujú v mierke 2x, takže obrázky majú približne dvojnásobok pôvodných rozmerov PDF.

## Výstupný formát

- **Jedna strana**: `filename.webp`
- **Viac strán**: `filename_webps.zip` obsahujúci `page_1.webp`, `page_2.webp` atď.

## Prípady použitia

- Príprava náhľadov strán pre webové stránky, kde záleží na prenosovej kapacite.
- Generovanie odľahčených obrazových verzií letákov alebo brožúr pre sociálne siete.
- Hromadný prevod viacstranových dokumentov na sadu obrázkov optimalizovaných pre web.

## Tipy

- WebP podporujú všetky moderné prehliadače. Kvôli kompatibilite so staršími systémami použite [PDF do JPG](./pdf-to-jpg).
- Kvalita 80-85 % je na obrazovke zvyčajne na nerozoznanie od originálu a súbory zostávajú malé.

## Súvisiace nástroje

- [PDF do JPG](./pdf-to-jpg)
- [PDF do PNG](./pdf-to-png)
- [PDF do BMP](./pdf-to-bmp)
