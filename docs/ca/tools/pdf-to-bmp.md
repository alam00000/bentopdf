---
title: PDF a BMP
description: Converteix pàgines de PDF en imatges BMP sense comprimir. Útil per a sistemes antics i fluxos d'impressió que requereixen mapes de bits.
---

# PDF a BMP

Converteix cada pàgina d'un PDF en una imatge BMP (mapa de bits). BMP és un format sense comprimir, de manera que la sortida és exacta fins al píxel i sense pèrdua de qualitat, però els fitxers són grans.

## Com funciona

1. Carrega un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer.
2. Fes clic a **Converteix** per processar el fitxer.
3. Es baixa automàticament un sol fitxer `.bmp` o un arxiu ZIP.

## Opcions

Aquesta eina no té opcions configurables. Les pàgines es renderitzen a una escala fixa de 2x, cosa que produeix imatges d'aproximadament el doble de les dimensions natives de la pàgina del PDF.

## Format de sortida

- **Una pàgina**: `filename.bmp`
- **Diverses pàgines**: `filename_bmps.zip` amb `page_1.bmp`, `page_2.bmp`, etc.

## Casos d'ús

- Introduir pàgines de PDF en sistemes antics o maquinari que només accepten BMP.
- Preparar imatges sense comprimir per a fluxos d'impressió específics.
- Utilitzar la sortida en mapa de bits com a entrada d'eines de processament d'imatges que requereixen dades de píxels en brut.

## Consells

- Els fitxers BMP són molt grans perquè emmagatzemen dades de píxels en brut sense compressió. Per a la majoria d'usos, [PDF a PNG](./pdf-to-png) ofereix qualitat sense pèrdua amb fitxers molt més petits.
- Si el sistema de destinació accepta PNG o TIFF, millor aquests formats per estalviar espai al disc.

## Eines relacionades

- [PDF a PNG](./pdf-to-png)
- [PDF a TIFF](./pdf-to-tiff)
- [PDF a JPG](./pdf-to-jpg)
