---
title: Rasteritza PDF
description: Converteix les pàgines d'un PDF en un PDF basat en imatges. Aplana totes les capes, elimina el text seleccionable i controla els DPI i el format d'imatge.
---

# Rasteritza PDF

La rasterització converteix cada pàgina d'un PDF en una imatge i torna a muntar aquestes imatges en un PDF. El resultat es veu idèntic a l'original però no conté text seleccionable, ni elements interactius, ni capes editables. És, en la pràctica, una fotocòpia d'alta qualitat.

## Com funciona

1. Puja un o més fitxers PDF.
2. Defineix els **DPI** (resolució) de la sortida rasteritzada.
3. Tria un **format d'imatge**: PNG per a qualitat sense pèrdua o JPEG per a fitxers més petits.
4. Opcionalment, marca **Converteix a escala de grisos**.
5. Fes clic a **Rasteritza PDF**. Si hi ha diversos fitxers, es descarreguen en un ZIP.

## Opcions

| Paràmetre            | Valors                               | Per defecte |
| -------------------- | ------------------------------------ | ----------- |
| **DPI**              | 72, 150, 200, 300, 600               | 150         |
| **Format d'imatge**  | PNG (sense pèrdua), JPEG (més petit) | PNG         |
| **Escala de grisos** | Activat/Desactivat                   | Desactivat  |

## Orientacions sobre els DPI

- **72**: només per veure en pantalla, la mida de fitxer més petita
- **150**: bon equilibri per a l'ús general
- **200**: text més nítid, mida de fitxer moderada
- **300**: sortida amb qualitat d'impressió
- **600**: arxiu d'alta qualitat o impressió professional

## Casos d'ús

- Evitar l'extracció de text de documents confidencials abans de compartir-los
- Eliminar problemes de dependència de tipus de lletra convertint el text en píxels
- Crear una versió «plana» d'un PDF amb capes complexes o transparències que es renderitza diferent en cada visor
- Preparar un PDF per a un sistema que només accepta entrada basada en imatges
- Eliminar el contingut ocult (com els canvis de seguiment o les dades de formulari) reduint el PDF a imatges pures

## Consells

- 150 DPI amb PNG és una bona opció per defecte. Puja'l només si necessites sortida per a impressió o has d'ampliar detalls fins.
- JPEG produeix fitxers notablement més petits però introdueix artefactes de compressió a les vores nítides del text.
- La rasterització és irreversible: conserva el PDF original si més endavant pots necessitar text editable.

## Eines relacionades

- [Comprimeix PDF](./compress-pdf): redueix la mida del PDF rasteritzat
- [Redreça PDF](./deskew-pdf): redreça les pàgines abans de rasteritzar documents escanejats
- [Converteix tipus de lletra en contorns](./font-to-outline): converteix els tipus de lletra en traçats vectorials si vols conservar l'escalabilitat
- [Aplana PDF](./flatten-pdf): aplana formularis sense convertir-los en imatges
