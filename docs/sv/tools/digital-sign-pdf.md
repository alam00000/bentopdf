---
title: Digital signatur
description: Lägg till kryptografiska digitala signaturer i PDF-filer med X.509-certifikat. Stöder formaten PKCS#12 och PEM med alternativ för synlig signatur.
---

# Digital signatur

En digital signatur är kryptografiskt bevis på att en viss person har undertecknat ett dokument och att dokumentet inte har ändrats sedan dess. Till skillnad från en ritad signatur (som bara är en bild) använder en digital signatur X.509-certifikat och PKCS#7-standarder för att ge verifierbar äkthet och integritet.

BentoPDF tillämpar digitala signaturer helt i din webbläsare. Din privata nyckel lämnar aldrig din enhet.

## Så fungerar det

1. Ladda upp en PDF-fil.
2. Ladda upp din certifikatfil (.pfx, .p12 eller .pem).
3. Ange certifikatets lösenord för att låsa upp det. Verktyget visar certifikatets ämne, utfärdare och giltighetstid.
4. Konfigurera eventuellt signaturens metadata (orsak, plats, kontaktinformation).
5. Aktivera eventuellt en **synlig signatur** med anpassning av position, storlek, bild och text.
6. Klicka på **Signera PDF**.

## Certifikatformat som stöds

| Format      | Filändelser | Beskrivning                                                                                                                |
| ----------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12  | Branschstandardpaket med den privata nyckeln och certifikatkedjan. Det vanligaste formatet.                                |
| **PEM**     | .pem        | Textbaserat format. Måste innehålla både certifikatet och den privata nyckeln i en fil. Stöder krypterade privata nycklar. |

## Alternativ för synlig signatur

När det är aktiverat återges ett synligt signaturblock på PDF-sidan:

- **Position**: X/Y-koordinater samt bredd/höjd i punkter
- **Sida**: Första sidan, sista sidan, alla sidor eller ett visst sidnummer
- **Bild**: Ladda upp en PNG-, JPG- eller WebP-bild (din handskrivna signatur, företagsstämpel osv.)
- **Text**: Anpassad text med konfigurerbar färg och teckenstorlek. Om ingen bild eller text anges genererar verktyget automatiskt text från certifikatets Common Name och dagens datum.

## Signaturmetadata

- **Orsak**: Varför dokumentet signerades (t.ex. "Godkänt", "Granskat")
- **Plats**: Var signeringen ägde rum (t.ex. "Stockholm")
- **Kontaktinformation**: Hur du når undertecknaren (t.ex. e-postadress)

## Anmärkning om internetanslutning

Signering kan kräva en internetanslutning. Signeringsbiblioteket hämtar certifikatkedjan från URL:er som finns i certifikatets tillägg Authority Information Access (AIA). Om dessa servrar inte kan nås misslyckas signeringen för certifikat som kräver kedjevalidering.

## Användningsfall

- Signera avtal, offerter och överenskommelser med juridiskt bindande digitala signaturer
- Certifiera officiella dokument i arbetsflöden som kräver PKI-baserad autentisering
- Signera PDF-fakturor för regelefterlevnad (många EU-länder kräver digitalt signerade e-fakturor)
- Lägga till organisatoriskt godkännande på ritningar eller kvalitetsdokument

## Tips

- Självsignerade certifikat fungerar för testning men ger varningar i Adobe Reader. Använd ett certifikat från en betrodd certifikatutfärdare för produktionsdokument.
- Den synliga signaturen är enbart visuell. Den kryptografiska signaturen bäddas in oavsett om det synliga blocket är aktiverat.
- Verifiera din signerade PDF med verktyget Validera PDF-signatur för att bekräfta att signaturen är intakt.

## Relaterade verktyg

- [Validera PDF-signatur](./validate-signature-pdf): verifiera digitala signaturer i signerade PDF-filer
- [Platta till PDF](./flatten-pdf): platta till formulär före signering för att förhindra ändringar
- [Skydda PDF](./protect-pdf): lägg till lösenordsskydd ovanpå den digitala signaturen
- [Ta bort metadata](./remove-metadata): ta bort metadata före signering
