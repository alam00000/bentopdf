---
title: PDF a JPG
description: Converteix pàgines de PDF en imatges JPG amb qualitat ajustable. Els PDF d'una pàgina es baixen directament; els de diverses pàgines s'exporten com a ZIP.
---

# PDF a JPG

Converteix cada pàgina d'un PDF en una imatge JPG. Els documents d'una sola pàgina es baixen com a fitxer `.jpg` independent. Els PDF de diverses pàgines generen un arxiu ZIP amb un JPG per pàgina.

## Com funciona

1. Carrega un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer. L'eina mostra el nom del fitxer, la mida i el nombre de pàgines.
2. Ajusta el control lliscant de **Qualitat** per controlar la compressió del JPG.
3. Fes clic a **Converteix** per iniciar el processament.
4. El resultat es baixa automàticament: un sol JPG per als PDF d'una pàgina o un fitxer ZIP per als documents de diverses pàgines.

## Opcions

- **Qualitat**: un control lliscant del 0 % al 100 % (per defecte, 90 %). Els valors més alts produeixen imatges més nítides amb fitxers més grans. Els valors més baixos comprimeixen més agressivament.

Les pàgines es renderitzen internament a escala 2x, de manera que la resolució de sortida és el doble de les dimensions de la pàgina del PDF. Una pàgina estàndard de mida Letter produeix una imatge d'aproximadament 1.224 x 1.584 píxels.

## Format de sortida

- **Una pàgina**: `filename.jpg`
- **Diverses pàgines**: `filename_jpgs.zip` amb `page_1.jpg`, `page_2.jpg`, etc.

## Casos d'ús

- Generar miniatures de previsualització per a un sistema de gestió documental.
- Compartir una pàgina d'un informe en un xat o correu que no admet PDF.
- Crear recursos d'imatge a partir de diagrames o il·lustracions d'un PDF.
- Arxivar documents escanejats com a imatges individuals.

## Consells

- Per a una sortida sense pèrdua, utilitza [PDF a PNG](./pdf-to-png).
- Una qualitat del 80-90 % ofereix un bon equilibri entre mida de fitxer i fidelitat visual.
- Si necessites un format específic per a cada pàgina, considera el [Creador de fluxos de treball PDF](./pdf-workflow), que té un node de sortida de PDF a imatges.

## Eines relacionades

- [PDF a PNG](./pdf-to-png)
- [PDF a WebP](./pdf-to-webp)
- [PDF a BMP](./pdf-to-bmp)
- [PDF a TIFF](./pdf-to-tiff)
