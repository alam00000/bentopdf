---
title: TIFF a PDF
description: Convierte imágenes TIFF de una o varias páginas a formato PDF en tu navegador con compatibilidad completa de páginas.
---

# TIFF a PDF

Convierte archivos TIFF a PDF, incluidos los TIFF de varias páginas. Cada página (o "IFD") de un archivo TIFF se convierte en una página independiente del PDF resultante. Es especialmente útil para documentos escaneados, faxes e imágenes médicas que suelen almacenarse como TIFF de varias páginas.

## Formatos compatibles

| Formato | Extensiones     |
| :------ | :-------------- |
| TIFF    | `.tiff`, `.tif` |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos TIFF.
2. Revisa la lista de archivos y gestiónala según necesites.
3. Haz clic en **Convertir a PDF**. El resultado se descarga como `from_tiff.pdf`.

La herramienta decodifica cada archivo TIFF con un decodificador TIFF en JavaScript y extrae los datos de píxeles RGBA sin procesar de cada página. Cada página se renderiza en un lienzo, se exporta como PNG y se incrusta en el PDF. Las dimensiones de las páginas coinciden con las de las páginas TIFF originales.

## Opciones

Esta herramienta no expone ajustes de calidad adicionales. Las imágenes se incrustan a su resolución original.

## Casos de uso

- Convertir documentos de fax de varias páginas (TIFF-F) a un formato PDF más portátil
- Convertir archivos de documentos escaneados almacenados como TIFF en PDF con búsqueda (combínalo después con la herramienta de OCR)
- Procesar archivos de imagen médica (láminas de patología, exportaciones de radiología) que usan TIFF
- Convertir archivos TIFF de GIS o imágenes de satélite en documentos para compartir

## Consejos

- Los TIFF de varias páginas son totalmente compatibles. Un TIFF de 10 páginas producirá un PDF de 10 páginas. No necesitas dividir el TIFF antes.
- Los archivos TIFF muy grandes (cientos de megabytes) pueden tardar más en procesarse, ya que todo el archivo debe decodificarse en la memoria del navegador.
- Si necesitas OCR en el PDF resultante, pásalo por la herramienta [OCR PDF](./ocr-pdf) después de la conversión.

## Herramientas relacionadas

- [Imágenes a PDF](./image-to-pdf)
- [BMP a PDF](./bmp-to-pdf)
- [JPG a PDF](./jpg-to-pdf)
