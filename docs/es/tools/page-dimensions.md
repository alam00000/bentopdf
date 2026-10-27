---
title: Dimensiones de página
description: Analiza tamaños, orientaciones, proporciones y rotación de las páginas de un PDF. Detecta documentos con tamaños mixtos y exporta los datos a CSV.
---

# Dimensiones de página

Una herramienta de diagnóstico que lee cada página de tu PDF y muestra sus dimensiones exactas, orientación, nombre de tamaño estándar, proporción, área y rotación. Es útil para detectar páginas de distintos tamaños antes de imprimir o para documentar las propiedades de un PDF que recibiste.

## Cómo funciona

1. Sube un archivo PDF. El análisis empieza automáticamente, sin botón que pulsar.
2. Un panel de resumen muestra el total de páginas, la cantidad de tamaños de página distintos y si el documento tiene tamaños mixtos.
3. Explora la tabla completa de resultados con los detalles de cada página.
4. Cambia las unidades de visualización entre puntos, pulgadas, milímetros o píxeles.
5. Haz clic en **Exportar a CSV** para guardar los datos.

## Campos mostrados

| Columna         | Descripción                                             |
| --------------- | ------------------------------------------------------- |
| N.º de página   | Número de página secuencial                             |
| Dimensiones     | Ancho x Alto en la unidad seleccionada                  |
| Tamaño estándar | Nombre coincidente (A4, Letter, etc.) o "Personalizado" |
| Orientación     | Vertical u horizontal                                   |
| Proporción      | Relación ancho/alto como número decimal                 |
| Área            | Área de la página en la unidad seleccionada al cuadrado |
| Rotación        | Rotación de la página en grados                         |

## Características

- Detección automática de tamaños de papel estándar (A3, A4, A5, Letter, Legal, Tabloid y más)
- Aviso de documento con tamaños mixtos, con el desglose de qué tamaños aparecen y cuántas páginas usa cada uno
- Conversión de unidades entre puntos, pulgadas, milímetros y píxeles (a 96 PPI)
- Exportación a CSV para usar en hojas de cálculo o sistemas de documentación

## Casos de uso

- Verificar que todas las páginas son A4 antes de enviar un documento a una imprenta
- Diagnosticar por qué un PDF fusionado se imprime con márgenes inesperados en ciertas páginas
- Documentar el diseño de páginas de un archivo PDF grande para registros de metadatos
- Identificar páginas rotadas que necesitan corrección

## Consejos

- Si el resumen muestra "Tamaños mixtos", usa la herramienta Fijar Tamaño de Página para estandarizar antes de imprimir.
- El campo de rotación ayuda a identificar páginas que se ven correctamente pero tienen un atributo de rotación distinto de cero, lo que puede causar problemas en algunos flujos de trabajo.

## Herramientas relacionadas

- [Fijar Tamaño de Página](./fix-page-size): estandariza las páginas tras identificar tamaños mixtos
- [Comprimir PDF](./compress-pdf): optimiza el PDF después de corregir los problemas de página
- [Rotar PDF](./rotate-pdf): corrige las páginas rotadas
