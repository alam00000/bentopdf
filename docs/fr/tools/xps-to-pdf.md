---
title: XPS vers PDF
description: Convertissez des documents XPS et OXPS au format PDF dans votre navigateur. Sans envoi de fichier, sans inscription, entièrement privé.
---

# XPS vers PDF

Convertissez des documents Microsoft XPS et OXPS en fichiers PDF standards. XPS (XML Paper Specification) était la réponse de Microsoft au PDF, mais sa prise en charge a diminué sur les différentes plateformes. Cet outil rend à nouveau ces documents lisibles par tous.

## Formats pris en charge

| Format | Extension | Remarques                                  |
| :----- | :-------- | :----------------------------------------- |
| XPS    | `.xps`    | Format XPS d'origine de Microsoft          |
| OXPS   | `.oxps`   | Open XPS, la variante de la norme ECMA-388 |

## Fonctionnement

1. Cliquez sur la zone d'importation ou glissez-déposez vos fichiers XPS/OXPS. Vous pouvez sélectionner plusieurs fichiers à la fois.
2. Vérifiez la liste des fichiers. Supprimez des fichiers individuels avec l'icône de corbeille, ou cliquez sur **Ajouter des fichiers** pour ajouter d'autres documents.
3. Cliquez sur **Convertir en PDF**. Le moteur PyMuPDF traite chaque document localement dans votre navigateur.
4. Un fichier unique est téléchargé directement en PDF. Plusieurs fichiers sont regroupés dans une archive ZIP nommée `xps-converted.zip`.

## Options

Cet outil effectue une conversion de format directe, sans configuration supplémentaire. Le résultat conserve les dimensions de page d'origine, les graphiques vectoriels, les polices et les images de la source XPS.

## Cas d'usage

- Ouvrir des fichiers XPS reçus de systèmes Windows plus anciens qui utilisaient le pilote d'impression XPS par défaut
- Convertir des documents OXPS de Windows 10/11 pour les partager avec des utilisateurs de macOS ou de Linux
- Archiver d'anciens fichiers XPS dans un format plus largement pris en charge
- Rendre accessibles à des destinataires externes des documents administratifs ou d'entreprise au format XPS

## Conseils

- Les extensions `.xps` et `.oxps` sont gérées automatiquement : vous pouvez les mélanger dans un même lot.
- Si le fichier XPS d'origine a été créé avec un pilote d'impression haute résolution, le PDF obtenu conserve cette qualité. Aucun rééchantillonnage n'a lieu.

## Outils associés

- [Word vers PDF](./word-to-pdf)
- [XML vers PDF](./xml-to-pdf)
