---
title: Pripraviť PDF pre AI
description: Extrahujte obsah PDF do štruktúrovaného JSON optimalizovaného pre LLM a AI pipeline, ako je LlamaIndex. Podporuje dávkové spracovanie.
---

# Pripraviť PDF pre AI

Extrahuje obsah zo súborov PDF a štruktúruje ho ako JSON optimalizovaný na spracovanie veľkými jazykovými modelmi (LLM) a AI frameworkmi, ako je LlamaIndex. Obsah každej strany sa extrahuje a usporiada do štruktúrovaného formátu pripraveného pre RAG pipeline, chatboty alebo systémy sémantického vyhľadávania.

## Ako to funguje

1. Nahrajte jedno alebo viac PDF kliknutím na oblasť nahrávania alebo pretiahnutím súborov.
2. Kliknutím na **Extrahovať** spustíte spracovanie.
3. Jeden súbor sa stiahne ako `filename_llm.json`. Z viacerých súborov vznikne archív `pdf-for-ai.zip`.

Nástroj používa integráciu PyMuPDF s LlamaIndex na extrakciu obsahu na úrovni strán spolu s metadátami, takže výstup sa dá priamo načítať do AI frameworkov.

## Možnosti

Tento nástroj nemá žiadne nastaviteľné možnosti. Všetky strany sa extrahujú s úplným textom a metadátami.

## Formát výstupu

- **Jeden súbor**: `filename_llm.json`
- **Viacero súborov**: `pdf-for-ai.zip` s jedným `_llm.json` pre každé vstupné PDF.

Výstup JSON sa riadi schémou dokumentu LlamaIndex s textovým obsahom a poľami metadát pre každú stranu.

## Prípady použitia

- Príprava dokumentov PDF pre pipeline generovania rozšíreného o vyhľadávanie (RAG).
- Budovanie prehľadávateľnej znalostnej bázy z archívov PDF pre AI chatbota.
- Vkladanie PDF správ do analytických workflow založených na LLM.
- Predspracovanie výskumných prác pre systémy sémantického vyhľadávania a odpovedania na otázky.
- Vytváranie štruktúrovaných trénovacích dát zo zbierok dokumentov PDF.

## Tipy

- Na extrakciu čistého textu bez formátovania špecifického pre AI použite [PDF do Textu](./pdf-to-text).
- Na výstup v Markdowne, ktorý zachová nadpisy a štruktúru, použite [PDF do Markdownu](./pdf-to-markdown).
- Naskenované PDF vytvoria prázdny alebo minimálny výstup. Pred extrakciou ich najprv spracujte pomocou OCR, aby ste pridali textovú vrstvu.

## Súvisiace nástroje

- [PDF do Textu](./pdf-to-text)
- [PDF do Markdownu](./pdf-to-markdown)
- [PDF do JSON](./pdf-to-json)
