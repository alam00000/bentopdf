---
title: PDF a BMP
description: Convierte páginas de PDF a imágenes BMP sin comprimir. Útil para sistemas heredados y flujos de impresión que requieren mapas de bits.
---

# PDF a BMP

Convierte cada página de un PDF en una imagen BMP (mapa de bits). BMP es un formato sin comprimir, por lo que el resultado es exacto píxel a píxel y sin pérdida de calidad, pero los archivos son grandes.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella.
2. Haz clic en **Convertir** para procesar el archivo.
3. Un único archivo `.bmp` o un archivo ZIP se descarga automáticamente.

## Opciones

Esta herramienta no tiene opciones configurables. Las páginas se renderizan a una escala fija de 2x, lo que produce imágenes con aproximadamente el doble de las dimensiones nativas de la página del PDF.

## Formato de salida

- **Una página**: `filename.bmp`
- **Varias páginas**: `filename_bmps.zip` con `page_1.bmp`, `page_2.bmp`, etc.

## Casos de uso

- Enviar páginas de PDF a sistemas o equipos heredados que solo aceptan BMP.
- Preparar imágenes sin comprimir para flujos de impresión específicos.
- Usar la salida en mapa de bits como entrada de herramientas de procesamiento de imágenes que requieren datos de píxeles sin procesar.

## Consejos

- Los archivos BMP son muy grandes porque almacenan los píxeles sin comprimir. Para la mayoría de los usos, [PDF a PNG](./pdf-to-png) ofrece calidad sin pérdida con archivos mucho más pequeños.
- Si tu sistema de destino acepta PNG o TIFF, prefiere esos formatos para ahorrar espacio en disco.

## Herramientas relacionadas

- [PDF a PNG](./pdf-to-png)
- [PDF a TIFF](./pdf-to-tiff)
- [PDF a JPG](./pdf-to-jpg)
