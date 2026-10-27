---
title: Email a PDF
description: Convierte archivos de correo EML y MSG a PDF en tu navegador. Conserva los encabezados, el cuerpo y la lista de adjuntos.
---

# Email a PDF

Convierte correos electrónicos guardados en PDFs limpios e imprimibles. La herramienta analiza archivos EML y MSG, extrae el mensaje completo (encabezados, contenido del cuerpo y metadatos de los adjuntos) y lo renderiza todo en un PDF estructurado. Es útil para peritajes legales, archivo de registros o simplemente para imprimir un correo importante.

## Formatos Compatibles

| Formato | Extensión | Notas                                                                                  |
| :------ | :-------- | :------------------------------------------------------------------------------------- |
| EML     | `.eml`    | Formato estándar de correo MIME (exportado desde la mayoría de los clientes de correo) |
| MSG     | `.msg`    | Formato propietario de Microsoft Outlook                                               |

## Cómo Funciona

1. Haz clic en el área de carga o arrastra y suelta tus archivos EML o MSG. Puedes mezclar ambos formatos en un mismo lote.
2. Revisa la lista de archivos. Quita las entradas que no quieras con el icono de la papelera, o haz clic en **Agregar Más Archivos** para incluir más correos.
3. Configura las opciones de conversión (ver abajo).
4. Haz clic en **Convertir a PDF**. La herramienta analiza cada correo, renderiza el contenido como HTML con estilo y lo convierte a PDF con el motor PyMuPDF.
5. Un solo correo se descarga directamente como PDF. Varios correos se empaquetan en `emails-converted.zip`.

## Opciones

| Opción                                              | Predeterminado | Descripción                                                                                                       |
| :-------------------------------------------------- | :------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Tamaño de página**                                | A4             | Elige entre las dimensiones de página A4, Letter o Legal.                                                         |
| **Incluir destinatarios CC y CCO en el encabezado** | Activado       | Si está activada, las listas de destinatarios CC y CCO aparecen en la sección de encabezado del correo en el PDF. |
| **Incluir lista de archivos adjuntos del correo**   | Activado       | Si está activada, en el PDF aparece una lista de los archivos adjuntos del correo (con nombres y tamaños).        |

## Casos de Uso

- Archivar correspondencia comercial importante como PDF para cumplimiento normativo o auditorías
- Imprimir cadenas de correos para procedimientos legales o solicitudes de pruebas
- Crear un registro permanente de confirmaciones de pedidos, recibos o contratos recibidos por correo
- Respaldar archivos MSG de Outlook en un formato que no requiere Outlook para leerse
- Documentar interacciones de atención al cliente a partir de archivos EML exportados

## Consejos

- Se admiten tanto EML (usado por Thunderbird, Apple Mail y la mayoría de los clientes de correo) como archivos MSG de Outlook. Exporta los correos desde tu cliente de correo y suéltalos directamente en la herramienta.
- Los correos con formato HTML conservan su estilo en el PDF. Los correos de texto plano se renderizan con un formato limpio y legible.
- La lista de adjuntos muestra nombres de archivo y tamaños, pero no incrusta los archivos adjuntos reales en el PDF.

## Herramientas Relacionadas

- [XML a PDF](./xml-to-pdf)
- [XPS a PDF](./xps-to-pdf)
