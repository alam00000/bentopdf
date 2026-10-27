---
title: Ajouter des étiquettes de page
description: Ajoutez des étiquettes de page PDF avec chiffres romains, préfixes alphabétiques, numérotation personnalisée et plusieurs règles par document.
---

# Ajouter des étiquettes de page

Les étiquettes de page déterminent l'affichage des numéros de page dans les lecteurs PDF (le numéro indiqué dans la barre d'outils, et non imprimé sur la page). Cet outil vous permet d'attribuer différents schémas d'étiquetage à différentes plages de pages : chiffres romains pour les pages liminaires, chiffres décimaux pour le corps du texte, annexes en lettres, et plus encore.

## Fonctionnement

1. Importez votre fichier PDF.
2. Le panneau d'options apparaît avec une règle d'étiquetage par défaut.
3. Configurez chaque règle avec une plage de pages, un style, un préfixe facultatif et une valeur de départ.
4. Cliquez sur **Ajouter une règle** pour créer des règles supplémentaires pour d'autres sections.
5. Cliquez sur **Ajouter des étiquettes de page** pour appliquer toutes les règles et télécharger le résultat.

## Options

Chaque règle d'étiquetage dispose des paramètres suivants :

- **Plage de pages** : les pages auxquelles la règle s'applique. Laissez vide pour toutes les pages. Accepte des plages comme `1-4`, `7`, `odd` ou `1-9,30-40`.
- **Style d'étiquette** : chiffres arabes décimaux, chiffres romains minuscules (i, ii, iii), chiffres romains majuscules (I, II, III), lettres minuscules (a, b, c), lettres majuscules (A, B, C), ou aucune étiquette (préfixe uniquement).
- **Préfixe d'étiquette** : texte facultatif ajouté devant chaque étiquette, par exemple « A- » pour obtenir des étiquettes comme A-1, A-2, A-3.
- **Valeur de départ** : le nombre à partir duquel commencer le décompte. 1 par défaut. Mettez 0 pour une numérotation commençant à zéro.
- **Poursuivre la numérotation sur des plages disjointes** : activez cette option lorsqu'une règle cible des pages non contiguës (comme `1-9,30-40` ou `odd`) et que vous souhaitez que la numérotation continue de façon séquentielle.
- **Supprimer les étiquettes de page existantes** : cochée par défaut. Efface les étiquettes précédentes avant d'appliquer vos nouvelles règles.

## Fonctionnalités

- Plusieurs règles d'étiquetage par document pour les schémas de numérotation complexes
- Six styles d'étiquettes couvrant tous les systèmes de numérotation courants
- Préfixe personnalisé pour un étiquetage par section
- Prise en charge des plages disjointes avec numérotation progressive
- Option pour conserver ou supprimer les étiquettes existantes

## Cas d'usage

- Définir des étiquettes en chiffres romains (i, ii, iii) pour la préface d'un livre et des étiquettes décimales pour le texte principal
- Étiqueter les pages d'annexe avec des préfixes alphabétiques comme « A-1 », « A-2 », « B-1 », « B-2 »
- Corriger les étiquettes de page d'un document numérisé dont les numéros de page physiques ne correspondent pas à l'ordre des pages du PDF
- Ajouter une numérotation commençant à zéro pour des documents techniques

## Astuces

- Les étiquettes de page sont des métadonnées que les lecteurs PDF affichent dans leur barre de navigation. Elles ne s'impriment pas sur la page. Pour des numéros visibles, utilisez [Numéros de page](./page-numbers).
- Cet outil nécessite que CoherentPDF (CPDF) soit configuré dans vos paramètres WASM. S'il ne l'est pas, il vous sera proposé de le configurer.

## Outils associés

- [Numéros de page](./page-numbers)
- [Numérotation Bates](./bates-numbering)
- [Modifier les signets](./bookmark)
