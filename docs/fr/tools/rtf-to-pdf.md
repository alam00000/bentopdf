---
title: RTF vers PDF
description: Convertissez des fichiers Rich Text Format (RTF) en PDF dans votre navigateur grâce à un moteur propulsé par LibreOffice.
---

# RTF vers PDF

Convertissez des documents Rich Text Format en PDF. Le RTF est un format de document multiplateforme pris en charge par pratiquement tous les traitements de texte. Cet outil utilise un moteur LibreOffice exécuté dans le navigateur pour restituer les fichiers RTF en conservant leur mise en forme : gras, italique, tableaux et images intégrées sont tous repris dans le PDF.

## Formats pris en charge

| Format | Extensions | Types MIME                    |
| :----- | :--------- | :---------------------------- |
| RTF    | `.rtf`     | `text/rtf`, `application/rtf` |

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez un ou plusieurs fichiers RTF.
2. Vérifiez la liste des fichiers. Ajoutez-en ou retirez-en selon vos besoins.
3. Cliquez sur **Convertir en PDF**. Le moteur LibreOffice s'initialise à la première utilisation, puis traite chaque fichier.
4. Un fichier unique est téléchargé directement en PDF. Plusieurs fichiers sont livrés sous la forme `rtf-converted.zip`.

## Options

Cet outil n'a aucun réglage supplémentaire. La conversion préserve la mise en forme RTF d'origine.

## Résultat

| Nombre de fichiers | Résultat                                                       |
| :----------------- | :------------------------------------------------------------- |
| 1 fichier          | Téléchargement d'un seul PDF (par ex. `letter.pdf`)            |
| 2 fichiers ou plus | Archive ZIP (`rtf-converted.zip`) contenant un PDF par fichier |

## Cas d'usage

- Convertir en PDF modernes des documents RTF hérités d'anciens traitements de texte
- Transformer des modèles d'email RTF en aperçus PDF
- Traiter les sorties RTF de logiciels juridiques ou médicaux
- Convertir par lots des fichiers RTF d'un système de gestion documentaire en PDF pour l'archivage

## Conseils

- Le moteur LibreOffice est chargé une fois puis mis en cache. La première conversion d'une session prend quelques secondes de plus, les suivantes sont plus rapides.
- Les fichiers RTF contenant des objets OLE intégrés peuvent ne pas restituer parfaitement tous les objets. Le texte brut, les images et la mise en forme standard se convertissent de façon fiable.
- Si vos fichiers RTF ont été créés avec Microsoft Word, vous pouvez aussi les convertir directement avec l'outil [Word vers PDF](./word-to-pdf), qui accepte le RTF en plus du DOC et du DOCX.

## Outils associés

- [Word vers PDF](./word-to-pdf)
- [ODT vers PDF](./odt-to-pdf)
- [Texte vers PDF](./txt-to-pdf)
