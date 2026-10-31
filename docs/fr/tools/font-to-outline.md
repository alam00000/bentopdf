---
title: Polices en contours
description: Convertissez toutes les polices d'un PDF en contours vectoriels pour un rendu identique sur tous les appareils. Élimine les problèmes de dépendance aux polices.
---

# Polices en contours

Convertir les polices en contours transforme chaque caractère, d'un glyphe de police en un tracé vectoriel. Le PDF ne dépend plus d'aucune police installée : il s'affiche à l'identique sur chaque appareil, chaque système d'exploitation et chaque imprimante. C'est une étape standard des flux de prépresse.

## Fonctionnement

1. Envoyez un ou plusieurs fichiers PDF.
2. Cliquez sur **Convertir en contours**.
3. Ghostscript convertit tout le texte en tracés vectoriels.
4. Téléchargez le résultat. Plusieurs fichiers produisent une archive ZIP.

Aucun réglage n'est à configurer. L'outil utilise Ghostscript (WebAssembly) pour convertir toutes les références de police en tracés dessinés, en une seule passe.

## Ce qui change

- Les caractères deviennent des courbes vectorielles (tracés de Bézier)
- L'incorporation des polices n'est plus nécessaire : le PDF est autonome au niveau des glyphes
- La taille du fichier peut augmenter, car les tracés vectoriels sont généralement plus lourds que les références de police
- L'apparence visuelle est conservée à l'identique

## Ce que vous perdez

- La sélection et le copier-coller du texte
- La recherche dans le texte (Ctrl+F ne fonctionne plus)
- La possibilité de modifier le contenu textuel
- L'accessibilité pour les lecteurs d'écran

## Cas d'usage

- Envoyer des PDF à un imprimeur qui exige des polices vectorisées
- Partager des documents qui utilisent des polices personnalisées ou sous licence avec des personnes qui ne les ont pas
- Éviter la substitution de polices qui change l'aspect de votre document sur d'autres systèmes
- Préparer des PDF pour la gravure laser ou la découpe CNC, qui exigent une source vectorielle
- S'assurer qu'un PDF riche en logos s'affiche correctement sur toutes les plateformes

## Astuces

- Conservez votre PDF d'origine. La conversion en contours est irréversible : il est impossible de retransformer les tracés en texte modifiable.
- Si le texte doit rester consultable, envisagez plutôt l'outil Rastériser le PDF suivi d'une OCR.
- Les PDF en contours sont généralement plus volumineux. Lancez ensuite Compresser un PDF si la taille compte.

## Outils associés

- [Aplatir le PDF](./flatten-pdf) : aplatit les formulaires et les annotations sans toucher aux polices
- [Rastériser le PDF](./rasterize-pdf) : convertit en PDF basé sur des images plutôt qu'en contours vectoriels
- [Compresser un PDF](./compress-pdf) : réduit la taille du fichier après la conversion en contours
- [PDF vers PDF/A](./pdf-to-pdfa) : convertissez pour l'archivage après avoir éliminé la dépendance aux polices
