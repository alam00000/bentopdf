---
title: Supprimer les pages blanches
description: Détectez et supprimez automatiquement les pages blanches ou presque blanches de votre PDF grâce à une sensibilité réglable.
---

# Supprimer les pages blanches

Analysez votre PDF pour repérer les pages blanches ou presque blanches et les supprimer automatiquement. L'outil restitue chaque page et analyse ses pixels pour déterminer si elle est blanche, puis vous laisse confirmer les pages à supprimer avant le traitement.

## Fonctionnement

1. Importez votre fichier PDF.
2. Ajustez le curseur **Sensibilité** pour définir la rigueur avec laquelle une page est considérée comme « blanche ».
3. Cliquez sur **Détecter les pages blanches** pour analyser le document.
4. L'outil affiche des miniatures des pages blanches détectées pour que vous puissiez les vérifier.
5. Confirmez la sélection et téléchargez le PDF nettoyé, sans les pages blanches.

## Options

- **Sensibilité** : un curseur de 0 % à 100 % (80 % par défaut). Des valeurs élevées sont plus strictes et ne signalent que les pages totalement ou presque blanches. Des valeurs basses sont plus permissives et détectent aussi les pages au contenu minimal, comme un simple point ou un filigrane discret.

## Fonctionnalités

- Analyse au niveau du pixel de chaque page pour détecter le contenu vide
- Curseur de sensibilité réglable pour affiner la détection
- Aperçu en miniatures des pages blanches détectées pour une vérification manuelle
- Préserve exactement toutes les pages non blanches
- Gère les documents de toute taille ou de tout nombre de pages
- Indication de progression pendant l'analyse

## Cas d'usage

- Nettoyer des documents numérisés dont le scanner a capturé les versos vides d'originaux recto seul
- Retirer les pages de séparation de lots de documents numérisés en masse
- Supprimer les pages blanches insérées par des systèmes de gestion de documents
- Nettoyer des PDF exportés depuis des traitements de texte qui ajoutent parfois des pages blanches à la fin
- Réduire la taille du fichier en supprimant les pages vides inutiles

## Conseils

- Commencez avec la sensibilité par défaut de 80 % et ajustez ensuite. Si l'outil rate des pages qui vous semblent blanches, baissez la sensibilité. S'il signale des pages au contenu léger que vous voulez garder, augmentez-la.
- L'outil restitue chaque page pour analyser son contenu : le temps de traitement augmente donc avec le nombre de pages. Pour de très gros documents, prévoyez une courte attente.
- Vérifiez les pages blanches détectées dans l'aperçu en miniatures avant de confirmer la suppression. Les pages avec des en-têtes, pieds de page ou filigranes discrets peuvent être signalées selon la sensibilité.

## Outils associés

- [Rogner un PDF](./crop-pdf)
- [Éditeur PDF](./edit-pdf)
- [Numéros de page](./page-numbers)
