---
title: Constructeur de workflow PDF
description: Construisez visuellement des chaînes de traitement PDF personnalisées en reliant des nœuds sur un canevas. Enchaînez des opérations comme la fusion, la compression, le filigrane et l'export.
---

# Constructeur de workflow PDF

Le Créateur de flux vous permet d'enchaîner plusieurs opérations PDF dans une seule chaîne automatisée. Au lieu d'exécuter les outils un par un, vous reliez un graphe visuel de nœuds (entrée, traitement, sortie) et exécutez le tout en un clic. Vos fichiers ne quittent jamais le navigateur.

## Fonctionnement

L'interface est divisée en trois panneaux : une **boîte à outils de nœuds** à gauche, le **canevas** au centre et un **panneau de réglages** à droite qui apparaît quand vous sélectionnez un nœud.

1. **Ajoutez des nœuds** en cliquant dessus dans la barre latérale gauche, ou en les glissant directement sur le canevas. Utilisez la barre de recherche en haut de la boîte à outils pour filtrer par nom.
2. **Reliez les nœuds** en glissant d'une prise de sortie (en bas d'un nœud) vers une prise d'entrée (en haut d'un autre nœud). Les connexions vont de haut en bas.
3. **Configurez les réglages** en cliquant sur un nœud pour ouvrir son panneau de réglages à droite. Chaque type de nœud a ses propres options (plages de pages, curseurs de qualité, mots de passe, etc.).
4. **Exécutez le flux** en cliquant sur le bouton **Exécuter** de la barre d'outils. Le moteur exécute les nœuds dans l'ordre topologique, un par un. Une barre d'état en bas suit la progression.
5. **Téléchargez les résultats** : le nœud Télécharger final enregistre le PDF obtenu (ou un ZIP si plusieurs fichiers sont produits).

## Catégories de nœuds

Les nœuds sont organisés en six catégories, chacune d'une couleur différente sur le canevas :

- **Entrée** (bleu) : Entrée PDF, Entrée image, Word/Excel/PowerPoint vers PDF et plus de 15 autres convertisseurs de formats qui alimentent la chaîne en fichiers.
- **Modifier et annoter** (indigo) : Rogner, Niveaux de gris, Inverser les couleurs, Filigrane, Numéros de page, En-tête et pied de page, Effet scanner, Ajuster les couleurs, Couleur de fond, Supprimer les pages blanches, Supprimer les annotations.
- **Organiser et gérer** (violet) : Fusionner, Scinder, Extraire des pages, Faire pivoter, Supprimer des pages, Inverser, Ajouter une page vierge, Diviser les pages, N-up, Uniformiser la taille des pages, Combiner en une seule page, Livret, Posteriser, Modifier les métadonnées, Table des matières, OCR.
- **Optimiser et réparer** (ambre) : Compresser, Rastériser, Linéariser, Redresser, PDF vers PDF/A, Police en contours, Réparer.
- **Sécuriser le PDF** (rose) : Chiffrer, Déchiffrer, Nettoyer, Aplatir, Signature numérique, Masquer.
- **Sortie** (turquoise) : Télécharger (détecte automatiquement PDF seul ou ZIP), PDF vers images, PDF vers texte, PDF vers DOCX, PDF vers XLSX, PDF vers CSV, PDF vers SVG, PDF vers Markdown, Extraire les images.

## Enregistrer et charger des flux

La barre d'outils propose quatre options de persistance :

- **Enregistrer** : stocke le flux actuel comme modèle nommé dans le stockage local de votre navigateur. Vous pouvez enregistrer plusieurs modèles.
- **Charger** : ouvre une fenêtre listant tous les modèles enregistrés. Cliquez sur Charger pour en restaurer un, ou supprimez les modèles dont vous n'avez plus besoin.
- **Exporter** : télécharge le flux sous forme de fichier `.json` pour le partager ou le sauvegarder.
- **Importer** : charge un fichier de flux `.json` depuis le disque, en restaurant tous les nœuds, positions et connexions.

Les modèles persistent d'une session à l'autre dans le stockage local. Les fichiers JSON exportés sont portables entre navigateurs et machines.

## Modèle d'exécution

Le moteur construit un graphe de dépendances à partir de vos connexions et exécute les nœuds dans l'ordre topologique. Si un nœud échoue, l'exécution s'arrête et le nœud en cause est marqué en rouge. Quelques règles à garder en tête :

- Chaque flux nécessite au moins un nœud **Entrée** et un nœud **Sortie**.
- Le moteur détecte les dépendances circulaires et bloque l'exécution avec une erreur.
- Le nœud **Chiffrer** doit être la dernière étape de traitement avant le nœud de sortie. Le placer plus tôt déclenche un avertissement de validation, car les nœuds suivants ne peuvent pas traiter des données chiffrées.
- Les PDF protégés par mot de passe demandent un mot de passe pendant l'exécution.
- Les entrées multi-PDF sont prises en charge : le nœud Fusionner peut les combiner, ou les nœuds de traitement par lots traiteront chaque PDF individuellement.

## Types de prises

Les connexions utilisent des prises typées pour éviter les branchements invalides :

- **PDF** (indigo) : un seul document PDF.
- **MultiPDF** (ambre) : plusieurs documents PDF regroupés.
- **Image** (vert) : un blob d'image.

## Options

Chaque nœud a sa propre configuration accessible via le panneau de réglages de droite. Parmi les cas courants :

- **Plages de pages** sur les nœuds Scinder, Extraire des pages et Supprimer des pages
- **Curseurs de qualité** sur les nœuds de sortie de conversion d'images
- **Champs de mot de passe** sur les nœuds Chiffrer et Déchiffrer
- **Champs de texte** pour Filigrane, En-tête et pied de page, Modifier les métadonnées
- **Angles de rotation** sur le nœud Faire pivoter
- **Niveau de compression** sur le nœud Compresser
- **Choix de la langue OCR** sur le nœud OCR

## Cas d'usage

- **Chaîne de traitement de factures** : Entrée PDF -> OCR -> Extraire les tableaux -> Télécharger en CSV.
- **Standardisation de rapports** : Word vers PDF -> Uniformiser la taille des pages -> Ajouter les numéros de page -> Filigrane -> Compresser -> Télécharger.
- **Préparation à l'archivage** : Entrée PDF -> Réparer -> Aplatir -> Nettoyer -> PDF vers PDF/A -> Télécharger.
- **Extraction d'images par lots** : Entrée PDF (plusieurs fichiers) -> Extraire les images -> Télécharger le ZIP.
- **Livrets prêts à imprimer** : Entrée PDF -> Livret -> Rogner -> Compresser -> Télécharger.
- **Diffusion sécurisée** : Entrée PDF -> Masquer -> Supprimer les annotations -> Chiffrer -> Télécharger.

## Astuces

- Utilisez **Suppr** ou **Retour arrière** pour retirer le nœud sélectionné du canevas.
- Cliquez sur le bouton **X** de la barre d'état d'un nœud pour le supprimer directement.
- Déplacez le canevas en cliquant et en faisant glisser sur un espace vide. Le curseur devient une main pendant le déplacement.
- Sur mobile, utilisez le bouton **+** de la barre d'outils pour afficher ou masquer la boîte à outils de nœuds.
- Si votre flux produit plusieurs fichiers de sortie, le nœud Télécharger les regroupe automatiquement dans un ZIP.
- Commencez simplement : construisez et testez une chaîne de deux nœuds avant d'ajouter de la complexité.

## Outils associés

- [PDF vers texte](./pdf-to-text)
- [PDF vers Excel](./pdf-to-excel)
- [Extraire les images](./extract-images)
- [PDF vers Markdown](./pdf-to-markdown)
