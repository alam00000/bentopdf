---
title: ODT vers PDF
description: Convertissez des fichiers OpenDocument Text (ODT) en PDF dans votre navigateur avec un moteur basé sur LibreOffice.
---

# ODT vers PDF

Convertissez des fichiers OpenDocument Text en PDF. ODT est le format natif de LibreOffice Writer, d'Apache OpenOffice et d'autres traitements de texte open source. Cet outil utilise un moteur LibreOffice dans le navigateur pour produire des conversions fidèles qui préservent la mise en forme, les tableaux, les images et les styles.

## Formats pris en charge

| Format            | Extensions |
| :---------------- | :--------- |
| OpenDocument Text | `.odt`     |

## Fonctionnement

1. Cliquez sur la zone d'envoi ou glissez-déposez un ou plusieurs fichiers ODT.
2. Vérifiez la liste des fichiers. Ajoutez-en d'autres ou retirez ceux dont vous n'avez pas besoin.
3. Cliquez sur **Convertir en PDF**. Le moteur LibreOffice s'initialise (un indicateur de progression affiche l'état du chargement), puis chaque fichier est converti.
4. Un seul fichier est téléchargé directement sous forme de PDF. Plusieurs fichiers sont regroupés dans `odt-converted.zip`.

## Options

Cet outil n'a aucune configuration supplémentaire. La conversion préserve au plus près la mise en forme du document d'origine.

## Résultat

| Nombre de fichiers | Résultat                                                       |
| :----------------- | :------------------------------------------------------------- |
| 1 fichier          | Téléchargement d'un seul PDF (par ex. `document.pdf`)          |
| 2 fichiers ou plus | Archive ZIP (`odt-converted.zip`) contenant un PDF par fichier |

## Cas d'usage

- Convertir des documents LibreOffice Writer en PDF pour les partager avec des utilisateurs de Microsoft Office
- Produire des PDF prêts à imprimer à partir d'articles universitaires rédigés au format OpenDocument
- Convertir par lots un dossier de modèles ODT en PDF pour les distribuer
- Générer des PDF à partir de fichiers ODT créés par des systèmes automatisés de génération de documents

## Astuces

- Le moteur LibreOffice se charge à la première utilisation et reste en cache pour les conversions suivantes. Le premier chargement prend quelques secondes, ensuite les conversions sont rapides.
- Les documents complexes contenant des objets OLE intégrés ou des polices inhabituelles peuvent s'afficher légèrement différemment de LibreOffice sur ordinateur. Faites un essai avec un échantillon avant de convertir par lots.
- Pour les documents Word (`.doc`, `.docx`), utilisez plutôt l'outil [Word vers PDF](./word-to-pdf), qui utilise aussi le moteur LibreOffice mais accepte directement les formats Microsoft.

## Outils associés

- [Word vers PDF](./word-to-pdf)
- [RTF vers PDF](./rtf-to-pdf)
- [Texte vers PDF](./txt-to-pdf)
