---
title: WebP vers PDF
description: Convertissez des images WebP au format PDF directement dans votre navigateur, avec une qualité de compression réglable.
---

# WebP vers PDF

Convertissez le format d'image WebP de Google en PDF. C'est particulièrement utile lorsque vous avez téléchargé depuis le web des images au format WebP et que vous en avez besoin dans un format plus universellement accepté pour l'impression ou le partage.

## Formats pris en charge

| Format | Extensions |
| :----- | :--------- |
| WebP   | `.webp`    |

## Fonctionnement

1. Cliquez sur la zone d'importation ou glissez-déposez vos fichiers WebP.
2. Vérifiez la liste des fichiers et supprimez ceux dont vous n'avez pas besoin.
3. Sélectionnez un niveau de **qualité PDF**.
4. Cliquez sur **Convertir en PDF**. Le résultat est téléchargé sous le nom `from_webps.pdf`.

En interne, chaque image WebP est décodée via l'API canvas du navigateur, puis intégrée au PDF avec pdf-lib. La conversion fonctionne donc sur tout navigateur qui prend en charge le décodage WebP (tous les navigateurs modernes).

## Options

**Qualité PDF** contrôle la compression lors de l'intégration des images :

- **Haute qualité** : conserve le plus de détails.
- **Qualité moyenne** (par défaut) : résultat équilibré.
- **Basse qualité** : taille de fichier la plus petite.

## Cas d'usage

- Convertir en PDF imprimable des images téléchargées sur le web et enregistrées en WebP
- Regrouper dans une documentation des captures d'écran WebP issues de Chrome ou Edge
- Créer un portfolio PDF à partir d'images exportées par des outils de design qui utilisent WebP par défaut
- Archiver des images WebP dans un format lisible plus universellement

## Conseils

- Le WebP est décodé en PNG en interne avant l'intégration au PDF : les images WebP sans perte conservent donc leur qualité avec le réglage Haute qualité.
- Si vous avez un mélange de WebP et d'autres formats d'image, utilisez plutôt l'outil [Images vers PDF](./image-to-pdf), qui accepte tout en une seule fois.

## Outils associés

- [Images vers PDF](./image-to-pdf)
- [PNG vers PDF](./png-to-pdf)
- [JPG vers PDF](./jpg-to-pdf)
