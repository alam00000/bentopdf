---
title: OCR PDF
description: Haz que los PDF escaneados se puedan buscar y copiar con Tesseract OCR, con compatibilidad con varios idiomas y filtrado de caracteres.
---

# OCR PDF

Convierte documentos escaneados en PDF en los que se puede buscar y copiar. La herramienta usa Tesseract OCR para reconocer el texto de las imágenes y superpone una capa de texto invisible sobre las páginas originales, conservando su apariencia visual y haciendo que el contenido sea totalmente buscable.

## Cómo funciona

1. Sube un PDF escaneado o basado en imágenes.
2. Selecciona uno o más idiomas presentes en el documento en la lista de idiomas con búsqueda.
3. Opcionalmente, ajusta la configuración avanzada (resolución, binarización, lista blanca).
4. Haz clic en **Iniciar OCR** y sigue el progreso en la barra de progreso en tiempo real.
5. Al terminar, revisa el texto extraído y descarga el PDF con búsqueda o un archivo `.txt` de texto plano.

## Características

- OCR en varios idiomas con un selector de idiomas con búsqueda
- La capa de texto invisible conserva la apariencia original del documento
- Barra de progreso y registro en tiempo real durante el procesamiento
- Descarga los resultados como PDF con búsqueda o como archivo de texto plano
- Copia el texto extraído directamente al portapapeles
- Tres niveles de resolución para equilibrar velocidad y precisión

## Opciones

| Ajuste                                      | Valores                                                                                                 | Predeterminado | Finalidad                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| **Resolución**                              | Estándar (192 DPI), Alta (288 DPI), Ultra (384 DPI)                                                     | Alta           | Una mayor resolución mejora la precisión con texto pequeño, pero tarda más                     |
| **Binarizar imagen**                        | Activado / Desactivado                                                                                  | Desactivado    | Mejora el contraste de escaneos limpios al convertirlos a blanco y negro                       |
| **Preajuste de lista blanca de caracteres** | Ninguno, Alfanumérico, Números + Moneda, Solo letras, Solo números, Factura, Formularios, Personalizado | Ninguno        | Restringe los caracteres reconocidos para mejorar la precisión en tipos de documento concretos |
| **Lista blanca de caracteres**              | Texto libre                                                                                             | Vacío          | Conjunto de caracteres manual cuando el preajuste es Personalizado                             |

## Casos de uso

- Hacer que los contratos y facturas escaneados sean buscables para poder usar Ctrl+F en ellos
- Extraer texto de documentos fotografiados o de registros en papel antiguos
- Procesar recibos con el preajuste Invoice para capturar con precisión importes y fechas
- Crear PDF accesibles a partir de escaneos que solo contienen imágenes, para cumplir requisitos normativos
- Extraer por lotes el contenido de texto de libros o manuales escaneados

## Consejos

- Selecciona varios idiomas si tu documento tiene contenido en idiomas mezclados (por ejemplo, encabezados en inglés con texto principal en japonés).
- Usa la opción de binarizar en documentos con texto desvaído o de bajo contraste: puede mejorar mucho la precisión del reconocimiento.
- Los preajustes de lista blanca Invoice y Forms reducen drásticamente los falsos positivos en documentos estructurados al ignorar formas de caracteres irrelevantes.

## Herramientas relacionadas

- [Extraer tablas](./extract-tables)
- [Combinar PDF](./merge-pdf)
- [Comprimir PDF](./compress-pdf)
