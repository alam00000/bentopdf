---
title: Dimensions des pages
description: Analysez les formats, orientations, proportions et rotations des pages PDF. Détectez les documents à formats mixtes et exportez les données en CSV.
---

# Dimensions des pages

Un outil de diagnostic qui lit chaque page de votre PDF et indique ses dimensions exactes, son orientation, le nom de son format standard, ses proportions, sa surface et sa rotation. Utile pour repérer les pages de formats différents avant l'impression ou pour documenter les propriétés d'un PDF reçu.

## Fonctionnement

1. Envoyez un fichier PDF. L'analyse démarre automatiquement, sans bouton à cliquer.
2. Un panneau récapitulatif affiche le nombre total de pages, le nombre de formats uniques et indique si le document contient des formats mixtes.
3. Parcourez le tableau complet des résultats avec le détail de chaque page.
4. Changez l'unité d'affichage : points, pouces, millimètres ou pixels.
5. Cliquez sur **Exporter en CSV** pour enregistrer les données.

## Champs indiqués

| Colonne         | Description                                              |
| --------------- | -------------------------------------------------------- |
| N° de page      | Numéro de page séquentiel                                |
| Dimensions      | Largeur x Hauteur dans l'unité choisie                   |
| Format standard | Nom correspondant (A4, Letter, etc.) ou « Personnalisé » |
| Orientation     | Portrait ou Paysage                                      |
| Proportions     | Rapport largeur/hauteur sous forme décimale              |
| Surface         | Surface de la page dans l'unité choisie, au carré        |
| Rotation        | Rotation de la page en degrés                            |

## Fonctionnalités

- Détection automatique des formats de papier standard (A3, A4, A5, Letter, Legal, Tabloid, etc.)
- Avertissement de formats mixtes avec le détail des formats présents et du nombre de pages pour chacun
- Conversion d'unités entre points, pouces, millimètres et pixels (à 96 PPI)
- Exportation au format CSV pour une utilisation dans des tableurs ou des systèmes de documentation

## Cas d'usage

- Vérifier que toutes les pages sont en A4 avant d'envoyer un document à un imprimeur
- Comprendre pourquoi un PDF fusionné s'imprime avec des marges inattendues sur certaines pages
- Documenter la mise en page d'une grande archive PDF pour des fiches de métadonnées
- Repérer les pages pivotées qui nécessitent une correction

## Astuces

- Si le récapitulatif indique « Formats mixtes », utilisez l'outil Uniformiser la taille des pages pour standardiser avant l'impression.
- Le champ de rotation aide à repérer les pages qui s'affichent correctement mais ont un attribut de rotation non nul, ce qui peut poser problème dans certains flux de travail.

## Outils associés

- [Uniformiser la taille des pages](./fix-page-size) : standardiser les pages après avoir repéré des formats mixtes
- [Compresser un PDF](./compress-pdf) : optimiser le PDF après avoir corrigé les pages
- [Faire pivoter un PDF](./rotate-pdf) : corriger les pages pivotées
