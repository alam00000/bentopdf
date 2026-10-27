---
title: PDF naar PDF/A
description: Zet standaard PDF's om naar PDF/A-formaat voor langdurige archivering. Ondersteunt de conformiteitsniveaus PDF/A-1b, PDF/A-2b en PDF/A-3b.
---

# PDF naar PDF/A

PDF/A is een door ISO gestandaardiseerde subset van PDF, bedoeld voor langdurige digitale bewaring. Deze tool zet je standaard PDF's om naar PDF/A-conforme documenten met Ghostscript dat rechtstreeks in je browser draait.

## Hoe het werkt

1. Upload een of meer PDF-bestanden.
2. Kies een **PDF/A-versie** in de keuzelijst.
3. Schakel optioneel **PDF vooraf platmaken** in voor complexe bestanden waarbij de normale conversie mislukt.
4. Klik op **Converteren naar PDF/A**. Meerdere bestanden geven een ZIP-archief.

## PDF/A-versies

| Versie       | Beperkingen                                  | Het best voor                                        |
| ------------ | -------------------------------------------- | ---------------------------------------------------- |
| **PDF/A-1b** | Strengst. Geen transparantie, geen lagen.    | Maximale compatibiliteit met oudere archiefsystemen  |
| **PDF/A-2b** | Staat transparantie en JPEG2000 toe.         | Archivering voor algemeen gebruik (aanbevolen)       |
| **PDF/A-3b** | Staat ingebedde bijlagen in elk formaat toe. | Documenten archiveren met bronbestanden met gegevens |

PDF/A-2b is standaard geselecteerd en voldoet voor de overgrote meerderheid van archiveringsbehoeften.

## Optie Vooraf platmaken

Sommige PDF's bevatten kenmerken die een zuivere PDF/A-conversie verhinderen: ongebruikelijke lettertypecoderingen, complexe transparantiestapels of beschadigde interne structuren. Als je **Vooraf platmaken** inschakelt, wordt de PDF vóór de conversie op 300 DPI gerasterd. Dat garandeert conformiteit, ten koste van tekst die niet meer selecteerbaar is. Gebruik het als terugvaloptie wanneer de standaardconversie fouten geeft.

Vooraf platmaken vereist de PyMuPDF WASM-engine.

## Toepassingen

- Voldoen aan archiveringseisen van overheden of de rechtspraak (in veel rechtsgebieden is PDF/A verplicht voor processtukken)
- Documenten indienen bij institutionele repositories of digitale bibliotheken
- Bedrijfsgegevens bewaren waarvan de oorspronkelijke software over tien jaar mogelijk niet meer bestaat
- Facturen voorbereiden voor e-facturatiestandaarden die PDF/A-3b met XML-bijlagen vereisen

## Tips

- Probeer de conversie eerst zonder vooraf platmaken. Schakel het alleen in als je een foutmelding krijgt.
- PDF/A sluit alle lettertypen in, dus uitvoerbestanden zijn vaak groter dan de originelen.
- Valideer de uitvoer in een speciale PDF/A-validator als strikte conformiteit vereist is voor je werkwijze.

## Gerelateerde tools

- [PDF comprimeren](./compress-pdf): verklein het bestand na de conversie
- [PDF platmaken](./flatten-pdf): maak formulieren plat voordat je naar PDF/A converteert
- [Metadata verwijderen](./remove-metadata): verwijder metadata vóór archivering
