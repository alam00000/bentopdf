---
title: Reparar PDF
description: Recupera datos de archivos PDF corruptos o dañados con el motor de reparación de QPDF. Admite procesamiento por lotes.
---

# Reparar PDF

Cuando un PDF no se abre, muestra contenido ilegible o provoca errores en tu visor, esta herramienta intenta reconstruir su estructura interna. Usa el motor de reparación de QPDF, que puede recuperar datos de muchos tipos de corrupción: tablas de referencias cruzadas rotas, flujos truncados, referencias de objetos no válidas y más.

## Cómo funciona

1. Sube uno o más archivos PDF dañados.
2. Haz clic en **Reparar PDF**.
3. Un solo archivo reparado se descarga directamente. Varios archivos generan un archivo ZIP.

La herramienta pasa cada archivo por QPDF con la opción `--decrypt`, que obliga a QPDF a leer y reescribir toda la estructura del PDF, corrigiendo por el camino los problemas recuperables.

## Características

- Reparación por lotes de varios PDF en una sola operación
- Detección automática de archivos recuperables y no recuperables
- Informe de éxito o fallo por archivo al procesar varios archivos
- Usa QPDF (WebAssembly), una biblioteca de transformación de PDF probada a fondo

## Qué puede arreglar

- Tablas de referencias cruzadas rotas o ausentes
- Finales de archivo truncados por descargas incompletas
- Numeración de objetos y longitudes de flujo no válidas
- Inconsistencias estructurales menores de generadores de PDF defectuosos
- Restos de cifrado de intentos de descifrado fallidos

## Qué no puede arreglar

- Archivos muy truncados en los que falta la mayor parte de los datos de contenido
- PDF cifrados con una contraseña que no tienes
- Archivos que en realidad no son PDF (extensión de archivo incorrecta)
- Corrupción de imágenes dentro del PDF (se arregla la estructura, pero los datos de píxeles no se regeneran)

## Casos de uso

- Recuperar un PDF de una descarga fallida por correo
- Abrir archivos producidos por generadores de PDF antiguos o no estándar
- Arreglar PDF que funcionan en un visor pero no en otro
- Preparar documentos de archivo dañados para su almacenamiento a largo plazo

## Consejos

- Si la reparación falla, prueba a abrir el archivo primero en un navegador: los navegadores tienen su propia lógica de recuperación y pueden renderizar suficiente contenido para volver a guardarlo.
- Para PDF cifrados que fallan al repararse, prueba primero Descifrar PDF y después repara el resultado descifrado.

## Herramientas relacionadas

- [Comprimir PDF](./compress-pdf): limpia aún más la estructura del PDF reparado
- [Linealizar PDF](./linearize-pdf): optimiza el archivo reparado para su entrega web
- [Aplanar PDF](./flatten-pdf): aplana formularios que puedan haberse dañado
