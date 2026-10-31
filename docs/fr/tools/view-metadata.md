---
title: Afficher les métadonnées
description: Inspectez toutes les propriétés de métadonnées d'un PDF, y compris les informations du document, les données XMP et les détails structurels.
---

# Afficher les métadonnées

Examinez les propriétés cachées intégrées à un fichier PDF. L'outil affiche sous une forme lisible les informations du document (titre, auteur, dates), les métadonnées XMP, les dimensions des pages et d'autres données structurelles.

## Fonctionnement

1. Importez un fichier PDF.
2. L'outil analyse immédiatement le fichier et affiche toutes les métadonnées disponibles dans des sections organisées.
3. Consultez le dictionnaire d'informations du document, l'arborescence des métadonnées XMP et les propriétés structurelles.
4. Aucune étape de traitement n'est nécessaire : les métadonnées s'affichent dès le chargement du fichier.

## Fonctionnalités

- Affiche les champs d'information standard du document : Titre, Auteur, Sujet, Mots-clés, Créateur, Producteur
- Présente les dates de création et de modification dans un format lisible
- Analyse et affiche l'arborescence XMP complète avec ses espaces de noms imbriqués
- Convertit le format de date PDF (`D:20240101120000Z`) en dates lisibles
- Organisé en sections repliables pour faciliter la navigation

## Sections de métadonnées

| Section                      | Contenu                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Informations du document** | Titre, Auteur, Sujet, Mots-clés, Créateur, Producteur, Date de création, Date de modification                   |
| **Métadonnées XMP**          | Arborescence complète de métadonnées au format XML, avec Dublin Core, XAP, PDF et espaces de noms personnalisés |
| **Propriétés du document**   | Nombre de pages, version PDF, taille du fichier, état du chiffrement                                            |

## Cas d'usage

- Vérifier qui est l'auteur d'un PDF et quand il a été modifié pour la dernière fois
- Vérifier que les métadonnées ont été correctement définies avant de publier un document
- Auditer des PDF du point de vue de la confidentialité en contrôlant les informations personnelles intégrées
- Identifier le logiciel utilisé pour créer ou modifier un PDF (via le champ Producteur)
- Examiner les métadonnées XMP pour la conformité de la gestion des actifs numériques

## Conseils

- Les chaînes de date PDF qui commencent par `D:` sont automatiquement converties au format de votre fuseau horaire local.
- Si des champs de métadonnées semblent vides, c'est que le créateur du PDF ne les a tout simplement pas renseignés. Tous les PDF ne contiennent pas de métadonnées riches.
- Pour modifier les métadonnées après les avoir inspectées, utilisez [Modifier les métadonnées](./edit-metadata). Pour les supprimer entièrement, utilisez Supprimer les métadonnées.

## Outils associés

- [Modifier les métadonnées](./edit-metadata)
- [Calques OCG du PDF](./pdf-layers)
- [Comparer des PDF](./compare-pdfs)
