---
title: PDF a JSON
description: Convierte archivos PDF a formato JSON estructurado con CPDF. Exporta la estructura interna del PDF como datos JSON legibles por máquina.
---

# PDF a JSON

Convierte uno o más archivos PDF a formato JSON. La herramienta usa CPDF (Coherent PDF) para serializar la estructura interna de cada PDF en una representación JSON legible por máquina. El resultado siempre se entrega como un archivo ZIP.

## Cómo funciona

1. Selecciona uno o más archivos PDF con el selector de archivos.
2. Haz clic en **Convertir** para iniciar el procesamiento. La conversión se ejecuta en un web worker en segundo plano.
3. Se descarga un archivo ZIP con un archivo JSON por cada PDF de entrada.

La barra de estado muestra el progreso de las etapas de conversión y de creación del ZIP.

## Opciones

Esta herramienta no tiene opciones configurables. Cada PDF se convierte a su representación JSON completa.

## Formato de salida

- Un archivo `pdfs-to-json.zip` con `filename.json` por cada PDF de entrada.

La salida JSON representa la estructura interna de objetos del PDF, incluidos árboles de páginas, referencias de fuentes, metadatos y flujos de contenido.

## Casos de uso

- Inspeccionar la estructura interna de un PDF para depuración o validación.
- Extraer metadatos estructurados y propiedades de página mediante programación.
- Alimentar flujos de procesamiento personalizados con datos de la estructura del PDF.
- Auditar documentos PDF para verificar su cumplimiento analizando sus árboles de objetos.

## Consejos

- Esta herramienta devuelve la estructura de objetos del PDF sin procesar, no el texto extraído. Si necesitas el texto de las páginas en formato JSON, usa en su lugar [Preparar PDF para IA](./prepare-pdf-for-ai).
- Para extraer texto sin formato, [PDF a Texto](./pdf-to-text) es más directo.
- Los PDF grandes con estructuras complejas producen archivos JSON muy grandes.

## Herramientas relacionadas

- [PDF a Texto](./pdf-to-text)
- [Preparar PDF para IA](./prepare-pdf-for-ai)
- [Extraer Tablas de PDF](./extract-tables)
