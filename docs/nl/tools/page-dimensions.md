---
title: Paginaafmetingen
description: Analyseer paginaformaten, oriëntaties, beeldverhoudingen en rotatie van PDF's. Herken documenten met gemengde formaten en exporteer de gegevens naar CSV.
---

# Paginaafmetingen

Een diagnosetool die elke pagina van je PDF leest en de exacte afmetingen, oriëntatie, standaardformaatnaam, beeldverhouding, oppervlakte en rotatie weergeeft. Handig om pagina's met gemengde formaten op te sporen vóór het afdrukken, of om de eigenschappen van een ontvangen PDF vast te leggen.

## Hoe het werkt

1. Upload een PDF-bestand. De analyse start automatisch, er hoeft geen knop te worden ingedrukt.
2. Een overzichtspaneel toont het totaal aantal pagina's, het aantal unieke paginaformaten en of het document gemengde formaten bevat.
3. Bekijk de volledige resultatentabel met details per pagina.
4. Schakel de weergave-eenheden om tussen punten, inches, millimeters of pixels.
5. Klik op **Exporteren naar CSV** om de gegevens op te slaan.

## Gerapporteerde velden

| Kolom            | Beschrijving                                            |
| ---------------- | ------------------------------------------------------- |
| Pagina #         | Opeenvolgend paginanummer                               |
| Afmetingen       | Breedte x hoogte in de gekozen eenheid                  |
| Standaardformaat | Gevonden naam (A4, Letter, enz.) of "Aangepast"         |
| Oriëntatie       | Staand of liggend                                       |
| Beeldverhouding  | Verhouding tussen breedte en hoogte als decimaal        |
| Oppervlakte      | Paginaoppervlakte in de gekozen eenheid in het kwadraat |
| Rotatie          | Paginarotatie in graden                                 |

## Functies

- Automatische herkenning van standaard papierformaten (A3, A4, A5, Letter, Legal, Tabloid en meer)
- Waarschuwing bij documenten met gemengde formaten, met een overzicht van welke formaten voorkomen en hoeveel pagina's elk gebruikt
- Eenheden omrekenen tussen punten, inches, millimeters en pixels (bij 96 PPI)
- CSV-export voor gebruik in spreadsheets of documentatiesystemen

## Toepassingen

- Controleren of alle pagina's A4 zijn voordat je een document naar een drukkerij stuurt
- Uitzoeken waarom een samengevoegde PDF op bepaalde pagina's met onverwachte marges wordt afgedrukt
- De paginaindeling van een groot PDF-archief vastleggen voor metadata
- Geroteerde pagina's opsporen die gecorrigeerd moeten worden

## Tips

- Als het overzicht "Gemengde formaten" toont, gebruik dan de tool Paginagrootte Fiksen om te standaardiseren voordat je afdrukt.
- Het rotatieveld helpt pagina's te herkennen die correct worden weergegeven maar een rotatiekenmerk hebben dat niet nul is, wat in sommige werkwijzen problemen kan geven.

## Gerelateerde tools

- [Paginagrootte corrigeren](./fix-page-size): pagina's standaardiseren na het opsporen van gemengde formaten
- [PDF comprimeren](./compress-pdf): de PDF optimaliseren nadat paginaproblemen zijn opgelost
- [PDF roteren](./rotate-pdf): geroteerde pagina's corrigeren
