---
title: Preparar PDF para IA
description: Extrae el contenido de un PDF en JSON estructurado y optimizado para LLM y flujos de IA como LlamaIndex. Admite procesamiento por lotes.
---

# Preparar PDF para IA

Extrae el contenido de archivos PDF y lo estructura como JSON optimizado para que lo ingieran modelos de lenguaje de gran tamaño (LLM) y frameworks de IA como LlamaIndex. El contenido de cada página se extrae y se organiza en un formato estructurado listo para flujos RAG, chatbots o sistemas de búsqueda semántica.

## Cómo funciona

1. Sube uno o más PDF haciendo clic en la zona de carga o arrastrando archivos hasta ella.
2. Haz clic en **Extraer** para iniciar el procesamiento.
3. Un solo archivo se descarga como `filename_llm.json`. Varios archivos generan un archivo `pdf-for-ai.zip`.

La herramienta usa la integración de PyMuPDF con LlamaIndex para extraer el contenido por página con metadatos, y produce un resultado que se puede cargar directamente en frameworks de IA.

## Opciones

Esta herramienta no tiene opciones configurables. Todas las páginas se extraen con el texto completo y los metadatos.

## Formato de salida

- **Un solo archivo**: `filename_llm.json`
- **Varios archivos**: `pdf-for-ai.zip` con un `_llm.json` por cada PDF de entrada.

El JSON resultante sigue el esquema de documentos de LlamaIndex, con el texto de cada página y campos de metadatos.

## Casos de uso

- Preparar documentos PDF para flujos de generación aumentada por recuperación (RAG).
- Crear una base de conocimiento consultable a partir de archivos PDF para un chatbot de IA.
- Alimentar informes en PDF a flujos de análisis basados en LLM.
- Preprocesar artículos científicos para sistemas de búsqueda semántica y de preguntas y respuestas.
- Crear datos de entrenamiento estructurados a partir de colecciones de documentos PDF.

## Consejos

- Para extraer texto sin formato específico para IA, usa [PDF a texto](./pdf-to-text).
- Para obtener Markdown que conserve los encabezados y la estructura, usa [PDF a Markdown](./pdf-to-markdown).
- Los PDF escaneados producirán un resultado vacío o mínimo. Pásalos antes por OCR para añadir una capa de texto antes de extraer.

## Herramientas relacionadas

- [PDF a texto](./pdf-to-text)
- [PDF a Markdown](./pdf-to-markdown)
- [PDF a JSON](./pdf-to-json)
