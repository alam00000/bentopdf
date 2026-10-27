---
title: PDF naar grijswaarden
description: Zet een kleuren-PDF om naar een versie in grijswaarden (zwart-wit). Maakt een nieuwe PDF waarin alle kleur van elke pagina is verwijderd.
---

# PDF naar grijswaarden

Zet een kleuren-PDF om naar een versie in grijswaarden. Elke pagina wordt weergegeven, ontdaan van kleurverzadiging en als JPEG-afbeelding opnieuw ingebed in een nieuwe PDF. De uitvoer behoudt de oorspronkelijke paginaafmetingen.

## Hoe het werkt

1. Upload een PDF door op het neerzetgebied te klikken of een bestand erheen te slepen.
2. Klik op **Converteren** om het bestand te verwerken.
3. Een nieuwe `greyscale.pdf` wordt gedownload met alle pagina's omgezet naar zwart-wit.

Achter de schermen wordt elke pagina op schaal 2x weergegeven, gaan de pixelgegevens door een grijswaardenfilter en worden ze opnieuw gecodeerd als JPEG met 90% kwaliteit en in een nieuw PDF-document geplaatst.

## Opties

Deze tool heeft geen instelbare opties. De omzetting naar grijswaarden gebruikt een standaard luminantieformule en de JPEG-kwaliteit staat vast op 90%.

## Uitvoerformaat

- Eén `greyscale.pdf`-bestand met alle pagina's als JPEG-afbeeldingen in grijswaarden.

## Toepassingen

- Documenten voorbereiden voor zwart-wit afdrukken om kleurinkt te besparen.
- Voldoen aan indieningsvereisten voor juridische of overheidsdocumenten waarvoor grijswaarden verplicht zijn.
- De bestandsgrootte verkleinen van PDF's met veel kleur (JPEG-afbeeldingen in grijswaarden zijn kleiner dan kleurenafbeeldingen).
- Een consistente visuele stijl creëren voor documenten met gemengde kleuren- en zwart-witpagina's.

## Tips

- Omdat elke pagina wordt gerasterd en als JPEG opnieuw wordt ingebed, is de uitvoer afbeeldingsgebaseerd. Tekst uit de oorspronkelijke PDF is dan niet meer selecteerbaar of doorzoekbaar. Als je daarna doorzoekbare tekst nodig hebt, haal de uitvoer dan door de OCR-tool.
- Voor meer controle over kleuraanpassingen (helderheid, contrast, verzadiging) kun je de tool Kleuren aanpassen of het Grijswaarden-knooppunt in de [PDF-workflowbouwer](./pdf-workflow) bekijken.

## Gerelateerde tools

- [PDF naar JPG](./pdf-to-jpg)
- [PDF naar PNG](./pdf-to-png)
- [PDF-workflowbouwer](./pdf-workflow)
