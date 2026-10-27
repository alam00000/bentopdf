---
title: Índice
description: Genera una página de tabla de contenidos con formato a partir de los marcadores existentes de tu PDF.
---

# Índice

Esta herramienta lee los marcadores (esquemas) de tu PDF y genera una página de tabla de contenidos con formato que se antepone al documento. Si tu PDF ya tiene marcadores pero carece de una página de índice visible, esta herramienta la crea automáticamente.

## Cómo funciona

1. Sube un PDF que contenga marcadores.
2. Personaliza el título del índice, el tamaño de fuente y la familia tipográfica.
3. Opcionalmente, marca **Añadir marcador para la página del índice** para incluir el propio índice en el árbol de marcadores.
4. Haz clic en **Generar tabla de contenidos** para procesar el archivo.
5. El PDF actualizado se descarga automáticamente con la página del índice insertada al principio.

## Opciones

- **Título del índice**: el encabezado que se muestra en la parte superior de la página generada. Por defecto es "Índice".
- **Tamaño de fuente**: elige entre 10 pt y 72 pt. El valor por defecto es 12 pt.
- **Familia tipográfica**: elige entre las variantes de Times Roman, Helvetica o Courier (normal, negrita, cursiva, negrita cursiva). Por defecto es Helvetica.
- **Añadir marcador para la página del índice**: si está marcado, se añade al árbol de esquema del PDF una entrada de marcador para la propia página del índice.

## Características

- Lee toda la jerarquía de marcadores del PDF
- Genera una página de índice con formato limpio y referencias a números de página
- Admite niveles de marcadores anidados con sangría
- Elección entre 12 fuentes PDF integradas
- Marcador autorreferenciado opcional para la página del índice

## Casos de uso

- Añadir una tabla de contenidos imprimible a libros electrónicos o informes que solo tienen marcadores digitales
- Crear un índice para un documento combinado tras unir varios PDF
- Generar una página de referencia para manuales técnicos extensos
- Preparar documentos para impresión en los que se espera un índice visible

## Consejos

- Si tu PDF no tiene marcadores, usa primero la herramienta [Editar marcadores](./bookmark) para crearlos y luego vuelve aquí para generar el índice.
- En documentos grandes, un tamaño de fuente mayor, como 14 pt o 16 pt, mejora la legibilidad.

## Herramientas relacionadas

- [Editar marcadores](./bookmark)
- [Números de página](./page-numbers)
- [Encabezado y pie de página](./header-footer)
