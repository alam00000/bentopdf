---
title: PDF a SVG
description: Converteix pàgines de PDF en gràfics vectorials SVG escalables. Conserva el text i les formes com a traçats vectorials per a un escalat infinit.
---

# PDF a SVG

Converteix cada pàgina d'un PDF en un fitxer SVG (Scalable Vector Graphics). A diferència dels formats ràster, SVG conserva els traçats vectorials, el text i les formes, de manera que la sortida s'escala a qualsevol mida sense pixelar-se. Funciona amb PyMuPDF.

## Com funciona

1. Carrega un o més PDF fent clic a la zona de càrrega o arrossegant-hi fitxers. Pots afegir diversos fitxers i gestionar-los individualment.
2. Fes clic a **Converteix** per processar tots els fitxers carregats.
3. Les conversions d'un sol fitxer d'una sola pàgina es baixen com a `.svg` independent. La resta es baixa com a arxiu ZIP.

## Opcions

Aquesta eina no té opcions configurables. Cada pàgina es converteix a SVG amb l'exportació vectorial nativa de PyMuPDF.

## Format de sortida

- **Un fitxer, una pàgina**: `filename.svg`
- **Un fitxer, diverses pàgines**: `filename_svg.zip` amb `page_1.svg`, `page_2.svg`, etc.
- **Diversos fitxers**: `pdf_to_svg.zip` amb els fitxers organitzats pel nom del document d'origen.

## Casos d'ús

- Extreure diagrames vectorials, gràfics o il·lustracions d'informes en PDF per utilitzar-los en pàgines web.
- Editar el contingut de les pàgines d'un PDF en un editor vectorial com Inkscape o Illustrator.
- Incrustar previsualitzacions de pàgines escalables en aplicacions web adaptables.
- Extreure logotips o gràfics de fullets en PDF conservant les vores nítides.

## Consells

- SVG funciona millor amb PDF que contenen contingut vectorial. Els documents escanejats o els PDF amb moltes imatges produiran fitxers SVG grans amb dades ràster incrustades.
- Per a una sortida ràster de PDF amb moltes imatges, utilitza [PDF a PNG](./pdf-to-png) o [PDF a JPG](./pdf-to-jpg).
- Aquesta eina admet la conversió en lot: carrega diversos PDF alhora per convertir-los tots en una sola execució.

## Eines relacionades

- [PDF a PNG](./pdf-to-png)
- [PDF a JPG](./pdf-to-jpg)
- [PDF a Markdown](./pdf-to-markdown)
