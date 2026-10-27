---
title: Constructor de flujos de trabajo PDF
description: Crea flujos de procesamiento de PDF personalizados de forma visual conectando nodos en un lienzo. Encadena operaciones como fusionar, comprimir, agregar marca de agua y exportar.
---

# Constructor de flujos de trabajo PDF

El Constructor de flujos de trabajo te permite encadenar varias operaciones de PDF en un único flujo automatizado. En lugar de ejecutar las herramientas una por una, conectas un grafo visual de nodos (entrada, procesamiento, salida) y ejecutas todo con un clic. Tus archivos nunca salen del navegador.

## Cómo funciona

La interfaz se divide en tres paneles: una **caja de herramientas de nodos** a la izquierda, el **lienzo** en el centro y un **panel de ajustes** a la derecha que aparece al seleccionar un nodo.

1. **Agrega nodos** haciendo clic en ellos en la barra lateral izquierda, o arrástralos directamente al lienzo. Usa la barra de búsqueda de la parte superior de la caja de herramientas para filtrar por nombre.
2. **Conecta nodos** arrastrando desde un conector de salida (parte inferior de un nodo) hasta un conector de entrada (parte superior de otro). Las conexiones fluyen de arriba hacia abajo.
3. **Configura los ajustes** haciendo clic en un nodo para abrir su panel de ajustes a la derecha. Cada tipo de nodo tiene sus propias opciones (rangos de páginas, controles de calidad, contraseñas, etc.).
4. **Ejecuta el flujo de trabajo** haciendo clic en el botón **Ejecutar** de la barra de herramientas. El motor ejecuta los nodos en orden topológico, procesando cada uno en secuencia. Una barra de estado en la parte inferior muestra el progreso.
5. **Descarga los resultados**: el nodo final de Descarga guarda el PDF resultante (o un ZIP si se generan varios archivos).

## Categorías de nodos

Los nodos se organizan en seis categorías, cada una con un color distinto en el lienzo:

- **Entrada** (azul): Entrada PDF, Entrada de imagen, Word/Excel/PowerPoint a PDF y más de 15 convertidores de otros formatos que alimentan el flujo con archivos.
- **Editar y anotar** (índigo): Recortar, Escala de grises, Invertir colores, Marca de agua, Números de página, Encabezado y pie de página, Efecto escáner, Ajustar colores, Color de fondo, Eliminar páginas en blanco, Eliminar anotaciones.
- **Organizar y gestionar** (violeta): Fusionar, Dividir, Extraer páginas, Rotar, Eliminar páginas, Invertir, Agregar página en blanco, Dividir páginas, N-Up, Fijar tamaño de página, Combinar en una sola página, Folleto, Posterizar, Editar metadatos, Tabla de contenidos, OCR.
- **Optimizar y reparar** (ámbar): Comprimir, Rasterizar, Linealizar, Enderezar, PDF a PDF/A, Fuente a contorno, Reparar.
- **Proteger PDF** (rosa): Cifrar, Descifrar, Sanear, Aplanar, Firma digital, Censurar.
- **Salida** (verde azulado): Descargar (detecta automáticamente si es un único PDF o un ZIP), PDF a imágenes, PDF a texto, PDF a DOCX, PDF a XLSX, PDF a CSV, PDF a SVG, PDF a Markdown, Extraer imágenes.

## Guardar y cargar flujos de trabajo

La barra de herramientas ofrece cuatro opciones de persistencia:

- **Guardar**: almacena el flujo actual como una plantilla con nombre en el almacenamiento local de tu navegador. Puedes guardar varias plantillas.
- **Cargar**: abre una ventana con todas las plantillas guardadas. Haz clic en Cargar para restaurar una o elimina las plantillas que ya no necesites.
- **Exportar**: descarga el flujo de trabajo como un archivo `.json` para compartirlo o hacer una copia de seguridad.
- **Importar**: carga un archivo de flujo de trabajo `.json` desde el disco y restaura todos los nodos, posiciones y conexiones.

Las plantillas persisten entre sesiones en el almacenamiento local. Los archivos JSON exportados son portables entre navegadores y equipos.

## Modelo de ejecución

El motor construye un grafo de dependencias a partir de tus conexiones y ejecuta los nodos en orden topológico. Si algún nodo falla, la ejecución se detiene y el nodo con el error se marca en rojo. Algunas reglas que conviene recordar:

- Todo flujo de trabajo necesita al menos un nodo de **Entrada** y uno de **Salida**.
- El motor detecta dependencias circulares y bloquea la ejecución con un error.
- El nodo **Cifrar** debe ser el último paso de procesamiento antes del nodo de salida. Colocarlo antes activará una advertencia de validación, porque los nodos posteriores no pueden operar con datos cifrados.
- Los PDF protegidos con contraseña piden la contraseña durante la ejecución.
- Se admiten entradas de varios PDF: el nodo Fusionar puede combinarlos, o los nodos de procesamiento por lotes procesarán cada PDF de forma individual.

## Tipos de conectores

Las conexiones usan conectores tipados para evitar cableados no válidos:

- **PDF** (índigo): un único documento PDF.
- **MultiPDF** (ámbar): varios documentos PDF agrupados.
- **Image** (verde): un blob de imagen.

## Opciones

Cada nodo tiene su propia configuración accesible desde el panel de ajustes de la derecha. Algunos patrones comunes:

- **Rangos de páginas** en los nodos Dividir, Extraer páginas y Eliminar páginas
- **Controles de calidad** en los nodos de salida de conversión a imagen
- **Campos de contraseña** en los nodos Cifrar y Descifrar
- **Entradas de texto** para Marca de agua, Encabezado y pie de página y Editar metadatos
- **Ángulos de rotación** en el nodo Rotar
- **Nivel de compresión** en el nodo Comprimir
- **Selección de idioma de OCR** en el nodo OCR

## Casos de uso

- **Flujo de procesamiento de facturas**: Entrada PDF -> OCR -> Extraer tablas -> Descargar como CSV.
- **Estandarización de informes**: Word a PDF -> Fijar tamaño de página -> Agregar números de página -> Marca de agua -> Comprimir -> Descargar.
- **Preparación para archivado**: Entrada PDF -> Reparar -> Aplanar -> Sanear -> PDF a PDF/A -> Descargar.
- **Extracción de imágenes por lotes**: Entrada PDF (varios archivos) -> Extraer imágenes -> Descargar ZIP.
- **Folletos listos para imprimir**: Entrada PDF -> Folleto -> Recortar -> Comprimir -> Descargar.
- **Distribución segura**: Entrada PDF -> Censurar -> Eliminar anotaciones -> Cifrar -> Descargar.

## Consejos

- Usa **Supr** o **Retroceso** para eliminar del lienzo el nodo seleccionado.
- Haz clic en el botón **X** de la barra de estado de un nodo para eliminarlo directamente.
- Desplaza el lienzo haciendo clic y arrastrando en un espacio vacío. El cursor cambia a un icono de mano mientras te desplazas.
- En el móvil, usa el botón **+** de la barra de herramientas para mostrar u ocultar la caja de herramientas de nodos.
- Si tu flujo de trabajo produce varios archivos de salida, el nodo Descargar los agrupa automáticamente en un ZIP.
- Empieza con algo sencillo: crea y prueba un flujo de dos nodos antes de añadir complejidad.

## Herramientas relacionadas

- [PDF a Texto](./pdf-to-text)
- [PDF a Excel](./pdf-to-excel)
- [Extraer imágenes](./extract-images)
- [PDF a Markdown](./pdf-to-markdown)
