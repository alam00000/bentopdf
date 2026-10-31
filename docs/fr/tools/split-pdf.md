---
title: Scinder un PDF
description: Scindez un PDF en fichiers plus petits par plage de pages, sélection visuelle, signets, pages paires/impaires ou intervalles fixes.
---

# Scinder un PDF

Découpez un PDF en documents plus petits grâce à l'un des six modes de scission. Des simples plages de pages à la scission par signets, cet outil couvre tous les cas de division d'un document.

## Fonctionnement

1. Importez un seul fichier PDF.
2. Choisissez un mode de scission dans la liste déroulante.
3. Configurez les options propres au mode (plages de pages, sélections, etc.).
4. Cliquez sur le bouton de traitement.
5. Le résultat est téléchargé sous forme d'un PDF unique ou d'une archive ZIP selon le mode et les réglages.

## Modes de scission

| Mode                   | Description                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Plage**              | Saisissez des plages de pages comme `1-3, 5, 8-10`. Plusieurs plages produisent des PDF séparés dans un ZIP. Une seule plage produit un PDF. |
| **Sélection visuelle** | Parcourez les miniatures et cliquez pour sélectionner les pages voulues. Les pages sélectionnées sont extraites dans un nouveau PDF.         |
| **Paires / impaires**  | Extrait uniquement les pages paires ou les pages impaires.                                                                                   |
| **Toutes les pages**   | Scinde chaque page en un fichier PDF individuel, téléchargé sous forme de ZIP.                                                               |
| **Signets**            | Scinde aux limites des signets. Choisissez le niveau de signet pour contrôler où les coupures ont lieu.                                      |
| **Toutes les N pages** | Scinde en blocs de N pages chacun (par ex. toutes les 5 pages). Le dernier bloc peut contenir moins de pages.                                |

## Fonctionnalités

- Six modes de scission distincts couvrant pratiquement tous les cas d'usage
- Sélecteur de pages visuel avec miniatures chargées à la demande
- Scission par signets avec filtrage par niveau
- Option de sortie ZIP pour les modes plage et sélection visuelle
- Gère les plages de pages à la syntaxe mixte (`1-3, 5, 8-10`)
- Avertissement lorsque les scissions par N pages donnent des blocs inégaux

## Cas d'usage

- Extraire un chapitre ou une section précise d'un gros document
- Séparer les pages paires et impaires pour des flux d'impression recto verso
- Découper un PDF de livre en fichiers de chapitres individuels aux limites des signets
- Isoler des pages précises (comme la page de signature) d'un contrat
- Scinder un rapport compilé en fichiers par section pour la distribution

## Conseils

- Plusieurs plages de pages séparées par des virgules (par ex. `1-5, 10-15, 20-25`) produisent des PDF séparés, un par plage, regroupés dans un ZIP.
- Le mode de scission par signets exige que le PDF contienne réellement des signets. Si aucun n'est trouvé, un message d'erreur s'affiche.
- La case « Télécharger en ZIP » des modes Plage et Sélection visuelle vous permet d'obtenir un PDF par page au lieu d'un fichier combiné.

## Outils associés

- [Fusionner des PDF](./merge-pdf)
- [Extraire des pages](./extract-pages)
- [Supprimer des pages](./delete-pages)
- [Outil PDF tout-en-un](./pdf-multi-tool)
