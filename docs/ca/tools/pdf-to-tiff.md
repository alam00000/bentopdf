---
title: PDF a TIFF
description: Converteix pàgines de PDF en imatges TIFF, molt utilitzades en fluxos d'impressió, fax i arxivament. Recorre a PNG si la codificació falla.
---

# PDF a TIFF

Converteix cada pàgina d'un PDF en una imatge TIFF. TIFF és el format estàndard per a la producció d'impressió, els sistemes de fax i l'arxivament de documents. L'eina utilitza compressió PackBits per a la codificació TIFF i recorre a PNG si una pàgina no es pot codificar.

## Com funciona

1. Carrega un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer.
2. Fes clic a **Converteix** per processar el fitxer.
3. Un sol fitxer TIFF o un arxiu ZIP es baixa automàticament.

## Opcions

Aquesta eina no té opcions configurables. Les pàgines es renderitzen a una escala fixa de 2x.

## Format de sortida

- **Una pàgina**: `filename.tiff`
- **Diverses pàgines**: `filename_tiffs.zip` amb `page_1.tiff`, `page_2.tiff`, etc.

Si la codificació TIFF falla en una pàgina concreta (per problemes de compressió), aquesta pàgina es desa com a fitxer `.png`. En aquest cas, el ZIP contindrà una barreja de fitxers TIFF i PNG.

## Casos d'ús

- Presentar documents a organismes governamentals o sistemes legals que exigeixen el format TIFF.
- Preparar pàgines per transmetre-les per fax mitjançant serveis de fax digitals.
- Arxivar documents escanejats en un format sense pèrdua àmpliament compatible.
- Introduir pàgines en sistemes de gestió documental empresarials.

## Consells

- Els fitxers TIFF són grans. Si només necessites qualitat sense pèrdua per a ús web o en pantalla, [PDF a PNG](./pdf-to-png) és una opció millor.
- Revisa el contingut del ZIP si algunes pàgines han necessitat l'alternativa PNG: potser vulguis convertir-les per separat.

## Eines relacionades

- [PDF a PNG](./pdf-to-png)
- [PDF a BMP](./pdf-to-bmp)
- [PDF a JPG](./pdf-to-jpg)
