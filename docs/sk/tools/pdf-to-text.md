---
title: PDF do textu
description: Extrahujte čistý text zo súborov PDF. Podporuje hromadnú extrakciu z viacerých PDF s výstupom ako súbory TXT.
---

# PDF do textu

Extrahuje všetok textový obsah zo súborov PDF a uloží ho ako čisté súbory `.txt`. Podporuje hromadné spracovanie: nahrajte viac PDF a text z každého získate v jednej operácii. Využíva PyMuPDF.

## Ako to funguje

1. Nahrajte jedno alebo viac PDF kliknutím na oblasť nahrávania alebo presunutím súborov do nej. Zoznam súborov spravujete tlačidlami Pridať ďalšie a Vymazať.
2. Kliknutím na **Extrahovať** spustíte spracovanie.
3. Jeden súbor sa stiahne ako `filename.txt`. Viac súborov vytvorí archív `pdf-to-text.zip`.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Všetok textový obsah sa extrahuje z každej strany v poradí čítania.

## Výstupný formát

- **Jeden súbor**: `filename.txt`
- **Viac súborov**: `pdf-to-text.zip` s jedným `.txt` pre každé vstupné PDF.

## Prípady použitia

- Extrakcia hlavného textu zo správ v PDF na indexovanie pre fulltextové vyhľadávanie.
- Prevod e-kníh alebo článkov v PDF na čistý text na čítanie v zariadeniach s e-ink displejom.
- Získanie textu zo zmlúv alebo právnych dokumentov na analýzu kľúčových slov.
- Odstránenie formátovania z PDF na získanie čistého textu pre skripty na spracovanie dát.
- Príprava textového korpusu z archívov PDF na spracovanie prirodzeného jazyka.

## Tipy

- Naskenované PDF (iba obrázky) vytvoria prázdne textové súbory, pretože neobsahujú textovú vrstvu na extrakciu. Naskenované dokumenty najprv spracujte pomocou OCR.
- Výstup zachováva poradie čítania tak, ako ho interpretuje PyMuPDF, teda spravidla zľava doprava a zhora nadol. Viacstĺpcové rozloženia môžu viesť k premiešanému textu.
- Pre štruktúrovaný výstup s nadpismi a formátovaním vyskúšajte [PDF do Markdownu](./pdf-to-markdown). Pre štruktúrovaný JSON pripravený pre AI použite [Pripraviť PDF pre AI](./prepare-pdf-for-ai).

## Súvisiace nástroje

- [PDF do Markdownu](./pdf-to-markdown)
- [Pripraviť PDF pre AI](./prepare-pdf-for-ai)
- [PDF do Wordu](./pdf-to-word)
