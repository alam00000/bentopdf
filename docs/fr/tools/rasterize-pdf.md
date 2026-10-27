---
title: Rastériser le PDF
description: Convertissez les pages d'un PDF en PDF composé d'images. Aplatissez tous les calques, supprimez le texte sélectionnable et contrôlez le DPI et le format d'image.
---

# Rastériser le PDF

La rastérisation convertit chaque page d'un PDF en image, puis réassemble ces images en PDF. Le résultat est identique à l'original à l'œil, mais ne contient ni texte sélectionnable, ni éléments interactifs, ni calques modifiables. C'est en quelque sorte une photocopie de haute qualité.

## Fonctionnement

1. Importez un ou plusieurs fichiers PDF.
2. Définissez le **DPI** (résolution) de la sortie rastérisée.
3. Choisissez un **format d'image** : PNG pour une qualité sans perte ou JPEG pour des fichiers plus légers.
4. Cochez éventuellement **Convertir en niveaux de gris**.
5. Cliquez sur **Rastériser le PDF**. Plusieurs fichiers sont téléchargés dans un ZIP.

## Options

| Réglage             | Valeurs                             | Par défaut |
| ------------------- | ----------------------------------- | ---------- |
| **DPI**             | 72, 150, 200, 300, 600              | 150        |
| **Format d'image**  | PNG (sans perte), JPEG (plus léger) | PNG        |
| **Niveaux de gris** | Oui/Non                             | Non        |

## Repères pour le DPI

- **72** : affichage à l'écran uniquement, taille de fichier minimale
- **150** : bon compromis pour un usage général
- **200** : texte plus net, taille de fichier modérée
- **300** : qualité d'impression
- **600** : archivage de haute qualité ou impression professionnelle

## Cas d'usage

- Empêcher l'extraction du texte de documents confidentiels avant de les partager
- Éliminer les problèmes de dépendance aux polices en convertissant le texte en pixels
- Créer une version « à plat » d'un PDF aux calques ou transparences complexes qui s'affiche différemment selon les lecteurs
- Préparer un PDF pour un système qui n'accepte que des entrées sous forme d'images
- Supprimer le contenu masqué (comme les modifications suivies ou les données de formulaire) en réduisant le PDF à de simples images

## Conseils

- 150 DPI en PNG est un bon réglage par défaut. N'augmentez que si vous avez besoin d'une sortie imprimée ou de zoomer sur de fins détails.
- Le JPEG produit des fichiers nettement plus légers, mais introduit des artefacts de compression sur les bords nets du texte.
- La rastérisation est irréversible : conservez votre PDF d'origine si vous pourriez avoir besoin de texte modifiable plus tard.

## Outils associés

- [Compresser un PDF](./compress-pdf) : réduire la taille du PDF rastérisé
- [Redresser un PDF](./deskew-pdf) : redresser les pages avant de rastériser des documents numérisés
- [Polices en contours](./font-to-outline) : convertir les polices en tracés vectoriels pour conserver l'échelle
- [Aplatir le PDF](./flatten-pdf) : aplatir les formulaires sans convertir en images
