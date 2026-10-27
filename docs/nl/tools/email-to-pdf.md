---
title: E-mail naar PDF
description: Zet EML- en MSG-e-mailbestanden in je browser om naar PDF. Behoudt headers, berichttekst en de lijst met bijlagen.
---

# E-mail naar PDF

Zet opgeslagen e-mailbestanden om naar nette, afdrukbare PDF's. De tool verwerkt EML- en MSG-bestanden, haalt het volledige bericht eruit (headers, berichttekst en metadata van bijlagen) en geeft alles weer in een gestructureerde PDF. Handig voor juridisch onderzoek, archivering of gewoon om een belangrijke e-mail af te drukken.

## Ondersteunde formaten

| Formaat | Extensie | Opmerkingen                                                                 |
| :------ | :------- | :-------------------------------------------------------------------------- |
| EML     | `.eml`   | Standaard MIME-e-mailformaat (geëxporteerd uit de meeste e-mailprogramma's) |
| MSG     | `.msg`   | Eigen formaat van Microsoft Outlook                                         |

## Zo werkt het

1. Klik op het uploadvak of sleep je EML- of MSG-bestanden erheen. Je kunt beide formaten in één reeks combineren.
2. Bekijk de bestandslijst. Verwijder ongewenste items met het prullenbakpictogram, of klik op **Meer bestanden toevoegen** om meer e-mails toe te voegen.
3. Stel de conversieopties in (zie hieronder).
4. Klik op **Converteren naar PDF**. De tool verwerkt elke e-mail, geeft de inhoud weer als opgemaakte HTML en zet die via de PyMuPDF-engine om naar PDF.
5. Eén e-mail wordt direct als PDF gedownload. Meerdere e-mails worden verpakt in `emails-converted.zip`.

## Opties

| Optie                          | Standaard | Beschrijving                                                                                                           |
| :----------------------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Paginaformaat**              | A4        | Kies tussen de paginaformaten A4, Letter of Legal.                                                                     |
| **CC en BCC opnemen**          | Aan       | Als dit is ingeschakeld, verschijnen de ontvangerslijsten voor CC en BCC in het headergedeelte van de PDF.             |
| **Lijst met bijlagen opnemen** | Aan       | Als dit is ingeschakeld, verschijnt een lijst met de bijlagen van de e-mail (met bestandsnamen en groottes) in de PDF. |

## Toepassingen

- Belangrijke zakelijke correspondentie als PDF archiveren voor compliance of controle
- E-mailconversaties afdrukken voor rechtszaken of verzoeken om gegevensverstrekking
- Een blijvend overzicht maken van orderbevestigingen, bonnen of contracten die per e-mail zijn ontvangen
- Outlook MSG-bestanden back-uppen in een formaat waarvoor Outlook niet nodig is
- Klantenservicegesprekken documenteren aan de hand van geëxporteerde EML-bestanden

## Tips

- Zowel EML (gebruikt door Thunderbird, Apple Mail en de meeste e-mailprogramma's) als Outlook MSG-bestanden worden ondersteund. Exporteer e-mails uit je e-mailprogramma en zet ze direct in de tool.
- E-mails met HTML-opmaak behouden hun stijl in de PDF. E-mails met platte tekst worden netjes en leesbaar weergegeven.
- De lijst met bijlagen toont bestandsnamen en groottes, maar sluit de bijlagen zelf niet in de PDF in.

## Gerelateerde tools

- [XML naar PDF](./xml-to-pdf)
- [XPS naar PDF](./xps-to-pdf)
