---
title: JSON naar PDF
description: Reconstrueer PDF-bestanden uit het JSON-formaat van BentoPDF. Zet JSON-exports terug om naar hun oorspronkelijke PDF-documenten.
---

# JSON naar PDF

Reconstrueer PDF-documenten uit JSON-bestanden die eerder zijn gemaakt met de tool **PDF naar JSON** van BentoPDF. Dit is een tool voor heen-en-terug-conversie: ze neemt de gestructureerde JSON-weergave van een PDF en bouwt het oorspronkelijke document opnieuw op.

::: warning
Deze tool accepteert alleen JSON-bestanden die door de PDF naar JSON-converter van BentoPDF zijn gemaakt. Standaard JSON-bestanden uit API's, databases of andere tools worden niet ondersteund.
:::

## Ondersteunde formaten

| Invoer  | Beschrijving                                                       |
| :------ | :----------------------------------------------------------------- |
| `.json` | JSON-bestanden geëxporteerd met de tool PDF naar JSON van BentoPDF |

## Zo werkt het

1. Klik op het uploadgebied of sleep een of meer JSON-bestanden erheen.
2. De bestandslijst toont elk geselecteerd bestand met zijn grootte.
3. Klik op **Converteren naar PDF**. De tool verwerkt alle bestanden met een Web Worker en de CPDF-engine.
4. De uitvoer wordt gedownload als `jsons-to-pdf.zip`, met één PDF per JSON-invoerbestand.

De conversie draait in een Web Worker op de achtergrond, dus de interface blijft soepel werken, ook met grote bestanden.

## Opties

Deze tool heeft geen instelbare opties. De JSON-structuur bepaalt volledig de uitvoer-PDF.

## Uitvoer

Bij het converteren van meerdere JSON-bestanden worden de resultaten als ZIP-archief geleverd. Elke PDF heeft de naam van het bijbehorende JSON-bronbestand (bijvoorbeeld `report.json` wordt `report.pdf`).

## Toepassingen

- PDF's herstellen uit een back-up of archiefketen op JSON-basis
- Een PDF via JSON laten gaan om te inspecteren en daarna weer naar PDF
- Documenten opnieuw opbouwen na programmatische wijzigingen in de JSON-structuur
- Controleren of een PDF naar JSON-export alle documentinhoud heeft vastgelegd door het terug om te zetten

## Tips

- Wil je willekeurige JSON-gegevens (zoals API-antwoorden of configuratiebestanden) omzetten naar een opgemaakte PDF, dan is de tool [Tekst naar PDF](./txt-to-pdf) een betere keuze. Plak de JSON als tekst en die wordt netjes opgemaakt weergegeven.
- De CPDF WebAssembly-engine moet beschikbaar zijn om deze tool te laten werken. Zelfgehoste instanties hebben de CPDF WASM-bestanden nodig.

## Gerelateerde tools

- [Tekst naar PDF](./txt-to-pdf)
- [Markdown naar PDF](./markdown-to-pdf)
- [CSV naar PDF](./csv-to-pdf)
