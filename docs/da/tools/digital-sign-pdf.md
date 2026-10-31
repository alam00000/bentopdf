---
title: Digital signatur
description: Tilføj kryptografiske digitale signaturer til PDF'er med X.509-certifikater. Understøtter PKCS#12- og PEM-formater med valgfri synlig signatur.
---

# Digital signatur

En digital signatur er kryptografisk bevis for, at en bestemt person har underskrevet et dokument, og at dokumentet ikke er ændret siden. I modsætning til en tegnet underskrift (som blot er et billede) bruger en digital signatur X.509-certifikater og PKCS#7-standarder til at give verificerbar ægthed og integritet.

BentoPDF anvender digitale signaturer helt i din browser. Din private nøgle forlader aldrig din enhed.

## Sådan fungerer det

1. Upload en PDF-fil.
2. Upload din certifikatfil (.pfx, .p12 eller .pem).
3. Indtast certifikatets adgangskode for at låse det op. Værktøjet viser certifikatets emne, udsteder og gyldighedsperiode.
4. Konfigurér eventuelt signaturmetadata (årsag, sted, kontaktoplysninger).
5. Aktivér eventuelt en **synlig signatur** med tilpasning af position, størrelse, billede og tekst.
6. Klik på **Underskriv PDF**.

## Understøttede certifikatformater

| Format      | Filendelser | Beskrivelse                                                                                                                  |
| ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12  | Branchestandard-pakke med den private nøgle og certifikatkæden. Det mest almindelige format.                                 |
| **PEM**     | .pem        | Tekstbaseret format. Skal indeholde både certifikatet og den private nøgle i én fil. Understøtter krypterede private nøgler. |

## Indstillinger for synlig signatur

Når den er aktiveret, gengives en synlig signaturblok på PDF-siden:

- **Position**: X/Y-koordinater samt bredde/højde i punkter
- **Side**: Første side, sidste side, alle sider eller et bestemt sidetal
- **Billede**: Upload et PNG-, JPG- eller WebP-billede (din håndskrevne underskrift, virksomhedsstempel osv.)
- **Tekst**: Brugerdefineret tekst med konfigurerbar farve og skriftstørrelse. Hvis der ikke angives billede eller tekst, genererer værktøjet automatisk tekst ud fra certifikatets almindelige navn og den aktuelle dato.

## Signaturmetadata

- **Årsag**: Hvorfor dokumentet blev underskrevet (f.eks. "Godkendt", "Gennemgået")
- **Sted**: Hvor underskrivelsen fandt sted (f.eks. "New York, NY")
- **Kontaktoplysninger**: Hvordan underskriveren kan kontaktes (f.eks. e-mailadresse)

## Note om internetforbindelse

Underskrivning kan kræve en internetforbindelse. Signaturbiblioteket henter certifikatkæden fra URL'er, der er indlejret i dit certifikats AIA-udvidelse (Authority Information Access). Hvis disse servere ikke kan nås, mislykkes underskrivningen for certifikater, der kræver kædevalidering.

## Anvendelser

- Underskriv kontrakter, tilbud og aftaler med juridisk bindende digitale signaturer
- Certificér officielle dokumenter i arbejdsgange, der kræver PKI-baseret autentificering
- Underskriv PDF-fakturaer af hensyn til lovgivningsmæssig overholdelse (mange EU-lande kræver digitalt signerede e-fakturaer)
- Tilføj organisatorisk godkendelse til tekniske tegninger eller kvalitetsdokumenter

## Tips

- Selvsignerede certifikater fungerer til test, men viser advarsler i Adobe Reader. Brug et certifikat fra en betroet certifikatudsteder til produktionsdokumenter.
- Den synlige signatur er rent visuel. Den kryptografiske signatur indlejres, uanset om den synlige blok er aktiveret.
- Verificér din signerede PDF med værktøjet Validér signatur for at bekræfte, at signaturen er intakt.

## Relaterede værktøjer

- [Validér signatur](./validate-signature-pdf): verificér digitale signaturer i signerede PDF'er
- [Fladgør PDF](./flatten-pdf): flad formularer ud før underskrivning for at forhindre ændringer
- [Kryptér PDF](./protect-pdf): tilføj adgangskodebeskyttelse oven på den digitale signatur
- [Fjern metadata](./remove-metadata): fjern metadata før underskrivning
