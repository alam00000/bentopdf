---
title: PowerPoint vers PDF
description: Convertissez des présentations PowerPoint (PPT, PPTX) et des fichiers ODP en PDF en préservant la mise en forme des diapositives.
---

# PowerPoint vers PDF

Convertissez des fichiers de présentation en PDF. Chaque diapositive devient une page du document de sortie, avec texte, images, formes et transitions rendus par un moteur LibreOffice exécuté dans le navigateur. Les formats PowerPoint modernes et anciens sont pris en charge, ainsi que le format OpenDocument Presentation.

## Formats pris en charge

| Format                    | Extensions |
| :------------------------ | :--------- |
| PowerPoint (moderne)      | `.pptx`    |
| PowerPoint (ancien)       | `.ppt`     |
| OpenDocument Presentation | `.odp`     |

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez vos fichiers de présentation.
2. Vérifiez la liste des fichiers. Ajoutez-en ou retirez-en selon vos besoins.
3. Cliquez sur **Convertir en PDF**. Le moteur LibreOffice se charge à la première utilisation, puis convertit chaque fichier.
4. Un fichier unique est téléchargé directement en PDF. Plusieurs fichiers sont regroupés dans `powerpoint-converted.zip`.

## Options

Cet outil n'a aucun réglage supplémentaire. Les diapositives sont rendues à leurs dimensions d'origine.

## Résultat

| Nombre de fichiers | Résultat                                                              |
| :----------------- | :-------------------------------------------------------------------- |
| 1 fichier          | Téléchargement d'un seul PDF (nom d'origine avec l'extension `.pdf`)  |
| 2 fichiers ou plus | Archive ZIP (`powerpoint-converted.zip`) contenant un PDF par fichier |

## Cas d'usage

- Convertir une présentation en PDF avant de la partager avec un public qui n'a pas forcément PowerPoint
- Créer une version imprimable d'un diaporama pour une conférence ou un atelier
- Archiver des présentations dans un format qui s'affiche de façon identique sur tous les appareils
- Convertir par lots une bibliothèque de présentations ODP de LibreOffice Impress en PDF
- Produire une version PDF d'un pitch deck pour l'envoyer en pièce jointe

## Conseils

- Les animations et transitions des diapositives ne sont pas représentées dans le PDF. Chaque diapositive est capturée comme une page statique.
- Les vidéos intégrées n'apparaissent pas dans le résultat. Remplacez-les par une capture d'écran ou une image de substitution si nécessaire.
- Les notes du présentateur ne sont pas incluses dans l'export PDF par défaut. Si vous avez besoin des notes, exportez d'abord depuis la vue « Imprimer les notes » de PowerPoint.
- Le moteur LibreOffice reste en cache après le premier chargement, la conversion d'une deuxième présentation dans la même session est donc bien plus rapide.

## Outils associés

- [Word vers PDF](./word-to-pdf)
- [Excel vers PDF](./excel-to-pdf)
- [Images vers PDF](./image-to-pdf)
