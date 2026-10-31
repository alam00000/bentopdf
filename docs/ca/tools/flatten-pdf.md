---
title: Aplana PDF
description: Aplana els formularis interactius i les anotacions en contingut estàtic. Fa que els camps del formulari no es puguin editar i incrusta les anotacions a la pàgina.
---

# Aplana PDF

Aplanar fusiona els elements interactius (camps de formulari, desplegables, caselles de selecció, anotacions, ressaltats, notes adhesives) directament amb el contingut de la pàgina. L'aspecte visual es manté, però ja no es pot editar ni extreure res. És l'equivalent en PDF d'imprimir un formulari emplenat i tornar-lo a escanejar, tot i que la qualitat es manté perfecta.

## Com funciona

1. Puja un o més fitxers PDF.
2. Fes clic a **Aplana PDF**.
3. Un sol fitxer es baixa directament. Si en són diversos, es genera un arxiu ZIP.

L'eina fa servir pdf-lib per aplanar els camps del formulari (mitjançant `form.flatten()`) i un aplanador d'anotacions propi per incrustar les anotacions al flux de la pàgina. Ambdues operacions es fan en una sola passada.

## Què s'aplana

- **Camps de formulari**: camps de text, caselles de selecció, botons d'opció, desplegables, camps de signatura
- **Anotacions**: comentaris, ressaltats, text ratllat, subratllat, notes adhesives, segells, anotacions de tinta
- **Elements interactius**: botons, activadors d'accions

## Què no canvia

- El contingut de text (continua sent seleccionable i es pot cercar)
- Imatges i gràfics
- El disseny i les dimensions de la pàgina
- Marcadors i taula de continguts
- Enllaços (tret que estiguin basats en anotacions)

## Casos d'ús

- Bloquejar un formulari emplenat perquè els destinataris no puguin canviar les respostes enviades
- Preparar un PDF per arxivar-lo quan els elements interactius no són necessaris
- Corregir problemes de visualització causats per anotacions que es mostren diferent segons el visor
- Assegurar que un document signat no es pugui modificar després d'aplicar la signatura
- Reduir la mida del fitxer eliminant les definicions de camps de formulari i els objectes d'anotació

## Consells

- Aplana quan hagis acabat totes les edicions. No hi ha cap manera de desfer l'aplanament d'un PDF.
- Si necessites aplanar i, a més, eliminar metadades, JavaScript i fitxers adjunts, fes servir l'eina Neteja PDF: inclou l'aplanament com una de les seves opcions.
- Alguns PDF indiquen «no s'ha trobat cap formulari»: és normal si el document només té anotacions i cap camp de formulari.

## Eines relacionades

- [Neteja PDF](./sanitize-pdf): aplana formularis i, a més, elimina metadades, scripts i més
- [Rasteritza PDF](./rasterize-pdf): converteix a un PDF basat en imatges per a un aplanament màxim
- [Converteix tipus de lletra en contorns](./font-to-outline): aplana els tipus de lletra en traçats vectorials
- [Xifra PDF](./protect-pdf): bloqueja el PDF aplanat amb una contrasenya
