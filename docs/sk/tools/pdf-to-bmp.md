---
title: PDF do BMP
description: Prevádzajte strany PDF na nekomprimované obrázky BMP. Užitočné pre staršie systémy a tlačové postupy, ktoré vyžadujú bitmapový vstup.
---

# PDF do BMP

Prevedie každú stranu PDF na obrázok BMP (Bitmap). BMP je nekomprimovaný formát, takže výstup je pixelovo presný bez straty kvality, no súbory sú veľké.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo presunutím súboru do nej.
2. Kliknutím na **Previesť** súbor spracujete.
3. Automaticky sa stiahne jeden súbor `.bmp` alebo archív ZIP.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Strany sa vykresľujú v pevnej mierke 2x, takže obrázky majú približne dvojnásobok pôvodných rozmerov strany PDF.

## Výstupný formát

- **Jedna strana**: `filename.bmp`
- **Viac strán**: `filename_bmps.zip` obsahujúci `page_1.bmp`, `page_2.bmp` atď.

## Prípady použitia

- Odovzdávanie strán PDF starším systémom alebo zariadeniam, ktoré prijímajú iba BMP.
- Príprava nekomprimovaných obrázkov pre špecifické tlačové postupy.
- Použitie bitmapového výstupu ako vstupu pre nástroje na spracovanie obrazu, ktoré vyžadujú surové pixelové dáta.

## Tipy

- Súbory BMP sú veľmi veľké, pretože ukladajú surové pixelové dáta bez kompresie. Na väčšinu účelov poskytne [PDF do PNG](./pdf-to-png) bezstratovú kvalitu pri oveľa menších súboroch.
- Ak cieľový systém prijíma PNG alebo TIFF, uprednostnite tieto formáty kvôli úspore miesta na disku.

## Súvisiace nástroje

- [PDF do PNG](./pdf-to-png)
- [PDF do TIFF](./pdf-to-tiff)
- [PDF do JPG](./pdf-to-jpg)
