---
title: Agregar etiquetas de página
description: Agrega etiquetas de página PDF con números romanos, prefijos de letras, numeración personalizada y varias reglas por documento.
---

# Agregar etiquetas de página

Las etiquetas de página controlan cómo se muestran los números de página en los visores de PDF (el número que aparece en la barra de herramientas, no impreso en la página). Esta herramienta te permite asignar distintos esquemas de etiquetado a distintos rangos de páginas: números romanos para las páginas preliminares, números decimales para el cuerpo, apéndices con letras y más.

## Cómo funciona

1. Sube tu archivo PDF.
2. Aparece el panel de opciones con una regla de etiquetas por defecto.
3. Configura cada regla con un rango de páginas, un estilo, un prefijo opcional y un valor inicial.
4. Haz clic en **Agregar regla** para crear reglas adicionales para otras secciones.
5. Haz clic en **Agregar etiquetas de página** para aplicar todas las reglas y descargar el resultado.

## Opciones

Cada regla de etiquetas tiene estos ajustes:

- **Rango de páginas**: las páginas a las que se aplica la regla. Déjalo vacío para todas las páginas. Admite rangos como `1-4`, `7`, `odd` o `1-9,30-40`.
- **Estilo de etiqueta**: Arábigo decimal, Romanos en minúsculas (i, ii, iii), Romanos en mayúsculas (I, II, III), Letras en minúsculas (a, b, c), Letras en mayúsculas (A, B, C) o Sin etiqueta (solo prefijo).
- **Prefijo de etiqueta**: texto opcional que se antepone a cada etiqueta, como "A-" para crear etiquetas como A-1, A-2, A-3.
- **Valor inicial**: el número desde el que empezar a contar. Por defecto es 1. Ponlo en 0 para una numeración que empiece en cero.
- **Continuar la numeración entre rangos no contiguos**: actívalo cuando una regla se dirija a páginas no contiguas (como `1-9,30-40` u `odd`) y quieras que la numeración continúe de forma secuencial.
- **Eliminar las etiquetas de página existentes**: marcado por defecto. Borra las etiquetas anteriores antes de aplicar tus nuevas reglas.

## Características

- Varias reglas de etiquetas por documento para esquemas de numeración complejos
- Seis estilos de etiqueta que cubren todos los sistemas de numeración estándar
- Compatibilidad con prefijos personalizados para etiquetar por secciones
- Compatibilidad con rangos no contiguos con numeración progresiva
- Opción para conservar o eliminar las etiquetas existentes

## Casos de uso

- Establecer etiquetas con números romanos (i, ii, iii) para el prefacio de un libro y etiquetas decimales para el texto principal
- Etiquetar las páginas de apéndices con prefijos de letras como "A-1", "A-2", "B-1", "B-2"
- Corregir las etiquetas de página en un documento escaneado donde los números de página físicos no coinciden con el orden de páginas del PDF
- Agregar numeración desde cero para documentos técnicos

## Consejos

- Las etiquetas de página son metadatos que los visores de PDF muestran en su barra de navegación. No se imprimen en la página. Para números visibles, usa [Números de Página](./page-numbers).
- Esta herramienta requiere que CoherentPDF (CPDF) esté configurado en tus Ajustes de WASM. Si no está configurado, se te pedirá que lo hagas.

## Herramientas relacionadas

- [Números de Página](./page-numbers)
- [Numeración Bates](./bates-numbering)
- [Editar Marcadores](./bookmark)
