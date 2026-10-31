---
title: Validera signatur
description: Verifiera digitala signaturer i PDF-filer. Kontrollera certifikatets giltighet, undertecknarens identitet, dokumentets integritet och förtroendekedjans status.
---

# Validera signatur

Ladda upp en signerad PDF så extraherar verktyget varje digital signatur, identifierar undertecknaren, kontrollerar certifikatets giltighet och rapporterar om dokumentet har ändrats sedan signeringen. Du kan också ange ett betrott certifikat för att verifiera signaturkedjan.

## Så fungerar det

1. Ladda upp en signerad PDF-fil. Valideringen startar automatiskt.
2. Verktyget visar en sammanfattning: antal signaturer som hittats och hur många som är giltiga.
3. Varje signatur får ett detaljerat kort med undertecknarens namn, utfärdare, datum och status.
4. Du kan också ladda upp ett **betrott certifikat** (.pem, .crt, .cer, .der) för att verifiera signaturen mot ett specifikt förtroendeankare. Omvalidering körs automatiskt.

## Vad som kontrolleras

### Tolkning av signaturen

Verktyget extraherar PKCS#7-signaturobjekt från PDF:en, avkodar ASN.1-strukturen och hämtar undertecknarens X.509-certifikat tillsammans med eventuell certifikatkedja som är inbäddad i signaturen.

### Certifikatets giltighet

- **Utgångsdatum**: Ligger certifikatet just nu inom sitt giltighetsintervall?
- **Upptäckt av självsignerade certifikat**: Är certifikatet sin egen utfärdare?
- **Förtroendekedja**: När ett betrott certifikat anges, leder undertecknarens certifikatkedja tillbaka till det?

### Kryptografisk verifiering

- Verktyget återskapar de byte som omfattas av signaturens `/ByteRange`, beräknar hashen med den algoritm som undertecknaren angett och jämför resultatet med attributet `messageDigest` i signaturen.
- Därefter serialiseras de signerade attributen om som en DER SET och signaturen verifieras mot signaturcertifikatets publika nyckel.
- **En signatur rapporteras som giltig endast när alla dessa kontroller godkänns.** Om PDF:ens byte ändrades efter signeringen, eller om den inbäddade signaturen inte matchar undertecknarens nyckel, visar statusen "Ogiltig: den kryptografiska verifieringen misslyckades" med den specifika orsaken.

#### Algoritmer för signaturer som stöds

| Algoritm                | Verifieringsväg                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, med Web Crypto som reserv                                     |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                           |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` efter konvertering av signaturen DER → IEEE P1363 |

Om en signatur använder en algoritm utanför den här listan (till exempel Ed25519, SM2 eller RSA med ett ovanligt digest-OID) visar kortet **"Overifierad: signaturalgoritmen stöds inte"** i gult, tillsammans med det specifika OID:t eller skälet. Detta är en medveten uppdelning i tre tillstånd:

- **Giltig**: signaturen har verifierats kryptografiskt mot undertecknarens publika nyckel.
- **Ogiltig**: verifieringen kördes och gav ett negativt resultat (byte ändrade, nyckeln matchar inte).
- **Overifierad**: verktyget kunde inte köra verifiering för den här algoritmen. Certifikatets metadata visas fortfarande, men du bör behandla signaturen som "okänd" och verifiera den med Adobe Acrobat eller `openssl cms -verify`.

### Osäkra digest-algoritmer

- Signaturer som använder **MD5 eller SHA-1** avvisas som ogiltiga och markeras med statusen "Osäker sammandragsalgoritm". Båda algoritmerna har publicerade kollisionsattacker, så en signatur över en SHA-1- eller MD5-hash ger ingen integritetsgaranti.
- SHA-224, SHA-256, SHA-384 och SHA-512 accepteras alla.

### Dokumenttäckning

- **Full täckning**: Signaturen omfattar hela PDF-filen, vilket betyder att inga byte har lagts till eller ändrats efter signeringen.
- **Partiell täckning**: Signaturen omfattar bara en del av filen. Det kan tyda på att ändringar gjorts efter signeringen (inte nödvändigtvis skadliga, eftersom inkrementella sparningar ger partiell täckning).

## Signaturdetaljer

Varje signaturkort visar:

- **Signerad av**: Common name, organisation och e-postadress från undertecknarens certifikat
- **Utfärdare**: Certifikatutfärdaren som utfärdade undertecknarens certifikat
- **Signerad den**: Tidsstämpeln som är inbäddad i signaturen
- **Giltig från / Giltig till**: Certifikatets giltighetsperiod
- **Orsak**: Varför dokumentet signerades (om angivet)
- **Plats**: Var det signerades (om angivet)
- **Täckningsstatus**: Full eller partiell
- **Förtroendemärke**: Betrodd eller Inte i förtroendekedjan (endast när ett eget certifikat anges)

### Tekniska detaljer

Expandera avsnittet med tekniska detaljer för:

- Serienummer för undertecknarens certifikat
- Digest-algoritm (SHA-256, SHA-512 osv.)
- Signaturalgoritm (RSA med SHA-256, ECDSA med SHA-256 osv.)
- Felmeddelanden för ogiltiga signaturer

## Användningsområden

- Verifiera ett digitalt signerat avtal innan du medsignerar
- Granska signerade dokument för att bekräfta att de inte har manipulerats
- Kontrollera om ett certifikat har gått ut sedan dokumentet signerades
- Validera signaturer mot din organisations rotcertifikat
- Granska signeringsdetaljerna i myndighets- eller juridiska dokument

## Tips

- Ett självsignerat certifikat betyder inte att signaturen är ogiltig. Det betyder att undertecknarens identitet inte kan verifieras via en betrodd tredje part. Det är vanligt för interna dokument.
- Partiell täckning tyder inte alltid på manipulation. Många PDF-arbetsflöden lägger till inkrementella uppdateringar (som en andra signatur) som ger partiell täckning.
- Ladda upp din organisations rot- eller mellancertifikat som betrott certifikat för att få verifiering av förtroendekedjan.

## Relaterade verktyg

- [Digital signatur PDF](./digital-sign-pdf), signera PDF:er med ditt eget certifikat
- [Platta till PDF](./flatten-pdf), platta till en PDF före signering för att förhindra ändringar efter signaturen
- [Ta bort metadata](./remove-metadata), rensa en PDF innan du lägger till en signatur
