---
title: PDF vers texte
description: Extrayez le texte brut de fichiers PDF. Prend en charge l'extraction par lots de plusieurs PDF avec des fichiers TXT en sortie.
---

# PDF vers texte

Extrait tout le contenu textuel de fichiers PDF et l'enregistre dans des fichiers `.txt` bruts. Prend en charge le traitement par lots : envoyez plusieurs PDF et obtenez le texte de chacun en une seule opération. Propulsé par PyMuPDF.

## Fonctionnement

1. Envoyez un ou plusieurs PDF en cliquant sur la zone de dépôt ou en y glissant des fichiers. Gérez votre liste de fichiers avec les boutons Ajouter et Effacer.
2. Cliquez sur **Extraire** pour lancer le traitement.
3. Un seul fichier est téléchargé sous la forme `filename.txt`. Plusieurs fichiers produisent une archive `pdf-to-text.zip`.

## Options

Cet outil n'a aucune option configurable. Tout le contenu textuel de chaque page est extrait dans l'ordre de lecture.

## Format de sortie

- **Un seul fichier** : `filename.txt`
- **Plusieurs fichiers** : `pdf-to-text.zip` contenant un `.txt` par PDF d'entrée.

## Cas d'usage

- Extraire le texte principal de rapports PDF pour l'indexation en texte intégral.
- Convertir des ebooks ou des articles PDF en texte brut pour les lire sur des liseuses à encre électronique.
- Récupérer le texte de contrats ou de documents juridiques pour une analyse par mots-clés.
- Retirer la mise en forme des PDF pour obtenir un texte propre destiné à des scripts de traitement de données.
- Préparer un corpus de texte à partir d'archives PDF pour le traitement automatique du langage.

## Astuces

- Les PDF numérisés (uniquement des images) produiront des fichiers texte vides, car il n'y a aucune couche de texte à extraire. Passez d'abord les documents numérisés dans l'OCR.
- La sortie conserve l'ordre de lecture tel qu'interprété par PyMuPDF, qui suit généralement de gauche à droite et de haut en bas. Les mises en page à plusieurs colonnes peuvent produire un texte entrelacé.
- Pour une sortie structurée avec titres et mise en forme, essayez [PDF vers Markdown](./pdf-to-markdown). Pour du JSON structuré prêt pour l'IA, utilisez [Préparer un PDF pour l'IA](./prepare-pdf-for-ai).

## Outils associés

- [PDF vers Markdown](./pdf-to-markdown)
- [Préparer un PDF pour l'IA](./prepare-pdf-for-ai)
- [PDF vers Word](./pdf-to-word)
