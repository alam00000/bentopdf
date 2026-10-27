---
title: PDF vers SVG
description: Convertissez des pages PDF en graphiques vectoriels SVG redimensionnables. Conserve le texte et les formes sous forme de tracés vectoriels pour un redimensionnement infini.
---

# PDF vers SVG

Convertit chaque page d'un PDF en fichier SVG (Scalable Vector Graphics). Contrairement aux formats matriciels, le SVG conserve les tracés vectoriels, le texte et les formes, de sorte que le résultat s'adapte à n'importe quelle taille sans pixellisation. Propulsé par PyMuPDF.

## Fonctionnement

1. Envoyez un ou plusieurs PDF en cliquant sur la zone de dépôt ou en y glissant des fichiers. Vous pouvez ajouter plusieurs fichiers et les gérer individuellement.
2. Cliquez sur **Convertir** pour traiter tous les fichiers envoyés.
3. Les conversions d'un seul fichier d'une seule page sont téléchargées sous forme d'un `.svg` autonome. Tous les autres cas sont téléchargés sous forme d'archive ZIP.

## Options

Cet outil n'a aucune option configurable. Chaque page est convertie en SVG avec l'export vectoriel natif de PyMuPDF.

## Format de sortie

- **Un fichier, une page** : `filename.svg`
- **Un fichier, plusieurs pages** : `filename_svg.zip` contenant `page_1.svg`, `page_2.svg`, etc.
- **Plusieurs fichiers** : `pdf_to_svg.zip` avec des fichiers organisés par nom de document source.

## Cas d'usage

- Extraire des schémas vectoriels, des graphiques ou des illustrations de rapports PDF pour les utiliser dans des pages web.
- Modifier le contenu de pages PDF dans un éditeur vectoriel comme Inkscape ou Illustrator.
- Intégrer des aperçus de pages redimensionnables dans des applications web adaptatives.
- Extraire des logos ou des graphismes de brochures PDF en conservant des contours nets.

## Astuces

- Le SVG fonctionne mieux avec les PDF qui contiennent du contenu vectoriel. Les documents numérisés ou riches en images produiront de gros fichiers SVG contenant des données matricielles intégrées.
- Pour une sortie matricielle de PDF riches en images, utilisez plutôt [PDF vers PNG](./pdf-to-png) ou [PDF vers JPG](./pdf-to-jpg).
- Cet outil prend en charge la conversion par lots : envoyez plusieurs PDF à la fois pour tous les convertir en une seule exécution.

## Outils associés

- [PDF vers PNG](./pdf-to-png)
- [PDF vers JPG](./pdf-to-jpg)
- [PDF vers Markdown](./pdf-to-markdown)
