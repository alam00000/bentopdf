---
title: PDF a escala de grisos
description: Converteix un PDF en color en una versió en escala de grisos (blanc i negre). Genera un PDF nou amb tot el color eliminat de totes les pàgines.
---

# PDF a escala de grisos

Converteix un PDF en color en una versió en escala de grisos. Cada pàgina es renderitza, es desatura i es torna a incrustar com a imatge JPEG en un PDF nou. La sortida conserva les dimensions originals de la pàgina.

## Com funciona

1. Carrega un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer.
2. Fes clic a **Converteix** per processar el fitxer.
3. Es baixa un `greyscale.pdf` nou amb totes les pàgines convertides a blanc i negre.

Internament, cada pàgina es renderitza a escala 2x, les dades de píxels passen per un filtre d'escala de grisos i després es tornen a codificar com a JPEG al 90 % de qualitat i es col·loquen en un document PDF nou.

## Opcions

Aquesta eina no té opcions configurables. La conversió a escala de grisos utilitza una fórmula de luminància estàndard i la qualitat JPEG està fixada al 90 %.

## Format de sortida

- Un únic fitxer `greyscale.pdf` amb totes les pàgines com a imatges JPEG en escala de grisos.

## Casos d'ús

- Preparar documents per a la impressió en blanc i negre per estalviar en tinta de color.
- Complir els requisits de presentació de tràmits legals o governamentals que exigeixen l'escala de grisos.
- Reduir la mida de fitxer de PDF amb molt de color (les imatges JPEG en escala de grisos són més petites que les de color).
- Crear un estil visual coherent en documents amb pàgines en color i en blanc i negre.

## Consells

- Com que cada pàgina es rasteritza i es torna a incrustar com a JPEG, la sortida és basada en imatges. El text del PDF original ja no es podrà seleccionar ni cercar. Si després necessites text cercable, passa la sortida per l'eina d'OCR.
- Per tenir més control sobre els ajustos de color (brillantor, contrast, saturació), mira l'eina Ajusta els colors o el node d'escala de grisos del [Creador de fluxos de treball PDF](./pdf-workflow).

## Eines relacionades

- [PDF a JPG](./pdf-to-jpg)
- [PDF a PNG](./pdf-to-png)
- [Creador de fluxos de treball PDF](./pdf-workflow)
