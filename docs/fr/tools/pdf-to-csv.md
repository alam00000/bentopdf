---
title: PDF vers CSV
description: Extrayez les tableaux de documents PDF et exportez-les dans un seul fichier CSV. Gère les PDF de plusieurs pages avec détection automatique des tableaux.
---

# PDF vers CSV

Extrait les tableaux d'un PDF et les exporte dans un fichier CSV. L'outil analyse chaque page à la recherche de données tabulaires avec le moteur de détection de tableaux de PyMuPDF, puis écrit toutes les lignes trouvées dans une seule sortie séparée par des virgules.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Cliquez sur **Convertir** pour lancer l'extraction des tableaux.
3. L'outil analyse chaque page et identifie automatiquement les tableaux.
4. Un fichier `.csv` contenant toutes les données extraites est téléchargé.

Les tableaux de pages différentes sont séparés par des lignes vides dans la sortie. Les cellules contenant des virgules, des guillemets ou des retours à la ligne sont correctement échappées selon la RFC 4180.

## Options

Cet outil n'a aucune option configurable. Tous les tableaux trouvés dans le document sont extraits et combinés dans un seul CSV.

## Format de sortie

- Un seul fichier `filename.csv` contenant tous les tableaux détectés.

## Cas d'usage

- Récupérer des données financières de relevés bancaires ou de factures PDF dans un tableur.
- Extraire des tableaux de prix de devis fournisseurs pour les comparer.
- Convertir des données de recherche tabulaires issues d'articles PDF dans un format adapté aux outils d'analyse.
- Migrer les données de rapports PDF anciens vers des bases de données.

## Astuces

- Si aucun tableau n'est trouvé, l'outil affiche un message « Aucun tableau trouvé ». Cela signifie généralement que le PDF utilise une mise en page de texte qui ressemble à un tableau sans en être un réellement structuré.
- Pour un meilleur contrôle sur chaque tableau, utilisez [Extraire les tableaux](./extract-tables), qui permet de choisir entre les formats de sortie CSV, JSON et Markdown.
- Si vous avez besoin des données au format Excel avec une feuille distincte par tableau, utilisez [PDF vers Excel](./pdf-to-excel).

## Outils associés

- [PDF vers Excel](./pdf-to-excel)
- [Extraire les tableaux](./extract-tables)
- [PDF vers texte](./pdf-to-text)
