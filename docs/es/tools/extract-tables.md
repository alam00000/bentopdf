---
title: Extraer Tablas de PDF
description: Detecta y extrae tablas de documentos PDF. Exporta como CSV, JSON o Markdown con granularidad por tabla.
---

# Extraer Tablas de PDF

Detecta todas las tablas de un PDF y te permite exportarlas en el formato que prefieras: CSV, JSON o Markdown. Cada tabla se extrae de forma individual con metadatos de página y posición. Funciona con el motor de detección de tablas de PyMuPDF.

## Cómo Funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo sobre ella.
2. Selecciona tu **formato de exportación** preferido: CSV, JSON o Markdown.
3. Haz clic en **Extraer tablas** para iniciar el procesamiento.
4. Si se encuentra una tabla, se descarga como un solo archivo. Si hay varias tablas, se genera un archivo ZIP con un archivo por tabla.

## Opciones

- **Formato de exportación**: elige entre:
  - **CSV**: valores separados por comas con las comillas adecuadas para campos que contienen comas, comillas o saltos de línea. Adecuado para hojas de cálculo y bases de datos.
  - **JSON**: estructura de arreglos de arreglos, con formato legible y sangría de 2 espacios. Adecuado para su consumo por programas.
  - **Markdown**: formato de tabla delimitado por barras verticales, generado por PyMuPDF. Adecuado para documentación y archivos README.

## Formato de Salida

- **Una sola tabla**: `filename_table.csv` (o `.json` / `.md`)
- **Varias tablas**: `filename_tables.zip` con archivos llamados `table_1_page3.csv`, `table_2_page5.csv`, etc.

## Casos de Uso

- Extraer tablas específicas de informes PDF extensos sin sacar los datos de todo el documento.
- Obtener tablas en formato Markdown para pegarlas directamente en issues de GitHub, wikis o documentación.
- Sacar datos JSON estructurados de tablas de PDF para integraciones de API o scripts.
- Comparar tablas entre distintas versiones de un PDF exportando ambas a CSV y comparando las diferencias.

## Consejos

- Esta herramienta te da control por tabla. Si solo quieres volcar todas las tablas en un único CSV, usa [PDF a CSV](./pdf-to-csv). Para un libro completo de Excel, usa [PDF a Excel](./pdf-to-excel).
- Las tablas que abarcan varias páginas pueden detectarse como tablas separadas por página. Es posible que debas concatenarlas manualmente.
- Si no se detecta ninguna tabla, el PDF podría ser una imagen escaneada. Pásalo primero por OCR para agregar una capa de texto.

## Herramientas Relacionadas

- [PDF a CSV](./pdf-to-csv)
- [PDF a Excel](./pdf-to-excel)
- [PDF a Texto](./pdf-to-text)
