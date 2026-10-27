---
title: Prepara PDF per a IA
description: Extreu el contingut d'un PDF en JSON estructurat optimitzat per a LLM i fluxos d'IA com LlamaIndex. Admet processament per lots.
---

# Prepara PDF per a IA

Extreu el contingut de fitxers PDF i l'estructura en JSON optimitzat per ser ingerit per models de llenguatge grans (LLM) i frameworks d'IA com LlamaIndex. El contingut de cada pàgina s'extreu i s'organitza en un format estructurat llest per a fluxos RAG, xatbots o sistemes de cerca semàntica.

## Com funciona

1. Puja un o més PDF fent clic a la zona de càrrega o arrossegant-hi fitxers.
2. Fes clic a **Extreu** per iniciar el processament.
3. Un sol fitxer es descarrega com a `filename_llm.json`. Diversos fitxers produeixen un arxiu `pdf-for-ai.zip`.

L'eina utilitza la integració de PyMuPDF amb LlamaIndex per extreure el contingut per pàgines amb metadades, i genera un resultat que es pot carregar directament en frameworks d'IA.

## Opcions

Aquesta eina no té cap opció configurable. Totes les pàgines s'extreuen amb text complet i metadades.

## Format de sortida

- **Un sol fitxer**: `filename_llm.json`
- **Diversos fitxers**: `pdf-for-ai.zip` amb un `_llm.json` per cada PDF d'entrada.

El JSON resultant segueix l'esquema de documents de LlamaIndex, amb el contingut de text de cada pàgina i camps de metadades.

## Casos d'ús

- Preparar documents PDF per a fluxos de generació augmentada per recuperació (RAG).
- Crear una base de coneixement cercable a partir d'arxius PDF per a un xatbot d'IA.
- Alimentar fluxos d'anàlisi basats en LLM amb informes en PDF.
- Preprocessar articles de recerca per a sistemes de cerca semàntica i de preguntes i respostes.
- Crear dades d'entrenament estructurades a partir de col·leccions de documents PDF.

## Consells

- Per extreure text pla sense format específic per a IA, utilitza [PDF a text](./pdf-to-text).
- Per obtenir una sortida en Markdown que conservi els encapçalaments i l'estructura, utilitza [PDF a Markdown](./pdf-to-markdown).
- Els PDF escanejats produiran un resultat buit o mínim. Passa'ls primer per l'OCR per afegir-hi una capa de text abans d'extreure.

## Eines relacionades

- [PDF a text](./pdf-to-text)
- [PDF a Markdown](./pdf-to-markdown)
- [PDF a JSON](./pdf-to-json)
