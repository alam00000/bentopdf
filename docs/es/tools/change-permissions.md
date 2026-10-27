---
title: Cambiar permisos
description: Establece o modifica los permisos de uso de un PDF para imprimir, copiar, editar y anotar. Usa cifrado AES de 256 bits.
---

# Cambiar permisos

Ajusta con precisión lo que los destinatarios pueden hacer con tu PDF. A diferencia del cifrado básico, que solo bloquea el archivo con una contraseña, esta herramienta te permite permitir o denegar de forma selectiva la impresión, la copia, la edición, las anotaciones, el llenado de formularios, el ensamblaje de documentos y la extracción de páginas, todo aplicado mediante cifrado AES de 256 bits.

## Cómo Funciona

1. Sube un archivo PDF.
2. Si el PDF ya está cifrado, ingresa la **Contraseña actual**.
3. Establece una **Nueva contraseña de usuario** (necesaria para abrir) y/o una **Nueva contraseña de propietario** (controla los permisos).
4. Activa o desactiva cada permiso con las casillas.
5. Haz clic en **Cambiar permisos**.
6. Descarga el PDF actualizado.

Si dejas vacíos ambos campos de contraseña nueva, la herramienta descifra el PDF por completo y elimina todo el cifrado y las restricciones.

## Controles de Permisos

| Permiso                             | Qué Controla                                                 |
| ----------------------------------- | ------------------------------------------------------------ |
| **Permitir imprimir**               | Si el documento se puede imprimir                            |
| **Permitir copiar texto**           | Si se puede seleccionar y copiar texto e imágenes            |
| **Permitir modificar**              | Si se puede editar el contenido del documento                |
| **Permitir anotar**                 | Si se pueden agregar comentarios, resaltados y sellos        |
| **Permitir rellenar formularios**   | Si se pueden completar los campos de formulario interactivos |
| **Permitir ensamblar el documento** | Si se pueden insertar, eliminar o rotar páginas              |
| **Permitir extraer páginas**        | Si se pueden extraer páginas individuales                    |

Todos los permisos requieren una contraseña de propietario para aplicarse. Sin contraseña de propietario, la mayoría de los lectores de PDF ignoran las marcas de permisos.

## Cómo Funcionan los Permisos en PDF

Los permisos del PDF forman parte de la especificación de cifrado. Se almacenan como indicadores de bits en el diccionario de cifrado y los aplican los lectores de PDF compatibles. La diferencia clave:

- **Contraseña de usuario**: necesaria para abrir el archivo.
- **Contraseña de propietario**: necesaria para cambiar los permisos o quitar las restricciones. Sin ella, las marcas de permisos controlan qué operaciones puede realizar el usuario.

Si estableces solo una contraseña de propietario (sin contraseña de usuario), cualquiera puede abrir el archivo, pero queda limitado a las operaciones permitidas. Si estableces ambas, el archivo requiere una contraseña para abrirse y queda restringido después de la autenticación.

## Casos de Uso

- Distribuir un informe que se pueda ver e imprimir, pero no editar ni copiar
- Compartir una plantilla de contrato que los destinatarios puedan llenar pero no modificar
- Publicar un catálogo en PDF con la copia de imágenes deshabilitada
- Permitir anotaciones en un borrador de revisión e impedir cambios estructurales

## Consejos

- Para que sea efectivo, establece siempre una contraseña de propietario. Los permisos sin contraseña de propietario no se pueden hacer cumplir.
- Algunas herramientas de PDF de terceros ignoran las marcas de permisos. Para una protección más sólida, considera rasterizar el PDF o usar DRM.
- Usa esta herramienta para actualizar PDFs antiguos cifrados con RC4 a AES-256.

## Herramientas Relacionadas

- [Cifrar PDF](./protect-pdf): protección simple con contraseña, sin permisos granulares
- [Descifrar PDF](./unlock-pdf): elimina el cifrado por completo
- [Eliminar Restricciones](./remove-restrictions): quita todas las restricciones cuando tienes la contraseña de propietario
