---
title: Elimina les metadades
description: Elimina totes les metadades ocultes dels fitxers PDF, com l'autor, el títol, la data de creació, el productor, les dades XMP i els identificadors de document.
---

# Elimina les metadades

Tot PDF porta metadades que poden revelar qui l'ha creat, quin programari s'ha utilitzat, quan es va modificar per última vegada i més. Aquesta eina ho elimina tot (el diccionari d'informació, els fluxos de metadades XMP, els identificadors de document i les dades específiques d'aplicacions) i deixa un document net sense cap rastre del seu origen.

## Com funciona

1. Puja un fitxer PDF.
2. Fes clic a **Elimina les metadades**.
3. Descarrega el fitxer net.

No hi ha opcions per configurar. L'eina és exhaustiva per disseny: ho esborra tot.

## Què s'elimina

- **Camps del diccionari d'informació**: títol, autor, assumpte, paraules clau, creador, productor, data de creació, data de modificació
- **Flux de metadades XMP**: el bloc de metadades basat en XML emmagatzemat al catàleg del document
- **Identificadors de document**: identificadors únics al tràiler del PDF que es poden utilitzar per rastrejar un document entre sistemes
- **PieceInfo**: metadades específiques d'aplicacions afegides per programes com Illustrator o InDesign

## Què es conserva

- Tot el contingut visible de les pàgines (text, imatges, gràfics)
- Camps de formulari i anotacions
- Marcadors i enllaços
- L'estructura del document en si

## Casos d'ús

- Eliminar el teu nom i organització d'un document abans de publicar-lo de manera anònima
- Eliminar les marques de temps de creació que revelen quan es va preparar un document
- Netejar les cadenes de productor que identifiquen el teu programari PDF
- Preparar documents per a presentacions reguladores que exigeixen PDF sense metadades
- Eliminar els rastres de l'historial d'edició abans de compartir un document externament

## Consells

- Utilitza primer l'eina Visualitza les metadades per veure exactament quines metadades conté el PDF abans d'eliminar-les.
- Si necessites eliminar les metadades _i també_ JavaScript, anotacions i fitxers incrustats, utilitza Neteja PDF per fer una neteja més exhaustiva.
- L'eliminació de metadades és permanent. Conserva l'original si més endavant pots necessitar aquestes dades.

## Eines relacionades

- [Neteja PDF](./sanitize-pdf): elimina les metadades i també scripts, fitxers adjunts i més
- [Xifra PDF](./protect-pdf): protegeix amb contrasenya el PDF net
- [Comprimeix PDF](./compress-pdf): eliminar les metadades pot reduir lleugerament la mida del fitxer; comprimeix per estalviar-ne més
