---
title: PDF en niveaux de gris
description: Convertissez un PDF en couleur en version en niveaux de gris (noir et blanc). Produit un nouveau PDF sans aucune couleur sur chaque page.
---

# PDF en niveaux de gris

Convertit un PDF en couleur en version en niveaux de gris. Chaque page est rendue, désaturée puis réintégrée sous forme d'image JPEG dans un nouveau PDF. Le résultat conserve les dimensions d'origine des pages.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Cliquez sur **Convertir** pour traiter le fichier.
3. Un nouveau fichier `greyscale.pdf` est téléchargé avec toutes les pages converties en noir et blanc.

En coulisses, chaque page est rendue à l'échelle 2x, les données de pixels passent par un filtre de niveaux de gris, puis sont réencodées en JPEG à 90 % de qualité et placées dans un nouveau document PDF.

## Options

Cet outil n'a aucune option configurable. La conversion en niveaux de gris utilise une formule de luminance standard et la qualité JPEG est fixée à 90 %.

## Format de sortie

- Un seul fichier `greyscale.pdf` contenant toutes les pages sous forme d'images JPEG en niveaux de gris.

## Cas d'usage

- Préparer des documents pour une impression en noir et blanc afin d'économiser l'encre couleur.
- Respecter les exigences de dépôt de dossiers juridiques ou administratifs qui imposent les niveaux de gris.
- Réduire la taille de PDF très colorés (les images JPEG en niveaux de gris sont plus légères que celles en couleur).
- Créer un style visuel cohérent pour des documents mêlant pages en couleur et en noir et blanc.

## Astuces

- Comme chaque page est rastérisée puis réintégrée en JPEG, le résultat est basé sur des images. Le texte du PDF d'origine ne sera plus sélectionnable ni consultable. Si vous avez besoin d'un texte recherchable ensuite, passez le résultat dans l'outil OCR.
- Pour un meilleur contrôle des réglages de couleur (luminosité, contraste, saturation), consultez l'outil Ajuster les couleurs ou le nœud Niveaux de gris du [Créateur de flux PDF](./pdf-workflow).

## Outils associés

- [PDF vers JPG](./pdf-to-jpg)
- [PDF vers PNG](./pdf-to-png)
- [Créateur de flux PDF](./pdf-workflow)
