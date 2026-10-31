---
title: PDF a JPG
description: Convierte páginas de PDF a imágenes JPG con calidad ajustable. Los PDF de una página se descargan directamente; los de varias páginas se exportan como ZIP.
---

# PDF a JPG

Convierte cada página de un PDF en una imagen JPG. Los documentos de una sola página se descargan como un archivo `.jpg` independiente. Los PDF de varias páginas generan un archivo ZIP con un JPG por página.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella. La herramienta muestra el nombre del archivo, su tamaño y el número de páginas.
2. Ajusta el control deslizante de **Calidad** para controlar la compresión del JPG.
3. Haz clic en **Convertir** para iniciar el procesamiento.
4. El resultado se descarga automáticamente: un único JPG para PDF de una página o un archivo ZIP para documentos de varias páginas.

## Opciones

- **Calidad**: un control deslizante de 0% a 100% (por defecto 90%). Los valores altos producen imágenes más nítidas y archivos más grandes. Los valores bajos comprimen de forma más agresiva.

Las páginas se renderizan internamente a escala 2x, así que la resolución de salida es el doble de las dimensiones de la página del PDF. Una página estándar tamaño carta produce una imagen de aproximadamente 1.224 x 1.584 píxeles.

## Formato de salida

- **Una página**: `filename.jpg`
- **Varias páginas**: `filename_jpgs.zip` con `page_1.jpg`, `page_2.jpg`, etc.

## Casos de uso

- Generar miniaturas de vista previa para un sistema de gestión documental.
- Compartir una página de un informe en un chat o correo que no admite PDF.
- Crear recursos de imagen a partir de diagramas o ilustraciones en PDF.
- Archivar documentos escaneados como imágenes individuales.

## Consejos

- Para una salida sin pérdida, usa [PDF a PNG](./pdf-to-png).
- Un ajuste de calidad de 80-90% logra un buen equilibrio entre tamaño de archivo y fidelidad visual.
- Si necesitas un formato específico por página, considera el [Constructor de flujos de trabajo PDF](./pdf-workflow), que tiene un nodo de salida de PDF a imágenes.

## Herramientas relacionadas

- [PDF a PNG](./pdf-to-png)
- [PDF a WebP](./pdf-to-webp)
- [PDF a BMP](./pdf-to-bmp)
- [PDF a TIFF](./pdf-to-tiff)
