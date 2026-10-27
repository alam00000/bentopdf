---
title: PDF do Markdownu
description: Prevádzajte dokumenty PDF do formátu Markdown s voliteľnou extrakciou obrázkov. Podporuje hromadný prevod viacerých súborov.
---

# PDF do Markdownu

Prevádza súbory PDF do formátu Markdown (`.md`) so zachovaním nadpisov, odsekov, zoznamov a základného formátovania. Voliteľne extrahuje a zahrnie vložené obrázky. Podporuje prevod jedného súboru aj hromadný prevod. Využíva PyMuPDF.

## Ako to funguje

1. Nahrajte jedno alebo viac PDF kliknutím na oblasť nahrávania alebo presunutím súborov do nej.
2. Voliteľne zapnite **Zahrnúť obrázky**, aby sa extrahované obrázky vložili do výstupu Markdown.
3. Kliknutím na **Previesť** spustíte spracovanie.
4. Jeden súbor sa stiahne ako `filename.md`. Viac súborov vytvorí `markdown-files.zip`.

## Možnosti

- **Zahrnúť obrázky**: keď je začiarknuté, vložené obrázky z PDF sa extrahujú a odkazuje sa na ne vo výstupe Markdown. Keď nie je začiarknuté, prevedie sa iba textový obsah.

## Výstupný formát

- **Jeden súbor**: `filename.md`
- **Viac súborov**: `markdown-files.zip` s jedným `.md` pre každé vstupné PDF.

## Prípady použitia

- Prevod dokumentácie v PDF do Markdownu pre generátor statických stránok ako VitePress, Hugo alebo Jekyll.
- Premena odborných článkov v PDF na upraviteľný Markdown pre aplikácie na poznámky ako Obsidian.
- Migrácia starších znalostných báz v PDF do textového formátu vhodného pre Git.
- Extrakcia štruktúrovaného obsahu z e-kníh v PDF na preformátovanie.

## Tipy

- Možnosť Zahrnúť obrázky sa hodí, keď PDF obsahuje diagramy alebo obrázky podstatné pre obsah. Pri dokumentoch s prevahou textu ju vypnite, aby bol výstup čistý.
- Zložité rozloženia s bočnými panelmi, poznámkami pod čiarou alebo viacstĺpcovým textom môžu viesť k nedokonalému Markdownu. Výstup podľa potreby skontrolujte a upravte.
- Pre surový text bez akéhokoľvek formátovania použite radšej [PDF do Textu](./pdf-to-text).

## Súvisiace nástroje

- [PDF do Textu](./pdf-to-text)
- [PDF do Wordu](./pdf-to-word)
- [Pripraviť PDF pre AI](./prepare-pdf-for-ai)
