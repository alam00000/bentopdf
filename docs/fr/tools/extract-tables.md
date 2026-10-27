---
title: Extraire les tableaux PDF
description: Détectez et extrayez les tableaux de documents PDF. Exportez en CSV, JSON ou Markdown, tableau par tableau.
---

# Extraire les tableaux PDF

Détecte tous les tableaux d'un PDF et vous permet de les exporter au format de votre choix : CSV, JSON ou Markdown. Chaque tableau est extrait individuellement avec ses métadonnées de page et de position. Propulsé par le moteur de détection de tableaux de PyMuPDF.

## Fonctionnement

1. Importez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Sélectionnez votre **format d'export** préféré : CSV, JSON ou Markdown.
3. Cliquez sur **Extraire** pour lancer le traitement.
4. Si un seul tableau est trouvé, il est téléchargé sous forme d'un seul fichier. Plusieurs tableaux produisent une archive ZIP avec un fichier par tableau.

## Options

- **Format d'export** : choisissez entre :
  - **CSV** : valeurs séparées par des virgules, avec des guillemets appropriés pour les champs contenant des virgules, des guillemets ou des sauts de ligne. Convient aux tableurs et aux bases de données.
  - **JSON** : structure de tableaux de tableaux, mise en forme avec une indentation de 2 espaces. Convient à une exploitation par programme.
  - **Markdown** : format de tableau délimité par des barres verticales, produit par PyMuPDF. Convient à la documentation et aux fichiers README.

## Format de sortie

- **Un seul tableau** : `filename_table.csv` (ou `.json` / `.md`)
- **Plusieurs tableaux** : `filename_tables.zip` contenant des fichiers nommés `table_1_page3.csv`, `table_2_page5.csv`, etc.

## Cas d'usage

- Extraire des tableaux précis de longs rapports PDF sans récupérer les données de tout le document.
- Obtenir des tableaux au format Markdown à coller directement dans des tickets GitHub, des wikis ou de la documentation.
- Récupérer des données JSON structurées à partir de tableaux PDF pour des intégrations d'API ou des scripts.
- Comparer des tableaux entre différentes versions de PDF en exportant les deux en CSV et en comparant les différences.

## Conseils

- Cet outil vous donne un contrôle tableau par tableau. Si vous voulez simplement tous les tableaux dans un seul CSV, utilisez [PDF vers CSV](./pdf-to-csv). Pour un classeur Excel complet, utilisez [PDF vers Excel](./pdf-to-excel).
- Les tableaux qui s'étendent sur plusieurs pages peuvent être détectés comme des tableaux distincts par page. Vous devrez peut-être les concaténer manuellement.
- Si aucun tableau n'est détecté, le PDF est peut-être une image numérisée. Passez-le d'abord par l'OCR pour ajouter une couche de texte.

## Outils associés

- [PDF vers CSV](./pdf-to-csv)
- [PDF vers Excel](./pdf-to-excel)
- [PDF vers texte](./pdf-to-text)
