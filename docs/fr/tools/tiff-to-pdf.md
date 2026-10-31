---
title: TIFF vers PDF
description: Convertissez des images TIFF d'une ou plusieurs pages au format PDF dans votre navigateur, avec prise en charge complète des pages.
---

# TIFF vers PDF

Convertissez des fichiers TIFF en PDF, y compris les TIFF de plusieurs pages. Chaque page (ou « IFD ») d'un fichier TIFF devient une page distincte du PDF de sortie. C'est particulièrement utile pour les documents numérisés, les fax et les images médicales, couramment stockés sous forme de TIFF de plusieurs pages.

## Formats pris en charge

| Format | Extensions      |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez vos fichiers TIFF.
2. Vérifiez la liste des fichiers et gérez-la selon vos besoins.
3. Cliquez sur **Convertir en PDF**. Le résultat est téléchargé sous le nom `from_tiff.pdf`.

L'outil décode chaque fichier TIFF avec un décodeur TIFF JavaScript et extrait les données de pixels RGBA brutes de chaque page. Chaque page est restituée sur un canevas, exportée en PNG et intégrée au PDF. Les dimensions des pages correspondent à celles des pages TIFF d'origine.

## Options

Cet outil n'expose aucun réglage de qualité supplémentaire. Les images sont intégrées à leur résolution native.

## Cas d'usage

- Convertir des documents fax de plusieurs pages (TIFF-F) en un format PDF plus portable
- Transformer des archives de documents numérisés stockées en TIFF en PDF interrogeables (à combiner ensuite avec l'outil OCR)
- Traiter des fichiers d'imagerie médicale (lames d'anatomopathologie, exports de radiologie) qui utilisent le TIFF
- Convertir des fichiers TIFF d'imagerie SIG ou satellite en documents partageables

## Conseils

- Les TIFF de plusieurs pages sont entièrement pris en charge. Un TIFF de 10 pages produira un PDF de 10 pages. Vous n'avez pas besoin de scinder le TIFF au préalable.
- Les très gros fichiers TIFF (plusieurs centaines de mégaoctets) peuvent prendre plus de temps à traiter, car le fichier entier doit être décodé dans la mémoire du navigateur.
- Si vous avez besoin d'OCR sur le PDF obtenu, passez-le dans l'outil [OCR PDF](./ocr-pdf) après la conversion.

## Outils associés

- [Images vers PDF](./image-to-pdf)
- [BMP vers PDF](./bmp-to-pdf)
- [JPG vers PDF](./jpg-to-pdf)
