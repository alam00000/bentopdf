---
title: Préparer le PDF pour l'IA
description: Extrayez le contenu d'un PDF en JSON structuré, optimisé pour les LLM et les pipelines d'IA comme LlamaIndex. Traitement par lots pris en charge.
---

# Préparer le PDF pour l'IA

Extrait le contenu de fichiers PDF et le structure en JSON optimisé pour l'ingestion par les grands modèles de langage (LLM) et les frameworks d'IA comme LlamaIndex. Le contenu de chaque page est extrait et organisé dans un format structuré, prêt pour des pipelines RAG, des chatbots ou des systèmes de recherche sémantique.

## Fonctionnement

1. Importez un ou plusieurs PDF en cliquant sur la zone de dépôt ou en y glissant des fichiers.
2. Cliquez sur **Extraire** pour lancer le traitement.
3. Un fichier unique est téléchargé sous le nom `filename_llm.json`. Plusieurs fichiers produisent une archive `pdf-for-ai.zip`.

L'outil utilise l'intégration LlamaIndex de PyMuPDF pour extraire le contenu page par page avec ses métadonnées, ce qui donne un résultat directement chargeable dans les frameworks d'IA.

## Options

Cet outil n'a aucune option configurable. Toutes les pages sont extraites avec le texte complet et les métadonnées.

## Format de sortie

- **Fichier unique** : `filename_llm.json`
- **Plusieurs fichiers** : `pdf-for-ai.zip` contenant un fichier `_llm.json` par PDF d'entrée.

Le JSON respecte le schéma de document LlamaIndex, avec le texte de chaque page et des champs de métadonnées.

## Cas d'usage

- Préparer des documents PDF pour des pipelines de génération augmentée par récupération (RAG).
- Construire une base de connaissances interrogeable à partir d'archives PDF pour un chatbot IA.
- Alimenter des workflows d'analyse basés sur des LLM avec des rapports PDF.
- Prétraiter des articles de recherche pour des systèmes de recherche sémantique et de questions-réponses.
- Créer des données d'entraînement structurées à partir de collections de documents PDF.

## Conseils

- Pour une extraction de texte brut sans formatage propre à l'IA, utilisez [PDF vers texte](./pdf-to-text).
- Pour une sortie Markdown qui conserve les titres et la structure, utilisez [PDF vers Markdown](./pdf-to-markdown).
- Les PDF numérisés produiront un résultat vide ou minimal. Passez-les d'abord par l'OCR pour ajouter une couche de texte avant l'extraction.

## Outils associés

- [PDF vers texte](./pdf-to-text)
- [PDF vers Markdown](./pdf-to-markdown)
- [PDF vers JSON](./pdf-to-json)
