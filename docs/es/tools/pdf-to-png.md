---
title: PDF a PNG
description: Convierte páginas de PDF a imágenes PNG sin pérdida con escala ajustable. Ideal para capturas de alta calidad y fondos transparentes.
---

# PDF a PNG

Convierte cada página de un PDF en una imagen PNG. PNG usa compresión sin pérdida, por lo que el resultado conserva todos los detalles de la página original. Los PDF de una página se descargan como un archivo `.png`; los de varias páginas generan un ZIP.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella.
2. Ajusta el control deslizante de **Escala** para controlar la resolución de salida.
3. Haz clic en **Convertir** para iniciar el procesamiento.
4. Un único PNG o un archivo ZIP se descarga automáticamente.

## Opciones

- **Escala**: va de 1.0x a 3.0x (por defecto 2.0x). A 2.0x, una página estándar tamaño carta se renderiza a unos 1.224 x 1.584 píxeles. Los valores de escala más altos producen imágenes más grandes y nítidas a costa del tamaño del archivo y del tiempo de procesamiento.

## Formato de salida

- **Una página**: `filename.png`
- **Varias páginas**: `filename_pngs.zip` con `page_1.png`, `page_2.png`, etc.

## Casos de uso

- Capturar páginas de PDF con alta fidelidad para presentaciones.
- Extraer gráficos o diagramas que necesitan bordes nítidos y sin artefactos de compresión.
- Preparar recursos para diseño web a partir de maquetas en PDF.
- Crear imágenes de página sin pérdida para el preprocesamiento de OCR.

## Consejos

- Los archivos PNG son bastante más grandes que los JPG. Si el tamaño del archivo importa más que la calidad perfecta, usa [PDF a JPG](./pdf-to-jpg) o [PDF a WebP](./pdf-to-webp).
- A escala 1.0x, la salida coincide con la resolución nativa del PDF. Sube a 3.0x para exportaciones con calidad de impresión.

## Herramientas relacionadas

- [PDF a JPG](./pdf-to-jpg)
- [PDF a WebP](./pdf-to-webp)
- [PDF a SVG](./pdf-to-svg)
