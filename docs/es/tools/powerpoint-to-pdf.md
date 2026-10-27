---
title: PowerPoint a PDF
description: Convierte presentaciones de PowerPoint (PPT, PPTX) y archivos ODP a PDF conservando el formato de las diapositivas.
---

# PowerPoint a PDF

Convierte archivos de presentación a PDF. Cada diapositiva se convierte en una página del documento resultante, con texto, imágenes, formas y transiciones renderizados mediante un motor LibreOffice que funciona en el navegador. Admite formatos de PowerPoint modernos y antiguos, además del formato OpenDocument Presentation.

## Formatos compatibles

| Formato                   | Extensiones |
| :------------------------ | :---------- |
| PowerPoint (moderno)      | `.pptx`     |
| PowerPoint (antiguo)      | `.ppt`      |
| OpenDocument Presentation | `.odp`      |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos de presentación.
2. Revisa la lista de archivos. Añade más o quita los que no necesites.
3. Haz clic en **Convertir a PDF**. El motor LibreOffice se carga la primera vez que lo usas y luego convierte cada archivo.
4. Un solo archivo se descarga directamente como PDF. Varios archivos se empaquetan en `powerpoint-converted.zip`.

## Opciones

Esta herramienta no tiene ajustes adicionales. Las diapositivas se renderizan con sus dimensiones originales.

## Resultado

| Número de archivos | Resultado                                                            |
| :----------------- | :------------------------------------------------------------------- |
| 1 archivo          | Descarga de un único PDF (nombre original con extensión `.pdf`)      |
| 2 o más            | Archivo ZIP (`powerpoint-converted.zip`) con un PDF por cada archivo |

## Casos de uso

- Convertir una presentación a PDF antes de compartirla con un público que quizá no tenga PowerPoint
- Crear una versión imprimible de un conjunto de diapositivas para una conferencia o un taller
- Archivar presentaciones en un formato que se ve igual en todos los dispositivos
- Convertir por lotes una biblioteca de presentaciones ODP de LibreOffice Impress a PDF
- Generar una versión PDF de una presentación comercial para enviar por correo

## Consejos

- Las animaciones y transiciones de las diapositivas no se representan en el PDF. Cada diapositiva se captura como una página estática.
- Los vídeos incrustados no aparecerán en el resultado. Sustitúyelos por una captura de pantalla o una imagen de marcador si lo necesitas.
- Las notas del orador no se incluyen en la exportación a PDF predeterminada. Si necesitas las notas, exporta primero desde la vista nativa "Imprimir notas" de PowerPoint.
- El motor LibreOffice se guarda en caché tras la primera carga, así que convertir una segunda presentación en la misma sesión es mucho más rápido.

## Herramientas relacionadas

- [Word a PDF](./word-to-pdf)
- [Excel a PDF](./excel-to-pdf)
- [Imágenes a PDF](./image-to-pdf)
