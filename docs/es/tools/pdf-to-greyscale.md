---
title: PDF a escala de grises
description: Convierte un PDF a color en una versión en escala de grises (blanco y negro). Genera un PDF nuevo sin color en ninguna página.
---

# PDF a escala de grises

Convierte un PDF a color en una versión en escala de grises. Cada página se renderiza, se desatura y se vuelve a incrustar como imagen JPEG en un PDF nuevo. El resultado conserva las dimensiones originales de la página.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella.
2. Haz clic en **Convertir** para procesar el archivo.
3. Se descarga un nuevo `greyscale.pdf` con todas las páginas convertidas a blanco y negro.

Internamente, cada página se renderiza a escala 2x, los datos de píxeles pasan por un filtro de escala de grises y luego se recodifican como JPEG con calidad del 90% y se colocan en un documento PDF nuevo.

## Opciones

Esta herramienta no tiene opciones configurables. La conversión a escala de grises usa una fórmula de luminancia estándar y la calidad JPEG está fijada en el 90%.

## Formato de salida

- Un único archivo `greyscale.pdf` con todas las páginas como imágenes JPEG en escala de grises.

## Casos de uso

- Preparar documentos para imprimir en blanco y negro y ahorrar en tinta de color.
- Cumplir requisitos de presentación de trámites legales o gubernamentales que exigen escala de grises.
- Reducir el tamaño de PDF con mucho color (las imágenes JPEG en escala de grises pesan menos que las de color).
- Crear un estilo visual coherente en documentos con páginas a color y en blanco y negro.

## Consejos

- Como cada página se rasteriza y se vuelve a incrustar como JPEG, el resultado está basado en imágenes. El texto del PDF original ya no se podrá seleccionar ni buscar. Si después necesitas texto con búsqueda, pasa el resultado por la herramienta OCR.
- Para tener más control sobre los ajustes de color (brillo, contraste, saturación), mira la herramienta Ajustar colores o el nodo de escala de grises del [Constructor de flujos de trabajo PDF](./pdf-workflow).

## Herramientas relacionadas

- [PDF a JPG](./pdf-to-jpg)
- [PDF a PNG](./pdf-to-png)
- [Constructor de flujos de trabajo PDF](./pdf-workflow)
