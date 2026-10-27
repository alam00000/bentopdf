---
title: Komprimovať PDF
description: Zmenšite veľkosť PDF až o 90 % s enginom Hyper Compress. Podporuje cieľovú veľkosť súboru, dávkové spracovanie a vlastné nastavenia kvality.
---

# Komprimovať PDF

Zmenšite svoje PDF bez toho, aby ste ich poškodili. Komprimovať PDF poháňa [Hyper Compress](https://www.bentopdf.com/hyper-compress), vlastný kompresný engine BentoPDF. Znovu komprimuje obrázky, vytvára podmnožiny písiem a zlučuje ich a odstraňuje zbytočnú záťaž, napríklad vložené náhľady a súkromné údaje aplikácií. PDF zostáva plne funkčné: text sa dá stále vyberať, odkazy a polia formulárov fungujú.

Hyper Compress je skompilovaný do WebAssembly a dodáva sa s BentoPDF, takže kompresia funguje offline aj v izolovaných (air-gapped) nasadeniach bez ďalšieho nastavovania.

## Ako to funguje

1. Nahrajte jedno alebo viac PDF kliknutím na oblasť nahrávania alebo pretiahnutím súborov.
2. Vyberte **Úroveň kompresie**: Nízka, Stredná, Vysoká alebo Bezstratová.
3. Voliteľne zadajte **Cieľovú veľkosť súboru** alebo rozbaľte **Vlastné nastavenia** pre podrobné ovládanie vrátane možnosti **Previesť na odtiene sivej**.
4. Kliknite na **Komprimovať PDF**. Pri viacerých súboroch dostanete jeden ZIP na stiahnutie.

## Špeciálne dokumenty

- **Digitálne podpísané PDF** sa vrátia nezmenené, pretože akákoľvek zmena by podpis zneplatnila. Ak ich chcete komprimovať a podpisy odstrániť, zapnite **Prepísať ochranu obsahu** vo Vlastných nastaveniach; viditeľný podpis zostane na strane, ale súbor už nebude podpísaný.
- **Súbory PDF/A** po kompresii stratia označenie PDF/A, aby súbor nikdy netvrdil súlad, ktorý už nespĺňa. Ak chcete súbor namiesto toho ponechať v súlade, zapnite **Zachovať PDF/A** vo Vlastných nastaveniach.
- **PDF chránené heslom** dostanú na svojej karte súboru pole na heslo. Zadajte tam heslo a Hyper Compress súbor otvorí sám, bez samostatného kroku odomknutia. Pri dvoch alebo viacerých zamknutých súboroch jedno spoločné pole odomkne každý súbor s rovnakým heslom. Komprimovaná kópia nemá heslo; na jeho opätovné pridanie použite [Zašifrovať PDF](./protect-pdf).
- **Skeny bez textovej vrstvy** sa dajú ešte viac zmenšiť pomocou **Rastrovať strany** vo Vlastných nastaveniach, čo každú stranu nahradí jedným optimalizovaným obrázkom. Pri dokumentoch s vyberateľným textom vrátane skenov s OCR sa tento krok preskočí, pokiaľ nie je zapnuté **Prepísať ochranu obsahu**. Potom sa aj textové strany zmenia na obrázky, takže text sa už nedá vyberať a odkazy prestanú fungovať.

## Úrovne kompresie

| Úroveň          | Kvalita obrázkov   | Max. rozlíšenie | Najvhodnejšie pre                   |
| --------------- | ------------------ | --------------- | ----------------------------------- |
| **Nízka**       | 80                 | 200 DPI         | Zachovanie vizuálnej kvality        |
| **Stredná**     | 50                 | 150 DPI         | Bežné dokumenty                     |
| **Vysoká**      | 20                 | 72 DPI          | Prílohy e-mailov, nahrávanie na web |
| **Bezstratová** | Obrázky nedotknuté | Nezmenené       | Archívne kópie                      |

Vysoká úroveň tiež zruší vloženie 14 štandardných písiem PDF a podobných písiem, napríklad Arial, ak je to bezpečné.

## Cieľová veľkosť súboru

Zadajte veľkosť v KB alebo MB a Hyper Compress vyhľadá najlepšiu kvalitu obrázkov, ktorá sa ešte zmestí, počnúc vybranou úrovňou. Ak sa dokument nedá zmenšiť až tak, dostanete najmenšiu verziu, akú dokáže vytvoriť, a správu o tom. Špeciálne stránky, napríklad [Komprimovať PDF na 1 MB](https://www.bentopdf.com/compress-pdf-to-1mb), sa otvoria s už vyplneným cieľom.

## Vlastné nastavenia

Rozbaľte panel Vlastné nastavenia a upravte Hyper Compress priamo. Výber úrovne kompresie nastaví tieto hodnoty podľa danej úrovne a úprava ktorejkoľvek z nich prepne úroveň na Vlastnú.

- **Prepísať ochranu obsahu**: Hyper Compress v predvolenom stave nemení podpísané PDF a nerastruje strany s textom. Zapnutím tejto možnosti obídete oboje. Zostane zapnutá aj pri zmene úrovne.

- **Obrázky**: kvalita obrázkov, maximálne rozlíšenie, vynútené prevzorkovanie, redukcia farieb, orezanie neviditeľných oblastí obrázkov, odstránenie alternatívnych obrázkov, zjednodušenie farebných profilov, JPEG 2000 a bezstratový režim
- **Písma**: podmnožiny, zlúčenie duplikátov a zrušenie vloženia štandardných písiem a podobných písiem
- **Obsah**: zlúčenie (flatten) anotácií, polí formulárov alebo odkazov
- **Čistenie**: odstránenie náhľadov, údajov aplikácií, článkových vlákien, informácií o webovom zachytení, stromu štruktúry alebo výstupných zámerov (output intents)
- **Rastrovanie**: nahradenie strán obrázkami pre skeny len s obrázkami; preskočí sa, ak má dokument vyberateľný text
- **Výstup**: Zachovať PDF/A a kompresia Brotli pre čítačky PDF 2.0, ktoré ju podporujú

## Prípady použitia

- Zmenšenie 50 MB správy pod limit príloh e-mailu
- Dostanie skenu pod prísny limit nahrávania portálu pomocou cieľovej veľkosti súboru
- Optimalizácia marketingových PDF pre rýchlejšie sťahovanie z webu
- Archivácia veľkých súborov dokumentov, kde záleží na nákladoch na úložisko
- Zníženie spotreby mobilných dát pri zdieľaní PDF cez aplikácie na posielanie správ

## Tipy

- Začnite so Strednou úrovňou. Ak je výsledok stále príliš veľký, nastavte cieľovú veľkosť súboru alebo prejdite na Vysokú.
- Pri skene bez textovej vrstvy zapnite Rastrovať strany vo Vlastných nastaveniach.
- Previesť na odtiene sivej vo Vlastných nastaveniach môže zmenšiť veľkosť dokumentov s množstvom farieb.

## Súvisiace nástroje

- [Linearizovať PDF](./linearize-pdf): optimalizácia komprimovaného PDF na rýchle zobrazenie na webe
- [Rastrovať PDF](./rasterize-pdf): prevod strán na obrázky v konkrétnom DPI vrátane strán s textom
- [Opraviť PDF](./repair-pdf): oprava PDF, ktoré sa poškodilo pri kompresii inde
- [Odstrániť metadáta](./remove-metadata): odstránenie skrytých údajov kvôli súkromiu
