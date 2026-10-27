---
title: OCR PDF
description: Rendez des PDF numérisés consultables et copiables avec l'OCR Tesseract, avec prise en charge multilingue et filtrage des caractères.
---

# OCR PDF

Transformez des documents numérisés en PDF consultables et copiables. L'outil utilise l'OCR Tesseract pour reconnaître le texte dans les images et superpose une couche de texte invisible aux pages d'origine, ce qui préserve leur apparence tout en rendant le contenu entièrement consultable.

## Fonctionnement

1. Envoyez un PDF numérisé ou basé sur des images.
2. Sélectionnez une ou plusieurs langues présentes dans le document grâce à la liste de langues avec recherche.
3. Ajustez si besoin les réglages avancés (résolution, binarisation, liste blanche).
4. Cliquez sur **Lancer l'OCR** et suivez la progression sur la barre en temps réel.
5. Une fois terminé, vérifiez le texte extrait, puis téléchargez le PDF consultable ou un fichier `.txt` brut.

## Fonctionnalités

- OCR multilingue avec sélecteur de langue consultable
- La couche de texte invisible préserve l'apparence d'origine du document
- Barre de progression et journal en temps réel pendant le traitement
- Téléchargement des résultats en PDF consultable ou en fichier texte brut
- Copie du texte extrait directement dans le presse-papiers
- Trois niveaux de résolution pour équilibrer vitesse et précision

## Options

| Réglage                                       | Valeurs                                                                                                              | Par défaut | Objectif                                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| **Résolution**                                | Standard (192 DPI), Élevée (288 DPI), Ultra (384 DPI)                                                                | Élevée     | Une résolution plus élevée améliore la précision sur les petits textes mais prend plus de temps |
| **Binariser l'image**                         | Activé / Désactivé                                                                                                   | Désactivé  | Améliore le contraste des numérisations propres en les convertissant en noir et blanc           |
| **Préréglage de liste blanche de caractères** | Aucun, Alphanumérique, Nombres + devises, Lettres uniquement, Nombres uniquement, Facture, Formulaires, Personnalisé | Aucun      | Restreint les caractères reconnus pour améliorer la précision sur certains types de documents   |
| **Liste blanche de caractères**               | Texte libre                                                                                                          | Vide       | Jeu de caractères manuel lorsque le préréglage est sur Personnalisé                             |

## Cas d'usage

- Rendre des contrats et factures numérisés consultables pour pouvoir y chercher avec Ctrl+F
- Extraire le texte de documents photographiés ou d'anciens dossiers papier
- Traiter des reçus avec le préréglage Facture pour capturer précisément les montants et les dates
- Créer des PDF accessibles à partir de numérisations en image seule pour des exigences de conformité
- Extraire en lot le contenu textuel de livres ou de manuels numérisés

## Astuces

- Sélectionnez plusieurs langues si votre document mélange les langues (par ex. des titres en anglais avec un corps de texte en japonais).
- Utilisez l'option de binarisation pour les documents au texte pâle ou peu contrasté : elle peut nettement améliorer la précision de la reconnaissance.
- Les préréglages de liste blanche Facture et Formulaires réduisent fortement les faux positifs sur les documents structurés en ignorant les formes de caractères non pertinentes.

## Outils associés

- [Extraire les tableaux PDF](./extract-tables)
- [Fusionner des PDF](./merge-pdf)
- [Compresser un PDF](./compress-pdf)
