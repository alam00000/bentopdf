---
title: PDF vers PDF/A
description: Convertissez des PDF standard au format PDF/A pour l'archivage à long terme. Prend en charge les niveaux de conformité PDF/A-1b, PDF/A-2b et PDF/A-3b.
---

# PDF vers PDF/A

PDF/A est un sous-ensemble du PDF normalisé par l'ISO, conçu pour la conservation numérique à long terme. Cet outil convertit vos PDF standard en documents conformes PDF/A avec Ghostscript, qui s'exécute directement dans votre navigateur.

## Fonctionnement

1. Envoyez un ou plusieurs fichiers PDF.
2. Sélectionnez une **version PDF/A** dans la liste déroulante.
3. Activez éventuellement **Aplatir le PDF au préalable** pour les fichiers complexes qui échouent à la conversion normale.
4. Cliquez sur **Convertir en PDF/A**. Plusieurs fichiers produisent une archive ZIP.

## Versions PDF/A

| Version      | Restrictions                                          | Idéal pour                                                    |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| **PDF/A-1b** | La plus stricte. Ni transparence ni calques.          | Compatibilité maximale avec les anciens systèmes d'archivage  |
| **PDF/A-2b** | Autorise la transparence et JPEG2000.                 | Archivage généraliste (recommandé)                            |
| **PDF/A-3b** | Autorise les pièces jointes intégrées de tout format. | Archivage de documents avec leurs fichiers de données sources |

PDF/A-2b est sélectionné par défaut et convient à la grande majorité des besoins d'archivage.

## Option d'aplatissement préalable

Certains PDF contiennent des éléments qui empêchent une conversion PDF/A propre : encodages de polices inhabituels, piles de transparence complexes ou structures internes endommagées. Activer **Aplatir au préalable** rastérise le PDF à 300 DPI avant la conversion, ce qui garantit la conformité au prix d'un texte non sélectionnable. Utilisez-la en solution de repli quand la conversion standard produit des erreurs.

L'aplatissement préalable nécessite le moteur WASM PyMuPDF.

## Cas d'usage

- Répondre aux exigences d'archivage administratives ou juridiques (de nombreuses juridictions imposent le PDF/A pour les dépôts judiciaires)
- Soumettre des documents à des dépôts institutionnels ou à des bibliothèques numériques
- Conserver des documents d'entreprise alors que le logiciel d'origine pourrait ne plus exister dans dix ans
- Préparer des factures pour les normes de facturation électronique qui exigent du PDF/A-3b avec des pièces jointes XML

## Astuces

- Essayez d'abord la conversion sans aplatissement préalable. Ne l'activez qu'en cas d'erreur.
- Le PDF/A intègre toutes les polices, les fichiers de sortie sont donc souvent plus volumineux que les originaux.
- Validez le résultat dans un validateur PDF/A dédié si une conformité stricte est nécessaire pour votre flux de travail.

## Outils associés

- [Compresser un PDF](./compress-pdf) : réduire la taille du fichier après la conversion
- [Aplatir le PDF](./flatten-pdf) : aplatir les formulaires avant la conversion en PDF/A
- [Supprimer les métadonnées](./remove-metadata) : retirer les métadonnées avant l'archivage
