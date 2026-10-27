---
title: Firma Digital
description: Agrega firmas digitales criptográficas a PDFs con certificados X.509. Admite los formatos PKCS#12 y PEM con opciones de firma visible.
---

# Firma Digital

Una firma digital es una prueba criptográfica de que una persona específica firmó un documento y de que este no se ha alterado desde entonces. A diferencia de una firma dibujada (que es solo una imagen), una firma digital usa certificados X.509 y estándares PKCS#7 para ofrecer autenticidad e integridad verificables.

BentoPDF aplica las firmas digitales por completo en tu navegador. Tu clave privada nunca sale de tu dispositivo.

## Cómo Funciona

1. Sube un archivo PDF.
2. Sube tu archivo de certificado (.pfx, .p12 o .pem).
3. Ingresa la contraseña del certificado para desbloquearlo. La herramienta muestra el sujeto, el emisor y el período de validez del certificado.
4. Opcionalmente, configura los metadatos de la firma (motivo, ubicación, información de contacto).
5. Opcionalmente, activa una **firma visible** con personalización de posición, tamaño, imagen y texto.
6. Haz clic en **Firmar PDF**.

## Formatos de Certificado Compatibles

| Formato     | Extensiones | Descripción                                                                                                                   |
| ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12  | Paquete estándar de la industria que contiene la clave privada y la cadena de certificados. El formato más común.             |
| **PEM**     | .pem        | Formato basado en texto. Debe contener el certificado y la clave privada en un solo archivo. Admite claves privadas cifradas. |

## Opciones de Firma Visible

Al activarla, se renderiza un bloque de firma visible en la página del PDF:

- **Posición**: coordenadas X/Y y ancho/alto en puntos
- **Página**: primera página, última página, todas las páginas o un número de página específico
- **Imagen**: sube una imagen PNG, JPG o WebP (tu firma manuscrita, el sello de tu empresa, etc.)
- **Texto**: texto personalizado con color y tamaño de fuente configurables. Si no se proporciona imagen ni texto, la herramienta genera automáticamente un texto a partir del nombre común del certificado y la fecha actual.

## Metadatos de la Firma

- **Motivo**: por qué se firmó el documento (p. ej., "Aprobado", "Revisado")
- **Ubicación**: dónde se realizó la firma (p. ej., "Nueva York, NY")
- **Información de contacto**: cómo comunicarse con el firmante (p. ej., una dirección de correo electrónico)

## Nota sobre la Conexión a Internet

Es posible que firmar requiera una conexión a internet. La biblioteca de firma obtiene la cadena de certificados desde las URL incluidas en la extensión Authority Information Access (AIA) de tu certificado. Si esos servidores no están disponibles, la firma fallará con los certificados que requieren validación de la cadena.

## Casos de Uso

- Firmar contratos, propuestas y acuerdos con firmas digitales jurídicamente vinculantes
- Certificar documentos oficiales en flujos de trabajo que requieren autenticación basada en PKI
- Firmar facturas en PDF para cumplir con la normativa (muchos países de la UE exigen facturas electrónicas firmadas digitalmente)
- Agregar la aprobación de una organización a planos de ingeniería o documentos de calidad

## Consejos

- Los certificados autofirmados sirven para pruebas, pero mostrarán advertencias en Adobe Reader. Usa un certificado de una Autoridad de Certificación de confianza para documentos en producción.
- La firma visible es solo visual. La firma criptográfica se incrusta independientemente de que el bloque visible esté activado.
- Verifica tu PDF firmado con la herramienta Validar Firma para confirmar que la firma está intacta.

## Herramientas Relacionadas

- [Validar Firma](./validate-signature-pdf): verifica las firmas digitales de PDFs firmados
- [Aplanar PDF](./flatten-pdf): aplana los formularios antes de firmar para evitar modificaciones
- [Cifrar PDF](./protect-pdf): agrega protección con contraseña sobre la firma digital
- [Eliminar Metadatos](./remove-metadata): quita los metadatos antes de firmar
