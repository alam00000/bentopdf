---
title: BMP a PDF
description: Converteix imatges de mapa de bits BMP a PDF directament al navegador, sense pujar res a cap servidor.
---

# BMP a PDF

Converteix fitxers Windows Bitmap (BMP) a PDF. BMP és un format d'imatge sense compressió que encara es troba en sistemes antics, imatgeria mèdica i escàners industrials. Aquesta eina els converteix a PDF sense haver d'instal·lar res.

## Formats compatibles

| Format | Extensions |
| :----- | :--------- |
| BMP    | `.bmp`     |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega-hi els fitxers BMP.
2. Revisa la llista de fitxers. Afegeix-ne més o elimina els que no vulguis.
3. Fes clic a **Converteix a PDF**. El resultat es baixa com a `from_bmps.pdf`.

Cada BMP es dibuixa en un canvas, s'exporta com a PNG i després s'incrusta al PDF amb pdf-lib. La mida de la pàgina coincideix amb les dimensions originals de la imatge.

## Opcions

Aquesta eina no ofereix paràmetres de qualitat addicionals. Les imatges s'incrusten a la resolució original com a PNG sense pèrdua dins del PDF.

## Casos d'ús

- Convertir en PDF d'arxiu documents antics escanejats i desats com a BMP
- Convertir captures de pantalla BMP d'aplicacions antigues de Windows en documents que es puguin compartir
- Processar la sortida d'escàners mèdics o industrials que per defecte genera BMP
- Migrar arxius d'imatges antics a un format més portàtil

## Consells

- Els fitxers BMP no estan comprimits, de manera que solen ser grans. El PDF resultant serà considerablement més petit perquè internament les imatges es tornen a codificar com a PNG.
- Si tens fitxers BMP juntament amb altres formats d'imatge, utilitza l'eina [Imatges a PDF](./image-to-pdf) per convertir-ho tot en un sol lot.

## Eines relacionades

- [Imatges a PDF](./image-to-pdf)
- [PNG a PDF](./png-to-pdf)
- [TIFF a PDF](./tiff-to-pdf)
