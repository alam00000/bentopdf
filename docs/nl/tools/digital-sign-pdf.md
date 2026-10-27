---
title: Digitale handtekening
description: Voeg cryptografische digitale handtekeningen toe aan PDF's met X.509-certificaten. Ondersteunt PKCS#12- en PEM-formaten met opties voor zichtbare handtekeningen.
---

# Digitale handtekening

Een digitale handtekening is cryptografisch bewijs dat een bepaald persoon een document heeft ondertekend en dat het document sindsdien niet is gewijzigd. Anders dan een getekende handtekening (die slechts een afbeelding is) gebruikt een digitale handtekening X.509-certificaten en PKCS#7-standaarden voor controleerbare authenticiteit en integriteit.

BentoPDF past digitale handtekeningen volledig in je browser toe. Je privésleutel verlaat je apparaat nooit.

## Zo werkt het

1. Upload een PDF-bestand.
2. Upload je certificaatbestand (.pfx, .p12 of .pem).
3. Voer het certificaatwachtwoord in om het te ontgrendelen. De tool toont de certificaathouder, de uitgever en de geldigheidsperiode.
4. Configureer eventueel de metadata van de handtekening (reden, locatie, contactgegevens).
5. Schakel eventueel een **zichtbare handtekening** in met aanpassingen voor positie, grootte, afbeelding en tekst.
6. Klik op **PDF ondertekenen**.

## Ondersteunde certificaatformaten

| Formaat     | Extensies  | Beschrijving                                                                                                                                |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12 | Standaardbundel in de branche met de privésleutel en de certificaatketen. Het meest gebruikte formaat.                                      |
| **PEM**     | .pem       | Op tekst gebaseerd formaat. Moet zowel het certificaat als de privésleutel in één bestand bevatten. Ondersteunt versleutelde privésleutels. |

## Opties voor zichtbare handtekening

Als deze optie is ingeschakeld, wordt een zichtbaar handtekeningblok op de PDF-pagina weergegeven:

- **Positie**: X/Y-coördinaten en breedte/hoogte in punten
- **Pagina**: eerste pagina, laatste pagina, alle pagina's of een specifiek paginanummer
- **Afbeelding**: upload een PNG-, JPG- of WebP-afbeelding (je handgeschreven handtekening, bedrijfszegel enz.)
- **Tekst**: eigen tekst met instelbare kleur en lettergrootte. Als er geen afbeelding of tekst is opgegeven, genereert de tool automatisch tekst uit de common name van het certificaat en de huidige datum.

## Metadata van de handtekening

- **Reden**: waarom het document is ondertekend (bijv. "Goedgekeurd", "Beoordeeld")
- **Locatie**: waar de ondertekening plaatsvond (bijv. "Amsterdam")
- **Contactgegevens**: hoe de ondertekenaar bereikbaar is (bijv. e-mailadres)

## Opmerking over internetverbinding

Ondertekenen kan een internetverbinding vereisen. De ondertekenbibliotheek haalt de certificaatketen op via URL's die in de extensie Authority Information Access (AIA) van je certificaat staan. Als die servers onbereikbaar zijn, mislukt het ondertekenen voor certificaten die ketenvalidatie vereisen.

## Toepassingen

- Contracten, offertes en overeenkomsten ondertekenen met juridisch bindende digitale handtekeningen
- Officiële documenten certificeren in workflows die authenticatie op basis van PKI vereisen
- PDF-facturen ondertekenen voor naleving van regelgeving (veel EU-landen eisen digitaal ondertekende e-facturen)
- Organisatorische goedkeuring toevoegen aan technische tekeningen of kwaliteitsdocumenten

## Tips

- Zelfondertekende certificaten werken om te testen, maar tonen waarschuwingen in Adobe Reader. Gebruik voor productiedocumenten een certificaat van een vertrouwde certificeringsinstantie.
- De zichtbare handtekening is puur visueel. De cryptografische handtekening wordt altijd ingesloten, ook als het zichtbare blok niet is ingeschakeld.
- Controleer je ondertekende PDF met de tool Handtekening valideren om te bevestigen dat de handtekening intact is.

## Gerelateerde tools

- [Handtekening valideren](./validate-signature-pdf): controleer digitale handtekeningen in ondertekende PDF's
- [PDF platmaken](./flatten-pdf): maak formulieren plat vóór het ondertekenen om wijzigingen te voorkomen
- [PDF versleutelen](./protect-pdf): voeg wachtwoordbeveiliging toe bovenop de digitale handtekening
- [Metadata verwijderen](./remove-metadata): verwijder metadata vóór het ondertekenen
