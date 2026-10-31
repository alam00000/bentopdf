---
title: Intercalar escaneo a doble cara
description: Reordena PDFs de escaneo a doble cara que contienen las páginas frontales y traseras en bloques separados, para dejarlas en el orden correcto de anverso y reverso.
---

# Intercalar escaneo a doble cara

Intercalar escaneo a doble cara está pensado para flujos de escaneo con alimentador automático (ADF) donde un PDF contiene dos bloques de páginas:

- primero todos los anversos
- después todos los reversos

En lugar de dividir y reensamblar manualmente, esta herramienta intercala los dos bloques en el orden natural de lectura: anverso1, reverso1, anverso2, reverso2, y así sucesivamente.

## Cómo Funciona

1. Sube un único PDF creado al escanear una pila a doble cara.
2. Define el punto de división donde termina el bloque de anversos.
3. Elige cómo tratar el bloque de reversos:
   - **Invertir el bloque de reversos** (habitual cuando se voltea la pila antes de escanear los reversos)
   - **Mantener el bloque de reversos tal cual**
4. Haz clic en **Intercalar PDF** para descargar el resultado reordenado.

## Opciones

- **Detectar división automáticamente (mitad)**: fija el punto de división en `ceil(totalPages / 2)`.
- **Aviso de páginas impares**: avisa cuando el total de páginas es impar (a menudo indica un desajuste en el escaneo).
- **Confirmación de bloques desiguales**: pide confirmación cuando los bloques de anversos y reversos tienen tamaños distintos.
- **Exportación agrupada**: divide el resultado intercalado en PDFs separados según el número de páginas del documento original y los descarga como ZIP.

## Comportamiento de la Salida

- **Predeterminado**: un PDF de salida (un solo PDF de entrada, un solo PDF de salida).
- **Modo agrupado**: la salida se divide en fragmentos según tu valor de páginas por documento; si se producen varios fragmentos, se descargan en un único ZIP; de lo contrario, se descarga un solo PDF.

Si los bloques tienen tamaños distintos, primero se intercalan las páginas emparejadas y las páginas restantes sin pareja se agregan al final.

## Casos de Uso Comunes

- Restaurar el orden después de escanear una pila de formularios a doble cara en dos pasadas.
- Reconstruir paquetes de anverso y reverso a partir de escáneres de oficina que entregan todos los anversos y luego todos los reversos.
- Posprocesar escaneos de archivo antes de dividirlos en archivos por documento.

## Consejos

- La mayoría de los lotes a doble cara deberían tener un total de páginas par.
- Si los reversos se ven invertidos en el resultado, alterna entre **Invertir el bloque de reversos** y **Mantener el bloque de reversos tal cual**.
- Para originales de 2 páginas (anverso y reverso), usa la exportación agrupada con `2` páginas por documento.

## Herramientas Relacionadas

- [Alternar y Mezclar Páginas](./alternate-merge)
- [Dividir PDF](./split-pdf)
- [Fusionar PDF](./merge-pdf)
- [Organizar y Duplicar](./organize-pdf)
