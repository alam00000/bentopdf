---
title: Signatura digital de PDF
description: Afegeix signatures digitals criptogràfiques als PDF amb certificats X.509. Admet els formats PKCS#12 i PEM amb opcions de signatura visible.
---

# Signatura digital de PDF

Una signatura digital és una prova criptogràfica que una persona concreta ha signat un document i que el document no s'ha alterat des de llavors. A diferència d'una signatura dibuixada (que és només una imatge), una signatura digital fa servir certificats X.509 i els estàndards PKCS#7 per oferir autenticitat i integritat verificables.

BentoPDF aplica les signatures digitals íntegrament al teu navegador. La teva clau privada no surt mai del dispositiu.

## Com funciona

1. Puja un fitxer PDF.
2. Puja el fitxer del teu certificat (.pfx, .p12 o .pem).
3. Introdueix la contrasenya del certificat per desbloquejar-lo. L'eina mostra el subjecte, l'emissor i el període de validesa del certificat.
4. Si vols, configura les metadades de la signatura (motiu, ubicació, informació de contacte).
5. Si vols, activa una **signatura visible** amb personalització de la posició, la mida, la imatge i el text.
6. Fes clic a **Signa PDF**.

## Formats de certificat compatibles

| Format      | Extensions | Descripció                                                                                                            |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12 | Paquet estàndard del sector que conté la clau privada i la cadena de certificats. El format més habitual.             |
| **PEM**     | .pem       | Format basat en text. Ha de contenir el certificat i la clau privada en un sol fitxer. Admet claus privades xifrades. |

## Opcions de la signatura visible

Quan s'activa, es renderitza un bloc de signatura visible a la pàgina del PDF:

- **Posició**: coordenades X/Y i amplada/alçada en punts
- **Pàgina**: primera pàgina, última pàgina, totes les pàgines o un número de pàgina concret
- **Imatge**: puja una imatge PNG, JPG o WebP (la teva signatura manuscrita, el segell de l'empresa, etc.)
- **Text**: text personalitzat amb color i mida de lletra configurables. Si no es proporciona cap imatge ni text, l'eina genera automàticament un text a partir del nom comú del certificat i la data actual.

## Metadades de la signatura

- **Motiu**: per què s'ha signat el document (p. ex., "Aprovat", "Revisat")
- **Ubicació**: on s'ha fet la signatura (p. ex., "Barcelona")
- **Informació de contacte**: com contactar amb el signant (p. ex., una adreça electrònica)

## Nota sobre la connexió a internet

Pot ser que signar requereixi una connexió a internet. La biblioteca de signatura obté la cadena de certificats d'unes URL incrustades a l'extensió Authority Information Access (AIA) del teu certificat. Si aquests servidors no són accessibles, la signatura fallarà amb els certificats que requereixen validació de la cadena.

## Casos d'ús

- Signar contractes, propostes i acords amb signatures digitals jurídicament vinculants
- Certificar documents oficials en fluxos de treball que requereixen autenticació basada en PKI
- Signar factures en PDF per complir la normativa (molts països de la UE exigeixen factures electròniques signades digitalment)
- Afegir l'aprovació d'una organització a plànols d'enginyeria o documents de qualitat

## Consells

- Els certificats autosignats serveixen per fer proves, però mostraran advertències a l'Adobe Reader. Fes servir un certificat d'una autoritat de certificació de confiança per als documents en producció.
- La signatura visible és purament visual. La signatura criptogràfica s'incrusta tant si el bloc visible està activat com si no.
- Verifica el PDF signat amb l'eina Valida la signatura d'un PDF per confirmar que la signatura està intacta.

## Eines relacionades

- [Valida la signatura d'un PDF](./validate-signature-pdf): verifica les signatures digitals dels PDF signats
- [Aplana PDF](./flatten-pdf): aplana els formularis abans de signar per evitar modificacions
- [Xifra PDF](./protect-pdf): afegeix protecció amb contrasenya a sobre de la signatura digital
- [Elimina les metadades](./remove-metadata): elimina les metadades abans de signar
