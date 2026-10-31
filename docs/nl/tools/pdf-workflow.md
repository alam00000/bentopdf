---
title: PDF-workflowbouwer
description: Bouw visueel eigen PDF-verwerkingsketens door knooppunten op een canvas te verbinden. Koppel bewerkingen als samenvoegen, comprimeren, watermerk en exporteren.
---

# PDF-workflowbouwer

Met de workflowbouwer koppel je meerdere PDF-bewerkingen aan elkaar tot één geautomatiseerde keten. In plaats van tools een voor een uit te voeren, verbind je een visuele graaf van knooppunten (invoer, verwerking, uitvoer) en voer je alles uit met één klik. Je bestanden verlaten de browser nooit.

## Hoe het werkt

De interface bestaat uit drie panelen: een **knooppuntenwerkset** links, het **canvas** in het midden en een **instellingenpaneel** rechts dat verschijnt wanneer je een knooppunt selecteert.

1. **Voeg knooppunten toe** door ze in de linkerzijbalk aan te klikken, of sleep ze rechtstreeks op het canvas. Gebruik de zoekbalk bovenaan de werkset om op naam te filteren.
2. **Verbind knooppunten** door te slepen van een uitvoeraansluiting (onderkant van een knooppunt) naar een invoeraansluiting (bovenkant van een ander knooppunt). Verbindingen lopen van boven naar beneden.
3. **Configureer instellingen** door op een knooppunt te klikken om het instellingenpaneel rechts te openen. Elk type knooppunt heeft eigen opties (paginabereiken, kwaliteitsschuifregelaars, wachtwoorden, enz.).
4. **Voer het werkproces uit** door in de werkbalk op de knop **Uitvoeren** te klikken. De engine voert de knooppunten uit in topologische volgorde en verwerkt ze een voor een. Een statusbalk onderaan toont de voortgang.
5. **Download de resultaten**: het afsluitende knooppunt Downloaden slaat de uiteindelijke PDF op (of een ZIP als er meerdere bestanden ontstaan).

## Categorieën knooppunten

Knooppunten zijn ingedeeld in zes categorieën, elk met een eigen kleur op het canvas:

- **Invoer** (blauw): PDF-invoer, afbeeldingsinvoer, Word/Excel/PowerPoint naar PDF en meer dan 15 andere formaatconverters die bestanden in de keten brengen.
- **Bewerken & Annoteren** (indigo): Bijsnijden, Grijswaarden, Kleuren Omkeren, Watermerk, Paginanummers, Koptekst & Voettekst, Scannereffect, Kleuren Aanpassen, Achtergrondkleur, Blanco pagina's Verwijderen, Annotaties Verwijderen.
- **Organiseren & Beheren** (violet): Samenvoegen, Splitsen, Pagina's Extraheren, Roteren, Pagina's Verwijderen, Omkeren, Blanco pagina Toevoegen, Pagina's Opdelen, N+, Paginagrootte Fiksen, Combineren tot Enkele pagina, Boekje, PDF-Poster, Metadata Bewerken, Inhoudsopgave, OCR.
- **Optimaliseren & Repareren** (amber): Comprimeren, Rasteren, Lineariseren, Rechttrekken, PDF naar PDF/A, Lettertype naar Contour, Repareren.
- **PDF Beveiligen** (rozerood): Versleutelen, Ontgrendelen, Opschonen, Platmaken, Digitale handtekening, Redigeren.
- **Uitvoer** (blauwgroen): Downloaden (herkent automatisch een enkele PDF of ZIP), PDF naar afbeeldingen, PDF naar Text, PDF naar DOCX, PDF naar XLSX, PDF naar CSV, PDF naar SVG, PDF naar Markdown, Afbeeldingen extraheren.

## Werkprocessen opslaan en laden

De werkbalk biedt vier opties voor bewaren:

- **Opslaan**: slaat het huidige werkproces op als benoemd sjabloon in de lokale opslag van je browser. Je kunt meerdere sjablonen opslaan.
- **Laden**: opent een venster met alle opgeslagen sjablonen. Klik op Laden om er een te herstellen, of verwijder sjablonen die je niet meer nodig hebt.
- **Exporteren**: downloadt het werkproces als `.json`-bestand zodat je het kunt delen of er een back-up van kunt maken.
- **Importeren**: laadt een `.json`-werkprocesbestand van schijf en herstelt alle knooppunten, posities en verbindingen.

Sjablonen blijven tussen sessies bewaard in de lokale opslag. Geëxporteerde JSON-bestanden zijn overdraagbaar tussen browsers en machines.

## Uitvoeringsmodel

De engine bouwt een afhankelijkheidsgraaf op uit je verbindingen en voert knooppunten uit in topologische volgorde. Als een knooppunt faalt, stopt de uitvoering en wordt het falende knooppunt rood gemarkeerd. Enkele regels om te onthouden:

- Elk werkproces heeft minstens één **Invoer**-knooppunt en één **Uitvoer**-knooppunt nodig.
- De engine detecteert circulaire afhankelijkheden en blokkeert de uitvoering met een foutmelding.
- Het knooppunt **Versleutelen** moet de laatste verwerkingsstap vóór het uitvoerknooppunt zijn. Eerder plaatsen geeft een validatiewaarschuwing, omdat volgende knooppunten niet met versleutelde gegevens kunnen werken.
- Met een wachtwoord beveiligde PDF's vragen tijdens de uitvoering om een wachtwoord.
- Invoer met meerdere PDF's wordt ondersteund: het knooppunt Samenvoegen kan ze combineren, of knooppunten voor gebundelde verwerking verwerken elke PDF afzonderlijk.

## Typen aansluitingen

Verbindingen gebruiken getypeerde aansluitingen om ongeldige koppelingen te voorkomen:

- **PDF** (indigo): één PDF-document.
- **MultiPDF** (amber): meerdere gebundelde PDF-documenten.
- **Afbeelding** (groen): een afbeeldingsblob.

## Opties

Elk knooppunt heeft een eigen configuratie die je opent via het instellingenpaneel rechts. Veelvoorkomende patronen zijn:

- **Paginabereiken** bij de knooppunten Splitsen, Pagina's Extraheren en Pagina's Verwijderen
- **Kwaliteitsschuifregelaars** bij uitvoerknooppunten voor afbeeldingsconversie
- **Wachtwoordvelden** bij de knooppunten Versleutelen en Ontgrendelen
- **Tekstinvoer** voor Watermerk, Koptekst & Voettekst en Metadata Bewerken
- **Rotatiehoeken** bij het knooppunt Roteren
- **Compressieniveau** bij het knooppunt Comprimeren
- **Keuze van OCR-taal** bij het knooppunt OCR

## Toepassingen

- **Keten voor factuurverwerking**: PDF-invoer -> OCR -> PDF-tabellen Extraheren -> Downloaden als CSV.
- **Standaardisatie van rapporten**: Word naar PDF -> Paginagrootte Fiksen -> Paginanummers toevoegen -> Watermerk -> Comprimeren -> Downloaden.
- **Voorbereiding voor archivering**: PDF-invoer -> Repareren -> Platmaken -> Opschonen -> PDF naar PDF/A -> Downloaden.
- **Afbeeldingen in bulk extraheren**: PDF-invoer (meerdere bestanden) -> Afbeeldingen extraheren -> ZIP downloaden.
- **Afdrukklare boekjes**: PDF-invoer -> Boekje -> Bijsnijden -> Comprimeren -> Downloaden.
- **Beveiligde verspreiding**: PDF-invoer -> Redigeren -> Annotaties Verwijderen -> Versleutelen -> Downloaden.

## Tips

- Gebruik **Delete** of **Backspace** om het geselecteerde knooppunt van het canvas te verwijderen.
- Klik op de knop **X** in de statusbalk van een knooppunt om het rechtstreeks te verwijderen.
- Verschuif het canvas door op lege ruimte te klikken en te slepen. De cursor verandert tijdens het verschuiven in een grijppictogram.
- Gebruik op mobiel de knop **+** in de werkbalk om de knooppuntenwerkset te tonen of te verbergen.
- Als je werkproces meerdere uitvoerbestanden oplevert, bundelt het knooppunt Downloaden ze automatisch in een ZIP.
- Begin eenvoudig: bouw en test een keten van twee knooppunten voordat je complexiteit toevoegt.

## Gerelateerde tools

- [PDF naar tekst](./pdf-to-text)
- [PDF naar Excel](./pdf-to-excel)
- [Afbeeldingen extraheren](./extract-images)
- [PDF naar Markdown](./pdf-to-markdown)
