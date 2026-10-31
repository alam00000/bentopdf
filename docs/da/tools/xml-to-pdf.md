---
title: XML til PDF
description: Konvertér XML-filer til strukturerede PDF-dokumenter i din browser. Gratis, privat, ingen serverbehandling.
---

# XML til PDF

Konvertér XML-datafiler til læsbare, strukturerede PDF-dokumenter. Rå XML er kraftfuldt, men svært at læse for mennesker. Dette værktøj parser XML-træet, genkender gentagne datastrukturer og gengiver dem som formaterede tabeller og sektioner i en A4-PDF i liggende format.

## Understøttede formater

| Format | Filtypenavn | Noter                          |
| :----- | :---------- | :----------------------------- |
| XML    | `.xml`      | Ethvert velformet XML-dokument |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine XML-filer. Flere filer kan behandles i en enkelt batch.
2. Gennemgå fillisten. Fjern uønskede filer med papirkurvsikonet, eller klik på **Tilføj flere filer** for at tilføje flere.
3. Klik på **Konverter til PDF**. Værktøjet parser XML-strukturen med browserens indbyggede DOMParser, analyserer datahierarkiet og gengiver det til en PDF med jsPDF og auto-table-formatering.
4. En enkelt fil downloades som PDF. Flere konverteringer pakkes i `xml-to-pdf.zip`.

## Indstillinger

Ingen manuel konfiguration er nødvendig. Konverteren registrerer automatisk XML-strukturen og vælger passende tabellayouts. Resultatet bruger A4 i liggende format for at give plads til brede datasæt.

## Anvendelsesområder

- Omdannelse af XML-dataeksporter fra databaser eller API'er til udskrivbare rapporter
- Oprettelse af læsbare oversigter ud fra XML-konfigurationsfiler
- Konvertering af XML-baserede fakturaer eller transaktionslogge til PDF til arkivering
- Gør XML-sitemaps eller RSS-feeds læsbare i dokumentform

## Tips

- XML skal være velformet. Hvis parseren støder på syntaksfejl, mislykkes konverteringen med en beskrivende fejlmeddelelse, der peger på problemet.
- Dybt indlejrede XML-strukturer flades ud til tabeller. For bedste resultat bør dataene have gentagne søskendeelementer med ensartede underelementer.
- Statusopdateringer vises under konverteringen og viser hver fase: læsning, parsing, analyse og gengivelse.

## Relaterede værktøjer

- [FB2 til PDF](./fb2-to-pdf)
- [XPS til PDF](./xps-to-pdf)
- [E-mail til PDF](./email-to-pdf)
