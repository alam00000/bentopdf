---
title: PDF naar tekst
description: Haal platte tekst uit PDF-bestanden. Ondersteunt het in één keer extraheren van meerdere PDF's, met TXT-bestanden als uitvoer.
---

# PDF naar tekst

Haalt alle tekstinhoud uit PDF-bestanden en slaat die op als gewone `.txt`-bestanden. Ondersteunt gebundelde verwerking: upload meerdere PDF's en haal de tekst van elk in één bewerking eruit. Gebruikt PyMuPDF.

## Hoe het werkt

1. Upload een of meer PDF's door op het neerzetgebied te klikken of bestanden erheen te slepen. Beheer je bestandslijst met de knoppen Meer toevoegen en Wissen.
2. Klik op **Extraheren** om de verwerking te starten.
3. Een enkel bestand wordt gedownload als `filename.txt`. Meerdere bestanden geven een `pdf-to-text.zip`-archief.

## Opties

Deze tool heeft geen instelbare opties. Alle tekstinhoud van elke pagina wordt in leesvolgorde geëxtraheerd.

## Uitvoerformaat

- **Eén bestand**: `filename.txt`
- **Meerdere bestanden**: `pdf-to-text.zip` met één `.txt` per invoer-PDF.

## Toepassingen

- Lopende tekst uit PDF-rapporten halen voor volledige tekstindexering.
- PDF-e-books of artikelen omzetten naar platte tekst om te lezen op e-inkapparaten.
- Tekst uit contracten of juridische documenten halen voor trefwoordanalyse.
- Opmaak uit PDF's verwijderen om schone tekst te krijgen voor gegevensverwerkingsscripts.
- Een tekstcorpus samenstellen uit PDF-archieven voor natuurlijke taalverwerking.

## Tips

- Gescande PDF's (alleen afbeeldingen) geven lege tekstbestanden omdat er geen tekstlaag is om te extraheren. Haal gescande documenten eerst door OCR.
- De uitvoer behoudt de leesvolgorde zoals PyMuPDF die interpreteert, wat over het algemeen van links naar rechts en van boven naar beneden loopt. Indelingen met meerdere kolommen kunnen door elkaar lopende tekst geven.
- Probeer voor gestructureerde uitvoer met koppen en opmaak [PDF naar Markdown](./pdf-to-markdown). Gebruik voor AI-klare gestructureerde JSON [PDF voorbereiden voor AI](./prepare-pdf-for-ai).

## Gerelateerde tools

- [PDF naar Markdown](./pdf-to-markdown)
- [PDF voorbereiden voor AI](./prepare-pdf-for-ai)
- [PDF naar Word](./pdf-to-word)
