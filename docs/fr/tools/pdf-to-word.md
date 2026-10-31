---
title: PDF vers Word
description: Convertissez des fichiers PDF en documents Word (DOCX) modifiables. Prend en charge la conversion par lots de plusieurs PDF à la fois.
---

# PDF vers Word

Convertit des fichiers PDF en documents Word (`.docx`) modifiables. L'outil utilise PyMuPDF pour reconstruire le contenu du document en préservant le texte, la mise en forme de base et la mise en page. Prend en charge la conversion d'un seul fichier ou par lots.

## Fonctionnement

1. Envoyez un ou plusieurs PDF en cliquant sur la zone de dépôt ou en y glissant des fichiers. Vous pouvez ajouter d'autres fichiers ou retirer des fichiers de la liste.
2. Cliquez sur **Convertir** pour lancer le traitement.
3. Un seul fichier est téléchargé sous la forme `filename.docx`. Plusieurs fichiers sont regroupés dans `converted-documents.zip`.

## Options

Cet outil n'a aucune option configurable. Chaque PDF est converti en DOCX avec le moteur de conversion intégré de PyMuPDF.

## Format de sortie

- **Un seul fichier** : `filename.docx`
- **Plusieurs fichiers** : `converted-documents.zip` contenant un `.docx` par PDF d'entrée.

## Cas d'usage

- Modifier le texte d'un PDF reçu que vous devez retoucher.
- Convertir des rapports PDF archivés dans un format que des collègues peuvent modifier dans Microsoft Word ou Google Docs.
- Reprendre le contenu de contrats ou de propositions PDF dans Word pour le révisionner.
- Migrer d'anciennes documentations PDF vers un format modifiable.

## Astuces

- Les mises en page complexes avec texte en plusieurs colonnes, formulaires intégrés ou beaucoup de graphismes peuvent ne pas se convertir parfaitement. Relisez le résultat et ajustez la mise en forme dans votre traitement de texte.
- Les PDF numérisés (uniquement des images) produiront des fichiers DOCX vides ou presque. Passez-les d'abord dans l'OCR pour ajouter une couche de texte.
- Le mode par lots est efficace pour convertir des dossiers entiers de PDF : envoyez-les tous en une fois.

## Outils associés

- [PDF vers texte](./pdf-to-text)
- [PDF vers Markdown](./pdf-to-markdown)
- [Créateur de flux PDF](./pdf-workflow)
