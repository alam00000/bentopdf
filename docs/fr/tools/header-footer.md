---
title: En-tête et pied de page
description: Ajoutez un texte d'en-tête et de pied de page personnalisable aux pages d'un PDF, avec des variables dynamiques de numéro de page.
---

# En-tête et pied de page

Ajoutez du texte à six emplacements sur les pages de votre PDF : en-tête à gauche, au centre et à droite, pied de page à gauche, au centre et à droite. L'outil prend en charge des variables dynamiques pour le numéro de page et le nombre total de pages, ce qui permet de créer des modèles comme « Page 3 sur 10 » mis à jour automatiquement pour chaque page.

## Fonctionnement

1. Envoyez votre fichier PDF.
2. Le panneau d'options apparaît avec les commandes de mise en forme et six champs de texte.
3. Saisissez le texte souhaité dans n'importe quel emplacement d'en-tête ou de pied de page.
4. Utilisez les marqueurs `{page}` et `{total}` pour une numérotation dynamique.
5. Ajustez la taille et la couleur de la police, et limitez éventuellement à une plage de pages.
6. Cliquez sur **Ajouter en-tête et pied de page** pour traiter et télécharger.

## Options

- **Plage de pages** : limitez éventuellement les pages qui reçoivent un en-tête et un pied de page. Laissez vide pour toutes les pages. Format : « 1-3, 5 » (plages séparées par des virgules).
- **Taille de police** : entre 6 et 24 points. 10 par défaut.
- **Couleur de police** : choisissez n'importe quelle couleur avec le sélecteur de couleur.
- **En-tête gauche / centre / droite** : champs de texte pour le haut de chaque page.
- **Pied de page gauche / centre / droite** : champs de texte pour le bas de chaque page.

## Fonctionnalités

- Six emplacements de texte indépendants par page
- Variable dynamique `{page}` qui insère le numéro de la page courante
- Variable dynamique `{total}` qui insère le nombre total de pages
- Filtrage par plage de pages pour cibler des pages précises
- Taille et couleur de police personnalisables
- Police Helvetica pour un rendu net et professionnel

## Cas d'usage

- Ajouter « Page {page} sur {total} » au centre du pied de page d'un rapport
- Placer le nom d'une entreprise en en-tête à gauche et la date du document en en-tête à droite
- Ajouter des mentions de confidentialité au pied de page de documents juridiques
- Apposer des numéros de révision sur des plages de pages précises

## Astuces

- Combinez `{page}` et `{total}` dans un même champ pour des formats comme « Page {page} sur {total} » ou « {page}/{total} ».
- Vous pouvez laisser la plupart des champs vides et ne remplir que les emplacements dont vous avez besoin. Les champs vides sont simplement ignorés.
- Pour des en-têtes plus complexes avec des images ou des logos, envisagez l'outil [Ajouter un filigrane](./add-watermark) positionné en haut de la page.

## Outils associés

- [Numéros de page](./page-numbers)
- [Ajouter un filigrane](./add-watermark)
- [Numérotation Bates](./bates-numbering)
