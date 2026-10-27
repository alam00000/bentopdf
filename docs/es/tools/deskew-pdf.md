---
title: Enderezar PDF
description: Endereza automáticamente las páginas inclinadas de PDFs escaneados con detección de inclinación de OpenCV. Umbral y DPI ajustables.
---

# Enderezar PDF

Los documentos escaneados rara vez quedan perfectamente rectos. Incluso una ligera inclinación reduce la precisión del OCR y hace que la impresión se vea descuidada. Esta herramienta usa los algoritmos de procesamiento de imágenes de OpenCV para detectar el ángulo de inclinación de cada página y girarla de nuevo hasta dejarla nivelada.

## Cómo Funciona

1. Sube uno o más PDFs escaneados.
2. Define el **Umbral de inclinación**: las páginas con una inclinación detectada por debajo de este valor se dejan intactas.
3. Elige una **Calidad de procesamiento (DPI)**: un DPI mayor mejora la precisión de la detección, pero tarda más.
4. Haz clic en **Enderezar PDF**.
5. Tras el procesamiento, un panel de resultados muestra el ángulo detectado de cada página y si se corrigió.

## Opciones

| Ajuste                             | Valores                   | Predeterminado |
| ---------------------------------- | ------------------------- | -------------- |
| **Umbral de inclinación**          | 0.1, 0.5, 1.0, 2.0 grados | 0.5            |
| **Calidad de procesamiento (DPI)** | 100, 150, 200, 300        | 150            |

## Cómo Funciona la Detección de Inclinación

La herramienta renderiza cada página como imagen con el DPI seleccionado y luego usa OpenCV para detectar los ángulos dominantes de las líneas del contenido. Si la inclinación detectada supera el umbral, la página se gira en el ángulo inverso para enderezarla. Las páginas por debajo del umbral pasan sin cambios.

## Casos de Uso

- Limpiar contratos o documentos legales escaneados por lotes
- Preparar recibos o facturas escaneados para el procesamiento OCR
- Enderezar páginas de un escáner de cama plana con una colocación del papel irregular
- Mejorar la calidad visual de materiales de archivo digitalizados

## Consejos

- Reduce el umbral a 0.1 grados si necesitas una alineación perfecta para el OCR.
- 150 DPI es rápido y preciso para la mayoría de los documentos. Usa 300 DPI para texto muy pequeño o páginas con detalles finos.
- Enderezar funciona mejor con documentos que tienen líneas de texto horizontales claras. Puede tener dificultades con páginas compuestas sobre todo por imágenes o elementos de diseño diagonales.

## Herramientas Relacionadas

- [Rasterizar PDF](./rasterize-pdf): convierte el resultado enderezado en un PDF plano basado en imágenes
- [Comprimir PDF](./compress-pdf): reduce el tamaño del archivo después de enderezar
- [Reparar PDF](./repair-pdf): arregla problemas estructurales en PDFs escaneados
