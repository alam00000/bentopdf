---
title: Supprimer les métadonnées
description: 'Supprimez toutes les métadonnées cachées des fichiers PDF : auteur, titre, date de création, producteur, données XMP et identifiants de document.'
---

# Supprimer les métadonnées

Chaque PDF porte des métadonnées qui peuvent révéler qui l'a créé, quel logiciel a été utilisé, quand il a été modifié pour la dernière fois, et plus encore. Cet outil supprime tout : le dictionnaire d'informations, les flux de métadonnées XMP, les identifiants de document et les données propres aux applications, pour obtenir un document propre qui ne garde aucune trace de son origine.

## Fonctionnement

1. Importez un fichier PDF.
2. Cliquez sur **Supprimer les métadonnées**.
3. Téléchargez le fichier nettoyé.

Aucune option à configurer. L'outil est volontairement exhaustif : il efface tout.

## Ce qui est supprimé

- **Champs du dictionnaire d'informations** : titre, auteur, sujet, mots-clés, créateur, producteur, date de création, date de modification
- **Flux de métadonnées XMP** : le bloc de métadonnées XML stocké dans le catalogue du document
- **Identifiants de document** : identifiants uniques dans le trailer du PDF, qui peuvent servir à suivre un document d'un système à l'autre
- **PieceInfo** : métadonnées propres aux applications, ajoutées par des programmes comme Illustrator ou InDesign

## Ce qui est conservé

- Tout le contenu visible des pages (texte, images, graphiques)
- Les champs de formulaire et les annotations
- Les signets et les liens
- La structure du document elle-même

## Cas d'usage

- Retirer votre nom et votre organisation d'un document avant de le publier anonymement
- Supprimer les horodatages de création qui révèlent quand un document a été préparé
- Nettoyer les chaînes de producteur qui identifient votre pile logicielle PDF
- Préparer des documents pour des dépôts réglementaires qui exigent des PDF sans métadonnées
- Effacer les traces d'historique de modification avant de partager un document à l'extérieur

## Conseils

- Utilisez d'abord l'outil Afficher les métadonnées pour voir exactement ce que contient votre PDF avant de les supprimer.
- Si vous devez supprimer les métadonnées _et_ le JavaScript, les annotations et les fichiers intégrés, utilisez Nettoyer un PDF pour un nettoyage plus complet.
- La suppression des métadonnées est définitive. Conservez votre original si vous pourriez avoir besoin de ces données plus tard.

## Outils associés

- [Nettoyer un PDF](./sanitize-pdf) : supprimer les métadonnées, mais aussi les scripts, les pièces jointes et plus encore
- [Protéger un PDF](./protect-pdf) : protéger le PDF nettoyé par un mot de passe
- [Compresser un PDF](./compress-pdf) : la suppression des métadonnées peut réduire légèrement la taille du fichier, la compression permet d'économiser davantage
