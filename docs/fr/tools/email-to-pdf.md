---
title: Email vers PDF
description: Convertissez des fichiers e-mail EML et MSG en PDF dans votre navigateur. Conserve les en-têtes, le corps et la liste des pièces jointes.
---

# Email vers PDF

Convertissez des e-mails enregistrés en PDF propres et imprimables. L'outil analyse les fichiers EML et MSG, extrait le message complet (en-têtes, contenu du corps et métadonnées des pièces jointes) et restitue le tout dans un PDF structuré. Utile pour la découverte juridique, la conservation de documents, ou simplement pour imprimer un e-mail important.

## Formats pris en charge

| Format | Extension | Remarques                                                                        |
| :----- | :-------- | :------------------------------------------------------------------------------- |
| EML    | `.eml`    | Format d'e-mail MIME standard (exporté par la plupart des clients de messagerie) |
| MSG    | `.msg`    | Format propriétaire de Microsoft Outlook                                         |

## Fonctionnement

1. Cliquez sur la zone d'import ou glissez-déposez vos fichiers EML ou MSG. Vous pouvez mélanger les deux formats dans un même lot.
2. Vérifiez la liste des fichiers. Retirez les entrées indésirables avec l'icône de corbeille, ou cliquez sur **Ajouter d'autres fichiers** pour inclure d'autres e-mails.
3. Configurez les options de conversion (voir ci-dessous).
4. Cliquez sur **Convertir en PDF**. L'outil analyse chaque e-mail, restitue le contenu en HTML mis en forme et le convertit en PDF avec le moteur PyMuPDF.
5. Un seul e-mail est téléchargé directement en PDF. Plusieurs e-mails sont regroupés dans `emails-converted.zip`.

## Options

| Option                                  | Par défaut | Description                                                                                                                           |
| :-------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Taille de page**                      | A4         | Choisissez entre les dimensions A4, Letter ou Legal.                                                                                  |
| **Inclure Cc et Cci**                   | Activé     | Lorsque cette option est activée, les listes de destinataires en Cc et Cci apparaissent dans la section d'en-tête de l'e-mail du PDF. |
| **Inclure la liste des pièces jointes** | Activé     | Lorsque cette option est activée, une liste des pièces jointes de l'e-mail (avec noms de fichiers et tailles) apparaît dans le PDF.   |

## Cas d'usage

- Archiver des échanges professionnels importants en PDF pour la conformité ou l'audit
- Imprimer des fils de discussion par e-mail pour des procédures judiciaires ou des demandes de communication de pièces
- Créer une trace permanente de confirmations de commande, de reçus ou de contrats reçus par e-mail
- Sauvegarder des fichiers Outlook MSG dans un format qui ne nécessite pas Outlook pour être lu
- Documenter des échanges avec le support client à partir de fichiers EML exportés

## Conseils

- Les fichiers EML (utilisés par Thunderbird, Apple Mail et la plupart des clients de messagerie) et les fichiers Outlook MSG sont tous deux pris en charge. Exportez les e-mails depuis votre client de messagerie et déposez-les directement dans l'outil.
- Les e-mails au format HTML conservent leur mise en forme dans le PDF. Les e-mails en texte brut sont restitués avec une mise en forme propre et lisible.
- La liste des pièces jointes affiche les noms de fichiers et les tailles, mais n'intègre pas les fichiers joints eux-mêmes dans le PDF.

## Outils associés

- [XML vers PDF](./xml-to-pdf)
- [XPS vers PDF](./xps-to-pdf)
