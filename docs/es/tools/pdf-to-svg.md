---
title: PDF a SVG
description: Convierte páginas de PDF a gráficos vectoriales SVG escalables. Conserva texto y formas como trazados vectoriales para un escalado infinito.
---

# PDF a SVG

Convierte cada página de un PDF en un archivo SVG (Scalable Vector Graphics). A diferencia de los formatos rasterizados, SVG conserva los trazados vectoriales, el texto y las formas, por lo que el resultado se escala a cualquier tamaño sin pixelarse. Funciona con PyMuPDF.

## Cómo funciona

1. Sube uno o más PDF haciendo clic en la zona de carga o arrastrando archivos hasta ella. Puedes agregar varios archivos y gestionarlos individualmente.
2. Haz clic en **Convertir** para procesar todos los archivos subidos.
3. Las conversiones de un solo archivo con una sola página se descargan como un `.svg` independiente. El resto se descarga como archivo ZIP.

## Opciones

Esta herramienta no tiene opciones configurables. Cada página se convierte a SVG con la exportación vectorial nativa de PyMuPDF.

## Formato de salida

- **Un archivo, una página**: `filename.svg`
- **Un archivo, varias páginas**: `filename_svg.zip` con `page_1.svg`, `page_2.svg`, etc.
- **Varios archivos**: `pdf_to_svg.zip` con los archivos organizados por el nombre del documento de origen.

## Casos de uso

- Extraer diagramas vectoriales, gráficos o ilustraciones de informes en PDF para usarlos en páginas web.
- Editar el contenido de las páginas de un PDF en un editor vectorial como Inkscape o Illustrator.
- Incrustar vistas previas de página escalables en aplicaciones web adaptables.
- Extraer logotipos o gráficos de folletos en PDF conservando los bordes nítidos.

## Consejos

- SVG funciona mejor con PDF que contienen contenido vectorial. Los documentos escaneados o los PDF con muchas imágenes producirán archivos SVG grandes con datos rasterizados incrustados.
- Para una salida rasterizada de PDF con muchas imágenes, usa en su lugar [PDF a PNG](./pdf-to-png) o [PDF a JPG](./pdf-to-jpg).
- Esta herramienta admite la conversión por lotes: sube varios PDF a la vez para convertirlos todos en una sola ejecución.

## Herramientas relacionadas

- [PDF a PNG](./pdf-to-png)
- [PDF a JPG](./pdf-to-jpg)
- [PDF a Markdown](./pdf-to-markdown)
