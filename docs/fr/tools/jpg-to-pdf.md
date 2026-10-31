---
title: JPG vers PDF
description: Convertissez une ou plusieurs images JPG, JPEG et JPEG 2000 en un seul fichier PDF directement dans votre navigateur.
---

# JPG vers PDF

Transformez des images JPG en un PDF propre. Envoyez un fichier ou plusieurs JPG à la fois : chaque image devient une page pleine taille du document final.

## Formats pris en charge

| Format    | Extensions      |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Fonctionnement

1. Cliquez sur la zone d'envoi ou glissez-déposez vos fichiers JPG. La sélection multiple est prise en charge.
2. Vérifiez les fichiers envoyés. Utilisez l'icône de corbeille pour retirer un fichier, ou cliquez sur **Ajouter d'autres fichiers** pour en ajouter à la liste.
3. Sélectionnez un niveau de **Qualité du PDF**.
4. Cliquez sur **Convertir en PDF**. L'outil compresse les images selon votre réglage de qualité, les convertit avec le moteur PyMuPDF et télécharge `from_jpgs.pdf`.

## Options

**Qualité du PDF** ajuste la compression appliquée à chaque image avant son intégration au PDF :

- **Haute qualité** : conserve un maximum de détails. À utiliser pour la photographie ou l'impression.
- **Qualité moyenne** (par défaut) : un bon équilibre entre netteté et taille de fichier.
- **Basse qualité** : compression agressive pour le fichier le plus léger.

## Cas d'usage

- Convertir des documents numérisés enregistrés en JPG en un seul PDF à soumettre
- Regrouper des photos de produits dans un catalogue pour des clients
- Transformer des images médicales ou satellites en JPEG 2000 en PDF portable
- Créer un album photo imprimable à partir d'exports d'appareil photo

## Astuces

- Les fichiers JPEG 2000 (`.jp2`, `.jpx`) sont entièrement pris en charge, pas seulement le JPEG standard. C'est utile pour l'imagerie médicale et les données géospatiales.
- Si vos JPG proviennent d'un appareil photo de téléphone, la qualité Moyenne produit généralement un fichier 40 à 60 % plus petit que la qualité Haute, sans différence visible à l'écran.

## Outils associés

- [Images vers PDF](./image-to-pdf)
- [PNG vers PDF](./png-to-pdf)
- [WebP vers PDF](./webp-to-pdf)
