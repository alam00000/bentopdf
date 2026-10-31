---
title: Color de fons
description: Canvia el color de fons de totes les pàgines del PDF conservant tot el contingut al damunt.
---

# Color de fons

Defineix un color de fons uniforme darrere de tot el contingut existent del PDF. L'eina crea un rectangle de color a cada pàgina i hi col·loca al damunt el contingut original, de manera que el text, les imatges i els gràfics es continuen veient perfectament sobre el fons nou.

## Com funciona

1. Puja el fitxer PDF.
2. Tria un color de fons amb el selector de color. El valor per defecte és un groc clar (#FFFFCC).
3. Fes clic a **Canvia el color de fons** per processar.
4. El PDF actualitzat es baixa automàticament.

## Opcions

- **Color de fons**: un selector de color estàndard per triar qualsevol color uniforme. Per defecte és groc clar.

## Característiques

- Aplica un color de fons uniforme a totes les pàgines
- Conserva tot el contingut original (text, imatges, gràfics vectorials) al damunt de la capa de color
- Manté les dimensions originals de la pàgina
- Funciona amb documents de qualsevol nombre de pàgines

## Casos d'ús

- Afegir un fons crema o ivori clar per donar als documents un aspecte més suau, semblant al paper
- Codificar amb colors conjunts de documents aplicant fons diferents a categories diferents
- Crear versions visualment diferenciades del mateix document per a públics diferents
- Afegir un lleu to de fons per millorar la llegibilitat quan es projecten documents en pantalla

## Consells

- Els colors clars i suaus funcionen millor. Un fons molt fosc pot dificultar la lectura del text, tret que el text ja sigui de color clar.
- Si vols canviar tant el color de fons com el del text, aplica primer el color de fons i després utilitza [Canvia el color del text](./text-color) sobre el resultat.
- Aquesta eina treballa a nivell estructural del PDF (no rasteritza), de manera que el text continua sent seleccionable i es pot cercar al resultat.

## Eines relacionades

- [Canvia el color del text](./text-color)
- [Inverteix els colors](./invert-colors)
- [Ajusta els colors](./adjust-colors)
