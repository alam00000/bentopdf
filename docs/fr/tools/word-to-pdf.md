---
title: Word vers PDF
description: Convertissez des documents Word (DOC, DOCX), ODT et RTF en PDF dans votre navigateur, avec conservation complète de la mise en forme.
---

# Word vers PDF

Convertissez des documents Microsoft Word et des formats compatibles en PDF. L'outil utilise un moteur LibreOffice exécuté dans le navigateur, qui gère les fichiers DOC, DOCX, ODT et RTF et conserve la mise en forme, les tableaux, les images, les en-têtes, les pieds de page et les styles dans le fichier de sortie.

## Formats pris en charge

| Format            | Extensions |
| :---------------- | :--------- |
| Word (moderne)    | `.docx`    |
| Word (ancien)     | `.doc`     |
| OpenDocument Text | `.odt`     |
| Rich Text Format  | `.rtf`     |

## Fonctionnement

1. Cliquez sur la zone d'importation ou glissez-déposez vos documents Word. Vous pouvez sélectionner plusieurs fichiers à la fois.
2. Vérifiez et gérez la liste des fichiers.
3. Cliquez sur **Convertir en PDF**. Le moteur LibreOffice se charge à la première utilisation (un indicateur de progression montre l'état de l'initialisation), puis chaque fichier est converti.
4. Un fichier unique est téléchargé directement en PDF. Plusieurs fichiers sont regroupés dans `word-converted.zip`.

## Options

Cet outil n'a aucun réglage supplémentaire. Le moteur LibreOffice produit le résultat avec son profil d'export PDF par défaut.

## Résultat

| Nombre de fichiers | Résultat                                                             |
| :----------------- | :------------------------------------------------------------------- |
| 1 fichier          | Téléchargement d'un seul PDF (nom d'origine avec l'extension `.pdf`) |
| 2 fichiers ou plus | Archive ZIP (`word-converted.zip`) contenant un PDF par fichier      |

## Cas d'usage

- Convertir un CV ou une lettre de motivation de DOCX en PDF avant de postuler à un emploi
- Convertir par lots une série de contrats ou de propositions en PDF pour une livraison client
- Transformer d'anciens fichiers `.doc` en PDF modernes pour un archivage à long terme
- Convertir en PDF des documents collaboratifs issus de Google Docs (exportés en DOCX)
- Produire des PDF prêts à imprimer à partir de modèles Word utilisés pour la génération automatique de documents

## Conseils

- Le moteur LibreOffice est téléchargé une fois par session, puis mis en cache. Prévoyez quelques secondes de chargement lors de la première conversion, les suivantes étant beaucoup plus rapides.
- Les mises en forme complexes (macros, contrôles ActiveX, SmartArt avancés) peuvent ne pas être converties parfaitement. Les éléments standards d'un document (texte, tableaux, images, en-têtes, notes de bas de page) sont convertis de façon fiable.
- Comme cet outil accepte aussi l'ODT et le RTF, vous pouvez l'utiliser comme convertisseur unique pour tous les formats de traitement de texte.

## Outils associés

- [ODT vers PDF](./odt-to-pdf)
- [RTF vers PDF](./rtf-to-pdf)
- [Excel vers PDF](./excel-to-pdf)
- [PowerPoint vers PDF](./powerpoint-to-pdf)
