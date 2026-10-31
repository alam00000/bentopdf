---
title: Valider la signature
description: Vérifiez les signatures numériques des fichiers PDF. Contrôlez la validité du certificat, l'identité du signataire, l'intégrité du document et l'état de la chaîne de confiance.
---

# Valider la signature

Importez un PDF signé : cet outil extrait chaque signature numérique, identifie le signataire, vérifie la validité du certificat et indique si le document a été modifié depuis la signature. Vous pouvez aussi fournir un certificat de confiance pour vérifier la chaîne de signature.

## Fonctionnement

1. Importez un fichier PDF signé. La validation démarre automatiquement.
2. L'outil affiche un résumé : nombre de signatures trouvées et nombre de signatures valides.
3. Chaque signature dispose d'une fiche détaillée indiquant le nom du signataire, l'émetteur, les dates et l'état.
4. Vous pouvez éventuellement importer un **certificat de confiance** (.pem, .crt, .cer, .der) pour vérifier la signature par rapport à une ancre de confiance précise. La revalidation s'exécute automatiquement.

## Ce qui est vérifié

### Analyse de la signature

L'outil extrait les objets de signature PKCS#7 du PDF, décode la structure ASN.1 et récupère le certificat X.509 du signataire ainsi que toute chaîne de certificats intégrée à la signature.

### Validité du certificat

- **Expiration** : le certificat se trouve-t-il actuellement dans sa période de validité ?
- **Détection de l'auto-signature** : le certificat est-il son propre émetteur ?
- **Chaîne de confiance** : lorsqu'un certificat de confiance est fourni, le certificat du signataire remonte-t-il jusqu'à lui ?

### Vérification cryptographique

- L'outil reconstruit les octets couverts par le `/ByteRange` de la signature, les hache avec l'algorithme déclaré par le signataire et compare le résultat à l'attribut `messageDigest` contenu dans la signature.
- Il resérialise ensuite les attributs signés sous forme d'ensemble DER SET et vérifie la signature à l'aide de la clé publique du certificat du signataire.
- **Une signature n'est déclarée valide que si toutes ces vérifications réussissent.** Si les octets du PDF ont été modifiés après la signature, ou si la signature intégrée ne correspond pas à la clé du signataire, l'état affiche « Invalide : échec de la vérification cryptographique » avec la raison précise.

#### Algorithmes de signature pris en charge

| Algorithme              | Chemin de vérification                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, avec repli sur Web Crypto                                  |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                        |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` après conversion de signature DER → IEEE P1363 |

Si une signature utilise un algorithme absent de cette liste (par exemple Ed25519, SM2 ou RSA avec un OID de condensat inhabituel), la fiche affiche **« Non vérifiée : algorithme de signature non pris en charge »** en jaune, avec l'OID ou la raison précise. Il s'agit d'une distinction volontaire à trois états :

- **Valide** : la signature a été vérifiée cryptographiquement avec la clé publique du signataire.
- **Invalide** : la vérification a été exécutée et a donné un résultat négatif (octets modifiés, clé non correspondante).
- **Non vérifiée** : l'outil n'a pas pu exécuter la vérification pour cet algorithme. Les métadonnées du certificat sont toujours affichées, mais vous devez considérer la signature comme « inconnue » et la vérifier avec Adobe Acrobat ou `openssl cms -verify`.

### Algorithmes de condensat non sûrs

- Les signatures utilisant **MD5 ou SHA-1** sont rejetées comme invalides et signalées par l'état « Condensat non sûr ». Ces deux algorithmes ont fait l'objet d'attaques par collision publiées, donc une signature sur un condensat SHA-1 ou MD5 n'offre aucune garantie d'intégrité.
- SHA-224, SHA-256, SHA-384 et SHA-512 sont tous acceptés.

### Couverture du document

- **Couverture complète** : la signature couvre l'intégralité du fichier PDF, ce qui signifie qu'aucun octet n'a été ajouté ou modifié après la signature.
- **Couverture partielle** : la signature ne couvre qu'une partie du fichier. Cela peut indiquer des modifications effectuées après la signature (pas nécessairement malveillantes : les enregistrements incrémentiels produisent une couverture partielle).

## Détails de la signature

Chaque fiche de signature affiche :

- **Signé par** : nom courant, organisation et e-mail provenant du certificat du signataire
- **Émetteur** : l'autorité de certification qui a émis le certificat du signataire
- **Signé le** : l'horodatage intégré à la signature
- **Valide du / Valide jusqu'au** : la période de validité du certificat
- **Motif** : la raison de la signature du document (si elle est fournie)
- **Lieu** : l'endroit où le document a été signé (s'il est fourni)
- **État de la couverture** : complète ou partielle
- **Badge de confiance** : approuvé ou hors de la chaîne de confiance (uniquement lorsqu'un certificat personnalisé est fourni)

### Détails techniques

Développez la section des détails techniques pour afficher :

- Le numéro de série du certificat du signataire
- L'algorithme de condensat (SHA-256, SHA-512, etc.)
- L'algorithme de signature (RSA avec SHA-256, ECDSA avec SHA-256, etc.)
- Les messages d'erreur pour les signatures invalides

## Cas d'usage

- Vérifier un contrat signé numériquement avant de le contresigner
- Auditer des documents signés pour confirmer qu'ils n'ont pas été altérés
- Vérifier si un certificat a expiré depuis la signature du document
- Valider des signatures par rapport au certificat racine de votre organisation
- Examiner les détails de signature de documents administratifs ou juridiques

## Conseils

- Un certificat auto-signé ne signifie pas que la signature est invalide : cela signifie que l'identité du signataire ne peut pas être vérifiée par un tiers de confiance. C'est courant pour les documents internes.
- Une couverture partielle n'indique pas toujours une falsification. De nombreux flux de travail PDF ajoutent des mises à jour incrémentielles (comme une deuxième signature) qui créent une couverture partielle.
- Importez le certificat racine ou intermédiaire de votre organisation comme certificat de confiance pour obtenir la vérification de la chaîne de confiance.

## Outils associés

- [Signature numérique](./digital-sign-pdf) : signer des PDF avec votre propre certificat
- [Aplatir un PDF](./flatten-pdf) : aplatir un PDF avant la signature pour empêcher les modifications postérieures
- [Supprimer les métadonnées](./remove-metadata) : nettoyer un PDF avant d'appliquer une signature
