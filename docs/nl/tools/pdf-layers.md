---
title: PDF OCG-lagen
description: Bekijk, schakel, voeg toe en verwijder Optional Content Group-lagen (OCG) in een PDF-document.
---

# PDF OCG-lagen

Beheer de Optional Content Groups (OCG), vaak "lagen" genoemd, in een PDF. Je kunt de zichtbaarheid van lagen schakelen, nieuwe lagen toevoegen (ook geneste onderliggende lagen), lagen verwijderen en de gewijzigde PDF opslaan.

## Hoe het werkt

1. Upload een PDF-bestand.
2. Klik op de verwerkknop om het document met de PyMuPDF-engine te laden.
3. De tool toont alle bestaande lagen met hun zichtbaarheid, vergrendelingsstatus en nestinghiërarchie.
4. Schakel de selectievakjes om lagen te tonen of te verbergen. Vergrendelde lagen kunnen niet worden geschakeld.
5. Voeg nieuwe lagen op het hoogste niveau toe door een naam te typen en op de toevoegknop te klikken, of voeg onderliggende lagen toe onder een bestaande bovenliggende laag.
6. Verwijder lagen die je niet meer nodig hebt.
7. Klik op **Opslaan** om de gewijzigde PDF met je laagwijzigingen te downloaden.

## Functies

- Toont de laaghiërarchie met de juiste inspringing voor geneste lagen
- Zichtbaarheid van lagen aan of uit schakelen
- Indicator voor vergrendelde lagen voorkomt onbedoelde wijzigingen
- Lagen op het hoogste niveau of onderliggende lagen toevoegen met eigen namen
- Afzonderlijke lagen verwijderen
- Slaat alle wijzigingen op in een nieuw PDF-bestand

## Toepassingen

- De zichtbaarheid van markeringslagen in architectuur- of engineeringtekeningen schakelen
- Nieuwe annotatielagen toevoegen aan een ontwerpdocument met meerdere lagen
- Verouderde lagen uit een sjabloon verwijderen voordat je het verspreidt
- Nagaan welke lagen er in een complexe PDF van een derde zitten

## Tips

- Als de PDF geen lagen heeft, toont de tool een lege weergave met een uitnodiging om er een toe te voegen. Niet alle PDF's gebruiken OCG-lagen: ze komen het meest voor in CAD-exports en ontwerpbestanden.
- Onderliggende lagen worden visueel ingesprongen onder hun bovenliggende laag. Je kunt lagen op elke diepte nesten.
- Vergrendelde lagen worden getoond met een slotpictogram en hun selectievakjes zijn uitgeschakeld. Deze vergrendelingen zijn ingesteld door de maker van de PDF.

## Gerelateerde tools

- [Metadata weergeven](./view-metadata)
- [Metadata bewerken](./edit-metadata)
- [Dupliceren en organiseren](./organize-pdf)
