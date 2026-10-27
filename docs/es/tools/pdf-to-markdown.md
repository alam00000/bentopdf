---
title: PDF a Markdown
description: Convierte documentos PDF a formato Markdown con extracción opcional de imágenes. Admite la conversión por lotes de varios archivos.
---

# PDF a Markdown

Convierte archivos PDF a formato Markdown (`.md`) conservando encabezados, párrafos, listas y el formato básico. Opcionalmente extrae e incluye las imágenes incrustadas. Admite conversión individual y por lotes. Funciona con PyMuPDF.

## Cómo funciona

1. Sube uno o más PDF haciendo clic en la zona de carga o arrastrando archivos hasta ella.
2. Opcionalmente, activa **Incluir imágenes** para incrustar las imágenes extraídas en la salida Markdown.
3. Haz clic en **Convertir** para iniciar el procesamiento.
4. Un solo archivo se descarga como `filename.md`. Varios archivos generan un `markdown-files.zip`.

## Opciones

- **Incluir imágenes**: si está marcada, las imágenes incrustadas del PDF se extraen y se referencian en la salida Markdown. Si no está marcada, solo se convierte el contenido de texto.

## Formato de salida

- **Un archivo**: `filename.md`
- **Varios archivos**: `markdown-files.zip` con un `.md` por cada PDF de entrada.

## Casos de uso

- Convertir documentación en PDF a Markdown para un generador de sitios estáticos como VitePress, Hugo o Jekyll.
- Convertir artículos de investigación en PDF a Markdown editable para aplicaciones de notas como Obsidian.
- Migrar bases de conocimiento antiguas en PDF a un formato de texto compatible con Git.
- Extraer contenido estructurado de ebooks en PDF para darles otro formato.

## Consejos

- La opción Incluir imágenes es útil cuando el PDF contiene diagramas o figuras esenciales para el contenido. Desactívala en documentos con mucho texto para mantener limpia la salida.
- Los diseños complejos con barras laterales, notas al pie o texto en varias columnas pueden producir un Markdown imperfecto. Revisa y ajusta el resultado según haga falta.
- Para texto sin procesar y sin ningún formato, usa en su lugar [PDF a Texto](./pdf-to-text).

## Herramientas relacionadas

- [PDF a Texto](./pdf-to-text)
- [PDF a Word](./pdf-to-word)
- [Preparar PDF para IA](./prepare-pdf-for-ai)
