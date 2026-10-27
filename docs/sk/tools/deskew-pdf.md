---
title: Zarovnať naklonené PDF
description: Automaticky vyrovnajte naklonené strany v naskenovaných PDF pomocou detekcie sklonu OpenCV. Nastaviteľný prah a DPI.
---

# Zarovnať naklonené PDF

Naskenované dokumenty sú zriedka dokonale rovné. Aj mierny sklon znižuje presnosť OCR a tlač pôsobí neupravene. Tento nástroj využíva algoritmy spracovania obrazu OpenCV na zistenie uhla sklonu každej strany a jej otočenie späť do roviny.

## Ako to funguje

1. Nahrajte jedno alebo viac naskenovaných PDF.
2. Nastavte **Prah sklonu**: strany so zisteným sklonom pod touto hodnotou zostanú nezmenené.
3. Vyberte **Kvalitu spracovania (DPI)**: vyššie DPI zlepšuje presnosť detekcie, ale trvá dlhšie.
4. Kliknite na **Zarovnať PDF**.
5. Po spracovaní panel výsledkov zobrazí zistený uhol každej strany a či bola opravená.

## Možnosti

| Nastavenie          | Hodnoty                   | Predvolené |
| ------------------- | ------------------------- | ---------- |
| **Prah sklonu**     | 0,1; 0,5; 1,0; 2,0 stupňa | 0,5        |
| **DPI spracovania** | 100, 150, 200, 300        | 150        |

## Ako funguje detekcia sklonu

Nástroj vykreslí každú stranu do obrázka vo zvolenom DPI a potom pomocou OpenCV zistí uhly dominantných čiar v obsahu. Ak zistený sklon prekročí prah, strana sa otočí o opačný uhol, aby sa vyrovnala. Strany pod prahom prejdú bez zmeny.

## Prípady použitia

- Vyčistenie hromadne naskenovaných zmlúv alebo právnych dokumentov
- Príprava naskenovaných účteniek alebo faktúr na spracovanie OCR
- Vyrovnanie strán z plochého skenera s nekonzistentne položeným papierom
- Zlepšenie vizuálnej kvality digitalizovaných archívnych materiálov

## Tipy

- Ak potrebujete na OCR dokonalé zarovnanie, znížte prah na 0,1 stupňa.
- 150 DPI je rýchle a presné pre väčšinu dokumentov. Pre veľmi malý text alebo strany s jemnými detailmi použite 300 DPI.
- Zarovnanie funguje najlepšie pri dokumentoch s jasnými vodorovnými riadkami textu. Problémy môže mať pri stranách, ktoré sú prevažne obrázky alebo obsahujú diagonálne grafické prvky.

## Súvisiace nástroje

- [Rastrovať PDF](./rasterize-pdf): prevod zarovnaného výstupu na ploché PDF založené na obrázkoch
- [Komprimovať PDF](./compress-pdf): zmenšenie veľkosti súboru po zarovnaní
- [Opraviť PDF](./repair-pdf): oprava štrukturálnych problémov v naskenovaných PDF
