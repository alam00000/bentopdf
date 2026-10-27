---
title: PDF rechttrekken
description: Trek scheve pagina's in gescande PDF's automatisch recht met scheefstandsdetectie van OpenCV. Instelbare drempel en DPI.
---

# PDF rechttrekken

Gescande documenten liggen zelden perfect recht. Zelfs een lichte scheefstand maakt OCR minder nauwkeurig en afdrukken slordig. Deze tool gebruikt de beeldverwerkingsalgoritmen van OpenCV om de scheefstandshoek van elke pagina te detecteren en de pagina weer recht te draaien.

## Zo werkt het

1. Upload een of meer gescande PDF's.
2. Stel de **Scheefstandsdrempel** in: pagina's met een gedetecteerde scheefstand onder deze waarde blijven ongemoeid.
3. Kies een **Verwerkingskwaliteit (DPI)**: een hogere DPI verbetert de detectienauwkeurigheid, maar duurt langer.
4. Klik op **PDF rechttrekken**.
5. Na de verwerking toont een resultatenpaneel per pagina de gedetecteerde hoek en of die is gecorrigeerd.

## Opties

| Instelling              | Waarden                   | Standaard |
| ----------------------- | ------------------------- | --------- |
| **Scheefstandsdrempel** | 0,1, 0,5, 1,0, 2,0 graden | 0,5       |
| **Verwerkings-DPI**     | 100, 150, 200, 300        | 150       |

## Hoe scheefstandsdetectie werkt

De tool geeft elke pagina weer als afbeelding met de gekozen DPI en gebruikt vervolgens OpenCV om de dominante lijnhoeken in de inhoud te detecteren. Als de gedetecteerde scheefstand de drempel overschrijdt, wordt de pagina met de omgekeerde hoek gedraaid om hem recht te trekken. Pagina's onder de drempel worden ongewijzigd doorgegeven.

## Toepassingen

- Contracten of juridische documenten die in bulk zijn gescand opschonen
- Gescande bonnetjes of facturen voorbereiden op OCR-verwerking
- Pagina's van een flatbedscanner rechttrekken wanneer het papier telkens anders ligt
- De visuele kwaliteit van gedigitaliseerd archiefmateriaal verbeteren

## Tips

- Verlaag de drempel naar 0,1 graad als je pixelnauwkeurige uitlijning voor OCR nodig hebt.
- 150 DPI is snel en nauwkeurig voor de meeste documenten. Gebruik 300 DPI voor zeer kleine tekst of pagina's met fijne details.
- Rechttrekken werkt het best bij documenten met duidelijke horizontale tekstregels. Het kan moeite hebben met pagina's die vooral uit afbeeldingen of diagonale ontwerpelementen bestaan.

## Gerelateerde tools

- [PDF rasteriseren](./rasterize-pdf): zet de rechtgetrokken uitvoer om naar een vlakke PDF op basis van afbeeldingen
- [PDF comprimeren](./compress-pdf): verklein de bestandsgrootte na het rechttrekken
- [PDF repareren](./repair-pdf): herstel structurele problemen in gescande PDF's
