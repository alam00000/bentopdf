---
title: Calques OCG PDF
description: Affichez, activez, ajoutez et supprimez les calques OCG (Optional Content Group) d'un document PDF.
---

# Calques OCG PDF

Gérez les groupes de contenu facultatif (OCG), communément appelés « calques », d'un PDF. Vous pouvez activer ou masquer des calques, en ajouter de nouveaux (y compris des calques enfants imbriqués), en supprimer et enregistrer le PDF modifié.

## Fonctionnement

1. Envoyez un fichier PDF.
2. Cliquez sur le bouton de traitement pour charger le document avec le moteur PyMuPDF.
3. L'outil affiche tous les calques existants avec leur état de visibilité, leur statut de verrouillage et leur hiérarchie d'imbrication.
4. Cochez ou décochez les cases pour afficher ou masquer les calques. Les calques verrouillés ne peuvent pas être modifiés.
5. Ajoutez de nouveaux calques de premier niveau en saisissant un nom puis en cliquant sur le bouton d'ajout, ou ajoutez des calques enfants sous un parent existant.
6. Supprimez les calques dont vous n'avez plus besoin.
7. Cliquez sur **Enregistrer** pour télécharger le PDF modifié avec vos changements de calques.

## Fonctionnalités

- Affiche la hiérarchie des calques avec une indentation adaptée aux calques imbriqués
- Activation ou désactivation de la visibilité des calques
- Indicateur de verrouillage qui évite les modifications accidentelles
- Ajout de calques de premier niveau ou enfants avec des noms personnalisés
- Suppression de calques individuels
- Enregistrement de toutes les modifications dans un nouveau fichier PDF

## Cas d'usage

- Activer ou masquer des calques d'annotation dans des plans d'architecture ou d'ingénierie
- Ajouter de nouveaux calques d'annotation à un document de conception multicalque
- Retirer les calques obsolètes d'un modèle avant de le distribuer
- Inspecter les calques présents dans un PDF complexe reçu d'un tiers

## Astuces

- Si le PDF n'a aucun calque, l'outil affiche un état vide invitant à en ajouter un. Tous les PDF n'utilisent pas de calques OCG : ils sont surtout courants dans les exports CAO et les fichiers de conception.
- Les calques enfants sont indentés sous leur parent. Vous pouvez imbriquer les calques à n'importe quelle profondeur.
- Les calques verrouillés sont affichés avec une icône de cadenas et leurs cases sont désactivées. Ces verrous sont définis par le créateur du PDF.

## Outils associés

- [Afficher les métadonnées](./view-metadata)
- [Modifier les métadonnées](./edit-metadata)
- [Dupliquer et organiser](./organize-pdf)
