---
title: PDF naar Word
description: Zet PDF-bestanden om naar bewerkbare Word-documenten (DOCX). Ondersteunt het in één keer converteren van meerdere PDF's.
---

# PDF naar Word

Zet PDF-bestanden om naar bewerkbare Word-documenten (`.docx`). De tool gebruikt PyMuPDF om de inhoud van het document te reconstrueren, met behoud van tekst, basisopmaak en indeling. Ondersteunt enkele en gebundelde conversie.

## Hoe het werkt

1. Upload een of meer PDF's door op het neerzetgebied te klikken of bestanden erheen te slepen. Je kunt meer bestanden toevoegen of afzonderlijke bestanden uit de lijst verwijderen.
2. Klik op **Converteren** om de verwerking te starten.
3. Een enkel bestand wordt gedownload als `filename.docx`. Meerdere bestanden worden gebundeld in `converted-documents.zip`.

## Opties

Deze tool heeft geen instelbare opties. Elke PDF wordt naar DOCX omgezet met de ingebouwde conversie-engine van PyMuPDF.

## Uitvoerformaat

- **Eén bestand**: `filename.docx`
- **Meerdere bestanden**: `converted-documents.zip` met één `.docx` per invoer-PDF.

## Toepassingen

- Tekst bewerken in een ontvangen PDF die je moet aanpassen.
- Gearchiveerde PDF-rapporten omzetten naar een formaat dat collega's kunnen bewerken in Microsoft Word of Google Docs.
- Inhoud uit PDF-contracten of voorstellen naar Word halen om wijzigingen bij te houden.
- Oude PDF-documentatie migreren naar een bewerkbaar formaat.

## Tips

- Complexe indelingen met tekst in meerdere kolommen, ingebedde formulieren of veel afbeeldingen worden mogelijk niet perfect omgezet. Controleer de uitvoer en pas de opmaak aan in je tekstverwerker.
- Gescande PDF's (alleen afbeeldingen) geven lege of minimale DOCX-bestanden. Haal ze eerst door OCR om een tekstlaag toe te voegen.
- De bundelmodus is efficiënt om hele mappen met PDF's te converteren: upload ze allemaal tegelijk.

## Gerelateerde tools

- [PDF naar tekst](./pdf-to-text)
- [PDF naar Markdown](./pdf-to-markdown)
- [PDF-workflowbouwer](./pdf-workflow)
