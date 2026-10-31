---
title: Numérotation Bates
description: Appliquez des numéros Bates à un ou plusieurs PDF avec des modèles personnalisables, du remplissage, des polices et un positionnement au choix.
---

# Numérotation Bates

La numérotation Bates appose des identifiants séquentiels sur chaque page de vos PDF. C'est la méthode standard pour étiqueter les documents dans les procédures judiciaires, les audits et les processus de conformité. Cet outil prend en charge plusieurs fichiers et des modèles personnalisables, et produit des PDF numérotés individuellement ou une seule archive ZIP.

## Fonctionnement

1. Importez un ou plusieurs fichiers PDF. Vous pouvez glisser plusieurs fichiers à la fois.
2. Choisissez un style prédéfini ou créez un modèle personnalisé.
3. Configurez la position, la police, la taille, la couleur et les numéros de départ.
4. Cliquez sur **Appliquer les numéros Bates** pour lancer le traitement.
5. Un fichier unique est téléchargé directement. Plusieurs fichiers sont téléchargés sous forme d'archive ZIP.

## Options

- **Style prédéfini** : choisissez parmi les formats intégrés :
  - Pièce + Dossier + Bates + Page (par exemple «Exhibit 1 Case XYZ 000001 Page 1»)
  - Pièce + Dossier + Bates (sans numéro de page)
  - Dossier + Bates
  - Numéro Bates uniquement (par exemple « 000001 »)
  - Personnalisé (écrivez votre propre modèle)
- **Personnaliser le style** : une chaîne de modèle utilisant des variables : `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Remplissage Bates** : nombre de chiffres (3 à 6) des numéros Bates complétés par des zéros. Visible uniquement en mode personnalisé.
- **Position** : en-tête ou pied de page, à gauche, au centre ou à droite.
- **Les numéros Bates commencent à** : le premier numéro Bates. 1 par défaut. La numérotation se poursuit d'un fichier à l'autre.
- **Le compteur de fichiers commence à** : le numéro de départ de la variable `[FILE]`.
- **Police** : Helvetica, Times New Roman ou Courier.
- **Taille de police** : taille du texte apposé.
- **Couleur** : sélecteur de couleur pour le texte du numéro Bates.

## Fonctionnalités

- Aperçu en direct montrant l'apparence des numéros Bates sur tous les fichiers importés
- Prise en charge de plusieurs fichiers avec numérotation continue entre les documents
- Réorganisation des fichiers par glisser-déposer pour contrôler la séquence de numérotation
- Six positions possibles (en-tête/pied de page, gauche/centre/droite)
- Calcul adaptatif des marges qui respecte les différents formats de page
- Sortie ZIP pour les lots de plusieurs fichiers
- Variables de modèle pour une flexibilité maximale

## Cas d'usage

- Numéroter des documents de communication de pièces dans un litige avec des numéros de pièces séquentiels
- Numéroter des dossiers de preuves d'audit répartis sur des dizaines de fichiers
- Appliquer des numéros de référence réglementaires à la documentation de conformité
- Étiqueter les pièces d'une demande de brevet avec des identifiants propres au dossier

## Astuces

- Faites glisser les fichiers dans la liste pour les réordonner avant le traitement. La séquence de numérotation Bates suit cet ordre.
- Utilisez la variable `[FILENAME]` pour inclure le nom du fichier d'origine dans le tampon, ce qui aide à retrouver la source des pages.
- La zone d'aperçu se met à jour en temps réel lorsque vous modifiez les réglages, ce qui vous permet de vérifier le format avant le traitement.

## Outils associés

- [Numéros de page](./page-numbers)
- [Ajouter des étiquettes de page](./add-page-labels)
- [En-tête et pied de page](./header-footer)
