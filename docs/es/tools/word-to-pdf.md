---
title: Word a PDF
description: Convierte documentos de Word (DOC, DOCX), ODT y RTF a PDF en tu navegador conservando todo el formato.
---

# Word a PDF

Convierte documentos de Microsoft Word y formatos compatibles a PDF. La herramienta usa un motor de LibreOffice que se ejecuta en el navegador y admite archivos DOC, DOCX, ODT y RTF, conservando en el resultado el formato, las tablas, las imágenes, los encabezados, los pies de página y los estilos.

## Formatos admitidos

| Formato                      | Extensiones |
| :--------------------------- | :---------- |
| Word (moderno)               | `.docx`     |
| Word (antiguo)               | `.doc`      |
| Texto de OpenDocument        | `.odt`      |
| Formato de texto enriquecido | `.rtf`      |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta tus documentos de Word. Puedes seleccionar varios archivos a la vez.
2. Revisa y gestiona la lista de archivos.
3. Haz clic en **Convertir a PDF**. El motor de LibreOffice se carga la primera vez que se usa (un indicador de progreso muestra el estado de inicialización) y después se convierte cada archivo.
4. Un solo archivo se descarga directamente como PDF. Varios archivos se empaquetan en `word-converted.zip`.

## Opciones

Esta herramienta no tiene ajustes adicionales. El motor de LibreOffice genera el resultado con su perfil de exportación a PDF predeterminado.

## Resultado

| Cantidad de entrada | Resultado                                                                 |
| :------------------ | :------------------------------------------------------------------------ |
| 1 archivo           | Descarga de un solo PDF (nombre de archivo original con extensión `.pdf`) |
| 2 o más archivos    | Archivo ZIP (`word-converted.zip`) con un PDF por archivo                 |

## Casos de uso

- Convertir un currículum o una carta de presentación de DOCX a PDF antes de enviar una solicitud de empleo
- Convertir por lotes un conjunto de contratos o propuestas a PDF para entregarlos a un cliente
- Convertir archivos `.doc` antiguos en PDF modernos para archivarlos a largo plazo
- Convertir a PDF documentos colaborativos de Google Docs (exportados como DOCX)
- Generar PDF listos para imprimir a partir de plantillas de Word usadas en la generación automática de documentos

## Consejos

- El motor de LibreOffice se descarga una vez por sesión y se guarda en caché. Espera unos segundos de carga en la primera conversión; las siguientes serán mucho más rápidas.
- El formato complejo (macros, controles ActiveX, SmartArt avanzado) puede no convertirse a la perfección. Los elementos estándar de un documento (texto, tablas, imágenes, encabezados, notas al pie) se convierten de forma fiable.
- Como esta herramienta también acepta ODT y RTF, puedes usarla como conversor único para todos los formatos de procesamiento de texto.

## Herramientas relacionadas

- [ODT a PDF](./odt-to-pdf)
- [RTF a PDF](./rtf-to-pdf)
- [Excel a PDF](./excel-to-pdf)
- [PowerPoint a PDF](./powerpoint-to-pdf)
