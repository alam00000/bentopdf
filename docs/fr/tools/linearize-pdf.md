---
title: Optimiser pour le web
description: Optimisez les fichiers PDF pour un affichage web rapide avec chargement progressif. Aussi appelé optimisation « Fast Web View ».
---

# Optimiser pour le web

La linéarisation restructure un PDF afin que la première page puisse s'afficher avant la fin du téléchargement du fichier complet. Adobe appelle cela « Fast Web View ». Si vous hébergez des PDF sur un site web ou les diffusez via un portail de documents, la linéarisation les rend nettement plus rapides à ouvrir.

## Fonctionnement

1. Envoyez un ou plusieurs fichiers PDF.
2. Cliquez sur **Linéariser le(s) PDF**.
3. Téléchargez les résultats sous forme d'archive ZIP contenant tous les fichiers linéarisés.

Il n'y a aucun réglage à configurer. L'outil utilise l'option `--linearize` de QPDF, qui réorganise la structure interne du PDF sans modifier son contenu visuel.

## Ce que fait la linéarisation

- Réordonne les objets du PDF pour que les données de la première page se trouvent au début du fichier
- Ajoute un dictionnaire de linéarisation et des tables d'indices pour que les lecteurs sachent où trouver chaque page
- Permet les requêtes par plage d'octets : un navigateur peut récupérer uniquement la première page sans télécharger tout le fichier
- Nettoie la table de références croisées pour un accès aléatoire efficace

## Fonctionnalités

- Traitement par lots de plusieurs PDF en une seule opération
- Le résultat conserve tout le contenu, les polices, les images et les éléments interactifs
- Utilise QPDF (WebAssembly) pour une linéarisation fiable et conforme aux normes
- Les résultats sont regroupés dans un ZIP pour un téléchargement facile

## Cas d'usage

- Héberger des rapports PDF sur un site web où les utilisateurs attendent un affichage instantané
- Intégrer des PDF dans des applications web avec des lecteurs dans le navigateur
- Publier des catalogues ou des manuels PDF consultés sur des connexions mobiles lentes
- Préparer des documents pour des réseaux de diffusion de contenu (CDN) qui prennent en charge les plages d'octets

## Astuces

- Linéarisez une fois toutes les autres modifications terminées. Toute modification ultérieure (fusion, ajout de pages) casse la linéarisation.
- Combinez avec Compresser un PDF pour obtenir les PDF les plus légers et les plus rapides à charger.
- La linéarisation ajoute un léger surcoût à la taille du fichier (généralement moins de 1 %).

## Outils associés

- [Compresser un PDF](./compress-pdf) : réduisez la taille du fichier avant de le linéariser
- [Réparer un PDF](./repair-pdf) : corrigez les problèmes de structure qui empêchent la linéarisation
- [Supprimer les métadonnées](./remove-metadata) : retirez les métadonnées avant la publication en ligne
