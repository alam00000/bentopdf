---
title: Extraer imágenes
description: Extrae todas las imágenes incrustadas de archivos PDF. Previsualízalas en una cuadrícula y descárgalas individualmente o como un archivo ZIP.
---

# Extraer imágenes

Saca todas las imágenes incrustadas de uno o más archivos PDF. Las imágenes extraídas se muestran en una cuadrícula de vista previa donde puedes descargarlas individualmente o todas a la vez como un ZIP. Funciona con PyMuPDF.

## Cómo Funciona

1. Sube uno o más PDFs haciendo clic en la zona de carga o arrastrando archivos sobre ella. Agrega más archivos o quita archivos individuales según necesites.
2. Haz clic en **Extraer imágenes** para iniciar el procesamiento.
3. La herramienta recorre cada página de cada PDF subido, buscando y extrayendo las imágenes incrustadas.
4. Las imágenes extraídas aparecen en una cuadrícula con miniaturas. Cada imagen tiene un botón de descarga.
5. Haz clic en **Descargar todo** para guardar todo como un archivo ZIP.

## Opciones

Esta herramienta no tiene opciones configurables. Todas las imágenes incrustadas se extraen en su formato original (normalmente PNG, JPEG o el formato que se usó cuando la imagen se incrustó en el PDF).

## Formato de Salida

- Las imágenes se muestran en una cuadrícula de vista previa con nombres como `image_1.png`, `image_2.jpg`, etc.
- **Descargar todo** genera `extracted-images.zip` con todas las imágenes.
- Las imágenes individuales se pueden descargar una por una desde la cuadrícula.

## Casos de Uso

- Recuperar fotos o gráficos de un PDF para reutilizarlos en otro proyecto.
- Extraer imágenes de productos del PDF de un catálogo para un listado de comercio electrónico.
- Sacar diagramas de documentación técnica para usarlos en presentaciones.
- Auditar qué imágenes están incrustadas en un documento antes de compartirlo.

## Consejos

- La herramienta extrae las imágenes exactamente como están almacenadas en el PDF. No vuelve a renderizar las páginas como imágenes; para eso, usa [PDF a PNG](./pdf-to-png) o [PDF a JPG](./pdf-to-jpg).
- Si la herramienta muestra "No se encontraron imágenes", es posible que el PDF use gráficos vectoriales en lugar de imágenes raster incrustadas, o que sea un documento escaneado donde toda la página es una sola imagen grande.
- El procesamiento por lotes funciona con varios PDFs. Todas las imágenes de todos los archivos se combinan en una sola cuadrícula y un solo ZIP.

## Herramientas Relacionadas

- [PDF a PNG](./pdf-to-png)
- [PDF a JPG](./pdf-to-jpg)
- [Constructor de flujos de trabajo PDF](./pdf-workflow)
