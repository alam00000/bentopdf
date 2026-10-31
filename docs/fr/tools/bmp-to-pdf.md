---
title: BMP vers PDF
description: Convertissez des images bitmap BMP au format PDF directement dans votre navigateur, sans aucun envoi vers un serveur.
---

# BMP vers PDF

Convertissez des fichiers Windows Bitmap (BMP) en PDF. Le BMP est un format d'image non compressé que l'on trouve encore dans les systèmes anciens, l'imagerie médicale et les scanners industriels. Cet outil les convertit en PDF sans rien installer.

## Formats pris en charge

| Format | Extensions |
| :----- | :--------- |
| BMP    | `.bmp`     |

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez vos fichiers BMP.
2. Vérifiez la liste des fichiers. Ajoutez-en d'autres ou retirez ceux dont vous n'avez pas besoin.
3. Cliquez sur **Convertir en PDF**. Le résultat est téléchargé sous le nom `from_bmps.pdf`.

Chaque BMP est dessiné sur un canvas, exporté en PNG, puis intégré au PDF avec pdf-lib. La taille de la page correspond aux dimensions de l'image d'origine.

## Options

Cet outil n'expose pas de réglages de qualité supplémentaires. Les images sont intégrées à leur résolution d'origine, en PNG sans perte, dans le PDF.

## Cas d'usage

- Convertir en PDF d'archivage des documents numérisés anciens stockés en BMP
- Transformer des captures d'écran BMP d'anciennes applications Windows en documents partageables
- Traiter les sorties de scanners médicaux ou industriels qui produisent du BMP par défaut
- Migrer d'anciennes archives d'images vers un format plus portable

## Astuces

- Les fichiers BMP ne sont pas compressés et sont donc souvent volumineux. Le PDF obtenu sera nettement plus léger, car les images sont réencodées en PNG en interne.
- Si vous avez des fichiers BMP à côté d'autres formats d'image, utilisez l'outil [Images vers PDF](./image-to-pdf) pour tout convertir en un seul lot.

## Outils associés

- [Images vers PDF](./image-to-pdf)
- [PNG vers PDF](./png-to-pdf)
- [TIFF vers PDF](./tiff-to-pdf)
