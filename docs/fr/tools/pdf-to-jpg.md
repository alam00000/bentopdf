---
title: PDF vers JPG
description: Convertissez des pages PDF en images JPG avec une qualité réglable. Les PDF d'une page se téléchargent directement, ceux de plusieurs pages sont exportés en ZIP.
---

# PDF vers JPG

Convertit chaque page d'un PDF en image JPG. Les documents d'une seule page sont téléchargés sous forme d'un fichier `.jpg` autonome. Les PDF de plusieurs pages produisent une archive ZIP contenant un JPG par page.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier. L'outil affiche le nom du fichier, sa taille et son nombre de pages.
2. Réglez le curseur **Qualité** pour contrôler la compression JPG.
3. Cliquez sur **Convertir** pour lancer le traitement.
4. Le résultat est téléchargé automatiquement : un seul JPG pour les PDF d'une page, ou un fichier ZIP pour les documents de plusieurs pages.

## Options

- **Qualité** : un curseur de 0 % à 100 % (90 % par défaut). Des valeurs plus élevées produisent des images plus nettes avec des fichiers plus volumineux. Des valeurs plus basses compressent plus fortement.

Les pages sont rendues en interne à l'échelle 2x, la résolution de sortie est donc le double des dimensions de la page PDF. Une page au format Letter produit une image d'environ 1 224 x 1 584 pixels.

## Format de sortie

- **Une seule page** : `filename.jpg`
- **Plusieurs pages** : `filename_jpgs.zip` contenant `page_1.jpg`, `page_2.jpg`, etc.

## Cas d'usage

- Générer des miniatures d'aperçu pour un système de gestion documentaire.
- Partager une page d'un rapport dans un chat ou un e-mail qui ne prend pas en charge le PDF.
- Créer des ressources d'image à partir de schémas ou d'illustrations PDF.
- Archiver des documents numérisés sous forme d'images individuelles.

## Astuces

- Pour une sortie sans perte, utilisez plutôt [PDF vers PNG](./pdf-to-png).
- Un réglage de qualité de 80 à 90 % offre un bon équilibre entre taille de fichier et fidélité visuelle.
- Si vous avez besoin d'un format précis par page, essayez le [Créateur de flux PDF](./pdf-workflow), qui dispose d'un nœud de sortie PDF vers images.

## Outils associés

- [PDF vers PNG](./pdf-to-png)
- [PDF vers WebP](./pdf-to-webp)
- [PDF vers BMP](./pdf-to-bmp)
- [PDF vers TIFF](./pdf-to-tiff)
