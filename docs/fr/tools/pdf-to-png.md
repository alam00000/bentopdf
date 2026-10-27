---
title: PDF vers PNG
description: Convertissez des pages PDF en images PNG sans perte avec une échelle réglable. Idéal pour des captures de haute qualité et des fonds transparents.
---

# PDF vers PNG

Convertit chaque page d'un PDF en image PNG. Le PNG utilise une compression sans perte, le résultat conserve donc tous les détails de la page d'origine. Les PDF d'une page sont téléchargés sous forme de fichier `.png`, ceux de plusieurs pages produisent un ZIP.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Réglez le curseur **Échelle** pour contrôler la résolution de sortie.
3. Cliquez sur **Convertir** pour lancer le traitement.
4. Un PNG unique ou une archive ZIP est téléchargé automatiquement.

## Options

- **Échelle** : de 1,0x à 3,0x (2,0x par défaut). À 2,0x, une page au format Letter est rendue à environ 1 224 x 1 584 pixels. Des valeurs d'échelle plus élevées produisent des images plus grandes et plus nettes, au prix d'une taille de fichier et d'un temps de traitement accrus.

## Format de sortie

- **Une seule page** : `filename.png`
- **Plusieurs pages** : `filename_pngs.zip` contenant `page_1.png`, `page_2.png`, etc.

## Cas d'usage

- Capturer des images fidèles de pages PDF pour des présentations.
- Extraire des graphiques ou des schémas qui exigent des contours nets et aucun artefact de compression.
- Préparer des ressources pour le design web à partir de maquettes PDF.
- Créer des images de pages sans perte pour le prétraitement OCR.

## Astuces

- Les fichiers PNG sont nettement plus volumineux que les JPG. Si la taille compte plus que la qualité parfaite, utilisez [PDF vers JPG](./pdf-to-jpg) ou [PDF vers WebP](./pdf-to-webp).
- À l'échelle 1,0x, la sortie correspond à la résolution native du PDF. Passez à 3,0x pour des exports de qualité d'impression.

## Outils associés

- [PDF vers JPG](./pdf-to-jpg)
- [PDF vers WebP](./pdf-to-webp)
- [PDF vers SVG](./pdf-to-svg)
