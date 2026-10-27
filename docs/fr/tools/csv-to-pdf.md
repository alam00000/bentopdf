---
title: CSV vers PDF
description: Convertissez des fichiers tableur CSV en tableaux PDF mis en forme, directement dans votre navigateur.
---

# CSV vers PDF

Transformez des fichiers CSV en documents PDF propres et mis en forme. Chaque CSV est analysé et rendu sous forme de tableau dans le PDF obtenu. C'est utile lorsque vous devez imprimer ou partager des données tabulaires sans que le destinataire ait besoin d'un tableur.

## Formats pris en charge

| Format | Extensions |
| :----- | :--------- |
| CSV    | `.csv`     |

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez un ou plusieurs fichiers CSV.
2. Vérifiez la liste des fichiers. Ajoutez-en d'autres ou retirez ceux dont vous ne voulez pas.
3. Cliquez sur **Convertir en PDF**. Un indicateur de progression affiche l'état de la conversion.
4. Un seul fichier est téléchargé directement sous forme de PDF. Plusieurs fichiers sont regroupés dans `csv-converted.zip`.

## Options

Cet outil n'a pas de configuration supplémentaire. Le CSV est automatiquement analysé et mis en forme sous forme de tableau.

## Résultat

| Nombre de fichiers | Résultat                                                       |
| :----------------- | :------------------------------------------------------------- |
| 1 fichier          | Téléchargement d'un seul PDF (par ex. `data.pdf`)              |
| 2 fichiers ou plus | Archive ZIP (`csv-converted.zip`) contenant un PDF par fichier |

## Cas d'usage

- Convertir des rapports de base de données exportés en tableaux PDF imprimables
- Partager des données financières ou des listes d'inventaire avec des personnes qui n'ont pas Excel
- Créer des versions PDF de fichiers journaux CSV pour la documentation de conformité
- Imprimer des listes d'adresses, des feuilles de notes ou toute donnée tabulaire stockée au format CSV

## Conseils

- Pour de meilleurs résultats, assurez-vous que votre CSV utilise des séparateurs virgule standard. L'outil suit les conventions courantes d'analyse des CSV.
- Si votre CSV comporte beaucoup de colonnes, le tableau peut être compressé pour tenir dans la largeur de la page. Pensez à diviser les jeux de données larges en plusieurs fichiers.
- Pour les fichiers Excel (`.xls`, `.xlsx`), utilisez l'outil [Excel vers PDF](./excel-to-pdf), qui préserve la mise en forme du tableur et les feuilles multiples.

## Outils associés

- [Excel vers PDF](./excel-to-pdf)
- [Texte vers PDF](./txt-to-pdf)
- [JSON vers PDF](./json-to-pdf)
