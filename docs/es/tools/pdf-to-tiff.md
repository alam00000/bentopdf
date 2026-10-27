---
title: PDF a TIFF
description: Convierte páginas de PDF a imágenes TIFF, muy usadas en impresión, fax y archivado. Recurre a PNG si falla la codificación.
---

# PDF a TIFF

Convierte cada página de un PDF en una imagen TIFF. TIFF es el formato estándar para producción de impresión, sistemas de fax y archivado de documentos. La herramienta usa compresión PackBits para codificar el TIFF y recurre a PNG si una página no se puede codificar.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella.
2. Haz clic en **Convertir** para procesar el archivo.
3. Un único archivo TIFF o un archivo ZIP se descarga automáticamente.

## Opciones

Esta herramienta no tiene opciones configurables. Las páginas se renderizan a una escala fija de 2x.

## Formato de salida

- **Una página**: `filename.tiff`
- **Varias páginas**: `filename_tiffs.zip` con `page_1.tiff`, `page_2.tiff`, etc.

Si la codificación TIFF falla en una página concreta (por problemas de compresión), esa página se guarda como archivo `.png`. En ese caso, el ZIP contendrá una mezcla de archivos TIFF y PNG.

## Casos de uso

- Enviar documentos a organismos públicos o sistemas legales que exigen el formato TIFF.
- Preparar páginas para transmitirlas por fax mediante servicios de fax digital.
- Archivar documentos escaneados en un formato sin pérdida ampliamente compatible.
- Alimentar sistemas empresariales de gestión documental con las páginas.

## Consejos

- Los archivos TIFF son grandes. Si solo necesitas calidad sin pérdida para web o pantalla, [PDF a PNG](./pdf-to-png) es una mejor opción.
- Revisa el contenido del ZIP si algunas páginas necesitaron la alternativa PNG: quizá quieras convertirlas por separado.

## Herramientas relacionadas

- [PDF a PNG](./pdf-to-png)
- [PDF a BMP](./pdf-to-bmp)
- [PDF a JPG](./pdf-to-jpg)
