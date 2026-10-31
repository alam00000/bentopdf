---
title: PDF do TIFF
description: Prevádzajte strany PDF na obrázky TIFF, bežne používané pri tlači, faxovaní a archivácii. Ak kódovanie zlyhá, použije sa PNG.
---

# PDF do TIFF

Prevedie každú stranu PDF na obrázok TIFF. TIFF je štandardný formát pre tlačovú výrobu, faxové systémy a archiváciu dokumentov. Nástroj pri kódovaní TIFF používa kompresiu PackBits a ak sa stranu nepodarí zakódovať, použije PNG.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej.
2. Kliknutím na **Previesť** súbor spracujete.
3. Automaticky sa stiahne jeden súbor TIFF alebo archív ZIP.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Strany sa vykresľujú v pevnej mierke 2x.

## Výstupný formát

- **Jedna strana**: `filename.tiff`
- **Viac strán**: `filename_tiffs.zip` obsahujúci `page_1.tiff`, `page_2.tiff` atď.

Ak kódovanie TIFF pre konkrétnu stranu zlyhá (kvôli problémom s kompresiou), táto strana sa namiesto toho uloží ako súbor `.png`. ZIP potom bude obsahovať kombináciu súborov TIFF a PNG.

## Prípady použitia

- Odovzdávanie dokumentov úradom alebo právnym systémom, ktoré vyžadujú formát TIFF.
- Príprava strán na odoslanie faxom cez digitálne faxové služby.
- Archivácia naskenovaných dokumentov v široko podporovanom bezstratovom formáte.
- Odovzdávanie strán do podnikových systémov správy dokumentov.

## Tipy

- Súbory TIFF sú veľké. Ak potrebujete bezstratovú kvalitu len na web alebo obrazovku, lepšou voľbou je [PDF do PNG](./pdf-to-png).
- Ak niektoré strany potrebovali záložné PNG, skontrolujte obsah ZIP, možno ich budete chcieť previesť samostatne.

## Súvisiace nástroje

- [PDF do PNG](./pdf-to-png)
- [PDF do BMP](./pdf-to-bmp)
- [PDF do JPG](./pdf-to-jpg)
