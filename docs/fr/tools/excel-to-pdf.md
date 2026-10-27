---
title: Excel vers PDF
description: Convertissez des feuilles de calcul Excel (XLS, XLSX), ODS et CSV en PDF en conservant la mise en forme.
---

# Excel vers PDF

Convertissez des fichiers de tableur en PDF. L'outil prend en charge les fichiers Excel modernes, l'ancien format XLS, les feuilles de calcul OpenDocument et même le CSV, le tout rendu par un moteur LibreOffice exécuté dans le navigateur, qui préserve la mise en forme des cellules, les formules (sous forme de valeurs calculées), les graphiques et les mises en page multi-feuilles.

## Formats pris en charge

| Format                   | Extensions |
| :----------------------- | :--------- |
| Excel (moderne)          | `.xlsx`    |
| Excel (ancien)           | `.xls`     |
| OpenDocument Spreadsheet | `.ods`     |
| CSV                      | `.csv`     |

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez vos fichiers de tableur.
2. Vérifiez la liste des fichiers. Ajoutez-en d'autres ou retirez ceux dont vous ne voulez pas.
3. Cliquez sur **Convertir en PDF**. Le moteur LibreOffice s'initialise à la première utilisation, puis traite chaque fichier.
4. Un seul fichier est téléchargé directement en PDF. Plusieurs fichiers sont livrés sous la forme `excel-converted.zip`.

## Options

Cet outil n'a pas de configuration supplémentaire. Le moteur LibreOffice détermine la mise en page, la mise à l'échelle et la zone d'impression d'après les paramètres intégrés du tableur.

## Résultat

| Nombre de fichiers | Résultat                                                                        |
| :----------------- | :------------------------------------------------------------------------------ |
| 1 fichier          | Téléchargement d'un seul PDF (nom de fichier d'origine avec l'extension `.pdf`) |
| 2 fichiers ou plus | Archive ZIP (`excel-converted.zip`) contenant un PDF par fichier                |

## Cas d'usage

- Convertir des rapports financiers ou des budgets Excel en PDF pour la diffusion
- Créer des PDF prêts à imprimer à partir de tableurs d'inventaire ou de catalogues de produits
- Partager des résultats d'analyse de données avec des parties prenantes qui n'ont pas Excel installé
- Archiver des rapports trimestriels dans un format non modifiable
- Convertir en PDF des fichiers ODS de LibreOffice Calc

## Conseils

- Les graphiques intégrés au tableur sont rendus dans le PDF. Vérifiez qu'ils s'affichent correctement dans le fichier source avant de convertir.
- Si votre tableur comporte plusieurs feuilles, toutes les feuilles sont incluses dans le PDF obtenu.
- Pour des données CSV simples sans mise en forme, l'outil [CSV vers PDF](./csv-to-pdf) offre une conversion plus légère. Utilisez Excel vers PDF lorsque vous devez conserver la mise en forme, les graphiques ou plusieurs feuilles.

## Outils associés

- [CSV vers PDF](./csv-to-pdf)
- [Word vers PDF](./word-to-pdf)
- [PowerPoint vers PDF](./powerpoint-to-pdf)
