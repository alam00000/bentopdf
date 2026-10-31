---
title: PDF voorbereiden voor AI
description: Haal PDF-inhoud op als gestructureerde JSON, geoptimaliseerd voor LLM's en AI-pijplijnen zoals LlamaIndex. Ondersteunt batchverwerking.
---

# PDF voorbereiden voor AI

Haalt inhoud uit PDF-bestanden en structureert die als JSON, geoptimaliseerd voor invoer in grote taalmodellen (LLM's) en AI-frameworks zoals LlamaIndex. De inhoud van elke pagina wordt opgehaald en georganiseerd in een gestructureerd formaat, klaar voor RAG-pijplijnen, chatbots of semantische zoeksystemen.

## Hoe het werkt

1. Upload een of meer PDF's door op het sleepgebied te klikken of bestanden erheen te slepen.
2. Klik op **Extraheren** om de verwerking te starten.
3. Eén bestand wordt gedownload als `filename_llm.json`. Meerdere bestanden leveren een `pdf-for-ai.zip`-archief op.

De tool gebruikt de LlamaIndex-integratie van PyMuPDF om inhoud per pagina met metadata op te halen. De uitvoer kan direct in AI-frameworks worden geladen.

## Opties

Deze tool heeft geen instelbare opties. Alle pagina's worden opgehaald met volledige tekst en metadata.

## Uitvoerformaat

- **Eén bestand**: `filename_llm.json`
- **Meerdere bestanden**: `pdf-for-ai.zip` met één `_llm.json` per invoer-PDF.

De JSON-uitvoer volgt het LlamaIndex-documentschema met tekstinhoud per pagina en metadatavelden.

## Toepassingen

- PDF-documenten voorbereiden voor retrieval-augmented generation (RAG)-pijplijnen.
- Een doorzoekbare kennisbank opbouwen uit PDF-archieven voor een AI-chatbot.
- PDF-rapporten invoeren in op LLM's gebaseerde analyseprocessen.
- Onderzoeksartikelen voorverwerken voor semantisch zoeken en vraag-en-antwoordsystemen.
- Gestructureerde trainingsdata maken uit verzamelingen PDF-documenten.

## Tips

- Voor platte tekstextractie zonder AI-specifieke opmaak gebruik je [PDF naar tekst](./pdf-to-text).
- Voor Markdown-uitvoer die koppen en structuur behoudt gebruik je [PDF naar Markdown](./pdf-to-markdown).
- Gescande PDF's leveren lege of minimale uitvoer op. Voer ze eerst door OCR om een tekstlaag toe te voegen voordat je ze extraheert.

## Gerelateerde tools

- [PDF naar tekst](./pdf-to-text)
- [PDF naar Markdown](./pdf-to-markdown)
- [PDF naar JSON](./pdf-to-json)
