---
title: Linealizar PDF
description: Optimiza archivos PDF para verlos rápido en la web con carga progresiva. También conocido como optimización "Fast Web View".
---

# Linealizar PDF

La linealización reestructura un PDF para que la primera página pueda mostrarse antes de que se haya descargado todo el archivo. Adobe lo llama "Fast Web View". Si alojas PDF en un sitio web o los sirves desde un portal de documentos, la linealización hace que se abran de forma notablemente más rápida.

## Cómo funciona

1. Sube uno o más archivos PDF.
2. Haz clic en **Linealizar PDF**.
3. Descarga los resultados como un archivo ZIP con todos los archivos linealizados.

No hay ajustes que configurar. La herramienta usa la opción `--linearize` de QPDF, que reorganiza la estructura interna del PDF sin alterar su contenido visual.

## Qué hace la linealización

- Reordena los objetos del PDF para que los datos de la primera página aparezcan al principio del archivo
- Añade un diccionario de linealización y tablas de pistas para que los visores sepan dónde encontrar cada página
- Habilita las solicitudes por rangos de bytes: un navegador puede obtener solo la primera página sin descargar todo el archivo
- Limpia la tabla de referencias cruzadas para un acceso aleatorio eficiente

## Características

- Procesamiento por lotes de varios PDF en una sola operación
- El resultado conserva todo el contenido, las fuentes, las imágenes y los elementos interactivos
- Usa QPDF (WebAssembly) para una linealización fiable y conforme a los estándares
- Los resultados se empaquetan en un ZIP para descargarlos fácilmente

## Casos de uso

- Alojar informes PDF en un sitio web donde los usuarios esperan ver la página al instante
- Incrustar PDF en aplicaciones web con visores en el navegador
- Publicar catálogos o manuales en PDF a los que se accede con conexiones móviles lentas
- Preparar documentos para redes de distribución de contenido (CDN) que admiten el servicio por rangos de bytes

## Consejos

- Linealiza cuando hayas terminado el resto de las ediciones. Cualquier modificación posterior (combinar, añadir páginas) romperá la linealización.
- Combínalo con Comprimir PDF para obtener los PDF más pequeños y de carga más rápida posible.
- La linealización añade un pequeño aumento al tamaño del archivo (normalmente menos del 1 %).

## Herramientas relacionadas

- [Comprimir PDF](./compress-pdf): reduce el tamaño del archivo antes de linealizar
- [Reparar PDF](./repair-pdf): corrige problemas estructurales que impiden la linealización
- [Eliminar metadatos](./remove-metadata): quita los metadatos antes de publicar en línea
