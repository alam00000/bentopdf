---
title: PDF naar JSON
description: Zet PDF-bestanden om naar gestructureerd JSON-formaat met CPDF. Exporteert de interne structuur van de PDF als machineleesbare JSON-gegevens.
---

# PDF naar JSON

Zet een of meer PDF-bestanden om naar JSON-formaat. De tool gebruikt CPDF (Coherent PDF) om de interne structuur van elke PDF te serialiseren naar een machineleesbare JSON-weergave. De uitvoer wordt altijd als ZIP-archief geleverd.

## Hoe het werkt

1. Selecteer een of meer PDF-bestanden met de bestandskiezer.
2. Klik op **Converteren** om de verwerking te starten. De conversie draait in een webworker op de achtergrond.
3. Een ZIP-archief wordt gedownload met één JSON-bestand voor elke invoer-PDF.

De statusbalk toont de voortgang van de conversie en het maken van de ZIP.

## Opties

Deze tool heeft geen instelbare opties. Elke PDF wordt omgezet naar de volledige JSON-weergave.

## Uitvoerformaat

- Een `pdfs-to-json.zip`-bestand met `filename.json` voor elke invoer-PDF.

De JSON-uitvoer geeft de interne objectstructuur van de PDF weer, inclusief paginabomen, lettertypeverwijzingen, metadata en inhoudsstromen.

## Toepassingen

- De interne structuur van een PDF inspecteren voor foutopsporing of validatie.
- Gestructureerde metadata en pagina-eigenschappen programmatisch extraheren.
- PDF-structuurgegevens aanleveren aan eigen verwerkingsketens.
- PDF-documenten controleren op naleving door hun objectbomen te analyseren.

## Tips

- Deze tool geeft de ruwe PDF-objectstructuur weer, niet de geëxtraheerde tekstinhoud. Als je paginatekst in JSON-formaat nodig hebt, gebruik dan [PDF voorbereiden voor AI](./prepare-pdf-for-ai).
- Voor het extraheren van platte tekst is [PDF naar tekst](./pdf-to-text) eenvoudiger.
- Grote PDF's met complexe structuren geven zeer grote JSON-bestanden.

## Gerelateerde tools

- [PDF naar tekst](./pdf-to-text)
- [PDF voorbereiden voor AI](./prepare-pdf-for-ai)
- [PDF-tabellen extraheren](./extract-tables)
