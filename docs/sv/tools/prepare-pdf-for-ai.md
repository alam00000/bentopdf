---
title: Förbered PDF för AI
description: Extrahera PDF-innehåll till strukturerad JSON optimerad för LLM:er och AI-pipelines som LlamaIndex. Stöder batchbearbetning.
---

# Förbered PDF för AI

Extraherar innehåll från PDF-filer och strukturerar det som JSON optimerad för inläsning i stora språkmodeller (LLM:er) och AI-ramverk som LlamaIndex. Varje sidas innehåll extraheras och organiseras i ett strukturerat format som är redo för RAG-pipelines, chattbottar eller semantiska söksystem.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer genom att klicka på släppzonen eller dra filer till den.
2. Klicka på **Extrahera** för att starta bearbetningen.
3. En enskild fil laddas ned som `filename_llm.json`. Flera filer ger ett arkiv, `pdf-for-ai.zip`.

Verktyget använder PyMuPDF:s LlamaIndex-integration för att extrahera innehåll per sida med metadata, och ger utdata som kan läsas in direkt i AI-ramverk.

## Alternativ

Det här verktyget har inga inställningar. Alla sidor extraheras med fullständig text och metadata.

## Utdataformat

- **Enskild fil**: `filename_llm.json`
- **Flera filer**: `pdf-for-ai.zip` med en `_llm.json` per PDF.

JSON-utdata följer LlamaIndex dokumentschema med textinnehåll per sida och metadatafält.

## Användningsområden

- Förbereda PDF-dokument för RAG-pipelines (retrieval-augmented generation).
- Bygga en sökbar kunskapsbas från PDF-arkiv för en AI-chattbot.
- Mata in PDF-rapporter i LLM-baserade analysflöden.
- Förbehandla forskningsartiklar för semantisk sökning och fråga-svar-system.
- Skapa strukturerad träningsdata från PDF-samlingar.

## Tips

- För ren textextraktion utan AI-specifik formatering, använd [PDF till text](./pdf-to-text).
- För Markdown-utdata som bevarar rubriker och struktur, använd [PDF till Markdown](./pdf-to-markdown).
- Skannade PDF-filer ger tomt eller minimalt resultat. Kör dem först genom OCR för att lägga till ett textlager innan extraktion.

## Relaterade verktyg

- [PDF till text](./pdf-to-text)
- [PDF till Markdown](./pdf-to-markdown)
- [PDF till JSON](./pdf-to-json)
