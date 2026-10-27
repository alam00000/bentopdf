---
title: Signature numérique PDF
description: Ajoutez des signatures numériques cryptographiques aux PDF avec des certificats X.509. Prend en charge les formats PKCS#12 et PEM, avec options de signature visible.
---

# Signature numérique PDF

Une signature numérique est la preuve cryptographique qu'une personne précise a signé un document et que ce dernier n'a pas été altéré depuis. Contrairement à une signature dessinée (qui n'est qu'une image), une signature numérique utilise des certificats X.509 et les standards PKCS#7 pour garantir une authenticité et une intégrité vérifiables.

BentoPDF applique les signatures numériques entièrement dans votre navigateur. Votre clé privée ne quitte jamais votre appareil.

## Fonctionnement

1. Importez un fichier PDF.
2. Importez votre fichier de certificat (.pfx, .p12 ou .pem).
3. Saisissez le mot de passe du certificat pour le déverrouiller. L'outil affiche le sujet du certificat, l'émetteur et la période de validité.
4. Configurez éventuellement les métadonnées de la signature (motif, lieu, coordonnées).
5. Activez éventuellement une **signature visible** avec personnalisation de la position, de la taille, de l'image et du texte.
6. Cliquez sur **Signer le PDF**.

## Formats de certificat pris en charge

| Format      | Extensions | Description                                                                                                                            |
| ----------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12 | Bundle standard du secteur contenant la clé privée et la chaîne de certificats. Format le plus courant.                                |
| **PEM**     | .pem       | Format texte. Doit contenir à la fois le certificat et la clé privée dans un seul fichier. Prend en charge les clés privées chiffrées. |

## Options de signature visible

Lorsqu'elle est activée, un bloc de signature visible est rendu sur la page du PDF :

- **Position** : coordonnées X/Y et largeur/hauteur en points
- **Page** : première page, dernière page, toutes les pages ou un numéro de page précis
- **Image** : importez une image PNG, JPG ou WebP (votre signature manuscrite, le sceau de votre entreprise, etc.)
- **Texte** : texte personnalisé avec couleur et taille de police configurables. Si aucune image ni aucun texte n'est fourni, l'outil génère automatiquement un texte à partir du nom commun du certificat et de la date du jour.

## Métadonnées de la signature

- **Motif** : pourquoi le document a été signé (par ex. « Approuvé », « Relu »)
- **Lieu** : où la signature a eu lieu (par ex. « Paris »)
- **Coordonnées** : comment joindre le signataire (par ex. une adresse e-mail)

## Remarque sur la connexion Internet

La signature peut nécessiter une connexion Internet. La bibliothèque de signature récupère la chaîne de certificats à partir des URL intégrées dans l'extension Authority Information Access (AIA) de votre certificat. Si ces serveurs sont inaccessibles, la signature échouera pour les certificats qui exigent une validation de la chaîne.

## Cas d'usage

- Signer des contrats, des propositions et des accords avec des signatures numériques juridiquement contraignantes
- Certifier des documents officiels dans des flux de travail qui exigent une authentification basée sur une PKI
- Signer des factures PDF pour la conformité réglementaire (de nombreux pays de l'UE exigent des factures électroniques signées numériquement)
- Ajouter une approbation organisationnelle à des plans d'ingénierie ou à des documents qualité

## Conseils

- Les certificats auto-signés conviennent pour des tests, mais afficheront des avertissements dans Adobe Reader. Utilisez un certificat d'une autorité de certification de confiance pour les documents en production.
- La signature visible est purement visuelle. La signature cryptographique est intégrée que le bloc visible soit activé ou non.
- Vérifiez votre PDF signé avec l'outil Valider la signature PDF pour confirmer que la signature est intacte.

## Outils associés

- [Valider la signature PDF](./validate-signature-pdf) : vérifiez les signatures numériques des PDF signés
- [Aplatir le PDF](./flatten-pdf) : aplatissez les formulaires avant de signer pour empêcher les modifications
- [Protéger un PDF](./protect-pdf) : ajoutez une protection par mot de passe en plus de la signature numérique
- [Supprimer les métadonnées](./remove-metadata) : supprimez les métadonnées avant de signer
