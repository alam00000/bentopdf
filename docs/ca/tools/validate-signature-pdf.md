---
title: Valida la signatura
description: Verifica les signatures digitals dels fitxers PDF. Comprova la validesa del certificat, la identitat del signant, la integritat del document i l'estat de la cadena de confiança.
---

# Valida la signatura

Puja un PDF signat i aquesta eina n'extreu totes les signatures digitals, identifica el signant, comprova la validesa del certificat i indica si el document s'ha modificat després de signar-lo. També pots proporcionar un certificat de confiança per verificar la cadena de signatura.

## Com funciona

1. Puja un fitxer PDF signat. La validació comença automàticament.
2. L'eina mostra un resum: nombre de signatures trobades i quantes són vàlides.
3. Cada signatura té una targeta detallada amb el nom del signant, l'emissor, les dates i l'estat.
4. Opcionalment, puja un **certificat de confiança** (.pem, .crt, .cer, .der) per verificar la signatura amb una àncora de confiança concreta. La revalidació s'executa automàticament.

## Què es comprova

### Anàlisi de la signatura

L'eina extreu els objectes de signatura PKCS#7 del PDF, descodifica l'estructura ASN.1 i n'obté el certificat X.509 del signant, juntament amb qualsevol cadena de certificats inclosa a la signatura.

### Validesa del certificat

- **Caducitat**: el certificat és actualment dins del seu període de validesa?
- **Detecció d'autosignatura**: el certificat és el seu propi emissor?
- **Cadena de confiança**: quan es proporciona un certificat de confiança, el certificat del signant enllaça amb aquest?

### Verificació criptogràfica

- L'eina reconstrueix els bytes coberts per `/ByteRange` de la signatura, en calcula el resum amb l'algorisme declarat pel signant i compara el resultat amb l'atribut `messageDigest` de la signatura.
- Després torna a serialitzar els atributs signats com a DER SET i verifica la signatura amb la clau pública del certificat del signant.
- **Una signatura es considera vàlida només quan totes aquestes comprovacions es superen.** Si els bytes del PDF s'han modificat després de signar, o la signatura incrustada no coincideix amb la clau del signant, l'estat mostra «No vàlida: la verificació criptogràfica ha fallat» amb el motiu concret.

#### Algorismes de signatura admesos

| Algorisme               | Camí de verificació                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, amb alternativa a Web Crypto                         |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                  |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` després de la conversió DER → IEEE P1363 |

Si una signatura utilitza un algorisme que no és a la llista (per exemple Ed25519, SM2 o RSA amb un OID de resum poc habitual), la targeta mostra **«No verificada: algorisme de signatura no compatible»** en groc, juntament amb l'OID o el motiu concret. És una distinció deliberada de tres estats:

- **Vàlida**: la signatura s'ha verificat criptogràficament amb la clau pública del signant.
- **No vàlida**: la verificació s'ha executat i ha donat un resultat negatiu (bytes modificats, clau no coincident).
- **No verificada**: l'eina no ha pogut executar la verificació per a aquest algorisme. Les metadades del certificat es mostren igualment, però has de tractar la signatura com a «desconeguda» i verificar-la amb Adobe Acrobat o `openssl cms -verify`.

### Algorismes de resum insegurs

- Les signatures que utilitzen **MD5 o SHA-1** es rebutgen com a no vàlides i es marquen amb l'estat «Resum insegur». Tots dos algorismes tenen atacs de col·lisió publicats, de manera que una signatura sobre un resum SHA-1 o MD5 no ofereix cap garantia d'integritat.
- SHA-224, SHA-256, SHA-384 i SHA-512 s'accepten tots.

### Cobertura del document

- **Cobertura completa**: la signatura cobreix tot el fitxer PDF, és a dir, no s'ha afegit ni canviat cap byte després de signar.
- **Cobertura parcial**: la signatura només cobreix una part del fitxer. Pot indicar que s'han fet modificacions després de signar (no necessàriament malintencionades: els desats incrementals produeixen cobertura parcial).

## Detalls de la signatura

Cada targeta de signatura mostra:

- **Signat per**: nom comú, organització i correu electrònic del certificat del signant
- **Emissor**: l'autoritat de certificació que va emetre el certificat del signant
- **Signat el**: la marca de temps incrustada a la signatura
- **Vàlid des de / Vàlid fins a**: el període de validesa del certificat
- **Motiu**: per què es va signar el document (si es proporciona)
- **Ubicació**: on es va signar (si es proporciona)
- **Estat de cobertura**: completa o parcial
- **Insígnia de confiança**: de confiança o fora de la cadena de confiança (només quan es proporciona un certificat personalitzat)

### Detalls tècnics

Desplega la secció de detalls tècnics per veure:

- El número de sèrie del certificat del signant
- L'algorisme de resum (SHA-256, SHA-512, etc.)
- L'algorisme de signatura (RSA amb SHA-256, ECDSA amb SHA-256, etc.)
- Els missatges d'error de les signatures no vàlides

## Casos d'ús

- Verificar un contracte signat digitalment abans de contrasignar-lo
- Auditar documents signats per confirmar que no s'han manipulat
- Comprovar si un certificat ha caducat des que es va signar el document
- Validar signatures amb el certificat arrel de la teva organització
- Inspeccionar els detalls de signatura de documents governamentals o legals

## Consells

- Un certificat autosignat no vol dir que la signatura no sigui vàlida: vol dir que la identitat del signant no es pot verificar mitjançant un tercer de confiança. És habitual en documents interns.
- La cobertura parcial no sempre indica manipulació. Molts fluxos de treball amb PDF afegeixen actualitzacions incrementals (com una segona signatura) que creen cobertura parcial.
- Puja el certificat arrel o intermedi de la teva organització com a certificat de confiança per obtenir la verificació de la cadena de confiança.

## Eines relacionades

- [Signatura digital de PDF](./digital-sign-pdf): signa PDF amb el teu propi certificat
- [Aplana PDF](./flatten-pdf): aplana un PDF abans de signar-lo per evitar modificacions posteriors a la signatura
- [Elimina les metadades](./remove-metadata): neteja un PDF abans d'aplicar-hi una signatura
