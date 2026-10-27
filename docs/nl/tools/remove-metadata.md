---
title: Metadata verwijderen
description: Verwijder alle verborgen metadata uit PDF-bestanden, waaronder auteur, titel, aanmaakdatum, producent, XMP-gegevens en document-ID's.
---

# Metadata verwijderen

Elke PDF bevat metadata die kan onthullen wie het bestand heeft gemaakt, welke software is gebruikt, wanneer het voor het laatst is gewijzigd en meer. Deze tool verwijdert dat alles: het infowoordenboek, XMP-metadatastreams, document-ID's en toepassingsspecifieke gegevens. Het resultaat is een schoon document zonder spoor van de herkomst.

## Hoe het werkt

1. Upload een PDF-bestand.
2. Klik op **Metadata verwijderen**.
3. Download het opgeschoonde bestand.

Er zijn geen opties om in te stellen. De tool is bewust grondig: hij wist alles.

## Wat wordt verwijderd

- **Velden van het infowoordenboek**: titel, auteur, onderwerp, trefwoorden, maker, producent, aanmaakdatum, wijzigingsdatum
- **XMP-metadatastream**: het op XML gebaseerde metadatablok in de documentcatalogus
- **Document-ID's**: unieke identificatiecodes in de PDF-trailer waarmee een document tussen systemen kan worden gevolgd
- **PieceInfo**: toepassingsspecifieke metadata die door programma's als Illustrator of InDesign wordt toegevoegd

## Wat blijft

- Alle zichtbare pagina-inhoud (tekst, afbeeldingen, graphics)
- Formuliervelden en annotaties
- Bladwijzers en links
- De documentstructuur zelf

## Toepassingen

- Je naam en organisatie uit een document verwijderen voordat je het anoniem publiceert
- Aanmaaktijdstempels verwijderen die verraden wanneer een document is opgesteld
- Producentstrings opschonen die je PDF-softwarestack verraden
- Documenten voorbereiden voor officiële indieningen die PDF's zonder metadata vereisen
- Sporen van de bewerkingsgeschiedenis verwijderen voordat je een document extern deelt

## Tips

- Gebruik eerst de tool Metadata Weergeven om precies te zien welke metadata je PDF bevat voordat je die verwijdert.
- Als je naast metadata ook JavaScript, annotaties en ingesloten bestanden wilt verwijderen, gebruik dan PDF Opschonen voor een grondigere schoonmaak.
- Het verwijderen van metadata is permanent. Bewaar je origineel als je die gegevens later nog nodig kunt hebben.

## Gerelateerde tools

- [PDF opschonen](./sanitize-pdf): verwijder metadata plus scripts, bijlagen en meer
- [PDF versleutelen](./protect-pdf): beveilig de opgeschoonde PDF met een wachtwoord
- [PDF comprimeren](./compress-pdf): het verwijderen van metadata kan het bestand iets verkleinen, comprimeer voor meer besparing
