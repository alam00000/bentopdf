---
title: PDF vers WebP
description: Convertissez des pages PDF en images WebP avec une qualité réglable. Des fichiers plus petits que le JPG pour une qualité visuelle comparable.
---

# PDF vers WebP

Convertit chaque page d'un PDF en image WebP. Le WebP produit généralement des fichiers 25 à 35 % plus petits que le JPG pour une qualité perçue identique, ce qui en fait un excellent choix pour le web.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Réglez le curseur **Qualité**.
3. Cliquez sur **Convertir** pour traiter le fichier.
4. Un fichier `.webp` unique ou une archive ZIP est téléchargé automatiquement.

## Options

- **Qualité** : un curseur de 0 % à 100 % (85 % par défaut). Contrôle le niveau de compression avec perte. Des valeurs plus élevées conservent plus de détails.

Les pages sont rendues en interne à l'échelle 2x, ce qui produit des images d'environ le double des dimensions natives du PDF.

## Format de sortie

- **Une seule page** : `filename.webp`
- **Plusieurs pages** : `filename_webps.zip` contenant `page_1.webp`, `page_2.webp`, etc.

## Cas d'usage

- Préparer des aperçus de pages pour des sites web où la bande passante compte.
- Générer des versions d'image légères de flyers ou de brochures pour les réseaux sociaux.
- Convertir par lots des documents de plusieurs pages en un ensemble d'images optimisé pour le web.

## Astuces

- Le WebP est pris en charge par tous les navigateurs modernes. Pour la compatibilité avec les anciens, repliez-vous sur [PDF vers JPG](./pdf-to-jpg).
- Une qualité de 80 à 85 % est généralement indiscernable de l'original à l'écran tout en gardant des fichiers légers.

## Outils associés

- [PDF vers JPG](./pdf-to-jpg)
- [PDF vers PNG](./pdf-to-png)
- [PDF vers BMP](./pdf-to-bmp)
