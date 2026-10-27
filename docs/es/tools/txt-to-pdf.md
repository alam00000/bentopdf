---
title: Texto a PDF
description: Convierte archivos de texto sin formato o texto escrito a PDF con fuentes, colores y tamaños de página personalizados.
---

# Texto a PDF

Convierte texto sin formato en un PDF con formato. Puedes subir archivos `.txt` o escribir directamente en el editor de texto integrado. La herramienta admite varias fuentes, colores de texto personalizados y una amplia gama de tamaños de página, de A0 a A10, además de US Letter, Legal y Tabloid.

## Formatos compatibles

| Entrada           | Extensiones                 |
| :---------------- | :-------------------------- |
| Archivos de texto | `.txt`                      |
| Entrada directa   | Escribe o pega en el editor |

## Cómo funciona

1. Elige el modo de entrada con el interruptor de la parte superior: **Subir archivos** o **Escribir texto**.
2. Si subes archivos, arrastra y suelta o haz clic para seleccionar uno o más archivos `.txt`. Si escribes, introduce el texto directamente en el área de texto.
3. Configura las opciones de formato: familia tipográfica, tamaño de fuente, color del texto y tamaño de página.
4. Haz clic en **Crear PDF**. El resultado se descarga como `text_to_pdf.pdf`.

Al subir varios archivos, sus contenidos se concatenan con líneas en blanco entre ellos.

## Opciones

| Opción                  | Valores                                                                      | Por defecto     |
| :---------------------- | :--------------------------------------------------------------------------- | :-------------- |
| **Familia tipográfica** | Helvetica (sans-serif), Tiro (serif), Courier (monoespaciada), Times (serif) | Helvetica       |
| **Tamaño de fuente**    | 6 a 72 pt                                                                    | 12              |
| **Color del texto**     | Cualquier color mediante el selector de color                                | Negro (#000000) |
| **Tamaño de página**    | ISO A0-A10, B0-B10, C0-C10, US Letter, Legal, Tabloid, Ledger, 11x17         | A4              |

Los idiomas de derecha a izquierda (árabe, hebreo, persa, urdu) se detectan automáticamente. Cuando se encuentra texto RTL, la dirección y la alineación del texto cambian en consecuencia.

## Casos de uso

- Convertir fragmentos de código o archivos de registro en un PDF imprimible con la fuente Courier
- Crear un PDF rápido a partir de notas de reunión escritas al momento
- Dar formato a un manuscrito de texto sin formato con una fuente y un tamaño de página concretos para su envío
- Producir una versión PDF de un README o un registro de cambios para distribuirla sin conexión

## Consejos

- Usa el modo **Escribir texto** cuando quieras convertir rápidamente el contenido del portapapeles sin guardarlo antes como archivo.
- Courier (monoespaciada) es la mejor fuente para código, registros o cualquier contenido en el que importe la alineación de columnas.
- Los márgenes de página son fijos, de 72 puntos (1 pulgada) por todos los lados.

## Herramientas relacionadas

- [Markdown a PDF](./markdown-to-pdf)
- [CSV a PDF](./csv-to-pdf)
- [Word a PDF](./word-to-pdf)
