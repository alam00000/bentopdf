---
title: Extrahovať obrázky
description: Extrahujte všetky vložené obrázky zo súborov PDF. Prezrite si ich v mriežke a stiahnite jednotlivo alebo ako archív ZIP.
---

# Extrahovať obrázky

Vytiahne všetky vložené obrázky z jedného alebo viacerých súborov PDF. Extrahované obrázky sa zobrazia v mriežke náhľadov, kde ich môžete stiahnuť jednotlivo alebo všetky naraz ako ZIP. Poháňa ho PyMuPDF.

## Ako to funguje

1. Nahrajte jedno alebo viac PDF kliknutím na oblasť nahrávania alebo pretiahnutím súborov na ňu. Podľa potreby pridajte ďalšie súbory alebo jednotlivé odstráňte.
2. Kliknutím na **Extrahovať** spustíte spracovanie.
3. Nástroj prehľadá každú stranu každého nahraného PDF a nájde a extrahuje vložené obrázky.
4. Extrahované obrázky sa zobrazia v mriežke s náhľadmi. Každý obrázok má tlačidlo na stiahnutie.
5. Kliknutím na **Stiahnuť všetko** uložíte všetko ako archív ZIP.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Všetky vložené obrázky sa extrahujú v natívnom formáte (zvyčajne PNG, JPEG alebo v akomkoľvek formáte, v ktorom bol obrázok do PDF vložený).

## Formát výstupu

- Obrázky sa zobrazia v mriežke náhľadov s názvami `image_1.png`, `image_2.jpg` atď.
- **Stiahnuť všetko** vytvorí `extracted-images.zip` so všetkými obrázkami.
- Jednotlivé obrázky môžete z mriežky sťahovať po jednom.

## Prípady použitia

- Obnovenie fotografií alebo grafiky z PDF na opätovné použitie v inom projekte.
- Extrakcia produktových obrázkov z PDF katalógu pre e-shop.
- Vytiahnutie diagramov z technickej dokumentácie na použitie v prezentáciách.
- Audit toho, ktoré obrázky sú v dokumente vložené, pred jeho zdieľaním.

## Tipy

- Nástroj extrahuje obrázky presne tak, ako sú uložené v PDF. Nevykresľuje strany znova ako obrázky; na to použite [PDF do PNG](./pdf-to-png) alebo [PDF do JPG](./pdf-to-jpg).
- Ak nástroj hlási „Nenašli sa žiadne obrázky“, PDF môže používať vektorovú grafiku namiesto vložených rastrových obrázkov alebo môže ísť o naskenovaný dokument, kde je celá strana jeden veľký obrázok.
- Dávkové spracovanie funguje naprieč viacerými PDF. Všetky obrázky zo všetkých súborov sa spoja do jednej mriežky a jedného ZIP.

## Súvisiace nástroje

- [PDF do PNG](./pdf-to-png)
- [PDF do JPG](./pdf-to-jpg)
- [Tvorca pracovných postupov (Workflow) PDF](./pdf-workflow)
