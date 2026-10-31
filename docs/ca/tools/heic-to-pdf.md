---
title: HEIC a PDF
description: Converteix imatges HEIC i HEIF d'iPhone i iPad a PDF directament al navegador.
---

# HEIC a PDF

Converteix imatges HEIC/HEIF a PDF. HEIC és el format de foto per defecte dels iPhone i els iPad des d'iOS 11. Aquesta eina et permet convertir aquestes fotos en PDF sense instal·lar cap programa d'escriptori ni pujar fitxers a cap servidor.

## Formats compatibles

| Format | Extensions |
| :----- | :--------- |
| HEIC   | `.heic`    |
| HEIF   | `.heif`    |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega-hi els fitxers HEIC/HEIF.
2. Revisa la llista de fitxers i elimina els que no vulguis.
3. Fes clic a **Converteix a PDF**. El resultat es baixa com a `from_heic.pdf`.

Cada fitxer HEIC es descodifica amb la biblioteca heic2any, que el converteix a PNG amb una qualitat del 92 %. Després, el PNG s'incrusta al PDF amb pdf-lib, amb cada imatge en una pàgina pròpia a resolució completa.

## Opcions

Aquesta eina no ofereix paràmetres addicionals. Les imatges HEIC es converteixen a PNG amb alta qualitat (0,92) abans d'incrustar-les.

## Casos d'ús

- Crear un PDF a partir de fotos d'iPhone per adjuntar-lo a una reclamació d'assegurança o a un informe
- Convertir fotos HEIC per a un anunci immobiliari en un únic document imprimible
- Convertir captures de pantalla d'iPad (format HEIF) en un PDF que es pugui compartir
- Convertir per lots fotos de vacances per a un diari de viatge

## Consells

- La descodificació de HEIC es fa íntegrament al navegador amb WebAssembly. La primera conversió pot trigar una mica mentre es carrega el descodificador.
- Si necessites barrejar HEIC amb altres formats d'imatge (JPG, PNG, etc.), fes servir l'eina [Imatges a PDF](./image-to-pdf), que gestiona HEIC juntament amb tots els altres formats.
- Els fitxers HEIC dels iPhone sovint contenen dades EXIF, com ara coordenades GPS. El PDF resultant no conserva aquestes metadades.

## Eines relacionades

- [Imatges a PDF](./image-to-pdf)
- [JPG a PDF](./jpg-to-pdf)
- [PNG a PDF](./png-to-pdf)
