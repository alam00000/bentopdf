---
title: PDF a CBZ
description: Convierte un PDF en un archivo CBZ (Comic Book Archive) para lectores de cómics como Komga, Kavita, CDisplayEx y Calibre.
---

# PDF a CBZ

Convierte un PDF en un archivo CBZ (Comic Book ZIP), el formato estándar de cómics y manga digitales. Cada página del PDF se convierte en una imagen dentro del archivo. La herramienta genera metadatos en tres formatos para lograr la máxima compatibilidad: ComicInfo.xml, metadata.opf y ComicBookInfo JSON.

## Cómo funciona

1. Sube un PDF haciendo clic en la zona de carga o arrastrando un archivo hasta ella.
2. Elige el formato de imagen, la calidad, la escala y los metadatos opcionales.
3. Haz clic en **Convertir** para generar el archivo CBZ.
4. El archivo `.cbz` se descarga automáticamente.

## Opciones

| Opción            | Valores         | Predeterminado | Descripción                                                                                             |
| ----------------- | --------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| Formato de imagen | JPEG, PNG, WebP | JPEG           | JPEG para cómics a color, PNG para manga en blanco y negro sin pérdida, WebP para la mejor compresión.  |
| Calidad           | 50–100%         | 85%            | Controla la compresión de JPEG/WebP. Se oculta con PNG (siempre sin pérdida).                           |
| Escala            | 1.0x–4.0x       | 2.0x           | Una escala mayor produce imágenes más nítidas para pantallas de alta resolución.                        |
| Escala de grises  | Sí/No           | No             | Convierte las páginas a escala de grises. Reduce el tamaño del archivo con contenido en blanco y negro. |
| Modo manga        | Sí/No           | No             | Establece en los metadatos la dirección de lectura de derecha a izquierda.                              |
| Incluir metadatos | Sí/No           | Sí             | Incrusta ComicInfo.xml, metadata.opf y ComicBookInfo JSON.                                              |

## Campos de metadatos

Cuando los metadatos están activados, puedes rellenar:

- **Título**: se detecta automáticamente a partir del nombre del archivo PDF.
- **Serie**: el nombre de la serie (p. ej., "Naruto").
- **Número (#)**: número del ejemplar dentro de la serie.
- **Volumen (Vol.)**: número de volumen.
- **Autor(es)**: nombre del guionista o creador.
- **Editorial**: empresa editora.
- **Etiquetas / Género**: etiquetas separadas por comas (p. ej., "Acción, Aventura").
- **Año de publicación**: año de publicación (1900–2100).
- **Valoración**: valoración de la comunidad de 0 a 5.

## Compatibilidad de metadatos

La herramienta escribe los metadatos en tres formatos para que cualquier lector pueda encontrarlos:

| Formato            | Ubicación                   | Compatible con                              |
| ------------------ | --------------------------- | ------------------------------------------- |
| ComicInfo.xml      | Archivo dentro del ZIP      | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Archivo dentro del ZIP      | Calibre                                     |
| ComicBookInfo JSON | Campo de comentario del ZIP | Calibre (alternativa)                       |

## Formato de salida

- `filename.cbz`: un archivo ZIP con las imágenes de página numeradas y los archivos de metadatos.

Las imágenes de página se nombran con números rellenados con ceros (`01.jpg`, `02.jpg`, etc.) para que los lectores las muestren en el orden correcto.

## Casos de uso

- Convertir PDF de manga o cómics para usarlos con lectores de cómics.
- Crear una biblioteca de cómics digital en Komga, Kavita o Calibre.
- Convertir cómics escaneados a un formato apto para lectores.
- Compartir cómics en un formato que conserva la dirección de lectura y los metadatos.

## Consejos

- Usa **JPEG** para cómics a color y **PNG** para manga en blanco y negro: PNG comprime muy bien el contenido en blanco y negro.
- Activa **Escala de grises** en el manga para reducir de forma notable el tamaño del archivo.
- Rellena los campos **Serie** y **Número** para que los gestores de biblioteca (Komga, Calibre) organicen tu colección automáticamente.
- **WebP** ofrece la mejor compresión, pero algunos lectores de cómics antiguos pueden no admitirlo.

## Herramientas relacionadas

- [PDF a JPG](./pdf-to-jpg)
- [PDF a PNG](./pdf-to-png)
- [PDF a TIFF](./pdf-to-tiff)
- [Extraer imágenes](./extract-images)
