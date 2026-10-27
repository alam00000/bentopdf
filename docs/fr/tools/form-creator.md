---
title: Créer un formulaire PDF
description: Créez des formulaires PDF remplissables avec des champs de texte, cases à cocher, listes déroulantes, boutons radio et plus encore, par glisser-déposer.
---

# Créer un formulaire PDF

Concevez des formulaires PDF remplissables professionnels à partir de zéro ou en ajoutant des champs à un PDF existant. L'éditeur visuel vous permet de glisser-déposer des éléments de formulaire (champs de texte, cases à cocher, listes déroulantes, boutons radio, champs de signature, etc.) directement sur les aperçus de pages. Configurez les propriétés des champs, définissez des règles de visibilité conditionnelle et exportez un formulaire PDF entièrement interactif.

## Fonctionnement

1. Envoyez un PDF existant **ou** cliquez sur **Créer un PDF vierge** pour partir de zéro.
2. Pour un PDF vierge, sélectionnez une taille de page (Letter, A4, A5, Legal, Tabloid, A3 ou dimensions personnalisées).
3. L'éditeur de formulaire s'ouvre avec une barre d'outils des types de champs et une zone d'aperçu de la page.
4. Sélectionnez un type de champ dans la barre d'outils, puis cliquez sur la page pour le placer.
5. Faites glisser les champs pour les repositionner. Utilisez les poignées pour ajuster les dimensions.
6. Cliquez sur un champ pour ouvrir le panneau de propriétés, où vous pouvez définir le nom du champ, la valeur par défaut, la taille de police, l'alignement, etc.
7. Naviguez entre les pages avec les commandes de page.
8. Cliquez sur **Enregistrer** pour télécharger le PDF remplissable terminé.

## Fonctionnalités

- Placement des champs par glisser-déposer avec poignées visuelles de redimensionnement
- Types de champs : saisie de texte, texte multiligne, case à cocher, liste déroulante, bouton radio, signature, date, nombre et code-barres
- Panneau de propriétés pour configurer le nom, le libellé, la valeur par défaut, la taille de police, la couleur, l'alignement et la validation de chaque champ
- Actions sur les champs et règles de visibilité conditionnelle (afficher/masquer des champs selon la valeur d'autres champs)
- Navigation entre les pages pour les formulaires de plusieurs pages
- Extraction des champs existants : détecte et importe automatiquement les champs de formulaire des PDF envoyés
- Prise en charge des PDF envoyés comme des pages vierges en tant que support du formulaire
- Plusieurs tailles de page prédéfinies, ainsi que des dimensions personnalisées
- Génération de codes-barres grâce à bwip-js
- Gestion des groupes de boutons radio

## Options

**Tailles de page prédéfinies (pour les PDF vierges) :**

- Letter (8,5" x 11")
- A4 (210 mm x 297 mm)
- A5 (148 mm x 210 mm)
- Legal (8,5" x 14")
- Tabloid (11" x 17")
- A3 (297 mm x 420 mm)
- Personnalisée (précisez la largeur et la hauteur)

**Propriétés des champs (variables selon le type de champ) :**

- Nom, libellé et texte d'indication
- Valeur par défaut
- Famille, taille et couleur de la police
- Alignement du texte (gauche, centre, droite)
- Option champ obligatoire
- Option lecture seule
- Longueur maximale des champs de texte
- Liste d'options pour les listes déroulantes et les boutons radio
- Actions de visibilité conditionnelle

## Cas d'usage

- Créer des formulaires d'accueil d'employés avec des champs de texte pour les informations personnelles et des cases à cocher pour l'acceptation des règles
- Créer des questionnaires d'admission client avec des listes déroulantes pour le choix du service
- Concevoir des bons de commande avec des champs calculés et des identifiants en code-barres
- Créer des listes de contrôle d'inspection avec des boutons radio pour les notes réussi/échec
- Créer des formulaires d'enquête avec des questions de suivi conditionnelles qui apparaissent selon les réponses

## Astuces

- Si vous envoyez un PDF existant, l'outil tente d'extraire les champs de formulaire déjà présents, ce qui vous permet de les modifier ou d'en ajouter.
- Utilisez la fonction de groupe de boutons radio pour créer des choix mutuellement exclusifs. Les champs d'un même groupe partagent un nom de groupe.
- Testez votre formulaire en le téléchargeant puis en l'ouvrant dans le [Remplir un formulaire PDF](./form-filler) pour vérifier le comportement des champs.

## Outils associés

- [Remplir un formulaire PDF](./form-filler)
- [Signer un PDF](./sign-pdf)
- [Éditeur PDF](./edit-pdf)
