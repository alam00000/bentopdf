---
title: BMP a PDF
description: Convierte imágenes de mapa de bits BMP a formato PDF directamente en tu navegador, sin subir nada a ningún servidor.
---

# BMP a PDF

Convierte archivos Windows Bitmap (BMP) a PDF. BMP es un formato de imagen sin comprimir que aún se encuentra en sistemas heredados, imagen médica y escáneres industriales. Esta herramienta los convierte a PDF sin necesidad de instalar nada.

## Formatos compatibles

| Formato | Extensiones |
| :------ | :---------- |
| BMP     | `.bmp`      |

## Cómo funciona

1. Haz clic en la zona de carga o arrastra y suelta tus archivos BMP.
2. Revisa la lista de archivos. Añade más archivos o quita los que no quieras.
3. Haz clic en **Convertir a PDF**. El resultado se descarga como `from_bmps.pdf`.

Cada BMP se dibuja en un canvas, se exporta como PNG y luego se incrusta en el PDF con pdf-lib. El tamaño de la página coincide con las dimensiones originales de la imagen.

## Opciones

Esta herramienta no ofrece ajustes de calidad adicionales. Las imágenes se incrustan en su resolución original como PNG sin pérdida dentro del PDF.

## Casos de uso

- Convertir documentos escaneados antiguos guardados como BMP en PDF de archivo
- Convertir capturas de pantalla BMP de aplicaciones antiguas de Windows en documentos fáciles de compartir
- Procesar la salida de escáneres médicos o industriales que usan BMP por defecto
- Migrar archivos de imágenes antiguos a un formato más portátil

## Consejos

- Los archivos BMP no están comprimidos, por lo que suelen ser grandes. El PDF resultante será bastante más pequeño porque las imágenes se recodifican internamente como PNG.
- Si tienes archivos BMP junto con otros formatos de imagen, usa la herramienta [Imágenes a PDF](./image-to-pdf) para convertir todo en un solo lote.

## Herramientas relacionadas

- [Imágenes a PDF](./image-to-pdf)
- [PNG a PDF](./png-to-pdf)
- [TIFF a PDF](./tiff-to-pdf)
