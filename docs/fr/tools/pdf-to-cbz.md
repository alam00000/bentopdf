---
title: PDF vers CBZ
description: Convertissez un PDF en fichier CBZ (Comic Book Archive) pour les lecteurs de bandes dessinées comme Komga, Kavita, CDisplayEx et Calibre.
---

# PDF vers CBZ

Convertit un PDF en fichier CBZ (Comic Book ZIP), le format standard des bandes dessinées et mangas numériques. Chaque page du PDF devient une image dans l'archive. L'outil génère des métadonnées dans trois formats pour une compatibilité maximale : ComicInfo.xml, metadata.opf et ComicBookInfo JSON.

## Fonctionnement

1. Envoyez un PDF en cliquant sur la zone de dépôt ou en y glissant un fichier.
2. Choisissez le format d'image, la qualité, l'échelle et les métadonnées facultatives.
3. Cliquez sur **Convertir** pour générer le fichier CBZ.
4. Le fichier `.cbz` est téléchargé automatiquement.

## Options

| Option                  | Valeurs          | Par défaut | Description                                                                                                    |
| ----------------------- | ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Format d'image          | JPEG, PNG, WebP  | JPEG       | JPEG pour les BD en couleur, PNG pour les mangas noir et blanc sans perte, WebP pour la meilleure compression. |
| Qualité                 | 50–100 %         | 85 %       | Contrôle la compression JPEG/WebP. Masquée pour le PNG (toujours sans perte).                                  |
| Échelle                 | 1,0x–4,0x        | 2,0x       | Une échelle plus élevée produit des images plus nettes pour les écrans haute résolution.                       |
| Niveaux de gris         | Activé/Désactivé | Désactivé  | Convertit les pages en niveaux de gris. Réduit la taille des fichiers pour le contenu noir et blanc.           |
| Mode manga              | Activé/Désactivé | Désactivé  | Définit le sens de lecture de droite à gauche dans les métadonnées.                                            |
| Inclure les métadonnées | Activé/Désactivé | Activé     | Intègre ComicInfo.xml, metadata.opf et ComicBookInfo JSON.                                                     |

## Champs de métadonnées

Quand les métadonnées sont activées, vous pouvez renseigner :

- **Titre** : détecté automatiquement à partir du nom du fichier PDF.
- **Série** : le nom de la série (par ex. « Naruto »).
- **Numéro (n°)** : numéro du tome ou du numéro dans la série.
- **Volume (Vol.)** : numéro du volume.
- **Auteur(s)** : nom du scénariste ou du créateur.
- **Éditeur** : maison d'édition.
- **Tags / Genre** : tags séparés par des virgules (par ex. « Action, Aventure »).
- **Année de publication** : année de publication (1900–2100).
- **Note** : note de la communauté de 0 à 5.

## Compatibilité des métadonnées

L'outil écrit les métadonnées dans trois formats pour que chaque lecteur puisse les trouver :

| Format             | Emplacement                 | Pris en charge par                          |
| ------------------ | --------------------------- | ------------------------------------------- |
| ComicInfo.xml      | Fichier dans le ZIP         | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Fichier dans le ZIP         | Calibre                                     |
| ComicBookInfo JSON | Champ de commentaire du ZIP | Calibre (solution de repli)                 |

## Format de sortie

- `filename.cbz` : une archive ZIP contenant les images des pages numérotées et les fichiers de métadonnées.

Les images des pages sont nommées avec des numéros complétés par des zéros (`01.jpg`, `02.jpg`, etc.) pour que les lecteurs les affichent dans le bon ordre.

## Cas d'usage

- Convertir des mangas ou des BD en PDF pour les utiliser avec des lecteurs de bandes dessinées.
- Constituer une bibliothèque de BD numériques dans Komga, Kavita ou Calibre.
- Convertir des bandes dessinées numérisées dans un format adapté aux lecteurs.
- Partager des BD dans un format qui préserve le sens de lecture et les métadonnées.

## Astuces

- Utilisez **JPEG** pour les BD en couleur et **PNG** pour les mangas en noir et blanc : le PNG compresse très efficacement le contenu noir et blanc.
- Activez **Niveaux de gris** pour les mangas afin de réduire nettement la taille des fichiers.
- Renseignez les champs **Série** et **Numéro** pour que les gestionnaires de bibliothèque (Komga, Calibre) organisent automatiquement votre collection.
- **WebP** offre la meilleure compression, mais les lecteurs de BD plus anciens peuvent ne pas le prendre en charge.

## Outils associés

- [PDF vers JPG](./pdf-to-jpg)
- [PDF vers PNG](./pdf-to-png)
- [PDF vers TIFF](./pdf-to-tiff)
- [Extraire les images](./extract-images)
