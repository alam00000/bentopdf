---
title: PDF repareren
description: Herstel gegevens uit corrupte of beschadigde PDF-bestanden met de reparatie-engine van QPDF. Ondersteunt batchverwerking.
---

# PDF repareren

Als een PDF niet opent, onleesbare inhoud toont of fouten veroorzaakt in je viewer, probeert deze tool de interne structuur opnieuw op te bouwen. Hij gebruikt de reparatie-engine van QPDF, die gegevens kan herstellen bij veel soorten corruptie: kapotte kruisverwijzingstabellen, afgekapte streams, ongeldige objectverwijzingen en meer.

## Hoe het werkt

1. Upload een of meer beschadigde PDF-bestanden.
2. Klik op **PDF repareren**.
3. Eén gerepareerd bestand wordt direct gedownload. Meerdere bestanden leveren een ZIP-archief op.

De tool voert elk bestand door QPDF met de vlag `--decrypt`, waardoor QPDF de volledige PDF-structuur leest en herschrijft en herstelbare problemen onderweg oplost.

## Functies

- Batchreparatie van meerdere PDF's in één bewerking
- Automatische detectie van herstelbare en onherstelbare bestanden
- Succes- en foutmelding per bestand bij verwerking van meerdere bestanden
- Gebruikt QPDF (WebAssembly), een beproefde bibliotheek voor PDF-transformaties

## Wat het kan oplossen

- Kapotte of ontbrekende kruisverwijzingstabellen
- Afgekapte bestandseinden door onvolledige downloads
- Ongeldige objectnummering en streamlengtes
- Kleine structurele inconsistenties door foutieve PDF-generatoren
- Versleutelingsartefacten van mislukte pogingen tot ontsleuteling

## Wat het niet kan oplossen

- Ernstig afgekapte bestanden waarin het grootste deel van de inhoud ontbreekt
- PDF's die zijn versleuteld met een wachtwoord dat je niet hebt
- Bestanden die eigenlijk geen PDF zijn (verkeerde bestandsextensie)
- Afbeeldingscorruptie in de PDF (de structuur wordt hersteld, maar pixelgegevens worden niet opnieuw gegenereerd)

## Toepassingen

- Een PDF herstellen na een mislukte e-maildownload
- Bestanden openen die door oudere of niet-standaard PDF-generatoren zijn gemaakt
- PDF's repareren die in de ene viewer werken maar in de andere niet
- Beschadigde archiefdocumenten voorbereiden voor langdurige opslag

## Tips

- Als de reparatie mislukt, probeer het bestand dan eerst in een browser te openen. Browsers hebben eigen herstellogica en kunnen genoeg inhoud weergeven om opnieuw op te slaan.
- Als een versleutelde PDF de reparatie niet doorstaat, probeer dan eerst PDF ontgrendelen en repareer daarna de ontgrendelde uitvoer.

## Gerelateerde tools

- [PDF comprimeren](./compress-pdf): maak de structuur van de gerepareerde PDF verder schoon
- [PDF lineariseren](./linearize-pdf): optimaliseer het gerepareerde bestand voor weblevering
- [PDF platmaken](./flatten-pdf): maak formulieren plat die mogelijk beschadigd zijn
