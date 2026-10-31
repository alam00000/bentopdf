---
title: PDF vers TIFF
description: Convertissez des pages PDF en images TIFF, couramment utilisées dans l'impression, le fax et l'archivage. Bascule sur PNG si l'encodage échoue.
---

# PDF vers TIFF

Convertit chaque page d'un PDF en image TIFF. Le TIFF est le format standard de la production d'impression, des systèmes de fax et de l'archivage de documents. L'outil utilise la compression PackBits pour l'encodage TIFF et bascule sur PNG si l'encodage d'une page échoue.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Cliquez sur **Convertir** pour traiter le fichier.
3. Un fichier TIFF unique ou une archive ZIP est téléchargé automatiquement.

## Options

Cet outil n'a aucune option configurable. Les pages sont rendues à une échelle fixe de 2x.

## Format de sortie

- **Une seule page** : `filename.tiff`
- **Plusieurs pages** : `filename_tiffs.zip` contenant `page_1.tiff`, `page_2.tiff`, etc.

Si l'encodage TIFF échoue pour une page précise (à cause de problèmes de compression), cette page est enregistrée en fichier `.png` à la place. Le ZIP contiendra alors un mélange de fichiers TIFF et PNG.

## Cas d'usage

- Soumettre des documents à des administrations ou des systèmes juridiques qui exigent le format TIFF.
- Préparer des pages pour une transmission par fax via des services de fax numériques.
- Archiver des documents numérisés dans un format sans perte largement pris en charge.
- Alimenter des systèmes de gestion documentaire d'entreprise avec des pages.

## Astuces

- Les fichiers TIFF sont volumineux. Si vous n'avez besoin d'une qualité sans perte que pour le web ou l'écran, [PDF vers PNG](./pdf-to-png) est un meilleur choix.
- Vérifiez le contenu du ZIP si certaines pages ont nécessité le repli sur PNG : vous voudrez peut-être les convertir séparément.

## Outils associés

- [PDF vers PNG](./pdf-to-png)
- [PDF vers BMP](./pdf-to-bmp)
- [PDF vers JPG](./pdf-to-jpg)
