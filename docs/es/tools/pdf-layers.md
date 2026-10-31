---
title: Capas PDF (OCG)
description: Visualiza, activa o desactiva, agrega y elimina capas de Optional Content Group (OCG) en un documento PDF.
---

# Capas PDF (OCG)

Gestiona los Optional Content Groups (OCG), conocidos habitualmente como "capas", dentro de un PDF. Puedes activar o desactivar la visibilidad de las capas, agregar capas nuevas (incluidas capas hijas anidadas), eliminar capas y guardar el PDF modificado.

## Cómo funciona

1. Sube un archivo PDF.
2. Haz clic en el botón de procesar para cargar el documento con el motor PyMuPDF.
3. La herramienta muestra todas las capas existentes con su estado de visibilidad, su estado de bloqueo y su jerarquía de anidación.
4. Marca o desmarca las casillas para mostrar u ocultar capas. Las capas bloqueadas no se pueden cambiar.
5. Agrega capas nuevas de nivel superior escribiendo un nombre y haciendo clic en el botón de agregar, o agrega capas hijas bajo una capa padre existente.
6. Elimina las capas que ya no necesites.
7. Haz clic en **Guardar** para descargar el PDF modificado con los cambios de capas aplicados.

## Características

- Muestra la jerarquía de capas con la sangría adecuada para las capas anidadas
- Activa o desactiva la visibilidad de las capas
- El indicador de capa bloqueada evita cambios accidentales
- Agrega capas de nivel superior o capas hijas con nombres personalizados
- Elimina capas individuales
- Guarda todos los cambios en un archivo PDF nuevo

## Casos de uso

- Activar o desactivar la visibilidad de las capas de anotaciones en planos de arquitectura o ingeniería
- Agregar nuevas capas de anotación a un documento de diseño con varias capas
- Eliminar capas obsoletas de una plantilla antes de distribuirla
- Inspeccionar qué capas existen en un PDF complejo recibido de terceros

## Consejos

- Si el PDF no tiene capas, la herramienta muestra un estado vacío con una invitación a agregar una. No todos los PDF usan capas OCG: son más comunes en exportaciones de CAD y archivos de diseño.
- Las capas hijas aparecen con sangría bajo su capa padre. Puedes anidar capas a cualquier profundidad.
- Las capas bloqueadas se muestran con un icono de candado y sus casillas están desactivadas. Estos bloqueos los establece el creador del PDF.

## Herramientas relacionadas

- [Ver Metadatos](./view-metadata)
- [Editar Metadatos](./edit-metadata)
- [Duplicar y Organizar](./organize-pdf)
