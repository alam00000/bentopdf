---
title: HEIC do PDF
description: Konvertujte obrázky HEIC a HEIF z iPhonov a iPadov do formátu PDF priamo v prehliadači.
---

# HEIC do PDF

Konvertujte obrázky HEIC/HEIF do PDF. HEIC je predvolený formát fotografií na iPhonoch a iPadoch od iOS 11. Tento nástroj z nich vytvorí PDF bez inštalácie desktopového softvéru a bez nahrávania súborov na server.

## Podporované formáty

| Formát | Prípony |
| :----- | :------ |
| HEIC   | `.heic` |
| HEIF   | `.heif` |

## Ako to funguje

1. Kliknite na oblasť na nahrávanie alebo sem pretiahnite súbory HEIC/HEIF.
2. Skontrolujte zoznam súborov a odstráňte nechcené súbory.
3. Kliknite na **Konvertovať do PDF**. Výsledok sa stiahne ako `from_heic.pdf`.

Každý súbor HEIC sa dekóduje knižnicou heic2any, ktorá ho prevedie na PNG s kvalitou 92 %. PNG sa potom pomocou pdf-lib vloží do PDF, každý obrázok na samostatnú stranu v plnom rozlíšení.

## Možnosti

Tento nástroj neponúka ďalšie nastavenia. Obrázky HEIC sa pred vložením prevedú na PNG vo vysokej kvalite (0,92).

## Príklady použitia

- Vytvorenie PDF z fotografií z iPhonu ako prílohy k poistnej udalosti alebo správe
- Prevod fotografií HEIC k realitnému inzerátu do jedného tlačiteľného dokumentu
- Premena snímok obrazovky z iPadu (formát HEIF) na PDF na zdieľanie
- Hromadný prevod fotografií z dovolenky do cestovného denníka

## Tipy

- Dekódovanie HEIC prebieha celé v prehliadači pomocou WebAssembly. Prvá konverzia môže chvíľu trvať, kým sa dekodér načíta.
- Ak potrebujete kombinovať HEIC s inými formátmi obrázkov (JPG, PNG atď.), použite nástroj [Obrázky do PDF](./image-to-pdf), ktorý spracuje HEIC spolu so všetkými ostatnými formátmi.
- Súbory HEIC z iPhonov často obsahujú údaje EXIF vrátane súradníc GPS. Výstupné PDF tieto metadáta neprenáša.

## Súvisiace nástroje

- [Obrázky do PDF](./image-to-pdf)
- [JPG do PDF](./jpg-to-pdf)
- [PNG do PDF](./png-to-pdf)
