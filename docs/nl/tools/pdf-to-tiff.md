---
title: PDF naar TIFF
description: Zet PDF-pagina's om naar TIFF-afbeeldingen, veel gebruikt in drukwerk-, fax- en archiefprocessen. Valt terug op PNG als het coderen mislukt.
---

# PDF naar TIFF

Zet elke pagina van een PDF om in een TIFF-afbeelding. TIFF is het standaardformaat voor drukwerkproductie, faxsystemen en documentarchivering. De tool gebruikt PackBits-compressie voor TIFF-codering en valt terug op PNG als het coderen van een pagina mislukt.

## Hoe het werkt

1. Upload een PDF door op het neerzetgebied te klikken of een bestand erheen te slepen.
2. Klik op **Converteren** om het bestand te verwerken.
3. Een enkel TIFF-bestand of een ZIP-archief wordt automatisch gedownload.

## Opties

Deze tool heeft geen instelbare opties. Pagina's worden met een vaste schaal van 2x weergegeven.

## Uitvoerformaat

- **Eén pagina**: `filename.tiff`
- **Meerdere pagina's**: `filename_tiffs.zip` met `page_1.tiff`, `page_2.tiff`, enz.

Als het TIFF-coderen van een bepaalde pagina mislukt (door compressieproblemen), wordt die pagina in plaats daarvan als `.png`-bestand opgeslagen. De ZIP bevat dan een mix van TIFF- en PNG-bestanden.

## Toepassingen

- Documenten indienen bij overheidsinstanties of juridische systemen die het TIFF-formaat vereisen.
- Pagina's voorbereiden voor faxverzending via digitale faxdiensten.
- Gescande documenten archiveren in een breed ondersteund verliesvrij formaat.
- Pagina's aanleveren aan documentbeheersystemen voor bedrijven.

## Tips

- TIFF-bestanden zijn groot. Als je alleen verliesvrije kwaliteit nodig hebt voor web of scherm, is [PDF naar PNG](./pdf-to-png) een betere keuze.
- Controleer de inhoud van de ZIP als sommige pagina's de PNG-terugval nodig hadden: misschien wil je die apart converteren.

## Gerelateerde tools

- [PDF naar PNG](./pdf-to-png)
- [PDF naar BMP](./pdf-to-bmp)
- [PDF naar JPG](./pdf-to-jpg)
