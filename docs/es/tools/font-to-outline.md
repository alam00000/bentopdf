---
title: Fuente a contorno
description: Convierte todas las fuentes de un PDF en contornos vectoriales para un renderizado uniforme en cualquier dispositivo. Elimina los problemas de dependencia de fuentes.
---

# Fuente a contorno

Convertir las fuentes en contornos transforma cada carácter de texto de un glifo basado en fuente en un trazado vectorial. El PDF deja de depender de las fuentes instaladas: se ve igual en cualquier dispositivo, sistema operativo e impresora. Es un paso habitual en los flujos de preimpresión.

## Cómo funciona

1. Sube uno o más archivos PDF.
2. Haz clic en **Convertir en contornos**.
3. Ghostscript convierte todo el texto en trazados vectoriales.
4. Descarga el resultado. Varios archivos generan un archivo ZIP.

No hay ajustes que configurar. La herramienta usa Ghostscript (WebAssembly) para convertir todas las referencias de fuentes en trazados de contorno en una sola pasada.

## Qué cambia

- Los caracteres de texto pasan a ser curvas vectoriales (trazados bezier)
- Ya no es necesario incrustar las fuentes: el PDF es autocontenido a nivel de glifo
- El tamaño del archivo puede aumentar porque los trazados vectoriales suelen ocupar más que las referencias a fuentes
- La apariencia visual se conserva exactamente

## Qué pierdes

- La selección y el copiado de texto
- La capacidad de búsqueda del texto (Ctrl+F deja de funcionar)
- La posibilidad de editar el contenido del texto
- La accesibilidad para lectores de pantalla

## Casos de uso

- Enviar PDF a una imprenta que exige fuentes convertidas a contornos
- Compartir documentos con fuentes personalizadas o con licencia con personas que no las tienen
- Evitar la sustitución de fuentes que cambia el aspecto de tu documento en otros sistemas
- Preparar PDF para flujos de grabado láser o corte CNC que requieren entrada vectorial
- Asegurar que un PDF con muchos logotipos se muestre correctamente en todas las plataformas

## Consejos

- Conserva tu PDF original. Convertir a contornos es irreversible: no puedes volver a convertir los trazados en texto editable.
- Si necesitas que el texto siga siendo buscable, considera usar la herramienta Rasterizar PDF con OCR como paso posterior.
- Los PDF con contornos tienden a ser más grandes. Ejecuta Comprimir PDF después si el tamaño importa.

## Herramientas relacionadas

- [Aplanar PDF](./flatten-pdf): aplana formularios y anotaciones sin tocar las fuentes
- [Rasterizar PDF](./rasterize-pdf): convierte a PDF basado en imágenes en lugar de contornos vectoriales
- [Comprimir PDF](./compress-pdf): reduce el tamaño del archivo tras convertir a contornos
- [PDF a PDF/A](./pdf-to-pdfa): convierte para archivo tras asegurar la independencia de fuentes
