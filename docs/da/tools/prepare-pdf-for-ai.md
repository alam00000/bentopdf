---
title: Forbered PDF til AI
description: Udtræk PDF-indhold til struktureret JSON optimeret til LLM'er og AI-pipelines som LlamaIndex. Understøtter batchbehandling.
---

# Forbered PDF til AI

Udtrækker indhold fra PDF-filer og strukturerer det som JSON optimeret til indlæsning i store sprogmodeller (LLM'er) og AI-frameworks som LlamaIndex. Indholdet på hver side udtrækkes og organiseres i et struktureret format, der er klar til RAG-pipelines, chatbots eller semantiske søgesystemer.

## Sådan fungerer det

1. Upload en eller flere PDF'er ved at klikke på dropzonen eller trække filer hen på den.
2. Klik på **Udtræk** for at starte behandlingen.
3. En enkelt fil downloades som `filename_llm.json`. Flere filer giver et `pdf-for-ai.zip`-arkiv.

Værktøjet bruger PyMuPDF's LlamaIndex-integration til at udtrække indhold på sideniveau med metadata, så resultatet direkte kan indlæses i AI-frameworks.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Alle sider udtrækkes med fuld tekst og metadata.

## Outputformat

- **Enkelt fil**: `filename_llm.json`
- **Flere filer**: `pdf-for-ai.zip` med én `_llm.json` pr. input-PDF.

JSON-outputtet følger LlamaIndex' dokumentskema med tekstindhold og metadatafelter pr. side.

## Anvendelsesmuligheder

- Forberede PDF-dokumenter til retrieval-augmented generation (RAG)-pipelines.
- Bygge en søgbar vidensbase af PDF-arkiver til en AI-chatbot.
- Føre PDF-rapporter ind i LLM-baserede analyseforløb.
- Forbehandle forskningsartikler til semantisk søgning og spørgsmål-svar-systemer.
- Oprette strukturerede træningsdata fra PDF-samlinger.

## Tips

- Til ren tekstudtrækning uden AI-specifik formatering brug [PDF til tekst](./pdf-to-text).
- Til Markdown-output, der bevarer overskrifter og struktur, brug [PDF til Markdown](./pdf-to-markdown).
- Scannede PDF'er giver tomt eller minimalt output. Kør dem gennem OCR først for at tilføje et tekstlag før udtrækning.

## Relaterede værktøjer

- [PDF til tekst](./pdf-to-text)
- [PDF til Markdown](./pdf-to-markdown)
- [PDF til JSON](./pdf-to-json)
