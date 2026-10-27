---
title: PDF beveiligen
description: Beveilig PDF-bestanden met een wachtwoord en 256-bit AES-versleuteling. Stel gebruikers- en eigenaarswachtwoorden in met instelbare gebruiksbeperkingen.
---

# PDF beveiligen

Vergrendel je PDF met een wachtwoord, zodat alleen bevoegde personen het bestand kunnen openen. BentoPDF gebruikt 256-bit AES-versleuteling (dezelfde standaard als banken en overheidsinstanties), volledig in je browser toegepast via QPDF.

## Hoe het werkt

1. Upload een PDF-bestand.
2. Voer een **gebruikerswachtwoord** in (verplicht). Dit wachtwoord hebben mensen nodig om het bestand te openen.
3. Voer optioneel een **eigenaarswachtwoord** in. Als dit is ingesteld, krijgt de PDF gebruiksbeperkingen die afdrukken, bewerken, kopiëren en annoteren voorkomen.
4. Klik op **PDF versleutelen**.
5. Download het versleutelde bestand.

## Wachtwoordtypen

### Gebruikerswachtwoord (verplicht)

Het gebruikerswachtwoord typen ontvangers om de PDF te openen. Zonder dit wachtwoord is het document volledig ontoegankelijk. Elke versleutelde PDF moet er een hebben.

### Eigenaarswachtwoord (optioneel)

Het eigenaarswachtwoord bepaalt wat een bevoegde gebruiker kan doen nadat het bestand is geopend. Als je een afwijkend eigenaarswachtwoord instelt, past BentoPDF automatisch de strengste set beperkingen toe:

- Wijzigen uitgeschakeld
- Extraheren/kopiëren uitgeschakeld
- Afdrukken uitgeschakeld
- Annoteren uitgeschakeld
- Formulieren invullen uitgeschakeld
- Documentsamenstelling uitgeschakeld

Als je het eigenaarswachtwoord leeg laat, wordt de PDF wel versleuteld (het gebruikerswachtwoord is nog steeds nodig om te openen), maar zijn er geen gebruiksbeperkingen na het openen.

## Versleutelingsdetails

- **Algoritme**: AES-256 (256-bit Advanced Encryption Standard)
- **Sleutellengte**: 256 bits
- **Standaard**: PDF 2.0-versleuteling (QPDF-implementatie)

AES-256 is met de huidige technologie rekenkundig onhaalbaar te kraken met brute kracht. De beveiliging van je versleutelde PDF hangt volledig af van de sterkte van je wachtwoord.

## Toepassingen

- Vertrouwelijke financiële rapporten beschermen voordat je ze e-mailt
- Juridische documenten beveiligen die met de wederpartij worden gedeeld
- Een wachtwoord toevoegen aan medische dossiers of persoonsgegevens
- Betaalde content (e-books, rapporten) verspreiden met toegangscontrole
- Voldoen aan gegevensbeschermingsbeleid dat versleuteling van opgeslagen gegevens vereist

## Tips

- Gebruik een sterk, uniek wachtwoord. Een wachtzin van 12+ tekens met hoofdletters, kleine letters, cijfers en symbolen is ideaal.
- Deel het wachtwoord via een apart kanaal (telefoon, sms), nooit in dezelfde e-mail als de PDF.
- Als je alleen acties wilt beperken (niet afdrukken, niet kopiëren) zonder dat een wachtwoord nodig is om te openen, gebruik dan de tool Rechten Aanpassen.

## Gerelateerde tools

- [PDF ontgrendelen](./unlock-pdf): verwijder de versleuteling als je het wachtwoord kent
- [Rechten aanpassen](./change-permissions): wijzig specifieke gebruiksbeperkingen
- [Beperkingen verwijderen](./remove-restrictions): haal alle beveiliging uit een PDF
- [PDF opschonen](./sanitize-pdf): verwijder verborgen inhoud voordat je versleutelt
