---
title: Lettertype naar contouren
description: Zet alle PDF-lettertypen om naar vectorcontouren voor consistente weergave op alle apparaten. Voorkomt problemen met ontbrekende lettertypen.
---

# Lettertype naar contouren

Lettertypen naar contouren omzetten verandert elk teken van een lettertypeglyph in een vectorpad. De PDF is dan niet meer afhankelijk van geïnstalleerde lettertypen en wordt op elk apparaat, elk besturingssysteem en elke printer identiek weergegeven. Dit is een standaardstap in prepress-workflows.

## Zo werkt het

1. Upload een of meer PDF-bestanden.
2. Klik op **Converteren naar contouren**.
3. Ghostscript zet alle tekst om naar vectorpaden.
4. Download het resultaat. Meerdere bestanden leveren een ZIP-archief op.

Er zijn geen instellingen. De tool gebruikt Ghostscript (WebAssembly) om alle lettertypeverwijzingen in één keer om te zetten naar contourpaden.

## Wat er verandert

- Tekens worden vectorkrommen (bezierpaden)
- Het insluiten van lettertypen is niet meer nodig: de PDF is op glyphniveau zelfvoorzienend
- De bestandsgrootte kan toenemen, omdat vectorpaden meestal groter zijn dan lettertypeverwijzingen
- Het uiterlijk blijft exact behouden

## Wat je kwijtraakt

- Tekst selecteren en kopiëren en plakken
- Doorzoekbaarheid van tekst (Ctrl+F werkt niet meer)
- De mogelijkheid om tekstinhoud te bewerken
- Toegankelijkheid voor schermlezers

## Toepassingen

- PDF's sturen naar een drukkerij die lettertypen als contouren vereist
- Documenten delen die aangepaste of gelicentieerde lettertypen gebruiken met mensen die die lettertypen niet hebben
- Lettertypevervanging voorkomen die het uiterlijk van je document op andere systemen verandert
- PDF's voorbereiden voor lasergraveer- of CNC-workflows die vectorinvoer vereisen
- Zorgen dat een PDF met veel logo's op alle platforms goed wordt weergegeven

## Tips

- Bewaar je originele PDF. Omzetten naar contouren is onomkeerbaar: je kunt paden niet terugzetten naar bewerkbare tekst.
- Moet de tekst doorzoekbaar blijven, gebruik dan liever de tool PDF rasteriseren met OCR als vervolgstap.
- PDF's met contouren zijn meestal groter. Voer daarna PDF comprimeren uit als de bestandsgrootte belangrijk is.

## Gerelateerde tools

- [PDF platmaken](./flatten-pdf): maak formulieren en aantekeningen plat zonder lettertypen aan te raken
- [PDF rasteriseren](./rasterize-pdf): omzetten naar een PDF op afbeeldingsbasis in plaats van vectorcontouren
- [PDF comprimeren](./compress-pdf): verklein het bestand na het omzetten naar contouren
- [PDF naar PDF/A](./pdf-to-pdfa): converteer voor archivering nadat de lettertypeonafhankelijkheid is gewaarborgd
