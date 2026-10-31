---
title: PDF a WebP
description: Convierte páginas de PDF a imágenes WebP con calidad ajustable. Archivos más pequeños que JPG con una calidad visual comparable.
---

# PDF a WebP

Convierte cada página de un PDF en una imagen WebP. WebP suele producir archivos entre un 25 y un 35% más pequeños que JPG con la misma calidad percibida, lo que lo convierte en una gran opción para la web.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella.
2. Ajusta el control deslizante de **Calidad**.
3. Haz clic en **Convertir** para procesar el archivo.
4. Un único archivo `.webp` o un archivo ZIP se descarga automáticamente.

## Opciones

- **Calidad**: un control deslizante de 0% a 100% (por defecto 85%). Controla el nivel de compresión con pérdida. Los valores más altos conservan más detalle.

Las páginas se renderizan internamente a escala 2x, lo que produce imágenes con aproximadamente el doble de las dimensiones nativas del PDF.

## Formato de salida

- **Una página**: `filename.webp`
- **Varias páginas**: `filename_webps.zip` con `page_1.webp`, `page_2.webp`, etc.

## Casos de uso

- Preparar vistas previas de páginas para sitios web donde el ancho de banda importa.
- Generar versiones de imagen ligeras de volantes o folletos para redes sociales.
- Convertir por lotes documentos de varias páginas en un conjunto de imágenes optimizado para la web.

## Consejos

- WebP es compatible con todos los navegadores modernos. Para compatibilidad con sistemas antiguos, recurre a [PDF a JPG](./pdf-to-jpg).
- Una calidad de 80-85% suele ser indistinguible del original en pantalla y mantiene los archivos pequeños.

## Herramientas relacionadas

- [PDF a JPG](./pdf-to-jpg)
- [PDF a PNG](./pdf-to-png)
- [PDF a BMP](./pdf-to-bmp)
