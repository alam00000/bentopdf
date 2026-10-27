---
title: Alternar y mezclar páginas
description: Fusiona PDF intercalando las páginas de cada archivo en orden alterno, conservando los marcadores.
---

# Alternar y mezclar páginas

Intercala las páginas de varios archivos PDF para que las páginas se alternen entre documentos. Es la herramienta a la que recurres cuando una fusión normal solo añadiría los archivos uno detrás de otro, pero necesitas la página 1 del Archivo A, luego la página 1 del Archivo B, luego la página 2 del Archivo A, y así sucesivamente.

## Cómo funciona

1. Sube al menos dos archivos PDF usando la zona de carga.
2. La herramienta muestra cada archivo con su número de páginas y tamaño.
3. Arrastra los tiradores para reordenar las páginas de qué archivo van primero en la secuencia de intercalado.
4. Haz clic en **Mezclar páginas** para generar el resultado intercalado.
5. El resultado se descarga como `alternated-mixed.pdf`.

## Características

- Intercala páginas de cualquier cantidad de PDF (mínimo dos)
- Reordenación de archivos con arrastrar y soltar para controlar la prioridad del intercalado
- Conserva los marcadores de los documentos de origen
- Muestra el número de páginas y el tamaño de cada archivo subido
- Se procesa mediante un web worker dedicado para mantener la interfaz fluida

## Casos de uso

- Reconstruir escaneos a doble cara en los que las páginas impares y pares se escanearon por separado
- Combinar hojas de preguntas con sus claves de respuestas para que cada pregunta vaya seguida de su respuesta
- Fusionar documentos en dos idiomas página por página (por ejemplo, inglés en una cara y la traducción en la siguiente)
- Intercalar los escaneos del anverso y del reverso de un escáner de una sola cara

## Consejos

- Si tus PDF de origen tienen distinto número de páginas, las páginas del documento más corto se acabarán primero y las páginas restantes del documento más largo aparecerán al final.
- El orden de los archivos importa: el primer archivo de la lista aporta la primera página del resultado. Arrastra para reorganizar si es necesario.

## Herramientas relacionadas

- [Fusionar PDF](./merge-pdf)
- [Duplicar y Organizar](./organize-pdf)
- [Dividir PDF](./split-pdf)
