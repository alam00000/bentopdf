---
title: SVG vers PDF
description: Convertissez des graphiques vectoriels SVG en PDF avec contrôle de la qualité, entièrement dans votre navigateur.
---

# SVG vers PDF

Convertissez des fichiers Scalable Vector Graphics (SVG) en PDF. L'outil rastérise chaque SVG via le moteur de rendu du navigateur, puis intègre le résultat à sa résolution native. Pratique pour transformer des icônes vectorielles, des diagrammes et des illustrations en documents portables.

## Formats pris en charge

| Format | Extensions |
| :----- | :--------- |
| SVG    | `.svg`     |

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez un ou plusieurs fichiers SVG.
2. Vérifiez et gérez la liste des fichiers.
3. Choisissez un niveau de **qualité PDF**.
4. Cliquez sur **Convertir en PDF**. Le résultat est téléchargé sous le nom `from_svgs.pdf`.

Chaque SVG est lu comme du texte, restitué sur un canevas à sa largeur et sa hauteur intrinsèques (800x600 par défaut si aucune dimension n'est indiquée), puis exporté en PNG. Ce PNG est ensuite intégré au PDF avec pdf-lib. Les zones transparentes sont remplies d'un fond blanc.

## Options

La **qualité PDF** contrôle la compression après la rastérisation :

- **Haute qualité** : au plus près du rendu d'origine.
- **Qualité moyenne** (par défaut) : bon compromis.
- **Basse qualité** : fichier le plus léger, avec une certaine perte de détails.

## Cas d'usage

- Convertir des diagrammes d'architecture ou d'ingénierie de SVG en PDF prêt à imprimer
- Regrouper des jeux d'icônes dans un PDF de référence pour un design system
- Transformer des visualisations de données (D3.js, exports de bibliothèques de graphiques) en PDF prêts pour un rapport
- Créer des versions imprimables d'infographies basées sur du SVG

## Conseils

- Les fichiers SVG sans attributs `width` et `height` explicites sont restitués en 800x600 pixels. Pour de meilleurs résultats, définissez les dimensions dans la source SVG avant de convertir.
- Les SVG complexes avec des références de polices externes ou des images liées peuvent ne pas s'afficher parfaitement. Intégrez toutes les ressources dans le SVG pour un résultat fiable.
- Comme le SVG est rastérisé, le PDF contiendra une image bitmap plutôt que des tracés vectoriels. Pour obtenir un vrai PDF vectoriel, il faut un outil vectoriel dédié.

## Outils associés

- [Images vers PDF](./image-to-pdf)
- [PNG vers PDF](./png-to-pdf)
- [BMP vers PDF](./bmp-to-pdf)
