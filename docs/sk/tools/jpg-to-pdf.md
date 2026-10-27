---
title: JPG do PDF
description: Konvertujte jeden alebo viac obrázkov JPG, JPEG a JPEG 2000 do jedného súboru PDF priamo v prehliadači.
---

# JPG do PDF

Premeňte obrázky JPG na čisté PDF. Nahrajte jeden súbor alebo naraz viac súborov JPG, každý obrázok sa vo výslednom dokumente stane stranou v plnej veľkosti.

## Podporované formáty

| Formát    | Prípony         |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Ako to funguje

1. Kliknite na oblasť na nahrávanie alebo sem pretiahnite súbory JPG. Podporovaný je výber viacerých súborov.
2. Skontrolujte nahrané súbory. Ikonou koša odstránite jednotlivé súbory, tlačidlom **Pridať ďalšie súbory** pridáte ďalšie do zoznamu.
3. Vyberte úroveň **Kvalita PDF**.
4. Kliknite na **Konvertovať do PDF**. Nástroj skomprimuje obrázky podľa nastavenej kvality, prevedie ich enginom PyMuPDF a stiahne `from_jpgs.pdf`.

## Možnosti

**Kvalita PDF** upravuje kompresiu každého obrázka pred jeho vložením do PDF:

- **Vysoká kvalita**: zachová maximum detailov. Na fotografie alebo tlač.
- **Stredná kvalita** (predvolená): dobrá rovnováha medzi čistotou a veľkosťou súboru.
- **Nízka kvalita**: agresívna kompresia pre najmenší výstup.

## Príklady použitia

- Prevod naskenovaných dokumentov uložených ako JPG do jedného PDF na odoslanie
- Zabalenie fotografií produktov do katalógu pre klientov
- Premena medicínskych alebo satelitných snímok JPEG 2000 na prenosné PDF
- Vytvorenie tlačiteľného fotoalbumu z exportov z fotoaparátu

## Tipy

- Súbory JPEG 2000 (`.jp2`, `.jpx`) sú plne podporované, nielen štandardný JPEG. Hodí sa to pri medicínskom zobrazovaní a geopriestorových dátach.
- Ak vaše súbory JPG pochádzajú z fotoaparátu telefónu, Stredná kvalita zvyčajne vytvorí súbor o 40 až 60 % menší ako Vysoká bez viditeľného rozdielu na obrazovke.

## Súvisiace nástroje

- [Obrázky do PDF](./image-to-pdf)
- [PNG do PDF](./png-to-pdf)
- [WebP do PDF](./webp-to-pdf)
