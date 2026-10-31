---
title: PDF do Wordu
description: Prevádzajte súbory PDF na upraviteľné dokumenty Word (DOCX). Podporuje hromadný prevod viacerých PDF naraz.
---

# PDF do Wordu

Prevádza súbory PDF na upraviteľné dokumenty Word (`.docx`). Nástroj pomocou PyMuPDF rekonštruuje obsah dokumentu so zachovaním textu, základného formátovania a rozloženia. Podporuje prevod jedného súboru aj hromadný prevod.

## Ako to funguje

1. Nahrajte jedno alebo viac PDF kliknutím na oblasť nahrávania alebo presunutím súborov do nej. Môžete pridať ďalšie súbory alebo zo zoznamu odstrániť jednotlivé.
2. Kliknutím na **Previesť** spustíte spracovanie.
3. Jeden súbor sa stiahne ako `filename.docx`. Viac súborov sa zabalí do `converted-documents.zip`.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Každé PDF sa prevedie do DOCX vstavaným prevodným enginom PyMuPDF.

## Výstupný formát

- **Jeden súbor**: `filename.docx`
- **Viac súborov**: `converted-documents.zip` s jedným `.docx` pre každé vstupné PDF.

## Prípady použitia

- Úprava textu v prijatom PDF, ktoré potrebujete zmeniť.
- Prevod archivovaných správ v PDF do formátu, ktorý môžu kolegovia upravovať v Microsoft Word alebo Google Docs.
- Prenos obsahu zo zmlúv alebo návrhov v PDF do Wordu na sledovanie zmien.
- Migrácia staršej dokumentácie v PDF do upraviteľného formátu.

## Tipy

- Zložité rozloženia s viacstĺpcovým textom, vloženými formulármi alebo množstvom grafiky sa nemusia previesť dokonale. Skontrolujte výstup a upravte formátovanie v textovom editore.
- Naskenované PDF (iba obrázky) vytvoria prázdne alebo takmer prázdne súbory DOCX. Najprv ich spracujte pomocou OCR, aby získali textovú vrstvu.
- Hromadný režim je efektívny na prevod celých priečinkov PDF: nahrajte ich všetky naraz.

## Súvisiace nástroje

- [PDF do Textu](./pdf-to-text)
- [PDF do Markdownu](./pdf-to-markdown)
- [Tvorca pracovných postupov (Workflow) PDF](./pdf-workflow)
