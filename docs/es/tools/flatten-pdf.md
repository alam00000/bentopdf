---
title: Aplanar PDF
description: Aplana formularios interactivos y anotaciones en contenido estático. Hace que los campos no sean editables e integra las anotaciones en la página.
---

# Aplanar PDF

Aplanar fusiona los elementos interactivos (campos de formulario, menús desplegables, casillas, anotaciones, resaltados, notas adhesivas) directamente en el contenido de la página. La apariencia visual sigue igual, pero ya nada se puede editar ni extraer. Es el equivalente en PDF a imprimir un formulario rellenado y volver a escanearlo, solo que la calidad se mantiene perfecta.

## Cómo funciona

1. Sube uno o más archivos PDF.
2. Haz clic en **Aplanar PDF**.
3. Un solo archivo se descarga directamente. Varios archivos generan un archivo ZIP.

La herramienta usa pdf-lib para aplanar los campos de formulario (mediante `form.flatten()`) y un aplanador de anotaciones dedicado para integrar las anotaciones en el flujo de la página. Ambas operaciones se realizan en una sola pasada.

## Qué se aplana

- **Campos de formulario**: entradas de texto, casillas, botones de opción, menús desplegables, campos de firma
- **Anotaciones**: comentarios, resaltados, tachado, subrayado, notas adhesivas, sellos, anotaciones de tinta
- **Elementos interactivos**: botones, disparadores de acciones

## Qué no cambia

- El contenido de texto (sigue siendo seleccionable y se puede buscar)
- Imágenes y gráficos
- Diseño y dimensiones de la página
- Marcadores y tabla de contenido
- Hipervínculos (salvo los basados en anotaciones)

## Casos de uso

- Bloquear un formulario completado para que los destinatarios no puedan cambiar las respuestas enviadas
- Preparar un PDF para archivo donde los elementos interactivos no son necesarios
- Corregir problemas de visualización causados por anotaciones que se muestran distinto en cada visor
- Asegurar que un documento firmado no se pueda modificar tras aplicar la firma
- Reducir el tamaño del archivo eliminando las definiciones de campos y los objetos de anotación

## Consejos

- Aplana cuando hayas terminado todas las ediciones. No hay forma de desaplanar un PDF.
- Si necesitas aplanar y además eliminar metadatos, JavaScript y archivos adjuntos, usa la herramienta Sanear PDF: incluye el aplanado como una de sus opciones.
- Algunos PDF indican "no se encontró ningún formulario". Es normal si el documento solo tiene anotaciones y ningún campo de formulario.

## Herramientas relacionadas

- [Sanear PDF](./sanitize-pdf): aplana formularios y además elimina metadatos, scripts y más
- [Rasterizar PDF](./rasterize-pdf): convierte a PDF basado en imágenes para un aplanado máximo
- [Fuente a contorno](./font-to-outline): convierte las fuentes en trazados vectoriales
- [Cifrar PDF](./protect-pdf): bloquea el PDF aplanado con una contraseña
