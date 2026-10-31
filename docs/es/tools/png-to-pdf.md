---
title: PNG a PDF
description: Convierte una o más imágenes PNG en un documento PDF con calidad ajustable, todo en tu navegador.
---

# PNG a PDF

Convierte imágenes PNG a PDF conservando su resolución completa. Cada PNG se convierte en su propia página, con el tamaño de las dimensiones de la imagen original. La transparencia se gestiona automáticamente.

## Formatos compatibles

| Formato | Extensiones |
| :------ | :---------- |
| PNG     | `.png`      |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta archivos PNG. Puedes seleccionar varios a la vez.
2. Gestiona la lista de archivos: quita los que no quieras o agrega más.
3. Elige un nivel de **Calidad del PDF** en el menú desplegable.
4. Haz clic en **Convertir a PDF**. El resultado se descarga como `from_jpgs.pdf`.

La herramienta usa pdf-lib para incrustar cada imagen directamente. Si un PNG no se puede incrustar de forma nativa (p. ej., por un perfil de color poco común), recurre a volver a renderizarlo en un canvas como JPEG.

## Opciones

**Calidad del PDF** controla la compresión que se aplica antes de incrustar:

- **Alta calidad**: compresión mínima, el tamaño de archivo más grande.
- **Calidad media** (por defecto): buen equilibrio entre tamaño y nitidez.
- **Baja calidad**: compresión máxima, la salida más pequeña.

## Casos de uso

- Convertir capturas de pantalla en un PDF de varias páginas para informes de errores o documentación
- Empaquetar exportaciones de diseños de interfaz en un solo archivo para su revisión
- Convertir exportaciones de diagramas (draw.io, Excalidraw) en un PDF para compartir
- Reunir un conjunto de imágenes de gráficos en un informe

## Consejos

- Los archivos PNG con transparencia reciben un fondo blanco en el PDF. Si necesitas otro fondo, edita las imágenes de antemano.
- Para capturas de pantalla y diagramas con bordes nítidos y texto, la calidad Alta evita los artefactos de compresión JPEG. Media o Baja pueden convertir internamente a JPEG.

## Herramientas relacionadas

- [Imágenes a PDF](./image-to-pdf)
- [JPG a PDF](./jpg-to-pdf)
- [SVG a PDF](./svg-to-pdf)
