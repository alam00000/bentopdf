---
title: Alterner et mélanger les pages
description: Fusionnez des PDF en entrelaçant les pages de chaque fichier en alternance, avec conservation des signets.
---

# Alterner et mélanger les pages

Entrelacez les pages de plusieurs fichiers PDF pour que les pages alternent entre les documents. C'est l'outil à utiliser quand une fusion classique ne ferait que mettre les fichiers bout à bout, alors que vous voulez la page 1 du fichier A, puis la page 1 du fichier B, puis la page 2 du fichier A, et ainsi de suite.

## Fonctionnement

1. Importez au moins deux fichiers PDF à l'aide de la zone de dépôt.
2. L'outil affiche chaque fichier avec son nombre de pages et sa taille.
3. Faites glisser les poignées pour réordonner les fichiers dont les pages passent en premier dans la séquence d'entrelacement.
4. Cliquez sur **Mélanger les pages** pour produire le résultat entrelacé.
5. Le résultat est téléchargé sous le nom `alternated-mixed.pdf`.

## Fonctionnalités

- Entrelace les pages d'un nombre quelconque de PDF (deux minimum)
- Réorganisation des fichiers par glisser-déposer pour contrôler la priorité d'entrelacement
- Conserve les signets des documents sources
- Affiche le nombre de pages et la taille de chaque fichier importé
- Traitement dans un web worker dédié pour une interface réactive

## Cas d'usage

- Reconstituer des numérisations recto verso dont les pages impaires et paires ont été numérisées séparément
- Combiner des feuilles de questions avec leur corrigé pour que chaque question soit suivie de sa réponse
- Fusionner des documents bilingues page par page (par exemple, l'anglais d'un côté, la traduction sur la page suivante)
- Entrelacer les numérisations de recto et de verso issues d'un scanner à passage simple face

## Astuces

- Si vos PDF sources n'ont pas le même nombre de pages, les pages du document le plus court seront épuisées en premier et les pages restantes du document le plus long apparaîtront à la fin.
- L'ordre des fichiers compte : le premier fichier de la liste fournit la première page du résultat. Faites glisser pour réorganiser si nécessaire.

## Outils associés

- [Fusionner des PDF](./merge-pdf)
- [Dupliquer et organiser](./organize-pdf)
- [Scinder un PDF](./split-pdf)
