---
title: XPS a PDF
description: Convierte documentos XPS y OXPS a formato PDF en tu navegador. Sin subir archivos, sin registro y totalmente privado.
---

# XPS a PDF

Convierte documentos XPS y OXPS de Microsoft en archivos PDF estándar. XPS (XML Paper Specification) fue la respuesta de Microsoft al PDF, pero su compatibilidad ha ido disminuyendo en todas las plataformas. Esta herramienta vuelve a hacer legibles esos documentos para todo el mundo.

## Formatos admitidos

| Formato | Extensión | Notas                                       |
| :------ | :-------- | :------------------------------------------ |
| XPS     | `.xps`    | Formato XPS original de Microsoft           |
| OXPS    | `.oxps`   | Open XPS, la variante del estándar ECMA-388 |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos XPS/OXPS. Puedes seleccionar varios archivos a la vez.
2. Revisa la lista de archivos. Quita archivos individuales con el icono de la papelera o haz clic en **Añadir más archivos** para agregar más documentos.
3. Haz clic en **Convertir a PDF**. El motor PyMuPDF procesa cada documento de forma local en tu navegador.
4. Un solo archivo se descarga directamente como PDF. Varios archivos se agrupan en un archivo ZIP llamado `xps-converted.zip`.

## Opciones

Esta herramienta realiza una conversión directa de formato sin configuración adicional. El resultado conserva las dimensiones de página, los gráficos vectoriales, las fuentes y las imágenes originales del archivo XPS.

## Casos de uso

- Abrir archivos XPS recibidos de sistemas Windows antiguos que usaban por defecto el controlador de impresión XPS
- Convertir documentos OXPS de Windows 10/11 para compartirlos con usuarios de macOS o Linux
- Archivar archivos XPS antiguos en un formato con mayor compatibilidad
- Hacer accesibles a destinatarios externos documentos oficiales o corporativos basados en XPS

## Consejos

- Las extensiones `.xps` y `.oxps` se gestionan automáticamente: puedes mezclarlas en el mismo lote.
- Si el archivo XPS original se creó con un controlador de impresión de alta resolución, el PDF resultante conserva esa calidad. No se vuelve a muestrear.

## Herramientas relacionadas

- [Word a PDF](./word-to-pdf)
- [XML a PDF](./xml-to-pdf)
