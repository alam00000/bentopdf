---
title: PDF vers JSON
description: Convertissez des fichiers PDF en JSON structuré avec CPDF. Exporte la structure interne du PDF sous forme de données JSON lisibles par machine.
---

# PDF vers JSON

Convertit un ou plusieurs fichiers PDF au format JSON. L'outil utilise CPDF (Coherent PDF) pour sérialiser la structure interne de chaque PDF en une représentation JSON lisible par machine. Le résultat est toujours livré sous forme d'archive ZIP.

## Fonctionnement

1. Sélectionnez un ou plusieurs fichiers PDF avec le sélecteur de fichiers.
2. Cliquez sur **Convertir** pour lancer le traitement. La conversion s'exécute dans un web worker en arrière-plan.
3. Une archive ZIP est téléchargée, contenant un fichier JSON pour chaque PDF d'entrée.

La barre d'état indique la progression des étapes de conversion et de création du ZIP.

## Options

Cet outil n'a aucune option configurable. Chaque PDF est converti en sa représentation JSON complète.

## Format de sortie

- Un fichier `pdfs-to-json.zip` contenant `filename.json` pour chaque PDF d'entrée.

La sortie JSON représente la structure interne des objets du PDF, y compris les arbres de pages, les références de polices, les métadonnées et les flux de contenu.

## Cas d'usage

- Inspecter la structure interne d'un PDF pour le débogage ou la validation.
- Extraire par programmation les métadonnées structurées et les propriétés des pages.
- Alimenter des chaînes de traitement personnalisées avec des données de structure PDF.
- Auditer la conformité de documents PDF en analysant leurs arbres d'objets.

## Astuces

- Cet outil produit la structure brute des objets du PDF, pas le texte extrait. Si vous avez besoin du texte des pages au format JSON, utilisez plutôt [Préparer un PDF pour l'IA](./prepare-pdf-for-ai).
- Pour une extraction de texte simple, [PDF vers texte](./pdf-to-text) est plus direct.
- Les gros PDF à la structure complexe produisent des fichiers JSON très volumineux.

## Outils associés

- [PDF vers texte](./pdf-to-text)
- [Préparer un PDF pour l'IA](./prepare-pdf-for-ai)
- [Extraire les tableaux](./extract-tables)
