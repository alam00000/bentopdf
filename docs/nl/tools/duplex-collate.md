---
title: Dubbelzijdige scan sorteren
description: Herorden dubbelzijdige scan-PDF's met voorzijden en achterzijden in aparte blokken naar de juiste volgorde van voor- en achterzijde.
---

# Dubbelzijdige scan sorteren

Dubbelzijdige scan sorteren is bedoeld voor ADF-scanworkflows waarbij één PDF twee blokken pagina's bevat:

- eerst alle voorzijden
- daarna alle achterzijden

In plaats van handmatig splitsen en opnieuw samenstellen voegt deze tool de twee blokken samen in de natuurlijke leesvolgorde: voorzijde1, achterzijde1, voorzijde2, achterzijde2, enzovoort.

## Zo werkt het

1. Upload één PDF die is gemaakt met het scannen van een dubbelzijdige stapel.
2. Stel het splitspunt in waar het blok met voorzijden eindigt.
3. Kies hoe het blok met achterzijden wordt verwerkt:
   - **Achterzijdeblok omkeren** (gebruikelijk als de stapel wordt omgedraaid voordat de achterzijden worden gescand)
   - **Achterzijdeblok behouden zoals het is**
4. Klik op **PDF sorteren** om het opnieuw geordende resultaat te downloaden.

## Opties

- **Splitsing automatisch detecteren (helft)**: stelt het splitspunt in op `ceil(totalPages / 2)`.
- **Waarschuwing oneven pagina's**: waarschuwt als het totale aantal pagina's oneven is (vaak een scanfout).
- **Bevestiging ongelijke blokken**: vraagt om bevestiging als de blokken met voor- en achterzijden verschillen in grootte.
- **Gegroepeerde export**: splitst de gesorteerde uitvoer in aparte PDF's op basis van het oorspronkelijke aantal pagina's per document en downloadt ze als ZIP.

## Uitvoergedrag

- **Standaard**: één uitvoer-PDF (één invoer-PDF in, één uitvoer-PDF uit).
- **Gegroepeerde modus**: de uitvoer wordt verdeeld op basis van je waarde voor pagina's per document; als er meerdere delen ontstaan, worden ze als één ZIP gedownload, anders wordt één PDF gedownload.

Als de blokken ongelijk van grootte zijn, worden eerst de gepaarde pagina's gesorteerd en worden de overgebleven ongepaarde pagina's achteraan toegevoegd.

## Veelvoorkomende toepassingen

- De volgorde herstellen na het scannen van een stapel dubbelzijdige formulieren in twee rondes.
- Pakketten met voor- en achterzijden opnieuw opbouwen van kantoorscanners die eerst alle voorzijden en dan alle achterzijden uitvoeren.
- Archiefscans nabewerken voordat ze in bestanden per document worden gesplitst.

## Tips

- De meeste dubbelzijdige reeksen moeten een even totaal aantal pagina's hebben.
- Als de achterzijden omgekeerd lijken, wissel dan tussen **Achterzijdeblok omkeren** en **Achterzijdeblok behouden zoals het is**.
- Gebruik voor originelen van 2 pagina's (voor- en achterzijde) gegroepeerde export met `2` pagina's per document.

## Gerelateerde tools

- [Pagina's afwisselen en mixen](./alternate-merge)
- [PDF splitsen](./split-pdf)
- [PDF samenvoegen](./merge-pdf)
- [Ordenen en dupliceren](./organize-pdf)
