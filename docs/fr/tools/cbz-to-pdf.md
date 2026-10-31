---
title: CBZ vers PDF
description: Convertissez des archives de bandes dessinées CBZ et CBR en PDF dans votre navigateur. Gratuit, privé, sans envoi de fichiers.
---

# CBZ vers PDF

Transformez des archives de bandes dessinées en PDF. CBZ et CBR sont les formats standards des BD numériques : ce sont simplement des archives ZIP ou RAR remplies d'images. Cet outil extrait chaque page, conserve l'ordre de lecture et produit un PDF propre où chaque image devient une page en taille réelle.

## Formats pris en charge

| Format | Extension | Remarques                                                     |
| :----- | :-------- | :------------------------------------------------------------ |
| CBZ    | `.cbz`    | Archive de BD basée sur ZIP (traitée localement avec pdf-lib) |
| CBR    | `.cbr`    | Archive de BD basée sur RAR (traitée via le moteur PyMuPDF)   |

Le convertisseur CBZ reconnaît les images JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC et JXL contenues dans l'archive. Les formats non standard sont automatiquement convertis en PNG avant d'être intégrés.

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez vos fichiers CBZ ou CBR. Vous pouvez mélanger les deux formats dans un même lot.
2. Vérifiez la liste des fichiers. Retirez ceux dont vous n'avez pas besoin, ou cliquez sur **Ajouter d'autres fichiers** pour en ajouter.
3. Cliquez sur **Convertir en PDF**. Pour les fichiers CBZ, l'outil décompresse l'archive, trie les images par nom dans l'ordre naturel, détecte le format réel de chaque image et les intègre dans un PDF avec pdf-lib. Les fichiers CBR passent plutôt par le moteur PyMuPDF.
4. Un seul fichier est téléchargé sous forme de PDF. Plusieurs fichiers produisent une archive ZIP nommée `comic-converted.zip`.

## Options

Aucune configuration n'est nécessaire. Chaque image devient une page dont la taille correspond à ses dimensions d'origine : les doubles pages restent larges et les pages simples restent étroites.

## Cas d'usage

- Lire des BD sur une tablette ou une application mobile qui prend en charge le PDF mais pas CBZ/CBR
- Imprimer certaines pages d'une BD numérique
- Archiver une collection de BD dans un format que n'importe quel lecteur de fichiers peut ouvrir
- Partager une BD avec quelqu'un qui n'a pas de lecteur de BD dédié

## Conseils

- Les images de l'archive sont triées dans l'ordre naturel (ainsi `page2.jpg` vient avant `page10.jpg`). Nommez vos fichiers avec une numérotation cohérente pour obtenir le bon ordre des pages.
- Le convertisseur détecte les formats d'image grâce à leurs signatures binaires, pas à leurs extensions. Un PNG nommé par erreur `.jpg` sera quand même intégré correctement.
- Les fichiers CBZ sont traités entièrement dans le navigateur sans charger le moteur PyMuPDF, ils se convertissent donc plus vite que les fichiers CBR.

## Outils associés

- [EPUB vers PDF](./epub-to-pdf)
- [MOBI vers PDF](./mobi-to-pdf)
- [Images vers PDF](./image-to-pdf)
