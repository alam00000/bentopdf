---
title: Redresser un PDF
description: Redressez automatiquement les pages inclinées des PDF numérisés grâce à la détection d'inclinaison d'OpenCV. Seuil et DPI réglables.
---

# Redresser un PDF

Les documents numérisés sont rarement parfaitement droits. Même une légère inclinaison réduit la précision de l'OCR et donne un aspect négligé à l'impression. Cet outil utilise les algorithmes de traitement d'image d'OpenCV pour détecter l'angle d'inclinaison de chaque page et la remettre d'aplomb.

## Fonctionnement

1. Importez un ou plusieurs PDF numérisés.
2. Définissez le **Seuil d'inclinaison** : les pages dont l'inclinaison détectée est inférieure à cette valeur ne sont pas modifiées.
3. Choisissez une **Qualité de traitement (DPI)** : un DPI plus élevé améliore la précision de la détection mais prend plus de temps.
4. Cliquez sur **Redresser un PDF**.
5. Après le traitement, un panneau de résultats affiche l'angle détecté pour chaque page et indique si elle a été corrigée.

## Options

| Paramètre               | Valeurs                   | Par défaut |
| ----------------------- | ------------------------- | ---------- |
| **Seuil d'inclinaison** | 0,1, 0,5, 1,0, 2,0 degrés | 0,5        |
| **DPI de traitement**   | 100, 150, 200, 300        | 150        |

## Comment fonctionne la détection d'inclinaison

L'outil rend chaque page sous forme d'image au DPI sélectionné, puis utilise OpenCV pour détecter les angles dominants des lignes du contenu. Si l'inclinaison détectée dépasse le seuil, la page est pivotée de l'angle inverse pour la redresser. Les pages en dessous du seuil sont transmises sans modification.

## Cas d'usage

- Nettoyer des contrats ou des documents juridiques numérisés par lots
- Préparer des reçus ou des factures numérisés pour un traitement OCR
- Redresser des pages issues d'un scanner à plat dont le placement du papier est irrégulier
- Améliorer la qualité visuelle de documents d'archives numérisés

## Conseils

- Abaissez le seuil à 0,1 degré si vous avez besoin d'un alignement parfait au pixel près pour l'OCR.
- 150 DPI est rapide et précis pour la plupart des documents. Utilisez 300 DPI pour du texte très petit ou des pages très détaillées.
- Le redressement fonctionne mieux sur les documents avec des lignes de texte horizontales nettes. Il peut avoir du mal avec les pages composées surtout d'images ou d'éléments de design en diagonale.

## Outils associés

- [Rastériser le PDF](./rasterize-pdf) : convertissez le résultat redressé en PDF à plat basé sur des images
- [Compresser un PDF](./compress-pdf) : réduisez la taille du fichier après le redressement
- [Réparer un PDF](./repair-pdf) : corrigez les problèmes de structure dans les PDF numérisés
