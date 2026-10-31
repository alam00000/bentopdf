---
title: CBZ a PDF
description: Convierte archivos de cómics CBZ y CBR a PDF en tu navegador. Gratis, privado, sin subir archivos.
---

# CBZ a PDF

Convierte archivos de cómics en PDF. CBZ y CBR son los formatos estándar de los cómics digitales: son simplemente archivos ZIP o RAR llenos de imágenes. Esta herramienta extrae cada página, conserva el orden de lectura y produce un PDF limpio donde cada imagen se convierte en una página a tamaño completo.

## Formatos Compatibles

| Formato | Extensión | Notas                                                                |
| :------ | :-------- | :------------------------------------------------------------------- |
| CBZ     | `.cbz`    | Archivo de cómic basado en ZIP (procesado localmente con pdf-lib)    |
| CBR     | `.cbr`    | Archivo de cómic basado en RAR (procesado mediante el motor PyMuPDF) |

El conversor de CBZ reconoce imágenes JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC y JXL dentro del archivo. Los formatos no estándar se convierten automáticamente a PNG antes de incrustarse.

## Cómo Funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos CBZ o CBR. Puedes mezclar ambos formatos en un mismo lote.
2. Revisa los archivos listados. Quita los que no necesites o haz clic en **Agregar Más Archivos** para agregar más.
3. Haz clic en **Convertir a PDF**. Con los archivos CBZ, la herramienta descomprime el archivo, ordena las imágenes por nombre en orden natural, detecta el formato real de cada imagen y las incrusta en un PDF con pdf-lib. Los archivos CBR se procesan con el motor PyMuPDF.
4. Un solo archivo se descarga como PDF. Varios archivos producen un ZIP llamado `comic-converted.zip`.

## Opciones

No se requiere configuración. Cada imagen se convierte en una página del mismo tamaño que sus dimensiones originales, así que las páginas dobles siguen siendo anchas y las páginas sencillas siguen siendo estrechas.

## Casos de Uso

- Leer cómics en una tableta o una app de teléfono que admite PDF pero no CBZ/CBR
- Imprimir páginas específicas de un cómic digital
- Archivar una colección de cómics en un formato que cualquier visor de archivos pueda abrir
- Compartir un cómic con alguien que no tiene un lector de cómics dedicado

## Consejos

- Las imágenes dentro del archivo se ordenan con orden natural (así `page2.jpg` va antes que `page10.jpg`). Nombra tus archivos con una numeración consistente para obtener la secuencia de páginas correcta.
- El conversor detecta los formatos de imagen por sus firmas binarias, no por las extensiones. Un PNG nombrado por error `.jpg` se incrustará correctamente.
- Los archivos CBZ se procesan por completo en el navegador sin cargar el motor PyMuPDF, por lo que se convierten más rápido que los CBR.

## Herramientas Relacionadas

- [EPUB a PDF](./epub-to-pdf)
- [MOBI a PDF](./mobi-to-pdf)
- [Imágenes a PDF](./image-to-pdf)
