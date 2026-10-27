---
title: PDF rasteren
description: Zet PDF-pagina's om naar een afbeeldingsgebaseerde PDF. Voeg alle lagen samen, verwijder selecteerbare tekst en bepaal DPI en afbeeldingsformaat.
---

# PDF rasteren

Rasteren zet elke pagina van een PDF om in een afbeelding en voegt die afbeeldingen weer samen tot een PDF. Het resultaat ziet er identiek uit als het origineel, maar bevat geen selecteerbare tekst, geen interactieve elementen en geen bewerkbare lagen. Het is in feite een fotokopie van hoge kwaliteit.

## Hoe het werkt

1. Upload een of meer PDF-bestanden.
2. Stel de **DPI** (resolutie) in voor de gerasterde uitvoer.
3. Kies een **afbeeldingsformaat**: PNG voor verliesvrije kwaliteit of JPEG voor kleinere bestanden.
4. Vink optioneel **Converteren naar grijswaarden** aan.
5. Klik op **PDF rasteren**. Meerdere bestanden worden als ZIP gedownload.

## Opties

| Instelling             | Waarden                           | Standaard |
| ---------------------- | --------------------------------- | --------- |
| **DPI**                | 72, 150, 200, 300, 600            | 150       |
| **Afbeeldingsformaat** | PNG (verliesvrij), JPEG (kleiner) | PNG       |
| **Grijswaarden**       | Aan/Uit                           | Uit       |

## DPI-richtlijnen

- **72**: alleen voor weergave op het scherm, kleinste bestandsgrootte
- **150**: goede balans voor algemeen gebruik
- **200**: scherpere tekst, gemiddelde bestandsgrootte
- **300**: uitvoer van afdrukkwaliteit
- **600**: hoogwaardige archivering of professioneel afdrukken

## Toepassingen

- Tekstextractie voorkomen bij vertrouwelijke documenten voordat je ze deelt
- Problemen met ontbrekende lettertypen voorkomen door tekst om te zetten in pixels
- Een "platte" versie maken van een PDF met complexe lagen of transparantie die in verschillende viewers anders wordt weergegeven
- Een PDF voorbereiden voor een systeem dat alleen afbeeldingsinvoer accepteert
- Verborgen inhoud (zoals bijgehouden wijzigingen of formuliergegevens) verwijderen door de PDF tot pure afbeeldingen terug te brengen

## Tips

- 150 DPI met PNG is een solide standaard. Ga alleen hoger als je afdrukuitvoer nodig hebt of moet inzoomen op fijne details.
- JPEG levert merkbaar kleinere bestanden op, maar geeft compressieartefacten op scherpe tekstranden.
- Rasteren is onomkeerbaar: bewaar je originele PDF als je later bewerkbare tekst nodig kunt hebben.

## Gerelateerde tools

- [PDF comprimeren](./compress-pdf): verklein de bestandsgrootte van de gerasterde PDF
- [PDF rechttrekken](./deskew-pdf): trek pagina's recht voordat je gescande documenten rastert
- [Lettertype naar contouren](./font-to-outline): zet lettertypen om in vectorpaden als je schaalbaarheid wilt behouden
- [PDF platmaken](./flatten-pdf): maak formulieren plat zonder ze naar afbeeldingen om te zetten
