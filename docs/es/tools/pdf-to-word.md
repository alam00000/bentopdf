---
title: PDF a Word
description: Convierte archivos PDF a documentos de Word (DOCX) editables. Admite la conversión por lotes de varios PDF a la vez.
---

# PDF a Word

Convierte archivos PDF a documentos de Word (`.docx`) editables. La herramienta usa PyMuPDF para reconstruir el contenido del documento, conservando el texto, el formato básico y el diseño. Admite conversión individual y por lotes.

## Cómo funciona

1. Sube uno o más PDF haciendo clic en la zona de carga o arrastrando archivos hasta ella. Puedes agregar más archivos o quitar archivos concretos de la lista.
2. Haz clic en **Convertir** para iniciar el procesamiento.
3. Un solo archivo se descarga como `filename.docx`. Varios archivos se empaquetan en `converted-documents.zip`.

## Opciones

Esta herramienta no tiene opciones configurables. Cada PDF se convierte a DOCX con el motor de conversión integrado de PyMuPDF.

## Formato de salida

- **Un archivo**: `filename.docx`
- **Varios archivos**: `converted-documents.zip` con un `.docx` por cada PDF de entrada.

## Casos de uso

- Editar el texto de un PDF que recibiste y necesitas modificar.
- Convertir informes PDF archivados a un formato que los compañeros puedan editar en Microsoft Word o Google Docs.
- Pasar contenido de contratos o propuestas en PDF a Word para revisarlos con control de cambios.
- Migrar documentación antigua en PDF a un formato editable.

## Consejos

- Los diseños complejos con texto en varias columnas, formularios incrustados o muchos gráficos pueden no convertirse a la perfección. Revisa el resultado y ajusta el formato en tu procesador de texto.
- Los PDF escaneados (solo imagen) producirán archivos DOCX vacíos o casi vacíos. Pásalos primero por OCR para agregar una capa de texto.
- El modo por lotes es eficiente para convertir carpetas enteras de PDF: súbelos todos a la vez.

## Herramientas relacionadas

- [PDF a Texto](./pdf-to-text)
- [PDF a Markdown](./pdf-to-markdown)
- [Constructor de flujos de trabajo PDF](./pdf-workflow)
