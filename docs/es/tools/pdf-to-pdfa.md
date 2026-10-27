---
title: PDF a PDF/A
description: Convierte PDF estándar al formato PDF/A para archivado a largo plazo. Admite los niveles de conformidad PDF/A-1b, PDF/A-2b y PDF/A-3b.
---

# PDF a PDF/A

PDF/A es un subconjunto de PDF normalizado por ISO y pensado para la conservación digital a largo plazo. Esta herramienta convierte tus PDF estándar en documentos conformes con PDF/A usando Ghostscript, que se ejecuta directamente en tu navegador.

## Cómo funciona

1. Sube uno o más archivos PDF.
2. Selecciona una **versión de PDF/A** en el menú desplegable.
3. Opcionalmente, activa **Aplanar PDF antes** para archivos complejos que fallan en la conversión normal.
4. Haz clic en **Convertir a PDF/A**. Varios archivos generan un archivo ZIP.

## Versiones de PDF/A

| Versión      | Restricciones                                      | Ideal para                                             |
| ------------ | -------------------------------------------------- | ------------------------------------------------------ |
| **PDF/A-1b** | La más estricta. Sin transparencias ni capas.      | Máxima compatibilidad con sistemas de archivo antiguos |
| **PDF/A-2b** | Permite transparencias y JPEG2000.                 | Archivado de uso general (recomendada)                 |
| **PDF/A-3b** | Permite adjuntos incrustados de cualquier formato. | Archivar documentos con archivos de datos de origen    |

PDF/A-2b está seleccionada por defecto y sirve para la gran mayoría de las necesidades de archivado.

## Opción de aplanado previo

Algunos PDF contienen características que impiden una conversión limpia a PDF/A: codificaciones de fuente poco comunes, pilas de transparencia complejas o estructuras internas dañadas. Activar **Aplanar PDF antes** rasteriza el PDF a 300 DPI antes de la conversión, lo que garantiza el cumplimiento a costa de que el texto deje de ser seleccionable. Úsala como alternativa cuando la conversión estándar produzca errores.

El aplanado previo requiere el motor PyMuPDF WASM.

## Casos de uso

- Cumplir requisitos de archivo gubernamentales o legales (muchas jurisdicciones exigen PDF/A en los escritos judiciales)
- Enviar documentos a repositorios institucionales o bibliotecas digitales
- Conservar registros empresariales cuando el software original puede no existir dentro de diez años
- Preparar facturas para estándares de facturación electrónica que exigen PDF/A-3b con adjuntos XML

## Consejos

- Prueba primero la conversión sin aplanado previo. Actívalo solo si obtienes un error.
- PDF/A incrusta todas las fuentes, por lo que los archivos de salida suelen ser más grandes que los originales.
- Valida el resultado con un validador de PDF/A específico si tu flujo de trabajo exige un cumplimiento estricto.

## Herramientas relacionadas

- [Comprimir PDF](./compress-pdf): reduce el tamaño del archivo tras la conversión
- [Aplanar PDF](./flatten-pdf): aplana los formularios antes de convertir a PDF/A
- [Eliminar Metadatos](./remove-metadata): quita los metadatos antes de archivar
