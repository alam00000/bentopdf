---
title: PNG vers PDF
description: Convertissez une ou plusieurs images PNG en document PDF avec une qualité réglable, entièrement dans votre navigateur.
---

# PNG vers PDF

Convertissez des images PNG en PDF en préservant leur pleine résolution. Chaque PNG devient sa propre page, à la taille de l'image d'origine. La transparence est gérée automatiquement.

## Formats pris en charge

| Format | Extensions |
| :----- | :--------- |
| PNG    | `.png`     |

## Fonctionnement

1. Cliquez sur la zone d'envoi ou glissez-déposez des fichiers PNG. Vous pouvez en sélectionner plusieurs à la fois.
2. Gérez la liste des fichiers : retirez ceux dont vous n'avez pas besoin ou ajoutez-en d'autres.
3. Choisissez un niveau de **Qualité du PDF** dans la liste déroulante.
4. Cliquez sur **Convertir en PDF**. Le résultat est téléchargé sous le nom `from_jpgs.pdf`.

L'outil utilise pdf-lib pour intégrer chaque image directement. Si un PNG ne peut pas être intégré nativement (par exemple à cause d'un profil colorimétrique inhabituel), il est rendu à nouveau via un canevas au format JPEG.

## Options

**Qualité du PDF** contrôle la compression appliquée avant l'intégration :

- **Haute qualité** : compression minimale, taille de fichier maximale.
- **Qualité moyenne** (par défaut) : bon équilibre entre taille et netteté.
- **Basse qualité** : compression maximale, sortie la plus petite.

## Cas d'usage

- Convertir des captures d'écran en PDF de plusieurs pages pour des rapports de bug ou de la documentation
- Regrouper des exports de maquettes d'interface dans un seul fichier pour relecture
- Transformer des exports de diagrammes (draw.io, Excalidraw) en PDF partageable
- Assembler un ensemble d'images de graphiques en rapport

## Astuces

- Les fichiers PNG avec transparence reçoivent un fond blanc dans le PDF. Si vous avez besoin d'un autre fond, modifiez les images au préalable.
- Pour les captures d'écran et les schémas aux contours nets et au texte, la haute qualité évite les artefacts de compression JPEG. La qualité moyenne ou basse peut convertir en JPEG en interne.

## Outils associés

- [Images vers PDF](./image-to-pdf)
- [JPG vers PDF](./jpg-to-pdf)
- [SVG vers PDF](./svg-to-pdf)
