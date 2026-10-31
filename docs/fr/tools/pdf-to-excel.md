---
title: PDF vers Excel
description: Extrayez les tableaux de documents PDF dans une feuille de calcul Excel. Chaque tableau a sa propre feuille avec une référence de page.
---

# PDF vers Excel

Extrait les tableaux d'un PDF et les enregistre dans une feuille de calcul Excel (`.xlsx`). Chaque tableau détecté est placé dans sa propre feuille, nommée d'après son numéro de tableau et sa page source. Propulsé par PyMuPDF pour la détection des tableaux et par la bibliothèque SheetJS pour la génération Excel.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Cliquez sur **Convertir** pour lancer l'extraction des tableaux.
3. L'outil analyse chaque page à la recherche de tableaux, puis construit un classeur Excel.
4. Un fichier `.xlsx` est téléchargé avec une feuille par tableau.

## Options

Cet outil n'a aucune option configurable. Tous les tableaux détectés sont extraits automatiquement.

## Format de sortie

- Un seul fichier `filename.xlsx`.
- **Un tableau** : une seule feuille nommée « Table ».
- **Plusieurs tableaux** : des feuilles nommées « Table 1 (Page 3) », « Table 2 (Page 5) », etc. Les noms de feuille sont tronqués à 31 caractères (la limite d'Excel).

## Cas d'usage

- Convertir des rapports financiers PDF en feuilles de calcul modifiables pour une analyse approfondie.
- Extraire des tableaux d'inventaire ou de commandes de PDF de fournisseurs.
- Récupérer des données structurées de formulaires ou de catalogues PDF dans Excel pour les trier et les filtrer.
- Archiver des données tabulaires PDF dans un format avec lequel des collègues non techniques peuvent travailler.

## Astuces

- Si l'outil indique « Aucun tableau trouvé », le PDF utilise probablement une mise en page de texte libre plutôt que des tableaux structurés. Essayez [PDF vers texte](./pdf-to-text) pour récupérer le contenu brut.
- Pour un format plat plus simple, utilisez [PDF vers CSV](./pdf-to-csv). Pour télécharger chaque tableau dans plusieurs formats, utilisez [Extraire les tableaux](./extract-tables).
- Consultez les noms des feuilles pour identifier la page d'origine de chaque tableau.

## Outils associés

- [PDF vers CSV](./pdf-to-csv)
- [Extraire les tableaux](./extract-tables)
- [PDF vers texte](./pdf-to-text)
