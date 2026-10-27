---
title: WebP a PDF
description: Convierte imágenes WebP a PDF directamente en tu navegador con calidad de compresión ajustable.
---

# WebP a PDF

Convierte el formato de imagen WebP de Google a PDF. Resulta especialmente útil cuando has descargado imágenes de la web en formato WebP y las necesitas en un formato más aceptado universalmente para imprimir o compartir.

## Formatos admitidos

| Formato | Extensiones |
| :------ | :---------- |
| WebP    | `.webp`     |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos WebP.
2. Revisa la lista de archivos y quita los que no necesites.
3. Selecciona un nivel de **Calidad del PDF**.
4. Haz clic en **Convertir a PDF**. El resultado se descarga como `from_webps.pdf`.

Internamente, cada imagen WebP se decodifica mediante la API canvas del navegador y después se incrusta en el PDF con pdf-lib. Por eso la conversión funciona en cualquier navegador que admita la decodificación de WebP (todos los navegadores modernos lo hacen).

## Opciones

**Calidad del PDF** controla la compresión al incrustar las imágenes:

- **Alta calidad**: conserva el máximo detalle.
- **Calidad media** (predeterminada): resultado equilibrado.
- **Baja calidad**: menor tamaño de archivo.

## Casos de uso

- Convertir en un PDF imprimible las imágenes descargadas de la web guardadas como WebP
- Reunir capturas de pantalla WebP de Chrome o Edge en documentación
- Crear un portafolio en PDF a partir de imágenes exportadas por herramientas de diseño que usan WebP por defecto
- Archivar imágenes WebP en un formato más universalmente legible

## Consejos

- WebP se decodifica internamente a PNG antes de incrustarse en el PDF, por lo que las imágenes WebP sin pérdida conservan su calidad con el ajuste Alta.
- Si tienes una mezcla de WebP y otros formatos de imagen, usa la herramienta [Imágenes a PDF](./image-to-pdf): acepta todo de una vez.

## Herramientas relacionadas

- [Imágenes a PDF](./image-to-pdf)
- [PNG a PDF](./png-to-pdf)
- [JPG a PDF](./jpg-to-pdf)
