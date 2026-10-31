---
title: XML naar PDF
description: Zet XML-bestanden in je browser om naar gestructureerde PDF-documenten. Gratis, privé, geen verwerking op een server.
---

# XML naar PDF

Zet XML-gegevensbestanden om naar leesbare, gestructureerde PDF-documenten. Ruwe XML is krachtig maar voor mensen lastig te lezen. Deze tool leest de XML-boom in, herkent terugkerende gegevensstructuren en toont ze als opgemaakte tabellen en secties in een liggende A4-PDF.

## Ondersteunde formaten

| Formaat | Extensie | Opmerkingen                  |
| :------ | :------- | :--------------------------- |
| XML     | `.xml`   | Elk goedgevormd XML-document |

## Hoe het werkt

1. Klik op het uploadgebied of sleep je XML-bestanden erheen. Meerdere bestanden kunnen in één reeks worden verwerkt.
2. Bekijk de bestandslijst. Verwijder ongewenste bestanden met het prullenbakpictogram, of klik op **Meer bestanden toevoegen** om er meer toe te voegen.
3. Klik op **Converteren naar PDF**. De tool leest de XML-structuur in met de ingebouwde DOMParser van de browser, analyseert de gegevenshiërarchie en zet die met jsPDF en auto-table-opmaak om naar een PDF.
4. Een enkel bestand wordt als PDF gedownload. Meerdere conversies worden gebundeld in `xml-to-pdf.zip`.

## Opties

Handmatige configuratie is niet nodig. De converter herkent de XML-structuur automatisch en kiest passende tabelindelingen. De uitvoer gebruikt een liggende A4-oriëntatie voor brede gegevenssets.

## Toepassingen

- XML-gegevensexports uit databases of API's omzetten naar afdrukbare rapporten
- Leesbare samenvattingen maken van XML-configuratiebestanden
- XML-facturen of transactielogboeken omzetten naar PDF's voor de administratie
- XML-sitemaps of RSS-feeds leesbaar maken in documentvorm

## Tips

- De XML moet goedgevormd zijn. Als de parser syntaxisfouten tegenkomt, mislukt de conversie met een duidelijke foutmelding die naar het probleem wijst.
- Diep geneste XML-structuren worden afgevlakt tot tabellen. De beste resultaten krijg je als de gegevens terugkerende elementen op hetzelfde niveau hebben met consistente onderliggende elementen.
- Tijdens de conversie verschijnen voortgangsmeldingen voor elke fase: lezen, inlezen, analyseren en renderen.

## Gerelateerde tools

- [FB2 naar PDF](./fb2-to-pdf)
- [XPS naar PDF](./xps-to-pdf)
- [E-mail naar PDF](./email-to-pdf)
