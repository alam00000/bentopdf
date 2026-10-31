---
title: PDF a texto
description: Extrae el texto sin formato de archivos PDF. Admite la extracción por lotes de varios PDF con salida en archivos TXT.
---

# PDF a texto

Extrae todo el contenido de texto de archivos PDF y lo guarda como archivos `.txt` de texto sin formato. Admite el procesamiento por lotes: sube varios PDF y extrae el texto de cada uno en una sola operación. Funciona con PyMuPDF.

## Cómo funciona

1. Sube uno o más PDF haciendo clic en la zona de carga o arrastrando archivos hasta ella. Gestiona tu lista de archivos con los botones Agregar más y Borrar.
2. Haz clic en **Extraer** para iniciar el procesamiento.
3. Un solo archivo se descarga como `filename.txt`. Varios archivos generan un archivo `pdf-to-text.zip`.

## Opciones

Esta herramienta no tiene opciones configurables. Todo el texto se extrae de cada página en orden de lectura.

## Formato de salida

- **Un archivo**: `filename.txt`
- **Varios archivos**: `pdf-to-text.zip` con un `.txt` por cada PDF de entrada.

## Casos de uso

- Extraer el texto principal de informes en PDF para indexarlo en búsquedas de texto completo.
- Convertir ebooks o artículos en PDF a texto sin formato para leerlos en dispositivos de tinta electrónica.
- Sacar texto de contratos o documentos legales para analizar palabras clave.
- Quitar el formato de los PDF para obtener texto limpio para scripts de procesamiento de datos.
- Preparar un corpus de texto a partir de archivos PDF para procesamiento de lenguaje natural.

## Consejos

- Los PDF escaneados (solo imagen) producirán archivos de texto vacíos porque no hay una capa de texto que extraer. Pasa primero los documentos escaneados por OCR.
- La salida conserva el orden de lectura según lo interpreta PyMuPDF, que por lo general sigue de izquierda a derecha y de arriba abajo. Los diseños de varias columnas pueden producir texto entremezclado.
- Para una salida estructurada con encabezados y formato, prueba [PDF a Markdown](./pdf-to-markdown). Para JSON estructurado listo para IA, usa [Preparar PDF para IA](./prepare-pdf-for-ai).

## Herramientas relacionadas

- [PDF a Markdown](./pdf-to-markdown)
- [Preparar PDF para IA](./prepare-pdf-for-ai)
- [PDF a Word](./pdf-to-word)
