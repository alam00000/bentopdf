---
title: Desbloquear PDF
description: Quita la protección con contraseña de PDF cifrados. Admite el descifrado por lotes con una sola contraseña para varios archivos.
---

# Desbloquear PDF

Si tienes la contraseña de un PDF cifrado, esta herramienta elimina por completo el cifrado y genera una copia desbloqueada que cualquiera puede abrir sin credenciales. Admite el descifrado por lotes cuando varios PDF comparten la misma contraseña.

## Cómo funciona

1. Sube uno o más archivos PDF cifrados.
2. Introduce la **contraseña** con la que se protegieron los archivos.
3. Haz clic en **Descifrar PDF**.
4. Un solo archivo se descarga directamente. Varios archivos generan un archivo ZIP con todos los PDF desbloqueados.

## Características

- Descifrado de un solo archivo y por lotes
- Funciona con contraseñas de usuario y de propietario
- Genera una salida completamente sin cifrar y sin restricciones residuales
- Informes de error claros para contraseñas incorrectas o archivos dañados
- Seguimiento de éxito o fallo por archivo en el modo por lotes

## Diferencias con Eliminar Restricciones

**Descifrar PDF** requiere la contraseña y elimina todo el cifrado. **Eliminar Restricciones** actúa sobre las restricciones de uso (impresión, copia, edición) y puede no requerir contraseña si solo se estableció una contraseña de propietario. Usa Descifrar cuando el PDF no se abra en absoluto sin contraseña.

## Casos de uso

- Desbloquear de forma permanente PDF que cifraste antes cuando ya no necesitas la contraseña
- Quitar el cifrado de un lote de documentos archivados para facilitar el acceso a largo plazo
- Preparar PDF protegidos con contraseña para un sistema de gestión documental que no admite archivos cifrados
- Desbloquear PDF antes de combinarlos con otros documentos (muchas herramientas de combinación no pueden procesar archivos cifrados)

## Consejos

- El campo de contraseña se aplica a todos los archivos subidos. Si tus PDF tienen contraseñas distintas, procésalos en lotes separados.
- Si aparece el error "Contraseña incorrecta", revisa que no haya espacios al final ni mayúsculas activadas.
- Tras el descifrado, la salida no tiene ninguna seguridad. Vuelve a cifrar con Cifrar PDF si necesitas aplicar una contraseña nueva.

## Herramientas relacionadas

- [Cifrar PDF](./protect-pdf): vuelve a aplicar el cifrado con una contraseña nueva
- [Eliminar Restricciones](./remove-restrictions): quita las restricciones de uso sin descifrar por completo
- [Cambiar Permisos](./change-permissions): modifica permisos concretos de un PDF cifrado
