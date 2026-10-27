---
title: Bates-nummering
description: Pas Bates-nummers toe op een of meer PDF's met aanpasbare sjablonen, opvulling, lettertypen en positionering.
---

# Bates-nummering

Bates-nummering stempelt opeenvolgende identificatiecodes op elke pagina van je PDF's. Het is de standaardmethode om documenten te labelen in rechtszaken, audits en compliance-processen. Deze tool ondersteunt meerdere bestanden en aanpasbare sjablonen, en levert afzonderlijk genummerde PDF's of één ZIP-archief.

## Hoe het werkt

1. Upload een of meer PDF-bestanden. Je kunt meerdere bestanden tegelijk slepen.
2. Kies een stijlvoorinstelling of maak een eigen sjabloon.
3. Stel de positie, het lettertype, de grootte, de kleur en de startnummers in.
4. Klik op **Bates-nummers toepassen** om te verwerken.
5. Een enkel bestand wordt direct gedownload. Meerdere bestanden worden als ZIP-archief gedownload.

## Opties

- **Stijlvoorinstelling** -- Kies uit ingebouwde indelingen:
  - Exhibit + Case + Bates + Page (bijv. "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (zonder paginanummer)
  - Case + Bates
  - Alleen Bates-nummer (bijv. "000001")
  - Aangepast (schrijf je eigen sjabloon)
- **Stijl aanpassen** -- Een sjabloontekenreeks met plaatshouders: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Bates-opvulling** -- Aantal cijfers (3 tot 6) voor Bates-nummers met voorloopnullen. Alleen zichtbaar in de aangepaste modus.
- **Positie** -- Koptekst of voettekst, links, midden of rechts.
- **Bates begint bij** -- Het eerste Bates-nummer. Standaard 1. De nummering loopt door over bestanden heen.
- **Bestandsteller begint bij** -- Het startnummer voor de plaatshouder `[FILE]`.
- **Lettertype** -- Helvetica, Times New Roman of Courier.
- **Lettergrootte** -- Grootte van de gestempelde tekst.
- **Kleur** -- Kleurkiezer voor de tekst van het Bates-nummer.

## Functies

- Live voorbeeld dat toont hoe Bates-nummers over alle geüploade bestanden verschijnen
- Ondersteuning voor meerdere bestanden met doorlopende nummering over documenten heen
- Bestanden herordenen met slepen om de nummeringsvolgorde te bepalen
- Zes positieopties (koptekst/voettekst, links/midden/rechts)
- Adaptieve margeberekening die rekening houdt met verschillende paginaformaten
- ZIP-uitvoer voor reeksen met meerdere bestanden
- Sjabloonplaatshouders voor maximale flexibiliteit

## Toepassingen

- Discoverydocumenten voor een rechtszaak stempelen met opeenvolgende exhibitnummers
- Auditbewijspakketten nummeren die tientallen bestanden beslaan
- Regelgevende referentienummers toepassen op compliancedocumentatie
- Bijlagen bij octrooiaanvragen labelen met zaakspecifieke identificatiecodes

## Tips

- Sleep bestanden in de bestandslijst om ze te herordenen voordat je verwerkt. De Bates-nummering volgt deze volgorde.
- Gebruik de plaatshouder `[FILENAME]` om de originele bestandsnaam in de stempel op te nemen, zodat je pagina's makkelijker naar de brondocumenten kunt herleiden.
- Het voorbeeldvak wordt in realtime bijgewerkt terwijl je instellingen wijzigt, zodat je de indeling kunt controleren voordat je verwerkt.

## Gerelateerde tools

- [Paginanummers](./page-numbers)
- [Paginalabels toevoegen](./add-page-labels)
- [Koptekst en voettekst](./header-footer)
