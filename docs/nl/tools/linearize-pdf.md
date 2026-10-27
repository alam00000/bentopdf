---
title: PDF lineariseren
description: Optimaliseer PDF-bestanden voor snel bekijken op het web met progressief laden. Ook bekend als "Fast Web View"-optimalisatie.
---

# PDF lineariseren

Lineariseren herstructureert een PDF zodat de eerste pagina kan worden getoond voordat het hele bestand is gedownload. Adobe noemt dit "Fast Web View". Als je PDF's op een website host of via een documentenportaal aanbiedt, voelt openen door lineariseren merkbaar sneller.

## Zo werkt het

1. Upload een of meer PDF-bestanden.
2. Klik op **PDF('s) lineariseren**.
3. Download de resultaten als ZIP-archief met alle gelineariseerde bestanden.

Er zijn geen instellingen. De tool gebruikt de vlag `--linearize` van QPDF, die de interne structuur van de PDF herordent zonder de visuele inhoud te wijzigen.

## Wat lineariseren doet

- Herordent PDF-objecten zodat de gegevens van de eerste pagina aan het begin van het bestand staan
- Voegt een lineariseringswoordenboek en hinttabellen toe, zodat viewers weten waar elke pagina staat
- Maakt byte-range-verzoeken mogelijk: een browser kan alleen de eerste pagina ophalen zonder het hele bestand te downloaden
- Ruimt de kruisverwijzingstabel op voor efficiënte willekeurige toegang

## Functies

- Meerdere PDF's in één keer verwerken
- De uitvoer behoudt alle inhoud, lettertypen, afbeeldingen en interactieve elementen
- Gebruikt QPDF (WebAssembly) voor betrouwbare, standaardconforme linearisering
- Resultaten worden voor gemakkelijk downloaden in een ZIP verpakt

## Toepassingen

- PDF-rapporten hosten op een website waar gebruikers directe paginaweergave verwachten
- PDF's insluiten in webapplicaties met viewers in de browser
- PDF-catalogi of handleidingen publiceren die via trage mobiele verbindingen worden geopend
- Documenten voorbereiden voor content delivery networks (CDN's) die byte-range-aanvragen ondersteunen

## Tips

- Lineariseer pas nadat alle andere bewerkingen klaar zijn. Elke latere wijziging (samenvoegen, pagina's toevoegen) heft de linearisering op.
- Combineer met PDF comprimeren voor de kleinste en snelst ladende PDF's.
- Lineariseren voegt een kleine hoeveelheid overhead toe aan de bestandsgrootte (meestal minder dan 1%).

## Gerelateerde tools

- [PDF comprimeren](./compress-pdf): verklein het bestand voordat je lineariseert
- [PDF repareren](./repair-pdf): los structurele problemen op die lineariseren verhinderen
- [Metadata verwijderen](./remove-metadata): verwijder metadata voordat je online publiceert
