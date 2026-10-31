---
title: Eliminar páginas en blanco
description: Detecta y elimina automáticamente las páginas en blanco o casi en blanco de tu PDF con sensibilidad ajustable.
---

# Eliminar páginas en blanco

Analiza tu PDF en busca de páginas en blanco o casi en blanco y las elimina automáticamente. La herramienta renderiza cada página y analiza el contenido de sus píxeles para determinar si está en blanco, y luego te permite confirmar qué páginas quitar antes de procesar.

## Cómo funciona

1. Sube tu archivo PDF.
2. Ajusta el control deslizante de **Sensibilidad** para definir lo estricta que es la definición de "en blanco".
3. Haz clic en **Detectar páginas en blanco** para analizar el documento.
4. La herramienta muestra miniaturas de las páginas en blanco detectadas para que las revises.
5. Confirma la selección y descarga el PDF limpio sin las páginas en blanco.

## Opciones

- **Sensibilidad**: un control deslizante de 0% a 100% (80% por defecto). Los valores altos son más estrictos y solo marcan páginas completamente o casi blancas. Los valores bajos son más permisivos y detectan páginas con contenido mínimo, como un solo punto o una marca de agua tenue.

## Características

- Análisis a nivel de píxel de cada página para detectar contenido en blanco
- Control deslizante de sensibilidad ajustable para afinar la detección
- Vista previa en miniatura de las páginas en blanco detectadas para verificarlas manualmente
- Conserva todas las páginas que no están en blanco exactamente como están
- Gestiona documentos de cualquier tamaño o número de páginas
- Indicador de progreso durante el análisis

## Casos de uso

- Limpiar documentos escaneados en los que el escáner capturó los reversos vacíos de originales a una sola cara
- Quitar páginas separadoras de lotes de documentos escaneados en masa
- Eliminar páginas en blanco insertadas por sistemas de gestión documental
- Limpiar PDF exportados desde procesadores de texto que a veces incluyen páginas en blanco al final
- Reducir el tamaño del archivo eliminando páginas vacías innecesarias

## Consejos

- Empieza con la sensibilidad por defecto del 80% y ajústala desde ahí. Si la herramienta no detecta páginas que a ti te parecen en blanco, baja la sensibilidad. Si marca páginas con contenido ligero que quieres conservar, súbela.
- La herramienta renderiza cada página para analizar su contenido, así que el tiempo de procesamiento crece con el número de páginas. En documentos muy grandes, espera una breve pausa.
- Revisa las páginas en blanco detectadas en la vista previa de miniaturas antes de confirmar la eliminación. Las páginas con encabezados, pies de página o marcas de agua tenues pueden marcarse según los ajustes de sensibilidad.

## Herramientas relacionadas

- [Recortar PDF](./crop-pdf)
- [Editor de PDF](./edit-pdf)
- [Números de página](./page-numbers)
