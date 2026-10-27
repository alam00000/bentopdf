---
title: Písma do kriviek
description: Preveďte všetky písma v PDF na vektorové krivky pre konzistentné vykreslenie na všetkých zariadeniach. Odstráni problémy so závislosťou od písiem.
---

# Písma do kriviek

Prevod písiem na krivky premení každý znak textu z glyfu písma na vektorovú cestu. PDF potom nezávisí od žiadnych nainštalovaných písiem a vykreslí sa rovnako na každom zariadení, v každom operačnom systéme a na každej tlačiarni. Ide o štandardný krok v predtlačovej príprave.

## Ako to funguje

1. Nahrajte jeden alebo viac súborov PDF.
2. Kliknite na **Previesť na krivky**.
3. Ghostscript prevedie všetok text na vektorové cesty.
4. Stiahnite výsledok. Viac súborov vytvorí archív ZIP.

Nie je čo nastavovať. Nástroj používa Ghostscript (WebAssembly) a v jednom kroku prevedie všetky odkazy na písma na krivky.

## Čo sa zmení

- Znaky textu sa stanú vektorovými krivkami (Bézierove cesty)
- Vkladanie písiem už nie je potrebné, PDF je sebestačné na úrovni glyfov
- Veľkosť súboru sa môže zväčšiť, pretože vektorové cesty sú zvyčajne väčšie ako odkazy na písma
- Vzhľad zostane presne zachovaný

## Čo stratíte

- Označovanie a kopírovanie textu
- Vyhľadávanie v texte (Ctrl+F prestane fungovať)
- Možnosť upravovať text
- Prístupnosť pre čítačky obrazovky

## Príklady použitia

- Odoslanie PDF do tlačiarne, ktorá vyžaduje písma prevedené na krivky
- Zdieľanie dokumentov s vlastnými alebo licencovanými písmami s ľuďmi, ktorí tieto písma nemajú
- Zabránenie náhrade písiem, ktorá mení vzhľad dokumentu v iných systémoch
- Príprava PDF pre laserové gravírovanie alebo CNC rezanie, ktoré vyžadujú vektorový vstup
- Zabezpečenie správneho zobrazenia PDF plného log na všetkých platformách

## Tipy

- Pôvodné PDF si ponechajte. Prevod na krivky je nevratný, cesty už nemožno previesť späť na upraviteľný text.
- Ak potrebujete, aby text zostal vyhľadávateľný, zvážte radšej nástroj Rastrovať PDF a následne OCR.
- PDF s krivkami bývajú väčšie. Ak záleží na veľkosti súboru, použite potom Komprimovať PDF.

## Súvisiace nástroje

- [Zlúčiť vrstvy PDF](./flatten-pdf): zlúčte formuláre a anotácie bez zmeny písiem
- [Rastrovať PDF](./rasterize-pdf): prevod na obrázkové PDF namiesto vektorových kriviek
- [Komprimovať PDF](./compress-pdf): zmenšite súbor po prevode na krivky
- [PDF do PDF/A](./pdf-to-pdfa): prevod na archiváciu po zaistení nezávislosti od písiem
