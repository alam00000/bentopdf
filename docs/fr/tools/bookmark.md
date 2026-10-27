---
title: Modifier les signets
description: Ajoutez, modifiez, importez, exportez et supprimez les signets d'un PDF avec un éditeur visuel et la prise en charge de CSV/JSON.
---

# Modifier les signets

L'éditeur de signets vous donne un contrôle total sur les signets de navigation d'un PDF (aussi appelés plan du document). Vous pouvez ajouter de nouveaux signets, modifier les existants, réorganiser la hiérarchie et importer ou exporter les données des signets aux formats CSV et JSON.

## Fonctionnement

1. Importez votre PDF en cliquant ou en glissant un fichier dans la zone de dépôt.
2. Cochez éventuellement **Extraire automatiquement les signets existants** pour récupérer l'arborescence de signets actuelle du document.
3. L'éditeur s'ouvre en vue partagée : visionneuse PDF à gauche, panneau des signets à droite.
4. Saisissez un titre de signet et cliquez sur **Ajouter à la page** pour créer un signet pointant vers la page actuelle.
5. Utilisez les boutons de la barre d'outils pour réorganiser, mettre en forme ou supprimer des signets.
6. Cliquez sur **Enregistrer le PDF avec les signets** pour télécharger le fichier mis à jour.

## Fonctionnalités

- Visionneuse PDF visuelle avec navigation entre les pages, commandes de zoom et saisie d'un numéro de page
- Ajout de signets sur n'importe quelle page en un clic
- Clic direct sur le PDF pour définir une destination précise du signet (mode sélection)
- Hiérarchie de signets imbriqués avec réorganisation par glisser-déposer
- Opérations par lots : sélectionnez plusieurs signets pour changer la couleur, le style ou les supprimer d'un coup
- Recherche de signets pour retrouver rapidement des entrées dans de grandes arborescences
- Annulation et rétablissement pour toutes les modifications
- Import de signets depuis des fichiers CSV (titre, page, niveau) ou JSON
- Export des signets en CSV ou JSON pour une modification externe
- Mise en forme des signets : couleur (rouge, bleu, vert, jaune, violet) et style de police (gras, italique, gras italique)
- Navigation rapide : parcourez les pages avec les touches Page précédente/suivante

## Options

- **Extraire automatiquement les signets existants** : lorsque cette option est cochée, l'outil lit et affiche les signets actuels du PDF au chargement.
- **Mode par lots** : activez-le pour sélectionner plusieurs signets et appliquer des changements de couleur, de style ou des suppressions en masse.
- **Tout développer/réduire** : affichez ou masquez rapidement les signets enfants imbriqués.

## Cas d'usage

- Ajouter une table des matières à un manuel ou un ouvrage qui n'a pas de signets
- Restructurer les signets d'un document numérisé après un traitement OCR
- Exporter les signets en CSV, les modifier dans un tableur, puis les réimporter
- Nettoyer des signets générés automatiquement dont les références de page sont incorrectes
- Ajouter des signets colorés pour repérer les sections importantes d'un mémoire juridique

## Conseils

- Utilisez l'import CSV pour créer des signets en masse. Le format est simple : `title,page,level`, où le niveau 1 correspond au premier niveau.
- Le mode sélection vous permet de cliquer sur un endroit précis de la page PDF pour définir la destination du signet, ce qui est plus précis que de cibler simplement un numéro de page.
- Exportez vos signets avant de faire des modifications importantes pour avoir une sauvegarde.

## Outils associés

- [Table des matières](./table-of-contents)
- [Éditeur PDF](./edit-pdf)
- [Ajouter des étiquettes de page](./add-page-labels)
