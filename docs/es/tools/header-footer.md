---
title: Encabezado y pie de página
description: Añade texto personalizable de encabezado y pie de página a las páginas del PDF, con variables dinámicas de número de página.
---

# Encabezado y pie de página

Añade texto en seis posiciones de las páginas de tu PDF: encabezado izquierdo, central y derecho, y pie de página izquierdo, central y derecho. La herramienta admite variables dinámicas para el número de página y el total de páginas, de modo que puedes crear plantillas como "Página 3 de 10" que se actualizan automáticamente en cada página.

## Cómo funciona

1. Sube tu archivo PDF.
2. Aparece el panel de opciones con los controles de formato y seis campos de texto.
3. Escribe el texto que quieras en cualquiera de las posiciones de encabezado o pie de página.
4. Usa los marcadores `{page}` y `{total}` para la numeración dinámica de páginas.
5. Ajusta el tamaño y el color de la fuente y, si quieres, limita el rango de páginas.
6. Haz clic en **Agregar encabezado y pie de página** para procesar y descargar.

## Opciones

- **Rango de páginas**: limita opcionalmente qué páginas llevan encabezado y pie de página. Déjalo vacío para aplicarlo a todas. Formato: "1-3, 5" (rangos separados por comas).
- **Tamaño de fuente**: entre 6 y 24 puntos. El valor predeterminado es 10.
- **Color de fuente**: elige cualquier color con el selector de color.
- **Encabezado izquierda / centro / derecha**: campos de texto para la parte superior de cada página.
- **Pie de página izquierda / centro / derecha**: campos de texto para la parte inferior de cada página.

## Características

- Seis posiciones de texto independientes por página
- Variable dinámica `{page}` que inserta el número de la página actual
- Variable dinámica `{total}` que inserta el total de páginas
- Filtro por rango de páginas para elegir páginas concretas
- Tamaño y color de fuente personalizables
- Fuente Helvetica para un resultado limpio y profesional

## Casos de uso

- Añadir "Página {page} de {total}" en el centro del pie de página de un informe
- Poner el nombre de la empresa en el encabezado izquierdo y la fecha del documento en el derecho
- Añadir avisos de confidencialidad al pie de página de documentos legales
- Estampar números de revisión del documento en rangos de páginas concretos

## Consejos

- Combina `{page}` y `{total}` en un solo campo para formatos como "Página {page} de {total}" o "{page}/{total}".
- Puedes dejar vacíos la mayoría de los campos y rellenar solo las posiciones que necesites. Los campos vacíos simplemente se omiten.
- Para encabezados más complejos con imágenes o logotipos, considera usar la herramienta [Añadir marca de agua](./add-watermark) colocada en la parte superior de la página.

## Herramientas relacionadas

- [Números de página](./page-numbers)
- [Añadir marca de agua](./add-watermark)
- [Numeración Bates](./bates-numbering)
