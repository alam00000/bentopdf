---
title: Assembler un scan recto/verso
description: Réordonnez les PDF de scans recto/verso dont les pages de recto et de verso sont dans des blocs séparés pour obtenir le bon ordre recto/verso.
---

# Assembler un scan recto/verso

Assembler un scan recto/verso est conçu pour les flux de numérisation avec chargeur automatique de documents (ADF) où un PDF contient deux blocs de pages :

- tous les rectos d'abord
- tous les versos ensuite

Au lieu de scinder et de réassembler manuellement, cet outil entrelace les deux blocs dans l'ordre de lecture naturel : recto1, verso1, recto2, verso2, et ainsi de suite.

## Fonctionnement

1. Importez un seul PDF créé par une numérisation recto/verso d'une pile.
2. Définissez le point de séparation où le bloc des rectos se termine.
3. Choisissez le traitement du bloc des versos :
   - **Inverser le bloc des versos** (fréquent lorsque la pile est retournée avant de numériser les versos)
   - **Conserver le bloc des versos tel quel**
4. Cliquez sur **Assembler le PDF** pour télécharger le résultat réordonné.

## Options

- **Détection automatique de la séparation (moitié)** : place le point de séparation à `ceil(totalPages / 2)`.
- **Avertissement de page impaire** : avertit lorsque le nombre total de pages est impair (souvent un décalage de numérisation).
- **Confirmation de blocs inégaux** : demande une confirmation lorsque les blocs de rectos et de versos n'ont pas la même taille.
- **Export groupé** : scinde le résultat assemblé en PDF distincts selon le nombre de pages du document d'origine et le télécharge au format ZIP.

## Comportement de sortie

- **Par défaut** : un seul PDF en sortie (un PDF en entrée, un PDF en sortie).
- **Mode groupé** : la sortie est découpée selon votre valeur de pages par document ; si plusieurs morceaux sont produits, ils sont téléchargés dans un seul ZIP, sinon un seul PDF est téléchargé.

Si les blocs sont de taille inégale, les pages appariées sont assemblées en premier, puis les pages restantes sans paire sont ajoutées à la fin.

## Cas d'usage courants

- Rétablir l'ordre après avoir numérisé une pile de formulaires recto verso en deux passes.
- Reconstituer des liasses recto/verso à partir de scanners de bureau qui produisent tous les rectos puis tous les versos.
- Post-traiter des numérisations d'archives avant de les scinder en fichiers par document.

## Conseils

- La plupart des lots recto/verso devraient avoir un nombre total de pages pair.
- Si les versos semblent inversés dans le résultat, basculez entre **Inverser le bloc des versos** et **Conserver le bloc des versos tel quel**.
- Pour des originaux de 2 pages (recto + verso), utilisez l'export groupé avec `2` pages par document.

## Outils associés

- [Alterner et mélanger les pages](./alternate-merge)
- [Scinder un PDF](./split-pdf)
- [Fusionner des PDF](./merge-pdf)
- [Dupliquer et organiser](./organize-pdf)
