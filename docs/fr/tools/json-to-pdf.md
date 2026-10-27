---
title: JSON vers PDF
description: Reconstituez des fichiers PDF à partir du format JSON de BentoPDF. Reconvertissez des exports JSON en documents PDF d'origine.
---

# JSON vers PDF

Reconstituez des documents PDF à partir de fichiers JSON créés au préalable par l'outil **PDF vers JSON** de BentoPDF. C'est un outil de conversion aller-retour : il prend la représentation JSON structurée d'un PDF et reconstruit le document d'origine.

::: warning
Cet outil n'accepte que les fichiers JSON produits par le convertisseur PDF vers JSON de BentoPDF. Les fichiers JSON standard issus d'API, de bases de données ou d'autres outils ne sont pas pris en charge.
:::

## Formats pris en charge

| Entrée  | Description                                                  |
| :------ | :----------------------------------------------------------- |
| `.json` | Fichiers JSON exportés par l'outil PDF vers JSON de BentoPDF |

## Fonctionnement

1. Cliquez sur la zone d'envoi ou glissez-déposez un ou plusieurs fichiers JSON.
2. La liste affiche chaque fichier sélectionné avec sa taille.
3. Cliquez sur **Convertir en PDF**. L'outil traite tous les fichiers avec un Web Worker et le moteur CPDF.
4. Le résultat est téléchargé sous le nom `jsons-to-pdf.zip`, contenant un PDF par fichier JSON d'entrée.

La conversion s'exécute dans un Web Worker en arrière-plan, de sorte que l'interface reste réactive même avec de gros fichiers.

## Options

Cet outil n'a aucune option configurable. La structure du JSON détermine entièrement le PDF produit.

## Résultat

Lors de la conversion de plusieurs fichiers JSON, les résultats sont livrés dans une archive ZIP. Chaque PDF porte le nom de son fichier JSON source (par ex. `report.json` devient `report.pdf`).

## Cas d'usage

- Restaurer des PDF à partir d'une sauvegarde ou d'une chaîne d'archivage basée sur JSON
- Faire un aller-retour d'un PDF via JSON pour l'inspecter, puis le reconvertir en PDF
- Reconstruire des documents après des modifications programmatiques de la structure JSON
- Vérifier qu'un export PDF vers JSON a capturé tout le contenu du document en le reconvertissant

## Astuces

- Pour convertir des données JSON arbitraires (réponses d'API ou fichiers de configuration) en PDF mis en forme, l'outil [Texte vers PDF](./txt-to-pdf) est mieux adapté. Collez le JSON comme texte et il sera rendu avec une mise en forme correcte.
- Le moteur WebAssembly CPDF doit être disponible pour que cet outil fonctionne. Les instances auto-hébergées doivent avoir les fichiers WASM de CPDF configurés.

## Outils associés

- [Texte vers PDF](./txt-to-pdf)
- [Markdown vers PDF](./markdown-to-pdf)
- [CSV vers PDF](./csv-to-pdf)
