---
title: Texte vers PDF
description: Convertissez des fichiers texte brut ou du texte saisi en PDF avec des polices, des couleurs et des formats de page personnalisés.
---

# Texte vers PDF

Convertissez du texte brut en PDF mis en forme. Vous pouvez importer des fichiers `.txt` ou saisir directement du texte dans l'éditeur intégré. L'outil prend en charge plusieurs polices, des couleurs de texte personnalisées et un large choix de formats de page, de A0 à A10, ainsi que US Letter, Legal et Tabloid.

## Formats pris en charge

| Entrée                  | Extensions                         |
| :---------------------- | :--------------------------------- |
| Fichiers texte brut     | `.txt`                             |
| Saisie directe de texte | Saisissez ou collez dans l'éditeur |

## Fonctionnement

1. Choisissez votre mode de saisie avec l'interrupteur en haut : **Importer des fichiers** ou **Saisir du texte**.
2. Pour l'import, glissez-déposez ou cliquez pour sélectionner un ou plusieurs fichiers `.txt`. Pour la saisie, tapez votre texte directement dans la zone de texte.
3. Configurez les options de mise en forme : famille de police, taille de police, couleur du texte et format de page.
4. Cliquez sur **Créer le PDF**. Le résultat est téléchargé sous le nom `text_to_pdf.pdf`.

Lorsque vous importez plusieurs fichiers, leurs contenus sont concaténés avec des lignes vides entre eux.

## Options

| Option                | Valeurs                                                                        | Par défaut     |
| :-------------------- | :----------------------------------------------------------------------------- | :------------- |
| **Famille de police** | Helvetica (sans empattement), Tiro (serif), Courier (monospace), Times (serif) | Helvetica      |
| **Taille de police**  | 6 à 72 pt                                                                      | 12             |
| **Couleur du texte**  | N'importe quelle couleur via le sélecteur                                      | Noir (#000000) |
| **Format de page**    | ISO A0 à A10, B0 à B10, C0 à C10, US Letter, Legal, Tabloid, Ledger, 11x17     | A4             |

Les langues écrites de droite à gauche (arabe, hébreu, persan, ourdou) sont détectées automatiquement. Lorsqu'un texte RTL est trouvé, la direction et l'alignement du texte s'adaptent en conséquence.

## Cas d'usage

- Convertir des extraits de code ou des fichiers de logs en PDF imprimable avec la police Courier
- Créer rapidement un PDF à partir de notes de réunion saisies sur le moment
- Mettre en forme un manuscrit en texte brut avec une police et un format de page précis pour une soumission
- Produire une version PDF d'un README ou d'un journal des modifications pour une distribution hors ligne

## Conseils

- Utilisez le mode **Saisir du texte** pour convertir rapidement le contenu du presse-papiers sans l'enregistrer d'abord dans un fichier.
- Courier (monospace) est le meilleur choix pour du code, des logs ou tout contenu où l'alignement des colonnes compte.
- Les marges de page sont fixées à 72 points (1 pouce) de chaque côté.

## Outils associés

- [Markdown vers PDF](./markdown-to-pdf)
- [CSV vers PDF](./csv-to-pdf)
- [Word vers PDF](./word-to-pdf)
