---
title: Eliminar metadatos
description: Elimina todos los metadatos ocultos de los archivos PDF, incluidos autor, título, fecha de creación, productor, datos XMP e ID de documento.
---

# Eliminar metadatos

Todo PDF lleva metadatos que pueden revelar quién lo creó, qué software se usó, cuándo se modificó por última vez y más. Esta herramienta elimina todo: el diccionario de información, los flujos de metadatos XMP, los ID de documento y los datos específicos de aplicaciones, y deja un documento limpio sin rastro de su origen.

## Cómo funciona

1. Sube un archivo PDF.
2. Haz clic en **Eliminar metadatos**.
3. Descarga el archivo limpio.

No hay opciones que configurar. La herramienta es exhaustiva por diseño: lo borra todo.

## Qué se elimina

- **Campos del diccionario de información**: título, autor, asunto, palabras clave, creador, productor, fecha de creación, fecha de modificación
- **Flujo de metadatos XMP**: el bloque de metadatos basado en XML almacenado en el catálogo del documento
- **ID de documento**: identificadores únicos en el trailer del PDF que sirven para rastrear un documento entre sistemas
- **PieceInfo**: metadatos específicos de aplicaciones añadidos por programas como Illustrator o InDesign

## Qué se conserva

- Todo el contenido visible de las páginas (texto, imágenes, gráficos)
- Campos de formulario y anotaciones
- Marcadores y enlaces
- La estructura del documento en sí

## Casos de uso

- Quitar tu nombre y organización de un documento antes de publicarlo de forma anónima
- Eliminar marcas de tiempo de creación que revelan cuándo se preparó un documento
- Limpiar las cadenas de productor que identifican tu software PDF
- Preparar documentos para envíos regulatorios que exigen PDF sin metadatos
- Eliminar rastros del historial de edición antes de compartir un documento externamente

## Consejos

- Usa primero la herramienta Ver metadatos para comprobar exactamente qué metadatos contiene tu PDF antes de eliminarlos.
- Si necesitas eliminar metadatos _y_ JavaScript, anotaciones y archivos incrustados, usa Sanear PDF para una limpieza más a fondo.
- La eliminación de metadatos es permanente. Conserva el original por si más adelante necesitas esos datos.

## Herramientas relacionadas

- [Sanear PDF](./sanitize-pdf): elimina metadatos, además de scripts, adjuntos y más
- [Cifrar PDF](./protect-pdf): protege con contraseña el PDF limpio
- [Comprimir PDF](./compress-pdf): eliminar metadatos puede reducir ligeramente el tamaño del archivo; comprime para ahorrar más
