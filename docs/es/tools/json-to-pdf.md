---
title: JSON a PDF
description: Reconstruye archivos PDF a partir del formato JSON de BentoPDF. Convierte las exportaciones JSON de vuelta en sus documentos PDF originales.
---

# JSON a PDF

Reconstruye documentos PDF a partir de archivos JSON creados previamente con la herramienta **PDF a JSON** de BentoPDF. Es una herramienta de conversión de ida y vuelta: toma la representación JSON estructurada de un PDF y reconstruye el documento original.

::: warning
Esta herramienta solo acepta archivos JSON generados por el conversor PDF a JSON de BentoPDF. No admite archivos JSON estándar de APIs, bases de datos u otras herramientas.
:::

## Formatos compatibles

| Entrada | Descripción                                                        |
| :------ | :----------------------------------------------------------------- |
| `.json` | Archivos JSON exportados con la herramienta PDF a JSON de BentoPDF |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta uno o más archivos JSON.
2. La lista de archivos muestra cada archivo seleccionado con su tamaño.
3. Haz clic en **Convertir a PDF**. La herramienta procesa todos los archivos con un Web Worker y el motor CPDF.
4. El resultado se descarga como `jsons-to-pdf.zip`, con un PDF por cada archivo JSON de entrada.

La conversión se ejecuta en un Web Worker en segundo plano, así que la interfaz sigue respondiendo incluso con archivos grandes.

## Opciones

Esta herramienta no tiene opciones configurables. La estructura del JSON determina por completo el PDF resultante.

## Resultado

Al convertir varios archivos JSON, los resultados se entregan en un archivo ZIP. Cada PDF lleva el nombre de su JSON de origen (por ejemplo, `report.json` pasa a ser `report.pdf`).

## Casos de uso

- Restaurar PDF desde una copia de seguridad o un flujo de archivo basados en JSON
- Pasar un PDF a JSON para inspeccionarlo y volver a convertirlo a PDF
- Reconstruir documentos tras modificar programáticamente la estructura del JSON
- Verificar que una exportación de PDF a JSON capturó todo el contenido del documento, convirtiéndolo de nuevo

## Consejos

- Si necesitas convertir datos JSON arbitrarios (como respuestas de API o archivos de configuración) en un PDF con formato, la herramienta [Texto a PDF](./txt-to-pdf) es más adecuada. Pega el JSON como texto y se mostrará con el formato correcto.
- El motor CPDF WebAssembly debe estar disponible para que esta herramienta funcione. Las instancias autoalojadas necesitan tener configurados los archivos WASM de CPDF.

## Herramientas relacionadas

- [Texto a PDF](./txt-to-pdf)
- [Markdown a PDF](./markdown-to-pdf)
- [CSV a PDF](./csv-to-pdf)
