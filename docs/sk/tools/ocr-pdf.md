---
title: Rozpoznávanie textu (OCR) PDF
description: Sprístupnite naskenované PDF na vyhľadávanie a kopírovanie pomocou Tesseract OCR s podporou viacerých jazykov a filtrovaním znakov.
---

# Rozpoznávanie textu (OCR) PDF

Premeňte naskenované dokumenty na PDF, v ktorých možno vyhľadávať a kopírovať text. Nástroj používa Tesseract OCR na rozpoznanie textu v obrázkoch a na pôvodné strany pridá neviditeľnú textovú vrstvu, takže vzhľad zostane zachovaný a obsah bude plne vyhľadávateľný.

## Ako to funguje

1. Nahrajte naskenované PDF alebo PDF založené na obrázkoch.
2. Zo zoznamu jazykov s vyhľadávaním vyberte jeden alebo viac jazykov, ktoré sa v dokumente nachádzajú.
3. Voliteľne upravte rozšírené nastavenia (rozlíšenie, binarizácia, povolené znaky).
4. Kliknite na **Spustiť OCR** a sledujte priebeh na indikátore v reálnom čase.
5. Po dokončení skontrolujte extrahovaný text a stiahnite vyhľadávateľné PDF alebo obyčajný súbor `.txt`.

## Funkcie

- OCR vo viacerých jazykoch s výberom jazyka s vyhľadávaním
- Neviditeľná textová vrstva zachová pôvodný vzhľad dokumentu
- Indikátor priebehu v reálnom čase a výpis záznamu počas spracovania
- Stiahnutie výsledkov ako vyhľadávateľného PDF alebo textového súboru
- Kopírovanie extrahovaného textu priamo do schránky
- Tri úrovne rozlíšenia na vyváženie rýchlosti a presnosti

## Možnosti

| Nastavenie                      | Hodnoty                                                                                  | Predvolené | Účel                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| **Rozlíšenie**                  | Štandardné (192 DPI), Vysoké (288 DPI), Ultra (384 DPI)                                  | Vysoké     | Vyššie rozlíšenie zlepší presnosť pri malom texte, ale trvá dlhšie         |
| **Binarizovať obrázok**         | Zap. / Vyp.                                                                              | Vyp.       | Zvýši kontrast čistých skenov prevodom na čiernobiele                      |
| **Predvoľba povolených znakov** | Žiadna, Alfanumerické, Čísla + mena, Iba písmená, Iba čísla, Faktúra, Formuláre, Vlastné | Žiadna     | Obmedzí rozpoznávané znaky a zlepší presnosť pre konkrétne typy dokumentov |
| **Povolené znaky**              | Voľný text                                                                               | Prázdne    | Ručne zadaná sada znakov, keď je predvoľba nastavená na Vlastné            |

## Príklady použitia

- Sprístupnenie vyhľadávania v naskenovaných zmluvách a faktúrach pomocou Ctrl+F
- Extrakcia textu z odfotených dokumentov alebo starých papierových záznamov
- Spracovanie účteniek s predvoľbou Faktúra na presné zachytenie súm v dolároch a dátumov
- Vytváranie prístupných PDF z obrázkových skenov kvôli požiadavkám na súlad
- Hromadná extrakcia textu z naskenovaných kníh alebo príručiek

## Tipy

- Ak dokument obsahuje text vo viacerých jazykoch (napr. anglické nadpisy a japonský text), vyberte viac jazykov.
- Pri dokumentoch s vyblednutým alebo málo kontrastným textom použite binarizáciu, môže výrazne zlepšiť presnosť rozpoznávania.
- Predvoľby Faktúra a Formuláre výrazne znížia počet chybných rozpoznaní v štruktúrovaných dokumentoch, pretože ignorujú nepodstatné tvary znakov.

## Súvisiace nástroje

- [Extrahovať PDF tabuľky](./extract-tables)
- [Spojiť PDF](./merge-pdf)
- [Komprimovať PDF](./compress-pdf)
