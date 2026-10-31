---
title: Eliminar restricciones
description: Elimina la protección con contraseña, las restricciones de impresión, los bloqueos de edición y los límites de copia de los archivos PDF.
---

# Eliminar restricciones

Los PDF pueden llevar dos tipos de contraseña: una contraseña de usuario (necesaria para abrir el archivo) y una contraseña de propietario (controla lo que puedes hacer con él). Esta herramienta elimina ambas, junto con todas las restricciones asociadas: bloqueos de impresión, edición, copia y anotación.

## Cómo funciona

1. Sube un archivo PDF.
2. Si el PDF tiene una contraseña de propietario, introdúcela en el campo **Contraseña de propietario**. Déjalo en blanco si el PDF solo tiene restricciones de uso sin contraseña.
3. Haz clic en **Eliminar restricciones**.
4. Descarga el PDF sin restricciones.

La herramienta usa las opciones `--decrypt` y `--remove-restrictions` de QPDF para producir una copia limpia y sin restricciones.

## Qué se elimina

- La protección con contraseña (tanto la de usuario como la de propietario)
- Las restricciones de impresión
- Las restricciones de edición
- Las restricciones de copia de texto e imágenes
- Las restricciones de anotación y comentarios
- Cualquier otra limitación de seguridad codificada en el PDF

## Casos de uso

- Desbloquear un PDF que es tuyo pero cuya contraseña definiste hace años
- Quitar las restricciones de impresión de un documento al que tienes acceso legítimo
- Habilitar copiar y pegar en material de referencia para tomar notas
- Preparar PDF para herramientas de accesibilidad que no pueden manejar documentos restringidos

## Consejos

- Debes conocer la contraseña de propietario si hay una. Esta herramienta no descifra ni fuerza contraseñas.
- Si necesitas mantener el archivo cifrado pero cambiar permisos concretos, usa en su lugar la herramienta Cambiar permisos.
- El archivo resultante no tiene ningún cifrado: cualquiera que lo reciba podrá abrirlo libremente.

## Herramientas relacionadas

- [Descifrar PDF](./unlock-pdf): desbloquea un PDF cuando conoces la contraseña de usuario
- [Cifrar PDF](./protect-pdf): vuelve a aplicar el cifrado con nuevos ajustes
- [Cambiar permisos](./change-permissions): modifica de forma selectiva qué acciones se permiten
