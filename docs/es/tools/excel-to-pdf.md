---
title: Excel a PDF
description: Convierte hojas de cálculo de Excel (XLS, XLSX), ODS y archivos CSV a PDF conservando el formato.
---

# Excel a PDF

Convierte hojas de cálculo a PDF. La herramienta admite archivos modernos de Excel, el formato XLS heredado, hojas de cálculo OpenDocument e incluso CSV, todo renderizado con un motor LibreOffice que se ejecuta en el navegador y conserva el formato de las celdas, las fórmulas (como valores calculados), los gráficos y los diseños de varias hojas.

## Formatos Compatibles

| Formato                      | Extensiones |
| :--------------------------- | :---------- |
| Excel (moderno)              | `.xlsx`     |
| Excel (heredado)             | `.xls`      |
| Hoja de cálculo OpenDocument | `.ods`      |
| CSV                          | `.csv`      |

## Cómo Funciona

1. Haz clic en el área de carga o arrastra y suelta tus hojas de cálculo.
2. Revisa la lista de archivos. Agrega más archivos o quita los que no quieras.
3. Haz clic en **Convertir a PDF**. El motor LibreOffice se inicializa en el primer uso y luego procesa cada archivo.
4. Un solo archivo se descarga directamente como PDF. Varios archivos se entregan como `excel-converted.zip`.

## Opciones

Esta herramienta no tiene configuración adicional. El motor LibreOffice determina el diseño de página, la escala y el área de impresión según los ajustes integrados de la hoja de cálculo.

## Resultado

| Cantidad de Entradas | Resultado                                                                 |
| :------------------- | :------------------------------------------------------------------------ |
| 1 archivo            | Descarga de un solo PDF (nombre de archivo original con extensión `.pdf`) |
| 2+ archivos          | Archivo ZIP (`excel-converted.zip`) con un PDF por cada archivo           |

## Casos de Uso

- Convertir informes financieros o presupuestos de Excel a PDF para distribuirlos
- Crear PDFs listos para imprimir a partir de hojas de cálculo de inventario o catálogos de productos
- Compartir resultados de análisis de datos con personas que no tienen Excel instalado
- Archivar informes trimestrales en un formato no editable
- Convertir archivos ODS de LibreOffice Calc a PDF

## Consejos

- Los gráficos incrustados en la hoja de cálculo se renderizan en el PDF. Asegúrate de que se vean correctos en el archivo de origen antes de convertir.
- Si tu hoja de cálculo tiene varias hojas, todas se incluyen en el PDF resultante.
- Para datos CSV simples sin formato, la herramienta [CSV a PDF](./csv-to-pdf) ofrece una conversión más ligera. Usa Excel a PDF cuando necesites conservar formato, gráficos o varias hojas.

## Herramientas Relacionadas

- [CSV a PDF](./csv-to-pdf)
- [Word a PDF](./word-to-pdf)
- [PowerPoint a PDF](./powerpoint-to-pdf)
