---
title: Sanear PDF
description: Elimina el contenido oculto y potencialmente peligroso de los PDF, incluidos metadatos, JavaScript, archivos incrustados, anotaciones y capas.
---

# Sanear PDF

Los PDF pueden llevar mucho más de lo que ves en pantalla. Metadatos ocultos, JavaScript incrustado, archivos adjuntos, datos de formularios e información de capas pueden filtrar datos sensibles o suponer riesgos de seguridad. Sanear elimina todo eso y te deja un documento limpio, seguro para compartir públicamente.

## Cómo funciona

1. Sube un archivo PDF.
2. Selecciona en la lista qué elementos quieres eliminar.
3. Haz clic en **Sanear PDF**.
4. Descarga el archivo limpio.

## Opciones de saneamiento

Todas las opciones están activadas por defecto. Desmarca las que quieras conservar.

| Opción                            | Qué elimina                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------- |
| **Aplanar formularios**           | Convierte los campos de formulario interactivos en contenido estático         |
| **Eliminar metadatos**            | Quita autor, título, fecha de creación, información de software y datos XMP   |
| **Eliminar anotaciones**          | Borra comentarios, resaltados, notas adhesivas y marcado                      |
| **Eliminar JavaScript**           | Elimina scripts incrustados que podrían ejecutarse al abrir                   |
| **Eliminar archivos incrustados** | Quita los archivos adjuntos incrustados en el PDF                             |
| **Eliminar capas (OCG)**          | Aplana los grupos de contenido opcional en una sola capa                      |
| **Eliminar enlaces**              | Quita hipervínculos y referencias a URL                                       |
| **Eliminar árbol de estructura**  | Elimina la estructura del documento usada para el etiquetado de accesibilidad |
| **Eliminar MarkInfo**             | Quita la información de contenido marcado                                     |
| **Eliminar fuentes**              | Elimina los datos de fuentes incrustadas (úsalo con precaución)               |

## Casos de uso

- Preparar un PDF para su publicación quitando metadatos internos (nombres de autores, versiones de software, historial de edición)
- Eliminar JavaScript de un PDF recibido de una fuente no confiable antes de abrirlo
- Limpiar un PDF antes de enviarlo a un cliente que no debe ver comentarios incrustados ni nombres de campos de formulario
- Quitar capas ocultas de un plano de arquitectura antes de compartir la versión final
- Cumplir los requisitos de minimización de datos de las normativas de privacidad

## Consejos

- Deja "Eliminar fuentes" sin marcar a menos que estés seguro de que el PDF se seguirá mostrando correctamente. Quitar las fuentes puede hacer invisible el texto en algunos visores.
- Si solo necesitas quitar los metadatos, la herramienta específica Eliminar metadatos es más rápida y más concreta.
- El saneamiento es irreversible. Conserva tu archivo original.

## Herramientas relacionadas

- [Eliminar metadatos](./remove-metadata): quita solo los metadatos sin tocar el resto del contenido
- [Aplanar PDF](./flatten-pdf): aplana específicamente formularios y anotaciones
- [Cifrar PDF](./protect-pdf): añade protección con contraseña después de sanear
- [Rasterizar PDF](./rasterize-pdf): la opción drástica: convierte a imágenes para eliminar todo el contenido oculto
