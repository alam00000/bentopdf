---
title: PDF vers BMP
description: Convertissez des pages PDF en images BMP non compressées. Utile pour les systèmes anciens et les flux d'impression qui exigent une entrée bitmap.
---

# PDF vers BMP

Convertit chaque page d'un PDF en image BMP (Bitmap). BMP est un format non compressé : le résultat est fidèle au pixel près, sans perte de qualité, mais les fichiers sont volumineux.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Cliquez sur **Convertir** pour lancer le traitement.
3. Un fichier `.bmp` unique ou une archive ZIP est téléchargé automatiquement.

## Options

Cet outil n'a aucune option configurable. Les pages sont rendues à une échelle fixe de 2x, ce qui produit des images d'environ le double des dimensions natives de la page PDF.

## Format de sortie

- **Une seule page** : `filename.bmp`
- **Plusieurs pages** : `filename_bmps.zip` contenant `page_1.bmp`, `page_2.bmp`, etc.

## Cas d'usage

- Alimenter des systèmes ou du matériel anciens qui n'acceptent que le BMP en entrée.
- Préparer des images non compressées pour certains flux d'impression.
- Utiliser une sortie bitmap comme entrée d'outils de traitement d'image qui exigent des données de pixels brutes.

## Astuces

- Les fichiers BMP sont très volumineux car ils stockent les pixels bruts sans compression. Dans la plupart des cas, [PDF vers PNG](./pdf-to-png) offre une qualité sans perte avec des fichiers bien plus petits.
- Si votre système cible accepte le PNG ou le TIFF, préférez ces formats pour économiser de l'espace disque.

## Outils associés

- [PDF vers PNG](./pdf-to-png)
- [PDF vers TIFF](./pdf-to-tiff)
- [PDF vers JPG](./pdf-to-jpg)
