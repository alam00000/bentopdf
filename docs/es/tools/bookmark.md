---
title: Editar marcadores
description: Agrega, edita, importa, exporta y elimina marcadores de PDF con un editor visual y compatibilidad con CSV/JSON.
---

# Editar marcadores

El editor de marcadores te da control total sobre los marcadores de navegación del PDF (también llamados esquemas). Puedes agregar marcadores nuevos, editar los existentes, reorganizar la jerarquía e importar o exportar los datos de los marcadores en formatos CSV y JSON.

## Cómo Funciona

1. Sube tu PDF haciendo clic o arrastrando un archivo a la zona de carga.
2. Opcionalmente, marca **Extraer automáticamente marcadores existentes** para traer el árbol de marcadores actual del documento.
3. El editor se abre con una vista dividida: visor de PDF a la izquierda y panel de marcadores a la derecha.
4. Escribe el título de un marcador y haz clic en **Añadir a la página** para crear un marcador que apunte a la página actual.
5. Usa los botones de la barra de herramientas para reorganizar, dar estilo o eliminar marcadores.
6. Haz clic en **Guardar PDF con marcadores** para descargar el archivo actualizado.

## Características

- Visor de PDF visual con navegación de páginas, controles de zoom y campo para ir a una página
- Agrega marcadores a cualquier página con un solo clic
- Haz clic directamente en el PDF para fijar un destino de marcador preciso (modo de selección)
- Jerarquía de marcadores anidados con reordenación mediante arrastrar y soltar
- Operaciones por lotes: selecciona varios marcadores para cambiar el color, el estilo o eliminarlos a la vez
- Búsqueda de marcadores para encontrar entradas rápidamente en árboles grandes
- Deshacer y rehacer para todos los cambios
- Importa marcadores desde archivos CSV (título, página, nivel) o JSON
- Exporta marcadores a CSV o JSON para editarlos externamente
- Estilo de marcadores: color (rojo, azul, verde, amarillo, morado) y estilo de fuente (negrita, cursiva, negrita cursiva)
- Navegación rápida: recorre las páginas con las teclas Re Pág y Av Pág

## Opciones

- **Extraer automáticamente marcadores existentes**: al activarla, la herramienta lee y muestra los marcadores actuales del PDF al cargarlo.
- **Modo por lotes**: actívalo para seleccionar varios marcadores y aplicar cambios masivos de color, estilo o eliminación.
- **Expandir todo / Contraer todo**: muestra u oculta rápidamente los marcadores secundarios anidados.

## Casos de Uso

- Agregar una tabla de contenidos a un libro de texto o manual que no tiene marcadores
- Reestructurar los marcadores de un documento escaneado después del procesamiento OCR
- Exportar marcadores a CSV, editarlos en una hoja de cálculo y volver a importarlos
- Limpiar marcadores generados automáticamente que tienen referencias de página incorrectas
- Agregar marcadores de colores para señalar secciones importantes en un escrito jurídico

## Consejos

- Usa la importación CSV para crear marcadores en masa. El formato es simple: `title,page,level`, donde el nivel 1 es el nivel superior.
- El modo de selección te permite hacer clic en un punto exacto de la página del PDF para fijar el destino del marcador, lo cual es más preciso que apuntar solo a un número de página.
- Exporta tus marcadores antes de hacer cambios importantes para tener una copia de seguridad.

## Herramientas Relacionadas

- [Tabla de Contenidos](./table-of-contents)
- [Editor PDF](./edit-pdf)
- [Agregar etiquetas de página](./add-page-labels)
