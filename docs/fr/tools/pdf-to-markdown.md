---
title: PDF vers Markdown
description: Convertissez des documents PDF au format Markdown avec extraction d'images facultative. Prend en charge la conversion par lots de plusieurs fichiers.
---

# PDF vers Markdown

Convertit des fichiers PDF au format Markdown (`.md`) en préservant les titres, paragraphes, listes et la mise en forme de base. Peut aussi extraire et inclure les images intégrées. Prend en charge la conversion d'un seul fichier ou par lots. Propulsé par PyMuPDF.

## Fonctionnement

1. Envoyez un ou plusieurs PDF en cliquant sur la zone de dépôt ou en y glissant des fichiers.
2. Activez éventuellement **Inclure les images** pour intégrer les images extraites dans la sortie Markdown.
3. Cliquez sur **Convertir** pour lancer le traitement.
4. Un seul fichier est téléchargé sous la forme `filename.md`. Plusieurs fichiers produisent un `markdown-files.zip`.

## Options

- **Inclure les images** : une fois cochée, les images intégrées au PDF sont extraites et référencées dans la sortie Markdown. Une fois décochée, seul le contenu textuel est converti.

## Format de sortie

- **Un seul fichier** : `filename.md`
- **Plusieurs fichiers** : `markdown-files.zip` contenant un `.md` par PDF d'entrée.

## Cas d'usage

- Convertir de la documentation PDF en Markdown pour un générateur de site statique comme VitePress, Hugo ou Jekyll.
- Transformer des articles de recherche PDF en Markdown modifiable pour des applications de prise de notes comme Obsidian.
- Migrer d'anciennes bases de connaissances PDF vers un format texte adapté à Git.
- Extraire le contenu structuré d'ebooks PDF pour le remettre en forme.

## Astuces

- L'option Inclure les images est utile quand le PDF contient des schémas ou des figures essentiels au contenu. Désactivez-la pour les documents riches en texte afin de garder une sortie propre.
- Les mises en page complexes avec barres latérales, notes de bas de page ou texte en plusieurs colonnes peuvent produire un Markdown imparfait. Relisez et ajustez la sortie si nécessaire.
- Pour du texte brut sans aucune mise en forme, utilisez plutôt [PDF vers texte](./pdf-to-text).

## Outils associés

- [PDF vers texte](./pdf-to-text)
- [PDF vers Word](./pdf-to-word)
- [Préparer un PDF pour l'IA](./prepare-pdf-for-ai)
