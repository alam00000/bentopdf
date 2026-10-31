---
title: Aplatir le PDF
description: Aplatissez les formulaires interactifs et les annotations en contenu statique. Rend les champs non modifiables et intègre les annotations à la page.
---

# Aplatir le PDF

L'aplatissement fusionne les éléments interactifs (champs de formulaire, listes déroulantes, cases à cocher, annotations, surlignages, notes) directement dans le contenu de la page. L'apparence visuelle reste identique, mais plus rien n'est modifiable ni extractible. C'est l'équivalent PDF d'imprimer un formulaire rempli puis de le numériser, sauf que la qualité reste parfaite.

## Fonctionnement

1. Envoyez un ou plusieurs fichiers PDF.
2. Cliquez sur **Aplatir le PDF**.
3. Un seul fichier est téléchargé directement. Plusieurs fichiers produisent une archive ZIP.

L'outil utilise pdf-lib pour aplatir les champs de formulaire (via `form.flatten()`) et un aplatisseur d'annotations dédié pour intégrer les annotations au flux de la page. Les deux opérations s'effectuent en une seule passe.

## Ce qui est aplati

- **Champs de formulaire** : saisies de texte, cases à cocher, boutons radio, listes déroulantes, champs de signature
- **Annotations** : commentaires, surlignages, texte barré, soulignements, notes, tampons, annotations manuscrites
- **Éléments interactifs** : boutons, déclencheurs d'actions

## Ce qui reste inchangé

- Le contenu textuel (reste sélectionnable et consultable)
- Les images et les graphiques
- La mise en page et les dimensions
- Les signets et la table des matières
- Les liens hypertextes (sauf ceux basés sur des annotations)

## Cas d'usage

- Verrouiller un formulaire rempli pour que les destinataires ne puissent pas modifier les réponses soumises
- Préparer un PDF pour l'archivage lorsque les éléments interactifs sont inutiles
- Corriger des problèmes d'affichage causés par des annotations rendues différemment selon les lecteurs
- S'assurer qu'un document signé ne peut plus être modifié après l'application de la signature
- Réduire la taille du fichier en éliminant les définitions de champs et les objets d'annotation

## Astuces

- Aplatissez une fois toutes les modifications terminées. Il n'est pas possible d'annuler l'aplatissement d'un PDF.
- Si vous devez aplatir et aussi supprimer les métadonnées, le JavaScript et les pièces jointes, utilisez plutôt l'outil Nettoyer un PDF, qui inclut l'aplatissement parmi ses options.
- Certains PDF affichent « aucun formulaire trouvé » : c'est normal si le document ne contient que des annotations et aucun champ de formulaire.

## Outils associés

- [Nettoyer un PDF](./sanitize-pdf) : aplatit les formulaires et supprime les métadonnées, les scripts, etc.
- [Rastériser le PDF](./rasterize-pdf) : convertit en PDF basé sur des images pour un aplatissement maximal
- [Polices en contours](./font-to-outline) : convertit les polices en tracés vectoriels
- [Protéger un PDF](./protect-pdf) : protégez le PDF aplati par un mot de passe
