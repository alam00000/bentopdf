---
title: Odstrániť metadáta
description: Odstráňte zo súborov PDF všetky skryté metadáta vrátane autora, názvu, dátumu vytvorenia, producenta, údajov XMP a ID dokumentu.
---

# Odstrániť metadáta

Každé PDF nesie metadáta, ktoré môžu prezradiť, kto ho vytvoril, aký softvér sa použil, kedy bolo naposledy upravené a ďalšie. Tento nástroj ich odstráni všetky (slovník info, prúdy metadát XMP, ID dokumentu a údaje špecifické pre aplikácie) a ponechá čistý dokument bez stopy po jeho pôvode.

## Ako to funguje

1. Nahrajte súbor PDF.
2. Kliknite na **Odstrániť metadáta**.
3. Stiahnite vyčistený súbor.

Nie je čo nastavovať. Nástroj je zámerne dôkladný: vymaže všetko.

## Čo sa odstráni

- **Polia slovníka info**: názov, autor, predmet, kľúčové slová, tvorca, producent, dátum vytvorenia, dátum úpravy
- **Prúd metadát XMP**: blok metadát vo formáte XML uložený v katalógu dokumentu
- **ID dokumentu**: jedinečné identifikátory v traileri PDF, pomocou ktorých sa dá dokument sledovať naprieč systémami
- **PieceInfo**: metadáta špecifické pre aplikácie pridané programami ako Illustrator alebo InDesign

## Čo zostane

- Všetok viditeľný obsah strán (text, obrázky, grafika)
- Polia formulárov a anotácie
- Záložky a odkazy
- Samotná štruktúra dokumentu

## Prípady použitia

- Odstránenie vášho mena a organizácie z dokumentu pred jeho anonymným zverejnením
- Odstránenie časových pečiatok vytvorenia, ktoré prezrádzajú, kedy bol dokument pripravený
- Vyčistenie reťazcov producenta, ktoré identifikujú váš softvér na prácu s PDF
- Príprava dokumentov na regulačné podania, ktoré vyžadujú PDF bez metadát
- Odstránenie stôp histórie úprav pred zdieľaním dokumentu navonok

## Tipy

- Najprv použite nástroj Zobraziť metadáta, aby ste presne videli, aké metadáta vaše PDF obsahuje, skôr než ich odstránite.
- Ak potrebujete odstrániť metadáta _a zároveň_ JavaScript, anotácie a vložené súbory, použite na dôkladnejšie čistenie Vyčistiť PDF.
- Odstránenie metadát je trvalé. Ak by ste tieto údaje mohli neskôr potrebovať, ponechajte si originál.

## Súvisiace nástroje

- [Vyčistiť PDF](./sanitize-pdf): odstránenie metadát spolu so skriptmi, prílohami a ďalším
- [Zašifrovať PDF](./protect-pdf): ochrana vyčisteného PDF heslom
- [Komprimovať PDF](./compress-pdf): odstránenie metadát môže mierne zmenšiť súbor; kompresiou ušetríte viac
