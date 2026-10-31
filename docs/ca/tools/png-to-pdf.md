---
title: PNG a PDF
description: Converteix una o més imatges PNG en un document PDF amb qualitat ajustable, íntegrament al navegador.
---

# PNG a PDF

Converteix imatges PNG a PDF conservant-ne tota la resolució. Cada PNG es converteix en la seva pròpia pàgina, amb la mida de la imatge original. La transparència es gestiona automàticament.

## Formats compatibles

| Format | Extensions |
| :----- | :--------- |
| PNG    | `.png`     |

## Com funciona

1. Fes clic a la zona de càrrega o arrossega-hi fitxers PNG. En pots seleccionar diversos alhora.
2. Gestiona la llista de fitxers: elimina els que no vulguis o afegeix-ne més.
3. Tria un nivell de **qualitat del PDF** al menú desplegable.
4. Fes clic a **Converteix a PDF**. La sortida es baixa com a `from_jpgs.pdf`.

L'eina utilitza pdf-lib per incrustar cada imatge directament. Si un PNG no es pot incrustar de manera nativa (p. ex., per un perfil de color poc habitual), recorre a tornar-lo a renderitzar mitjançant un canvas com a JPEG.

## Opcions

La **qualitat del PDF** controla la compressió aplicada abans d'incrustar:

- **Qualitat alta**: compressió mínima, mida de fitxer més gran.
- **Qualitat mitjana** (per defecte): bon equilibri entre mida i claredat.
- **Qualitat baixa**: compressió màxima, sortida més petita.

## Casos d'ús

- Convertir captures de pantalla en un PDF de diverses pàgines per a informes d'errors o documentació
- Empaquetar exportacions de disseny d'interfícies en un sol fitxer per revisar-lo
- Convertir exportacions de diagrames (draw.io, Excalidraw) en un PDF compartible
- Reunir un conjunt d'imatges de gràfics en un informe

## Consells

- Els fitxers PNG amb transparència obtenen un fons blanc al PDF. Si necessites un fons diferent, edita les imatges abans.
- Per a captures de pantalla i diagrames amb vores nítides i text, la qualitat alta evita els artefactes de compressió JPEG. La qualitat mitjana o baixa pot convertir internament a JPEG.

## Eines relacionades

- [Imatges a PDF](./image-to-pdf)
- [JPG a PDF](./jpg-to-pdf)
- [SVG a PDF](./svg-to-pdf)
