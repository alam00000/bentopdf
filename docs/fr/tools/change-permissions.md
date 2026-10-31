---
title: Modifier les autorisations
description: Définissez ou modifiez les autorisations d'utilisation d'un PDF pour l'impression, la copie, la modification et l'annotation. Utilise le chiffrement AES 256 bits.
---

# Modifier les autorisations

Réglez précisément ce que les destinataires peuvent faire avec votre PDF. Contrairement au chiffrement basique qui verrouille simplement le fichier derrière un mot de passe, cet outil vous permet d'autoriser ou d'interdire sélectivement l'impression, la copie, la modification, l'annotation, le remplissage de formulaires, l'assemblage de documents et l'extraction de pages, le tout appliqué par un chiffrement AES 256 bits.

## Fonctionnement

1. Importez un fichier PDF.
2. Si le PDF est déjà chiffré, saisissez le **Mot de passe actuel**.
3. Définissez un **Nouveau mot de passe utilisateur** (requis pour ouvrir) et/ou un **Nouveau mot de passe propriétaire** (contrôle les autorisations).
4. Activez ou désactivez chaque autorisation avec les cases à cocher.
5. Cliquez sur **Modifier les autorisations**.
6. Téléchargez le PDF mis à jour.

Si vous laissez vides les deux champs de nouveau mot de passe, l'outil déchiffre entièrement le PDF et supprime tout chiffrement et toute restriction.

## Contrôles des autorisations

| Autorisation                                | Ce qu'elle contrôle                                              |
| ------------------------------------------- | ---------------------------------------------------------------- |
| **Autoriser l'impression**                  | Si le document peut être imprimé                                 |
| **Autoriser la copie**                      | Si le texte et les images peuvent être sélectionnés et copiés    |
| **Autoriser la modification**               | Si le contenu du document peut être modifié                      |
| **Autoriser l'annotation**                  | Si des commentaires, surlignages et tampons peuvent être ajoutés |
| **Autoriser le remplissage de formulaires** | Si les champs de formulaire interactifs peuvent être remplis     |
| **Autoriser l'assemblage du document**      | Si des pages peuvent être insérées, supprimées ou pivotées       |
| **Autoriser l'extraction de pages**         | Si des pages individuelles peuvent être extraites                |

Toutes les autorisations nécessitent un mot de passe propriétaire pour être appliquées. Sans mot de passe propriétaire, les indicateurs d'autorisation sont ignorés par la plupart des lecteurs PDF.

## Comment fonctionnent les autorisations dans un PDF

Les autorisations PDF font partie de la spécification de chiffrement. Elles sont stockées sous forme d'indicateurs binaires dans le dictionnaire de chiffrement et appliquées par les lecteurs PDF conformes. La distinction essentielle :

- **Mot de passe utilisateur** : requis pour ouvrir le fichier.
- **Mot de passe propriétaire** : requis pour modifier les autorisations ou lever les restrictions. Sans lui, les indicateurs d'autorisation déterminent les opérations que l'utilisateur peut effectuer.

Si vous ne définissez qu'un mot de passe propriétaire (sans mot de passe utilisateur), tout le monde peut ouvrir le fichier, mais sera limité aux opérations autorisées. Si vous définissez les deux, le fichier exige un mot de passe pour être ouvert et reste restreint après l'authentification.

## Cas d'usage

- Distribuer un rapport qui peut être consulté et imprimé, mais pas modifié ni copié
- Partager un modèle de contrat que les destinataires peuvent remplir sans le modifier
- Publier un catalogue PDF dont la copie des images est désactivée
- Autoriser l'annotation d'un brouillon en relecture tout en empêchant les changements de structure

## Conseils

- Pour être efficace, définissez toujours un mot de passe propriétaire. Les autorisations sans mot de passe propriétaire ne peuvent pas être appliquées.
- Certains outils PDF tiers ignorent les indicateurs d'autorisation. Pour une protection plus solide, envisagez de rastériser le PDF ou d'utiliser un DRM.
- Utilisez cet outil pour faire passer d'anciens PDF chiffrés en RC4 à l'AES 256.

## Outils associés

- [Protéger un PDF](./protect-pdf) : protection simple par mot de passe, sans autorisations détaillées
- [Déverrouiller un PDF](./unlock-pdf) : supprime entièrement le chiffrement
- [Supprimer les restrictions](./remove-restrictions) : retire toutes les restrictions lorsque vous avez le mot de passe propriétaire
