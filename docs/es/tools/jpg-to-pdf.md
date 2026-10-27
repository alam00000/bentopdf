---
title: JPG a PDF
description: Convierte una o más imágenes JPG, JPEG y JPEG 2000 en un único archivo PDF directamente en tu navegador.
---

# JPG a PDF

Convierte imágenes JPG en un PDF limpio. Sube un archivo o varios JPG a la vez: cada imagen se convierte en una página a tamaño completo del documento resultante.

## Formatos compatibles

| Formato   | Extensiones     |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos JPG. Se admite la selección múltiple.
2. Revisa los archivos subidos. Usa el icono de papelera para quitar archivos individuales, o haz clic en **Agregar Más Archivos** para añadir más a la lista.
3. Selecciona un nivel de **Calidad del PDF**.
4. Haz clic en **Convertir a PDF**. La herramienta comprime las imágenes según el ajuste de calidad, las convierte con el motor PyMuPDF y descarga `from_jpgs.pdf`.

## Opciones

**Calidad del PDF** ajusta la compresión que se aplica a cada imagen antes de incrustarla en el PDF:

- **Calidad alta**: conserva el máximo detalle. Úsala para fotografía o impresión.
- **Calidad media** (predeterminado): un buen equilibrio entre nitidez y tamaño de archivo.
- **Calidad baja**: compresión agresiva para obtener el resultado más pequeño.

## Casos de uso

- Convertir documentos escaneados guardados como JPG en un único PDF para entregar
- Empaquetar fotos de productos en un catálogo para clientes
- Convertir imágenes médicas o de satélite en JPEG 2000 en un PDF portátil
- Crear un álbum de fotos imprimible a partir de exportaciones de la cámara

## Consejos

- Los archivos JPEG 2000 (`.jp2`, `.jpx`) son totalmente compatibles, no solo el JPEG estándar. Es útil para imágenes médicas y datos geoespaciales.
- Si tus JPG provienen de la cámara de un móvil, la Calidad media suele producir un archivo entre un 40 y un 60 % más pequeño que la Calidad alta, sin diferencia visible en pantalla.

## Herramientas relacionadas

- [Imágenes a PDF](./image-to-pdf)
- [PNG a PDF](./png-to-pdf)
- [WebP a PDF](./webp-to-pdf)
