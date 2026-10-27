---
title: PDF naar Markdown
description: Zet PDF-documenten om naar Markdown met optionele extractie van afbeeldingen. Ondersteunt het converteren van meerdere bestanden tegelijk.
---

# PDF naar Markdown

Zet PDF-bestanden om naar Markdown (`.md`), met behoud van koppen, alinea's, lijsten en basisopmaak. Haalt optioneel ingebedde afbeeldingen eruit en neemt ze op. Ondersteunt enkele en gebundelde conversie. Gebruikt PyMuPDF.

## Hoe het werkt

1. Upload een of meer PDF's door op het neerzetgebied te klikken of bestanden erheen te slepen.
2. Schakel optioneel **Afbeeldingen opnemen** in om geëxtraheerde afbeeldingen in de Markdown-uitvoer in te sluiten.
3. Klik op **Converteren** om de verwerking te starten.
4. Een enkel bestand wordt gedownload als `filename.md`. Meerdere bestanden geven een `markdown-files.zip`.

## Opties

- **Afbeeldingen opnemen**: als dit is aangevinkt, worden ingebedde afbeeldingen uit de PDF geëxtraheerd en in de Markdown-uitvoer opgenomen. Als het niet is aangevinkt, wordt alleen de tekstinhoud omgezet.

## Uitvoerformaat

- **Eén bestand**: `filename.md`
- **Meerdere bestanden**: `markdown-files.zip` met één `.md` per invoer-PDF.

## Toepassingen

- PDF-documentatie omzetten naar Markdown voor een generator voor statische sites zoals VitePress, Hugo of Jekyll.
- PDF-onderzoeksartikelen omzetten naar bewerkbare Markdown voor notitie-apps zoals Obsidian.
- Oude PDF-kennisbanken migreren naar een tekstformaat dat bij Git past.
- Gestructureerde inhoud uit PDF-e-books halen om opnieuw op te maken.

## Tips

- De optie Afbeeldingen opnemen is handig als de PDF diagrammen of figuren bevat die essentieel zijn voor de inhoud. Schakel haar uit voor tekstrijke documenten om de uitvoer overzichtelijk te houden.
- Complexe indelingen met zijbalken, voetnoten of tekst in meerdere kolommen kunnen onvolmaakte Markdown opleveren. Controleer de uitvoer en pas hem zo nodig aan.
- Gebruik voor ruwe tekst zonder opmaak liever [PDF naar tekst](./pdf-to-text).

## Gerelateerde tools

- [PDF naar tekst](./pdf-to-text)
- [PDF naar Word](./pdf-to-word)
- [PDF voorbereiden voor AI](./prepare-pdf-for-ai)
