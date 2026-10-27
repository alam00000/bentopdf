---
title: Compresser un PDF
description: Réduisez la taille d'un PDF jusqu'à 90 % avec le moteur Hyper Compress. Prend en charge les tailles cibles, le traitement par lots et des réglages de qualité personnalisés.
---

# Compresser un PDF

Réduisez le poids de vos fichiers PDF sans les abîmer. Compresser un PDF s'appuie sur [Hyper Compress](https://www.bentopdf.com/hyper-compress), le moteur de compression propre à BentoPDF. Il recompresse les images, crée des sous-ensembles de polices et les fusionne, et supprime le superflu comme les miniatures intégrées et les données privées d'applications. Le PDF reste pleinement fonctionnel : le texte reste sélectionnable, les liens et les champs de formulaire continuent de fonctionner.

Hyper Compress est compilé en WebAssembly et livré avec BentoPDF, la compression fonctionne donc hors ligne et dans les déploiements isolés du réseau, sans configuration supplémentaire.

## Fonctionnement

1. Importez un ou plusieurs PDF en cliquant sur la zone de dépôt ou en y glissant des fichiers.
2. Choisissez un **Niveau de compression** : Faible, Moyen, Élevé ou Sans perte.
3. Saisissez éventuellement une **Taille de fichier cible**, ou développez **Paramètres personnalisés** pour un contrôle précis, y compris **Convertir en niveaux de gris**.
4. Cliquez sur **Compresser un PDF**. Pour plusieurs fichiers, vous obtenez un seul téléchargement ZIP.

## Documents particuliers

- **Les PDF signés numériquement** sont renvoyés tels quels, car toute modification invaliderait la signature. Activez **Ignorer la protection du contenu** dans les paramètres personnalisés pour supprimer les signatures et les compresser ; la signature visible reste sur la page, mais le fichier n'est plus signé.
- **Les fichiers PDF/A** perdent leur étiquette PDF/A après la compression, afin que le fichier ne prétende jamais à une conformité qu'il ne respecte plus. Activez **Préserver le PDF/A** dans les paramètres personnalisés pour garder le fichier conforme.
- **Les PDF protégés par mot de passe** affichent un champ de mot de passe sur la carte de leur fichier. Saisissez-y le mot de passe et Hyper Compress ouvre lui-même le fichier, sans étape de déverrouillage séparée. Avec au moins deux fichiers verrouillés, un champ partagé déverrouille tous les fichiers qui utilisent le même mot de passe. La copie compressée n'a pas de mot de passe ; utilisez [Protéger un PDF](./protect-pdf) pour en ajouter un à nouveau.
- **Les scans sans couche de texte** peuvent être réduits davantage avec **Rastériser les pages** dans les paramètres personnalisés, qui remplace chaque page par une image optimisée. Cette option est ignorée pour tout document contenant du texte sélectionnable, y compris les scans traités par OCR, sauf si **Ignorer la protection du contenu** est activé. Les pages de texte deviennent alors aussi des images : le texte n'est plus sélectionnable et les liens ne fonctionnent plus.

## Niveaux de compression

| Niveau         | Qualité d'image | Résolution max. | Idéal pour                                 |
| -------------- | --------------- | --------------- | ------------------------------------------ |
| **Faible**     | 80              | 200 DPI         | Préserver la qualité visuelle              |
| **Moyen**      | 50              | 150 DPI         | Documents courants                         |
| **Élevé**      | 20              | 72 DPI          | Pièces jointes d'e-mail, envois sur le web |
| **Sans perte** | Images intactes | Inchangée       | Copies d'archivage                         |

Le niveau Élevé retire aussi l'incorporation des 14 polices PDF standard, ainsi que des polices similaires comme Arial lorsque c'est sans risque.

## Taille de fichier cible

Saisissez une taille en Ko ou en Mo et Hyper Compress recherche la meilleure qualité d'image qui tienne encore dans cette taille, en partant du niveau choisi. Si le document ne peut pas devenir aussi petit, vous obtenez la plus petite version possible et un message vous l'indique. Les pages dédiées, comme [Compresser un PDF à 1 Mo](https://www.bentopdf.com/compress-pdf-to-1mb), s'ouvrent avec la cible déjà renseignée.

## Paramètres personnalisés

Développez le panneau Paramètres personnalisés pour régler directement Hyper Compress. Choisir un niveau de compression réinitialise ces paramètres aux valeurs de ce niveau, et en modifier un fait passer le niveau sur Personnalisé.

- **Ignorer la protection du contenu** : par défaut, Hyper Compress laisse intacts les PDF signés et ne rastérise pas les pages contenant du texte. Activer cette option contourne les deux. Elle reste activée lorsque vous changez de niveau.

- **Images** : qualité d'image, résolution maximale, rééchantillonnage forcé, réduction des couleurs, découpe des zones d'image invisibles, suppression des images alternatives, simplification des profils de couleur, JPEG 2000 et mode sans perte
- **Polices** : création de sous-ensembles, fusion des doublons et retrait de l'incorporation des polices standard et de leurs équivalents
- **Contenu** : aplatissement des annotations, des champs de formulaire ou des liens
- **Nettoyage** : suppression des miniatures, des données d'application, des fils d'articles, des informations de capture web, de l'arbre de structure ou des intentions de sortie
- **Rastérisation** : remplacement des pages par des images, pour les scans composés uniquement d'images ; ignorée lorsque le document contient du texte sélectionnable
- **Sortie** : Préserver le PDF/A, et compression Brotli pour les lecteurs PDF 2.0 qui la prennent en charge

## Cas d'usage

- Ramener un rapport de 50 Mo sous la limite de taille d'une pièce jointe d'e-mail
- Faire passer un scan sous la limite d'envoi stricte d'un portail grâce à une taille de fichier cible
- Optimiser des PDF marketing pour des téléchargements plus rapides sur un site web
- Archiver de gros ensembles de documents lorsque le coût de stockage compte
- Réduire la consommation de données mobiles lors du partage de PDF via des applications de messagerie

## Conseils

- Commencez par Moyen. Si le résultat est encore trop gros, définissez une taille de fichier cible ou passez à Élevé.
- Pour un scan sans couche de texte, activez Rastériser les pages dans les paramètres personnalisés.
- Convertir en niveaux de gris, dans les paramètres personnalisés, peut réduire la taille des documents très colorés.

## Outils associés

- [Optimiser pour le web](./linearize-pdf) : optimisez le PDF compressé pour un affichage web rapide
- [Rastériser le PDF](./rasterize-pdf) : convertissez les pages en images à un DPI précis, y compris les pages contenant du texte
- [Réparer un PDF](./repair-pdf) : réparez un PDF endommagé par une compression effectuée ailleurs
- [Supprimer les métadonnées](./remove-metadata) : supprimez les données cachées pour préserver la confidentialité
