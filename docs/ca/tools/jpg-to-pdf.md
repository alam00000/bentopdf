---
title: JPG a PDF
description: Converteix una o més imatges JPG, JPEG i JPEG 2000 en un únic fitxer PDF directament al navegador.
---

# JPG a PDF

Converteix imatges JPG en un PDF net. Puja un fitxer o diversos JPG alhora: cada imatge es converteix en una pàgina a mida completa del document resultant.

## Formats compatibles

| Format    | Extensions      |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega-hi els fitxers JPG. Es pot seleccionar més d'un fitxer.
2. Revisa els fitxers pujats. Fes servir la icona de la paperera per eliminar-ne de concrets, o fes clic a **Afegeix més fitxers** per afegir-ne a la llista.
3. Selecciona un nivell de **Qualitat del PDF**.
4. Fes clic a **Converteix a PDF**. L'eina comprimeix les imatges segons la qualitat triada, les converteix amb el motor PyMuPDF i baixa `from_jpgs.pdf`.

## Opcions

**Qualitat del PDF** ajusta la compressió que s'aplica a cada imatge abans d'incrustar-la al PDF:

- **Alta qualitat**: conserva el màxim detall. Fes-la servir per a fotografia o impressió.
- **Qualitat mitjana** (per defecte): un bon equilibri entre nitidesa i mida del fitxer.
- **Baixa qualitat**: compressió agressiva per obtenir el resultat més petit.

## Casos d'ús

- Convertir en un únic PDF per presentar documents escanejats desats com a JPG
- Empaquetar fotos de productes en un catàleg per als clients
- Convertir imatges mèdiques o de satèl·lit en JPEG 2000 en un PDF portàtil
- Crear un àlbum de fotos imprimible a partir d'exportacions de la càmera

## Consells

- Els fitxers JPEG 2000 (`.jp2`, `.jpx`) són totalment compatibles, no només el JPEG estàndard. És útil per a imatgeria mèdica i dades geoespacials.
- Si els teus JPG provenen de la càmera d'un mòbil, la qualitat mitjana sol produir un fitxer entre un 40 % i un 60 % més petit que l'alta, sense cap diferència visible a la pantalla.

## Eines relacionades

- [Imatges a PDF](./image-to-pdf)
- [PNG a PDF](./png-to-pdf)
- [WebP a PDF](./webp-to-pdf)
