---
title: Proteger PDF
description: Protege archivos PDF con contraseña mediante cifrado AES de 256 bits. Define contraseñas de usuario y de propietario con restricciones de uso configurables.
---

# Proteger PDF

Bloquea tu PDF con una contraseña para que solo las personas autorizadas puedan abrirlo. BentoPDF usa cifrado AES de 256 bits, el mismo estándar que utilizan bancos y agencias gubernamentales, aplicado por completo en tu navegador mediante QPDF.

## Cómo funciona

1. Sube un archivo PDF.
2. Introduce una **contraseña de usuario** (obligatoria). Es la contraseña que se necesitará para abrir el archivo.
3. Opcionalmente, introduce una **contraseña de propietario**. Si la defines, el PDF obtiene restricciones de uso que impiden imprimir, editar, copiar y anotar.
4. Haz clic en **Cifrar PDF**.
5. Descarga el archivo cifrado.

## Tipos de contraseña

### Contraseña de usuario (obligatoria)

La contraseña de usuario es la que escriben los destinatarios para abrir el PDF. Sin ella, el documento es completamente inaccesible. Todo PDF cifrado debe tener una.

### Contraseña de propietario (opcional)

La contraseña de propietario controla lo que un usuario autorizado puede hacer después de abrir el archivo. Cuando defines una contraseña de propietario distinta, BentoPDF aplica automáticamente el conjunto de restricciones más estricto:

- Modificación desactivada
- Extracción/copia desactivada
- Impresión desactivada
- Anotación desactivada
- Rellenado de formularios desactivado
- Ensamblaje del documento desactivado

Si dejas en blanco la contraseña de propietario, el PDF se cifra (sigue necesitando la contraseña de usuario para abrirse), pero no tiene restricciones de uso una vez abierto.

## Detalles del cifrado

- **Algoritmo**: AES-256 (Advanced Encryption Standard de 256 bits)
- **Longitud de clave**: 256 bits
- **Estándar**: cifrado PDF 2.0 (implementación de QPDF)

Con la tecnología actual, romper AES-256 por fuerza bruta es computacionalmente inviable. La seguridad de tu PDF cifrado depende por completo de la fortaleza de tu contraseña.

## Casos de uso

- Proteger informes financieros confidenciales antes de enviarlos por correo
- Asegurar documentos legales compartidos con la parte contraria
- Añadir una contraseña a historiales médicos o información de identificación personal
- Distribuir contenido de pago (libros electrónicos, informes) con control de acceso
- Cumplir políticas de protección de datos que exigen cifrado en reposo

## Consejos

- Usa una contraseña fuerte y única. Lo ideal es una frase de 12 o más caracteres con mayúsculas, minúsculas, números y símbolos.
- Comparte la contraseña por un canal distinto (teléfono, mensaje de texto), nunca en el mismo correo que el PDF.
- Si solo necesitas restringir acciones (sin imprimir, sin copiar) sin exigir contraseña para abrirlo, usa en su lugar la herramienta Cambiar permisos.

## Herramientas relacionadas

- [Descifrar PDF](./unlock-pdf): quita el cifrado cuando conoces la contraseña
- [Cambiar permisos](./change-permissions): modifica restricciones de uso concretas
- [Eliminar restricciones](./remove-restrictions): elimina toda la seguridad de un PDF
- [Sanear PDF](./sanitize-pdf): elimina contenido oculto antes de cifrar
