---
title: XML a PDF
description: Convierte archivos XML en documentos PDF estructurados en tu navegador. Gratis, privado y sin procesamiento en servidor.
---

# XML a PDF

Convierte archivos de datos XML en documentos PDF legibles y estructurados. El XML en bruto es potente pero difícil de leer para las personas. Esta herramienta analiza el árbol XML, identifica las estructuras de datos repetidas y las muestra como tablas y secciones con formato en un PDF A4 horizontal.

## Formatos admitidos

| Formato | Extensión | Notas                                |
| :------ | :-------- | :----------------------------------- |
| XML     | `.xml`    | Cualquier documento XML bien formado |

## Cómo funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos XML. Se pueden procesar varios archivos en un mismo lote.
2. Revisa la lista de archivos. Quita los que no quieras con el icono de la papelera o haz clic en **Añadir más archivos** para incluir más.
3. Haz clic en **Convertir a PDF**. La herramienta analiza la estructura XML con el DOMParser integrado del navegador, estudia la jerarquía de los datos y la convierte en un PDF con jsPDF y formato de tabla automático.
4. Un solo archivo se descarga como PDF. Varias conversiones se empaquetan en `xml-to-pdf.zip`.

## Opciones

No se requiere configuración manual. El conversor detecta automáticamente la estructura del XML y elige las disposiciones de tabla adecuadas. El resultado usa orientación A4 horizontal para acomodar conjuntos de datos anchos.

## Casos de uso

- Convertir exportaciones de datos XML de bases de datos o API en informes imprimibles
- Crear resúmenes legibles a partir de archivos de configuración XML
- Convertir facturas o registros de transacciones basados en XML en PDF para su archivo
- Hacer legibles en forma de documento los mapas del sitio XML o los feeds RSS

## Consejos

- El XML debe estar bien formado. Si el analizador encuentra errores de sintaxis, la conversión fallará con un mensaje de error descriptivo que señala el problema.
- Las estructuras XML muy anidadas se aplanan en tablas. Para obtener los mejores resultados, los datos deben tener elementos hermanos repetidos con elementos hijos coherentes.
- Durante la conversión aparecen actualizaciones de progreso que muestran cada fase: lectura, análisis, estudio y renderizado.

## Herramientas relacionadas

- [FB2 a PDF](./fb2-to-pdf)
- [XPS a PDF](./xps-to-pdf)
- [Email a PDF](./email-to-pdf)
