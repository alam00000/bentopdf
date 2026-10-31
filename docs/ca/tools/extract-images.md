---
title: Extreu imatges
description: Extreu totes les imatges incrustades dels fitxers PDF. Previsualitza-les en una quadrícula i baixa-les individualment o com a arxiu ZIP.
---

# Extreu imatges

Extreu totes les imatges incrustades d'un o més fitxers PDF. Les imatges extretes es mostren en una quadrícula de previsualització on pots baixar-les individualment o agafar-ho tot alhora en un ZIP. Funciona amb PyMuPDF.

## Com funciona

1. Puja un o més PDF fent clic a la zona de càrrega o arrossegant-hi fitxers. Afegeix-ne més o elimina'n d'individuals segons calgui.
2. Fes clic a **Extreu imatges** per iniciar el processament.
3. L'eina explora totes les pàgines de tots els PDF pujats, i troba i extreu les imatges incrustades.
4. Les imatges extretes apareixen en una quadrícula amb miniatures. Cada imatge té un botó de baixada.
5. Fes clic a **Baixa-ho tot** per desar-ho tot com a arxiu ZIP.

## Opcions

Aquesta eina no té opcions configurables. Totes les imatges incrustades s'extreuen en el seu format original (normalment PNG, JPEG o el format que es va fer servir quan la imatge es va incrustar al PDF).

## Format de sortida

- Les imatges es mostren en una quadrícula de previsualització amb noms com `image_1.png`, `image_2.jpg`, etc.
- **Baixa-ho tot** genera `extracted-images.zip` amb totes les imatges.
- Les imatges es poden baixar una a una des de la quadrícula.

## Casos d'ús

- Recuperar fotos o gràfics d'un PDF per reutilitzar-los en un altre projecte.
- Extreure imatges de productes d'un PDF de catàleg per a una fitxa de comerç electrònic.
- Treure diagrames de documentació tècnica per fer-los servir en presentacions.
- Auditar quines imatges hi ha incrustades en un document abans de compartir-lo.

## Consells

- L'eina extreu les imatges exactament com estan emmagatzemades al PDF. No torna a renderitzar les pàgines com a imatges: per a això, fes servir [PDF a PNG](./pdf-to-png) o [PDF a JPG](./pdf-to-jpg).
- Si l'eina informa de "No s'ha trobat cap imatge", és possible que el PDF faci servir gràfics vectorials en lloc d'imatges de mapa de bits incrustades, o que sigui un document escanejat on tota la pàgina és una sola imatge gran.
- El processament per lots funciona amb diversos PDF. Totes les imatges de tots els fitxers es combinen en una única quadrícula i en un sol ZIP.

## Eines relacionades

- [PDF a PNG](./pdf-to-png)
- [PDF a JPG](./pdf-to-jpg)
- [Creador de fluxos de treball PDF](./pdf-workflow)
