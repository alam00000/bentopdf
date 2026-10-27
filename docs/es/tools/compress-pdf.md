---
title: Comprimir PDF
description: Reduce el tamaño de un PDF hasta un 90% con el motor Hyper Compress. Admite tamaños de archivo objetivo, procesamiento por lotes y ajustes de calidad personalizados.
---

# Comprimir PDF

Reduce el tamaño de tus archivos PDF sin destruirlos. Comprimir PDF funciona con [Hyper Compress](https://www.bentopdf.com/hyper-compress), el motor de compresión propio de BentoPDF. Recomprime imágenes, crea subconjuntos de fuentes y las fusiona, y elimina el peso muerto, como las miniaturas incrustadas y los datos privados de aplicaciones. El PDF sigue siendo totalmente funcional: el texto se puede seleccionar y los enlaces y campos de formulario siguen funcionando.

Hyper Compress está compilado a WebAssembly y se incluye con BentoPDF, así que la compresión funciona sin conexión y en despliegues aislados de la red, sin configuración adicional.

## Cómo Funciona

1. Sube uno o más PDFs haciendo clic en la zona de carga o arrastrando los archivos.
2. Elige un **Nivel de compresión**: Bajo, Medio, Alto o Sin pérdidas.
3. Opcionalmente, ingresa un **Tamaño de archivo objetivo**, o expande **Ajustes personalizados** para un control más fino, incluido **Convertir a escala de grises**.
4. Haz clic en **Comprimir PDF**. Con varios archivos, obtienes una sola descarga en ZIP.

## Documentos Especiales

- **Los PDFs firmados digitalmente** se devuelven sin cambios, porque cualquier modificación invalidaría la firma. Activa **Anular la protección del contenido** en Ajustes personalizados para quitar las firmas y comprimirlos; la firma visible permanece en la página, pero el archivo deja de estar firmado.
- **Los archivos PDF/A** pierden su etiqueta PDF/A tras la compresión, para que el archivo nunca declare una conformidad que ya no cumple. Activa **Conservar PDF/A** en Ajustes personalizados para mantener la conformidad del archivo.
- **Los PDFs protegidos con contraseña** muestran un campo de contraseña en su tarjeta de archivo. Ingresa la contraseña allí y Hyper Compress abre el archivo por sí mismo, sin un paso de desbloqueo aparte. Con dos o más archivos bloqueados, un campo compartido desbloquea todos los archivos que usan la misma contraseña. La copia comprimida no tiene contraseña; usa [Proteger PDF](./protect-pdf) para agregarla de nuevo.
- **Los escaneos sin capa de texto** pueden reducirse aún más con **Rasteriza las páginas a imágenes** en Ajustes personalizados, que reemplaza cada página por una imagen optimizada. Se omite en cualquier documento con texto seleccionable, incluidos los escaneos con OCR, a menos que **Anular la protección del contenido** esté activado. En ese caso, las páginas de texto también se convierten en imágenes, por lo que el texto deja de ser seleccionable y los enlaces dejan de funcionar.

## Niveles de Compresión

| Nivel            | Calidad de Imagen | Resolución Máxima | Ideal Para                     |
| ---------------- | ----------------- | ----------------- | ------------------------------ |
| **Bajo**         | 80                | 200 DPI           | Conservar la calidad visual    |
| **Medio**        | 50                | 150 DPI           | Documentos de uso diario       |
| **Alto**         | 20                | 72 DPI            | Adjuntos de correo, cargas web |
| **Sin pérdidas** | Imágenes intactas | Sin cambios       | Copias de archivo              |

Alto también quita la incrustación de las 14 fuentes estándar de PDF, además de fuentes similares como Arial cuando es seguro hacerlo.

## Tamaño de Archivo Objetivo

Ingresa un tamaño en KB o MB y Hyper Compress busca la mejor calidad de imagen que aún quepa, partiendo del nivel que elegiste. Si el documento no puede llegar a ese tamaño, obtienes la versión más pequeña posible y un mensaje que lo indica. Las páginas dedicadas, como [Comprimir PDF a 1MB](https://www.bentopdf.com/compress-pdf-to-1mb), se abren con el objetivo ya rellenado.

## Ajustes Personalizados

Expande el panel Ajustes personalizados para ajustar Hyper Compress directamente. Al elegir un nivel de compresión, estos valores se restablecen a los de ese nivel, y al editar cualquiera de ellos el nivel cambia a Personalizado.

- **Anular la protección del contenido**: por defecto, Hyper Compress deja intactos los PDFs firmados y no rasteriza páginas que tienen texto. Al activarlo se omiten ambas protecciones. Se mantiene activado cuando cambias el nivel.

- **Imágenes**: calidad de imagen, resolución máxima, remuestreo forzado, reducción de color, recorte de áreas de imagen invisibles, eliminación de imágenes alternativas, simplificación de perfiles de color, JPEG 2000 y modo sin pérdida
- **Fuentes**: creación de subconjuntos, fusión de duplicados y eliminación de la incrustación de fuentes estándar y sus similares
- **Contenido**: aplanado de anotaciones, campos de formulario o enlaces
- **Limpieza**: eliminación de miniaturas, datos de aplicaciones, hilos de artículos, información de captura web, el árbol de estructura o los perfiles de salida
- **Rasterizar**: reemplazo de páginas por imágenes, para escaneos solo de imagen; se omite cuando el documento tiene texto seleccionable
- **Salida**: Conservar PDF/A y compresión Brotli para lectores de PDF 2.0 que la admitan

## Casos de Uso

- Reducir un informe de 50 MB para que quepa en el límite de adjuntos de un correo
- Lograr que un escaneo quede por debajo del estricto límite de carga de un portal usando un tamaño de archivo objetivo
- Optimizar PDFs de marketing para descargas más rápidas desde un sitio web
- Archivar grandes conjuntos de documentos cuando el costo de almacenamiento importa
- Reducir el uso de datos móviles al compartir PDFs por aplicaciones de mensajería

## Consejos

- Empieza con Medio. Si el resultado sigue siendo demasiado grande, define un tamaño de archivo objetivo o sube a Alto.
- Para un escaneo sin capa de texto, activa Rasteriza las páginas a imágenes en Ajustes personalizados.
- Convertir a escala de grises, en Ajustes personalizados, puede reducir el tamaño de documentos con mucho color.

## Herramientas Relacionadas

- [Linealizar PDF](./linearize-pdf): optimiza el PDF comprimido para verlo rápido en la web
- [Rasterizar PDF](./rasterize-pdf): convierte páginas en imágenes con un DPI específico, incluidas las páginas con texto
- [Reparar PDF](./repair-pdf): arregla un PDF que se dañó durante una compresión en otro lugar
- [Eliminar Metadatos](./remove-metadata): quita datos ocultos por privacidad
