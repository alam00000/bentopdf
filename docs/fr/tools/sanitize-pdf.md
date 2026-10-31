---
title: Nettoyer un PDF
description: 'Supprimez le contenu masqué et potentiellement dangereux des PDF : métadonnées, JavaScript, fichiers intégrés, annotations et calques.'
---

# Nettoyer un PDF

Un PDF peut contenir bien plus que ce que vous voyez à l'écran. Des métadonnées cachées, du JavaScript intégré, des pièces jointes, des données de formulaire et des informations de calques peuvent divulguer des données sensibles ou présenter des risques de sécurité. Le nettoyage supprime tout cela et vous laisse un document propre, sûr à partager publiquement.

## Fonctionnement

1. Importez un fichier PDF.
2. Sélectionnez dans la liste les éléments à supprimer.
3. Cliquez sur **Nettoyer le PDF**.
4. Téléchargez le fichier nettoyé.

## Options de nettoyage

Toutes les options sont activées par défaut. Décochez celles que vous voulez conserver.

| Option                              | Ce qu'elle supprime                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| **Aplatir les formulaires**         | Convertit les champs de formulaire interactifs en contenu statique               |
| **Supprimer les métadonnées**       | Supprime l'auteur, le titre, la date de création, le logiciel et les données XMP |
| **Supprimer les annotations**       | Supprime les commentaires, surlignages, notes autocollantes et marquages         |
| **Supprimer le JavaScript**         | Élimine les scripts intégrés qui pourraient s'exécuter à l'ouverture             |
| **Supprimer les fichiers intégrés** | Supprime les pièces jointes intégrées au PDF                                     |
| **Supprimer les calques (OCG)**     | Aplatit les groupes de contenu optionnel en un seul calque                       |
| **Supprimer les liens**             | Supprime les hyperliens et les références d'URL                                  |
| **Supprimer l'arbre de structure**  | Retire la structure du document utilisée pour le balisage d'accessibilité        |
| **Supprimer MarkInfo**              | Supprime les informations de contenu balisé                                      |
| **Supprimer les polices**           | Retire les données de polices intégrées (à utiliser avec prudence)               |

## Cas d'usage

- Préparer un PDF pour une diffusion publique en supprimant les métadonnées internes (noms d'auteurs, versions de logiciels, historique de modification)
- Retirer le JavaScript d'un PDF reçu d'une source non fiable avant de l'ouvrir
- Nettoyer un PDF avant de l'envoyer à un client qui ne doit pas voir les commentaires intégrés ou les noms de champs de formulaire
- Supprimer les calques masqués d'un plan d'architecte avant de partager la version finale
- Respecter les exigences de minimisation des données des réglementations sur la vie privée

## Conseils

- Laissez « Supprimer les polices » décoché sauf si vous êtes certain que le PDF s'affichera correctement. Supprimer les polices peut rendre le texte invisible dans certains lecteurs.
- Si vous avez seulement besoin de supprimer les métadonnées, l'outil dédié Supprimer les métadonnées est plus rapide et plus ciblé.
- Le nettoyage est irréversible. Conservez votre fichier d'origine.

## Outils associés

- [Supprimer les métadonnées](./remove-metadata) : supprimer uniquement les métadonnées sans toucher au reste du contenu
- [Aplatir le PDF](./flatten-pdf) : aplatir spécifiquement les formulaires et les annotations
- [Protéger un PDF](./protect-pdf) : ajouter une protection par mot de passe après le nettoyage
- [Rastériser le PDF](./rasterize-pdf) : l'option radicale, convertir en images pour éliminer tout contenu masqué
