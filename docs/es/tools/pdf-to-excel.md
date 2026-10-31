---
title: PDF a Excel
description: Extrae tablas de documentos PDF a una hoja de cálculo de Excel. Cada tabla se guarda en su propia hoja con referencia a la página.
---

# PDF a Excel

Extrae tablas de un PDF y las guarda como una hoja de cálculo de Excel (`.xlsx`). Cada tabla detectada se coloca en su propia hoja, etiquetada con su número de tabla y la página de origen. Funciona con PyMuPDF para la detección de tablas y la biblioteca SheetJS para generar el archivo de Excel.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella.
2. Haz clic en **Convertir** para iniciar la extracción de tablas.
3. La herramienta analiza cada página en busca de tablas y luego crea un libro de Excel.
4. Se descarga un archivo `.xlsx` con una hoja por tabla.

## Opciones

Esta herramienta no tiene opciones configurables. Todas las tablas detectadas se extraen automáticamente.

## Formato de salida

- Un único archivo `filename.xlsx`.
- **Una tabla**: una sola hoja llamada "Table".
- **Varias tablas**: hojas llamadas "Table 1 (Page 3)", "Table 2 (Page 5)", etc. Los nombres de hoja se truncan a 31 caracteres (el límite de Excel).

## Casos de uso

- Convertir informes financieros en PDF a hojas de cálculo editables para seguir analizándolos.
- Extraer tablas de inventario o pedidos de PDF de proveedores.
- Pasar datos estructurados de formularios o catálogos en PDF a Excel para ordenarlos y filtrarlos.
- Archivar datos tabulares de PDF en un formato con el que puedan trabajar compañeros sin perfil técnico.

## Consejos

- Si la herramienta indica "No se encontraron tablas", es probable que el PDF use un texto de flujo libre en lugar de tablas estructuradas. Prueba [PDF a Texto](./pdf-to-text) para obtener el contenido sin procesar.
- Para un formato plano más simple, usa [PDF a CSV](./pdf-to-csv). Para descargas por tabla en varios formatos, usa [Extraer Tablas de PDF](./extract-tables).
- Revisa los nombres de las hojas para saber de qué página procede cada tabla.

## Herramientas relacionadas

- [PDF a CSV](./pdf-to-csv)
- [Extraer Tablas de PDF](./extract-tables)
- [PDF a Texto](./pdf-to-text)
