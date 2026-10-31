---
title: SVG a PDF
description: Convierte gráficos vectoriales SVG a PDF con control de calidad, íntegramente en tu navegador.
---

# SVG a PDF

Convierte archivos Scalable Vector Graphics (SVG) a PDF. La herramienta rasteriza cada SVG con el motor de renderizado del navegador y luego incrusta el resultado a su resolución original. Es útil para convertir iconos vectoriales, diagramas e ilustraciones en documentos portátiles.

## Formatos compatibles

| Formato | Extensiones |
| :------ | :---------- |
| SVG     | `.svg`      |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta uno o más archivos SVG.
2. Revisa y gestiona la lista de archivos.
3. Elige un nivel de **calidad del PDF**.
4. Haz clic en **Convertir a PDF**. El resultado se descarga como `from_svgs.pdf`.

Cada SVG se lee como texto, se renderiza en un lienzo con su ancho y alto intrínsecos (800x600 por defecto si no se especifican dimensiones) y se exporta como PNG. Ese PNG se incrusta después en el PDF con pdf-lib. Las áreas transparentes se rellenan con fondo blanco.

## Opciones

La **calidad del PDF** controla la compresión tras la rasterización:

- **Calidad alta**: lo más cercano al renderizado original.
- **Calidad media** (por defecto): buen equilibrio.
- **Calidad baja**: el archivo más pequeño, con cierta pérdida de detalle.

## Casos de uso

- Convertir diagramas de arquitectura o ingeniería de SVG a un PDF listo para imprimir
- Empaquetar conjuntos de iconos en un PDF de referencia para un sistema de diseño
- Convertir visualizaciones de datos (D3.js, exportaciones de bibliotecas de gráficos) en PDF listos para informes
- Crear versiones imprimibles de infografías basadas en SVG

## Consejos

- Los archivos SVG sin atributos `width` y `height` explícitos se renderizan a 800x600 píxeles. Para obtener mejores resultados, define las dimensiones en el código del SVG antes de convertir.
- Los SVG complejos con referencias a fuentes externas o imágenes enlazadas pueden no renderizarse a la perfección. Incrusta todos los recursos en el SVG para un resultado fiable.
- Como el SVG se rasteriza, el PDF contendrá una imagen de mapa de bits en lugar de trazados vectoriales. Para obtener un PDF vectorial real, se necesita una herramienta vectorial específica.

## Herramientas relacionadas

- [Imágenes a PDF](./image-to-pdf)
- [PNG a PDF](./png-to-pdf)
- [BMP a PDF](./bmp-to-pdf)
