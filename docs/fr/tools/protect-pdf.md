---
title: Protéger un PDF
description: Protégez vos fichiers PDF par mot de passe avec un chiffrement AES 256 bits. Définissez des mots de passe utilisateur et propriétaire avec des restrictions d'usage configurables.
---

# Protéger un PDF

Verrouillez votre PDF par un mot de passe pour que seules les personnes autorisées puissent l'ouvrir. BentoPDF utilise le chiffrement AES 256 bits, le même standard que celui des banques et des administrations, appliqué entièrement dans votre navigateur via QPDF.

## Fonctionnement

1. Importez un fichier PDF.
2. Saisissez un **mot de passe utilisateur** (obligatoire). C'est le mot de passe nécessaire pour ouvrir le fichier.
3. Saisissez éventuellement un **mot de passe propriétaire**. Une fois défini, le PDF reçoit des restrictions d'usage qui empêchent l'impression, la modification, la copie et l'annotation.
4. Cliquez sur **Chiffrer le PDF**.
5. Téléchargez le fichier chiffré.

## Types de mots de passe

### Mot de passe utilisateur (obligatoire)

Le mot de passe utilisateur est celui que les destinataires saisissent pour ouvrir le PDF. Sans lui, le document est totalement inaccessible. Tout PDF chiffré doit en avoir un.

### Mot de passe propriétaire (facultatif)

Le mot de passe propriétaire contrôle ce qu'un utilisateur autorisé peut faire après l'ouverture du fichier. Lorsque vous définissez un mot de passe propriétaire distinct, BentoPDF applique automatiquement le jeu de restrictions le plus strict :

- Modification désactivée
- Extraction et copie désactivées
- Impression désactivée
- Annotation désactivée
- Remplissage de formulaires désactivé
- Assemblage du document désactivé

Si vous laissez le mot de passe propriétaire vide, le PDF est chiffré (le mot de passe utilisateur reste requis pour l'ouvrir) mais n'a aucune restriction d'usage une fois ouvert.

## Détails du chiffrement

- **Algorithme** : AES-256 (Advanced Encryption Standard 256 bits)
- **Longueur de clé** : 256 bits
- **Standard** : chiffrement PDF 2.0 (implémentation QPDF)

Avec la technologie actuelle, l'AES-256 est impossible à casser par force brute. La sécurité de votre PDF chiffré dépend entièrement de la robustesse de votre mot de passe.

## Cas d'usage

- Protéger des rapports financiers confidentiels avant de les envoyer par email
- Sécuriser des documents juridiques partagés avec la partie adverse
- Ajouter un mot de passe à des dossiers médicaux ou à des données personnelles identifiables
- Distribuer du contenu payant (e-books, rapports) avec contrôle d'accès
- Respecter des politiques de protection des données qui exigent le chiffrement au repos

## Conseils

- Utilisez un mot de passe fort et unique. Une phrase de passe d'au moins 12 caractères mêlant majuscules, minuscules, chiffres et symboles est idéale.
- Partagez le mot de passe par un canal distinct (téléphone, SMS), jamais dans le même email que le PDF.
- Si vous voulez seulement restreindre des actions (pas d'impression, pas de copie) sans exiger de mot de passe pour ouvrir le fichier, utilisez plutôt l'outil Modifier les autorisations.

## Outils associés

- [Déchiffrer un PDF](./unlock-pdf) : retirer le chiffrement quand vous connaissez le mot de passe
- [Modifier les autorisations](./change-permissions) : modifier des restrictions d'usage précises
- [Supprimer les restrictions](./remove-restrictions) : retirer toute la sécurité d'un PDF
- [Nettoyer un PDF](./sanitize-pdf) : supprimer le contenu masqué avant de chiffrer
