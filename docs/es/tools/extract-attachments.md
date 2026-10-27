---
title: Extraer adjuntos
description: Extrae todos los archivos adjuntos incrustados de uno o más PDFs y descárgalos como un archivo ZIP.
---

# Extraer adjuntos

Saca todos los adjuntos incrustados de uno o más archivos PDF. Todos los archivos extraídos se agrupan en un único ZIP para su descarga.

## Cómo Funciona

1. Sube uno o más archivos PDF que contengan adjuntos incrustados.
2. Haz clic en **Extraer adjuntos**.
3. La herramienta busca en cada PDF los adjuntos a nivel de documento y de página.
4. Todos los archivos encontrados se empaquetan en un ZIP y se descargan automáticamente.
5. Un mensaje de estado confirma cuántos adjuntos se encontraron y su tamaño total.

## Características

- Extracción por lotes de varios PDFs a la vez
- Extrae tanto los adjuntos a nivel de documento como de página
- Genera un único archivo ZIP con todos los archivos extraídos
- Muestra la cantidad total de adjuntos y el tamaño combinado de los archivos
- Mensajes de estado claros si no se encuentran adjuntos

## Casos de Uso

- Recuperar archivos de datos incrustados en el PDF de un informe
- Sacar recursos de imagen de un portafolio o de un documento de especificaciones
- Extraer materiales complementarios de PDFs de capacitación o de cumplimiento
- Auditar qué archivos están incrustados en un lote de PDFs

## Consejos

- Si la herramienta indica que no hay adjuntos, el PDF puede contener imágenes incrustadas o datos de formulario, que no son archivos adjuntos. Usa [Extraer imágenes](./extract-images) para las imágenes incrustadas.
- Al procesar varios PDFs, todos los adjuntos de cada archivo terminan en un solo ZIP. Los nombres de archivo se conservan tal como estaban en las incrustaciones originales.

## Herramientas Relacionadas

- [Agregar Adjuntos](./add-attachments)
- [Editar Adjuntos](./edit-attachments)
- [Extraer imágenes](./extract-images)
