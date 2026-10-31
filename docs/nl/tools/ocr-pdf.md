---
title: PDF OCR
description: Maak gescande PDF's doorzoekbaar en kopieerbaar met Tesseract OCR, met ondersteuning voor meerdere talen en tekenfiltering.
---

# PDF OCR

Maak van gescande documenten doorzoekbare, kopieerbare PDF's. De tool gebruikt Tesseract OCR om tekst in afbeeldingen te herkennen en legt een onzichtbare tekstlaag over de oorspronkelijke pagina's, zodat het uiterlijk behouden blijft en de inhoud volledig doorzoekbaar wordt.

## Zo werkt het

1. Upload een gescande PDF of een PDF op afbeeldingsbasis.
2. Kies een of meer talen uit het document in de doorzoekbare talenlijst.
3. Pas optioneel de geavanceerde instellingen aan (resolutie, binarisatie, whitelist).
4. Klik op **OCR starten** en volg de voortgang in de realtime voortgangsbalk.
5. Bekijk na afloop de geëxtraheerde tekst en download de doorzoekbare PDF of een gewoon `.txt`-bestand.

## Functies

- OCR in meerdere talen met een doorzoekbare taalkiezer
- Onzichtbare tekstlaag behoudt het oorspronkelijke uiterlijk van het document
- Realtime voortgangsbalk en logweergave tijdens het verwerken
- Resultaten downloaden als doorzoekbare PDF of als tekstbestand
- Geëxtraheerde tekst direct naar het klembord kopiëren
- Drie resolutieniveaus om snelheid en nauwkeurigheid af te wegen

## Opties

| Instelling                        | Waarden                                                                                                 | Standaard | Doel                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| **Resolutie**                     | Standaard (192 DPI), Hoog (288 DPI), Ultra (384 DPI)                                                    | Hoog      | Hogere resolutie verbetert de nauwkeurigheid bij kleine tekst, maar duurt langer            |
| **Afbeelding binariseren**        | Aan / Uit                                                                                               | Uit       | Verbetert het contrast van nette scans door om te zetten naar zwart-wit                     |
| **Voorinstelling tekenwhitelist** | Geen, Alfanumeriek, Getallen + valuta, Alleen letters, Alleen getallen, Factuur, Formulieren, Aangepast | Geen      | Beperkt de herkende tekens om de nauwkeurigheid voor specifieke documenttypen te verbeteren |
| **Tekenwhitelist**                | Vrije tekst                                                                                             | Leeg      | Handmatige tekenset wanneer de voorinstelling op Aangepast staat                            |

## Toepassingen

- Gescande contracten en facturen doorzoekbaar maken zodat je er met Ctrl+F in kunt zoeken
- Tekst halen uit gefotografeerde documenten of oude papieren archieven
- Bonnetjes verwerken met de voorinstelling Factuur om bedragen en datums nauwkeurig vast te leggen
- Toegankelijke PDF's maken van scans die alleen uit afbeeldingen bestaan, voor naleving van eisen
- Tekstinhoud in bulk halen uit gescande boeken of handleidingen

## Tips

- Kies meerdere talen als je document gemengde talen bevat (bijvoorbeeld Engelse koppen met Japanse lopende tekst).
- Gebruik de binarisatie-optie voor documenten met vervaagde tekst of weinig contrast: dit kan de herkenning flink verbeteren.
- De whitelist-voorinstellingen Factuur en Formulieren verminderen valse herkenningen bij gestructureerde documenten sterk doordat irrelevante tekenvormen worden genegeerd.

## Gerelateerde tools

- [Tabellen extraheren](./extract-tables)
- [PDF samenvoegen](./merge-pdf)
- [PDF comprimeren](./compress-pdf)
