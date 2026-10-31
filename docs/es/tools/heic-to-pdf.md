---
title: HEIC a PDF
description: Convierte imágenes HEIC y HEIF de iPhone y iPad a PDF directamente en tu navegador.
---

# HEIC a PDF

Convierte imágenes HEIC/HEIF a PDF. HEIC es el formato de foto predeterminado en iPhone y iPad desde iOS 11. Esta herramienta te permite convertir esas fotos en PDF sin instalar software de escritorio ni subir archivos a un servidor.

## Formatos compatibles

| Formato | Extensiones |
| :------ | :---------- |
| HEIC    | `.heic`     |
| HEIF    | `.heif`     |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos HEIC/HEIF.
2. Revisa la lista de archivos y quita los que no quieras.
3. Haz clic en **Convertir a PDF**. El resultado se descarga como `from_heic.pdf`.

Cada archivo HEIC se decodifica con la biblioteca heic2any, que lo convierte a PNG con una calidad del 92 %. Después, el PNG se incrusta en el PDF con pdf-lib, con cada imagen en su propia página y a resolución completa.

## Opciones

Esta herramienta no ofrece ajustes adicionales. Las imágenes HEIC se convierten a PNG en alta calidad (0.92) antes de incrustarse.

## Casos de uso

- Crear un PDF a partir de fotos de iPhone para adjuntarlo a un parte de seguro o a un informe
- Convertir fotos HEIC de un anuncio inmobiliario en un único documento imprimible
- Convertir capturas de pantalla de iPad (formato HEIF) en un PDF para compartir
- Convertir por lotes las fotos de un viaje para un diario de viaje

## Consejos

- La decodificación de HEIC se realiza por completo en el navegador con WebAssembly. La primera conversión puede tardar un momento mientras se carga el decodificador.
- Si necesitas combinar HEIC con otros formatos de imagen (JPG, PNG, etc.), usa la herramienta [Imágenes a PDF](./image-to-pdf), que admite HEIC junto con todos los demás formatos.
- Los archivos HEIC de iPhone suelen contener datos EXIF, incluidas coordenadas GPS. El PDF resultante no conserva estos metadatos.

## Herramientas relacionadas

- [Imágenes a PDF](./image-to-pdf)
- [JPG a PDF](./jpg-to-pdf)
- [PNG a PDF](./png-to-pdf)
