---
title: Réparer un PDF
description: Récupérez les données de fichiers PDF corrompus ou endommagés grâce au moteur de réparation de QPDF. Traitement par lots pris en charge.
---

# Réparer un PDF

Quand un PDF refuse de s'ouvrir, affiche un contenu illisible ou provoque des erreurs dans votre lecteur, cet outil tente de reconstruire sa structure interne. Il utilise le moteur de réparation de QPDF, capable de récupérer des données après de nombreux types de corruption : tables de références croisées cassées, flux tronqués, références d'objets invalides, et plus encore.

## Fonctionnement

1. Importez un ou plusieurs fichiers PDF endommagés.
2. Cliquez sur **Réparer le PDF**.
3. Un fichier réparé unique est téléchargé directement. Plusieurs fichiers produisent une archive ZIP.

L'outil fait passer chaque fichier dans QPDF avec l'option `--decrypt`, qui force QPDF à lire et réécrire toute la structure du PDF, en corrigeant au passage les problèmes récupérables.

## Fonctionnalités

- Réparation par lots de plusieurs PDF en une seule opération
- Détection automatique des fichiers récupérables et irrécupérables
- Rapport de réussite ou d'échec par fichier lors du traitement de plusieurs fichiers
- Utilise QPDF (WebAssembly), une bibliothèque de transformation de PDF éprouvée

## Ce qu'il peut corriger

- Tables de références croisées cassées ou manquantes
- Fins de fichier tronquées après un téléchargement incomplet
- Numérotation d'objets et longueurs de flux invalides
- Incohérences structurelles mineures causées par des générateurs de PDF défectueux
- Artefacts de chiffrement issus de tentatives de déchiffrement ayant échoué

## Ce qu'il ne peut pas corriger

- Fichiers fortement tronqués dont la majeure partie du contenu est manquante
- PDF chiffrés avec un mot de passe que vous n'avez pas
- Fichiers qui ne sont pas réellement des PDF (mauvaise extension)
- Corruption d'images dans le PDF (la structure est corrigée, mais les données de pixels ne sont pas régénérées)

## Cas d'usage

- Récupérer un PDF issu d'un téléchargement d'email raté
- Ouvrir des fichiers produits par des générateurs de PDF anciens ou non standard
- Corriger des PDF qui fonctionnent dans un lecteur mais pas dans un autre
- Préparer des documents d'archives endommagés pour un stockage à long terme

## Conseils

- Si la réparation échoue, essayez d'abord d'ouvrir le fichier dans un navigateur : les navigateurs ont leur propre logique de récupération et peuvent afficher assez de contenu pour permettre un nouvel enregistrement.
- Pour les PDF chiffrés dont la réparation échoue, essayez d'abord Déverrouiller un PDF, puis réparez le résultat déchiffré.

## Outils associés

- [Compresser un PDF](./compress-pdf) : nettoyer davantage la structure du PDF réparé
- [Linéariser un PDF](./linearize-pdf) : optimiser le fichier réparé pour une diffusion sur le web
- [Aplatir le PDF](./flatten-pdf) : aplatir les formulaires qui ont pu être endommagés
