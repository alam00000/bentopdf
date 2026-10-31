---
title: RTF a PDF
description: Convierte archivos Rich Text Format (RTF) a PDF en tu navegador con un motor basado en LibreOffice.
---

# RTF a PDF

Convierte documentos Rich Text Format a PDF. RTF es un formato de documento multiplataforma compatible con prácticamente todos los procesadores de texto. Esta herramienta usa un motor LibreOffice en el navegador para renderizar los archivos RTF con su formato intacto: negrita, cursiva, tablas e imágenes incrustadas pasan al PDF.

## Formatos compatibles

| Formato | Extensiones | Tipos MIME                    |
| :------ | :---------- | :---------------------------- |
| RTF     | `.rtf`      | `text/rtf`, `application/rtf` |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta uno o más archivos RTF.
2. Revisa la lista de archivos. Añade más o quita los que no necesites.
3. Haz clic en **Convertir a PDF**. El motor LibreOffice se inicializa la primera vez que lo usas y luego procesa cada archivo.
4. Un solo archivo se descarga directamente como PDF. Varios archivos se entregan como `rtf-converted.zip`.

## Opciones

Esta herramienta no tiene ajustes adicionales. La conversión conserva el formato RTF original.

## Resultado

| Número de archivos | Resultado                                                     |
| :----------------- | :------------------------------------------------------------ |
| 1 archivo          | Descarga de un único PDF (por ejemplo, `letter.pdf`)          |
| 2 o más            | Archivo ZIP (`rtf-converted.zip`) con un PDF por cada archivo |

## Casos de uso

- Convertir documentos RTF antiguos de procesadores de texto veteranos a PDF modernos
- Convertir plantillas de correo en RTF en vistas previas en PDF
- Procesar la salida RTF de sistemas de software jurídico o médico
- Convertir por lotes archivos RTF de un sistema de gestión documental a PDF para archivarlos

## Consejos

- El motor LibreOffice se carga una vez y se guarda en caché. La primera conversión de una sesión tarda unos segundos más; las siguientes son más rápidas.
- Los archivos RTF con objetos OLE incrustados pueden no renderizar todos los objetos a la perfección. El texto sin formato, las imágenes y el formato estándar se convierten de forma fiable.
- Si tus archivos RTF se crearon con Microsoft Word, también puedes convertirlos directamente con la herramienta [Word a PDF](./word-to-pdf), que acepta RTF además de DOC y DOCX.

## Herramientas relacionadas

- [Word a PDF](./word-to-pdf)
- [ODT a PDF](./odt-to-pdf)
- [Texto a PDF](./txt-to-pdf)
