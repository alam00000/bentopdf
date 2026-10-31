---
title: Supprimer les restrictions
description: Retirez la protection par mot de passe, les restrictions d'impression, les verrous de modification et les limites de copie des fichiers PDF.
---

# Supprimer les restrictions

Un PDF peut porter deux types de mots de passe : un mot de passe utilisateur (nécessaire pour ouvrir le fichier) et un mot de passe propriétaire (qui contrôle ce que vous pouvez en faire). Cet outil supprime les deux, ainsi que toutes les restrictions associées : verrous d'impression, de modification, de copie et d'annotation.

## Fonctionnement

1. Importez un fichier PDF.
2. Si le PDF a un mot de passe propriétaire, saisissez-le dans le champ **Mot de passe propriétaire**. Laissez-le vide si le PDF n'a que des restrictions d'usage sans mot de passe.
3. Cliquez sur **Supprimer les restrictions**.
4. Téléchargez le PDF sans restrictions.

L'outil utilise les options `--decrypt` et `--remove-restrictions` de QPDF pour produire une copie propre et sans restrictions.

## Ce qui est supprimé

- La protection par mot de passe (utilisateur et propriétaire)
- Les restrictions d'impression
- Les restrictions de modification
- Les restrictions de copie du texte et des images
- Les restrictions d'annotation et de commentaire
- Toutes les autres limitations de sécurité encodées dans le PDF

## Cas d'usage

- Déverrouiller un PDF qui vous appartient mais dont vous avez défini le mot de passe il y a des années
- Retirer les restrictions d'impression d'un document auquel vous avez légitimement accès
- Activer le copier-coller sur des documents de référence pour la prise de notes
- Préparer des PDF pour des outils d'accessibilité qui ne gèrent pas les documents restreints

## Conseils

- Vous devez connaître le mot de passe propriétaire s'il y en a un. Cet outil ne casse pas et ne devine pas les mots de passe par force brute.
- Si vous voulez garder le fichier chiffré tout en modifiant certaines autorisations, utilisez plutôt l'outil Modifier les autorisations.
- Le fichier de sortie n'a aucun chiffrement : toute personne qui le reçoit peut l'ouvrir librement.

## Outils associés

- [Déchiffrer un PDF](./unlock-pdf) : déverrouiller un PDF quand vous connaissez le mot de passe utilisateur
- [Protéger un PDF](./protect-pdf) : réappliquer un chiffrement avec de nouveaux réglages
- [Modifier les autorisations](./change-permissions) : modifier de façon sélective les actions autorisées
