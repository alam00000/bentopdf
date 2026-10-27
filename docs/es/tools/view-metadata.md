---
title: Ver metadatos
description: Inspecciona todas las propiedades de metadatos de un PDF, incluidos la información del documento, los datos XMP y los detalles estructurales.
---

# Ver metadatos

Examina las propiedades ocultas incluidas en un archivo PDF. La herramienta muestra la información del documento (título, autor, fechas), los metadatos XMP, las dimensiones de página y otros datos estructurales en un formato legible.

## Cómo funciona

1. Sube un archivo PDF.
2. La herramienta analiza el archivo de inmediato y muestra todos los metadatos disponibles en secciones organizadas.
3. Revisa el diccionario de información del documento, el árbol de metadatos XMP y las propiedades estructurales.
4. No hace falta ningún paso de procesamiento: los metadatos se muestran en cuanto se carga el archivo.

## Características

- Muestra los campos estándar de información del documento: Título, Autor, Asunto, Palabras clave, Creador, Productor
- Muestra las fechas de creación y modificación en un formato legible
- Analiza y muestra el árbol completo de metadatos XMP con espacios de nombres anidados
- Convierte el formato de fecha de PDF (`D:20240101120000Z`) en fechas legibles
- Organizado en secciones plegables para navegar con facilidad

## Secciones de metadatos

| Sección                       | Contenido                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Información del documento** | Título, Autor, Asunto, Palabras clave, Creador, Productor, Fecha de creación, Fecha de modificación      |
| **Metadatos XMP**             | Árbol completo de metadatos basado en XML con Dublin Core, XAP, PDF y espacios de nombres personalizados |
| **Propiedades del documento** | Número de páginas, versión de PDF, tamaño del archivo, estado de cifrado                                 |

## Casos de uso

- Comprobar quién es el autor de un PDF y cuándo se modificó por última vez
- Verificar que los metadatos se definieron correctamente antes de publicar un documento
- Auditar PDF en busca de problemas de privacidad revisando qué información personal contienen
- Investigar el software usado para crear o modificar un PDF (mediante el campo Productor)
- Revisar los metadatos XMP para el cumplimiento de la gestión de activos digitales

## Consejos

- Las cadenas de fecha de PDF que empiezan por `D:` se convierten automáticamente al formato de tu zona horaria local.
- Si los campos de metadatos aparecen vacíos, es que el creador del PDF simplemente no los definió. No todos los PDF contienen metadatos completos.
- Para modificar los metadatos después de inspeccionarlos, usa [Editar Metadatos](./edit-metadata). Para eliminarlos por completo, usa Eliminar Metadatos.

## Herramientas relacionadas

- [Editar Metadatos](./edit-metadata)
- [Capas OCG de PDF](./pdf-layers)
- [Comparar PDFs](./compare-pdfs)
