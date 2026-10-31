---
title: HEIC vers PDF
description: Convertissez des images HEIC et HEIF d'iPhone et d'iPad en PDF directement dans votre navigateur.
---

# HEIC vers PDF

Convertissez des images HEIC/HEIF en PDF. Le HEIC est le format de photo par défaut des iPhone et iPad depuis iOS 11. Cet outil vous permet de transformer ces photos en PDF sans installer de logiciel ni envoyer de fichiers vers un serveur.

## Formats pris en charge

| Format | Extensions |
| :----- | :--------- |
| HEIC   | `.heic`    |
| HEIF   | `.heif`    |

## Fonctionnement

1. Cliquez sur la zone d'envoi ou glissez-déposez vos fichiers HEIC/HEIF.
2. Vérifiez la liste des fichiers et retirez ceux dont vous ne voulez pas.
3. Cliquez sur **Convertir en PDF**. Le résultat est téléchargé sous le nom `from_heic.pdf`.

Chaque fichier HEIC est décodé avec la bibliothèque heic2any, qui le convertit en PNG avec une qualité de 92 %. Le PNG est ensuite intégré au PDF avec pdf-lib, chaque image occupant sa propre page en pleine résolution.

## Options

Cet outil n'expose aucun réglage supplémentaire. Les images HEIC sont converties en PNG en haute qualité (0,92) avant l'intégration.

## Cas d'usage

- Créer un PDF à partir de photos d'iPhone à joindre à une déclaration de sinistre ou à un rapport
- Convertir des photos HEIC pour une annonce immobilière en un seul document imprimable
- Transformer des captures d'écran d'iPad (format HEIF) en PDF partageable
- Convertir par lots des photos de vacances pour un carnet de voyage

## Astuces

- Le décodage HEIC s'effectue entièrement dans le navigateur avec WebAssembly. La première conversion peut prendre un moment, le temps de charger le décodeur.
- Si vous devez mélanger du HEIC avec d'autres formats d'image (JPG, PNG, etc.), utilisez l'outil [Images vers PDF](./image-to-pdf), qui gère le HEIC avec tous les autres formats.
- Les fichiers HEIC des iPhone contiennent souvent des données EXIF, notamment des coordonnées GPS. Le PDF produit ne conserve pas ces métadonnées.

## Outils associés

- [Images vers PDF](./image-to-pdf)
- [JPG vers PDF](./jpg-to-pdf)
- [PNG vers PDF](./png-to-pdf)
