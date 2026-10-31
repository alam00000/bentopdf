---
title: Rasterizar PDF
description: Convierte las páginas de un PDF en un PDF basado en imágenes. Aplana todas las capas, elimina el texto seleccionable y controla los DPI y el formato de imagen.
---

# Rasterizar PDF

La rasterización convierte cada página de un PDF en una imagen y vuelve a ensamblar esas imágenes en un PDF. El resultado se ve idéntico al original, pero no contiene texto seleccionable, elementos interactivos ni capas editables. Es, en la práctica, una fotocopia de alta calidad.

## Cómo funciona

1. Sube uno o más archivos PDF.
2. Define los **DPI** (resolución) del resultado rasterizado.
3. Elige un **formato de imagen**: PNG para calidad sin pérdida o JPEG para archivos más pequeños.
4. Opcionalmente, marca **Convertir a escala de grises**.
5. Haz clic en **Rasterizar PDF**. Si son varios archivos, se descargan como ZIP.

## Opciones

| Ajuste                | Valores                              | Por defecto |
| --------------------- | ------------------------------------ | ----------- |
| **DPI**               | 72, 150, 200, 300, 600               | 150         |
| **Formato de imagen** | PNG (sin pérdida), JPEG (más ligero) | PNG         |
| **Escala de grises**  | Sí/No                                | No          |

## Guía de DPI

- **72**: solo para ver en pantalla, el menor tamaño de archivo
- **150**: buen equilibrio para uso general
- **200**: texto más nítido, tamaño de archivo moderado
- **300**: resultado con calidad de impresión
- **600**: archivo de alta calidad o impresión profesional

## Casos de uso

- Impedir la extracción de texto de documentos confidenciales antes de compartirlos
- Eliminar problemas de dependencia de fuentes convirtiendo el texto en píxeles
- Crear una versión "plana" de un PDF con capas complejas o transparencias que se renderizan distinto según el visor
- Preparar un PDF para un sistema que solo acepta entradas basadas en imágenes
- Eliminar contenido oculto (como cambios registrados o datos de formularios) reduciendo el PDF a imágenes puras

## Consejos

- 150 DPI en PNG es un buen valor por defecto. Sube solo si necesitas imprimir o ampliar detalles finos.
- JPEG produce archivos notablemente más pequeños, pero introduce artefactos de compresión en los bordes nítidos del texto.
- La rasterización es irreversible: conserva tu PDF original por si más adelante necesitas texto editable.

## Herramientas relacionadas

- [Comprimir PDF](./compress-pdf): reduce el tamaño del PDF rasterizado
- [Enderezar PDF](./deskew-pdf): endereza las páginas antes de rasterizar documentos escaneados
- [Fuente a contorno](./font-to-outline): convierte las fuentes en trazados vectoriales si quieres conservar la escalabilidad
- [Aplanar PDF](./flatten-pdf): aplana formularios sin convertirlos en imágenes
