---
title: ODT a PDF
description: Convierte archivos OpenDocument Text (ODT) a PDF en tu navegador con un motor basado en LibreOffice.
---

# ODT a PDF

Convierte archivos OpenDocument Text a PDF. ODT es el formato nativo de LibreOffice Writer, Apache OpenOffice y otros procesadores de texto de código abierto. Esta herramienta usa un motor de LibreOffice en el navegador para lograr conversiones precisas que conservan el formato, las tablas, las imágenes y los estilos.

## Formatos compatibles

| Formato           | Extensiones |
| :---------------- | :---------- |
| OpenDocument Text | `.odt`      |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta uno o más archivos ODT.
2. Revisa la lista de archivos. Agrega más archivos o quita los que no quieras.
3. Haz clic en **Convertir a PDF**. El motor de LibreOffice se inicializa (un indicador de progreso muestra el estado de carga) y luego se convierte cada archivo.
4. Un solo archivo se descarga directamente como PDF. Varios archivos se empaquetan en `odt-converted.zip`.

## Opciones

Esta herramienta no tiene configuración adicional. La conversión conserva el formato del documento original lo más fielmente posible.

## Salida

| Cantidad de entrada | Salida                                                        |
| :------------------ | :------------------------------------------------------------ |
| 1 archivo           | Descarga de un solo PDF (p. ej., `document.pdf`)              |
| 2 o más archivos    | Archivo ZIP (`odt-converted.zip`) con un PDF por cada archivo |

## Casos de uso

- Convertir documentos de LibreOffice Writer a PDF para compartirlos con usuarios de Microsoft Office
- Generar PDF listos para imprimir a partir de trabajos académicos escritos en formato OpenDocument
- Convertir por lotes una carpeta de plantillas ODT en PDF para distribuirlos
- Generar PDF a partir de archivos ODT creados por sistemas automáticos de generación de documentos

## Consejos

- El motor de LibreOffice se carga en el primer uso y queda en caché para las siguientes conversiones. La primera carga tarda unos segundos; después, las conversiones son rápidas.
- Los documentos complejos con objetos OLE incrustados o fuentes poco comunes pueden verse un poco distintos que en LibreOffice de escritorio. Prueba con una muestra antes de convertir por lotes.
- Para documentos de Word (`.doc`, `.docx`), usa en su lugar la herramienta [Word a PDF](./word-to-pdf), que también usa el motor de LibreOffice pero acepta directamente los formatos de Microsoft.

## Herramientas relacionadas

- [Word a PDF](./word-to-pdf)
- [RTF a PDF](./rtf-to-pdf)
- [Texto a PDF](./txt-to-pdf)
