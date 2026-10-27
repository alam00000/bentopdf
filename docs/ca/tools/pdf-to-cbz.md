---
title: PDF a CBZ
description: Converteix un PDF en un fitxer CBZ (Comic Book Archive) per a lectors de còmics com Komga, Kavita, CDisplayEx i Calibre.
---

# PDF a CBZ

Converteix un PDF en un fitxer CBZ (Comic Book ZIP), el format estàndard dels còmics i el manga digitals. Cada pàgina del PDF es converteix en una imatge dins de l'arxiu. L'eina genera metadades en tres formats per garantir la màxima compatibilitat: ComicInfo.xml, metadata.opf i JSON de ComicBookInfo.

## Com funciona

1. Carrega un PDF fent clic a la zona de càrrega o arrossegant-hi un fitxer.
2. Tria el format d'imatge, la qualitat, l'escala i les metadades opcionals.
3. Fes clic a **Converteix** per generar el fitxer CBZ.
4. El fitxer `.cbz` es baixa automàticament.

## Opcions

| Opció                | Valors          | Per defecte | Descripció                                                                                                  |
| -------------------- | --------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| Format d'imatge      | JPEG, PNG, WebP | JPEG        | JPEG per a còmics en color, PNG per a manga en blanc i negre sense pèrdua, WebP per a la millor compressió. |
| Qualitat             | 50–100%         | 85%         | Controla la compressió de JPEG/WebP. Amagada per a PNG (sempre sense pèrdua).                               |
| Escala               | 1.0x–4.0x       | 2.0x        | Una escala més alta produeix imatges més nítides per a pantalles d'alta resolució.                          |
| Escala de grisos     | Sí/No           | No          | Converteix les pàgines a escala de grisos. Redueix la mida del fitxer en contingut en blanc i negre.        |
| Mode manga           | Sí/No           | No          | Defineix la direcció de lectura de dreta a esquerra a les metadades.                                        |
| Inclou les metadades | Sí/No           | Sí          | Incrusta ComicInfo.xml, metadata.opf i el JSON de ComicBookInfo.                                            |

## Camps de metadades

Quan les metadades estan activades, pots omplir:

- **Títol**: es detecta automàticament a partir del nom del fitxer PDF.
- **Sèrie**: el nom de la sèrie (p. ex., "Naruto").
- **Número (#)**: número de l'exemplar dins de la sèrie.
- **Volum (Vol.)**: número de volum.
- **Autor(s)**: nom de l'escriptor o creador.
- **Editorial**: l'empresa editora.
- **Etiquetes / Gènere**: etiquetes separades per comes (p. ex., "Acció, Aventura").
- **Any de publicació**: any de publicació (1900–2100).
- **Valoració**: valoració de la comunitat de 0 a 5.

## Compatibilitat de les metadades

L'eina escriu les metadades en tres formats perquè tots els lectors les puguin trobar:

| Format             | Ubicació                  | Compatible amb                              |
| ------------------ | ------------------------- | ------------------------------------------- |
| ComicInfo.xml      | Fitxer dins del ZIP       | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Fitxer dins del ZIP       | Calibre                                     |
| ComicBookInfo JSON | Camp de comentari del ZIP | Calibre (alternativa)                       |

## Format de sortida

- `filename.cbz`: un arxiu ZIP amb les imatges de les pàgines numerades i els fitxers de metadades.

Les imatges de les pàgines es nomenen amb números emplenats amb zeros (`01.jpg`, `02.jpg`, etc.) perquè els lectors les mostrin en l'ordre correcte.

## Casos d'ús

- Convertir PDF de manga o còmics per utilitzar-los amb lectors de còmics.
- Crear una biblioteca de còmics digital a Komga, Kavita o Calibre.
- Convertir còmics escanejats a un format còmode per als lectors.
- Compartir còmics en un format que conserva la direcció de lectura i les metadades.

## Consells

- Utilitza **JPEG** per a còmics en color i **PNG** per a manga en blanc i negre: PNG comprimeix molt eficientment el contingut en blanc i negre.
- Activa l'**Escala de grisos** per al manga per reduir significativament la mida del fitxer.
- Omple els camps **Sèrie** i **Número** perquè els gestors de biblioteca (Komga, Calibre) puguin organitzar la teva col·lecció automàticament.
- **WebP** ofereix la millor compressió, però els lectors de còmics més antics poden no ser-hi compatibles.

## Eines relacionades

- [PDF a JPG](./pdf-to-jpg)
- [PDF a PNG](./pdf-to-png)
- [PDF a TIFF](./pdf-to-tiff)
- [Extreu imatges](./extract-images)
