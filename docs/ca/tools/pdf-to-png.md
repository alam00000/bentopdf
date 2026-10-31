---
title: PDF a PNG
description: Converteix pàgines de PDF en imatges PNG sense pèrdua amb escala ajustable. Ideal per a captures d'alta qualitat i fons transparents.
---

# PDF a PNG

Converteix cada pàgina d'un PDF en una imatge PNG. PNG utilitza compressió sense pèrdua, de manera que la sortida conserva tots els detalls de la pàgina original. Els PDF d'una pàgina es baixen com a fitxer `.png`; els de diverses pàgines generen un ZIP.

## Com funciona

1. Carrega un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer.
2. Defineix el control lliscant d'**Escala** per controlar la resolució de sortida.
3. Fes clic a **Converteix** per iniciar el processament.
4. Un sol PNG o un arxiu ZIP es baixa automàticament.

## Opcions

- **Escala**: va d'1.0x a 3.0x (per defecte 2.0x). A 2.0x, una pàgina estàndard de mida Letter es renderitza a aproximadament 1.224 x 1.584 píxels. Els valors d'escala més alts produeixen imatges més grans i nítides a costa de la mida del fitxer i del temps de processament.

## Format de sortida

- **Una pàgina**: `filename.png`
- **Diverses pàgines**: `filename_pngs.zip` amb `page_1.png`, `page_2.png`, etc.

## Casos d'ús

- Capturar pàgines de PDF amb gran fidelitat per a presentacions.
- Extreure gràfics o diagrames que necessiten vores nítides i cap artefacte de compressió.
- Preparar recursos per al disseny web a partir de maquetes en PDF.
- Crear imatges de pàgina sense pèrdua per al preprocessament d'OCR.

## Consells

- Els fitxers PNG són molt més grans que els JPG. Si la mida del fitxer importa més que la qualitat perfecta, utilitza [PDF a JPG](./pdf-to-jpg) o [PDF a WebP](./pdf-to-webp).
- A escala 1.0x, la sortida coincideix amb la resolució nativa del PDF. Puja a 3.0x per a exportacions amb qualitat d'impressió.

## Eines relacionades

- [PDF a JPG](./pdf-to-jpg)
- [PDF a WebP](./pdf-to-webp)
- [PDF a SVG](./pdf-to-svg)
