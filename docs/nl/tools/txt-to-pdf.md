---
title: Tekst naar PDF
description: Zet platte tekstbestanden of getypte tekst om naar PDF met aangepaste lettertypen, kleuren en paginaformaten.
---

# Tekst naar PDF

Zet platte tekst om in een opgemaakte PDF. Je kunt `.txt`-bestanden uploaden of direct typen in de ingebouwde teksteditor. De tool ondersteunt meerdere lettertypen, aangepaste tekstkleuren en een breed scala aan paginaformaten: van A0 tot A10, plus US Letter, Legal en Tabloid.

## Ondersteunde formaten

| Invoer                | Extensies                |
| :-------------------- | :----------------------- |
| Platte tekstbestanden | `.txt`                   |
| Directe tekstinvoer   | Typ of plak in de editor |

## Hoe het werkt

1. Kies je invoermodus met de schakelaar bovenaan: **Bestanden uploaden** of **Tekst typen**.
2. Bij uploaden sleep je een of meer `.txt`-bestanden erheen of klik je om ze te selecteren. Bij typen voer je je tekst direct in het tekstvak in.
3. Configureer de opmaakopties: lettertype, lettergrootte, tekstkleur en paginaformaat.
4. Klik op **PDF maken**. De uitvoer wordt gedownload als `text_to_pdf.pdf`.

Bij het uploaden van meerdere bestanden worden de inhouden aaneengevoegd met lege regels ertussen.

## Opties

| Optie             | Waarden                                                                               | Standaard       |
| :---------------- | :------------------------------------------------------------------------------------ | :-------------- |
| **Lettertype**    | Helvetica (schreefloos), Tiro (met schreef), Courier (monospace), Times (met schreef) | Helvetica       |
| **Lettergrootte** | 6 -- 72 pt                                                                            | 12              |
| **Tekstkleur**    | Elke kleur via kleurkiezer                                                            | Zwart (#000000) |
| **Paginaformaat** | ISO A0--A10, B0--B10, C0--C10, US Letter, Legal, Tabloid, Ledger, 11x17               | A4              |

RTL-talen (Arabisch, Hebreeuws, Perzisch, Urdu) worden automatisch herkend. Als RTL-tekst wordt gevonden, schakelen de tekstrichting en uitlijning dienovereenkomstig om.

## Toepassingen

- Codefragmenten of logbestanden omzetten in een afdrukbare PDF met het lettertype Courier
- Snel een PDF maken van ter plekke getypte vergadernotities
- Een manuscript in platte tekst opmaken met een specifiek lettertype en paginaformaat voor inzending
- Een PDF-versie maken van een README of changelog voor offline distributie

## Tips

- Gebruik de modus **Tekst typen** als je snel klembordinhoud wilt converteren zonder het eerst als bestand op te slaan.
- Courier (monospace) is de beste keuze voor code, logs of elke inhoud waarbij uitlijning van kolommen telt.
- De paginamarges zijn vast ingesteld op 72 punten (1 inch) aan alle kanten.

## Gerelateerde tools

- [Markdown naar PDF](./markdown-to-pdf)
- [CSV naar PDF](./csv-to-pdf)
- [Word naar PDF](./word-to-pdf)
