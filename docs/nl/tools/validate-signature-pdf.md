---
title: Handtekening valideren
description: Controleer digitale handtekeningen in PDF-bestanden. Controleer de geldigheid van certificaten, de identiteit van de ondertekenaar, de integriteit van het document en de status van de vertrouwensketen.
---

# Handtekening valideren

Upload een ondertekende PDF en deze tool haalt elke digitale handtekening eruit, identificeert de ondertekenaar, controleert de geldigheid van het certificaat en meldt of het document na het ondertekenen is gewijzigd. Je kunt ook een vertrouwd certificaat opgeven om de handtekeningketen te controleren.

## Hoe het werkt

1. Upload een ondertekend PDF-bestand. De validatie start automatisch.
2. De tool toont een samenvatting: het aantal gevonden handtekeningen en hoeveel daarvan geldig zijn.
3. Elke handtekening krijgt een gedetailleerde kaart met naam van de ondertekenaar, uitgever, datums en status.
4. Upload optioneel een **vertrouwd certificaat** (.pem, .crt, .cer, .der) om de handtekening te controleren tegen een specifiek vertrouwensanker. De hervalidatie start automatisch.

## Wat er wordt gecontroleerd

### Handtekening uitlezen

De tool haalt PKCS#7-handtekeningobjecten uit de PDF, decodeert de ASN.1-structuur en leest het X.509-certificaat van de ondertekenaar uit, samen met eventuele certificaatketens die in de handtekening zijn ingebed.

### Geldigheid van het certificaat

- **Vervaldatum**: valt het certificaat nu binnen de geldigheidsperiode?
- **Zelfondertekend**: is het certificaat zijn eigen uitgever?
- **Vertrouwensketen**: leidt het certificaat van de ondertekenaar, als een vertrouwd certificaat is opgegeven, terug naar dat certificaat?

### Cryptografische controle

- De tool reconstrueert de bytes die door de `/ByteRange` van de handtekening worden gedekt, berekent er een hash van met het algoritme dat de ondertekenaar heeft opgegeven en vergelijkt het resultaat met het attribuut `messageDigest` in de handtekening.
- Daarna serialiseert de tool de ondertekende attributen opnieuw als een DER SET en controleert de handtekening met de publieke sleutel van het certificaat van de ondertekenaar.
- **Een handtekening wordt alleen als geldig gemeld als al deze controles slagen.** Als de PDF-bytes na het ondertekenen zijn gewijzigd, of de ingebedde handtekening niet bij de sleutel van de ondertekenaar past, toont de status "Ongeldig: cryptografische controle mislukt" met de specifieke reden.

#### Ondersteunde handtekeningalgoritmen

| Algoritme               | Controlepad                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, met Web Crypto als terugval                                   |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                           |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` na conversie van DER naar IEEE P1363-handtekening |

Gebruikt een handtekening een algoritme buiten deze lijst (bijvoorbeeld Ed25519, SM2 of RSA met een ongebruikelijke digest-OID), dan toont de kaart in geel **"Niet geverifieerd: niet-ondersteund handtekeningalgoritme"**, samen met de specifieke OID of reden. Dit is een bewust onderscheid in drie statussen:

- **Geldig**: de handtekening is cryptografisch geverifieerd met de publieke sleutel van de ondertekenaar.
- **Ongeldig**: de controle is uitgevoerd en gaf een negatief resultaat (bytes gewijzigd, sleutel komt niet overeen).
- **Niet geverifieerd**: de tool kon voor dit algoritme geen controle uitvoeren. De certificaatmetadata wordt nog steeds getoond, maar beschouw de handtekening als "onbekend" en controleer hem met Adobe Acrobat of `openssl cms -verify`.

### Onveilige digest-algoritmen

- Handtekeningen met **MD5 of SHA-1** worden als ongeldig afgewezen en gemarkeerd met de status "Onveilige digest". Voor beide algoritmen zijn collision-aanvallen gepubliceerd, dus een handtekening over een SHA-1- of MD5-hash biedt geen garantie voor integriteit.
- SHA-224, SHA-256, SHA-384 en SHA-512 worden allemaal geaccepteerd.

### Dekking van het document

- **Volledige dekking**: de handtekening dekt het hele PDF-bestand, dus er zijn na het ondertekenen geen bytes toegevoegd of gewijzigd.
- **Gedeeltelijke dekking**: de handtekening dekt slechts een deel van het bestand. Dit kan erop wijzen dat er na het ondertekenen wijzigingen zijn aangebracht (niet per se kwaadwillend, want incrementeel opslaan geeft gedeeltelijke dekking).

## Handtekeningdetails

Elke handtekeningkaart toont:

- **Ondertekend door**: algemene naam, organisatie en e-mailadres uit het certificaat van de ondertekenaar
- **Uitgever**: de certificeringsinstantie die het certificaat van de ondertekenaar heeft uitgegeven
- **Ondertekend op**: het tijdstempel dat in de handtekening is ingebed
- **Geldig vanaf / Geldig tot**: de geldigheidsperiode van het certificaat
- **Reden**: waarom het document is ondertekend (indien opgegeven)
- **Locatie**: waar het is ondertekend (indien opgegeven)
- **Dekkingsstatus**: volledig of gedeeltelijk
- **Vertrouwensbadge**: vertrouwd of niet in de vertrouwensketen (alleen als een eigen certificaat is opgegeven)

### Technische details

Klap het gedeelte met technische details uit voor:

- Serienummer van het certificaat van de ondertekenaar
- Digest-algoritme (SHA-256, SHA-512, enz.)
- Handtekeningalgoritme (RSA met SHA-256, ECDSA met SHA-256, enz.)
- Foutmeldingen voor ongeldige handtekeningen

## Toepassingen

- Een digitaal ondertekend contract controleren voordat je mede-ondertekent
- Ondertekende documenten controleren om te bevestigen dat er niet mee is geknoeid
- Nagaan of een certificaat is verlopen sinds het document is ondertekend
- Handtekeningen valideren tegen het basiscertificaat van je organisatie
- De ondertekeningsdetails van overheids- of juridische documenten inspecteren

## Tips

- Een zelfondertekend certificaat betekent niet dat de handtekening ongeldig is. Het betekent dat de identiteit van de ondertekenaar niet via een vertrouwde derde partij kan worden geverifieerd. Dit komt vaak voor bij interne documenten.
- Gedeeltelijke dekking wijst niet altijd op knoeien. Veel PDF-workflows voegen incrementele updates toe (zoals een tweede handtekening) die gedeeltelijke dekking veroorzaken.
- Upload het basis- of tussencertificaat van je organisatie als vertrouwd certificaat om de vertrouwensketen te laten controleren.

## Gerelateerde tools

- [Digitale handtekening](./digital-sign-pdf): onderteken PDF's met je eigen certificaat
- [PDF platmaken](./flatten-pdf): maak een PDF plat voor het ondertekenen om wijzigingen na de handtekening te voorkomen
- [Metadata verwijderen](./remove-metadata): maak een PDF schoon voordat je een handtekening toevoegt
