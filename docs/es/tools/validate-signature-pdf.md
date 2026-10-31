---
title: Validar Firma PDF
description: Verifica las firmas digitales de archivos PDF. Comprueba la validez del certificado, la identidad del firmante, la integridad del documento y el estado de la cadena de confianza.
---

# Validar Firma PDF

Sube un PDF firmado y esta herramienta extrae cada firma digital, identifica al firmante, comprueba la validez del certificado e informa de si el documento se ha modificado desde que se firmó. También puedes aportar un certificado de confianza para verificar la cadena de la firma.

## Cómo funciona

1. Sube un archivo PDF firmado. La validación comienza automáticamente.
2. La herramienta muestra un resumen: número de firmas encontradas y cuántas son válidas.
3. Cada firma tiene una tarjeta detallada con el nombre del firmante, el emisor, las fechas y el estado.
4. Opcionalmente, sube un **certificado de confianza** (.pem, .crt, .cer, .der) para verificar la firma frente a un ancla de confianza concreta. La revalidación se ejecuta automáticamente.

## Qué se comprueba

### Análisis de la firma

La herramienta extrae los objetos de firma PKCS#7 del PDF, decodifica la estructura ASN.1 y obtiene el certificado X.509 del firmante junto con cualquier cadena de certificados incrustada en la firma.

### Validez del certificado

- **Caducidad**: ¿Está el certificado dentro de su periodo de validez actual?
- **Detección de autofirmado**: ¿Es el certificado su propio emisor?
- **Cadena de confianza**: Cuando se aporta un certificado de confianza, ¿enlaza con él el certificado del firmante?

### Verificación criptográfica

- La herramienta reconstruye los bytes cubiertos por el `/ByteRange` de la firma, calcula su hash con el algoritmo que declaró el firmante y compara el resultado con el atributo `messageDigest` incluido en la firma.
- Después vuelve a serializar los atributos firmados como un SET DER y verifica la firma con la clave pública del certificado del firmante.
- **Una firma se considera válida solo cuando se superan todas estas comprobaciones.** Si los bytes del PDF se modificaron después de la firma, o la firma incrustada no coincide con la clave del firmante, el estado muestra "Inválida: falló la verificación criptográfica" con el motivo concreto.

#### Algoritmos de firma admitidos

| Algoritmo               | Ruta de verificación                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, con Web Crypto como alternativa                          |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                      |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` tras la conversión de firma DER → IEEE P1363 |

Si una firma usa un algoritmo que no está en esta lista (por ejemplo Ed25519, SM2 o RSA con un OID de resumen poco habitual), la tarjeta muestra **"Sin verificar: algoritmo de firma no admitido"** en amarillo, junto con el OID o el motivo concretos. Se trata de una distinción deliberada de tres estados:

- **Válida**: la firma se verificó criptográficamente con la clave pública del firmante.
- **Inválida**: la verificación se ejecutó y dio un resultado negativo (bytes modificados, clave que no coincide).
- **Sin verificar**: la herramienta no pudo ejecutar la verificación para este algoritmo. Los metadatos del certificado se siguen mostrando, pero debes tratar la firma como "desconocida" y verificarla con Adobe Acrobat o `openssl cms -verify`.

### Algoritmos de resumen inseguros

- Las firmas que usan **MD5 o SHA-1** se rechazan como inválidas y se marcan con el estado "Resumen inseguro". Ambos algoritmos tienen ataques de colisión publicados, por lo que una firma sobre un hash SHA-1 o MD5 no ofrece ninguna garantía de integridad.
- SHA-224, SHA-256, SHA-384 y SHA-512 se aceptan todos.

### Cobertura del documento

- **Cobertura completa**: la firma cubre todo el archivo PDF, es decir, no se añadió ni se cambió ningún byte después de la firma.
- **Cobertura parcial**: la firma cubre solo una parte del archivo. Esto puede indicar que se hicieron modificaciones después de la firma (no necesariamente maliciosas: los guardados incrementales producen cobertura parcial).

## Detalles de la firma

Cada tarjeta de firma muestra:

- **Firmado por**: nombre común, organización y correo electrónico del certificado del firmante
- **Emisor**: la autoridad de certificación que emitió el certificado del firmante
- **Firmado el**: la marca de tiempo incrustada en la firma
- **Válido desde / Válido hasta**: el periodo de validez del certificado
- **Motivo**: por qué se firmó el documento (si se indica)
- **Ubicación**: dónde se firmó (si se indica)
- **Estado de cobertura**: completa o parcial
- **Insignia de confianza**: De confianza o No está en la cadena de confianza (solo cuando se aporta un certificado propio)

### Detalles técnicos

Despliega la sección de detalles técnicos para ver:

- Número de serie del certificado del firmante
- Algoritmo de resumen (SHA-256, SHA-512, etc.)
- Algoritmo de firma (RSA con SHA-256, ECDSA con SHA-256, etc.)
- Mensajes de error de las firmas inválidas

## Casos de uso

- Verificar un contrato firmado digitalmente antes de contrafirmarlo
- Auditar documentos firmados para confirmar que no han sido manipulados
- Comprobar si un certificado ha caducado desde que se firmó el documento
- Validar firmas con el certificado raíz de tu organización
- Inspeccionar los detalles de firma de documentos oficiales o legales

## Consejos

- Un certificado autofirmado no significa que la firma sea inválida: significa que la identidad del firmante no se puede verificar mediante un tercero de confianza. Es habitual en documentos internos.
- La cobertura parcial no siempre indica manipulación. Muchos flujos de trabajo con PDF añaden actualizaciones incrementales (como una segunda firma) que crean cobertura parcial.
- Sube el certificado raíz o intermedio de tu organización como certificado de confianza para obtener la verificación de la cadena de confianza.

## Herramientas relacionadas

- [Firma Digital PDF](./digital-sign-pdf): firma PDF con tu propio certificado
- [Aplanar PDF](./flatten-pdf): aplana un PDF antes de firmarlo para evitar modificaciones posteriores a la firma
- [Eliminar Metadatos](./remove-metadata): limpia un PDF antes de aplicar una firma
