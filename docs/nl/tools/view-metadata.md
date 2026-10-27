---
title: Metadata weergeven
description: Bekijk alle metadata-eigenschappen van een PDF, waaronder documentinformatie, XMP-gegevens en structurele details.
---

# Metadata weergeven

Bekijk de verborgen eigenschappen die in een PDF-bestand zijn ingebed. De tool toont documentinformatie (titel, auteur, datums), XMP-metadata, paginaafmetingen en andere structurele gegevens in een leesbaar formaat.

## Hoe het werkt

1. Upload een PDF-bestand.
2. De tool leest het bestand direct in en toont alle beschikbare metadata in overzichtelijke secties.
3. Bekijk het documentinfo-woordenboek, de XMP-metadataboom en de structurele eigenschappen.
4. Een verwerkingsstap is niet nodig: de metadata verschijnt zodra het bestand is geladen.

## Functies

- Toont de standaardvelden van de documentinformatie: titel, auteur, onderwerp, trefwoorden, maker, producent
- Toont aanmaak- en wijzigingsdatums in een leesbare notatie
- Leest de volledige XMP-metadataboom in en toont die, inclusief geneste naamruimten
- Zet het PDF-datumformaat (`D:20240101120000Z`) om naar leesbare datums
- Ingedeeld in inklapbare secties voor eenvoudige navigatie

## Metadatasecties

| Sectie                    | Inhoud                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **Documentinformatie**    | Titel, auteur, onderwerp, trefwoorden, maker, producent, aanmaakdatum, wijzigingsdatum |
| **XMP-metadata**          | Volledige XML-metadataboom met Dublin Core-, XAP-, PDF- en eigen naamruimten           |
| **Documenteigenschappen** | Aantal pagina's, PDF-versie, bestandsgrootte, versleutelingsstatus                     |

## Toepassingen

- Nagaan wie een PDF heeft gemaakt en wanneer hij voor het laatst is gewijzigd
- Controleren of de metadata goed is ingesteld voordat je een document publiceert
- PDF's controleren op privacy door te kijken welke persoonlijke gegevens erin zijn ingebed
- Onderzoeken welke software een PDF heeft gemaakt of gewijzigd (via het veld Producent)
- XMP-metadata bekijken voor naleving van digitaal assetbeheer

## Tips

- PDF-datumstrings die met `D:` beginnen, worden automatisch omgezet naar de notatie van je lokale tijdzone.
- Als metadatavelden leeg lijken, heeft de maker van de PDF ze simpelweg niet ingesteld. Niet alle PDF's bevatten uitgebreide metadata.
- Gebruik [Metadata bewerken](./edit-metadata) om metadata te wijzigen nadat je die hebt bekeken. Gebruik Metadata verwijderen om alles te wissen.

## Gerelateerde tools

- [Metadata bewerken](./edit-metadata)
- [PDF OCG-lagen](./pdf-layers)
- [PDF's vergelijken](./compare-pdfs)
