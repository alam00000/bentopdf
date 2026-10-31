---
title: Déverrouiller un PDF
description: Supprimez la protection par mot de passe des PDF chiffrés. Prend en charge le déchiffrement par lots avec un seul mot de passe pour plusieurs fichiers.
---

# Déverrouiller un PDF

Si vous avez le mot de passe d'un PDF chiffré, cet outil supprime entièrement le chiffrement et produit une copie déverrouillée que tout le monde peut ouvrir sans identifiants. Il prend en charge le déchiffrement par lots lorsque plusieurs PDF partagent le même mot de passe.

## Fonctionnement

1. Importez un ou plusieurs fichiers PDF chiffrés.
2. Saisissez le **mot de passe** utilisé pour protéger les fichiers.
3. Cliquez sur **Déverrouiller un PDF**.
4. Un fichier unique est téléchargé directement. Plusieurs fichiers produisent une archive ZIP contenant tous les PDF déverrouillés.

## Fonctionnalités

- Déchiffrement d'un seul fichier ou par lots
- Gère les mots de passe utilisateur et les mots de passe propriétaire
- Produit un fichier de sortie totalement non chiffré, sans restriction résiduelle
- Messages d'erreur clairs en cas de mot de passe incorrect ou de fichier corrompu
- Suivi du succès ou de l'échec fichier par fichier en mode lot

## Différence avec Supprimer les restrictions

**Déverrouiller un PDF** exige le mot de passe et supprime tout le chiffrement. **Supprimer les restrictions** cible les restrictions d'usage (impression, copie, modification) et peut ne pas demander de mot de passe si seul un mot de passe propriétaire a été défini. Utilisez Déverrouiller lorsque le PDF ne s'ouvre pas du tout sans mot de passe.

## Cas d'usage

- Déverrouiller définitivement des PDF que vous avez chiffrés auparavant lorsque le mot de passe n'est plus nécessaire
- Supprimer le chiffrement d'un lot de documents archivés pour faciliter l'accès à long terme
- Préparer des PDF protégés par mot de passe pour un système de gestion documentaire qui ne prend pas en charge les fichiers chiffrés
- Déverrouiller des PDF avant de les fusionner avec d'autres documents (de nombreux outils de fusion ne savent pas traiter des fichiers chiffrés)

## Conseils

- Le champ du mot de passe s'applique à tous les fichiers importés. Si vos PDF ont des mots de passe différents, traitez-les par lots séparés.
- Si vous obtenez l'erreur « Mot de passe incorrect », vérifiez qu'il n'y a pas d'espaces à la fin et que le verrouillage des majuscules est désactivé.
- Après le déchiffrement, le fichier n'a plus aucune protection. Rechiffrez-le avec Protéger un PDF si vous devez appliquer un nouveau mot de passe.

## Outils associés

- [Protéger un PDF](./protect-pdf) : appliquer à nouveau un chiffrement avec un nouveau mot de passe
- [Supprimer les restrictions](./remove-restrictions) : supprimer les restrictions d'usage sans déchiffrement complet
- [Modifier les autorisations](./change-permissions) : modifier des autorisations précises sur un PDF chiffré
