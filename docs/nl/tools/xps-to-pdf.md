---
title: XPS naar PDF
description: Zet XPS- en OXPS-documenten in je browser om naar PDF. Geen upload, geen aanmelding, volledig privé.
---

# XPS naar PDF

Zet Microsoft XPS- en OXPS-documenten om naar standaard PDF-bestanden. XPS (XML Paper Specification) was het antwoord van Microsoft op PDF, maar de ondersteuning ervan is op steeds meer platforms verdwenen. Deze tool maakt die documenten weer voor iedereen leesbaar.

## Ondersteunde formaten

| Formaat | Extensie | Opmerkingen                                        |
| :------ | :------- | :------------------------------------------------- |
| XPS     | `.xps`   | Oorspronkelijk Microsoft XPS-formaat               |
| OXPS    | `.oxps`  | Open XPS, de variant volgens de ECMA-388-standaard |

## Hoe het werkt

1. Klik op het uploadgebied of sleep je XPS-/OXPS-bestanden erheen. Je kunt meerdere bestanden tegelijk selecteren.
2. Bekijk de bestandslijst. Verwijder losse bestanden met het prullenbakpictogram, of klik op **Meer bestanden toevoegen** om extra documenten toe te voegen.
3. Klik op **Converteren naar PDF**. De PyMuPDF-engine verwerkt elk document lokaal in je browser.
4. Een enkel bestand wordt direct als PDF gedownload. Meerdere bestanden worden gebundeld in een ZIP-archief met de naam `xps-converted.zip`.

## Opties

Deze tool voert een directe formaatconversie uit zonder extra configuratie. De uitvoer behoudt de oorspronkelijke paginaafmetingen, vectorafbeeldingen, lettertypen en afbeeldingen uit de XPS-bron.

## Toepassingen

- XPS-bestanden openen die je van oudere Windows-systemen hebt gekregen waar het XPS-printerstuurprogramma de standaard was
- OXPS-documenten uit Windows 10/11 omzetten om te delen met macOS- of Linux-gebruikers
- Oude XPS-bestanden archiveren in een breder ondersteund formaat
- XPS-documenten van overheden of bedrijven toegankelijk maken voor externe ontvangers

## Tips

- Zowel `.xps`- als `.oxps`-extensies worden automatisch herkend, dus je kunt ze in dezelfde reeks combineren.
- Is het oorspronkelijke XPS-bestand gemaakt met een printerstuurprogramma met hoge resolutie, dan behoudt de resulterende PDF die kwaliteit. Er vindt geen herbemonstering plaats.

## Gerelateerde tools

- [Word naar PDF](./word-to-pdf)
- [XML naar PDF](./xml-to-pdf)
