---
title: Extraire les images
description: Extrayez toutes les images intégrées de fichiers PDF. Prévisualisez-les dans une grille et téléchargez-les individuellement ou dans une archive ZIP.
---

# Extraire les images

Récupère chaque image intégrée d'un ou plusieurs fichiers PDF. Les images extraites s'affichent dans une grille d'aperçu où vous pouvez les télécharger individuellement, ou toutes d'un coup dans un ZIP. Propulsé par PyMuPDF.

## Fonctionnement

1. Importez un ou plusieurs PDF en cliquant sur la zone de dépôt ou en y glissant des fichiers. Ajoutez d'autres fichiers ou retirez-en au besoin.
2. Cliquez sur **Extraire** pour lancer le traitement.
3. L'outil analyse chaque page de chaque PDF importé, puis trouve et extrait les images intégrées.
4. Les images extraites apparaissent dans une grille de miniatures. Chaque image dispose d'un bouton de téléchargement.
5. Cliquez sur **Tout télécharger** pour tout enregistrer dans une archive ZIP.

## Options

Cet outil n'a aucune option configurable. Toutes les images intégrées sont extraites dans leur format d'origine (généralement PNG, JPEG, ou le format utilisé lors de l'intégration de l'image dans le PDF).

## Format de sortie

- Les images s'affichent dans une grille d'aperçu sous les noms `image_1.png`, `image_2.jpg`, etc.
- **Tout télécharger** produit `extracted-images.zip` contenant toutes les images.
- Les images peuvent être téléchargées une par une depuis la grille.

## Cas d'usage

- Récupérer des photos ou des graphiques d'un PDF pour les réutiliser dans un autre projet.
- Extraire des images de produits d'un PDF de catalogue pour une fiche e-commerce.
- Récupérer des schémas de documentation technique pour des présentations.
- Auditer les images intégrées à un document avant de le partager.

## Conseils

- L'outil extrait les images exactement telles qu'elles sont stockées dans le PDF. Il ne rend pas les pages sous forme d'images : pour cela, utilisez [PDF vers PNG](./pdf-to-png) ou [PDF vers JPG](./pdf-to-jpg).
- Si l'outil indique « Aucune image trouvée », le PDF utilise peut-être des graphiques vectoriels plutôt que des images matricielles intégrées, ou il s'agit d'un document numérisé dont chaque page est une seule grande image.
- Le traitement par lots fonctionne sur plusieurs PDF. Toutes les images de tous les fichiers sont réunies dans une seule grille et un seul ZIP.

## Outils associés

- [PDF vers PNG](./pdf-to-png)
- [PDF vers JPG](./pdf-to-jpg)
- [Constructeur de workflow PDF](./pdf-workflow)
