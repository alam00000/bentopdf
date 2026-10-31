---
title: PDF do JSON
description: Prevádzajte súbory PDF do štruktúrovaného formátu JSON pomocou CPDF. Exportuje vnútornú štruktúru PDF ako strojovo čitateľné dáta JSON.
---

# PDF do JSON

Prevedie jeden alebo viac súborov PDF do formátu JSON. Nástroj používa CPDF (Coherent PDF) na serializáciu vnútornej štruktúry každého PDF do strojovo čitateľnej reprezentácie JSON. Výstup sa vždy doručí ako archív ZIP.

## Ako to funguje

1. Vyberte jeden alebo viac súborov PDF pomocou výberu súborov.
2. Kliknutím na **Previesť** spustíte spracovanie. Prevod beží vo web workeri na pozadí.
3. Stiahne sa archív ZIP s jedným súborom JSON pre každé vstupné PDF.

Stavový riadok zobrazuje priebeh fáz prevodu a vytvárania ZIP.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Každé PDF sa prevedie na úplnú reprezentáciu JSON.

## Výstupný formát

- Súbor `pdfs-to-json.zip` obsahujúci `filename.json` pre každé vstupné PDF.

Výstup JSON predstavuje vnútornú objektovú štruktúru PDF vrátane stromov strán, odkazov na písma, metadát a obsahových prúdov.

## Prípady použitia

- Kontrola vnútornej štruktúry PDF pri ladení alebo validácii.
- Programová extrakcia štruktúrovaných metadát a vlastností strán.
- Odovzdávanie údajov o štruktúre PDF do vlastných spracovateľských reťazcov.
- Audit dokumentov PDF z hľadiska súladu analýzou ich objektových stromov.

## Tipy

- Tento nástroj vypisuje surovú objektovú štruktúru PDF, nie extrahovaný textový obsah. Ak potrebujete text strán vo formáte JSON, použite radšej [Pripraviť PDF pre AI](./prepare-pdf-for-ai).
- Na extrakciu čistého textu je priamočiarejší nástroj [PDF do Textu](./pdf-to-text).
- Veľké PDF so zložitou štruktúrou vytvárajú veľmi veľké súbory JSON.

## Súvisiace nástroje

- [PDF do Textu](./pdf-to-text)
- [Pripraviť PDF pre AI](./prepare-pdf-for-ai)
- [Extrahovať PDF tabuľky](./extract-tables)
