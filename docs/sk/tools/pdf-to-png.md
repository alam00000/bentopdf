---
title: PDF do PNG
description: Prevádzajte strany PDF na bezstratové obrázky PNG s nastaviteľnou mierkou. Ideálne pre kvalitné snímky obrazovky a priehľadné pozadia.
---

# PDF do PNG

Prevedie každú stranu PDF na obrázok PNG. PNG používa bezstratovú kompresiu, takže výstup zachová každý detail pôvodnej strany. Jednostranové PDF sa stiahnu ako súbor `.png`, viacstranové PDF vytvoria ZIP.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej.
2. Posuvníkom **Mierka** nastavte výstupné rozlíšenie.
3. Kliknutím na **Previesť** spustíte spracovanie.
4. Automaticky sa stiahne jeden PNG alebo archív ZIP.

## Možnosti

- **Mierka**: od 1.0x do 3.0x (predvolene 2.0x). Pri 2.0x sa štandardná strana veľkosti Letter vykreslí približne na 1 224 x 1 584 pixelov. Vyššie hodnoty mierky vytvárajú väčšie a ostrejšie obrázky za cenu väčších súborov a dlhšieho spracovania.

## Výstupný formát

- **Jedna strana**: `filename.png`
- **Viac strán**: `filename_pngs.zip` obsahujúci `page_1.png`, `page_2.png` atď.

## Prípady použitia

- Zachytenie verných snímok strán PDF pre prezentácie.
- Extrakcia grafov alebo diagramov, ktoré potrebujú ostré hrany bez kompresných artefaktov.
- Príprava podkladov pre webdizajn z návrhov v PDF.
- Tvorba bezstratových obrázkov strán na predspracovanie pre OCR.

## Tipy

- Súbory PNG sú výrazne väčšie ako JPG. Ak vám záleží viac na veľkosti súboru než na dokonalej kvalite, použite [PDF do JPG](./pdf-to-jpg) alebo [PDF do WebP](./pdf-to-webp).
- Pri mierke 1.0x zodpovedá výstup natívnemu rozlíšeniu PDF. Pre exporty v tlačovej kvalite zvýšte na 3.0x.

## Súvisiace nástroje

- [PDF do JPG](./pdf-to-jpg)
- [PDF do WebP](./pdf-to-webp)
- [PDF do SVG](./pdf-to-svg)
