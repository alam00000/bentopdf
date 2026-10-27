---
title: Validér signatur
description: Verificér digitale signaturer i PDF-filer. Kontrollér certifikatets gyldighed, underskriverens identitet, dokumentets integritet og status for tillidskæden.
---

# Validér signatur

Upload en signeret PDF, og værktøjet udtrækker hver digital signatur, identificerer underskriveren, kontrollerer certifikatets gyldighed og rapporterer, om dokumentet er ændret siden signeringen. Du kan også angive et betroet certifikat for at verificere signaturkæden.

## Sådan fungerer det

1. Upload en signeret PDF-fil. Valideringen starter automatisk.
2. Værktøjet viser en oversigt: antal fundne signaturer og hvor mange der er gyldige.
3. Hver signatur får et detaljeret kort med underskrivers navn, udsteder, datoer og status.
4. Du kan eventuelt uploade et **betroet certifikat** (.pem, .crt, .cer, .der) for at verificere signaturen mod et bestemt tillidsanker. Genvalidering kører automatisk.

## Hvad der kontrolleres

### Parsing af signatur

Værktøjet udtrækker PKCS#7-signaturobjekter fra PDF-filen, afkoder ASN.1-strukturen og henter underskriverens X.509-certifikat sammen med en eventuel certifikatkæde, der er indlejret i signaturen.

### Certifikatets gyldighed

- **Udløb**: Ligger certifikatet i øjeblikket inden for sin gyldighedsperiode?
- **Registrering af selvsignerede certifikater**: Er certifikatet sin egen udsteder?
- **Tillidskæde**: Når et betroet certifikat er angivet, fører underskriverens certifikat så tilbage til det?

### Kryptografisk verificering

- Værktøjet rekonstruerer de bytes, som signaturens `/ByteRange` dækker, hasher dem med den algoritme, underskriveren har angivet, og sammenligner resultatet med attributten `messageDigest` i signaturen.
- Derefter serialiseres de signerede attributter igen som et DER SET, og signaturen verificeres mod signaturcertifikatets offentlige nøgle.
- **En signatur rapporteres kun som gyldig, når alt dette lykkes.** Hvis PDF-bytes er ændret efter signeringen, eller den indlejrede signatur ikke passer til underskriverens nøgle, viser status "Ugyldig: kryptografisk verificering mislykkedes" med den konkrete årsag.

#### Understøttede signaturalgoritmer

| Algoritme               | Verificeringsvej                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, med Web Crypto som fallback                             |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                     |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` efter DER → IEEE P1363-signaturkonvertering |

Hvis en signatur bruger en algoritme uden for denne liste (for eksempel Ed25519, SM2 eller RSA med et usædvanligt digest-OID), viser kortet **"Ikke verificeret: signaturalgoritmen understøttes ikke"** med gul farve sammen med det konkrete OID eller den konkrete årsag. Det er en bevidst skelnen mellem tre tilstande:

- **Gyldig**: signaturen er kryptografisk verificeret mod underskriverens offentlige nøgle.
- **Ugyldig**: verificeringen kørte og gav et negativt resultat (ændrede bytes, nøglen passer ikke).
- **Ikke verificeret**: værktøjet kunne ikke køre verificering for denne algoritme. Certifikatets metadata vises stadig, men du bør behandle signaturen som "ukendt" og verificere den med Adobe Acrobat eller `openssl cms -verify`.

### Usikre digest-algoritmer

- Signaturer, der bruger **MD5 eller SHA-1**, afvises som ugyldige og markeres med status "Usikker digest". Begge algoritmer har offentliggjorte kollisionsangreb, så en signatur over en SHA-1- eller MD5-hash giver ingen integritetsgaranti.
- SHA-224, SHA-256, SHA-384 og SHA-512 accepteres alle.

### Dokumentdækning

- **Fuld dækning**: Signaturen dækker hele PDF-filen, hvilket betyder, at ingen bytes er tilføjet eller ændret efter signeringen.
- **Delvis dækning**: Signaturen dækker kun en del af filen. Det kan betyde, at der er foretaget ændringer efter signeringen (ikke nødvendigvis ondsindede: trinvise gemninger giver delvis dækning).

## Signaturdetaljer

Hvert signaturkort viser:

- **Underskrevet af**: Almindeligt navn, organisation og e-mail fra underskriverens certifikat
- **Udsteder**: Den certificeringsmyndighed, der udstedte underskriverens certifikat
- **Underskrevet den**: Tidsstemplet, der er indlejret i signaturen
- **Gyldig fra / Gyldig til**: Certifikatets gyldighedsperiode
- **Årsag**: Hvorfor dokumentet blev signeret (hvis angivet)
- **Placering**: Hvor det blev signeret (hvis angivet)
- **Dækningsstatus**: Fuld eller delvis
- **Tillidsmærke**: Betroet eller Ikke i tillidskæden (kun når et brugerdefineret certifikat er angivet)

### Tekniske detaljer

Udvid afsnittet med tekniske detaljer for at se:

- Serienummer på underskriverens certifikat
- Digest-algoritme (SHA-256, SHA-512 osv.)
- Signaturalgoritme (RSA med SHA-256, ECDSA med SHA-256 osv.)
- Fejlmeddelelser for ugyldige signaturer

## Anvendelsesområder

- Verificering af en digitalt signeret kontrakt, før du kontrasignerer
- Revision af signerede dokumenter for at bekræfte, at de ikke er manipuleret
- Kontrol af, om et certifikat er udløbet, siden dokumentet blev signeret
- Validering af signaturer mod din organisations rodcertifikat
- Undersøgelse af signeringsdetaljer i offentlige eller juridiske dokumenter

## Tips

- Et selvsigneret certifikat betyder ikke, at signaturen er ugyldig. Det betyder, at underskriverens identitet ikke kan bekræftes via en betroet tredjepart. Det er almindeligt for interne dokumenter.
- Delvis dækning er ikke altid tegn på manipulation. Mange PDF-arbejdsgange tilføjer trinvise opdateringer (som en anden signatur), der giver delvis dækning.
- Upload din organisations rod- eller mellemcertifikat som betroet certifikat for at få verificering af tillidskæden.

## Relaterede værktøjer

- [Digital signatur](./digital-sign-pdf): signér PDF-filer med dit eget certifikat
- [Fladgør PDF](./flatten-pdf): fladgør en PDF før signering for at forhindre ændringer efter signeringen
- [Fjern metadata](./remove-metadata): ryd op i en PDF, før du anvender en signatur
