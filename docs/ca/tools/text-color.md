---
title: Canvia el color del text
description: Canvia el color de tot el text del PDF al color que triïs.
---

# Canvia el color del text

Substitueix el color del text de tot el PDF. L'eina identifica les zones de text de cada pàgina i les torna a pintar amb el color triat, conservant el disseny del document i el contingut que no és text.

## Com funciona

1. Puja el fitxer PDF.
2. Tria un color de text nou amb el selector de color. El valor per defecte és blau (#0000FF).
3. Fes clic a **Canvia el color del text** per processar-lo.
4. El PDF amb el color nou es baixa automàticament. Un indicador de progrés mostra quina pàgina s'està processant.

## Opcions

- **Color de text nou**: un selector de color per triar el color de substitució de tot el text del document.

## Funcions

- Canvia el color del text a totes les pàgines del document
- Processament per pàgina amb indicació del progrés
- Selector de color amb compatibilitat completa amb colors hexadecimals
- Conserva el disseny de la pàgina i els elements que no són text

## Casos d'ús

- Canviar el text negre a blau fosc per donar al document un aspecte més suau i modern
- Canviar el color del text perquè coincideixi amb la guia d'estil de la marca abans de distribuir documents
- Convertir el text a un color concret per complir requisits d'accessibilitat
- Fer visible el text sobre un color de fons aplicat recentment

## Consells

- Aquesta eina representa les pàgines a escala 2x per mantenir la qualitat i després reconstrueix el PDF. La sortida es basa en imatges, de manera que el text ja no es podrà seleccionar ni cercar.
- Per a documents en què necessitis conservar el text seleccionable, considera editar el PDF directament amb l'[Editor de PDF](./edit-pdf).
- El temps de processament augmenta amb el nombre de pàgines, ja que cada pàgina es representa individualment.

## Eines relacionades

- [Color de fons](./background-color)
- [Inverteix els colors](./invert-colors)
- [Ajusta els colors](./adjust-colors)
