---
title: Dividir PDF
description: Divide un PDF en archivos más pequeños por rango de páginas, selección visual, marcadores, páginas pares/impares o intervalos fijos.
---

# Dividir PDF

Divide un PDF en documentos más pequeños con uno de seis modos de división. Desde simples rangos de páginas hasta la división por marcadores, esta herramienta cubre todos los escenarios para dividir un documento.

## Cómo funciona

1. Sube un único archivo PDF.
2. Elige un modo de división en el menú desplegable.
3. Configura las opciones propias del modo (rangos de páginas, selecciones, etc.).
4. Haz clic en el botón de procesar.
5. El resultado se descarga como un único PDF o como un archivo ZIP, según el modo y los ajustes.

## Modos de división

| Modo                  | Descripción                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Rango**             | Introduce rangos de páginas como `1-3, 5, 8-10`. Varios rangos producen PDF separados en un ZIP. Un solo rango produce un PDF.             |
| **Selección visual**  | Navega por las miniaturas de las páginas y haz clic para seleccionar las que quieras. Las páginas seleccionadas se extraen a un nuevo PDF. |
| **Pares / impares**   | Extrae solo las páginas de numeración par o impar.                                                                                         |
| **Todas las páginas** | Divide cada página en su propio archivo PDF individual, descargado como ZIP.                                                               |
| **Marcadores**        | Divide en los límites de los marcadores. Elige el nivel de marcador para controlar dónde se hacen las divisiones.                          |
| **Cada N páginas**    | Divide en bloques de N páginas cada uno (por ejemplo, cada 5 páginas). El último bloque puede tener menos páginas.                         |

## Características

- Seis modos de división distintos que cubren prácticamente todos los casos de uso
- Selector visual de páginas con miniaturas de carga diferida
- División por marcadores con filtrado por nivel
- Opción de salida en ZIP para los modos de rango y selección visual
- Admite rangos de páginas con sintaxis mixta (`1-3, 5, 8-10`)
- Aviso cuando las divisiones de N páginas producen bloques desiguales

## Casos de uso

- Extraer un capítulo o una sección concreta de un documento grande
- Separar páginas pares e impares para flujos de impresión a doble cara
- Dividir el PDF de un libro en archivos de capítulos individuales en los límites de los marcadores
- Aislar páginas concretas (como la página de firma) de un contrato
- Dividir un informe compilado en archivos por sección para distribuirlos

## Consejos

- Varios rangos de páginas separados por comas (por ejemplo, `1-5, 10-15, 20-25`) producen PDF separados, uno por rango, agrupados en un ZIP.
- El modo de división por marcadores requiere que el PDF contenga marcadores. Si no se encuentra ninguno, verás un mensaje de error.
- La casilla "Descargar como ZIP" de los modos Rango y Selección visual te permite obtener PDF individuales por página en lugar de un archivo combinado.

## Herramientas relacionadas

- [Fusionar PDF](./merge-pdf)
- [Extraer páginas](./extract-pages)
- [Eliminar páginas](./delete-pages)
- [Multiherramienta PDF](./pdf-multi-tool)
