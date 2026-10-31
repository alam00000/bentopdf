---
title: PNG do PDF
description: Preveďte jeden alebo viac obrázkov PNG na dokument PDF s nastaviteľnou kvalitou, úplne vo vašom prehliadači.
---

# PNG do PDF

Prevádzajte obrázky PNG do PDF so zachovaním ich plného rozlíšenia. Každý PNG sa stane samostatnou stranou s veľkosťou podľa rozmerov pôvodného obrázka. Priehľadnosť sa spracuje automaticky.

## Podporované formáty

| Formát | Prípony |
| :----- | :------ |
| PNG    | `.png`  |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo presuňte súbory PNG. Môžete ich vybrať viac naraz.
2. Spravujte zoznam súborov: odstráňte nechcené súbory alebo pridajte ďalšie.
3. V rozbaľovacom zozname zvoľte úroveň **Kvalita PDF**.
4. Kliknite na **Previesť do PDF**. Výstup sa stiahne ako `from_jpgs.pdf`.

Nástroj vkladá každý obrázok priamo pomocou pdf-lib. Ak PNG nemožno vložiť natívne (napr. kvôli neobvyklému farebnému profilu), znova sa vykreslí cez canvas ako JPEG.

## Možnosti

**Kvalita PDF** určuje kompresiu použitú pred vložením:

- **Vysoká kvalita**: minimálna kompresia, najväčší súbor.
- **Stredná kvalita** (predvolené): dobrá rovnováha medzi veľkosťou a ostrosťou.
- **Nízka kvalita**: maximálna kompresia, najmenší výstup.

## Prípady použitia

- Prevod snímok obrazovky do viacstranového PDF pre hlásenia chýb alebo dokumentáciu
- Zabalenie exportov návrhov UI do jedného súboru na kontrolu
- Premena exportov diagramov (draw.io, Excalidraw) na PDF na zdieľanie
- Zostavenie sady obrázkov grafov do správy

## Tipy

- Súbory PNG s priehľadnosťou dostanú v PDF biele pozadie. Ak potrebujete iné pozadie, upravte obrázky vopred.
- Pri snímkach obrazovky a diagramoch s ostrými hranami a textom sa vysokou kvalitou vyhnete kompresným artefaktom JPEG. Stredná alebo nízka kvalita môže interne previesť obrázok na JPEG.

## Súvisiace nástroje

- [Obrázky do PDF](./image-to-pdf)
- [JPG do PDF](./jpg-to-pdf)
- [SVG do PDF](./svg-to-pdf)
