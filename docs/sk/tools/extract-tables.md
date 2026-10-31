---
title: Extrahovať PDF tabuľky
description: Rozpoznajte a extrahujte tabuľky z dokumentov PDF. Export do CSV, JSON alebo Markdown pre každú tabuľku zvlášť.
---

# Extrahovať PDF tabuľky

Rozpozná všetky tabuľky v PDF a umožní vám exportovať ich vo zvolenom formáte: CSV, JSON alebo Markdown. Každá tabuľka sa extrahuje samostatne s metadátami o strane a polohe. Poháňa ho engine na rozpoznávanie tabuliek v PyMuPDF.

## Ako to funguje

1. Nahrajte PDF kliknutím na oblasť nahrávania alebo pretiahnutím súboru na ňu.
2. Vyberte preferovaný **formát exportu**: CSV, JSON alebo Markdown.
3. Kliknutím na **Extrahovať** spustíte spracovanie.
4. Ak sa nájde jedna tabuľka, stiahne sa ako jeden súbor. Viac tabuliek vytvorí archív ZIP s jedným súborom na tabuľku.

## Možnosti

- **Formát exportu**: vyberte si z:
  - **CSV**: hodnoty oddelené čiarkou so správnym úvodzovkovaním polí, ktoré obsahujú čiarky, úvodzovky alebo zalomenia riadkov. Vhodné pre tabuľkové procesory a databázy.
  - **JSON**: štruktúra poľa polí, formátovaná s odsadením 2 medzery. Vhodné na programové spracovanie.
  - **Markdown**: tabuľka oddelená zvislými čiarami, ktorú vykreslí PyMuPDF. Vhodné pre dokumentáciu a súbory README.

## Formát výstupu

- **Jedna tabuľka**: `filename_table.csv` (alebo `.json` / `.md`)
- **Viac tabuliek**: `filename_tables.zip` so súbormi s názvami `table_1_page3.csv`, `table_2_page5.csv` atď.

## Prípady použitia

- Extrakcia konkrétnych tabuliek z rozsiahlych PDF správ bez vyťahovania údajov celého dokumentu.
- Získanie tabuliek vo formáte Markdown na priame vloženie do issues na GitHub, wiki alebo dokumentácie.
- Vytiahnutie štruktúrovaných údajov JSON z PDF tabuliek pre integrácie API alebo skripty.
- Porovnanie tabuliek v rôznych verziách PDF exportom oboch do CSV a porovnaním rozdielov.

## Tipy

- Tento nástroj vám dáva kontrolu nad každou tabuľkou. Ak chcete všetky tabuľky jednoducho uložiť do jedného CSV, použite [PDF do CSV](./pdf-to-csv). Pre celý zošit Excel použite [PDF do Excelu](./pdf-to-excel).
- Tabuľky, ktoré presahujú cez viac strán, sa môžu rozpoznať ako samostatné tabuľky na každej strane. Možno ich budete musieť spojiť ručne.
- Ak sa nerozpoznajú žiadne tabuľky, PDF môže byť naskenovaný obrázok. Najprv ho spracujte cez OCR, aby ste pridali textovú vrstvu.

## Súvisiace nástroje

- [PDF do CSV](./pdf-to-csv)
- [PDF do Excelu](./pdf-to-excel)
- [PDF do Textu](./pdf-to-text)
