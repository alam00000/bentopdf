---
title: PDF a CSV
description: Extrae tablas de documentos PDF y expórtalas como un único archivo CSV. Admite PDF de varias páginas con detección automática de tablas.
---

# PDF a CSV

Extrae tablas de un PDF y las exporta como un archivo CSV. La herramienta analiza cada página en busca de datos tabulares con el motor de detección de tablas de PyMuPDF y escribe todas las filas encontradas en una única salida separada por comas.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella.
2. Haz clic en **Convertir** para iniciar la extracción de tablas.
3. La herramienta analiza cada página e identifica las tablas automáticamente.
4. Se descarga un archivo `.csv` con todos los datos de las tablas extraídas.

Las tablas de páginas distintas se separan con filas en blanco en la salida. Las celdas que contienen comas, comillas o saltos de línea se escapan correctamente según RFC 4180.

## Opciones

Esta herramienta no tiene opciones configurables. Todas las tablas encontradas en el documento se extraen y se combinan en un único CSV.

## Formato de salida

- Un único archivo `filename.csv` con todas las tablas detectadas.

## Casos de uso

- Pasar datos financieros de extractos bancarios o facturas en PDF a una hoja de cálculo.
- Extraer tablas de precios de presupuestos de proveedores para compararlas.
- Convertir datos tabulares de investigaciones en PDF a un formato adecuado para herramientas de análisis.
- Migrar datos de informes PDF antiguos a bases de datos.

## Consejos

- Si no se encuentran tablas, la herramienta muestra el mensaje "No se encontraron tablas". Normalmente significa que el PDF usa un diseño de texto que parece tabular pero no está estructurado como una tabla real.
- Para tener más control sobre cada tabla, usa [Extraer Tablas de PDF](./extract-tables), que permite elegir entre salida en CSV, JSON y Markdown.
- Si necesitas los datos en formato Excel con hojas separadas por tabla, usa [PDF a Excel](./pdf-to-excel).

## Herramientas relacionadas

- [PDF a Excel](./pdf-to-excel)
- [Extraer Tablas de PDF](./extract-tables)
- [PDF a Texto](./pdf-to-text)
