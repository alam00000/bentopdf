---
title: Numeración Bates
description: Aplica números Bates a uno o varios PDF con plantillas, relleno, fuentes y posicionamiento personalizables.
---

# Numeración Bates

La numeración Bates estampa identificadores secuenciales en cada página de tus PDF. Es el método estándar para etiquetar documentos en procedimientos legales, auditorías y flujos de cumplimiento normativo. Esta herramienta admite varios archivos y plantillas personalizables, y genera PDF numerados individualmente o un único archivo ZIP.

## Cómo funciona

1. Sube uno o varios archivos PDF. Puedes arrastrar varios archivos a la vez.
2. Elige un estilo predefinido o crea una plantilla personalizada.
3. Configura la posición, la fuente, el tamaño, el color y los números iniciales.
4. Haz clic en **Aplicar números Bates** para procesar.
5. Un solo archivo se descarga directamente. Varios archivos se descargan como un archivo ZIP.

## Opciones

- **Estilo predefinido**: elige entre los formatos integrados:
  - Exhibit + Case + Bates + Page (p. ej., "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (sin número de página)
  - Case + Bates
  - Solo número Bates (p. ej., "000001")
  - Personalizado (escribe tu propia plantilla)
- **Personalizar estilo**: una cadena de plantilla con marcadores: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Relleno Bates**: número de dígitos (de 3 a 6) para los números Bates rellenados con ceros. Solo visible en modo personalizado.
- **Posición**: encabezado o pie de página, a la izquierda, al centro o a la derecha.
- **Los Bates empiezan en**: el primer número Bates. Por defecto es 1. La numeración continúa entre archivos.
- **El contador de archivos empieza en**: el número inicial para el marcador `[FILE]`.
- **Fuente**: Helvetica, Times New Roman o Courier.
- **Tamaño de fuente**: tamaño del texto estampado.
- **Color**: selector de color para el texto del número Bates.

## Características

- Vista previa en vivo que muestra cómo aparecerán los números Bates en todos los archivos subidos
- Compatibilidad con varios archivos con numeración continua entre documentos
- Reordenación de archivos con arrastrar y soltar para controlar la secuencia de numeración
- Seis opciones de posición (encabezado/pie, izquierda/centro/derecha)
- Cálculo adaptativo de márgenes que respeta los distintos tamaños de página
- Salida en ZIP para lotes de varios archivos
- Marcadores de plantilla para la máxima flexibilidad

## Casos de uso

- Estampar documentos de descubrimiento probatorio en litigios con números de exhibit secuenciales
- Numerar paquetes de evidencia de auditoría que abarcan docenas de archivos
- Aplicar números de referencia regulatorios a la documentación de cumplimiento
- Etiquetar los anexos de una solicitud de patente con identificadores específicos del caso

## Consejos

- Arrastra los archivos en la lista para reordenarlos antes de procesar. La secuencia de numeración Bates sigue este orden.
- Usa el marcador `[FILENAME]` para incluir el nombre del archivo original en el sello, lo que ayuda a rastrear las páginas hasta los documentos de origen.
- El cuadro de vista previa se actualiza en tiempo real al cambiar los ajustes, así que puedes verificar el formato antes de procesar.

## Herramientas relacionadas

- [Números de Página](./page-numbers)
- [Agregar etiquetas de página](./add-page-labels)
- [Encabezado y Pie de Página](./header-footer)
