---
title: Pagina's afwisselen en mixen
description: Voeg PDF's samen door pagina's van elk bestand afwisselend te mixen, met behoud van bladwijzers.
---

# Pagina's afwisselen en mixen

Meng pagina's van meerdere PDF-bestanden zodat ze elkaar afwisselen. Dit is de tool voor als een gewone samenvoeging bestanden gewoon achter elkaar zou plakken, maar je pagina 1 van bestand A wilt, dan pagina 1 van bestand B, dan pagina 2 van bestand A, enzovoort.

## Hoe het werkt

1. Upload minstens twee PDF-bestanden via de uploadzone.
2. De tool toont elk bestand met het aantal pagina's en de bestandsgrootte.
3. Sleep de grepen om te bepalen van welk bestand de pagina's als eerste komen in de afwisselende volgorde.
4. Klik op **Pagina's Mixen** om de gemengde uitvoer te maken.
5. Het resultaat wordt gedownload als `alternated-mixed.pdf`.

## Functies

- Wisselt pagina's af over een willekeurig aantal PDF's (minimaal twee)
- Bestanden herordenen met slepen om de afwisselingsvolgorde te bepalen
- Behoudt bladwijzers uit de brondocumenten
- Toont het aantal pagina's en de bestandsgrootte van elk geüpload bestand
- Verwerkt via een eigen web worker voor een responsieve interface

## Toepassingen

- Dubbelzijdige scans weer in elkaar zetten wanneer oneven en even pagina's apart zijn gescand
- Vragenbladen combineren met antwoordsleutels zodat elke vraag door het antwoord wordt gevolgd
- Tweetalige documenten pagina voor pagina samenvoegen (bijv. Engels op de ene kant, vertaling op de volgende)
- Voor- en achterkant van een enkelzijdige scanner afwisselend samenvoegen

## Tips

- Hebben je bron-PDF's een verschillend aantal pagina's, dan zijn de pagina's van het kortere document als eerste op en komen de resterende pagina's van het langere document aan het einde.
- De bestandsvolgorde is belangrijk -- het eerste bestand in de lijst levert de eerste pagina van de uitvoer. Sleep om te herschikken indien nodig.

## Gerelateerde tools

- [PDF samenvoegen](./merge-pdf)
- [Ordenen & Dupliceren](./organize-pdf)
- [PDF splitsen](./split-pdf)
